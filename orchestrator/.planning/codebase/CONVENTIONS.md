# Coding Conventions

**Analysis Date:** 2026-01-25

## Naming Patterns

**Files:**
- TypeScript/React: camelCase (e.g., `useWorkspaceRole.ts`, `permissions.ts`, `AgentArchitectureImporter.tsx`)
- API routes: descriptive kebab-case in directories (e.g., `/api/workspaces/route.ts`, `/api/skills/summaries/route.ts`)
- Test files: `.test.ts` or `.spec.ts` suffix (e.g., `auth.test.ts`, `skills.test.ts`)

**Functions:**
- camelCase for all function names (e.g., `getWorkspacesForUser()`, `createWorkspace()`, `evaluateGate()`)
- Async functions follow same camelCase pattern (e.g., `extractYouTubeCaptions()`, `classifySignal()`)
- React components: PascalCase (e.g., `AgentArchitectureImporter`, `BadgeComponent`)
- Hook functions: `use` prefix in camelCase (e.g., `useWorkspaceRole()`, `useJobPolling()`, `useRealtimeJobs()`)

**Variables:**
- camelCase for all variable names (e.g., `userId`, `workspaceId`, `testWorkspaceId`)
- Constants: UPPER_SNAKE_CASE (e.g., `DEFAULT_SELECTION`, `MODEL`, `MAX_TOKENS`, `CACHE_TTL_MS`)
- Database query results: camelCase (e.g., `const workspaces = await getWorkspaces()`)

**Types:**
- Interfaces: PascalCase, `Interface` suffix or descriptive name (e.g., `AgentArchitectureImporterProps`, `UseWorkspaceRoleResult`, `CreateSkillInput`, `AnalyzeResponse`)
- Type aliases: PascalCase (e.g., `VideoPlatform = "youtube" | "loom" | "unknown"`, `SkillSource`, `TrustLevel`)
- Generic types: PascalCase (e.g., `T`, `U`, `TData`)
- Database types: imported from schema (e.g., `type WorkspaceRole`, `type JobStatus`)

## Code Style

**Formatting:**
- No explicit formatter configured (Prettier not in use)
- ESLint configured with Next.js core web vitals and TypeScript rules
- Code follows standard Next.js 16+ patterns
- Consistent indentation: 2 spaces (observed in all files)
- Line continuations: No specific pattern, follows readability

