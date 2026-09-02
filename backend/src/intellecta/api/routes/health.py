from fastapi import APIRouter
from sqlalchemy import func, select

from intellecta.db.models import DocumentChunk
from intellecta.db.session import AsyncSessionLocal
from intellecta.orchestration.subjects import ALLOWED_SUBJECTS

router = APIRouter(tags=["health"])


@router.get("/api/v2/health")
async def health() -> dict:
    rag_chunks = 0
    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(func.count()).select_from(DocumentChunk).where(
                    DocumentChunk.embedding.isnot(None)
                )
            )
            rag_chunks = result.scalar() or 0
    except Exception:
        rag_chunks = -1

    return {
        "status": "ok",
        "version": "2.0.0",
        "message": "IntellectA v2 multi-agent tutor is healthy.",
        "agents": {
            "subject_specialists": [s.value for s in ALLOWED_SUBJECTS],
            "shared": ["router", "evaluator", "scope_guard", "memory_writer"],
        },
        "rag": {
            "enabled": True,
            "embedded_chunks": rag_chunks,
            "seed_hint": "python -m intellecta.scripts.seed_rag" if rag_chunks == 0 else None,
        },
    }
