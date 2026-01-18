# Tech Stack

> elmer's technical architecture for the PM orchestrator and prototype system.

---

## Orchestrator App

### Framework
- **Primary:** Next.js 15 (App Router)
- **Version:** 15.x (latest)
- **Rendering:** SSR + Server Components

### Language
- **Primary:** TypeScript
- **Strict Mode:** Yes

### Styling
- **Approach:** Tailwind CSS
- **Design System:** shadcn/ui + custom glassmorphic components
- **Theme:** Aurora palette (teal → purple → pink → gold → blue)
- **Effects:** Glass-morphism, backdrop-blur, animated gradients

### State Management
- **Client State:** React hooks + Zustand (where needed)
- **Server State:** React Server Components + Server Actions

### Database
- **Primary:** PostgreSQL (Neon serverless)
- **ORM:** Drizzle ORM
- **Migrations:** Drizzle Kit

### Build & Bundling
- **Bundler:** Next.js built-in (Turbopack in dev)
- **Package Manager:** npm

---

## Prototype System

### Framework
- **Primary:** React 18
- **Rendering:** CSR (Vite dev server)

### Component Documentation
- **Primary:** Storybook 8
- **Hosting:** Chromatic (visual review + hosting)
- **URL:** https://main--696c2c54e35ea5bca2a772d8.chromatic.com

### Styling
- **Approach:** Tailwind CSS
- **Design System:** shadcn/ui components
- **Utilities:** `cn()` from `@/lib/utils`

### Build
- **Bundler:** Vite
- **Package Manager:** npm

---

## AI & Agents

### Agent Orchestration
- **Runtime:** Cursor IDE (MCP servers + slash commands)
- **Agent Framework:** Cursor Rules (`.mdc` files)
- **CLI Integration:** Cursor CLI for background job execution

### LLM Integration
- **Primary:** Claude (Anthropic) via Cursor
- **Fallback:** OpenAI GPT-4 (when needed)

### MCP Servers
- Linear (issue management)
- Notion (knowledge base sync)
- PostHog (metrics, planned)
- Figma (design context)
- GitHub (repo management)

---

## Infrastructure

### Hosting
- **Orchestrator:** Vercel (planned) or local development
- **Prototypes:** Chromatic (Storybook hosting)
- **Database:** Neon (serverless Postgres)

### CI/CD
- **Platform:** GitHub Actions
- **Workflows:**
  - Type checking (`tsc --noEmit`)
  - Linting (ESLint)
  - Storybook build validation
  - Chromatic visual regression
  - Security scanning

### Environment
- **Local Dev:** Docker Compose (Postgres container)
- **Deploy Strategy:** Preview deploys on PRs, auto-deploy main

---

## Development Tools

### Code Quality
- **Linter:** ESLint
- **Formatter:** Prettier (via ESLint)
- **Type Checking:** TypeScript strict mode

### Testing
- **Visual:** Chromatic (Storybook visual regression)
- **Unit:** Vitest (planned)
- **E2E:** Playwright (planned)

### Documentation
- **Components:** Storybook with autodocs
- **API:** Server Actions (typed via TypeScript)

---

## Prototyping Conventions

When building prototypes, follow these conventions:

### Component Structure
```
[ComponentName]/
├── [ComponentName].tsx           # Component implementation
├── [ComponentName].stories.tsx   # REQUIRED - Storybook stories
├── types.ts                      # Optional - shared types
└── index.ts                      # Barrel export
```

### Imports
```typescript
// UI Components (shadcn/ui)
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

// Types
import type { ComponentProps } from './types';

// Utils
import { cn } from '@/lib/utils';
```

### Naming
- **Components:** PascalCase (`UserProfile.tsx`)
- **Stories:** PascalCase matching component (`UserProfile.stories.tsx`)
- **Props:** camelCase (`isLoading`, `onSubmit`)
- **Files:** PascalCase for components, kebab-case for utilities

### Story Titles
```typescript
// Prototypes go under Prototypes/ prefix
title: 'Prototypes/[InitiativeName]/[ComponentName]'

// Shared components go under category
title: 'Atoms/Button'
title: 'Molecules/Card'
title: 'Organisms/Dialog'
```

---

## Key Dependencies

| Category | Package | Version | Purpose |
|----------|---------|---------|---------|
| Framework | next | 15.x | App framework |
| UI | @radix-ui/* | latest | Accessible primitives |
| Styling | tailwindcss | 3.4.x | Utility CSS |
| Database | drizzle-orm | latest | Type-safe ORM |
| Database | @neondatabase/serverless | latest | Serverless Postgres |
| Forms | react-hook-form | 7.x | Form handling |
| Validation | zod | 3.x | Schema validation |
| Animation | framer-motion | 11.x | Motion library |
| Icons | lucide-react | latest | Icon system |
| Docs | storybook | 8.x | Component documentation |

---

## Repository Structure

```
elmer/
├── orchestrator/                 # Main Next.js app
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   ├── components/          # UI components
│   │   │   ├── ui/             # shadcn/ui primitives
│   │   │   └── [domain]/       # Feature components
│   │   ├── hooks/              # Custom hooks
│   │   └── lib/                # Utilities, DB, etc.
│   ├── drizzle/                # Database migrations
│   └── public/                 # Static assets
├── prototypes/                  # Storybook prototype system
│   ├── src/
│   │   ├── components/         # Prototype components
│   │   └── lib/               # Shared utilities
│   └── .storybook/            # Storybook config
├── elmer-docs/                 # PM documentation
│   ├── company-context/        # Strategic foundation
│   ├── initiatives/            # Project-specific work
│   └── signals/               # Ingested feedback
└── .cursor/
    ├── commands/              # Slash commands
    └── rules/                 # AI behavior rules
```

---

## Notes for Prototyping

- **Every component needs a story** — No exceptions. Use `/component` command to scaffold both.
- **Use shadcn/ui primitives** — Don't reinvent buttons, inputs, cards, etc.
- **Aurora palette** — Use CSS variables from Tailwind config for consistent colors.
- **Glassmorphic effects** — `backdrop-blur-md`, `bg-white/10`, subtle borders.
- **Animations** — Use Framer Motion for complex animations, CSS for simple ones.
- **Accessibility** — Radix primitives handle this; don't override keyboard/screen reader behavior.
