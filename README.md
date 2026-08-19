# 📖 GuruphoriaBook LLM

An AI-powered research assistant inspired by Gemini Notebook / NotebookLM — upload multiple knowledge sources into isolated **workspaces (notebooks)**, ask grounded questions, and get answers with **citations back to the original source**.

Built with **TypeScript, Express, Prisma, PostgreSQL + pgvector, OpenAI, Pinecone, Inngest, Better Auth, Mem0, Tavily, Next.js**.

🔗 Repository: https://github.com/PuneetShivaay/Guruphoriabook

---

## ✨ Features

- **Workspaces (Notebooks)** — create, rename, delete; each workspace has its own isolated knowledge base
- **Multi-source ingestion**
  - PDF upload (via Cloudinary + text extraction)
  - Plain text / Markdown paste
  - Website import (Firecrawl scraping)
  - YouTube video import (transcript extraction)
  - Web search results as a source (Tavily)
- **Indexing pipeline** — extract → chunk → embed → store in Pinecone, with live status (`PENDING → PROCESSING → READY / FAILED`)
- **Source management** — reprocess/re-index, bulk delete, per-source chunk inspection
- **RAG chat** — retrieval-augmented, streaming answers grounded in workspace sources
- **Citations** — every answer references the source chunk(s) it was generated from
- **Conversation memory** — long-term user memory via Mem0 + rolling conversation summaries
- **Live web search** — optional Tavily augmentation during chat
- **Learning artifacts** — generate summaries, takeaways, flashcards, quizzes, mind maps, reports from sources
- **Async processing** — indexing, summarization and artifact generation run as durable background jobs via Inngest

---

## 🏗 High-Level Architecture

```text
Client (Next.js)                         Server (Express + TypeScript)
─────────────────                        ──────────────────────────────
Workspaces UI      ─────HTTP/JSON────▶   Route → Controller → Service → Repository → Prisma
Sources UI                                                  ↘ External APIs (OpenAI, Pinecone,
Chat UI (streaming)◀────SSE stream────                        Firecrawl, Cloudinary, Tavily, Mem0)
Learn / Artifacts UI                     Inngest ── background jobs (indexing, summaries, artifacts)
```

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the full breakdown and
[`docs/RAG_PIPELINE.md`](./docs/RAG_PIPELINE.md) for how ingestion, retrieval and citations work end to end.

---

## � Project Structure

```text
client/                     Next.js app (App Router)
├── app/                    Routes, layout, global styles
├── components/ui/          shadcn/ui primitives
├── features/                Feature-sliced modules
│   ├── auth/               Login / session
│   ├── workspaces/         Notebook CRUD
│   ├── sources/            Upload, import, source status, source viewer
│   ├── chat/               RAG chat UI, streaming, citations
│   ├── learn/              Learning artifacts (summaries, quizzes, ...)
│   └── memory/             Long-term memory UI
└── shared/                 Cross-feature components, hooks, lib

server/                     Express + TypeScript API
├── prisma/                 schema.prisma + migrations
└── src/
    ├── routes/              Express routers
    ├── controllers/         Request/response handling
    ├── services/             Business logic (RAG, chat, sources, artifacts, memory)
    ├── repositories/          Prisma data access
    ├── lib/                   Integrations: openai, pinecone, mem0, tavily, firecrawl, cloudinary, rag/
    ├── inngest/               Background job definitions
    ├── middleware/            Auth, upload, error handling
    └── validators/            Zod request schemas
```

More detail: [`server/README.md`](./server/README.md) and [`client/README.md`](./client/README.md).

---

## � Technology Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS, shadcn/ui, Zustand, TanStack Query, Vercel AI SDK |
| Backend | Node.js, Express 5, TypeScript |
| Database | PostgreSQL (pgvector), Prisma ORM |
| Auth | Better Auth (Google OAuth) |
| Embeddings / LLM | OpenAI |
| Vector store | Pinecone |
| Long-term memory | Mem0 |
| Web search | Tavily |
| Website scraping | Firecrawl |
| File storage | Cloudinary |
| Background jobs | Inngest |

---

## ⚙️ Local Development Setup

### 1. Clone

```powershell
git clone https://github.com/PuneetShivaay/Guruphoriabook.git
cd Guruphoriabook
```

### 2. Start PostgreSQL (Docker)

```powershell
docker compose up -d
```

This starts a `pgvector/pgvector:pg16` Postgres instance on `localhost:5434`.

### 3. Server setup

```powershell
cd server
npm install
```

Create `server/.env` — see the full variable list in [`docs/ENVIRONMENT.md`](./docs/ENVIRONMENT.md):

```env
PORT=8080
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/guruphoriabook

BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:8080
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
CLIENT_URL=http://localhost:3000

OPENAI_API_KEY=
PINECONE_API_KEY=
PINECONE_INDEX=

FIRECRAWL_API_KEY=
MEM0_API_KEY=
TAVILY_API_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_UPLOAD_PRESET=

INNGEST_DEV=1
```

Run migrations and start the API:

```powershell
npx prisma migrate dev
npm run dev
```

Server runs at `http://localhost:8080` (health check: `/health`).

### 4. Client setup

```powershell
cd client
npm install
```

Create `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

```powershell
npm run dev
```

Client runs at `http://localhost:3000`.

---

## 🌐 API Overview

```http
GET   /health

/api/auth/*                                          Better Auth (Google OAuth, sessions)

/api/workspaces                                      Workspace (notebook) CRUD
/api/workspaces/:workspaceId/sources                 Source CRUD, upload, import, reprocess
/api/workspaces/:workspaceId/sources/:sourceId/chunks View indexed chunks (for source viewer)
/api/workspaces/:workspaceId/conversations            Conversation history
/api/workspaces/:workspaceId/chat                     Streaming RAG chat
/api/workspaces/:workspaceId/artifacts                Learning artifact generation

/api/memory                                           Long-term (Mem0) memory
```

---

## 🔄 Background Jobs (Inngest)

| Trigger event | Job | Purpose |
|---|---|---|
| `source/created` | Process source | Extract → chunk → embed → index → mark `READY`/`FAILED` |
| `conversation/summarize` | Summarize conversation | Rolling summary once message count crosses a threshold |
| `artifact/generate` | Generate artifact | Produce summaries/flashcards/quizzes/etc. from selected sources |

---

## 📚 Documentation

- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — layered architecture, folder responsibilities, request lifecycle
- [`docs/RAG_PIPELINE.md`](./docs/RAG_PIPELINE.md) — ingestion, chunking, embeddings, retrieval, citation flow
- [`docs/ENVIRONMENT.md`](./docs/ENVIRONMENT.md) — every environment variable, what it's for, where to get it
- [`server/README.md`](./server/README.md) — backend-specific notes
- [`client/README.md`](./client/README.md) — frontend-specific notes

---

## 🎥 Demo Video

_Coming soon — will be linked here once recorded._

---

## 🎯 Assignment Context

This project is being built for the **ChaibookLM — GenAI with JS 2026** assignment: an end-to-end NotebookLM-style RAG application supporting multi-notebook workspaces, multi-format source ingestion, grounded chat with citations, and a source viewer.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

---

## 📜 License

MIT License.

## Author

**Puneet Kumar** — [GitHub](https://github.com/PuneetShivaay)

⭐ If you find this project useful, please consider giving it a star.