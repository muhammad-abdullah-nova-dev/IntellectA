"""
Long-term graph memory — Mem0 integration with PostgreSQL fallback.

Persists user profile facts, weak topics, and recurring misconceptions
for cross-session personalization.
"""

from __future__ import annotations

import logging
from typing import Any

import httpx

from intellecta.config import Settings, get_settings

logger = logging.getLogger(__name__)


class LongTermMemory:
    """
    Dual-write memory layer:
      1. Mem0 API for semantic graph memory (when configured)
      2. PostgreSQL concept_mastery / user_insights (via repository hooks)
    """

    MEM0_BASE_URL = "https://api.mem0.ai/v1"

    def __init__(
        self,
        settings: Settings | None = None,
        *,
        pg_repository: Any | None = None,
    ) -> None:
        self._settings = settings or get_settings()
        self._pg = pg_repository

    def _mem0_user_id(self, user_id: str) -> str:
        return f"{self._settings.mem0_user_id_prefix}:{user_id}"

    async def get_user_context(self, user_id: str) -> dict[str, Any]:
        """Fetch profile summary + weak topics for prompt injection."""
        weak_topics: list[str] = []
        profile_summary = ""

        if self._pg:
            weak_topics = await self._pg.get_weak_topics(user_id)
            profile_summary = await self._pg.get_profile_summary(user_id)

        if self._settings.mem0_api_key:
            mem0_facts = await self._fetch_mem0_memories(user_id)
            if mem0_facts and not profile_summary:
                profile_summary = "; ".join(mem0_facts[:5])

        return {
            "user_profile_summary": profile_summary,
            "weak_topics": weak_topics,
        }

    async def persist_insights(
        self,
        user_id: str,
        session_id: str,
        insights: list[str],
        metadata: dict[str, Any] | None = None,
    ) -> None:
        if not insights:
            return

        if self._settings.mem0_api_key:
            await self._write_mem0(user_id, insights, metadata)

        if self._pg:
            await self._pg.save_insights(user_id, session_id, insights, metadata)

        logger.info(
            "Persisted %d insights for user=%s session=%s",
            len(insights),
            user_id,
            session_id,
        )

    @staticmethod
    def _mem0_memory_items(data: Any) -> list[dict[str, Any]]:
        """Normalize Mem0 list responses (v1.0 list vs v1.1+ `{results: [...]}`)."""
        if isinstance(data, list):
            return [m for m in data if isinstance(m, dict)]
        if isinstance(data, dict):
            results = data.get("results")
            if isinstance(results, list):
                return [m for m in results if isinstance(m, dict)]
        return []

    @staticmethod
    def _mem0_memory_text(item: dict[str, Any]) -> str | None:
        text = item.get("memory")
        if isinstance(text, str) and text.strip():
            return text.strip()
        nested = item.get("data")
        if isinstance(nested, dict):
            text = nested.get("memory")
            if isinstance(text, str) and text.strip():
                return text.strip()
        return None

    async def _fetch_mem0_memories(self, user_id: str) -> list[str]:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    f"{self.MEM0_BASE_URL}/memories/",
                    headers={"Authorization": f"Token {self._settings.mem0_api_key}"},
                    params={"user_id": self._mem0_user_id(user_id)},
                )
                resp.raise_for_status()
                data = resp.json()
                out: list[str] = []
                for item in self._mem0_memory_items(data):
                    text = self._mem0_memory_text(item)
                    if text:
                        out.append(text)
                return out
        except Exception:
            logger.warning("Mem0 fetch failed for user %s", user_id, exc_info=True)
            return []

    async def _write_mem0(
        self,
        user_id: str,
        insights: list[str],
        metadata: dict[str, Any] | None,
    ) -> None:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                for insight in insights:
                    await client.post(
                        f"{self.MEM0_BASE_URL}/memories/",
                        headers={"Authorization": f"Token {self._settings.mem0_api_key}"},
                        json={
                            "messages": [{"role": "user", "content": insight}],
                            "user_id": self._mem0_user_id(user_id),
                            "metadata": metadata or {},
                        },
                    )
        except Exception:
            logger.warning("Mem0 write failed for user %s", user_id, exc_info=True)
