-- IntellectA v2 — Unified PostgreSQL + pgvector schema
-- Requires: PostgreSQL 16+, CREATE EXTENSION vector

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- ── Users (migrated from v1 SQLite) ──────────────────────────────────────────

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    name            VARCHAR(255),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Tutoring sessions ───────────────────────────────────────────────────────

CREATE TABLE sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(512),
    subject         VARCHAR(64),          -- math, physics, chemistry, history
    status          VARCHAR(32) NOT NULL DEFAULT 'active',
    metadata        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- ── Messages (server-side chat history) ─────────────────────────────────────

CREATE TABLE messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    role            VARCHAR(16) NOT NULL,  -- user | assistant | system
    content         TEXT NOT NULL,
    agent           VARCHAR(32),           -- professor | evaluator | router
    intent          VARCHAR(32),
    metadata        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_session_id ON messages(session_id, created_at);

-- ── Curriculum documents & chunks (RAG) ───────────────────────────────────────

CREATE TABLE documents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title           VARCHAR(512) NOT NULL,
    subject         VARCHAR(64) NOT NULL,
    source_uri      TEXT,
    metadata        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE document_chunks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id     UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    concept_slug    VARCHAR(128),          -- e.g. avl_trees.rotation.left
    chunk_index     INTEGER NOT NULL DEFAULT 0,
    metadata        JSONB NOT NULL DEFAULT '{}',
    embedding       vector(384),           -- FastEmbed BAAI/bge-small-en-v1.5
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chunks_document_id ON document_chunks(document_id);
CREATE INDEX idx_chunks_concept_slug ON document_chunks(concept_slug);
-- IVFFlat or HNSW — pick based on data volume
CREATE INDEX idx_chunks_embedding ON document_chunks
    USING hnsw (embedding vector_cosine_ops);

-- ── Concept mastery (structured long-term memory) ─────────────────────────────

CREATE TABLE concept_mastery (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    concept_slug    VARCHAR(128) NOT NULL,
    mastery_score   REAL NOT NULL DEFAULT 0.5 CHECK (mastery_score BETWEEN 0 AND 1),
    difficulty      REAL NOT NULL DEFAULT 2.5 CHECK (difficulty BETWEEN 1 AND 5),
    attempt_count   INTEGER NOT NULL DEFAULT 0,
    last_attempt_at TIMESTAMPTZ,
    metadata        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, concept_slug)
);

CREATE INDEX idx_concept_mastery_user_weak
    ON concept_mastery(user_id, mastery_score)
    WHERE mastery_score < 0.5;

-- ── Quiz / assessment results ─────────────────────────────────────────────────

CREATE TABLE quiz_results (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id              UUID REFERENCES sessions(id) ON DELETE SET NULL,
    concept_slug            VARCHAR(128) NOT NULL,
    question_text           TEXT,
    user_answer             TEXT,
    difficulty              REAL NOT NULL,
    score                   REAL NOT NULL CHECK (score BETWEEN 0 AND 1),
    is_correct              BOOLEAN NOT NULL,
    response_latency_ms     INTEGER,
    next_difficulty         REAL,
    misconceptions          JSONB NOT NULL DEFAULT '[]',
    metadata                JSONB NOT NULL DEFAULT '{}',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quiz_results_user_concept ON quiz_results(user_id, concept_slug, created_at DESC);

-- ── User insights (Mem0 mirror / audit trail) ───────────────────────────────

CREATE TABLE user_insights (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id      UUID REFERENCES sessions(id) ON DELETE SET NULL,
    insight         TEXT NOT NULL,
    source          VARCHAR(32) NOT NULL DEFAULT 'graph',  -- graph | mem0 | manual
    metadata        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_insights_user_id ON user_insights(user_id, created_at DESC);

-- ── Analytics events (optional telemetry) ───────────────────────────────────

CREATE TABLE analytics_events (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id      UUID REFERENCES sessions(id) ON DELETE SET NULL,
    event_type      VARCHAR(64) NOT NULL,
    payload         JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_type ON analytics_events(event_type, created_at DESC);
