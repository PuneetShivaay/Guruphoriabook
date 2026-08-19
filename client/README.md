# Client — GuruphoriaBook Web App

Next.js (App Router) frontend for GuruphoriaBook. See the root [`README.md`](../README.md) for project-wide context and [`docs/`](../docs) for architecture and RAG pipeline details.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | Run ESLint |

---

## Requirements

- Node.js 20+
- The [server](../server) running locally (or a deployed API URL)
- `NEXT_PUBLIC_API_URL` set in `.env.local` — see [`../docs/ENVIRONMENT.md`](../docs/ENVIRONMENT.md)

---

## Tech Stack

- **Next.js 16** (App Router) + **React 19**
- **Tailwind CSS** + **shadcn/ui** component primitives (`components/ui/`)
- **TanStack Query** for server-state (fetching/caching workspaces, sources, messages)
- **Zustand** for local/UI state (e.g. active chat stream state)
- **Vercel AI SDK** (`ai`, `@ai-sdk/react`) for consuming the streaming chat endpoint
- **Better Auth** client for session/auth state

---

## Folder Structure

```text
app/                       Next.js routes, root layout, global styles
components/ui/             shadcn/ui primitives (buttons, dialogs, tables, etc.)
components/providers/      React Query provider, theme provider
features/                  Feature-sliced modules — see below
shared/                    Cross-feature components, hooks, and lib helpers
lib/utils.ts               Generic utilities (e.g. `cn()` class merging)
```

### Feature modules (`features/<name>/`)

Each feature is self-contained:

```text
features/<name>/
├── components/    UI specific to this feature
├── hooks/         data fetching (queries/mutations) and local state
├── lib/           API calls, formatting, feature-specific helpers
├── stores/         zustand store, only if the feature needs shared client state
└── index.ts        the only file other features are allowed to import from
```

| Feature | Responsibility |
|---|---|
| `auth` | Login, session state, protected route handling |
| `workspaces` | Notebook list, create/rename/delete, workspace switcher |
| `sources` | Upload/import flows, source list with status badges, source viewer (citations open here) |
| `chat` | Conversation UI, streaming message rendering, citation chips |
| `learn` | Learning artifact generation and viewing (summaries, flashcards, quizzes, etc.) |
| `memory` | Long-term memory viewer/management |

---

## Working with the API

- All requests go to `NEXT_PUBLIC_API_URL` (the Express server).
- Chat responses are streamed (SSE) and rendered incrementally using the Vercel AI SDK's streaming utilities.
- Source status (`PENDING → PROCESSING → READY/FAILED`) should be reflected live in the sources list — poll or refetch after upload/import until the source reaches a terminal state.
- Citations returned with each assistant message should be rendered as clickable chips that open the Source Viewer for the referenced source (jumping to the relevant page/timestamp/section where possible).

---

## UI Components

Built on top of [shadcn/ui](https://ui.shadcn.com/). To add a new primitive:

```powershell
npx shadcn@latest add <component-name>
```
