"""Auth routes — email/password + Google OAuth 2."""

from __future__ import annotations

import re
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from intellecta.auth.deps import get_current_user
from intellecta.auth.google import GoogleAuthError, verify_google_id_token
from intellecta.auth.jwt import create_access_token
from intellecta.config import get_settings
from intellecta.db.models import User
from intellecta.db.repository.users import (
    create_user_with_password,
    get_or_create_google_user,
    user_to_dict,
    verify_user_password,
)
from intellecta.db.session import get_db

router = APIRouter(prefix="/api/v2/auth", tags=["auth"])

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class RegisterRequest(BaseModel):
    email: str
    password: str = Field(min_length=6)
    name: str = ""


class LoginRequest(BaseModel):
    email: str
    password: str


class GoogleAuthRequest(BaseModel):
    id_token: str = Field(..., min_length=10)


class AuthResponse(BaseModel):
    token: str
    user: dict


def _validate_email(email: str) -> None:
    if not EMAIL_PATTERN.match(email.strip()):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Valid email is required")


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, db: Annotated[AsyncSession, Depends(get_db)]) -> AuthResponse:
    _validate_email(body.email)
    try:
        user = await create_user_with_password(
            db, email=body.email, password=body.password, name=body.name
        )
    except ValueError as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, detail=str(exc)) from exc

    token = create_access_token(str(user.id), user.email)
    return AuthResponse(token=token, user=user_to_dict(user))


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest, db: Annotated[AsyncSession, Depends(get_db)]) -> AuthResponse:
    _validate_email(body.email)
    user = await verify_user_password(db, body.email, body.password)
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token(str(user.id), user.email)
    return AuthResponse(token=token, user=user_to_dict(user))


@router.post("/google", response_model=AuthResponse)
async def google_login(
    body: GoogleAuthRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AuthResponse:
    settings = get_settings()
    if not settings.google_client_id:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth is not configured. Set GOOGLE_CLIENT_ID in backend .env",
        )

    try:
        idinfo = verify_google_id_token(body.id_token)
    except GoogleAuthError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc

    user = await get_or_create_google_user(
        db,
        google_id=idinfo["sub"],
        email=idinfo["email"],
        name=idinfo.get("name"),
        avatar_url=idinfo.get("picture"),
    )
    token = create_access_token(str(user.id), user.email)
    return AuthResponse(token=token, user=user_to_dict(user))


@router.get("/me")
async def me(user: Annotated[User, Depends(get_current_user)]) -> dict:
    return {"user": user_to_dict(user)}


@router.get("/google/config")
async def google_config() -> dict:
    """Public config for frontend Google Sign-In button."""
    settings = get_settings()
    return {
        "enabled": bool(settings.google_client_id),
        "client_id": settings.google_client_id or None,
    }
