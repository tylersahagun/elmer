# Coding Conventions

**Analysis Date:** 2026-01-21

## Naming Patterns

**Files:**
- React components: PascalCase (`CopyButton.tsx`, `MetricsDashboard.tsx`)
- Hooks: `useHookName.ts` or `useHookName.tsx` (e.g., `useJobPolling.ts`, `useRealtimeJobs.ts`, `useBrowserNotifications.ts`)
- Utilities and services: camelCase with descriptive names (`skillsmp-client.ts`, `skills-service.ts`)
- API routes: `route.ts` following Next.js conventions (e.g., `src/app/api/projects/route.ts`)
- Test files: `*.test.ts` or `*.test.tsx` format (e.g., `skills.test.ts`, `gates.test.ts`)
- Executor modules: descriptive name followed by `-executor` suffix (`discovery-executor.ts`, `prd-executor.ts`)

**Functions:**
- camelCase for all functions
- Prefixed with action verbs: `create*`, `get*`, `update*`, `delete*`, `search*`, `execute*`, `validate*`
- Examples: `createRun()`, `getSkillById()`, `updateSkillTrustLevel()`, `executeDiscovery()`, `verifyTask()`

**Variables:**
- camelCase for variables and constants
- Boolean prefixes: `is*`, `has*`, `can*`, `should*`
- Examples: `isSkillTrusted()`, `hasActiveWorkers()`, `canRunFullyAuto()`
- Descriptive names for collections: `skillIds`, `testSkills`, `gateResults`

**Types:**
- PascalCase for interfaces and types
- Suffix with Type, Interface, or descriptive classifier: `CreateSkillInput`, `GateDefinition`, `StageContext`, `ExecutionResult`
- Object types with explicit properties: `type CopyButtonProps`, `interface CommonControlledStateProps`
- Exported from barrel files with re-exports

## Code Style

**Formatting:**
- Uses Prettier (implicitly through Next.js setup)
- No explicit `.prettierrc` config - uses Next.js defaults
- No explicit formatting rules enforced in repo

**Linting:**
- ESLint 9 with Next.js config (`eslint-config-next`)
- Config file: `orchestrator/eslint.config.mjs`
- Applies `nextVitals` (Core Web Vitals rules) and `nextTs` (TypeScript rules)
- Overrides default ignores for `.next/**`, `out/**`, `build/**`, `next-env.d.ts`
- Rules configured via `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`

**TypeScript:**
- Target: ES2017
- Strict mode enabled
- Module resolution: bundler
- React JSX: react-jsx (automatic JSX)
- Paths alias: `@/*` maps to `./src/*`

## Import Organization

**Order:**
1. React and React-related imports
2. Next.js imports
3. Third-party packages (`lucide-react`, `motion/react`, `framer-motion`, etc.)
4. Drizzle ORM imports
5. Internal modules using path aliases (`@/lib`, `@/hooks`, `@/components`)
6. Type imports at top of each group

**Path Aliases:**
- `@/*` → `./src/*` (single alias)
- All internal imports use `@/` prefix, never relative paths like `../`
- Deeply nested imports work naturally: `@/lib/db`, `@/lib/execution`, `@/lib/skills`

**Examples:**
```typescript
// React/Next.js
import * as React from 'react';
import { NextRequest, NextResponse } from 'next/server';
import 'use client';

// Third-party
import { motion, AnimatePresence } from 'motion/react';
import { CheckIcon, CopyIcon } from 'lucide-react';

// Database
import { db } from '@/lib/db';
import { workspaces, skills } from '@/lib/db/schema';

// Internal utilities
import { cn } from '@/lib/utils';
import { useJobPolling } from '@/hooks/useJobPolling';

// Types
import type { ClassValue } from 'clsx';
import type { Skill, CreateSkillInput } from '@/lib/skills';
```

## Error Handling

**Patterns:**
- Console logging for errors: `console.error('Failed to...', error)`
- Console info/warn/log for execution flow: `console.log('[RunManager] Existing run found...')`
- Structured try-catch blocks in all async operations
- Error responses use `NextResponse.json({ error: "message" }, { status: 400 })`

**Examples from codebase:**
```typescript
// API route error handling
try {
  const projects = await getProjects(workspaceId, { includeArchived });
  return NextResponse.json(projects);
} catch (error) {
  console.error("Failed to get projects:", error);
  return NextResponse.json(
    { error: "Failed to get projects" },
    { status: 500 }
  );
}

// Run Manager logging
console.log(`[RunManager] Existing run found for card ${input.cardId} stage ${input.stage}, returning existing run`);
```

**Error Recovery:**
- Database operations include idempotency checks
- Run creation prevents duplicate queued/running runs for same card+stage
- Validation errors return appropriate HTTP status codes (400 for bad input, 500 for server errors)

## Logging

**Framework:** console (native)

**Patterns:**
- Context prefix in square brackets: `[ComponentName]` or `[ModuleName]`
- Examples: `[RunManager]`, `[discovery]`, `[executor]`
- Log levels through method: `console.log()`, `console.warn()`, `console.error()`
- Callbacks in async operations: `callbacks.onLog(level, message, context)`
- Progress updates: `callbacks.onProgress(percentage, message)`

