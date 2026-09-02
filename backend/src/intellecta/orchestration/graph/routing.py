"""
Conditional routing functions for the LangGraph state machine.

These are pure functions used as `add_conditional_edges` targets.
"""

from __future__ import annotations

from intellecta.orchestration.state import ActiveAgent, TutorState, UserIntent
from intellecta.orchestration.subjects import ALLOWED_SUBJECTS, Subject

# Node names — must match keys passed to StateGraph.add_node()
NODE_ROUTER = "router"
NODE_EVALUATOR = "evaluator"
NODE_MEMORY_WRITER = "memory_writer"
NODE_SCOPE_GUARD = "scope_guard"

# Legacy single professor node (unused in graph; kept for imports)
NODE_PROFESSOR = "professor"

# One LangGraph node per subject specialist
SUBJECT_NODE_NAMES: dict[str, str] = {
    s.value: f"agent_{s.value}" for s in ALLOWED_SUBJECTS
}

ALL_SUBJECT_NODES: tuple[str, ...] = tuple(SUBJECT_NODE_NAMES.values())

DEFAULT_SUBJECT_NODE = SUBJECT_NODE_NAMES[Subject.MATHEMATICS.value]


def subject_node_name(subject: str | None) -> str:
    if not subject:
        return DEFAULT_SUBJECT_NODE
    slug = subject.lower().strip()
    return SUBJECT_NODE_NAMES.get(slug, DEFAULT_SUBJECT_NODE)


def route_after_router(state: TutorState) -> str:
    """
    Conditional edge: Router → ScopeGuard | Evaluator | Subject specialist.

    out_of_scope           → scope_guard
    quiz | evaluate_answer → evaluator
    learn | clarify        → agent_{subject}
    """
    if state.get("in_scope") is False:
        return NODE_SCOPE_GUARD

    intent = state.get("intent", UserIntent.LEARN)

    if intent in (UserIntent.QUIZ, UserIntent.EVALUATE_ANSWER):
        return NODE_EVALUATOR

    return subject_node_name(state.get("subject"))


def route_after_specialist(state: TutorState) -> str:
    """
    Conditional edge: Specialist → MemoryWriter (if insights) | END.
    """
    if state.get("should_persist_memory"):
        return NODE_MEMORY_WRITER
    return "__end__"


def resolve_active_agent(node_name: str) -> ActiveAgent:
    mapping = {
        NODE_ROUTER: ActiveAgent.ROUTER,
        NODE_PROFESSOR: ActiveAgent.PROFESSOR,
        NODE_EVALUATOR: ActiveAgent.EVALUATOR,
        NODE_MEMORY_WRITER: ActiveAgent.MEMORY_WRITER,
        NODE_SCOPE_GUARD: ActiveAgent.SCOPE_GUARD,
        **{SUBJECT_NODE_NAMES[s.value]: getattr(ActiveAgent, s.name) for s in ALLOWED_SUBJECTS},
    }
    return mapping.get(node_name, ActiveAgent.ROUTER)
