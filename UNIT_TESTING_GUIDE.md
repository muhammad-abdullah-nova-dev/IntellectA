# IntellectA — Comprehensive Unit Testing Architecture & Execution Guide

This document establishes the official unit testing framework, module partitioning, and test implementations for **IntellectA**.

---

## 🏛️ System Architecture & Test Allocation

The system is decomposed into **6 conceptual modules**, evenly divided between **Member 1** and **Member 2** (3 modules each). Each member is responsible for authoring, mocking, and maintaining the unit tests for their designated domain.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             IntellectA System Core                               │
└────────────────────────┬─────────────────────────────────┬───────────────────────┘
                         │                                 │
            ┌────────────┴────────────┐       ┌────────────┴────────────┐
            │   Member 1: Core AI &   │       │ Member 2: Pedagogical,  │
            │     Security Layer      │       │ Persistence & Frontend  │
            └────────────┬────────────┘       └────────────┬────────────┘
                         │                                 │
           ┌─────────────┼─────────────┐     ┌─────────────┼─────────────┐
           ▼             ▼             ▼     ▼             ▼             ▼
       [Module 1]    [Module 2]    [Module 3]  [Module 4]    [Module 5]    [Module 6]
         Auth &      Multi-Agent     RAG &     Adaptive        Memory      Frontend
        Security       Router      Embeddings Assessment     Subsystem   Math / Utils
```

### Module Assignment Breakdown

| Assigned To | Module # | Conceptual Domain | Files Under Test | Testing Technologies |
| :--- | :--- | :--- | :--- | :--- |
| **Member 1** | **Module 1** | Authentication, Security & User Repo | `jwt.py`, `deps.py`, `google.py`, `users.py`, `auth.py` | `pytest`, `pytest-asyncio`, `pytest-mock`, `PyJWT`, `werkzeug` |
| **Member 1** | **Module 2** | Multi-Agent Orchestration & Scope Guard | `router.py`, `scope_guard.py`, `subject_agent.py`, `subjects.py`, `state.py`, `builder.py` | `pytest`, `pytest-mock`, `langgraph`, `langchain-core` |
| **Member 1** | **Module 3** | Knowledge Retrieval & Vector Search (RAG) | `embeddings.py`, `vector_store.py`, `pg_repository.py`, `seed_curriculum.py` | `pytest`, `pytest-asyncio`, `fastembed`, `numpy`, `unittest.mock` |
| **Member 2** | **Module 4** | Adaptive Assessment & Quiz Engine | `adaptive_engine.py`, `evaluator.py`, `models.py` | `pytest`, `pytest-mock`, `pydantic` |
| **Member 2** | **Module 5** | Memory & Session Persistence | `short_term.py`, `long_term.py`, `memory_writer.py`, `sessions.py`, `user_memory.py` | `pytest`, `pytest-asyncio`, `redis.asyncio`, `unittest.mock` |
| **Member 2** | **Module 6** | Frontend Presentation & Math/LaTeX Engine | `latex-sanitize.ts`, `split-math-markdown.ts`, `image-upload.ts`, `agent-badge.ts`, `api.ts`, `auth.ts` | `vitest` / `jest` / `ts-node`, `TypeScript` |

---

## 🛠️ Global Test Setup & Prerequisites

Install the test dependencies in your Python environment:

```powershell
pip install pytest pytest-asyncio pytest-mock httpx
```

Configuration file: `pytest.ini`
```ini
[pytest]
asyncio_mode = auto
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
```

---

# 👤 MEMBER 1: CORE AI, ROUTING & SECURITY DOMAIN

---

## 📦 Module 1: Authentication, Security & User Repository

### 1. Architectural Purpose
Guarantees user identity integrity, cryptographic password safety, HS256 JWT lifecycle handling, Google OAuth verification, and relational user CRUD operations.

### 2. Files Under Test
- `jwt.py`: `create_access_token()`, `decode_access_token()`
- `deps.py`: `get_current_user()`
- `google.py`: `verify_google_id_token()`
- `users.py`: `UserRepository` (User CRUD operations)
- `auth.py`: Register and Login endpoints

### 3. Key Unit Test Scenarios
1. **Password Hashing & Matching**:
   - `generate_password_hash()` produces a valid salt-hashed string.
   - `check_password_hash()` returns `True` for exact passwords, `False` for incorrect ones.
2. **JWT Lifecycle & Security**:
   - Valid payload generates a verifiable token containing `sub` and `email`.
   - Modifying token characters causes `jwt.exceptions.InvalidSignatureError`.
   - Expired tokens raise `jwt.exceptions.ExpiredSignatureError`.
3. **Repository Mocks**:
   - `create_user()` prevents duplicate email accounts.
   - `get_by_email()` returns `None` for non-existent users.

### 4. Implementation Code: `test_module1_auth.py`

```python
import pytest
import datetime
import jwt
from unittest.mock import AsyncMock, MagicMock
from werkzeug.security import generate_password_hash, check_password_hash

