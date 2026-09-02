"""
Seed curriculum documents + embeddings into PostgreSQL for RAG.

Usage (from backend):
    export PYTHONPATH=src
    python -m intellecta.scripts.seed_rag
    python -m intellecta.scripts.seed_rag --force   # re-embed existing docs
"""

from __future__ import annotations

import argparse
import asyncio
import logging

from sqlalchemy import delete, select, text

from intellecta.db.models import Document, DocumentChunk
from intellecta.db.session import AsyncSessionLocal
from intellecta.retrieval.embeddings import FastEmbedService
from intellecta.retrieval.seed_curriculum import CURRICULUM

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def _ensure_embedding_dimension(session) -> None:
    """Migrate vector(1536) → vector(384) if an older schema was applied."""
    result = await session.execute(
        text(
            """
            SELECT atttypmod FROM pg_attribute
            WHERE attrelid = 'document_chunks'::regclass AND attname = 'embedding'
            """
        )
    )
    typmod = result.scalar()
    if typmod == 384:
        return
    logger.info("Migrating document_chunks.embedding to vector(384)…")
    await session.execute(text("DROP INDEX IF EXISTS idx_chunks_embedding"))
    await session.execute(
        text("ALTER TABLE document_chunks ALTER COLUMN embedding TYPE vector(384)")
    )
    await session.execute(
        text(
            "CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON document_chunks "
            "USING hnsw (embedding vector_cosine_ops)"
        )
    )
    await session.flush()


async def seed(*, force: bool = False) -> None:
    embedder = FastEmbedService()

    async with AsyncSessionLocal() as session:
        await _ensure_embedding_dimension(session)
        existing = await session.execute(
            select(Document.id).where(Document.title.like("IntellectA % Core"))
        )
        if existing.first() and not force:
            logger.info("Curriculum already seeded. Use --force to re-embed.")
            return

        if force:
            logger.info("Removing existing IntellectA curriculum documents…")
            doc_ids = (
                await session.execute(
                    select(Document.id).where(Document.title.like("IntellectA % Core"))
                )
            ).scalars().all()
            if doc_ids:
                await session.execute(
                    delete(DocumentChunk).where(DocumentChunk.document_id.in_(doc_ids))
                )
                await session.execute(delete(Document).where(Document.id.in_(doc_ids)))

        total_chunks = 0
        for doc_seed in CURRICULUM:
            doc = Document(
                title=doc_seed.title,
                subject=doc_seed.subject,
                source_uri="intellecta://builtin-curriculum",
                metadata_={"seed": True, "version": "1"},
            )
            session.add(doc)
            await session.flush()

            texts = [c.content for c in doc_seed.chunks]
            vectors = await embedder.embed_batch(texts)

            for idx, (chunk_seed, vector) in enumerate(zip(doc_seed.chunks, vectors)):
                session.add(
                    DocumentChunk(
                        document_id=doc.id,
                        content=chunk_seed.content,
                        concept_slug=chunk_seed.concept_slug,
                        chunk_index=idx,
                        metadata_={"subject": doc_seed.subject},
                        embedding=vector,
                    )
                )
                total_chunks += 1

            logger.info("Seeded %s (%d chunks)", doc_seed.title, len(doc_seed.chunks))

        await session.commit()
        logger.info("Done — %d chunks across %d subjects.", total_chunks, len(CURRICULUM))


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed IntellectA RAG curriculum")
    parser.add_argument("--force", action="store_true", help="Replace existing seed data")
    args = parser.parse_args()
    asyncio.run(seed(force=args.force))


if __name__ == "__main__":
    main()
