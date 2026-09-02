"""PostgreSQL backing store for long-term user memory (insights + weak topics)."""

from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from intellecta.db.models import ConceptMastery, UserInsight
from intellecta.db.repository import sessions as session_repo
from intellecta.db.session import AsyncSessionLocal


class UserMemoryRepository:
    def __init__(self, session_factory=AsyncSessionLocal) -> None:
        self._session_factory = session_factory

    async def get_weak_topics(self, user_id: str) -> list[str]:
        uid = self._uid(user_id)
        if not uid:
            return []
        async with self._session_factory() as session:
            result = await session.execute(
                select(ConceptMastery.concept_slug).where(
                    ConceptMastery.user_id == uid,
                    ConceptMastery.mastery_score < 0.5,
                )
            )
            return [row[0] for row in result.all() if row[0]]

    async def get_profile_summary(self, user_id: str) -> str:
        uid = self._uid(user_id)
        if not uid:
            return ""
        async with self._session_factory() as session:
            result = await session.execute(
                select(UserInsight.insight)
                .where(UserInsight.user_id == uid)
                .order_by(UserInsight.created_at.desc())
                .limit(8)
            )
            insights = [row[0] for row in result.all() if row[0]]
            return "; ".join(insights)

    async def save_insights(
        self,
        user_id: str,
        session_id: str,
        insights: list[str],
        metadata: dict[str, Any] | None = None,
    ) -> None:
        uid = self._uid(user_id)
        if not uid or not insights:
            return
        sid = self._uid(session_id)
        async with self._session_factory() as session:
            if sid:
                await session_repo.ensure_session(session, uid, str(sid))
            for insight in insights:
                session.add(
                    UserInsight(
                        user_id=uid,
                        session_id=sid,
                        insight=insight,
                        source="graph",
                        metadata_=metadata or {},
                    )
                )
            await session.commit()

    @staticmethod
    def _uid(value: str) -> uuid.UUID | None:
        try:
            return uuid.UUID(str(value))
        except (ValueError, TypeError):
            return None
