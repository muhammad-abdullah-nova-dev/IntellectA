"""
LangGraph state definitions for the IntellectA tutor workflow.

State is the single source of truth passed between nodes. Fields use
Annotated reducers where lists/messages need append semantics.
"""

from __future__ import annotations

from enum import Enum
from typing import Annotated, Any

from langgraph.graph.message import add_messages
from typing_extensions import TypedDict


class UserIntent(str, Enum):
    """Router classification — drives conditional graph edges."""

    LEARN = "learn"
    QUIZ = "quiz"
    EVALUATE_ANSWER = "evaluate_answer"
    CLARIFY = "clarify"


class ActiveAgent(str, Enum):
    """Which specialist node produced the latest response."""

    ROUTER = "router"
    PROFESSOR = "professor"  # legacy alias; graph uses subject specialists
    EVALUATOR = "evaluator"
    MEMORY_WRITER = "memory_writer"
    SCOPE_GUARD = "scope_guard"
    # ── 8 subject specialist agents ───────────────────────────────────────
    MATHEMATICS = "mathematics"
    PHYSICS = "physics"
    CHEMISTRY = "chemistry"
    BIOLOGY = "biology"
    HISTORY = "history"
    POLITICS = "politics"
    GEOGRAPHY = "geography"
    ECONOMICS = "economics"


class QuizState(TypedDict, total=False):
    """In-flight adaptive quiz context (short-term memory)."""

    question_id: str
    subject: str
    concept_slug: str
    difficulty: float
    question_text: str
    expected_answer_hints: str
    started_at_iso: str


class RetrievedChunk(TypedDict, total=False):
    """Vector retrieval result injected into Professor context."""

    chunk_id: str
    content: str
    concept_slug: str
    similarity: float
    metadata: dict[str, Any]


class AssessmentResult(TypedDict, total=False):
    """Output from Evaluator when scoring a user answer."""

    is_correct: bool
    score: float  # 0.0 – 1.0
    feedback: str
    misconceptions: list[str]
    next_difficulty: float
    follow_up_question: str | None


class TutorState(TypedDict, total=False):
    """
    Root graph state. Required fields are set at invocation; optional
    fields are populated progressively by nodes.
    """

    # ── Identity ──────────────────────────────────────────────────────────
    user_id: str
    session_id: str

    # ── Conversation (LangGraph message reducer) ──────────────────────────
    messages: Annotated[list, add_messages]

    # ── Routing ───────────────────────────────────────────────────────────
    intent: UserIntent
    active_agent: ActiveAgent
    router_reason: str
    subject: str | None
    in_scope: bool

    # ── Professor context ─────────────────────────────────────────────────
    retrieved_chunks: list[RetrievedChunk]
    weak_topics: list[str]
    user_profile_summary: str

    # ── Evaluator / quiz ──────────────────────────────────────────────────
    quiz: QuizState | None
    assessment: AssessmentResult | None

    # ── Output ────────────────────────────────────────────────────────────
    final_response: str
    should_persist_memory: bool
    memory_insights: list[str]

    # ── Telemetry ─────────────────────────────────────────────────────────
    turn_metadata: dict[str, Any]
