"""
Memory Writer Node — persists session insights to long-term memory asynchronously.
"""

from __future__ import annotations

from intellecta.memory.long_term import LongTermMemory
from intellecta.orchestration.state import ActiveAgent, TutorState


async def memory_writer_node(
    state: TutorState,
    *,
    long_term_memory: LongTermMemory | None = None,
) -> dict:
    insights = state.get("memory_insights") or []
    user_id = state.get("user_id", "")

    if long_term_memory and insights and user_id:
        await long_term_memory.persist_insights(
            user_id=user_id,
            session_id=state.get("session_id", ""),
            insights=insights,
            metadata={
                "intent": str(state.get("intent", "")),
                "agent": str(state.get("active_agent", "")),
            },
        )

    return {
        "active_agent": ActiveAgent.MEMORY_WRITER,
        "should_persist_memory": False,
    }
