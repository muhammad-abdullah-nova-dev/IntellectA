# Member 3062 - Module 1: login tokens and users (auth/jwt.py, db/repository/users.py)
# Test IDs match notes/3062_module1_auth_notes.md
# The database is faked with a mock session, so no real database is needed.

import time
import uuid
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock

import jwt
import pytest
from werkzeug.security import check_password_hash, generate_password_hash

from intellecta.auth.jwt import create_access_token, decode_access_token
from intellecta.config import Settings
from intellecta.db.models import User
from intellecta.db.repository.users import (
    create_user_with_password,
    user_to_dict,
    verify_user_password,
)

pytestmark = [pytest.mark.auth, pytest.mark.regression, pytest.mark.order(2)]

SECRET = "my-test-secret-" + "x" * 60


def use_settings(monkeypatch, secret=SECRET, days=7):
    # make jwt.py use our own secret and token lifetime
    fake = Settings(_env_file=None, jwt_secret_key=secret, jwt_expire_days=days)
    monkeypatch.setattr("intellecta.auth.jwt.get_settings", lambda: fake)


@pytest.fixture(autouse=True)
def default_settings(monkeypatch):
    use_settings(monkeypatch)


def make_fake_session(existing_user=None):
    # the query result gives back existing_user (or None if nobody is found)
    result = MagicMock()
    result.scalar_one_or_none.return_value = existing_user
    session = AsyncMock()
    session.execute.return_value = result
    session.add = MagicMock()
    return session


def make_token(data, secret=SECRET, algorithm="HS256"):
    return jwt.encode(data, secret, algorithm=algorithm)


def seconds_from_now(seconds):
    return datetime.now(timezone.utc) + timedelta(seconds=seconds)


def break_signature(token):
    # change the last 4 characters so the signature no longer matches
    new_end = "AAAA"
    if token.endswith("AAAA"):
        new_end = "BBBB"
    return token[:-4] + new_end


def user_with_password(password="Secret12"):
    return User(email="a@b.com", password_hash=generate_password_hash(password))


# --- create_access_token ---

@pytest.mark.smoke
@pytest.mark.order(1)
def test_token_has_three_parts():
    """3062-AUTH-CREATE-01"""
    token = create_access_token("u-1", "a@b.com")
    assert isinstance(token, str)
    assert token.count(".") == 2


def test_token_has_the_expected_claims():
    """3062-AUTH-CREATE-02"""
    data = decode_access_token(create_access_token("u-1", "a@b.com"))
    assert "sub" in data
    assert "email" in data
    assert "exp" in data
    assert "iat" in data


def test_uuid_user_id_is_saved_as_text():
    """3062-AUTH-CREATE-03"""
    user_id = uuid.uuid4()
    data = decode_access_token(create_access_token(user_id, "a@b.com"))
    assert data["sub"] == str(user_id)


@pytest.mark.parametrize("days", [1, 7])
def test_token_lifetime_follows_setting(monkeypatch, days):
    """3062-AUTH-CREATE-04 and 05"""
    use_settings(monkeypatch, days=days)
    data = decode_access_token(create_access_token("u-1", "a@b.com"))
    assert data["exp"] - data["iat"] == days * 86400


def test_negative_lifetime_gives_expired_token(monkeypatch):
    """3062-AUTH-CREATE-06"""
    use_settings(monkeypatch, days=-1)
    token = create_access_token("u-1", "a@b.com")
    assert decode_access_token(token) is None


def test_empty_id_and_email_still_make_a_token():
    """3062-AUTH-CREATE-07"""
    token = create_access_token("", "")
    data = decode_access_token(token)
    assert data["sub"] == ""
    assert data["email"] == ""


# --- decode_access_token ---

@pytest.mark.smoke
@pytest.mark.order(1)
def test_decode_valid_token():
    """3062-AUTH-DECODE-01"""
    data = decode_access_token(create_access_token("u-1", "a@b.com"))
    assert data["sub"] == "u-1"
    assert data["email"] == "a@b.com"


def test_decode_rejects_changed_signature():
    """3062-AUTH-DECODE-02"""
    token = create_access_token("u-1", "a@b.com")
    assert decode_access_token(break_signature(token)) is None


def test_decode_rejects_token_from_another_secret():
    """3062-AUTH-DECODE-03"""
    other = make_token({"sub": "u-1", "exp": seconds_from_now(60)}, secret="other-" + "y" * 60)
    assert decode_access_token(other) is None


def test_decode_rejects_token_expired_one_second_ago():
    """3062-AUTH-DECODE-04"""
    token = make_token({"sub": "u-1", "exp": seconds_from_now(-1)})
    assert decode_access_token(token) is None


def test_decode_accepts_token_valid_for_60_more_seconds():
    """3062-AUTH-DECODE-05"""
    token = make_token({"sub": "u-1", "exp": seconds_from_now(60)})
    assert decode_access_token(token) is not None


def test_decode_empty_string():
    """3062-AUTH-DECODE-06"""
    assert decode_access_token("") is None


def test_decode_text_that_is_not_a_token():
    """3062-AUTH-DECODE-07"""
    assert decode_access_token("not-a-jwt") is None


def test_decode_rejects_other_algorithm():
    """3062-AUTH-DECODE-08"""
    token = make_token({"sub": "u-1", "exp": seconds_from_now(60)}, algorithm="HS512")
    assert decode_access_token(token) is None


def test_decode_token_without_exp_is_accepted():
    """3062-AUTH-DECODE-09"""
    token = make_token({"sub": "u-1"})
    assert decode_access_token(token)["sub"] == "u-1"


# --- create_user_with_password ---

