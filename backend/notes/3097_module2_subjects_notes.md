# Test Design Notes - Module 2: Allowed Subjects (orchestration/subjects.py)

**Member:** 3097  
**Project:** IntellectA backend (Python, pytest)  
**File under test:** `orchestration/subjects.py` (enum `Subject`, constants, and the functions `subject_label`, `is_allowed_subject`, `format_allowed_subjects_list`)  
**Techniques:** ECP, BVA, EG (Error Guessing), Decision Table

The 8 allowed subjects are: mathematics, physics, chemistry, biology, history, politics, geography, economics. `out_of_scope` exists in the enum but is not allowed.

Behaviour taken from the source:
- `subject_label(slug)` returns the label from a table; `None`, empty text and `"out_of_scope"` give `"another topic"`; any other text is turned into a title (`"computer_science"` becomes `"Computer Science"`).
- `is_allowed_subject(slug)` is true only when the text is exactly one of the 8 lowercase slugs.
- `format_allowed_subjects_list()` joins the 8 labels with `", "`.

Test ID format: `3097-SUBJ-<FUNCTION>-<NN>`

### Decision table for a slug

| Kind of slug | Example | `is_allowed_subject` | `subject_label` |
|--------------|---------|----------------------|-----------------|
| exact allowed slug | `"physics"` | True | `"Physics"` |
| out of scope | `"out_of_scope"` | False | `"another topic"` |
| empty or missing | `""`, `None` | False | `"another topic"` |
| other lowercase text | `"coding"` | False | `"Coding"` |
| wrong case | `"Physics"` | False | `"Physics"` (title-cased) |
| extra spaces | `"physics "` | False | text with spaces kept |

---

## 1. `subject_label(slug)`

| ID | Technique | Input | Expected result |
|----|-----------|-------|-----------------|
| 3097-SUBJ-LABEL-01 | ECP (valid) | `"mathematics"` | `"Mathematics"` |
| 3097-SUBJ-LABEL-02 | BVA (last in list) | `"economics"` | `"Economics"` |
| 3097-SUBJ-LABEL-03 | EG | `None` | `"another topic"` |
| 3097-SUBJ-LABEL-04 | BVA (empty) | `""` | `"another topic"` |
| 3097-SUBJ-LABEL-05 | ECP | `"out_of_scope"` | `"another topic"` |
| 3097-SUBJ-LABEL-06 | ECP (unknown) | `"computer_science"` | `"Computer Science"` |
| 3097-SUBJ-LABEL-07 | EG (case) | `"PHYSICS"` | `"Physics"` |
| 3097-SUBJ-LABEL-08 | EG (spaces) | `"  physics "` | `"  Physics "` (spaces are not trimmed) |
| 3097-SUBJ-LABEL-09 | ECP (all valid) | each of the 8 slugs | label equals `slug.title()`, never the fallback |

## 2. `is_allowed_subject(slug)`

| ID | Technique | Input | Expected result |
|----|-----------|-------|-----------------|
| 3097-SUBJ-ALLOWED-01 | ECP (valid) | `"mathematics"` | `True` |
| 3097-SUBJ-ALLOWED-02 | BVA (last in list) | `"economics"` | `True` |
| 3097-SUBJ-ALLOWED-03 | ECP (invalid) | `"out_of_scope"` | `False` |
| 3097-SUBJ-ALLOWED-04 | EG | `None` | `False` |
| 3097-SUBJ-ALLOWED-05 | BVA (empty) | `""` | `False` |
| 3097-SUBJ-ALLOWED-06 | EG (case) | `"Physics"` | `False` |
| 3097-SUBJ-ALLOWED-07 | EG (space) | `"physics "` | `False` |
| 3097-SUBJ-ALLOWED-08 | ECP (invalid) | `"coding"` | `False` |
| 3097-SUBJ-ALLOWED-09 | EG (type) | `123` | `False` |
| 3097-SUBJ-ALLOWED-10 | EG (type) | `["physics"]` | `TypeError` (a list cannot be looked up in a frozenset) |

## 3. `format_allowed_subjects_list()`

| ID | Technique | Check | Expected result |
|----|-----------|-------|-----------------|
| 3097-SUBJ-FORMAT-01 | ECP | whole text | `"Mathematics, Physics, Chemistry, Biology, History, Politics, Geography, Economics"` |
| 3097-SUBJ-FORMAT-02 | BVA | number of separators | 7 times `", "` |
| 3097-SUBJ-FORMAT-03 | ECP | every label | each allowed label is in the text |
| 3097-SUBJ-FORMAT-04 | ECP | order | same order as `ALLOWED_SUBJECTS` |
| 3097-SUBJ-FORMAT-05 | EG | out of scope | no "out of scope", "out_of_scope" or "another topic" in the text |
| 3097-SUBJ-FORMAT-06 | BVA | end of text | does not end with a comma or a space |
| 3097-SUBJ-FORMAT-07 | BVA | first and last item | first is Mathematics, last is Economics |

---

## 4. Module-level tests: constants and the enum

| ID | Technique | Check | Expected result |
|----|-----------|-------|-----------------|
| 3097-SUBJ-MOD-01 | ECP | `ALLOWED_SUBJECTS` | 8 items, `OUT_OF_SCOPE` is not in it |
| 3097-SUBJ-MOD-02 | ECP | `ALLOWED_SUBJECT_VALUES` | frozenset of exactly the 8 slugs |
| 3097-SUBJ-MOD-03 | ECP | `SUBJECT_LABELS` keys | equal to the allowed slugs |
| 3097-SUBJ-MOD-04 | Decision table | each of the 8 slugs | allowed and has a label |
| 3097-SUBJ-MOD-05 | ECP | `Subject.PHYSICS` | equals the text `"physics"` and is allowed |
| 3097-SUBJ-MOD-06 | Decision table | `Subject.OUT_OF_SCOPE` | exists, value `"out_of_scope"`, not allowed |
| 3097-SUBJ-MOD-07 | ECP | `SUBJECT_SCOPE_DESCRIPTION` | names all 8 slugs and `out_of_scope` |
