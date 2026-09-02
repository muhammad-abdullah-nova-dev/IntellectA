"""Chat session history API — permanent storage in Neon PostgreSQL."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from intellecta.auth.deps import get_current_user
from intellecta.db.models import User
from intellecta.db.repository import sessions as session_repo
from intellecta.db.session import get_db
from intellecta.memory.short_term import ShortTermMemory, create_redis_client
from intellecta.config import get_settings

router = APIRouter(prefix="/api/v2/sessions", tags=["sessions"])


class SessionSummary(BaseModel):
    id: str
    title: str | None
    subject: str | None
    status: str
    message_count: int
    created_at: datetime
    updated_at: datetime


class MessageOut(BaseModel):
    id: str
    role: str
    content: str
    agent: str | None = None
    intent: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime


class SessionWithMessages(BaseModel):
    session: SessionSummary
    messages: list[MessageOut]


@router.get("", response_model=list[SessionSummary])
async def list_sessions(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[SessionSummary]:
    rows = await session_repo.list_sessions_for_user(db, current_user.id)
    out: list[SessionSummary] = []
    for row in rows:
        count = await session_repo.count_messages(db, row.id)
        out.append(
            SessionSummary(
                id=str(row.id),
                title=row.title,
                subject=row.subject,
                status=row.status,
                message_count=count,
                created_at=row.created_at,
                updated_at=row.updated_at,
            )
        )
    return out


@router.get("/{session_id}/messages", response_model=SessionWithMessages)
async def get_session_messages(
    session_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> SessionWithMessages:
    sid = _parse_session_id(session_id)
    row = await session_repo.get_session_for_user(db, current_user.id, sid)
    if not row:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = await session_repo.list_messages(db, sid)
    count = len(messages)

    # Warm Redis cache for agent context on next chat turn
    settings = get_settings()
    redis = await create_redis_client(settings)
    short_term = ShortTermMemory(redis, settings)
    history = [{"role": m.role, "content": m.content} for m in messages[-20:]]
    if history:
        await short_term.replace_messages(str(sid), history)

    return SessionWithMessages(
        session=SessionSummary(
            id=str(row.id),
            title=row.title,
            subject=row.subject,
            status=row.status,
            message_count=count,
            created_at=row.created_at,
            updated_at=row.updated_at,
        ),
        messages=[
            MessageOut(
                id=str(m.id),
                role=m.role,
                content=m.content,
                agent=m.agent,
                intent=m.intent,
                metadata=m.metadata_ or {},
                created_at=m.created_at,
            )
            for m in messages
        ],
    )


@router.delete("/{session_id}", status_code=204)
async def delete_session(
    session_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    sid = _parse_session_id(session_id)
    deleted = await session_repo.delete_session_for_user(db, current_user.id, sid)
    if not deleted:
        raise HTTPException(status_code=404, detail="Session not found")


def _parse_session_id(session_id: str) -> uuid.UUID:
    try:
        return uuid.UUID(session_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid session id") from exc
