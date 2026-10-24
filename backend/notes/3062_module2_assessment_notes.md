# Test Design Notes - Module 2: Adaptive Assessment Engine

**Member:** 3062  
**Project:** IntellectA backend (Python, pytest)  
**File under test:** `assessment/adaptive_engine.py` (class `AdaptiveAssessmentEngine`)  
**Techniques:** ECP, BVA, EG (Error Guessing), SM (State Machine testing)

Constants: `MIN_DIFFICULTY=1.0`, `MAX_DIFFICULTY=5.0`, `DEFAULT_DIFFICULTY=2.5`, `FAST_RESPONSE_MS=5000`, `SLOW_RESPONSE_MS=30000`.

Rules taken from the source:
- accuracy delta: `is_correct and score >= 0.7` gives `+0.2 + (score - 0.7) * 0.5`; otherwise `score >= 0.4` gives `-0.1`; otherwise `-0.5`
- latency delta (only when `is_correct`): below 5000 ms gives `+0.2`; above 30000 ms gives `-0.1`; otherwise `0`
- the result is clamped to `[1.0, 5.0]` and rounded to 2 decimals

Test ID format: `3062-ASSESS-<FUNCTION>-<NN>`. Floating-point results are compared with `pytest.approx`.

---

## 1. `compute_next_difficulty(current, is_correct, score, response_latency_ms)`

Score partitions (ECP): `[0, 0.4)`, `[0.4, 0.7)`, `[0.7, 1.0]`. This member's cases focus on the **score boundaries**. Unless stated, `current = 2.5` and `latency = 10000` (normal, no latency change).

| ID | Technique | is_correct | score | Expected next |
|----|-----------|-----------|-------|---------------|
| 3062-ASSESS-NEXT-01 | BVA | False | 0.0 | 2.0 |
| 3062-ASSESS-NEXT-02 | BVA | False | 0.39 | 2.0 |
| 3062-ASSESS-NEXT-03 | BVA | False | 0.4 | 2.4 |
| 3062-ASSESS-NEXT-04 | BVA | True | 0.69 | 2.4 |
| 3062-ASSESS-NEXT-05 | BVA | True | 0.7 | 2.7 |
| 3062-ASSESS-NEXT-06 | BVA | True | 1.0 | 2.85 |
| 3062-ASSESS-NEXT-07 | ECP | False | 0.7 | 2.4 (incorrect with a high score counts as partial) |
| 3062-ASSESS-NEXT-08 | BVA (current) | False, `current=1.0` | 0.0 | 1.0 (clamped at the minimum) |
| 3062-ASSESS-NEXT-09 | BVA (current) | True, `current=5.0`, latency 1000 | 1.0 | 5.0 (clamped at the maximum) |
| 3062-ASSESS-NEXT-10 | EG | False | `float("nan")` | 2.0 (NaN fails both comparisons, so the `-0.5` branch runs) |

## 2. `get_difficulty(user_id, concept_slug)` (async)

| ID | Technique | Setup | Expected result |
|----|-----------|-------|-----------------|
| 3062-ASSESS-GET-01 | ECP | no repository, nothing recorded | `2.5` |
| 3062-ASSESS-GET-02 | ECP | fake repository returns `3.7` | `3.7` |
| 3062-ASSESS-GET-03 | ECP | fake repository returns `None`, nothing cached | `2.5` |
| 3062-ASSESS-GET-04 | ECP | no repository, after one `record_attempt` | the new cached difficulty |
| 3062-ASSESS-GET-05 | BVA | fake repository returns `0.0` (falsy but not `None`) | `0.0` (stored value is trusted, not clamped) |

## 3. `record_attempt(...)` (async)

| ID | Technique | Setup | Expected result |
|----|-----------|-------|-----------------|
| 3062-ASSESS-REC-01 | ECP | no repository | returns a `DifficultyAdjustment`, no error |
| 3062-ASSESS-REC-02 | ECP | check the result fields | `previous == difficulty`, `next` correct, `delta == round(next - previous, 2)` |
| 3062-ASSESS-REC-03 | ECP | with fake repository | `set_concept_difficulty` called once with the new value |
| 3062-ASSESS-REC-04 | ECP | with fake repository | `insert_quiz_result` called once with 7 keys: `user_id`, `concept_slug`, `difficulty`, `score`, `is_correct`, `response_latency_ms`, `next_difficulty` |
| 3062-ASSESS-REC-05 | BVA | `difficulty=5.0`, correct, score 1.0, fast | `next == 5.0` and `delta == 0.0` |

---

## 4. Module-level tests: climbing the difficulty scale (State Machine)

States are difficulty levels: LOW (1.0), MID (anything between), HIGH (5.0). One perfect and fast answer adds `0.55` (`0.35 + 0.2`).

```
2.5 --perfect fast--> 3.05 --> 3.6 --> 4.15 --> 4.7 --> 5.0 (HIGH, stays 5.0)
5.0 --one failure (-0.5)--> 4.5 (MID)
```

| ID | Technique | Scenario | Expected result |
|----|-----------|----------|-----------------|
| 3062-ASSESS-MOD-01 | SM | start at the default 2.5, five perfect fast attempts in a row (each result fed into the next) | `3.05, 3.6, 4.15, 4.7, 5.0` |
| 3062-ASSESS-MOD-02 | SM | sixth perfect fast attempt after reaching 5.0 | stays `5.0` (upper limit holds) |
| 3062-ASSESS-MOD-03 | SM | HIGH -> MID: from `5.0`, one incorrect answer with score 0.0 | `4.5` |
| 3062-ASSESS-MOD-04 | ECP | two separate engine instances | a new engine starts from the default 2.5 and does not share the first engine's cache |
| 3062-ASSESS-MOD-05 | Integration | `record_attempt(...).next` against `compute_next_difficulty(...)` for identical inputs | both values are equal |
