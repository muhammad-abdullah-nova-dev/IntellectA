# Test Design Notes - Module 3: Graph Routing (orchestration/graph/routing.py)

**Member:** 3097  
**Project:** IntellectA backend (Python, pytest)  
**File under test:** `orchestration/graph/routing.py` (functions `subject_node_name`, `route_after_router`, `route_after_specialist`, `resolve_active_agent` and the node-name tables)  
**Techniques:** ECP, BVA, EG (Error Guessing), SM (State Machine testing), Decision Table

Behaviour taken from the source:
- `subject_node_name(subject)` returns `"agent_<subject>"`, in lowercase and trimmed; empty or unknown subjects give the default `agent_mathematics`.
- `route_after_router(state)`: if `in_scope` is exactly `False` -> `scope_guard`; else intent quiz or evaluate_answer -> `evaluator`; otherwise the subject node.
- `route_after_specialist(state)`: truthy `should_persist_memory` -> `memory_writer`, otherwise `__end__`.
- `resolve_active_agent(node_name)` maps a node name to an `ActiveAgent` value; unknown names give `ROUTER`.

Test ID format: `3097-ROUTE-<FUNCTION>-<NN>`

### Graph as a state machine

```
router --in_scope False-------------------> scope_guard
router --intent quiz / evaluate_answer----> evaluator
router --intent learn / clarify-----------> agent_<subject> --should_persist_memory True--> memory_writer
                                                            --otherwise----------------> __end__
```

---

## 1. `subject_node_name(subject)`

| ID | Technique | Input | Expected result |
|----|-----------|-------|-----------------|
| 3097-ROUTE-NODE-01 | ECP (valid) | `"mathematics"` | `agent_mathematics` |
| 3097-ROUTE-NODE-02 | BVA (last in list) | `"economics"` | `agent_economics` |
| 3097-ROUTE-NODE-03 | EG | `None` | `agent_mathematics` (default) |
| 3097-ROUTE-NODE-04 | BVA (empty) | `""` | `agent_mathematics` (default) |
| 3097-ROUTE-NODE-05 | EG (case) | `"PHYSICS"` | `agent_physics` |
| 3097-ROUTE-NODE-06 | EG (spaces) | `"  biology  "` | `agent_biology` |
| 3097-ROUTE-NODE-07 | ECP (unknown) | `"cooking"` | `agent_mathematics` (default) |
| 3097-ROUTE-NODE-08 | ECP | `"out_of_scope"` | `agent_mathematics` (default) |
| 3097-ROUTE-NODE-09 | EG (type) | `123` | `AttributeError` (a number has no `.lower()`) |

## 2. `route_after_router(state)` (decision table)

| ID | Technique | State | Expected result |
|----|-----------|-------|-----------------|
| 3097-ROUTE-RR-01 | Decision table | `in_scope=False`, intent learn | `scope_guard` |
| 3097-ROUTE-RR-02 | Decision table | `in_scope=False`, intent quiz | `scope_guard` (scope is checked first) |
| 3097-ROUTE-RR-03 | Decision table | `in_scope=True`, intent quiz | `evaluator` |
| 3097-ROUTE-RR-04 | Decision table | `in_scope=True`, intent evaluate_answer | `evaluator` |
| 3097-ROUTE-RR-05 | Decision table | intent learn, subject physics | `agent_physics` |
| 3097-ROUTE-RR-06 | Decision table | intent clarify, subject history | `agent_history` |
| 3097-ROUTE-RR-07 | EG | empty state `{}` | `agent_mathematics` |
| 3097-ROUTE-RR-08 | ECP | intent learn, subject `"cooking"` | `agent_mathematics` |
| 3097-ROUTE-RR-09 | EG (type) | intent given as plain text `"quiz"` | `evaluator` |
| 3097-ROUTE-RR-10 | EG | `in_scope=0` (falsy, but not `False`), intent quiz | `evaluator` |

## 3. `route_after_specialist(state)`

| ID | Technique | `should_persist_memory` | Expected result |
|----|-----------|-------------------------|-----------------|
| 3097-ROUTE-RS-01 | ECP (valid) | `True` | `memory_writer` |
| 3097-ROUTE-RS-02 | ECP | `False` | `__end__` |
| 3097-ROUTE-RS-03 | EG | key missing | `__end__` |
| 3097-ROUTE-RS-04 | EG | `None` | `__end__` |
| 3097-ROUTE-RS-05 | EG | `"yes"` (non-empty text) | `memory_writer` |
| 3097-ROUTE-RS-06 | BVA | `0` | `__end__` |
| 3097-ROUTE-RS-07 | BVA | `[]` (empty list) | `__end__` |
| 3097-ROUTE-RS-08 | BVA | `["x"]` (list with one item) | `memory_writer` |

## 4. `resolve_active_agent(node_name)`

| ID | Technique | Input | Expected result |
|----|-----------|-------|-----------------|
| 3097-ROUTE-AGENT-01 | ECP (fixed node) | `"router"` | `ActiveAgent.ROUTER` |
| 3097-ROUTE-AGENT-02 | ECP (fixed node) | `"evaluator"` | `ActiveAgent.EVALUATOR` |
| 3097-ROUTE-AGENT-03 | ECP (fixed node) | `"memory_writer"` | `ActiveAgent.MEMORY_WRITER` |
| 3097-ROUTE-AGENT-04 | ECP (fixed node) | `"scope_guard"` | `ActiveAgent.SCOPE_GUARD` |
| 3097-ROUTE-AGENT-05 | ECP (legacy node) | `"professor"` | `ActiveAgent.PROFESSOR` |
| 3097-ROUTE-AGENT-06 | ECP (subject node) | `"agent_physics"` | `ActiveAgent.PHYSICS` |
| 3097-ROUTE-AGENT-07 | BVA (last in list) | `"agent_economics"` | `ActiveAgent.ECONOMICS` |
| 3097-ROUTE-AGENT-08 | ECP (unknown) | `"unknown_node"` | `ActiveAgent.ROUTER` |
| 3097-ROUTE-AGENT-09 | BVA (empty) | `""` | `ActiveAgent.ROUTER` |
| 3097-ROUTE-AGENT-10 | EG | `None` | `ActiveAgent.ROUTER` |

---

## 5. Module-level tests: tables and graph paths (State Machine)

| ID | Technique | Scenario | Expected result |
|----|-----------|----------|-----------------|
| 3097-ROUTE-MOD-01 | ECP | `SUBJECT_NODE_NAMES` | 8 entries, each `agent_<slug>` |
| 3097-ROUTE-MOD-02 | ECP | `ALL_SUBJECT_NODES` | same order as `ALLOWED_SUBJECTS` |
| 3097-ROUTE-MOD-03 | ECP | `DEFAULT_SUBJECT_NODE` | `agent_mathematics` and part of `ALL_SUBJECT_NODES` |
| 3097-ROUTE-MOD-04 | SM | path: out-of-scope question | router -> `scope_guard` |
| 3097-ROUTE-MOD-05 | SM | path: learn physics with memory | router -> `agent_physics` -> `memory_writer` |
| 3097-ROUTE-MOD-06 | SM | path: quiz request | router -> `evaluator` |
| 3097-ROUTE-MOD-07 | SM | path: learn history, nothing to save | router -> `agent_history` -> `__end__` |
| 3097-ROUTE-MOD-08 | ECP | every subject node name | resolves to its own agent, never `ROUTER` |
| 3097-ROUTE-MOD-09 | ECP | fixed node name constants | router, evaluator, memory_writer, scope_guard, professor |
