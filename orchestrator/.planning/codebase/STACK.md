# Technology Stack

**Analysis Date:** 2026-01-25

## Languages

**Primary:**
- TypeScript 5.x - Application and configuration code
- JavaScript - Tooling and configuration (ESLint, PostCSS)

**Secondary:**
- SQL - Database migrations and queries via Drizzle ORM

## Runtime

**Environment:**
- Node.js 20+ (inferred from `@types/node ^20` in tsconfig)
- Supported in development and production

**Package Manager:**
- npm 10.x (via package-lock.json)
- Lockfile: Present (`package-lock.json`)

## Frameworks

**Core:**
- Next.js 16.1.3 - Full-stack React framework with API routes and server components
- React 19.2.3 - UI library and component framework

**UI/Components:**
- Radix UI - Headless component library for accessible UI primitives (`@radix-ui/react-*` suite v1.x)
- Tailwind CSS 4.x - Utility-first CSS framework
- Lucide React 0.562.0 - Icon library
- Class Variance Authority 0.7.1 - Component variant management
- Framer Motion / Motion 12.26.2 - Animation and motion library

**Text & Rich Content:**
- TipTap 3.15.3 - Rich text editor with extensions (code blocks, links, highlights, task lists)
- React Markdown 10.1.0 - Markdown rendering for display
- Rehype Highlight 7.0.2 - Syntax highlighting for code blocks
- Remark GFM 4.0.1 - GitHub Flavored Markdown support
- Shiki 3.21.0 - Syntax highlighter for code

**Data & State:**
- TanStack React Query 5.90.18 - Server state management and caching
- Zustand 5.0.10 - Client state management store
- Drizzle ORM 0.45.1 - Type-safe database layer

**Forms & UI Utilities:**
- cmdk 1.1.1 - Command palette / autocomplete
- React Dropzone 14.3.8 - File upload handling
- PapaParse 5.5.3 - CSV parsing

**Drag & Drop:**
- dnd-kit suite (core, sortable, utilities) 6.3.1 - Headless drag-and-drop library

**Testing:**
- Vitest 2.1.0 - Vite-native unit testing framework
- @vitest/ui 2.1.0 - UI dashboard for test results

**Build/Dev:**
- Tailwind CSS PostCSS 4.x - CSS processing
- TypeScript 5.x - Static type checking
- tsx 4.21.0 - TypeScript execution for scripts

**Linting/Code Quality:**
- ESLint 9.x - JavaScript/TypeScript linting
- eslint-config-next 16.1.3 - Next.js ESLint configuration

## Key Dependencies

**AI & Language Models:**
- @anthropic-ai/sdk 0.71.2 - Anthropic Claude API client
  - Used for: Signal extraction, classification, skill summaries, chat
- openai 6.16.0 - OpenAI API client
  - Used for: Text embeddings (text-embedding-3-small model)

**GitHub Integration:**
- @octokit/rest 22.0.1 - GitHub REST API client
  - Used for: Repository access, code reading, PR creation, commits

**Third-Party Services:**
- @composio/core 0.5.5 - Composio integration SDK
  - Used for: Tool execution, service connectors

**Skills Marketplace:**
- Custom SkillsMP API client (`src/lib/skills/skillsmp-client.ts`)
  - API base: https://skillsmp.com/api/v1
  - Used for: Skill search, AI semantic search, skill fetching

**Database:**
- pg 8.17.1 - PostgreSQL client for Node.js
- @neondatabase/serverless 1.0.2 - Neon serverless HTTP driver
  - Auto-detection: Uses Neon if DATABASE_URL contains "neon.tech"
- drizzle-kit 0.31.8 - ORM code generation and migrations

**Authentication:**
- next-auth 5.0.0-beta.30 - NextAuth.js authentication
- @auth/drizzle-adapter 1.11.1 - DrizzleORM adapter for NextAuth
- bcryptjs 3.0.3 - Password hashing

**Utilities:**
- nanoid 5.0.7 - ID generation
- uuid 13.0.0 - UUID generation
- date-fns 4.1.0 - Date utilities
- clsx 2.1.1 - Conditional className management
- tailwind-merge 3.4.0 - Tailwind CSS class merging

**Document Processing:**
- unpdf 1.4.0 - PDF processing and text extraction
- youtube-caption-extractor 1.9.1 - YouTube video caption extraction

**UI Utilities:**
- next-themes 0.4.6 - Theme management (light/dark mode)
- react-markdown 10.1.0 - Markdown rendering
- lowlight 3.3.0 - Syntax highlighting
- dotenv 16.4.5 - Environment variable loading

## Configuration

**Environment:**
- Environment variables via `.env.local` (development) and deployment platform (production)
- Key configs: `AUTH_SECRET`, `AUTH_URL`, `DATABASE_URL`, API keys for external services

**Build:**
- `next.config.ts` - Next.js configuration
  - Enables `instrumentationHook` for background worker auto-start
- `drizzle.config.ts` - Drizzle ORM configuration
- `tsconfig.json` - TypeScript compiler configuration
  - Path alias: `@/*` → `./src/*`
  - Target: ES2017
  - Strict mode enabled
- `vitest.config.ts` - Vitest test runner configuration

**Docker:**
- `docker-compose.yml` - Local PostgreSQL setup with pgvector support
  - Service: `postgres` (pgvector/pgvector:pg16)
  - Port: 5432
  - User: `elmer` / Password: `elmer_local_dev` / DB: `orchestrator`

## Platform Requirements

**Development:**
- Node.js 20+
- npm 10.x
- Docker & Docker Compose (for local PostgreSQL)
- Environment variables configured in `.env.local`

**Production:**
- Node.js 20+ runtime environment
- PostgreSQL 14+ or Neon serverless database
- Environment variables configured via deployment platform

---

*Stack analysis: 2026-01-25*
