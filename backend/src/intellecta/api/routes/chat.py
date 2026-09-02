"""
POST /api/v2/chat — main entry point for the LangGraph tutor workflow.
POST /api/v2/chat/image — vision analysis + tutor workflow for uploaded images.
"""

from __future__ import annotations

import asyncio
import uuid
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from intellecta.auth.deps import get_optional_user
from intellecta.api.deps import get_graph_factory, get_long_term_memory, get_short_term_memory
from intellecta.db.models import User
from intellecta.db.repository import sessions as session_repo
from intellecta.db.session import get_db
from intellecta.memory.long_term import LongTermMemory
from intellecta.memory.short_term import ShortTermMemory
from intellecta.orchestration.graph.builder import TutorGraphFactory, create_initial_state
from intellecta.services.chat_persistence import load_conversation_history, persist_turn
from intellecta.services.image_vision import (
    ImageVisionService,
    build_image_message,
    out_of_scope_image_response,
)

router = APIRouter(prefix="/api/v2", tags=["chat"])

MAX_IMAGE_BASE64_CHARS = 5_500_000  # ~4 MB decoded


def _enum_value(value: Any, default: str = "") -> str:
    if value is None:
        return default
    if hasattr(value, "value"):
        return str(value.value)
    return str(value)


def _display_badge(result: dict[str, Any]) -> str:
    if result.get("in_scope") is False:
        return "IntellectA"

    subject = _enum_value(result.get("subject"), "")
    if subject and subject not in ("", "out_of_scope"):
        return subject

    intent = _enum_value(result.get("intent"), "learn")
    if intent in ("quiz", "evaluate_answer"):
        return "evaluator"
    return "professor"


def _title_from_message(text: str, max_len: int = 48) -> str:
    cleaned = " ".join(text.split())
    if len(cleaned) <= max_len:
        return cleaned or "New conversation"
    return f"{cleaned[: max_len - 1]}…"


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=16_000)
    session_id: str | None = None
    user_id: str | None = None
    response_latency_ms: int | None = None


class ImageChatRequest(BaseModel):
    image: str = Field(..., min_length=1)
    mime_type: str = Field(default="image/jpeg", alias="mimeType")
    text: str | None = None
    session_id: str | None = None
    user_id: str | None = None

    model_config = {"populate_by_name": True}


class ChatResponse(BaseModel):
    session_id: str
    response: str
    agent: str
    intent: str
    metadata: dict[str, Any] = Field(default_factory=dict)


async def _run_tutor_graph(
    *,
    message: str,
    session_id: str,
    user_id: str,
    graph_factory: TutorGraphFactory,
    short_term: ShortTermMemory,
    long_term: LongTermMemory,
    db: AsyncSession | None = None,
    db_user: User | None = None,
    turn_metadata: dict[str, Any] | None = None,
) -> ChatResponse:
    profile = await long_term.get_user_context(user_id)
    quiz_state = await short_term.get_quiz_state(session_id)

    history: list[dict[str, str]] = []
    if db and db_user:
        await session_repo.ensure_session(db, db_user.id, session_id)
        history = await load_conversation_history(
            db=db,
            short_term=short_term,
            session_id=session_id,
            user_id=db_user.id,
        )

    initial_state = create_initial_state(
        user_id=user_id,
        session_id=session_id,
        message=message,
        history=history,
        weak_topics=profile.get("weak_topics"),
        user_profile_summary=profile.get("user_profile_summary", ""),
        quiz=quiz_state,
        turn_metadata=turn_metadata or {},
    )

    graph = graph_factory.compile()
    config = {"configurable": {"thread_id": session_id}}
    result = await graph.ainvoke(initial_state, config=config)

    response_text = result.get("final_response", "")
    agent = _display_badge(result)
    intent = _enum_value(result.get("intent"), "learn")
    subject = _enum_value(result.get("subject"), "")

    metadata = {
        "router_reason": result.get("router_reason"),
        "subject": result.get("subject"),
        "in_scope": result.get("in_scope", True),
        "assessment": result.get("assessment"),
        "retrieved_chunk_count": len(result.get("retrieved_chunks") or []),
        "specialist_agent": (result.get("turn_metadata") or {}).get("specialist_agent"),
        "rag_chunk_count": (result.get("turn_metadata") or {}).get("rag_chunk_count"),
        "history_turns": len(history),
    }

    if db and db_user:
        title = _title_from_message(message)
        await persist_turn(
            db=db,
            short_term=short_term,
            session_id=session_id,
            user_id=db_user.id,
            user_message=message,
            assistant_message=response_text,
            agent=agent,
            intent=intent,
            metadata=metadata,
            title=title,
            subject=subject if subject and subject != "out_of_scope" else None,
        )
    else:
        await short_term.append_message(session_id, "user", message)
        await short_term.append_message(session_id, "assistant", response_text)
        await short_term.set_quiz_state(session_id, result.get("quiz"))
        await short_term.touch(session_id)

    if db and db_user:
        await short_term.set_quiz_state(session_id, result.get("quiz"))

    return ChatResponse(
        session_id=session_id,
        response=response_text,
        agent=agent,
        intent=intent,
        metadata=metadata,
    )


