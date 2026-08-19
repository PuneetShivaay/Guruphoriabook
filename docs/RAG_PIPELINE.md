# 🔎 RAG Pipeline — Ingestion, Retrieval & Citations

This document explains exactly how a source becomes searchable knowledge, and how an answer traces back to its origin.

---

## 1. Ingestion Pipeline

```text
Source created (PDF upload / paste text / website / YouTube / web search)
        │
        ▼
┌───────────────────┐
│  Extract           │  Get plain text out of the source
│  (per source type) │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Chunk             │  Split text into overlapping windows
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Embed             │  OpenAI embeddings per chunk
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Store             │  Chunks → Postgres (SourceChunk)
│                    │  Vectors → Pinecone (namespaced by workspace)
└───────────────────┘
        │
        ▼
   status = READY   (or FAILED, with error saved to metadata)
```

### Extraction by source type

| Source type | Extraction method |
|---|---|
| **Text / Markdown** | Content stored directly, used as-is |
| **PDF** | File uploaded to Cloudinary → downloaded server-side → text extracted (page-aware, so page numbers can be attached to chunks) |
| **Website** | Firecrawl scrapes the URL into clean markdown/text |
| **YouTube** | Transcript fetched for the video; segments carry timestamps |
| **VTT / Transcript** | Parsed like a subtitle file — cues carry start/end timestamps, used the same way as YouTube transcript chunks |
| **Web Search** | Tavily search results are stored as a source (title + snippet/content per result) |

### Chunking strategy

- Text is split into **token-bounded chunks** with overlap, so context isn't cut off mid-thought at chunk boundaries.
- For paginated content (PDF), chunking is **page-aware** — each chunk tracks which page(s) it came from.
- For time-based content (YouTube/VTT), chunking is **timestamp-aware** — each chunk tracks a start (and optionally end) timestamp.
- Each chunk is persisted as a `SourceChunk` row: `{ sourceId, index, content, tokenCount, metadata }`, where `metadata` carries the page number / timestamp / character offset needed later for the Source Viewer.

### Embedding & storage

- Chunk text → OpenAI embeddings API → fixed-length vectors.
- Vectors are upserted into **Pinecone**, tagged with metadata: `workspaceId`, `sourceId`, `chunkId`/`sourceChunkIndex`, and enough info to identify the chunk without a DB round trip.
- The **same `workspaceId` filter is applied on every query**, guaranteeing per-notebook isolation.

### Status tracking

`Source.status` moves through:

```text
PENDING → PROCESSING → READY
                     ↘ FAILED (error message saved to Source.metadata.processingError)
```

The client polls/reflects this field so the UI can show upload → indexing → ready states, and surface failures with a retry (reprocess) action.

### Reprocessing / removal

- **Reprocess**: deletes existing chunks + vectors for a source, then re-runs the full pipeline (useful after a source is edited, or after a failure).
- **Delete**: removes the `Source` row (cascades to `SourceChunk`s) and deletes its vectors from Pinecone.

---

## 2. Retrieval Pipeline (Answering a Question)

```text
User question
      │
      ▼
Embed the question (OpenAI)
      │
      ▼
Similarity search in Pinecone
   filtered by workspaceId
      │
      ▼
Top-K matching chunks (with sourceId, chunkId, score)
      │
      ▼
Fetch full chunk + source metadata from Postgres
      │
      ▼
Build grounded system prompt:
   - retrieved chunk contents, each labeled with a citation marker
   - instruction: "answer only from context, cite sources, never invent citations"
      │
      ▼
streamText() → LLM streams the answer token-by-token over SSE
      │
      ▼
Assistant message saved with a `citations` JSON array
   [{ sourceId, chunkId, sourceTitle, snippet, page/timestamp, score }, ...]
```

### Why grounding works here

- The system prompt **explicitly instructs the model to only use retrieved context** and to never fabricate a citation.
- Every retrieved chunk is tagged with an identifier the model must reference in its answer.
- If no relevant chunks are found, the assistant is instructed to say so rather than hallucinate.
- Optional live web search (Tavily) results are clearly separated from workspace context in the prompt, so citations distinguish "from your sources" vs "from the web."

---

## 3. Citations & Source Attribution

- Every assistant `Message` stores a `citations` JSON field alongside its content.
- The chat UI renders citation chips/markers inline with (or below) the answer.
- Clicking a citation opens the **Source Viewer** for that source, which:
  - **PDF** → jumps to the page the chunk came from
  - **Website** → opens/previews the page (optionally highlighting the scraped section)
  - **YouTube** → opens the video at the cited timestamp
  - **Text** → highlights the relevant section of the stored text
  - **VTT/Transcript** → highlights the cited cue/segment

This closes the loop the assignment requires: **the user should never receive an answer without knowing exactly where it came from.**

---

## 4. Isolation Summary

| Concern | Mechanism |
|---|---|
| Notebook isolation | `workspaceId` foreign key on every row + Pinecone metadata filter |
| User isolation | Workspaces are owned by `userId`; every service call re-checks ownership |
| Source isolation | Chunks/vectors always resolve back to exactly one `Source` |
