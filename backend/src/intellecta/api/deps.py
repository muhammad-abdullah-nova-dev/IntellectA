"""FastAPI dependency injection — wires graph, memory, DB, and RAG."""

from __future__ import annotations

from functools import lru_cache
from typing import Annotated, AsyncGenerator

from fastapi import Depends

from intellecta.assessment.adaptive_engine import AdaptiveAssessmentEngine
from intellecta.config import Settings, get_settings
from intellecta.db.session import AsyncSessionLocal
from intellecta.db.repository.user_memory import UserMemoryRepository
from intellecta.memory.long_term import LongTermMemory
from intellecta.memory.short_term import ShortTermMemory, create_redis_client
from intellecta.orchestration.graph.builder import TutorGraphFactory
from intellecta.retrieval.embeddings import FastEmbedService
from intellecta.retrieval.pg_repository import PgVectorRepository
from intellecta.retrieval.vector_store import VectorStore


@lru_cache
def get_vector_store() -> VectorStore:
    """RAG stack: local embeddings + pgvector repository."""
    repo = PgVectorRepository(session_factory=AsyncSessionLocal)
    embedder = FastEmbedService()
    return VectorStore(repository=repo, embedder=embedder)


@lru_cache
def get_user_memory_repository() -> UserMemoryRepository:
    return UserMemoryRepository()


@lru_cache
def get_graph_factory() -> TutorGraphFactory:
    long_term = LongTermMemory(pg_repository=get_user_memory_repository())
    return TutorGraphFactory(
        vector_store=get_vector_store(),
        long_term_memory=long_term,
        assessment_engine=AdaptiveAssessmentEngine(),
    )


async def get_short_term_memory(
    settings: Annotated[Settings, Depends(get_settings)],
) -> AsyncGenerator[ShortTermMemory, None]:
    redis = await create_redis_client(settings)
    yield ShortTermMemory(redis, settings)


def get_long_term_memory() -> LongTermMemory:
    return LongTermMemory(pg_repository=get_user_memory_repository())
