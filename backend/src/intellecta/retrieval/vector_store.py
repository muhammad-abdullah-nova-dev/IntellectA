"""
Hybrid vector retrieval over PostgreSQL + pgvector.

Supports semantic search with optional weak-topic boosting.
"""

from __future__ import annotations

import logging
from typing import Any, Protocol

from intellecta.orchestration.state import RetrievedChunk

logger = logging.getLogger(__name__)


class VectorRepository(Protocol):
    async def similarity_search(
        self,
        query_embedding: list[float],
        *,
        user_id: str,
        subject_slug: str | None = None,
        topic_slug: str | None = None,
        limit: int = 8,
    ) -> list[dict[str, Any]]: ...


class EmbeddingService(Protocol):
    async def embed(self, text: str) -> list[float]: ...


class VectorStore:
    """Orchestrates embedding + hybrid pgvector query."""

    def __init__(
        self,
        repository: VectorRepository | None = None,
        embedder: EmbeddingService | None = None,
    ) -> None:
        self._repo = repository
        self._embedder = embedder

    async def hybrid_search(
        self,
        query: str,
        user_id: str,
        *,
        subject_slug: str | None = None,
        topic_slug: str | None = None,
        limit: int = 8,
    ) -> list[RetrievedChunk]:
        if not self._repo or not self._embedder:
            logger.debug("VectorStore: no repo/embedder — returning empty results")
            return []

        embedding = await self._embedder.embed(query)
        rows = await self._repo.similarity_search(
            embedding,
            user_id=user_id,
            subject_slug=subject_slug,
            topic_slug=topic_slug,
            limit=limit,
        )

        return [
            RetrievedChunk(
                chunk_id=str(row.get("id", "")),
                content=row.get("content", ""),
                concept_slug=row.get("concept_slug", ""),
                similarity=float(row.get("similarity", 0.0)),
                metadata=row.get("metadata") or {},
            )
            for row in rows
        ]
