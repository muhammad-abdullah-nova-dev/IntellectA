"""
Short-term session memory backed by Redis.

Stores conversation turns, active quiz state, and caches LangGraph checkpoints.
"""

from __future__ import annotations

import json
from typing import Any, Union

import redis.asyncio as aioredis

from intellecta.config import Settings, get_settings


class ShortTermMemory:
    """Redis-backed session store with TTL."""

    def __init__(
        self,
        redis_client: Union[aioredis.Redis, Any],
        settings: Settings | None = None,
    ) -> None:
        self._redis = redis_client
        self._settings = settings or get_settings()
        self._ttl = self._settings.session_ttl_seconds

    def _session_key(self, session_id: str) -> str:
        return f"session:{session_id}"

    def _messages_key(self, session_id: str) -> str:
        return f"session:{session_id}:messages"

    def _quiz_key(self, session_id: str) -> str:
        return f"session:{session_id}:quiz"

    async def append_message(
        self,
        session_id: str,
        role: str,
        content: str,
    ) -> None:
        payload = json.dumps({"role": role, "content": content})
        key = self._messages_key(session_id)
        await self._redis.rpush(key, payload)
        await self._redis.expire(key, self._ttl)

    async def get_messages(self, session_id: str, limit: int = 20) -> list[dict[str, str]]:
        key = self._messages_key(session_id)
        raw = await self._redis.lrange(key, -limit, -1)
        return [json.loads(m) for m in raw]

    async def replace_messages(
        self, session_id: str, messages: list[dict[str, str]]
    ) -> None:
        """Replace cached transcript (e.g. warm from Neon)."""
        key = self._messages_key(session_id)
        await self._redis.delete(key)
        if not messages:
            return
        payloads = [json.dumps({"role": m["role"], "content": m["content"]}) for m in messages]
        await self._redis.rpush(key, *payloads)
        await self._redis.expire(key, self._ttl)

    async def set_quiz_state(self, session_id: str, quiz: dict[str, Any] | None) -> None:
        key = self._quiz_key(session_id)
        if quiz is None:
            await self._redis.delete(key)
            return
        await self._redis.set(key, json.dumps(quiz), ex=self._ttl)

    async def get_quiz_state(self, session_id: str) -> dict[str, Any] | None:
        raw = await self._redis.get(self._quiz_key(session_id))
        return json.loads(raw) if raw else None

    async def get_session_meta(self, session_id: str) -> dict[str, Any]:
        raw = await self._redis.get(self._session_key(session_id))
        return json.loads(raw) if raw else {}

    async def set_session_meta(self, session_id: str, meta: dict[str, Any]) -> None:
        await self._redis.set(
            self._session_key(session_id),
            json.dumps(meta),
            ex=self._ttl,
        )

    async def touch(self, session_id: str) -> None:
        """Refresh TTL on all session keys."""
        for key in (
            self._session_key(session_id),
            self._messages_key(session_id),
            self._quiz_key(session_id),
        ):
            await self._redis.expire(key, self._ttl)


async def create_redis_client(settings: Settings | None = None) -> Any:
    """
    Returns a Redis client — either standard TCP (redis.asyncio) or Upstash REST.

    Priority:
      1. UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (Upstash HTTP)
      2. REDIS_URL (local Docker or rediss:// TCP)
    """
    cfg = settings or get_settings()

    if cfg.uses_upstash_rest:
        from upstash_redis.asyncio import Redis as UpstashRedis

        return UpstashRedis(
            url=cfg.upstash_redis_rest_url,
            token=cfg.upstash_redis_rest_token,
        )

    return aioredis.from_url(cfg.redis_url, decode_responses=True)
