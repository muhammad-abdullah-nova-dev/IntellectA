"""Orchestrates Redis (fast cache) + Neon (permanent) chat history."""

from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from intellecta.db.repository import sessions as session_repo
from intellecta.memory.short_term import ShortTermMemory

HISTORY_LIMIT = 20


async def load_conversation_history(
    *,
    db: AsyncSession,
    short_term: ShortTermMemory,
    session_id: str,
    user_id: uuid.UUID,
) -> list[dict[str, str]]:
    """Redis first; on miss load from Neon and warm Redis."""
    cached = await short_term.get_messages(session_id, limit=HISTORY_LIMIT)
    if cached:
        return cached

    sid = uuid.UUID(session_id)
    session = await session_repo.get_session_for_user(db, user_id, sid)
    if not session:
        return []

    rows = await session_repo.list_messages(db, sid, limit=HISTORY_LIMIT)
    history = [{"role": m.role, "content": m.content} for m in rows]
    if history:
        await short_term.replace_messages(session_id, history)
    return history


async def persist_turn(
    *,
    db: AsyncSession,
    short_term: ShortTermMemory,
    session_id: str,
    user_id: uuid.UUID,
    user_message: str,
    assistant_message: str,
    agent: str | None = None,
    intent: str | None = None,
    metadata: dict[str, Any] | None = None,
    title: str | None = None,
    subject: str | None = None,
) -> None:
    sid = uuid.UUID(session_id)
    session = await session_repo.ensure_session(
        db, user_id, session_id, title=title or "New conversation"
    )

    if title and (session.title in (None, "", "New conversation")):
        await session_repo.update_session_meta(db, session, title=title)
    if subject:
        await session_repo.update_session_meta(db, session, subject=subject)

    await session_repo.append_message(
        db,
        sid,
        role="user",
        content=user_message,
    )
    await session_repo.append_message(
        db,
        sid,
        role="assistant",
        content=assistant_message,
        agent=agent,
        intent=intent,
        metadata=metadata,
    )
    await session_repo.update_session_meta(db, session)

    await short_term.append_message(session_id, "user", user_message)
    await short_term.append_message(session_id, "assistant", assistant_message)
    await short_term.touch(session_id)
