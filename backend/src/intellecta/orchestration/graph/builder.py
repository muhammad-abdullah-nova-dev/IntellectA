"""
LangGraph builder — compiles the IntellectA tutor state machine.

Graph topology:
  START → router → (scope_guard | evaluator | agent_{subject}) → END / memory_writer
"""

from __future__ import annotations

from functools import partial
from typing import Any

from langgraph.checkpoint.base import BaseCheckpointSaver
from langgraph.graph import END, START, StateGraph

from intellecta.assessment.adaptive_engine import AdaptiveAssessmentEngine
from intellecta.memory.long_term import LongTermMemory
from intellecta.orchestration.graph.nodes import (
    evaluator_node,
    memory_writer_node,
    router_node,
    scope_guard_node,
)
from intellecta.orchestration.graph.nodes.subject_agent import make_subject_agent_node
from intellecta.orchestration.graph.routing import (
    ALL_SUBJECT_NODES,
    NODE_EVALUATOR,
    NODE_MEMORY_WRITER,
    NODE_ROUTER,
    NODE_SCOPE_GUARD,
    SUBJECT_NODE_NAMES,
    route_after_router,
    route_after_specialist,
)
from intellecta.orchestration.state import TutorState
from intellecta.orchestration.subjects import ALLOWED_SUBJECTS
from intellecta.retrieval.vector_store import VectorStore


class TutorGraphFactory:
    """
    Factory that wires infrastructure dependencies into graph nodes.

    Usage:
        factory = TutorGraphFactory(vector_store=..., long_term_memory=...)
        graph = factory.compile(checkpointer=redis_checkpointer)
        result = await graph.ainvoke(initial_state, config={"configurable": {"thread_id": session_id}})
    """

    def __init__(
        self,
        *,
        vector_store: VectorStore | None = None,
        long_term_memory: LongTermMemory | None = None,
        assessment_engine: AdaptiveAssessmentEngine | None = None,
    ) -> None:
        self._vector_store = vector_store
        self._long_term_memory = long_term_memory
        self._assessment_engine = assessment_engine or AdaptiveAssessmentEngine()

    def build(self) -> StateGraph:
        graph: StateGraph = StateGraph(TutorState)

        graph.add_node(NODE_ROUTER, router_node)
        graph.add_node(NODE_SCOPE_GUARD, scope_guard_node)
        graph.add_node(
            NODE_EVALUATOR,
            partial(
                evaluator_node,
                assessment_engine=self._assessment_engine,
            ),
        )
        graph.add_node(
            NODE_MEMORY_WRITER,
            partial(memory_writer_node, long_term_memory=self._long_term_memory),
        )

        # Eight subject specialist agents (Math, Physics, …)
        for subject in ALLOWED_SUBJECTS:
            node_name = SUBJECT_NODE_NAMES[subject.value]
            graph.add_node(
                node_name,
                make_subject_agent_node(subject.value, self._vector_store),
            )

        graph.add_edge(START, NODE_ROUTER)

        # Router → ScopeGuard | Evaluator | one of 8 subject agents
        router_targets: dict[str, str] = {
            NODE_SCOPE_GUARD: NODE_SCOPE_GUARD,
            NODE_EVALUATOR: NODE_EVALUATOR,
            **{name: name for name in ALL_SUBJECT_NODES},
        }
        graph.add_conditional_edges(NODE_ROUTER, route_after_router, router_targets)

        graph.add_edge(NODE_SCOPE_GUARD, END)

        # Subject specialists + Evaluator → MemoryWriter | END
        specialist_targets = {
            NODE_MEMORY_WRITER: NODE_MEMORY_WRITER,
            "__end__": END,
        }
        for specialist in (*ALL_SUBJECT_NODES, NODE_EVALUATOR):
            graph.add_conditional_edges(
                specialist,
                route_after_specialist,
                specialist_targets,
            )

        graph.add_edge(NODE_MEMORY_WRITER, END)

        return graph

    def compile(
        self,
        checkpointer: BaseCheckpointSaver | None = None,
    ) -> Any:
        return self.build().compile(checkpointer=checkpointer)


def create_initial_state(
    *,
    user_id: str,
    session_id: str,
    message: str,
    history: list[dict[str, str]] | None = None,
    weak_topics: list[str] | None = None,
    user_profile_summary: str = "",
    quiz: dict | None = None,
    turn_metadata: dict | None = None,
) -> TutorState:
    """Build the state payload for a new graph invocation."""
    from langchain_core.messages import AIMessage, HumanMessage

    graph_messages: list = []
    for turn in history or []:
        role = turn.get("role", "")
        content = str(turn.get("content", "")).strip()
        if not content:
            continue
        if role == "user":
            graph_messages.append(HumanMessage(content=content))
        elif role == "assistant":
            graph_messages.append(AIMessage(content=content))
    graph_messages.append(HumanMessage(content=message))

    return TutorState(
        user_id=user_id,
        session_id=session_id,
        messages=graph_messages,
        weak_topics=weak_topics or [],
        user_profile_summary=user_profile_summary,
        quiz=quiz,
        turn_metadata=turn_metadata or {},
        should_persist_memory=False,
        memory_insights=[],
    )
