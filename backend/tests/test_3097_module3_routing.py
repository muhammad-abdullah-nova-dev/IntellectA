"""Member 3097 - Module 3: graph routing (orchestration/graph/routing.py)

Test IDs match notes/3097_module3_routing_notes.md
"""

import pytest

from intellecta.orchestration.graph.routing import (
    ALL_SUBJECT_NODES,
    DEFAULT_SUBJECT_NODE,
    NODE_EVALUATOR,
    NODE_MEMORY_WRITER,
    NODE_PROFESSOR,
    NODE_ROUTER,
    NODE_SCOPE_GUARD,
    SUBJECT_NODE_NAMES,
    resolve_active_agent,
    route_after_router,
    route_after_specialist,
    subject_node_name,
)
from intellecta.orchestration.state import ActiveAgent, UserIntent
from intellecta.orchestration.subjects import ALLOWED_SUBJECTS

pytestmark = [pytest.mark.routing, pytest.mark.regression, pytest.mark.order(4)]


# FUNCTION-LEVEL TESTS: subject_node_name

@pytest.mark.parametrize(
    "subject, expected",
    [
        pytest.param("mathematics", "agent_mathematics", id="3097-ROUTE-NODE-01"),
        pytest.param("economics", "agent_economics", id="3097-ROUTE-NODE-02"),
        pytest.param(None, "agent_mathematics", id="3097-ROUTE-NODE-03"),
        pytest.param("", "agent_mathematics", id="3097-ROUTE-NODE-04"),
        pytest.param("PHYSICS", "agent_physics", id="3097-ROUTE-NODE-05"),
        pytest.param("  biology  ", "agent_biology", id="3097-ROUTE-NODE-06"),
        pytest.param("cooking", "agent_mathematics", id="3097-ROUTE-NODE-07"),
        pytest.param("out_of_scope", "agent_mathematics", id="3097-ROUTE-NODE-08"),
    ],
)
def test_subject_node_name(subject, expected):
    """3097-ROUTE-NODE-01..08: subject text becomes a node name, unknown or empty falls back to maths."""
    assert subject_node_name(subject) == expected


@pytest.mark.smoke
@pytest.mark.order(1)
def test_subject_node_name_number_input_fails():
    """3097-ROUTE-NODE-09: a number has no .lower() -> AttributeError."""
    with pytest.raises(AttributeError):
        subject_node_name(123)


# FUNCTION-LEVEL TESTS: route_after_router

@pytest.mark.bva
@pytest.mark.parametrize(
    "state, expected",
    [
        pytest.param({"in_scope": False, "intent": UserIntent.LEARN}, "scope_guard", id="3097-ROUTE-RR-01"),
        pytest.param({"in_scope": False, "intent": UserIntent.QUIZ}, "scope_guard", id="3097-ROUTE-RR-02"),
        pytest.param({"in_scope": True, "intent": UserIntent.QUIZ}, "evaluator", id="3097-ROUTE-RR-03"),
        pytest.param({"in_scope": True, "intent": UserIntent.EVALUATE_ANSWER}, "evaluator", id="3097-ROUTE-RR-04"),
        pytest.param(
            {"in_scope": True, "intent": UserIntent.LEARN, "subject": "physics"},
            "agent_physics",
            id="3097-ROUTE-RR-05",
        ),
        pytest.param(
            {"in_scope": True, "intent": UserIntent.CLARIFY, "subject": "history"},
            "agent_history",
            id="3097-ROUTE-RR-06",
        ),
        pytest.param({}, "agent_mathematics", id="3097-ROUTE-RR-07"),
        pytest.param(
            {"intent": UserIntent.LEARN, "subject": "cooking"},
            "agent_mathematics",
            id="3097-ROUTE-RR-08",
        ),
        pytest.param({"intent": "quiz"}, "evaluator", id="3097-ROUTE-RR-09"),
        pytest.param({"in_scope": 0, "intent": UserIntent.QUIZ}, "evaluator", id="3097-ROUTE-RR-10"),
    ],
)
def test_route_after_router(state, expected):
    """3097-ROUTE-RR-01..10: where the graph goes after the router for different states."""
    assert route_after_router(state) == expected


# FUNCTION-LEVEL TESTS: route_after_specialist

@pytest.mark.parametrize(
    "state, expected",
    [
        pytest.param({"should_persist_memory": True}, "memory_writer", id="3097-ROUTE-RS-01"),
        pytest.param({"should_persist_memory": False}, "__end__", id="3097-ROUTE-RS-02"),
        pytest.param({}, "__end__", id="3097-ROUTE-RS-03"),
        pytest.param({"should_persist_memory": None}, "__end__", id="3097-ROUTE-RS-04"),
        pytest.param({"should_persist_memory": "yes"}, "memory_writer", id="3097-ROUTE-RS-05"),
        pytest.param({"should_persist_memory": 0}, "__end__", id="3097-ROUTE-RS-06"),
        pytest.param({"should_persist_memory": []}, "__end__", id="3097-ROUTE-RS-07"),
        pytest.param({"should_persist_memory": ["x"]}, "memory_writer", id="3097-ROUTE-RS-08"),
    ],
)
def test_route_after_specialist(state, expected):
    """3097-ROUTE-RS-01..08: memory writer only runs when should_persist_memory is truthy."""
    assert route_after_specialist(state) == expected