@pytest.mark.smoke
@pytest.mark.order(1)
async def test_new_user_is_added_and_flushed():
    """3062-AUTH-REG-01"""
    session = make_fake_session(existing_user=None)
    user = await create_user_with_password(session, email="a@b.com", password="Secret12", name="A")
    assert isinstance(user, User)
    session.add.assert_called_once_with(user)
    session.flush.assert_awaited_once()


async def test_email_is_trimmed_and_lowercase():
    """3062-AUTH-REG-02"""
    user = await create_user_with_password(make_fake_session(), email="  ALEX@Test.COM ", password="Secret12")
    assert user.email == "alex@test.com"


async def test_duplicate_email_is_rejected():
    """3062-AUTH-REG-03"""
    session = make_fake_session(existing_user=User(email="a@b.com"))
    with pytest.raises(ValueError, match="Email already registered"):
        await create_user_with_password(session, email="a@b.com", password="Secret12")
    session.add.assert_not_called()


async def test_password_is_saved_as_hash():
    """3062-AUTH-REG-04"""
    user = await create_user_with_password(make_fake_session(), email="a@b.com", password="Secret12")
    assert user.password_hash != "Secret12"
    assert check_password_hash(user.password_hash, "Secret12")


async def test_name_is_trimmed():
    """3062-AUTH-REG-05"""
    user = await create_user_with_password(
        make_fake_session(), email="a@b.com", password="Secret12", name="  Alex  "
    )
    assert user.name == "Alex"


@pytest.mark.parametrize("name", ["", "   "])
async def test_blank_name_becomes_none(name):
    """3062-AUTH-REG-06"""
    user = await create_user_with_password(make_fake_session(), email="a@b.com", password="Secret12", name=name)
    assert user.name is None


@pytest.mark.parametrize("password", ["", "a", "p" * 1000])
async def test_password_of_any_length_is_hashed(password):
    """3062-AUTH-REG-07"""
    user = await create_user_with_password(make_fake_session(), email="a@b.com", password=password)
    assert check_password_hash(user.password_hash, password)


# --- verify_user_password ---

@pytest.mark.smoke
@pytest.mark.order(1)
async def test_verify_correct_password():
    """3062-AUTH-VERIFY-01"""
    user = user_with_password()
    result = await verify_user_password(make_fake_session(user), "a@b.com", "Secret12")
    assert result is user


async def test_verify_wrong_password():
    """3062-AUTH-VERIFY-02"""
    result = await verify_user_password(make_fake_session(user_with_password()), "a@b.com", "Wrong999")
    assert result is None


async def test_verify_unknown_user():
    """3062-AUTH-VERIFY-03"""
    result = await verify_user_password(make_fake_session(None), "nobody@b.com", "Secret12")
    assert result is None


async def test_verify_google_user_without_password():
    """3062-AUTH-VERIFY-04"""
    google_user = User(email="g@b.com", password_hash=None, google_id="g-1")
    result = await verify_user_password(make_fake_session(google_user), "g@b.com", "Secret12")
    assert result is None


async def test_verify_empty_password():
    """3062-AUTH-VERIFY-05"""
    result = await verify_user_password(make_fake_session(user_with_password()), "a@b.com", "")
    assert result is None


async def test_verify_password_is_case_sensitive():
    """3062-AUTH-VERIFY-06"""
    result = await verify_user_password(make_fake_session(user_with_password()), "a@b.com", "secret12")
    assert result is None


async def test_verify_password_with_leading_space():
    """3062-AUTH-VERIFY-07"""
    result = await verify_user_password(make_fake_session(user_with_password()), "a@b.com", " Secret12")
    assert result is None


# --- whole module: token states and account states ---

def test_state_new_token_is_valid():
    """3062-AUTH-MOD-01  NOT_ISSUED -> VALID"""
    token = create_access_token("u-1", "a@b.com")
    assert decode_access_token(token)["sub"] == "u-1"


@pytest.mark.slow
@pytest.mark.order(6)
def test_state_token_expires_after_time_passes():
    """3062-AUTH-MOD-02  VALID -> EXPIRED (waits 3 seconds on purpose)"""
    token = make_token({"sub": "u-1", "exp": seconds_from_now(2)})
    assert decode_access_token(token) is not None
    time.sleep(3)
    assert decode_access_token(token) is None


def test_state_token_becomes_invalid_when_changed():
    """3062-AUTH-MOD-03  VALID -> INVALID"""
    token = create_access_token("u-1", "a@b.com")
    assert decode_access_token(token) is not None
    assert decode_access_token(break_signature(token)) is None


async def test_state_registered_user_can_log_in():
    """3062-AUTH-MOD-04  UNREGISTERED -> REGISTERED"""
    new_user = await create_user_with_password(make_fake_session(), email="a@b.com", password="Secret12")
    result = await verify_user_password(make_fake_session(new_user), "a@b.com", "Secret12")
    assert result is new_user


async def test_state_second_signup_is_rejected():
    """3062-AUTH-MOD-05  REGISTERED -> REJECTED on second sign up"""
    first = await create_user_with_password(make_fake_session(), email="a@b.com", password="Secret12")
    with pytest.raises(ValueError):
        await create_user_with_password(make_fake_session(first), email="a@b.com", password="Other123")


def test_user_id_goes_into_token():
    """3062-AUTH-MOD-06  user id goes into the token"""
    user = User(id=uuid.uuid4(), email="a@b.com", name=None)
    info = user_to_dict(user)
    data = decode_access_token(create_access_token(info["id"], info["email"]))
    assert data["sub"] == str(user.id)
    assert info["name"] == ""
