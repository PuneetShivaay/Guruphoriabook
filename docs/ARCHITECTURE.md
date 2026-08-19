# 🏗 Architecture

This document explains how GuruphoriaBook is structured, why it's structured that way, and how a request flows through the system.

---

## 1. System Overview

```text
┌─────────────────────────┐        HTTP / JSON          ┌──────────────────────────────┐
│         Client          │  ───────────────────────▶   │            Server             │
│  Next.js 16 (App Router)│  ◀────  SSE (streaming) ──   │  Express 5 + TypeScript        │
└─────────────────────────┘                              └──────────────────────────────┘
                                                                      │
                                                                      ▼
                                                          ┌──────────────────────────┐
                                                          │   PostgreSQL (pgvector)   │
                                                          │   via Prisma ORM          │
                                                          └──────────────────────────┘
                                                                      │
                              ┌───────────────────────────────────────┼───────────────────────────────┐
                              ▼                                       ▼                               ▼
                        ┌───────────┐                          ┌────────────┐                  ┌────────────┐
                        │  Pinecone │  vector search           │   OpenAI   │  embeddings/LLM  │   Mem0     │ long-term memory
                        └───────────┘                          └────────────┘                  └────────────┘

                        ┌───────────┐   ┌────────────┐   ┌──────────┐
                        │ Firecrawl │   │ Cloudinary │   │  Tavily  │
                        │ (scrape)  │   │ (file CDN) │   │ (search) │
                        └───────────┘   └────────────┘   └──────────┘

                        ┌────────────────────────────────────────┐
                        │  Inngest — durable background workflows │
                        └────────────────────────────────────────┘
```

---

## 2. Backend Layering

The server follows a strict layered architecture so responsibilities never blur:

```text
Route → Controller → Service → Repository → Prisma
                  ↘ External integrations (lib/)
```

| Layer | Responsibility | Example |
|---|---|---|
| **Routes** (`src/routes`) | Declare URL paths + HTTP verbs, attach middleware, delegate to controllers | `source.routes.ts` |
| **Controllers** (`src/controllers`) | Parse/validate request, call services, shape HTTP response | `source.controller.ts` |
| **Services** (`src/services`) | Business logic, orchestration, calling multiple repositories/integrations | `source-processing.service.ts`, `chat.services.ts` |
| **Repositories** (`src/repositories`) | The *only* layer that talks to Prisma/the database | `source.repository.ts` |
| **lib/** | Thin wrappers around external SDKs (OpenAI, Pinecone, Mem0, Tavily, Firecrawl, Cloudinary) and shared logic (chunking, RAG retrieval) | `lib/pinecone.ts`, `lib/rag/retrieve.ts` |
| **validators/** | Zod schemas that validate request bodies/params | |
| **middleware/** | Auth guard, file upload (multer), centralized error handling | |
| **inngest/** | Background job (function) definitions, triggered by events | |

**Why this matters for the assignment:** it keeps ingestion, retrieval, and chat concerns isolated and testable, and makes it easy to swap a provider (e.g. Pinecone → another vector DB) without touching controllers or routes.

---

## 3. Frontend Structure (Feature-Sliced)

```text
client/features/<feature>/
├── components/   feature-specific UI
├── hooks/        data fetching / mutations (TanStack Query) and local state
├── lib/          feature-specific helpers, API clients
├── stores/        zustand stores (only where cross-component state is needed, e.g. chat)
└── index.ts       public exports — other features only import from here
```

Features: `auth`, `workspaces`, `sources`, `chat`, `learn`, `memory`.

`shared/` holds anything genuinely cross-cutting (generic hooks, layout components, utilities), and `components/ui/` holds the shadcn/ui primitive library.

This structure keeps each concept (a notebook, a source, a chat) self-contained instead of splitting logic across generic `hooks/`, `components/`, `utils/` folders shared by the whole app.

---

## 4. Request Lifecycle Example — Sending a Chat Message

```text
1. Client sends POST /api/workspaces/:id/chat  { messages }
2. Route → chat.routes.ts → streamChat controller
3. Controller validates payload, calls chat service
4. Service:
     a. loads workspace + recent conversation history
     b. retrieveWorkspaceContext() → embed query → Pinecone similarity search
        → fetch matching SourceChunk rows (with source metadata)
     c. optionally fetches Mem0 memories + Tavily web results
     d. builds system prompt with retrieved context + citation instructions
     e. streamText() (Vercel AI SDK) streams the LLM response back over SSE
     f. on completion: persist assistant message + citations JSON
5. Client renders streamed tokens live, then renders citation chips from
   the final message's `citations` field
6. Clicking a citation opens the Source Viewer, which loads the referenced
   SourceChunk (and source metadata: page number / timestamp / offsets)
```

---

## 5. Async Processing (Inngest)

Indexing, summarization, and artifact generation are slow/expensive, so they run as **durable background jobs** instead of blocking HTTP requests:

```text
Source created ──event──▶ source/created job
                              ├─ extract text (PDF / scrape / transcript)
                              ├─ chunk text
                              ├─ embed chunks (OpenAI)
                              ├─ upsert vectors (Pinecone)
                              └─ update Source.status → READY | FAILED
```

The client polls or refetches source status so the UI can show `PENDING → PROCESSING → READY/FAILED` live.

---

## 6. Data Isolation Between Notebooks

Every `Source`, `Conversation`, and `LearningArtifact` row is scoped by `workspaceId`, and every Pinecone vector is namespaced/tagged with the same `workspaceId`. Retrieval queries always filter by workspace, so one notebook's knowledge base can never leak into another's answers.