from intellecta.auth.jwt import create_access_token, decode_access_token
from intellecta.db.repository.users import UserRepository
from intellecta.db.models import User

# ── 1. Password Security Tests ──────────────────────────────────────────

def test_password_hashing_and_verification():
    raw_password = "StudyPassword@2026"
    hashed = generate_password_hash(raw_password)

    assert hashed != raw_password
    assert check_password_hash(hashed, raw_password) is True
    assert check_password_hash(hashed, "WrongPassword") is False


# ── 2. JWT Generation & Expiration Tests ─────────────────────────────────

def test_jwt_creation_and_successful_decoding():
    user_id = "550e8400-e29b-41d4-a716-446655440000"
    email = "student@intellecta.org"
    secret = "test_super_secret_key_32_characters_long"

    token = create_access_token(user_id=user_id, email=email, secret_key=secret, expire_days=1)
    assert isinstance(token, str)

    payload = decode_access_token(token, secret_key=secret)
    assert payload["sub"] == user_id
    assert payload["email"] == email
    assert "exp" in payload


def test_jwt_signature_tampering_rejected():
    token = create_access_token("user-1", "user@test.com", "secret-key-1", 1)
    tampered_token = token[:-4] + "fake"

    with pytest.raises(Exception):
        decode_access_token(tampered_token, secret_key="secret-key-1")


def test_jwt_expiration():
    secret = "secret-key-1"
    # Construct an explicitly expired payload
    expired_payload = {
        "sub": "user-1",
        "email": "user@test.com",
        "exp": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(seconds=10),
    }
    expired_token = jwt.encode(expired_payload, secret, algorithm="HS256")

    with pytest.raises(jwt.ExpiredSignatureError):
        decode_access_token(expired_token, secret_key=secret)


# ── 3. User Repository Async Tests ──────────────────────────────────────

@pytest.mark.asyncio
async def test_user_repository_create_and_get():
    mock_db = AsyncMock()
    repo = UserRepository()

    # Mock DB execution returning no existing user
    mock_db.execute.return_value.scalar_one_or_none.return_value = None

    user = await repo.create_user(
        db=mock_db,
        email="newstudent@intellecta.org",
        password_hash=generate_password_hash("pass123"),
        name="Alex Smith",
    )

    assert user.email == "newstudent@intellecta.org"
    assert user.name == "Alex Smith"
    mock_db.add.assert_called_once()
    mock_db.flush.assert_called_once()
