"""
Professor Node — teaches concepts using retrieved context and user profile.
"""

from __future__ import annotations

from langchain_core.messages import AIMessage

from intellecta.orchestration.state import ActiveAgent, TutorState
from intellecta.retrieval.vector_store import VectorStore
from intellecta.services.llm import ainvoke, get_chat_model

PROFESSOR_SYSTEM_PROMPT = """You are the Professor agent for IntellectA — an expert, patient tutor.

You ONLY teach these subjects: Mathematics, Physics, Chemistry, Biology, History,
Politics, Geography, and Economics. Stay within the detected subject.

Teaching principles:
1. Scaffold: start from what the student likely knows, build up complexity.
2. Use retrieved reference material when provided — cite concepts, don't hallucinate.
3. Personalize: if weak topics are listed, proactively address common pitfalls.
4. Use clear structure: definition → intuition → worked example → check-for-understanding.
5. For STEM topics, use LaTeX for math ($...$) and chemistry notation where appropriate.

Keep responses focused (2–4 paragraphs unless the topic demands more).
End with one short question to verify understanding."""


def _format_chunks(chunks: list) -> str:
    if not chunks:
        return "No reference material retrieved."
    parts = []
    for i, c in enumerate(chunks, 1):
        content = c.get("content", c) if isinstance(c, dict) else str(c)
        concept = c.get("concept_slug", "") if isinstance(c, dict) else ""
        parts.append(f"[{i}] ({concept})\n{content}")
    return "\n\n".join(parts)


async def professor_node(state: TutorState, *, vector_store: VectorStore | None = None) -> dict:
    messages = state.get("messages") or []
    last_user = ""
    for msg in reversed(messages):
        role = getattr(msg, "type", None) or (msg.get("role") if isinstance(msg, dict) else None)
        if role in ("human", "user"):
            last_user = str(getattr(msg, "content", None) or msg.get("content", ""))
            break

    # Hybrid retrieval — topic from router metadata or user query
    topic = (state.get("turn_metadata") or {}).get("detected_topic") or last_user
    chunks: list = list(state.get("retrieved_chunks") or [])

    if vector_store and last_user:
        chunks = await vector_store.hybrid_search(
            query=last_user,
            user_id=state.get("user_id", ""),
            topic_slug=topic if isinstance(topic, str) else None,
            limit=6,
        )

    weak = state.get("weak_topics") or []
    profile = state.get("user_profile_summary") or ""

    user_prompt = (
        f"Student profile: {profile or 'New student'}\n"
        f"Known weak areas: {', '.join(weak) if weak else 'none yet'}\n\n"
        f"Reference material:\n{_format_chunks(chunks)}\n\n"
        f"Student question:\n{last_user}"
    )

    response = await ainvoke(get_chat_model(temperature=0.4), PROFESSOR_SYSTEM_PROMPT, user_prompt)

    insights: list[str] = []
    if weak:
        insights.append(f"Reinforced teaching on weak topics: {', '.join(weak[:3])}")
    detected = (state.get("turn_metadata") or {}).get("detected_topic")
    if detected:
        insights.append(f"Discussed concept: {detected}")

    return {
        "active_agent": ActiveAgent.PROFESSOR,
        "retrieved_chunks": chunks,
        "final_response": response,
        "messages": [AIMessage(content=response)],
        "should_persist_memory": bool(insights),
        "memory_insights": insights,
    }
