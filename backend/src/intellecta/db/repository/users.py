"""User persistence — email/password and Google OAuth."""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from werkzeug.security import check_password_hash, generate_password_hash

from intellecta.db.models import User


async def get_user_by_id(session: AsyncSession, user_id: str | uuid.UUID) -> User | None:
    uid = uuid.UUID(str(user_id))
    result = await session.execute(select(User).where(User.id == uid))
    return result.scalar_one_or_none()


async def get_user_by_email(session: AsyncSession, email: str) -> User | None:
    result = await session.execute(select(User).where(User.email == email.lower().strip()))
    return result.scalar_one_or_none()


async def get_user_by_google_id(session: AsyncSession, google_id: str) -> User | None:
    result = await session.execute(select(User).where(User.google_id == google_id))
    return result.scalar_one_or_none()


async def create_user_with_password(
    session: AsyncSession,
    *,
    email: str,
    password: str,
    name: str = "",
) -> User:
    email_norm = email.lower().strip()
    existing = await get_user_by_email(session, email_norm)
    if existing:
        raise ValueError("Email already registered")

    user = User(
        email=email_norm,
        password_hash=generate_password_hash(password),
        name=name.strip() or None,
    )
    session.add(user)
    await session.flush()
    return user


async def verify_user_password(
    session: AsyncSession,
    email: str,
    password: str,
) -> User | None:
    user = await get_user_by_email(session, email)
    if not user or not user.password_hash:
        return None
    if not check_password_hash(user.password_hash, password):
        return None
    return user


async def get_or_create_google_user(
    session: AsyncSession,
    *,
    google_id: str,
    email: str,
    name: str | None,
    avatar_url: str | None,
) -> User:
    email_norm = email.lower().strip()

    user = await get_user_by_google_id(session, google_id)
    if user:
        if name and not user.name:
            user.name = name
        if avatar_url:
            user.avatar_url = avatar_url
        return user

    user = await get_user_by_email(session, email_norm)
    if user:
        user.google_id = google_id
        if name and not user.name:
            user.name = name
        if avatar_url:
            user.avatar_url = avatar_url
        return user

    user = User(
        email=email_norm,
        google_id=google_id,
        name=name,
        avatar_url=avatar_url,
        password_hash=None,
    )
    session.add(user)
    await session.flush()
    return user


def user_to_dict(user: User) -> dict:
    return {
        "id": str(user.id),
        "email": user.email,
        "name": user.name or "",
        "avatar_url": user.avatar_url,
    }
