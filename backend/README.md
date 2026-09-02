# IntellectA v2 Backend

Agentic AI tutor powered by **LangGraph**, **PostgreSQL + pgvector**, and hybrid memory (Redis + Mem0).

## Quick Start

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # set GROQ_API_KEY

# Run API (from backend with PYTHONPATH)
export PYTHONPATH=src
uvicorn intellecta.main:app --reload --port 8000
```

Health check: `GET http://127.0.0.1:8000/api/v2/health`

### RAG setup (required once)

```bash
# If you already applied schema.sql with vector(1536), run migration first:
psql $DATABASE_URL -f src/intellecta/db/migrations/002_embedding_384.sql

# Seed 32 curriculum chunks (8 subjects × 4 concepts) with embeddings:
pip install fastembed
export PYTHONPATH=src
python -m intellecta.scripts.seed_rag
```

Chat: `POST http://127.0.0.1:8000/api/v2/chat`

```json
{
  "message": "Explain AVL tree left rotation",
  "user_id": "user-123"
}
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full HLD.

## Database

Apply schema:

```bash
psql $DATABASE_URL -f src/intellecta/db/schema.sql
```
