"""
Adaptive Assessment Engine — dynamic difficulty scaling.

Uses accuracy, partial credit scores, and response latency to adjust
per-concept difficulty on a continuous 1.0–5.0 scale.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any, Protocol

logger = logging.getLogger(__name__)

MIN_DIFFICULTY = 1.0
MAX_DIFFICULTY = 5.0
DEFAULT_DIFFICULTY = 2.5

# Thresholds (milliseconds)
FAST_RESPONSE_MS = 5_000
SLOW_RESPONSE_MS = 30_000


class AssessmentRepository(Protocol):
    async def get_concept_difficulty(self, user_id: str, concept_slug: str) -> float | None: ...

    async def set_concept_difficulty(
        self, user_id: str, concept_slug: str, difficulty: float
    ) -> None: ...

    async def insert_quiz_result(self, record: dict[str, Any]) -> None: ...


@dataclass
class DifficultyAdjustment:
    previous: float
    next: float
    delta: float
    factors: dict[str, float]


class AdaptiveAssessmentEngine:
    """
    Elo-inspired difficulty scaler.

    Rules:
      - Correct + high score  → increase difficulty
      - Incorrect / low score → decrease difficulty
      - Very fast correct answer → extra bump (question too easy)
      - Slow but correct       → smaller bump (struggled)
    """

    def __init__(self, repository: AssessmentRepository | None = None) -> None:
        self._repo = repository
        # In-memory fallback for local dev without DB
        self._local: dict[str, float] = {}

    def _cache_key(self, user_id: str, concept_slug: str) -> str:
        return f"{user_id}:{concept_slug}"

    async def get_difficulty(self, user_id: str, concept_slug: str) -> float:
        if self._repo:
            stored = await self._repo.get_concept_difficulty(user_id, concept_slug)
            if stored is not None:
                return stored

        return self._local.get(self._cache_key(user_id, concept_slug), DEFAULT_DIFFICULTY)

    def compute_next_difficulty(
        self,
        *,
        current: float,
        is_correct: bool,
        score: float,
        response_latency_ms: int,
    ) -> float:
        adjustment = self._compute_adjustment(
            current=current,
            is_correct=is_correct,
            score=score,
            response_latency_ms=response_latency_ms,
        )
        return adjustment.next

    def _compute_adjustment(
        self,
        *,
        current: float,
        is_correct: bool,
        score: float,
        response_latency_ms: int,
    ) -> DifficultyAdjustment:
        factors: dict[str, float] = {}

        if is_correct and score >= 0.7:
            base_delta = 0.2 + (score - 0.7) * 0.5  # up to ~0.35
            factors["accuracy"] = base_delta
        elif score >= 0.4:
            factors["accuracy"] = -0.1  # partial — hold steady-ish
        else:
            factors["accuracy"] = -0.5

        # Latency modulation
        if is_correct and response_latency_ms < FAST_RESPONSE_MS:
            factors["latency"] = 0.2
        elif is_correct and response_latency_ms > SLOW_RESPONSE_MS:
            factors["latency"] = -0.1
        else:
            factors["latency"] = 0.0

        total_delta = sum(factors.values())
        next_val = max(MIN_DIFFICULTY, min(MAX_DIFFICULTY, current + total_delta))

        return DifficultyAdjustment(
            previous=current,
            next=round(next_val, 2),
            delta=round(next_val - current, 2),
            factors=factors,
        )

    async def record_attempt(
        self,
        *,
        user_id: str,
        concept_slug: str,
        difficulty: float,
        score: float,
        is_correct: bool,
        response_latency_ms: int,
    ) -> DifficultyAdjustment:
        adjustment = self._compute_adjustment(
            current=difficulty,
            is_correct=is_correct,
            score=score,
            response_latency_ms=response_latency_ms,
        )

        key = self._cache_key(user_id, concept_slug)
        self._local[key] = adjustment.next

        if self._repo:
            await self._repo.set_concept_difficulty(user_id, concept_slug, adjustment.next)
            await self._repo.insert_quiz_result(
                {
                    "user_id": user_id,
                    "concept_slug": concept_slug,
                    "difficulty": difficulty,
                    "score": score,
                    "is_correct": is_correct,
                    "response_latency_ms": response_latency_ms,
                    "next_difficulty": adjustment.next,
                }
            )

        logger.debug(
            "Difficulty %s→%s for %s/%s (factors=%s)",
            adjustment.previous,
            adjustment.next,
            user_id,
            concept_slug,
            adjustment.factors,
        )
        return adjustment
