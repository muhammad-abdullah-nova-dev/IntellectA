"""Chat session + message persistence (Neon PostgreSQL)."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from intellecta.db.models import Message, Session


def _parse_uuid(value: str | uuid.UUID | None) -> uuid.UUID | None:
    if value is None:
        return None
    if isinstance(value, uuid.UUID):
        return value
    try:
        return uuid.UUID(str(value))
    except (ValueError, TypeError):
        return None


async def get_session_for_user(
    db: AsyncSession,
    user_id: uuid.UUID,
    session_id: uuid.UUID,
) -> Session | None:
    result = await db.execute(
        select(Session).where(
            Session.id == session_id,
            Session.user_id == user_id,
        )
    )
    return result.scalar_one_or_none()


async def list_sessions_for_user(
    db: AsyncSession,
    user_id: uuid.UUID,
    *,
    limit: int = 100,
) -> list[Session]:
    result = await db.execute(
        select(Session)
        .where(Session.user_id == user_id, Session.status == "active")
        .order_by(Session.updated_at.desc())
        .limit(limit)
    )
    return list(result.scalars().all())


async def count_messages(db: AsyncSession, session_id: uuid.UUID) -> int:
    result = await db.execute(
        select(func.count()).select_from(Message).where(Message.session_id == session_id)
    )
    return int(result.scalar() or 0)


async def create_session(
    db: AsyncSession,
    user_id: uuid.UUID,
    *,
    session_id: uuid.UUID | None = None,
    title: str = "New conversation",
    subject: str | None = None,
) -> Session:
    row = Session(
        id=session_id or uuid.uuid4(),
        user_id=user_id,
        title=title,
        subject=subject,
        status="active",
        metadata_={},
    )
    db.add(row)
    await db.flush()
    return row


async def ensure_session(
    db: AsyncSession,
    user_id: uuid.UUID,
    session_id: str | None,
    *,
    title: str = "New conversation",
) -> Session:
    """Return existing session or create one (honours client UUID when valid)."""
    sid = _parse_uuid(session_id)
    if sid:
        existing = await get_session_for_user(db, user_id, sid)
        if existing:
            return existing
        return await create_session(db, user_id, session_id=sid, title=title)

    return await create_session(db, user_id, title=title)


async def update_session_meta(
    db: AsyncSession,
    session: Session,
    *,
    title: str | None = None,
    subject: str | None = None,
) -> None:
    if title is not None:
        session.title = title
    if subject is not None:
        session.subject = subject
    session.updated_at = datetime.now(timezone.utc)
    await db.flush()


async def delete_session_for_user(
    db: AsyncSession,
    user_id: uuid.UUID,
    session_id: uuid.UUID,
) -> bool:
    result = await db.execute(
        delete(Session).where(
            Session.id == session_id,
            Session.user_id == user_id,
        )
    )
    return (result.rowcount or 0) > 0


async def list_messages(
    db: AsyncSession,
    session_id: uuid.UUID,
    *,
    limit: int = 500,
) -> list[Message]:
    result = await db.execute(
        select(Message)
        .where(Message.session_id == session_id)
        .order_by(Message.created_at.asc())
        .limit(limit)
    )
    return list(result.scalars().all())


async def append_message(
    db: AsyncSession,
    session_id: uuid.UUID,
    *,
    role: str,
    content: str,
    agent: str | None = None,
    intent: str | None = None,
    metadata: dict[str, Any] | None = None,
) -> Message:
    row = Message(
        session_id=session_id,
        role=role,
        content=content,
        agent=agent,
        intent=intent,
        metadata_=metadata or {},
    )
    db.add(row)
    await db.flush()
    return row
