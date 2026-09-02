"""
Scope Guard Node — rejects questions outside IntellectA's 8 allowed subjects.
"""

from __future__ import annotations

from langchain_core.messages import AIMessage

from intellecta.orchestration.state import ActiveAgent, TutorState
from intellecta.orchestration.subjects import format_allowed_subjects_list, subject_label


async def scope_guard_node(state: TutorState) -> dict:
    topic = subject_label((state.get("turn_metadata") or {}).get("detected_topic"))
    subject = subject_label(state.get("subject"))
    allowed = format_allowed_subjects_list()

    response = (
        f"I only tutor **{allowed}**.\n\n"
        f"Your question seems to be about **{subject or topic}**, which is outside my subjects. "
        "Please ask something from Mathematics, Physics, Chemistry, Biology, History, "
        "Politics, Geography, or Economics."
    )

    reason = state.get("router_reason") or ""
    if reason:
        response += f"\n\n_{reason}_"

    return {
        "active_agent": ActiveAgent.SCOPE_GUARD,
        "final_response": response,
        "messages": [AIMessage(content=response)],
        "should_persist_memory": False,
        "in_scope": False,
    }