```

---

## 📦 Module 2: Multi-Agent Orchestration & Routing

### 1. Architectural Purpose
Validates the LangGraph state machine, query classification (intent + academic subject), scope boundary enforcement, and specialist agent selection among 8 academic subjects.

### 2. Files Under Test
- `router.py`: `router_node()`, intent extraction
- `scope_guard.py`: `scope_guard_node()`
- `subject_agent.py`: `subject_agent_node()`
- `subjects.py`: `ALLOWED_SUBJECTS`, prompt builders
- `state.py`: `TutorState` schema definition
- `builder.py`: `TutorGraphFactory` conditional edge routing

### 3. Key Unit Test Scenarios
1. **Academic Subject Classification**:
   - Physics keywords route to `Subject.PHYSICS`.
   - Organic chemistry queries route to `Subject.CHEMISTRY`.
   - Constitutional law queries route to `Subject.POLITICS`.
2. **Intent Parsing**:
   - `"explain photosynthesis"` → `intent: "learn"`
   - `"quiz me on supply and demand"` → `intent: "quiz"`
   - `"grade my answer: $F=ma$"` → `intent: "evaluate"`
3. **Scope Guard Triggering**:
   - Non-academic queries (gaming, gossip, coding, cooking) return `intent: "out_of_scope"`.
   - Scope guard returns polite rejection containing guidance on supported subjects.

### 4. Implementation Code: `test_module2_orchestration.py`

```python
import pytest
from unittest.mock import AsyncMock, patch
from intellecta.orchestration.subjects import Subject, ALLOWED_SUBJECTS
from intellecta.orchestration.graph.nodes.scope_guard import scope_guard_node
from intellecta.orchestration.graph.nodes.router import parse_router_response

# ── 1. Subject Definitions Test ─────────────────────────────────────────

def test_allowed_subjects_count_and_slugs():
    expected = {
        "mathematics", "physics", "chemistry", "biology",
        "history", "politics", "geography", "economics"
    }
    actual = {s.value for s in ALLOWED_SUBJECTS}
    assert actual == expected
    assert len(ALLOWED_SUBJECTS) == 8


# ── 2. Router JSON Parsing Tests ─────────────────────────────────────────

def test_parse_router_response_valid_physics():
    raw_llm_json = '{"subject": "physics", "intent": "learn", "confidence": 0.98}'
    parsed = parse_router_response(raw_llm_json)

    assert parsed["subject"] == Subject.PHYSICS
    assert parsed["intent"] == "learn"


def test_parse_router_response_quiz_intent():
    raw_llm_json = '{"subject": "biology", "intent": "quiz", "confidence": 0.95}'
    parsed = parse_router_response(raw_llm_json)

    assert parsed["subject"] == Subject.BIOLOGY
    assert parsed["intent"] == "quiz"


def test_parse_router_response_out_of_scope():
    raw_llm_json = '{"subject": "none", "intent": "out_of_scope", "confidence": 0.99}'
    parsed = parse_router_response(raw_llm_json)

    assert parsed["intent"] == "out_of_scope"


# ── 3. Scope Guard Node Test ─────────────────────────────────────────────

@pytest.mark.asyncio
async def test_scope_guard_response_content():
    state = {
        "messages": [{"role": "user", "content": "How do I build a mobile game in Unity?"}],
        "intent": "out_of_scope",
        "subject": None
    }
    result = await scope_guard_node(state)

    assert "answer" in result
    assert result["agent"] == "scope_guard"
    # Ensure message politely notes supported academic subjects
    assert any(sub in result["answer"].lower() for sub in ["mathematics", "physics", "biology", "history"])
