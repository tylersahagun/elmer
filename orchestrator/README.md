# PM Orchestrator

AI-powered product management workflow orchestration tool with a beautiful glassmorphic Kanban UI.

## Features

- 🎨 **Aurora Design System** - Glassmorphic UI with animated aurora background, spring animations
- 📋 **Kanban Board** - Drag-and-drop project management with configurable workflow stages
- 🤖 **AI Document Generation** - PRD, design brief, engineering spec, GTM brief via Claude API
- 👥 **Jury Validation** - Synthetic user personas evaluate your work using Condorcet voting
- 🎭 **Prototype Building** - Generate Storybook prototypes via cursor-agent integration
- 💬 **AI Chat Sidebar** - Ask questions about projects, get suggestions, create issues
- 📊 **Metrics Dashboard** - PostHog integration with release stage tracking (Alpha → Beta → GA)
- 🔗 **Linear Integration** - Generate and validate tickets from engineering specs

## Quick Start

### 1. Install Dependencies

```bash
cd orchestrator
npm install
```

### 2. Set Up Environment

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Anthropic API key:

```env
ANTHROPIC_API_KEY=your_api_key_here
```

### 3. Start Local PostgreSQL (Docker)

```bash
docker compose up -d
```

This starts a PostgreSQL 16 container with:

- **Host**: localhost:5433
- **Database**: orchestrator
- **User**: elmer
- **Password**: elmer_local_dev

> **Note**: Data persists in a Docker volume. Use `docker compose down -v` to reset.

### 4. Initialize Database

```bash
npm run db:migrate
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Architecture

For the current Convex cutover roadmap, see [MIGRATION-READINESS.md](./MIGRATION-READINESS.md).

```
orchestrator/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/        # Dashboard routes
│   │   ├── api/                # API routes
│   │   └── page.tsx            # Home page
│   ├── components/
│   │   ├── aurora/             # Aurora background effects
│   │   ├── glass/              # Glassmorphic card components
│   │   ├── kanban/             # Kanban board components
│   │   ├── chat/               # AI chat sidebar
│   │   ├── metrics/            # PostHog metrics dashboard
│   │   └── ui/                 # shadcn/ui primitives
│   └── lib/
│       ├── db/                 # Drizzle ORM schema & queries
│       ├── store.ts            # Zustand state management
│       ├── animations.ts       # Framer Motion presets
│       └── utils.ts            # Utilities
├── drizzle/                    # Database migrations
└── data/                       # SQLite database
```

## MCP Server

The MCP server provides tools for AI agents:

```bash
cd ../mcp-server
npm install
npm run build
npm start
```

### Available Tools

| Tool                         | Description                        |
| ---------------------------- | ---------------------------------- |
| `generate-prd`               | Generate PRD from research/context |
| `generate-design-brief`      | Generate design brief from PRD     |
| `generate-engineering-spec`  | Generate engineering spec          |
| `generate-gtm-brief`         | Generate go-to-market brief        |
| `analyze-transcript`         | Extract insights from transcripts  |
| `run-jury-evaluation`        | Run synthetic user jury            |
| `build-standalone-prototype` | Build Storybook prototype          |
| `build-context-prototype`    | Build context-aware prototype      |
| `generate-tickets`           | Generate Linear tickets            |
| `validate-tickets`           | Validate ticket coverage           |

## Workflow Stages

Default Kanban columns (configurable per workspace):

1. **Inbox** - New ideas and feedback
2. **Discovery** - Research and analysis
3. **PRD** - Requirements documentation
4. **Design** - Design specifications
5. **Prototype** - UI prototyping
6. **Validate** - Jury evaluation
7. **Tickets** - Work breakdown
8. **Build** - Development
9. **Alpha** - Internal testing
10. **Beta** - Limited release
11. **GA** - General availability

## Design System

### Aurora Background

Animated gradient mesh with soft aurora colors:

- Teal (`#4fd1c5`)
- Purple (`#9f7aea`)
- Pink (`#ed64a6`)
- Gold (`#ecc94b`)

### Glassmorphism

Cards use backdrop blur with white translucency:

```css
background: rgba(255, 255, 255, 0.12);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.2);
```

### Spring Animations

Framer Motion presets for natural interactions:

```typescript
springPresets.snappy; // Buttons, toggles
springPresets.bouncy; // Card movements
springPresets.gentle; // Background elements
springPresets.layout; // Drag-drop reordering
```

## Tech Stack

| Layer      | Technology                       |
| ---------- | -------------------------------- |
| Framework  | Next.js 16, React 19, TypeScript |
| UI         | shadcn/ui, Tailwind CSS v4       |
| Animations | Framer Motion                    |
| Drag/Drop  | @dnd-kit                         |
| State      | Zustand, TanStack Query          |
| Database   | PostgreSQL (Drizzle ORM)         |
| AI         | Claude API (Anthropic SDK)       |

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio
```

## Database

Uses Docker PostgreSQL with pgvector extension:

```bash
# Start PostgreSQL
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f postgres

# Stop (keeps data)
docker compose stop

# Stop and remove data
docker compose down -v
```

**Connection Details:**

- Host: `localhost:5433`
- Database: `orchestrator`
- User: `elmer`
- Password: `elmer_local_dev`
- Connection string: `postgresql://elmer:elmer_local_dev@localhost:5433/orchestrator`

## Public Access

The app is exposed publicly via Cloudflare Tunnel at **https://elmer.studio**.

Clerk authentication uses a separate frontend API hostname. For the current
custom-domain setup, both of these records must resolve independently of the
app tunnel:

- `clerk.elmer.studio` -> `frontend-api.clerk.services`
- `accounts.elmer.studio` -> `accounts.clerk.services`

If those DNS records are missing, `/login` can render the shell while Clerk
assets fail to load with hostname errors.

```bash
# Start tunnel
cloudflared tunnel run elmer

# Or use the /local command in Cursor to start everything
# Validate auth/DNS wiring
npm run check:auth
```

`npm run check:auth` validates the Clerk publishable key, `CLERK_JWT_ISSUER_DOMAIN`,
`AUTH_URL`/`NEXTAUTH_URL`, and the Convex client URL before it verifies that
the public `/login` route returns HTML with Clerk bootstrap markers and then
checks Clerk DNS.

**Note:** Site is only available when your Mac is running with all services active.

## License

MIT
