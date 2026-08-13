# 📖 GuruphoriaBook LLM

An end-to-end production-grade LLM application built with **TypeScript, Express, Prisma, PostgreSQL, OpenAI, Pinecone, Inngest, Better Auth, Mem0, and Tavily**.

guruphoriabook teaches how to build a modern Retrieval-Augmented Generation (RAG) platform from scratch, progressing from a simple Express server to an AI-powered knowledge workspace with chat, memory, web search, and learning artifacts.

🔗 Repository:  
https://github.com/PuneetShivaay/Guruphoriabook

---

## ✨ Features

- Express + TypeScript backend
- PostgreSQL with Prisma ORM
- Google Authentication using Better Auth
- Multi-workspace support
- Knowledge source management
- Website import
- YouTube transcript import
- PDF upload support
- Web search source ingestion
- Chunking and embedding pipeline
- Pinecone vector database integration
- RAG-based AI chat
- Conversation memory with Mem0
- Live web search with Tavily
- Learning artifact generation
- Async workflows using Inngest

---

# 🏗 Architecture

```text
Route → Controller → Service → Repository → Prisma
                  ↘ External APIs / Libs
```

---

# 📚 Project Roadmap

```text
Ch1 Bootstrap
 └─ Ch2 Database
     └─ Ch3 Auth
         └─ Ch4 Workspaces
             └─ Ch5 Sources CRUD
                 └─ Ch6 Import Channels
                     └─ Ch7 Indexing Pipeline
                         ├─ Ch8 RAG Chat
                         ├─ Ch9 Memory + Web Search
                         └─ Ch10 Artifacts
```

---

# 🚀 Technology Stack

### Backend

- Node.js
- Express.js
- TypeScript

### Database

- PostgreSQL
- Prisma ORM

### Authentication

- Better Auth
- Google OAuth

### AI & Search

- OpenAI
- Pinecone
- Mem0
- Tavily

### Workflow Orchestration

- Inngest

### External Integrations

- Firecrawl
- Cloudinary
- YouTube Transcript APIs

---

# 📂 Project Structure

```text
server/
├── prisma/
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── validators/
│   ├── lib/
│   ├── utils/
│   └── index.ts
├── package.json
├── tsconfig.json
└── .env
```

---

# ⚙️ Local Development Setup

## Clone Repository

```bash
git clone https://github.com/PuneetShivaay/Guruphoriabook.git

cd Guruphoriabook
```

## Install Dependencies

```bash
npm install
```

## Create Environment Variables

Create a `.env` file:

```env
PORT=8080

DATABASE_URL=

BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

CLIENT_URL=

OPENAI_API_KEY=

PINECONE_API_KEY=
PINECONE_INDEX=

FIRECRAWL_API_KEY=

MEM0_API_KEY=

TAVILY_API_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_UPLOAD_PRESET=

INNGEST_DEV=1
```

---

## Development

```bash
npm run dev
```

Server:

```text
http://localhost:8080
```

Health Check:

```text
http://localhost:8080/health
```

---

## Production Build

```bash
npm run build
npm start
```

---

# 📖 Learning Journey

## Chapter 1: Bootstrap

Build a TypeScript Express server.

### Outcomes

- Express setup
- TypeScript configuration
- Environment variables
- Health endpoint

---

## Chapter 2: Database Foundation

Connect PostgreSQL using Prisma.

### Outcomes

- Prisma setup
- Database migrations
- Prisma Client generation

---

## Chapter 3: Authentication

Implement Google Authentication using Better Auth.

### Outcomes

- User login
- Session management
- Protected routes

---

## Chapter 4: Workspaces

Build the first complete feature.

### Outcomes

- Workspace CRUD
- Error handling
- Validation patterns
- Repository-Service architecture

---

## Chapter 5: Sources CRUD

Store knowledge sources.

### Supported Types

- Text
- Markdown

### Outcomes

- Source CRUD
- Source ownership
- Workspace-scoped resources

---

## Chapter 6: Import Channels

Import content from multiple sources.

### Supported Imports

- Website
- YouTube
- PDF Upload
- Web Search Results

---

## Chapter 7: Indexing Pipeline

Transform raw content into searchable knowledge.

### Pipeline

```text
Source
   ↓
Extract
   ↓
Chunk
   ↓
Embed
   ↓
Pinecone
   ↓
READY
```

### Outcomes

- Chunking
- OpenAI embeddings
- Pinecone indexing
- Reprocessing workflows
- Async jobs with Inngest

---

## Chapter 8: RAG Chat

Chat with indexed knowledge.

### Outcomes

- Conversation management
- Source retrieval
- Citation support
- Streaming responses

---

## Chapter 9: Memory & Web Search

Add long-term memory and internet access.

### Outcomes

- Mem0 integration
- Conversation summaries
- Tavily web search
- Context-aware conversations

---

## Chapter 10: Learning Artifacts

Generate educational material from sources.

### Artifact Types

- Summaries
- Flashcards
- Quizzes
- Study Notes

### Outcomes

- Async artifact generation
- Source-grounded learning assets

---

# 🌐 API Overview

## Health

```http
GET /
GET /health
```

## Authentication

```http
/api/auth/*
```

## Workspaces

```http
/ api/workspaces
```

## Sources

```http
/ api/workspaces/:workspaceId/sources
```

## Conversations

```http
/ api/workspaces/:workspaceId/conversations
```

## Chat

```http
/ api/workspaces/:workspaceId/chat
```

## Artifacts

```http
/ api/workspaces/:workspaceId/artifacts
```

## Memory

```http
/ api/memory
```

## Inngest

```http
/ api/inngest
```

---

# 🔄 Inngest Workflows

| Chapter | Workflow | Event |
|----------|-----------|---------|
| Ch7 | Process Source | `source/created` |
| Ch9 | Summarize Conversation | `conversation/summarize` |
| Ch10 | Generate Artifact | `artifact/generate` |

---

# 🎯 End Goal

By the end of GuruphoriaBook LLM you'll have built a production-ready AI platform featuring:

✅ Authentication  
✅ Multi-tenancy  
✅ Knowledge Management  
✅ Vector Search  
✅ RAG Chat  
✅ Long-Term Memory  
✅ Web Search  
✅ AI Artifacts  
✅ Async Processing

---

# 🤝 Contributing

Contributions, improvements, and suggestions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

---

# 📜 License

This project is licensed under the MIT License.

---

## Author

**Puneet Kumar**

- GitHub: https://github.com/PuneetShivaay
- Repository: https://github.com/PuneetShivaay/Guruphoriabook

⭐ If you find this project useful, please consider giving it a star.