```

---

## 📦 Module 3: Knowledge Retrieval & Vector Search (RAG)

### 1. Architectural Purpose
Validates local vector embeddings (`BAAI/bge-small-en-v1.5`), similarity ranking, cosine distance calculations, and subject-scoped curriculum chunk filtering.

### 2. Files Under Test
- `embeddings.py`: `FastEmbedService.embed_text()`, `embed_batch()`
- `vector_store.py`: `VectorStore.similarity_search()`
- `pg_repository.py`: `PgVectorRepository` cosine similarity queries
- `seed_curriculum.py`: Curriculum dataset integrity

### 3. Key Unit Test Scenarios
1. **Vector Dimensions**:
   - `FastEmbedService` yields 384-dimensional floating point arrays.
   - Batch inputs preserve 1-to-1 array mappings.
2. **Top-K and Threshold Filtering**:
   - Threshold cuts off chunks with similarity scores lower than `min_similarity`.
   - Results are ordered descending by cosine similarity.
3. **Subject Isolation**:
   - When searching for a `chemistry` query, chunks from `history` are excluded.

### 4. Implementation Code: `test_module3_rag.py`

```python
import pytest
from unittest.mock import AsyncMock, MagicMock
from intellecta.retrieval.embeddings import FastEmbedService
from intellecta.retrieval.vector_store import VectorStore
from intellecta.retrieval.pg_repository import PgVectorRepository

# ── 1. Embedding Output Dimensionality Test ─────────────────────────────

def test_fastembed_dimension_is_384():
    service = FastEmbedService()
    text = "Photosynthesis converts light energy into chemical energy stored in glucose."
    embedding = service.embed_query(text)

    assert isinstance(embedding, list)
    assert len(embedding) == 384
    assert all(isinstance(val, float) for val in embedding)


def test_fastembed_batch_consistency():
    service = FastEmbedService()
    texts = ["Newton's first law", "Newton's second law", "Newton's third law"]
    embeddings = service.embed_documents(texts)

    assert len(embeddings) == 3
    for emb in embeddings:
        assert len(emb) == 384


# ── 2. Vector Store Similarity Search Tests ──────────────────────────────

@pytest.mark.asyncio
async def test_vector_store_similarity_search_ranking():
    mock_repo = AsyncMock(spec=PgVectorRepository)
    mock_embedder = MagicMock(spec=FastEmbedService)

    mock_embedder.embed_query.return_value = [0.1] * 384
    mock_repo.search_similar.return_value = [
        {"content": "Thermodynamics first law", "similarity": 0.94, "concept_slug": "thermo_1"},
        {"content": "Thermodynamics second law", "similarity": 0.88, "concept_slug": "thermo_2"},
        {"content": "Irrelevant noise", "similarity": 0.30, "concept_slug": "noise"},
    ]

    store = VectorStore(repository=mock_repo, embedder=mock_embedder)
    results = await store.search(query="conservation of energy", subject="physics", top_k=2, min_similarity=0.7)

    assert len(results) == 2
    assert results[0]["concept_slug"] == "thermo_1"
    assert results[1]["concept_slug"] == "thermo_2"
    assert results[0]["similarity"] >= results[1]["similarity"]
```

---

# 👤 MEMBER 2: PEDAGOGICAL, PERSISTENCE & FRONTEND DOMAIN

---

## 📦 Module 4: Adaptive Assessment & Quiz Engine

### 1. Architectural Purpose
Validates the adaptive learning algorithm (1.0 to 5.0 difficulty progression), scoring metrics, misconception identification, and concept mastery tracking.

### 2. Files Under Test
- `adaptive_engine.py`: `compute_next_difficulty()`, `update_mastery()`
- `evaluator.py`: Answer grading, rubric evaluation & feedback generation
- `models.py`: `QuizResult`, `ConceptMastery` schemas

### 3. Key Unit Test Scenarios
1. **Adaptive Difficulty Step Logic**:
   - Score $\ge 0.85$ (Excellent): Difficulty increases by step ($+0.5$).
   - Score $0.50 - 0.84$ (Moderate): Difficulty maintains or slight adjustment ($+0.1$).
   - Score $< 0.50$ (Poor): Difficulty decreases ($-0.4$).
2. **Boundary Constraints**:
   - Difficulty must never exceed `5.0`.
   - Difficulty must never fall below `1.0`.
3. **Mastery Score Calculation**:
   - Mastery is bounded between `0.0` and `1.0`.
   - Successive correct answers increase mastery asymptotically.

### 4. Implementation Code: `test_module4_adaptive.py`

```python
import pytest
from intellecta.assessment.adaptive_engine import AdaptiveAssessmentEngine

