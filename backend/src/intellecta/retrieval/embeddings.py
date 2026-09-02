"""Text embedding service for RAG (local FastEmbed — no extra API key)."""

from __future__ import annotations

import asyncio
import logging
from functools import lru_cache

from intellecta.config import Settings, get_settings

logger = logging.getLogger(__name__)

# BAAI/bge-small-en-v1.5 outputs 384-dimensional vectors
EMBEDDING_MODEL = "BAAI/bge-small-en-v1.5"
EMBEDDING_DIMENSION = 384


@lru_cache
def _get_fastembed_model():
    try:
        from fastembed import TextEmbedding
    except ImportError as exc:
        raise RuntimeError(
            "fastembed is required for RAG. Install with: pip install fastembed"
        ) from exc
    return TextEmbedding(model_name=EMBEDDING_MODEL)


class FastEmbedService:
    """Embeds text using a local ONNX model via fastembed."""

    def __init__(self, settings: Settings | None = None) -> None:
        self._settings = settings or get_settings()

    def embed_sync(self, text: str) -> list[float]:
        text = (text or "").strip()
        if not text:
            return [0.0] * EMBEDDING_DIMENSION
        model = _get_fastembed_model()
        vectors = list(model.embed([text]))
        if not vectors:
            return [0.0] * EMBEDDING_DIMENSION
        return [float(x) for x in vectors[0]]

    async def embed(self, text: str) -> list[float]:
        return await asyncio.to_thread(self.embed_sync, text)

    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        def _batch() -> list[list[float]]:
            model = _get_fastembed_model()
            cleaned = [(t or "").strip() or " " for t in texts]
            return [[float(x) for x in vec] for vec in model.embed(cleaned)]

        return await asyncio.to_thread(_batch)