**When to Log:**
- State transitions: run creation, status changes, stage advancement
- Important decision points: "Existing run found", "Synthesizing signals"
- Errors and failures: with stack trace in catch blocks
- Progress milestones in long operations: "0.2 Loading context", "0.4 Processing"

## Comments

**When to Comment:**
- Block comments for major sections using `// ============================================` separators
- JSDoc comments for public functions and complex logic
- Inline comments only for non-obvious algorithmic decisions

**JSDoc/TSDoc:**
- Used extensively for function contracts
- Example from gates.test.ts:
```typescript
/**
 * Contract Tests: Gates System
 *
 * Tests the gate validation system:
 * - File existence checks
 * - Content validation
 * - Artifact checks
 * - Metric thresholds
 */
```

- Example function comment:
```typescript
/**
 * Create a new stage run with idempotency protection
 */
export async function createRun(input: CreateRunInput): Promise<string>
```

**Comments in Hooks:**
```typescript
/**
 * useJobPolling - Hook for polling job status and triggering processing
 *
 * This hook provides:
 * 1. Automatic polling for job status updates
 * 2. Trigger job processing after stage changes
 * 3. Real-time progress updates for active jobs
 *
 * OPTIMIZATION: Uses adaptive polling and visibility detection to minimize
 * serverless function invocations
 */
```

## Function Design

**Size:** Functions are generally 40-100 lines with clear subsections marked by comments
- Executors: can be larger (50-150 lines) when coordinating multiple steps
- Hooks: 80-150 lines common for complex state management
- Components: 60-120 lines typical

**Parameters:**
- Objects for multiple parameters (input types)
- Single parameter when possible: `CreateSkillInput`, `StageContext`, `CopyButtonProps`
- Async callbacks passed explicitly: `callbacks: StreamCallback`

**Return Values:**
- Promise-based for async: `Promise<string>`, `Promise<StageExecutionResult>`
- Union types for success/failure: `{ success: boolean; error?: string; ... }`
- Explicit undefined/null returns when searching: `Skill | null`, `Promise<T | null>`

**Async Patterns:**
- All database queries wrapped in try-catch
- Callbacks provided for async streams and progress
- IDs generated with `nanoid()` for all new records
- Timestamps with `new Date()`

## Module Design

**Exports:**
- Barrel exports in `index.ts` files
- Example from `src/lib/skills/index.ts`:
```typescript
export { SkillsMPClient, getSkillsMPClient, ... } from "./skillsmp-client";
export { loadLocalSkills, getSkills, createSkill, ... } from "./skills-service";
export { getStageRecipe, createStageRecipe, ... } from "./stage-recipes-service";
export type { Skill, CreateSkillInput, StageRecipe, ... };
```

**Barrel Files:**
- Used for cleaner imports: `import { createSkill, getSkillById } from '@/lib/skills'`
- Organize related functionality into modules: `/skills`, `/execution`, `/db`
- Re-export types alongside implementations

**Module Structure:**
- Services handle business logic: `*-service.ts`, `*-client.ts`
- Executors handle automation: `*-executor.ts`
- Database: `schema.ts` for types, `queries.ts` or `index.ts` for helpers
- Hooks: separate files per hook, barrel exported from `/hooks`

## Component Patterns

**React Components:**
- Use 'use client' directive at top of client components
- Functional components with destructured props
- CSS-in-JS with Tailwind + CVA (class-variance-authority)
- Component slots with data-slot attributes for styling

**Example:**
```typescript
'use client';

import { motion } from 'motion/react';
import { cva } from 'class-variance-authority';

const copyButtonVariants = cva(
  "flex items-center justify-center...",
  {
    variants: {
      variant: { default: "...", ghost: "..." },
      size: { default: "size-9", sm: "size-8" }
    }
  }
);

export function CopyButton({ variant, size, ...props }: CopyButtonProps) {
  return <motion.button className={cn(copyButtonVariants({ variant, size }))} />;
}
```

**Form Patterns:**
- Controlled state with `useControlledState` hook
- Props: `value`, `defaultValue`, `onChange` callback
- Callbacks receive full context: `onChange(value, ...args)`

**Hooks Pattern:**
- Composition over inheritance
- Separation of concerns: `usePageVisibility()`, `useJobPolling()` split into smaller helpers
- Custom hooks named with `use` prefix
- Return tuples for state: `[value, setValue]` as const

## API Routes

**Structure:**
- File-based routing following Next.js App Router
- HTTP methods as exported functions: `export async function GET(...)`, `export async function POST(...)`
- Early validation: check required params first
- Error handling with try-catch
- Consistent response format: `NextResponse.json(data)` or `NextResponse.json({ error: msg }, { status })`

**Example:**
```typescript
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    const projects = await getProjects(workspaceId);
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Failed to get projects:", error);
    return NextResponse.json({ error: "Failed to get projects" }, { status: 500 });
  }
}
```

---

*Convention analysis: 2026-01-21*
