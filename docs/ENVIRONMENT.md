# 🔑 Environment Variables

All variables live in `.env` files (not committed). Copy the tables below into `server/.env` and `client/.env.local`.

---

## Server — `server/.env`

| Variable | Required | Description |
|---|---|---|
| `PORT` | No (default `8080`) | Port the Express server listens on |
| `DATABASE_URL` | Yes | PostgreSQL connection string, e.g. `postgresql://postgres:postgres@localhost:5434/guruphoriabook` |
| `CLIENT_URL` | Yes | URL of the frontend, used for CORS + auth redirects (e.g. `http://localhost:3000`) |
| `BETTER_AUTH_SECRET` | Yes | Random secret used to sign auth sessions/cookies |
| `BETTER_AUTH_URL` | Yes | Public base URL of the server (used by Better Auth), e.g. `http://localhost:8080` |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID (Google Cloud Console) |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `OPENAI_API_KEY` | Yes | Used for embeddings + chat completion (via Vercel AI SDK) |
| `PINECONE_API_KEY` | Yes | Vector database API key |
| `PINECONE_INDEX` | Yes | Name of the Pinecone index to use |
| `FIRECRAWL_API_KEY` | Yes (for website import) | Used to scrape website sources |
| `MEM0_API_KEY` | Yes (for memory) | Long-term conversation memory |
| `TAVILY_API_KEY` | Yes (for web search) | Live web search source + in-chat web search tool |
| `CLOUDINARY_CLOUD_NAME` | Yes (for PDF upload) | Cloudinary account cloud name |
| `CLOUDINARY_API_KEY` | Yes (for PDF upload) | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes (for PDF upload) | Cloudinary API secret |
| `CLOUDINARY_UPLOAD_PRESET` | No (has default) | Upload preset used for unsigned/signed uploads |
| `INNGEST_DEV` | No (default off) | Set to `1` to run Inngest in local dev mode without the cloud dashboard |
| `NODE_ENV` | No | `production` disables verbose Prisma logging |

### Where to get keys

- **Google OAuth**: [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → OAuth Client ID (Web application), add `http://localhost:8080/api/auth/callback/google` as a redirect URI.
- **OpenAI**: https://platform.openai.com/api-keys
- **Pinecone**: https://app.pinecone.io — create an index with a dimension matching the OpenAI embedding model used.
- **Firecrawl**: https://firecrawl.dev
- **Mem0**: https://mem0.ai
- **Tavily**: https://tavily.com
- **Cloudinary**: https://cloudinary.com/console

---

## Client — `client/.env.local`

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Base URL of the backend API (e.g. `http://localhost:8080`) |

> Any variable prefixed with `NEXT_PUBLIC_` is exposed to the browser — never put secrets there.

---

## Production / Deployment Notes

- Set `CLIENT_URL` (server) and `NEXT_PUBLIC_API_URL` (client) to the deployed domains, not `localhost`.
- Update the Google OAuth redirect URI to the production `BETTER_AUTH_URL`.
- Ensure the Pinecone index and OpenAI embedding model dimensions match.
- `DATABASE_URL` should point to your production Postgres instance with the `pgvector` extension enabled.
