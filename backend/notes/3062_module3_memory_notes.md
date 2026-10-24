# Test Design Notes - Module 3: Short-term Session Memory

**Member:** 3062  
**Project:** IntellectA backend (Python, pytest, pytest-asyncio)  
**File under test:** `memory/short_term.py` (class `ShortTermMemory`)  
**Techniques:** ECP, BVA, EG (Error Guessing), SM (State Machine testing)

Behaviour taken from the source: Redis keys are `session:{id}`, `session:{id}:messages` and `session:{id}:quiz`. The TTL comes from `session_ttl_seconds` (default 86400). The Redis client is replaced by an `AsyncMock` (to check the exact calls) or by a small in-memory `FakeRedis` class (for state machine tests).

Test ID format: `3062-MEM-<FUNCTION>-<NN>`

---

## 1. `append_message(session_id, role, content)`

| ID | Technique | Input | Expected result |
|----|-----------|-------|-----------------|
| 3062-MEM-APPEND-01 | ECP (valid) | `("s1", "user", "hi")` | `rpush("session:s1:messages", '{"role": "user", "content": "hi"}')` |
| 3062-MEM-APPEND-02 | ECP (valid) | same call | `expire("session:s1:messages", 86400)` called once |
| 3062-MEM-APPEND-03 | BVA (content) | `content=""` | still pushed, JSON has empty content |
| 3062-MEM-APPEND-04 | ECP (unicode) | content with Urdu text and an emoji | stored JSON decodes to the same text |
| 3062-MEM-APPEND-05 | EG | `rpush` raises `ConnectionError` | exception propagates; `expire` is not called |
| 3062-MEM-APPEND-06 | ECP (special chars) | content with quotes and a newline | stored payload is valid JSON and decodes unchanged |

## 2. `get_messages(session_id, limit=20)`

| ID | Technique | Input | Expected result |
|----|-----------|-------|-----------------|
| 3062-MEM-GET-01 | ECP (valid) | Redis returns 2 JSON strings | list of 2 dicts in the same order |
| 3062-MEM-GET-02 | ECP (empty) | Redis returns `[]` | `[]` |
| 3062-MEM-GET-03 | BVA (limit) | default limit | `lrange("session:s1:messages", -20, -1)` |
| 3062-MEM-GET-04 | BVA (limit) | `limit=1` | `lrange(key, -1, -1)` |
| 3062-MEM-GET-05 | BVA (limit) | `limit=0` | `lrange(key, 0, -1)` (observation: this asks for the whole list, not zero items) |
| 3062-MEM-GET-06 | EG | Redis returns a string that is not JSON | `json.JSONDecodeError` is raised |

## 3. `replace_messages(session_id, messages)`

| ID | Technique | Input | Expected result |
|----|-----------|-------|-----------------|
| 3062-MEM-REPL-01 | ECP (valid) | 3 messages | `delete` first, then one `rpush` with 3 payloads, then `expire` (checked with `mock_calls` order) |
| 3062-MEM-REPL-02 | BVA (size) | empty list | `delete` called; `rpush` and `expire` not called |
| 3062-MEM-REPL-03 | BVA (size) | exactly 1 message | one `rpush` with 1 payload |
| 3062-MEM-REPL-04 | ECP (extra keys) | message dict with an extra key `"id"` | only `role` and `content` are stored |
| 3062-MEM-REPL-05 | EG | message missing `content` | `KeyError` |

## 4. `set_quiz_state(session_id, quiz)`

| ID | Technique | Input | Expected result |
|----|-----------|-------|-----------------|
| 3062-MEM-SETQ-01 | ECP (valid) | `{"question": "2+2", "difficulty": 1.0}` | `set("session:s1:quiz", <json>, ex=86400)` |
| 3062-MEM-SETQ-02 | ECP (clear) | `quiz=None` | `delete("session:s1:quiz")`; `set` not called |
| 3062-MEM-SETQ-03 | BVA (empty) | `quiz={}` | `set` is called with `"{}"` (an empty dict is not the same as `None`) |
| 3062-MEM-SETQ-04 | BVA (TTL) | settings with `session_ttl_seconds=1` | `set(..., ex=1)` |
| 3062-MEM-SETQ-05 | EG | payload containing a `set()` object | `TypeError`; `set` not called |

## 5. `get_quiz_state(session_id)`

| ID | Technique | Input | Expected result |
|----|-----------|-------|-----------------|
| 3062-MEM-GETQ-01 | ECP (valid) | Redis returns a JSON object string | dict |
| 3062-MEM-GETQ-02 | ECP (missing) | Redis returns `None` | `None` |
| 3062-MEM-GETQ-03 | BVA (empty value) | Redis returns `""` | `None` |
| 3062-MEM-GETQ-04 | ECP (types) | stored JSON contains `{"difficulty": 1.0, "options": ["a", "b"]}` | float and list are preserved |
| 3062-MEM-GETQ-05 | EG | Redis returns invalid JSON | `json.JSONDecodeError` |

---

## 6. Module-level tests: quiz state lifecycle (State Machine)

Uses the in-memory `FakeRedis`.

```
NO_QUIZ --set_quiz_state(dict)--> ACTIVE --set_quiz_state(dict2)--> ACTIVE (overwritten)
ACTIVE --set_quiz_state(None)--> NO_QUIZ --set_quiz_state(None)--> NO_QUIZ
```

| ID | Technique | Transition / scenario | Expected result |
|----|-----------|-----------------------|-----------------|
| 3062-MEM-MOD-01 | SM | initial state NO_QUIZ: `get_quiz_state` | `None` |
| 3062-MEM-MOD-02 | SM | NO_QUIZ -> ACTIVE: set a quiz, then get | returns the same dict |
| 3062-MEM-MOD-03 | SM | ACTIVE -> ACTIVE: set a second quiz, then get | returns the second quiz |
| 3062-MEM-MOD-04 | SM | ACTIVE -> NO_QUIZ: set `None`, then get | `None` |
| 3062-MEM-MOD-05 | SM | NO_QUIZ -> NO_QUIZ: clear again | no error, still `None` |
| 3062-MEM-MOD-06 | Integration | append 3 messages, then `get_messages(limit=2)` | last 2 messages, in order |