@router.post("/chat", response_model=ChatResponse)
async def chat(
    body: ChatRequest,
    graph_factory: Annotated[TutorGraphFactory, Depends(get_graph_factory)],
    short_term: Annotated[ShortTermMemory, Depends(get_short_term_memory)],
    long_term: Annotated[LongTermMemory, Depends(get_long_term_memory)],
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User | None, Depends(get_optional_user)] = None,
) -> ChatResponse:
    if current_user:
        session = await session_repo.ensure_session(
            db, current_user.id, body.session_id
        )
        session_id = str(session.id)
        user_id = str(current_user.id)
        await db.commit()
    else:
        session_id = body.session_id or str(uuid.uuid4())
        user_id = body.user_id or "anonymous"

    turn_metadata: dict[str, Any] = {}
    if body.response_latency_ms is not None:
        turn_metadata["response_latency_ms"] = body.response_latency_ms

    return await _run_tutor_graph(
        message=body.message,
        session_id=session_id,
        user_id=user_id,
        graph_factory=graph_factory,
        short_term=short_term,
        long_term=long_term,
        db=db if current_user else None,
        db_user=current_user,
        turn_metadata=turn_metadata,
    )


@router.post("/chat/image", response_model=ChatResponse)
async def chat_image(
    body: ImageChatRequest,
    graph_factory: Annotated[TutorGraphFactory, Depends(get_graph_factory)],
    short_term: Annotated[ShortTermMemory, Depends(get_short_term_memory)],
    long_term: Annotated[LongTermMemory, Depends(get_long_term_memory)],
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User | None, Depends(get_optional_user)] = None,
) -> ChatResponse:
    if len(body.image) > MAX_IMAGE_BASE64_CHARS:
        raise HTTPException(status_code=400, detail="Image is too large (max 4 MB).")

    allowed_mimes = {"image/jpeg", "image/png", "image/webp"}
    if body.mime_type not in allowed_mimes:
        raise HTTPException(
            status_code=400,
            detail="Only JPEG, PNG, or WebP images are supported.",
        )

    if current_user:
        session = await session_repo.ensure_session(
            db, current_user.id, body.session_id
        )
        session_id = str(session.id)
        user_id = str(current_user.id)
        await db.commit()
    else:
        session_id = body.session_id or str(uuid.uuid4())
        user_id = body.user_id or "anonymous"

    user_note = (body.text or "").strip()

    vision = ImageVisionService()
    analysis = await asyncio.to_thread(
        vision.analyze,
        body.image,
        body.mime_type,
        user_note,
    )

    if not analysis.get("in_scope"):
        response_text = out_of_scope_image_response(analysis)
        user_message = user_note or "Question from uploaded image"
        metadata = {
            "in_scope": False,
            "subject": analysis.get("subject"),
            "image_summary": analysis.get("image_summary"),
            "reason": analysis.get("reason"),
            "detected_topic": analysis.get("detected_topic"),
        }

        if current_user:
            await persist_turn(
                db=db,
                short_term=short_term,
                session_id=session_id,
                user_id=current_user.id,
                user_message=user_message,
                assistant_message=response_text,
                agent="IntellectA",
                intent="learn",
                metadata=metadata,
                title=_title_from_message(user_message),
            )
        else:
            await short_term.append_message(session_id, "user", user_message)
            await short_term.append_message(session_id, "assistant", response_text)
            await short_term.touch(session_id)

        return ChatResponse(
            session_id=session_id,
            response=response_text,
            agent="IntellectA",
            intent="learn",
            metadata=metadata,
        )

    message = build_image_message(analysis, user_note)
    turn_metadata = {
        "source": "image_upload",
        "image_summary": analysis.get("image_summary"),
        "detected_topic": analysis.get("detected_topic"),
        "vision_subject": analysis.get("subject"),
    }

    result = await _run_tutor_graph(
        message=message,
        session_id=session_id,
        user_id=user_id,
        graph_factory=graph_factory,
        short_term=short_term,
        long_term=long_term,
        db=db if current_user else None,
        db_user=current_user,
        turn_metadata=turn_metadata,
    )
    result.metadata.update(
        {
            "source": "image_upload",
            "image_summary": analysis.get("image_summary"),
            "vision_subject": analysis.get("subject"),
        }
    )
    return result
