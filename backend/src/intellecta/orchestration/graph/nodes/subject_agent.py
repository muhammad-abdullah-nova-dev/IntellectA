"""
Subject specialist nodes — one dedicated agent per allowed academic subject.

Each node uses a subject-specific system prompt and RAG filtered to that subject.
"""

from __future__ import annotations

from langchain_core.messages import AIMessage

from intellecta.agents.prompts import get_subject_prompt, subject_agent_display_name
from intellecta.orchestration.state import ActiveAgent, TutorState
from intellecta.orchestration.subjects import Subject, subject_label
from intellecta.retrieval.vector_store import VectorStore
from intellecta.services.llm import ainvoke, get_chat_model

_SUBJECT_TO_ACTIVE: dict[str, ActiveAgent] = {
    Subject.MATHEMATICS.value: ActiveAgent.MATHEMATICS,
    Subject.PHYSICS.value: ActiveAgent.PHYSICS,
    Subject.CHEMISTRY.value: ActiveAgent.CHEMISTRY,
    Subject.BIOLOGY.value: ActiveAgent.BIOLOGY,
    Subject.HISTORY.value: ActiveAgent.HISTORY,
    Subject.POLITICS.value: ActiveAgent.POLITICS,
    Subject.GEOGRAPHY.value: ActiveAgent.GEOGRAPHY,
    Subject.ECONOMICS.value: ActiveAgent.ECONOMICS,
}


def _format_chunks(chunks: list) -> str:
    if not chunks:
        return "No reference material retrieved from the curriculum database."
    parts = []
    for i, c in enumerate(chunks, 1):
        content = c.get("content", c) if isinstance(c, dict) else str(c)
        concept = c.get("concept_slug", "") if isinstance(c, dict) else ""
        sim = c.get("similarity", 0) if isinstance(c, dict) else 0
        parts.append(f"[{i}] ({concept}, relevance={sim:.2f})\n{content}")
    return "\n\n".join(parts)


def _latest_user_message(state: TutorState) -> str:
    messages = state.get("messages") or []
    for msg in reversed(messages):
        role = getattr(msg, "type", None) or (msg.get("role") if isinstance(msg, dict) else None)
        if role in ("human", "user"):
            return str(getattr(msg, "content", None) or msg.get("content", ""))
    return ""


async def subject_agent_node(
    state: TutorState,
    *,
    subject: str,
    vector_store: VectorStore | None = None,
) -> dict:
    """Run the specialist agent for a single subject (mathematics, physics, …)."""
    last_user = _latest_user_message(state)
    topic = (state.get("turn_metadata") or {}).get("detected_topic") or last_user
    subject_slug = subject.lower().strip()

    chunks: list = list(state.get("retrieved_chunks") or [])
    if vector_store and last_user:
        chunks = await vector_store.hybrid_search(
            query=last_user,
            user_id=state.get("user_id", ""),
            subject_slug=subject_slug,
            topic_slug=topic if isinstance(topic, str) else None,
            limit=6,
        )

    weak = state.get("weak_topics") or []
    profile = state.get("user_profile_summary") or ""
    label = subject_label(subject_slug)

    user_prompt = (
        f"Subject: {label}\n"
        f"Student profile: {profile or 'New student'}\n"
        f"Known weak areas: {', '.join(weak) if weak else 'none yet'}\n\n"
        f"Curriculum reference material (RAG):\n{_format_chunks(chunks)}\n\n"
        f"Student question:\n{last_user}"
    )

    system_prompt = get_subject_prompt(subject_slug)
    response = await ainvoke(get_chat_model(temperature=0.35), system_prompt, user_prompt)

    insights: list[str] = []
    if weak:
        insights.append(f"Reinforced {label} on weak topics: {', '.join(weak[:3])}")
    if topic:
        insights.append(f"Discussed {label} concept: {topic}")

    active = _SUBJECT_TO_ACTIVE.get(subject_slug, ActiveAgent.MATHEMATICS)

    return {
        "active_agent": active,
        "subject": subject_slug,
        "retrieved_chunks": chunks,
        "final_response": response,
        "messages": [AIMessage(content=response)],
        "should_persist_memory": bool(insights),
        "memory_insights": insights,
        "turn_metadata": {
            **(state.get("turn_metadata") or {}),
            "specialist_agent": subject_agent_display_name(subject_slug),
            "rag_chunk_count": len(chunks),
        },
    }


def make_subject_agent_node(subject: str, vector_store: VectorStore | None):
    """Factory for LangGraph partial() wiring."""

    async def _node(state: TutorState) -> dict:
        return await subject_agent_node(state, subject=subject, vector_store=vector_store)

    _node.__name__ = f"agent_{subject}"
    return _node
