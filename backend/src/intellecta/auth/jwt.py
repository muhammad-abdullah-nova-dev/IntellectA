"""JWT helpers — compatible with v1 token format (sub = user id)."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

import jwt

from intellecta.config import get_settings


def create_access_token(user_id: str, email: str) -> str:
    settings = get_settings()
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": now + timedelta(days=settings.jwt_expire_days),
        "iat": now,
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm="HS256")


def decode_access_token(token: str) -> dict | None:
    settings = get_settings()
    try:
        return jwt.decode(token, settings.jwt_secret_key, algorithms=["HS256"])
    except jwt.PyJWTError:
        return None
