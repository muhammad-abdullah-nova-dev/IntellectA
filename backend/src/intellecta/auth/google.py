"""Verify Google ID tokens from Google Identity Services (GIS)."""

from __future__ import annotations

from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from intellecta.config import get_settings


class GoogleAuthError(Exception):
    pass


def verify_google_id_token(token: str) -> dict:
    settings = get_settings()
    if not settings.google_client_id:
        raise GoogleAuthError("GOOGLE_CLIENT_ID is not configured on the server")

    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            settings.google_client_id,
        )
    except ValueError as exc:
        raise GoogleAuthError("Invalid Google token") from exc

    if not idinfo.get("email_verified"):
        raise GoogleAuthError("Google email is not verified")

    return idinfo
