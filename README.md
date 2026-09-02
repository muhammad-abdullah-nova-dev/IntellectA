<a name="top"></a>

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&height=200&color=0:3a1c71,50:d76d77,100:ffca7b&text=IntellectA&fontColor=ffffff&fontSize=64&fontAlignY=36&desc=Your%20AI%20study%20companion%20%C2%B7%20eight%20subject%20experts%2C%20one%20chat&descSize=16&descAlignY=56&animation=fadeIn" alt="IntellectA" />

<a href="https://github.com/muhammad-abdullah-nova-dev/IntellectA">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&pause=900&color=D76D77&center=true&vCenter=true&width=640&height=45&lines=Ask+doubts+in+plain+English;Snap+a+photo+of+your+notebook+problem;Practice+with+adaptive+quizzes;Auto-routed+to+the+right+subject+expert" alt="Ask doubts in plain English - Snap a photo of your notebook problem - Practice with adaptive quizzes - Auto-routed to the right subject expert" />
</a>

<p>
  <img src="https://img.shields.io/badge/Next.js%2014-0d0d0d?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/FastAPI-3a1c71?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/LangGraph-d76d77?style=for-the-badge&logo=langchain&logoColor=white" alt="LangGraph" />
  <img src="https://img.shields.io/badge/Groq-ffca7b?style=for-the-badge&logo=lightning&logoColor=0d0d0d" alt="Groq" />
  <img src="https://img.shields.io/badge/pgvector-3a1c71?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL + pgvector" />
  <img src="https://img.shields.io/badge/Redis-d76d77?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
</p>

<p>
  <a href="#quick-start-local"><b>Quick start</b></a> ·
  <a href="#architecture"><b>Architecture</b></a> ·
  <a href="#api-reference-v2"><b>API</b></a> ·
  <a href="#deployment"><b>Deploy</b></a> ·
  <a href="https://github.com/muhammad-abdullah-nova-dev/IntellectA"><b>Repository</b></a>
</p>

</div>

**IntellectA** is an AI study companion built for students. Ask doubts in natural language, upload photos of problems from your notebook, practice with adaptive quizzes, and get step-by-step explanations — automatically routed to the right subject expert among **eight specialists**.

The current stack is **Next.js 14** (frontend) + **FastAPI + LangGraph** (`backend`), powered by **Groq**, **PostgreSQL + pgvector**, **Redis**, and optional **Mem0** long-term memory.

