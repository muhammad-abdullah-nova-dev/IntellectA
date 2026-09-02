"""PostgreSQL + pgvector repository for curriculum chunk retrieval."""

from __future__ import annotations

import logging
import uuid
from typing import Any

from sqlalchemy import bindparam, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from intellecta.db.models import ConceptMastery, Document, DocumentChunk

logger = logging.getLogger(__name__)

# asyncpg + SQLAlchemy treat ":" specially — never use :param::vector; use CAST instead.
_VECTOR_SEARCH_SQL = """
    SELECT dc.id, dc.content, dc.concept_slug, dc.metadata,
           1 - (dc.embedding <=> CAST(:query_vec AS vector)) AS similarity
    FROM document_chunks dc
    JOIN documents d ON d.id = dc.document_id
    WHERE dc.embedding IS NOT NULL
    {subject_filter}
    ORDER BY dc.embedding <=> CAST(:query_vec AS vector)
    LIMIT :lim
"""


class PgVectorRepository:
    """Hybrid semantic search over document_chunks joined with documents."""

    def __init__(self, session_factory) -> None:
        self._session_factory = session_factory

    async def similarity_search(
        self,
        query_embedding: list[float],
        *,
        user_id: str,
        subject_slug: str | None = None,
        topic_slug: str | None = None,
        limit: int = 8,
    ) -> list[dict[str, Any]]:
        vec_literal = "[" + ",".join(str(float(x)) for x in query_embedding) + "]"

        async with self._session_factory() as session:
            weak_slugs = await self._weak_concept_slugs(session, user_id)

            rows = await self._vector_search(
                session,
                vec_literal,
                subject_slug=subject_slug,
                limit=limit * 2 if weak_slugs else limit,
            )

            if not rows and subject_slug:
                rows = await self._keyword_fallback(
                    session,
                    topic_slug or "",
                    subject_slug,
                    limit,
                )

            if weak_slugs:
                rows = self._boost_weak_topics(rows, weak_slugs)

            return rows[:limit]

    async def _weak_concept_slugs(self, session: AsyncSession, user_id: str) -> list[str]:
        try:
            uid = uuid.UUID(user_id)
        except (ValueError, TypeError):
            return []
        result = await session.execute(
            select(ConceptMastery.concept_slug).where(
                ConceptMastery.user_id == uid,
                ConceptMastery.mastery_score < 0.5,
            )
        )
        return [row[0] for row in result.all() if row[0]]

    async def _vector_search(
        self,
        session: AsyncSession,
        vec_literal: str,
        *,
        subject_slug: str | None,
        limit: int,
    ) -> list[dict[str, Any]]:
        subject_filter = "AND d.subject = :subject" if subject_slug else ""
        sql = text(_VECTOR_SEARCH_SQL.format(subject_filter=subject_filter)).bindparams(
            bindparam("query_vec"),
            bindparam("lim"),
            *( [bindparam("subject")] if subject_slug else [] ),
        )
        params: dict[str, Any] = {"query_vec": vec_literal, "lim": limit}
        if subject_slug:
            params["subject"] = subject_slug

        try:
            result = await session.execute(sql, params)
        except Exception as exc:
            logger.warning("pgvector search failed: %s", exc)
            await session.rollback()
            return []

        return [
            {
                "id": str(row.id),
                "content": row.content,
                "concept_slug": row.concept_slug or "",
                "metadata": row.metadata or {},
                "similarity": float(row.similarity or 0.0),
            }
            for row in result.mappings().all()
        ]

    async def _keyword_fallback(
        self,
        session: AsyncSession,
        query: str,
        subject_slug: str,
        limit: int,
    ) -> list[dict[str, Any]]:
        """Lexical fallback when embeddings are missing or search returns nothing."""
        tokens = [t for t in query.lower().split() if len(t) > 3][:5]
        try:
            if not tokens:
                stmt = (
                    select(DocumentChunk, Document.subject)
                    .join(Document, Document.id == DocumentChunk.document_id)
                    .where(Document.subject == subject_slug)
                    .limit(limit)
                )
            else:
                pattern = "%" + "%".join(tokens[:2]) + "%"
                stmt = (
                    select(DocumentChunk, Document.subject)
                    .join(Document, Document.id == DocumentChunk.document_id)
                    .where(Document.subject == subject_slug)
                    .where(DocumentChunk.content.ilike(pattern))
                    .limit(limit)
                )
            result = await session.execute(stmt)
        except Exception as exc:
            logger.warning("keyword fallback failed: %s", exc)
            await session.rollback()
            return []

        rows = []
        for chunk, _subj in result.all():
            rows.append(
                {
                    "id": str(chunk.id),
                    "content": chunk.content,
                    "concept_slug": chunk.concept_slug or "",
                    "metadata": chunk.metadata_ or {},
                    "similarity": 0.35,
                }
            )
        return rows

    @staticmethod
    def _boost_weak_topics(
        rows: list[dict[str, Any]], weak_slugs: list[str]
    ) -> list[dict[str, Any]]:
        weak_set = set(weak_slugs)

        def score(row: dict[str, Any]) -> float:
            base = float(row.get("similarity", 0))
            if row.get("concept_slug") in weak_set:
                return base + 0.15
            return base

        return sorted(rows, key=score, reverse=True)
