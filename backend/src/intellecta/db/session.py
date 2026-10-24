"""Async SQLAlchemy session factory."""

from __future__ import annotations

from collections.abc import AsyncGenerator
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from intellecta.config import get_settings


def _prepare_asyncpg_url(database_url: str) -> tuple[str, dict]:
    """
    asyncpg does not accept libpq-style `sslmode` query params.

    Strip sslmode from the URL and pass SSL via connect_args instead (Neon requires SSL).
    """
    parsed = urlparse(database_url)
    scheme = parsed.scheme
    if scheme in ("postgresql", "postgres"):
        scheme = "postgresql+asyncpg"

    query = parse_qs(parsed.query)
    connect_args: dict = {}

    sslmode = query.pop("sslmode", [None])[0]
    query.pop("channel_binding", None)

    if sslmode in ("require", "verify-ca", "verify-full", "prefer"):
        connect_args["ssl"] = True
    elif parsed.hostname and (".neon.tech" in parsed.hostname or ".pooler.neon.tech" in parsed.hostname):
        connect_args["ssl"] = True

    clean_query = urlencode({k: v[0] for k, v in query.items() if v})
    clean_url = urlunparse(parsed._replace(scheme=scheme, query=clean_query))
    return clean_url, connect_args


_settings = get_settings()
_db_url, _connect_args = _prepare_asyncpg_url(_settings.database_url)

engine = create_async_engine(
    _db_url,
    echo=False,
    pool_pre_ping=True,
    connect_args=_connect_args,
)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