@pytest.fixture
def engine():
    return AdaptiveAssessmentEngine()


# ── 1. Difficulty Progression Tests ─────────────────────────────────────

def test_difficulty_increases_on_high_score(engine):
    current_difficulty = 2.5
    high_score = 0.95  # 95%
    next_diff = engine.compute_next_difficulty(current_difficulty=current_difficulty, score=high_score)

    assert next_diff > current_difficulty
    assert next_diff == pytest.approx(3.0, 0.1)


def test_difficulty_decreases_on_failure(engine):
    current_difficulty = 3.0
    low_score = 0.20  # 20%
    next_diff = engine.compute_next_difficulty(current_difficulty=current_difficulty, score=low_score)

    assert next_diff < current_difficulty
    assert next_diff == pytest.approx(2.5, 0.1)


def test_difficulty_upper_bound_clamped(engine):
    max_difficulty = 4.9
    high_score = 1.0
    next_diff = engine.compute_next_difficulty(current_difficulty=max_difficulty, score=high_score)

    assert next_diff <= 5.0


def test_difficulty_lower_bound_clamped(engine):
    min_difficulty = 1.2
    low_score = 0.0
    next_diff = engine.compute_next_difficulty(current_difficulty=min_difficulty, score=low_score)

    assert next_diff >= 1.0


# ── 2. Concept Mastery Updates ──────────────────────────────────────────

def test_concept_mastery_asymptotic_growth(engine):
    initial_mastery = 0.5
    updated_mastery = engine.update_mastery(current_mastery=initial_mastery, score=0.9, attempts=1)

    assert updated_mastery > initial_mastery
    assert 0.0 <= updated_mastery <= 1.0
```

---

## 📦 Module 5: Memory & Session Persistence Subsystem

### 1. Architectural Purpose
Validates the short-term Redis cache (turn management, session state, 24h TTL) and long-term PostgreSQL relational persistence (sessions, messages, concept mastery).

### 2. Files Under Test
- `short_term.py`: `ShortTermMemory.append_message()`, `get_messages()`, `set_quiz_state()`
- `long_term.py`: `LongTermMemory.record_turn()`, `get_user_context()`
- `memory_writer.py`: `memory_writer_node()`
- `sessions.py`: `SessionRepository` (Session CRUD, message logging)
- `user_memory.py`: `UserMemoryRepository`

### 3. Key Unit Test Scenarios
1. **Redis FIFO Message Sliding Window**:
   - Appending messages pushes to Redis list with specified TTL.
   - `get_messages(limit=20)` correctly returns the last 20 messages in order.
2. **Quiz State Lifecycle**:
   - Setting active quiz serializes payload as JSON.
   - Clearing quiz sets state to `None` and deletes key.
3. **Database Repository Operations**:
   - Creating a session associates it with `user_id`.
   - Listing messages for a session sorts chronologically.

### 4. Implementation Code: `test_module5_memory.py`

```python
import pytest
import json
from unittest.mock import AsyncMock
from intellecta.memory.short_term import ShortTermMemory

@pytest.mark.asyncio
async def test_short_term_memory_append_and_retrieve():
    mock_redis = AsyncMock()
    memory = ShortTermMemory(redis_client=mock_redis)

    session_id = "test-session-uuid"
    role = "user"
    content = "Explain Avogadro's constant"

    await memory.append_message(session_id, role, content)

    # Verify RPUSH was called with JSON payload
    mock_redis.rpush.assert_called_once()
    called_key, called_payload = mock_redis.rpush.call_args[0]
    assert called_key == f"session:{session_id}:messages"
    assert json.loads(called_payload) == {"role": role, "content": content}

    # Verify TTL expiration set
    mock_redis.expire.assert_called_once()


