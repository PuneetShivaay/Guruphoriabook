# Server — GuruphoriaBook API

Express + TypeScript backend for GuruphoriaBook. See the root [`README.md`](../README.md) for project-wide context and [`docs/`](../docs) for architecture and RAG pipeline details.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the API in watch mode (`tsx watch src/index.ts`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server (`node dist/index.js`) |

---

## Requirements

- Node.js 20+
- PostgreSQL with the `pgvector` extension (see root `docker-compose.yml`)
- API keys for: OpenAI, Pinecone, and optionally Firecrawl, Mem0, Tavily, Cloudinary, Google OAuth

Full environment variable reference: [`../docs/ENVIRONMENT.md`](../docs/ENVIRONMENT.md).

---

## Database

Schema lives in `prisma/schema.prisma`. Prisma Client is generated into `src/generated/prisma`.

```powershell
npx prisma migrate dev      # create/apply a migration
npx prisma generate         # regenerate the client after schema changes
npx prisma studio           # inspect data visually
```

Core models:

- `User`, `Session`, `Account`, `Verification` — Better Auth
- `Workspace` — a notebook, owned by a user
- `Source` / `SourceChunk` — an ingested knowledge source and its indexed chunks
- `Conversation` / `Message` — chat history, with citations stored on assistant messages
- `LearningArtifact` — generated study material (summary, flashcards, quiz, etc.)

---

## Folder Structure

```text
src/
├── index.ts              App entrypoint (Express app, middleware, route registration)
├── routes/                URL → controller wiring
├── controllers/           Request parsing + response shaping
├── services/              Business logic (RAG, chat, sources, artifacts, memory, workspaces)
├── repositories/          Prisma queries — the only layer touching the DB directly
├── lib/                   External integrations:
│   ├── openai.ts           embeddings + client
│   ├── pinecone.ts         vector upsert/query/delete
│   ├── pdf.ts               PDF text extraction
│   ├── cloudinary.ts       file storage
│   ├── firecrawl.ts        website scraping
│   ├── mem0.ts              long-term memory
│   ├── tavily.ts            web search
│   ├── auth.ts               Better Auth config
│   ├── ai-config.ts          model names, chunking/window constants
│   ├── chunking.ts           text/page chunking helpers
│   └── rag/retrieve.ts       retrieval + prompt construction for chat
├── inngest/                background job (function) definitions
├── middleware/             auth guard, file upload (multer), error handler
├── validators/              Zod request schemas
├── types/                   shared TS types, app error classes
└── utils/                   small stateless helpers
```

---

## API Routes

Mounted in `src/routes/index.ts`:

```text
/api/workspaces
/api/workspaces/:workspaceId/sources
/api/workspaces/:workspaceId/sources/:sourceId/chunks
/api/workspaces/:workspaceId/conversations
/api/workspaces/:workspaceId/chat
/api/workspaces/:workspaceId/artifacts
/api/memory
```

Source ingestion endpoints (`/sources/...`):

```text
POST   /                    create a text/markdown source
POST   /upload               upload a PDF (multipart)
POST   /import/website       import from a URL
POST   /import/youtube       import a YouTube transcript
POST   /import/web-search    import Tavily search results as a source
POST   /:sourceId/reprocess  re-run the indexing pipeline for one source
POST   /reprocess            bulk reprocess
POST   /bulk-delete          bulk delete
GET    /:sourceId/chunks     inspect indexed chunks (source viewer)
```

Chat: `POST /:workspaceId/chat` streams a Server-Sent Events response using the Vercel AI SDK, grounded by retrieval from Pinecone + Postgres.

---

## Background Jobs (Inngest)

Defined in `src/inngest/`. See [`../docs/RAG_PIPELINE.md`](../docs/RAG_PIPELINE.md) for the full ingestion flow this powers.

| Event | Job |
|---|---|
| `source/created` | Extract → chunk → embed → index a source |
| `conversation/summarize` | Roll up long conversations into a summary |
| `artifact/generate` | Generate a learning artifact from selected sources |

In local dev, set `INNGEST_DEV=1` to run without the Inngest Cloud dashboard.