**Linting:**
- Tool: ESLint 9 with Next.js config
- Config file: `eslint.config.mjs`
- Uses: `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Key rules enforced:
  - TypeScript strict mode enabled
  - React rules from Next.js config
  - No unused variables
  - Core Web Vitals compliance for Next.js

**TypeScript:**
- Target: ES2017
- Strict mode: enabled
- Module resolution: bundler
- JSX: react-jsx
- Import aliases: `@/*` → `./src/*`
- Excluded from type checking: `node_modules`, `src/__tests__`

## Import Organization

**Order:**
1. External third-party imports (React, Next.js, installed packages)
2. Internal library imports (from `@/lib/`)
3. Internal component imports (from `@/components/`)
4. Type imports (from schema, types, interfaces)
5. Database imports (db client, schema, queries)
6. Local relative imports (same directory)

**Examples from codebase:**
```typescript
// Example from src/app/api/workspaces/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getWorkspacesForUser, createWorkspace } from "@/lib/db/queries";
import { syncKnowledgeBase } from "@/lib/knowledgebase/sync";
import { getGitHubClient } from "@/lib/github/auth";

// Example from src/hooks/useWorkspaceRole.ts
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import type { WorkspaceRole } from "@/lib/db/schema";
```

**Path Aliases:**
- `@/` resolves to `./src/`
- All imports use the alias, never relative paths from distant directories

## Error Handling

**Patterns:**
- Custom error classes extend `Error` (e.g., `PermissionError`, `UnauthenticatedError`, `NotMemberError`, `InsufficientRoleError`)
- Custom error classes set `this.name = "ClassName"` and optionally include `code` and `status` properties
- API routes: catch all errors and return `NextResponse.json({ error: "message" }, { status: code })`
- Library functions: throw typed errors or return error objects
- Unsafe operations: wrapped in try-catch with console logging

**Example pattern from `src/lib/permissions.ts`:**
```typescript
export class PermissionError extends Error {
  constructor(
    message: string,
    public code: "UNAUTHENTICATED" | "NOT_MEMBER" | "INSUFFICIENT_ROLE",
    public status: number
  ) {
    super(message);
    this.name = "PermissionError";
  }
}

export class UnauthenticatedError extends PermissionError {
  constructor() {
    super("Authentication required", "UNAUTHENTICATED", 401);
  }
}
```

**Error handler utility:**
- `handlePermissionError()` function available for consistent error response formatting in API routes

## Logging

**Framework:** Native `console` object (no logging library)

**Patterns:**
- `console.log()` for informational messages
- `console.warn()` for warnings (missing data, fallbacks, deprecations)
- `console.error()` for errors with context
- `console.info()` for business-logic important events (optional, less common)

**Conventions:**
- Always include context: `console.log(`Generated embedding for project ${projectId}`)`
- Error logs include the error object: `console.error(`Failed to generate embedding:`, error)`
- Avoid logging sensitive data (passwords, tokens, API keys)
- Logging in catch blocks should include the operation context

**Examples from codebase:**
```typescript
console.log(`Generated embedding for project ${projectId} (${project.name})`);
console.warn(`Project ${projectId} not found for embedding generation`);
console.error(`Failed to generate embedding for project ${projectId}:`, error);
console.info(`Signal ${signalId} processed successfully`);
```

## Comments

**When to Comment:**
- JSDoc/TSDoc for public functions and interfaces
- Inline comments for non-obvious logic, workarounds, or complex conditionals
- Section headers using `// ============================================` for large files
- Avoid obvious comments ("increment counter" on `i++`)

**JSDoc/TSDoc:**
- Used extensively for functions, interfaces, and async operations
- Format: block comment with `/**` and `@` tags
- Tags observed: `@param`, `@returns`, `@throws`, `@example`

**Examples from codebase:**
```typescript
/**
 * Get workspaces for a specific user (only workspaces they are a member of)
 */
export async function getWorkspacesForUser(userId: string) {
  // Implementation
}

/**
 * @throws Error if no captions are available
 */
export async function extractYouTubeCaptions(url: string) {
  // Implementation
}

/**
 * Check if a role has at least the required permission level
 */
export function hasPermission(
  userRole: WorkspaceRole,
  requiredRole: WorkspaceRole
): boolean {
  // Implementation
}
```

**File Headers:**
- Files use JSDoc block comment at top describing purpose
- Multi-line comment describing what the module does

## Function Design

**Size:**
- Prefer functions under 50 lines for readability
- Larger operations split into helpers
- API route handlers kept focused on validation, business logic, response formatting

**Parameters:**
- Prefer objects over multiple parameters
- Use destructuring for props in React components
- Named parameters for clarity

**Return Values:**
- Explicit types on all function signatures
- Async functions return `Promise<Type>`
- Void functions rare; prefer returning status objects
- API routes return `NextResponse` or `NextRequest`

**Example from `src/app/api/auth/signup/route.ts`:**
```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }
    // ... more logic
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
```

## Module Design

**Exports:**
- Named exports preferred over default exports
- Export types alongside implementations
- Barrel files (`index.ts`) used to consolidate exports from a module

**Barrel Files:**
- Location: `src/lib/*/index.ts`, `src/hooks/index.ts`, `src/components/*/index.ts`
- Pattern: Re-export all public functions and types from module
- Example from `src/hooks/index.ts`:
  ```typescript
  export { useJobPolling, useProjectJobs } from "./useJobPolling";
  export { useRealtimeJobs, useSSEConnectionStatus } from "./useRealtimeJobs";
  export { useBrowserNotifications } from "./useBrowserNotifications";
  ```

**Module Structure:**
- Constants and types at the top with `// ============================================` headers
- Main functions follow
- Helper functions at bottom
- Clear separation of concerns

**Example from `src/lib/agent/executor.ts`:**
```typescript
// ============================================
// CONFIGURATION
// ============================================

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 4096;
const MAX_TOOL_ITERATIONS = 10;

// ============================================
// AGENT EXECUTOR CLASS
// ============================================

export class AgentExecutor {
  // Implementation
}
```

---

*Convention analysis: 2026-01-25*