**Repository:** [github.com/muhammad-abdullah-nova-dev/IntellectA](https://github.com/muhammad-abdullah-nova-dev/IntellectA)

---

## Table of contents

- [What is IntellectA?](#what-is-intellecta)
- [What's new in v2](#whats-new-in-v2)
- [Features](#features)
- [Landing page](#landing-page)
- [Chat workspace](#chat-workspace)
- [Eight subject experts](#eight-subject-experts)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick start (local)](#quick-start-local)
- [Environment variables](#environment-variables)
- [Database & RAG setup](#database--rag-setup)
- [Running the app](#running-the-app)
- [Deployment](#deployment)
- [API reference (v2)](#api-reference-v2)
- [Project structure](#project-structure)
- [How the AI pipeline works](#how-the-ai-pipeline-works)
- [Data & storage](#data--storage)
- [Troubleshooting](#troubleshooting)
- [Security](#security)
- [Further reading](#further-reading)
- [Author](#author)

---

## What is IntellectA?

IntellectA helps students with:

- **Homework & doubt-solving** — type a question or upload an image
- **Exam revision** — summaries, key formulas, concept clarity
- **Practice quizzes** — say *"quiz me on [topic]"* and get adaptive questions
- **Cross-device continuity** — sign in once; chat history syncs when logged in

Unlike a generic chatbot, IntellectA is scoped to **eight academic subjects only**. Off-topic questions (coding, movies, casual chat, etc.) are politely rejected by a **scope guard**.

---

## What's new in v2

| Area | v1 (legacy Flask) | v2 (current) |
|------|-------------------|--------------|
| **Backend** | Flask + SQLite | FastAPI + LangGraph |
| **Subjects** | 4 agents (Math, Physics, Chemistry, History) | **8 specialists** (+ Biology, Politics, Geography, Economics) |
| **Routing** | Single tutor classifier | LangGraph **Router → Scope Guard → Subject Agent / Evaluator** |
| **Chat history** | Browser `localStorage` only | **PostgreSQL** (server-synced sessions) + Redis short-term cache |
| **Memory** | None | **Redis** (session context) + **Mem0** (long-term insights, optional) |
| **Curriculum** | Prompt-only | **pgvector RAG** — syllabus chunks per subject |
| **Auth** | Email/password JWT | Email/password + **Google Sign-In** (OAuth 2 id_token) |
| **Quizzes** | Basic | **Adaptive difficulty** engine (1–5 scale per concept) |
| **Landing** | Basic marketing | Polished Dockit-style page: hero, features, 3 steps, topics, testimonials, FAQ |
| **Deploy** | `gunicorn app:app` on Render | `gunicorn intellecta.main:app` with **Uvicorn workers** |

> The legacy Flask `backend/` has been removed. All API calls go to `backend` on port **8000**.

---

## Features

### For students (product)

| Feature | Description |
|---------|-------------|
| **Smart routing** | Type naturally — IntellectA picks the right subject expert automatically |
| **Eight subject experts** | Math, Physics, Chemistry, Biology, History, Politics, Geography, Economics |
| **Rich answers** | Markdown + KaTeX math; chemical equations via mhchem |
| **Image upload** | JPEG, PNG, WebP (up to ~4 MB) for diagrams and equation photos |
| **Adaptive quizzes** | Say *"quiz me on photosynthesis"* — difficulty adjusts to your answers |
| **Syllabus-smart answers** | Retrieval pulls relevant study material so answers stay exam-focused |
| **Google Sign-In** | One-click auth from header or login page |
| **Email auth** | Register / sign in with email and password |
| **Cloud chat history** | Conversations saved to PostgreSQL when logged in |
| **Cross-device sync** | Same account on laptop and phone |
| **Scope guard** | Non-academic questions are declined politely |
| **Personalization** | Remembers weak topics over time (Mem0 + concept mastery, when configured) |

### For developers (platform)

| Feature | Description |
|---------|-------------|
| **LangGraph orchestration** | Stateful multi-node graph: Router, Scope Guard, 8 subject agents, Evaluator, Memory Writer |
| **Hybrid memory** | Redis (24h TTL session cache) + Mem0 (semantic user facts) + PostgreSQL `concept_mastery` |
| **RAG pipeline** | FastEmbed `BAAI/bge-small-en-v1.5` (384-dim) + pgvector cosine search per subject |
| **Vision pipeline** | Groq vision model analyzes uploaded images before routing |
| **JWT auth** | HS256 tokens, 7-day default expiry |
| **Async SQLAlchemy** | `asyncpg` driver, Neon-compatible SSL handling |
| **Health endpoint** | Reports agent list + RAG chunk count |

---

## Landing page

The marketing site (`/`) is a dark-themed Dockit-style landing built from `frontend/components/dockit/`:

| Section | ID | What it shows |
|---------|-----|----------------|
| **Header** | — | Nav links, Google Sign-In, Get started → `/login` |
| **Hero** | — | Search bar with popular subject chips; seeds prompt to login/chat |
| **Features** | `#features` | Four cards: organized experts, fast replies, syllabus-smart, adaptive |
| **How it works** | `#how-it-works` | 3 interactive tabs: Sign in → Ask → Learn (with live previews) |
| **Subjects / Topics** | `#subjects` | Four curriculum cards (STEM, Humanities, Social Sciences, Smart Learning) |
| **Testimonials** | `#testimonials` | Dual marquee of student reviews |
| **FAQ** | `#faq` | Three categories × 5 questions: Getting Started, Features & Memory, Study Smarter |
| **CTA** | `#get-started` | Get Started + Open workspace buttons |
| **Footer** | — | Product links, subject links, GitHub, centered copyright |

**Theme:** Purple → coral → gold gradient (`#3a1c71` → `#d76d77` → `#ffca7b`) on dark background (`#0d0d0d`).

**Login page** (`/login`): Marketing on the **left**, auth card on the **right** — Google on top, then email/password tabs.

---

## Chat workspace

Route: `/chat` (requires authentication)

| Feature | Details |
|---------|---------|
| **Sidebar** | Session list, search, new chat, delete, resizable width |
| **Server sync** | Sessions loaded from `GET /api/v2/sessions`; messages from `GET /api/v2/sessions/:id/messages` |
| **Agent badges** | Shows which subject expert answered (e.g. Physics, Mathematics) |
| **Suggested prompts** | Quick-start chips for common question types |
| **Image attach** | Upload diagram/equation photos inline |
| **Regenerate / stop** | Control generation mid-stream |
| **LaTeX rendering** | KaTeX + mhchem for formulas and chemical notation |
| **Light / dark theme** | System-aware theme toggle |
| **Mobile** | Collapsible sidebar with drawer |

---

## Eight subject experts

Each subject has a dedicated LangGraph node, specialist system prompt, and RAG filter on `documents.subject`:

| Subject | Slug | Example topics |
|---------|------|----------------|
| Mathematics | `mathematics` | Algebra, calculus, geometry, statistics |
| Physics | `physics` | Mechanics, waves, relativity, optics |
| Chemistry | `chemistry` | Reactions, bonding, stoichiometry, organic |
| Biology | `biology` | Cells, genetics, ecology, physiology |
| History | `history` | Events, civilizations, timelines, cause-effect |
| Politics | `politics` | Government, constitution, political theory |
| Geography | `geography` | Climate, maps, landforms, population |
| Economics | `economics` | Micro/macro, supply-demand, markets |

**Out of scope:** coding, entertainment, sports, cooking, relationship advice, general chit-chat → Scope Guard response.

---

## Architecture

```mermaid
flowchart TB
  subgraph client [Browser]
    UI[Next.js 14 App]
    LS[(localStorage\nJWT token)]
  end

  subgraph vercel [Vercel — Frontend]
    Next[Landing · Login · Chat]
  end

  subgraph render [Render — backend]
    API[FastAPI + Gunicorn/Uvicorn]
    Graph[LangGraph State Machine]
    RAG[pgvector Retrieval]
  end

  subgraph data [Data layer]
    PG[(PostgreSQL + pgvector\nNeon)]
    Redis[(Redis / Upstash)]
    Mem0[(Mem0 Cloud\noptional)]
  end

  Groq[Groq API]

  UI --> Next
  Next -->|NEXT_PUBLIC_BACKEND_V2_URL| API
  API --> Graph
  Graph --> Groq
  Graph --> RAG
  Graph --> Redis
  Graph --> Mem0
  API --> PG
  RAG --> PG
  UI --> LS
```

### LangGraph flow (simplified)

```
User message
    │
    ▼
Router (intent + subject classification)
    │
    ├─ out of scope        → Scope Guard → polite rejection
    ├─ quiz / evaluate     → Evaluator → adaptive question/score
    └─ learn / clarify     → Subject Agent (RAG + specialist prompt)
                                    │
                                    ▼
                              Memory Writer → Redis + Mem0 + PostgreSQL
```

Full technical detail: **[backend/ARCHITECTURE.md](./backend/ARCHITECTURE.md)**

---

## Tech stack

| Layer | Technologies |
|-------|----------------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion, Radix UI, KaTeX, react-markdown, `@react-oauth/google` |
| **Backend** | FastAPI, Uvicorn, Gunicorn, Pydantic Settings, SQLAlchemy 2 (async), asyncpg |
| **Orchestration** | LangGraph, LangChain Core, LangChain Groq |
| **AI** | Groq (`llama-3.3-70b-versatile`, `llama-3.1-8b-instant` router, vision model for images) |
| **Database** | PostgreSQL 16 + **pgvector** (Neon recommended) |
| **Cache** | Redis 7 or **Upstash REST** |
| **Long-term memory** | Mem0 (optional) |
| **Embeddings** | FastEmbed `BAAI/bge-small-en-v1.5` (384-dim, local) |
| **Auth** | JWT (HS256), Google OAuth 2 id_token, bcrypt passwords |

---

## Prerequisites

| Tool | Version |
|------|---------|
| **Node.js** | 20 LTS (18+ may work) |
| **npm** | 9+ |
| **Python** | 3.11+ (3.12 recommended for Render) |
| **PostgreSQL** | 16+ with `pgvector` extension |
| **Redis** | Local Docker or Upstash account |
| **Groq API key** | [console.groq.com](https://console.groq.com) |
| **Google OAuth** (optional) | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| **Mem0 API key** (optional) | [mem0.ai](https://mem0.ai) |

---

## Quick start (local)

```bash
git clone https://github.com/muhammad-abdullah-nova-dev/IntellectA.git
cd IntellectA

# ── Backend ─────────────────────────────────────────────
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
# Create backend/.env — see Environment variables section below
export PYTHONPATH=src

# Apply DB schema (once)
psql "$DATABASE_URL" -f src/intellecta/db/schema.sql

# Seed RAG curriculum (once, optional but recommended)
python -m intellecta.scripts.seed_rag

# Start API
uvicorn intellecta.main:app --reload --port 8000

# ── Frontend (new terminal) ─────────────────────────────
cd frontend
npm install
# Create frontend/.env.local — see Environment variables section below
npm run dev
```

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://127.0.0.1:8000 |
| **Health check** | http://127.0.0.1:8000/api/v2/health |

---

## Environment variables

### Backend — `backend/.env`

Create locally. **Never commit to Git.**

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | **Yes** | Groq API key |
| `GROQ_MODEL` | No | Main tutor model (default: `llama-3.3-70b-versatile`) |
| `GROQ_ROUTER_MODEL` | No | Router/classifier (default: `llama-3.1-8b-instant`) |
| `GROQ_VISION_MODEL` | No | Image analysis model |
| `DATABASE_URL` | **Yes** | `postgresql+asyncpg://user:pass@host/db` — use `+asyncpg` scheme |
| `UPSTASH_REDIS_REST_URL` | Recommended | Upstash REST URL (Option A) |
| `UPSTASH_REDIS_REST_TOKEN` | Recommended | Upstash REST token |
| `REDIS_URL` | Alt | TCP Redis URL if not using Upstash REST |
| `SESSION_TTL_SECONDS` | No | Redis session TTL (default: `86400`) |
| `MEM0_API_KEY` | No | Mem0 long-term memory |
| `MEM0_USER_ID_PREFIX` | No | Mem0 user namespace (default: `intellecta`) |
| `JWT_SECRET_KEY` | **Yes** | Long random string (32+ chars) |
| `JWT_EXPIRE_DAYS` | No | Token lifetime (default: `7`) |
| `GOOGLE_CLIENT_ID` | For Google auth | OAuth 2 client ID |
| `GOOGLE_CLIENT_SECRET` | For Google auth | OAuth 2 client secret |
| `FRONTEND_URL` | Yes in prod | e.g. `http://localhost:3000` |
| `CORS_ORIGINS` | Yes in prod | Comma-separated allowed origins |
| `APP_ENV` | No | `development` or `production` |
| `LOG_LEVEL` | No | `INFO`, `DEBUG`, etc. |

**Example (local)**

```env
GROQ_API_KEY=gsk_...
DATABASE_URL=postgresql+asyncpg://intellecta:intellecta@localhost:5432/intellecta_v2
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
JWT_SECRET_KEY=your_long_random_secret_at_least_32_chars
GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000
APP_ENV=development
```

> **Neon tip:** If your connection string is `postgresql://...?sslmode=require`, keep it — the app strips `sslmode` and enables SSL for asyncpg automatically.

---

### Frontend — `frontend/.env.local`

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_BACKEND_V2_URL` | **Yes** | Base URL of FastAPI backend (no trailing slash) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | For Google auth | Same client ID as backend `GOOGLE_CLIENT_ID` |

**Local**

```env
NEXT_PUBLIC_BACKEND_V2_URL=http://127.0.0.1:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
```

**Production**

```env
NEXT_PUBLIC_BACKEND_V2_URL=https://your-api.onrender.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
```

> Variables prefixed with `NEXT_PUBLIC_` are embedded in the client bundle. **Never** put `GROQ_API_KEY`, `JWT_SECRET_KEY`, or database URLs here.

---

## Database & RAG setup

### 1. Apply schema

```bash
cd backend
export PYTHONPATH=src

# If using Neon, paste your connection string (postgresql+asyncpg://...)
psql "$DATABASE_URL" -f src/intellecta/db/schema.sql
```

Migrations (if upgrading):

```bash
psql "$DATABASE_URL" -f src/intellecta/db/migrations/001_oauth.sql
psql "$DATABASE_URL" -f src/intellecta/db/migrations/002_embedding_384.sql
```

### 2. Seed curriculum (RAG)

Inserts 32 built-in chunks (8 subjects × 4 concepts) with embeddings:

```bash
export PYTHONPATH=src
python -m intellecta.scripts.seed_rag
```

Verify via health endpoint — `rag.embedded_chunks` should be > 0:

```bash
curl http://127.0.0.1:8000/api/v2/health
```

---

## Running the app

### Recommended — two terminals

**Terminal 1 — Backend**

```bash
cd backend
source venv/bin/activate
export PYTHONPATH=src
uvicorn intellecta.main:app --reload --port 8000
```

**Terminal 2 — Frontend**

```bash
cd frontend
npm run dev
# or clear cache if styles/JS 404:
npm run dev:clean
```

### Useful commands

```bash
# Frontend production build
cd frontend && npm run build && npm start

# Backend health
curl http://127.0.0.1:8000/api/v2/health

# Backend tests (if added)
cd backend && pytest
```

---

## Deployment

IntellectA deploys as **two services**: backend on Render, frontend on Vercel.

### 1) Backend — Render (`backend`)

1. Push code to GitHub.
2. [Render](https://render.com) → **New Web Service** → connect repo.
3. Settings:

| Setting | Value |
|---------|--------|
| **Root Directory** | `backend` |
| **Runtime** | Python 3.12 |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `gunicorn intellecta.main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --workers 2 --timeout 120` |
| **Health Check Path** | `/api/v2/health` |

4. **Environment variables** (Render dashboard):

```
PYTHONPATH=src
APP_ENV=production
GROQ_API_KEY=...
DATABASE_URL=postgresql+asyncpg://...
JWT_SECRET_KEY=...          # use Render "Generate" or a strong secret
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FRONTEND_URL=https://your-app.vercel.app
CORS_ORIGINS=https://your-app.vercel.app
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
MEM0_API_KEY=...            # optional
```

5. **`backend/Procfile`** (auto-detected):

```
web: gunicorn intellecta.main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --workers 2 --timeout 120
```

6. Optional: use **`backend/render.yaml`** for Blueprint deploy.

7. Verify:

```bash
curl https://YOUR-API.onrender.com/api/v2/health
```

**Notes**

- Free tier sleeps after ~15 min idle; first request may take ~50s.
- Run schema + RAG seed against your **production** Neon database once after first deploy.
- `DATABASE_URL` must use `postgresql+asyncpg://` driver prefix.

---

### 2) Frontend — Vercel

1. [Vercel](https://vercel.com) → **Add Project** → same GitHub repo.
2. Settings:

| Setting | Value |
|---------|--------|
| **Root Directory** | `frontend` |
| **Framework** | Next.js |
| **Build Command** | `npm run build` (default) |

3. **Environment variables**

| Key | Value |
|-----|--------|
| `NEXT_PUBLIC_BACKEND_V2_URL` | `https://YOUR-API.onrender.com` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Your Google OAuth client ID |

4. **Google OAuth** — in Google Cloud Console, add authorized origins:
   - `https://your-app.vercel.app`
   - `http://localhost:3000` (for local dev)

5. Deploy → test: Landing → Sign in → Chat.

---

### Deployment checklist

- [ ] PostgreSQL (Neon) with pgvector — schema applied
- [ ] RAG seeded (`embedded_chunks` > 0 in health response)
- [ ] Upstash Redis REST vars set on Render
- [ ] All backend env vars set on Render
- [ ] `NEXT_PUBLIC_BACKEND_V2_URL` set on Vercel (Production + Preview)
- [ ] `CORS_ORIGINS` includes your Vercel URL
- [ ] Google OAuth origins include Vercel URL
- [ ] Health endpoint returns `"status": "ok"`
- [ ] Login (Google + email) and chat work on live site

---

## API reference (v2)

Base URL: `NEXT_PUBLIC_BACKEND_V2_URL` (e.g. `http://127.0.0.1:8000`)

### Public

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v2/health` | Health + agent list + RAG chunk count |

### Auth

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v2/auth/register` | Create account `{ email, password, name? }` |
| `POST` | `/api/v2/auth/login` | Email login `{ email, password }` |
| `POST` | `/api/v2/auth/google` | Google Sign-In `{ id_token }` |
| `GET` | `/api/v2/auth/me` | Current user (Bearer token) |

### Chat (Bearer token required)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v2/chat` | Text message `{ message, session_id? }` |
| `POST` | `/api/v2/chat/image` | Image + optional text `{ image, mimeType, text?, session_id? }` |

### Sessions (Bearer token required)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v2/sessions` | List user's chat sessions |
| `GET` | `/api/v2/sessions/{id}/messages` | Messages for a session |
| `DELETE` | `/api/v2/sessions/{id}` | Delete a session |

### Example — Register

```bash
curl -X POST http://127.0.0.1:8000/api/v2/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"secret12","name":"Student"}'
```

### Example — Chat

```bash
curl -X POST http://127.0.0.1:8000/api/v2/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT" \
  -d '{"message":"What is the derivative of x^2?"}'
```

### Example response

```json
{
  "session_id": "uuid",
  "response": "The derivative of x² is 2x...",
  "agent": "mathematics",
  "intent": "learn",
  "metadata": {}
}
```

---

## Project structure

```
IntellectA/
├── backend/                       # ★ Current API (FastAPI + LangGraph)
│   ├── Procfile                   # Gunicorn + Uvicorn workers (Render)
│   ├── render.yaml                # Optional Render Blueprint
│   ├── requirements.txt
│   ├── ARCHITECTURE.md            # Deep technical architecture
│   └── src/intellecta/
│       ├── main.py                # FastAPI app entry (intellecta.main:app)
│       ├── config.py              # Pydantic settings from .env
│       ├── api/routes/            # auth, chat, sessions, health
│       ├── orchestration/         # LangGraph builder, nodes, routing
│       ├── agents/                # Specialist prompts & instructions
│       ├── memory/                # Redis short-term + Mem0 long-term
│       ├── retrieval/             # Embeddings, pgvector, curriculum seed
│       ├── assessment/            # Adaptive quiz engine
│       ├── db/                    # SQLAlchemy models, schema, migrations
│       ├── auth/                  # JWT, Google OAuth, deps
│       └── services/              # LLM, image vision, chat persistence
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx               # Landing page
│   │   ├── login/page.tsx         # Auth (marketing left, form right)
│   │   ├── chat/page.tsx          # Chat workspace
│   │   └── layout.tsx
│   ├── components/
│   │   ├── dockit/                # Landing sections (Hero, FAQ, Footer…)
│   │   ├── auth/                  # GoogleSignInButton, AuthGuard
│   │   ├── brand/                 # IntellectA logo & wordmark
│   │   ├── chat-interface.tsx     # Main chat UI
│   │   └── chat-sidebar.tsx       # Session sidebar
│   ├── lib/                       # auth helpers, subjects (must be in Git!)
│   ├── utils/                     # api.ts, auth-api.ts, sessions-api.ts
│   ├── styles/dockit.css          # Landing + login theme
│   └── .env.local                 # Local frontend env (gitignored)
│
├── package.json                   # Root scripts
├── SETUP.md                       # Extended troubleshooting
└── README.md                      # This file
```

---

## How the AI pipeline works

1. **User sends a message** (text or image) from the chat UI.
2. **Session context** is loaded from Redis (recent turns) and PostgreSQL (full history).
3. **Router node** (fast Groq model) classifies **intent** (`learn`, `clarify`, `quiz`, `evaluate_answer`) and **subject** (one of eight slugs).
4. **Scope Guard** rejects non-academic or out-of-subject queries.
5. **Subject Agent** (for learn/clarify):
   - Embeds the question
   - Retrieves top-k curriculum chunks from pgvector (filtered by subject)
   - Boosts chunks matching user's weak `concept_mastery` topics
   - Generates answer with specialist system prompt via Groq
6. **Evaluator** (for quiz/evaluate): generates or scores adaptive practice questions.
7. **Memory Writer** persists insights to Redis, Mem0, and PostgreSQL.
8. **Response** returned with `agent`, `intent`, and `session_id` for the UI.

For **images**, a vision model analyzes the photo first, then the same pipeline runs on the extracted description + optional user text.

---

## Data & storage

| Data | Where |
|------|--------|
| **User accounts** | PostgreSQL `users` (email/password + Google OAuth) |
| **Chat sessions** | PostgreSQL `chat_sessions` |
| **Messages** | PostgreSQL `messages` |
| **Curriculum / RAG** | PostgreSQL `documents` + `document_chunks` (pgvector embeddings) |
| **Concept mastery** | PostgreSQL `concept_mastery` |
| **Quiz results** | PostgreSQL `quiz_results` |
| **Short-term context** | Redis / Upstash (`session:{id}:messages`, 24h TTL) |
| **Long-term insights** | Mem0 graph (optional) |
| **JWT token** | Browser `localStorage` (`intellecta-token`) |
| **Sidebar width** | Browser `localStorage` |
| **Legacy v1 chats** | Old `localStorage` keys auto-migrated where possible |

When logged in, **chat history syncs to the server** — clearing browser data does not delete server-side sessions (unless you delete them in the UI).

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `/_next/static/...` 404 | Stop dev → `cd frontend && npm run dev:clean` → hard refresh browser |
| `Can't resolve '@/lib/auth'` on Vercel | Ensure `frontend/lib/` is committed to Git |
| Backend `ModuleNotFoundError: intellecta` | Set `export PYTHONPATH=src` before running uvicorn |
| Chat 401 Unauthorized | Log in again; check `JWT_SECRET_KEY` is consistent across deploys |
| Google Sign-In fails | Match `GOOGLE_CLIENT_ID` on frontend + backend; add Vercel URL to OAuth origins |
| CORS errors | Set `CORS_ORIGINS` on backend to your exact frontend URL (no trailing slash) |
| `DATABASE_URL` connection fails | Use `postgresql+asyncpg://` scheme; check Neon SSL / IP allowlist |
| Health shows `embedded_chunks: 0` | Run `python -m intellecta.scripts.seed_rag` |
| Redis errors | Set Upstash REST URL + token, or local `REDIS_URL` |
| Slow first request on Render | Free tier cold start — wait ~50s and retry |
| Sign in button not working (header) | Ensure `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set; or use Get started → `/login` |

More detail: **[SETUP.md](./SETUP.md)** · **[backend/README.md](./backend/README.md)**

---

## Security

- Keep `backend/.env` and all API keys **out of Git**
- Rotate `GROQ_API_KEY` if it was ever exposed
- Use a strong `JWT_SECRET_KEY` in production (Render: generate random value)
- `NEXT_PUBLIC_*` vars are visible in the browser — only public URLs and Google client ID
- Set `CORS_ORIGINS` to your real frontend domain(s) in production
- Google OAuth: restrict authorized JavaScript origins to your domains only
- Never commit `.env`, `.env.local`, or database credentials

---

## Further reading

| Document | Contents |
|----------|----------|
| [backend/ARCHITECTURE.md](./backend/ARCHITECTURE.md) | LangGraph nodes, RAG, memory, adaptive assessment, DB schema |
| [backend/README.md](./backend/README.md) | Backend quick start, RAG seed, health check |

---

## Author

**M. Abdullah** — [github.com/muhammad-abdullah-nova-dev](https://github.com/muhammad-abdullah-nova-dev)

If IntellectA helped you study smarter, star the repo and share feedback via issues.

<div align="center">

<a href="https://github.com/muhammad-abdullah-nova-dev/IntellectA/stargazers">
  <img src="https://img.shields.io/github/stars/muhammad-abdullah-nova-dev/IntellectA?style=for-the-badge&color=ffca7b&labelColor=0d0d0d&logo=github" alt="Stars" />
</a>
<a href="https://github.com/muhammad-abdullah-nova-dev/IntellectA/issues">
  <img src="https://img.shields.io/github/issues/muhammad-abdullah-nova-dev/IntellectA?style=for-the-badge&color=d76d77&labelColor=0d0d0d&logo=github" alt="Issues" />
</a>
<a href="https://github.com/muhammad-abdullah-nova-dev/IntellectA/blob/main/LICENSE">
  <img src="https://img.shields.io/github/license/muhammad-abdullah-nova-dev/IntellectA?style=for-the-badge&color=3a1c71&labelColor=0d0d0d" alt="License" />
</a>

<br /><br />

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=500&size=18&pause=1200&color=FFCA7B&center=true&vCenter=true&width=520&height=35&lines=Built+for+students+who+ask+%22why%3F%22;Eight+experts.+One+chat.+Zero+distractions.;Happy+studying+%E2%9C%A8" alt="Built for students who ask why - Eight experts. One chat. Zero distractions. - Happy studying" />

<br />

<a href="#top"><b>↑ Back to top</b></a>

<img src="https://capsule-render.vercel.app/api?type=waving&section=footer&height=140&color=0:ffca7b,50:d76d77,100:3a1c71&animation=twinkling" alt="" />

</div>