# FUNCTION-LEVEL TESTS: resolve_active_agent

@pytest.mark.parametrize(
    "node_name, expected",
    [
        pytest.param("router", ActiveAgent.ROUTER, id="3097-ROUTE-AGENT-01"),
        pytest.param("evaluator", ActiveAgent.EVALUATOR, id="3097-ROUTE-AGENT-02"),
        pytest.param("memory_writer", ActiveAgent.MEMORY_WRITER, id="3097-ROUTE-AGENT-03"),
        pytest.param("scope_guard", ActiveAgent.SCOPE_GUARD, id="3097-ROUTE-AGENT-04"),
        pytest.param("professor", ActiveAgent.PROFESSOR, id="3097-ROUTE-AGENT-05"),
        pytest.param("agent_physics", ActiveAgent.PHYSICS, id="3097-ROUTE-AGENT-06"),
        pytest.param("agent_economics", ActiveAgent.ECONOMICS, id="3097-ROUTE-AGENT-07"),
        pytest.param("unknown_node", ActiveAgent.ROUTER, id="3097-ROUTE-AGENT-08"),
        pytest.param("", ActiveAgent.ROUTER, id="3097-ROUTE-AGENT-09"),
        pytest.param(None, ActiveAgent.ROUTER, id="3097-ROUTE-AGENT-10"),
    ],
)
def test_resolve_active_agent(node_name, expected):
    """3097-ROUTE-AGENT-01..10: node name is mapped to the ActiveAgent value, unknown gives ROUTER."""
    assert resolve_active_agent(node_name) == expected


# MODULE / CLASS-LEVEL TESTS: node tables and graph paths (state machine)

def test_subject_node_names_table():
    """3097-ROUTE-MOD-01: 8 subjects, each with an agent_ node name."""
    assert len(SUBJECT_NODE_NAMES) == 8
    for slug, node in SUBJECT_NODE_NAMES.items():
        assert node == "agent_" + slug


def test_all_subject_nodes_follow_subject_order():
    """3097-ROUTE-MOD-02: ALL_SUBJECT_NODES lists the nodes in the order of ALLOWED_SUBJECTS."""
    expected = tuple("agent_" + s.value for s in ALLOWED_SUBJECTS)
    assert ALL_SUBJECT_NODES == expected


def test_default_node_is_mathematics():
    """3097-ROUTE-MOD-03: the default node is agent_mathematics and it is a real subject node."""
    assert DEFAULT_SUBJECT_NODE == "agent_mathematics"
    assert DEFAULT_SUBJECT_NODE in ALL_SUBJECT_NODES


def test_path_out_of_scope_question():
    """3097-ROUTE-MOD-04: router -> scope_guard for a question outside the subjects."""
    state = {"in_scope": False, "intent": UserIntent.LEARN, "subject": "out_of_scope"}
    assert route_after_router(state) == NODE_SCOPE_GUARD
    assert resolve_active_agent(NODE_SCOPE_GUARD) == ActiveAgent.SCOPE_GUARD


def test_path_learn_physics_with_memory():
    """3097-ROUTE-MOD-05: router -> agent_physics -> memory_writer."""
    state = {"in_scope": True, "intent": UserIntent.LEARN, "subject": "physics"}
    first_step = route_after_router(state)
    assert first_step == "agent_physics"
    state["should_persist_memory"] = True
    assert route_after_specialist(state) == NODE_MEMORY_WRITER


def test_path_quiz_goes_to_evaluator():
    """3097-ROUTE-MOD-06: router -> evaluator for a quiz request."""
    state = {"in_scope": True, "intent": UserIntent.QUIZ, "subject": "biology"}
    assert route_after_router(state) == NODE_EVALUATOR


def test_path_learn_without_memory_ends():
    """3097-ROUTE-MOD-07: router -> agent_history -> end when nothing should be saved."""
    state = {"in_scope": True, "intent": UserIntent.LEARN, "subject": "history"}
    assert route_after_router(state) == "agent_history"
    state["should_persist_memory"] = False
    assert route_after_specialist(state) == "__end__"


def test_every_subject_node_resolves_to_its_own_agent():
    """3097-ROUTE-MOD-08: no subject node falls back to ROUTER."""
    for subject in ALLOWED_SUBJECTS:
        node = "agent_" + subject.value
        assert resolve_active_agent(node) != ActiveAgent.ROUTER
        assert resolve_active_agent(node).value == subject.value


def test_fixed_node_names():
    """3097-ROUTE-MOD-09: the fixed node names used by the graph."""
    assert NODE_ROUTER == "router"
    assert NODE_EVALUATOR == "evaluator"
    assert NODE_MEMORY_WRITER == "memory_writer"
    assert NODE_SCOPE_GUARD == "scope_guard"
    assert NODE_PROFESSOR == "professor"