@pytest.mark.asyncio
async def test_quiz_state_save_and_clear():
    mock_redis = AsyncMock()
    memory = ShortTermMemory(redis_client=mock_redis)
    session_id = "quiz-session-123"

    quiz_payload = {"question": "What is 2+2?", "difficulty": 1.0}
    await memory.set_quiz_state(session_id, quiz_payload)

    mock_redis.set.assert_called_once()
    assert json.loads(mock_redis.set.call_args[0][1]) == quiz_payload

    # Test clearing
    mock_redis.reset_mock()
    await memory.set_quiz_state(session_id, None)
    mock_redis.delete.assert_called_once_with(f"session:{session_id}:quiz")
```

---

## 📦 Module 6: Frontend Client & Math/LaTeX Engine

### 1. Architectural Purpose
Validates client-side data parsing, chemical equation formatting (mhchem), LaTeX math formula sanitization, image file constraints, and API client request interceptors.

### 2. Files Under Test
- `latex-sanitize.ts`: Normalizing display and inline math delimiters
- `split-math-markdown.ts`: Splitting markdown text from equation blocks
- `image-upload.ts`: File size and MIME type validation
- `agent-badge.ts`: Subject badge metadata and color palettes
- `api.ts`: API request wrapper and error handling
- `auth.ts`: Token storage and header injection

### 3. Key Unit Test Scenarios
1. **Math & Delimiter Sanitization**:
   - Converts display math `\[ ... \]` to standard `$$ ... $$`.
   - Converts inline math `\( ... \)` to `$ ... $`.
   - Protects underscores inside math expressions from being mangled as markdown italics.
2. **Image Upload Restrictions**:
   - Rejects files $> 4\text{ MB}$.
   - Rejects unsupported MIME types (e.g. `.pdf`, `.exe`).
   - Accepts `.jpg`, `.png`, and `.webp`.
3. **Subject Badge Utility**:
   - Returns correct title and color for all 8 subjects.

### 4. Implementation Code: `test_module6_utils.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { sanitizeLatex } from "../utils/latex-sanitize";
import { getSubjectBadgeConfig } from "../utils/agent-badge";

describe("Module 6: Frontend Math & Sanitization Utilities", () => {
  it("normalizes display brackets to double dollar signs", () => {
    const raw = "The equation is \\[ E = mc^2 \\]";
    const sanitized = sanitizeLatex(raw);
    expect(sanitized).toContain("$$ E = mc^2 $$");
  });

  it("normalizes inline parentheses to single dollar signs", () => {
    const raw = "Where \\( a^2 + b^2 = c^2 \\) is Pythagorean theorem.";
    const sanitized = sanitizeLatex(raw);
    expect(sanitized).toContain("$ a^2 + b^2 = c^2 $");
  });

  it("prevents markdown italics from breaking math underscores", () => {
    const raw = "$ F_{\\text{net}} = m \\cdot a $";
    const sanitized = sanitizeLatex(raw);
    expect(sanitized).toBeDefined();
    expect(sanitized).toContain("F_{\\text{net}}");
  });

  it("maps subject slugs to correct badge metadata", () => {
    const physicsBadge = getSubjectBadgeConfig("physics");
    expect(physicsBadge.label).toBe("Physics");
    expect(physicsBadge.color).toBeDefined();

    const mathBadge = getSubjectBadgeConfig("mathematics");
    expect(mathBadge.label).toBe("Mathematics");
  });
});
```

---

## 🚀 How to Execute the Unit Tests

### Running Member 1 Tests
```powershell
pytest test_module1_auth.py -v
pytest test_module2_orchestration.py -v
pytest test_module3_rag.py -v
```

### Running Member 2 Tests
```powershell
pytest test_module4_adaptive.py -v
pytest test_module5_memory.py -v
npm test test_module6_utils.test.ts
```

### Running Complete Suite with Coverage
```powershell
pytest --cov=src/intellecta -v
```
