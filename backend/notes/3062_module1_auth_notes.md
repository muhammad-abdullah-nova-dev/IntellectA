# Test Design Notes - Module 1: Authentication & User Repository

**Member:** 3062  
**Project:** IntellectA backend (Python, pytest)  
**Files under test:** `auth/jwt.py`, `db/repository/users.py`  
**Techniques:** ECP (Equivalence Class Partitioning), BVA (Boundary Value Analysis), EG (Error Guessing), SM (State Machine testing)

Behaviour taken from the source: tokens are HS256 with claims `sub`, `email`, `exp`, `iat`; lifetime is `jwt_expire_days` (default 7). `decode_access_token` never raises, it returns `None` for any `PyJWTError`. Database calls use a mocked `AsyncSession`.

Test ID format: `3062-AUTH-<FUNCTION>-<NN>` (member 3062); member 3097 uses `3097-AUTH-...` in a separate file.

---

## 1. `create_access_token(user_id, email)`

| ID | Technique | Input | Expected result |
|----|-----------|-------|-----------------|
| 3062-AUTH-CREATE-01 | ECP (valid) | `user_id="u-1"`, `email="a@b.com"` | returns `str` with 3 dot-separated parts |
| 3062-AUTH-CREATE-02 | ECP (valid) | decode the returned token | payload contains `sub`, `email`, `exp`, `iat` |
| 3062-AUTH-CREATE-03 | ECP (type) | `user_id` is a `uuid.UUID` object | `sub == str(uuid)` |
| 3062-AUTH-CREATE-04 | BVA (lifetime) | `jwt_expire_days = 1` | `exp - iat == 86400` |
| 3062-AUTH-CREATE-05 | BVA (lifetime) | `jwt_expire_days = 7` (default) | `exp - iat == 604800` |
| 3062-AUTH-CREATE-06 | BVA (lifetime) | `jwt_expire_days = -1` (just below valid) | token already expired, `decode_access_token` returns `None` |
| 3062-AUTH-CREATE-07 | EG | `user_id=""`, `email=""` | token is still created (no validation in the function) |

## 2. `decode_access_token(token)`

| ID | Technique | Input | Expected result |
|----|-----------|-------|-----------------|
| 3062-AUTH-DECODE-01 | ECP (valid) | freshly created token | dict, `sub` and `email` match |
| 3062-AUTH-DECODE-02 | ECP (invalid) | valid token with its last 4 characters replaced | `None` |
| 3062-AUTH-DECODE-03 | ECP (invalid) | token signed with a different secret | `None` |
| 3062-AUTH-DECODE-04 | BVA (expiry) | `exp = now - 1 second` | `None` |
| 3062-AUTH-DECODE-05 | BVA (expiry) | `exp = now + 60 seconds` | dict |
| 3062-AUTH-DECODE-06 | EG | empty string `""` | `None` |
| 3062-AUTH-DECODE-07 | EG | text that is not a JWT: `"not-a-jwt"` | `None` |
| 3062-AUTH-DECODE-08 | ECP (invalid) | correct secret but algorithm HS512 | `None` (only HS256 is accepted) |
| 3062-AUTH-DECODE-09 | EG | valid signature but no `exp` claim | dict (expiry is not required by the code) |

## 3. `create_user_with_password(session, *, email, password, name="")`

| ID | Technique | Input | Expected result |
|----|-----------|-------|-----------------|
| 3062-AUTH-REG-01 | ECP (valid) | new email, mock finds no existing user | `User` returned; `session.add` and `session.flush` each called once |
| 3062-AUTH-REG-02 | ECP (normalisation) | `"  ALEX@Test.COM "` | `user.email == "alex@test.com"` |
| 3062-AUTH-REG-03 | ECP (invalid) | mock returns an existing user | `ValueError("Email already registered")`; `add` not called |
| 3062-AUTH-REG-04 | ECP (security) | password `"Secret12"` | `password_hash != "Secret12"` and `check_password_hash` is True |
| 3062-AUTH-REG-05 | ECP (name) | `name="  Alex  "` | stored as `"Alex"` |
| 3062-AUTH-REG-06 | BVA (name) | `name=""` and `name="   "` | stored as `None` |
| 3062-AUTH-REG-07 | BVA (password length) | `""`, 1 character, 1000 characters | all are hashed without error (no length validation in the repository) |

## 4. `verify_user_password(session, email, password)`

| ID | Technique | Input | Expected result |
|----|-----------|-------|-----------------|
| 3062-AUTH-VERIFY-01 | ECP (valid) | existing user, correct password | returns the user |
| 3062-AUTH-VERIFY-02 | ECP (invalid) | existing user, wrong password | `None` |
| 3062-AUTH-VERIFY-03 | ECP (invalid) | mock finds no user | `None` |
| 3062-AUTH-VERIFY-04 | ECP (invalid) | Google-only user (`password_hash=None`) | `None` |
| 3062-AUTH-VERIFY-05 | BVA (password) | empty password `""` | `None` |
| 3062-AUTH-VERIFY-06 | ECP (case) | `"secret12"` against stored `"Secret12"` | `None` (case sensitive) |
| 3062-AUTH-VERIFY-07 | ECP (whitespace) | `" Secret12"` with a leading space | `None` |

---

## 5. Module-level tests: token lifecycle and account lifecycle (State Machine)

Token lifecycle:

```
NOT_ISSUED --create_access_token--> VALID --time passes beyond exp--> EXPIRED
                                      |
                                      +--signature altered--> INVALID
```

Account lifecycle:

```
UNREGISTERED --create_user_with_password--> REGISTERED --same email again--> REJECTED (ValueError)
```

| ID | Technique | Transition / scenario | Expected result |
|----|-----------|-----------------------|-----------------|
| 3062-AUTH-MOD-01 | SM | NOT_ISSUED -> VALID: create token, decode immediately | dict with correct `sub` |
| 3062-AUTH-MOD-02 | SM | VALID -> EXPIRED: token with `exp = now + 1 s`; decode at once, then after `sleep(2)` | dict first, `None` after the sleep |
| 3062-AUTH-MOD-03 | SM | VALID -> INVALID: alter the signature of a valid token | `None` |
| 3062-AUTH-MOD-04 | SM | UNREGISTERED -> REGISTERED: register a user, then verify with the correct password (mock returns the created user) | verify returns that user |
| 3062-AUTH-MOD-05 | SM | REGISTERED -> REJECTED: register the same email again (mock returns the existing user) | `ValueError` |
| 3062-AUTH-MOD-06 | Integration | `user_to_dict(user)["id"]` used as the token `sub` | decoded `sub` equals the user id |
