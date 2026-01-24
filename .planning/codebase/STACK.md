# Technology Stack

**Analysis Date:** 2026-01-21

## Languages

**Primary:**

- TypeScript 5 - All application code, configuration, and types
- JSX/TSX 19 - React components with TypeScript

**Secondary:**

- JavaScript (Node.js) - Build scripts and tooling via tsx/next

## Runtime

**Environment:**

- Node.js (version not pinned in .nvmrc, inferred from Next.js 16.1.3 support)

**Package Manager:**

- npm 10+ (implied by package-lock.json format)
- Lockfile: Present (package-lock.json)

## Frameworks

**Core:**

- Next.js 16.1.3 - Full-stack React framework with API routes, server components
- React 19.2.3 - UI library with new JSX transform

**UI & Components:**

- Radix UI 1.4.3 - Headless component library
- @radix-ui/\* (multiple packages) - Individual headless components: dialog, dropdown-menu, tabs, tooltip, select, avatar, label, separator, slot, scroll-area
- Tailwind CSS 4 (with @tailwindcss/postcss 4) - Utility-first CSS framework
- Framer Motion 12.26.2 - Animation library for React
- Motion 12.26.2 - Motion primitives (complementary to Framer Motion)

**Rich Text Editing:**

- @tiptap/react 3.15.3 - Collaborative rich text editor
- @tiptap/starter-kit 3.15.3 - Core extensions (bold, italic, lists, etc.)
- @tiptap/extension-\* (multiple) - Task lists, code blocks, links, floating menu, bubble menu, highlights, typography
- Lowlight 3.3.0 - Syntax highlighting for code blocks
- Shiki 3.21.0 - Modern syntax highlighter integration
- Rehype-highlight 7.0.2 - Highlight integration for markdown
- React-markdown 10.1.0 - Markdown rendering
- Remark-gfm 4.0.1 - GitHub Flavored Markdown support

**Data Fetching:**

- @tanstack/react-query 5.90.18 - Server state management with caching

**State Management:**

- Zustand 5.0.10 - Lightweight state management
- Next.js server state - Built-in server state handling

**Drag & Drop:**

- @dnd-kit/core 6.3.1 - Headless drag-and-drop system
- @dnd-kit/sortable 10.0.0 - Sortable preset for dnd-kit
- @dnd-kit/utilities 3.2.2 - Utilities for dnd-kit

**Styling & Utilities:**

- Tailwind-merge 3.4.0 - Merge Tailwind class names intelligently
- class-variance-authority 0.7.1 - Type-safe component variants (CSS-in-TS)
- clsx 2.1.1 - Conditional className utility
- Lucide-react 0.562.0 - Icon library

**Development & Theming:**

- next-themes 0.4.6 - Dark mode and theme management
- dotenv 16.4.5 - Environment variable loading

**Testing:**

- No testing framework found in package.json (tests are in `src/__tests__` but no jest/vitest config)

**Build/Dev:**

- tsx 4.21.0 - Execute TypeScript files directly
- ESLint 9 - Linting with eslint-config-next 16.1.3
- Drizzle Kit 0.31.8 - Database schema generation and migrations
- Tailwind CSS 4 - Styling
- TypeScript 5 - Type checking and compilation

## Key Dependencies

**Critical:**

- @anthropic-ai/sdk 0.71.2 - Claude AI API integration (core to execution engine)
- drizzle-orm 0.45.1 - Type-safe ORM for database queries
- pg 8.17.1 - Node PostgreSQL driver (local and production)

**Infrastructure:**

- nanoid 5.0.7 - Unique ID generation (for records, jobs)
- uuid 13.0.0 - UUID generation
- next-themes 0.4.6 - Theme/mode persistence

## Configuration

**Environment:**

- `DATABASE_URL` - PostgreSQL connection string (supports both local and Neon serverless)
- `ANTHROPIC_API_KEY` - Claude API key for LLM execution
- `SKILLMP_API_KEY` - SkillsMP API key for skills marketplace integration
- `CHROMATIC_PROJECT_TOKEN` - Chromatic deployment token for Storybook
- Optional: `LINEAR_API_KEY`, `NOTION_API_KEY`, `NEXT_PUBLIC_POSTHOG_KEY` (in schema but not yet integrated)

**Build:**

- `tsconfig.json` - TypeScript compiler config with `@/*` path alias pointing to `./src/*`
- `next.config.ts` - Next.js configuration (minimal, mostly defaults)
- `eslint.config.mjs` - ESLint 9 flat config with next and typescript rules
- `drizzle.config.ts` - Drizzle ORM configuration for PostgreSQL migrations
- `postcss.config.mjs` - PostCSS with Tailwind CSS v4 plugin

## Database

**Type:** PostgreSQL (with pgvector extension)
**ORM:** Drizzle ORM 0.45.1

**Driver:** Standard `pg` driver for local PostgreSQL via Docker

Schema location: `src/lib/db/schema.ts`
Migrations location: `drizzle/` directory
Generate migrations: `npm run db:generate`
Run migrations: `npm run db:migrate`
Drizzle Studio: `npm run db:studio`

## Platform Requirements

**Development & Production (Self-Hosted):**

- Node.js 18+ (Next.js 16 requirement)
- npm
- Docker (for PostgreSQL container)
- PostgreSQL 16+ with pgvector extension (via Docker)
- Cloudflare Tunnel (for public access at https://elmer.studio)
- Anthropic API access (for Claude integration)
- OpenAI API access (for embeddings)

## Scripts

**Development:**

- `npm run dev` - Start Next.js dev server (localhost:3000)
- `npm run worker` - Start background job processor
- `npm run execution-worker` - Start execution system worker

**Database:**

- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:push` - Apply migrations to database
- `npm run db:migrate` - Run migrations from drizzle folder
- `npm run db:studio` - Open Drizzle Studio for database inspection

**Build:**

- `npm run build` - Build for production
- `npm run start` - Start production server

**Validation:**

- `npm run lint` - Run ESLint

**Networking:**

- `npm run tunnel` - Run Cloudflared tunnel (references "elmer" tunnel config)

---

_Stack analysis: 2026-01-21_
