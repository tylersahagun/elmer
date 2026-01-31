# Testing Patterns

**Analysis Date:** 2026-01-25

## Test Framework

**Runner:**
- Vitest 2.1.0
- Config: `vitest.config.ts`
- Environment: node
- Global test functions enabled

**Assertion Library:**
- Built-in Vitest assertions via `expect()`

**Run Commands:**
```bash
npm test                # Run all tests in watch mode
npm run test:run        # Run all tests once (CI mode)
npm run test:ui         # Run with Vitest UI
```

## Test File Organization

**Location:**
- Tests co-located in `src/__tests__/` directory structure
- Mirror source directory structure under `__tests__/`
- Current test directories:
  - `src/__tests__/auth/` - Authentication tests
  - `src/__tests__/execution/` - Execution system tests
  - `src/__tests__/api/` - API endpoint tests

**Naming:**
- Pattern: `[module].test.ts`
- Examples: `auth.test.ts`, `permissions.test.ts`, `skills.test.ts`, `gates.test.ts`

**Setup:**
- Setup file: `src/__tests__/setup.ts`
- Runs before all tests
- Configures environment variables, global utilities, and mocks
- Loads `.env.local` for test database connection

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";

describe("Feature Name Tests", () => {
  describe("Specific Behavior", () => {
    it("should do something specific", async () => {
      // Test body
    });

    it("should handle error cases", async () => {
      // Test body
    });
  });

  describe("Another Behavior", () => {
    it("should do another thing", async () => {
      // Test body
    });
  });
});
```

**Patterns:**
- Top-level: `describe("Feature Name Tests")` - describes the system being tested
- Second level: `describe("Specific Behavior")` - groups related test cases
- Individual tests: `it("should do something")` - describes expected behavior
- Setup: `beforeAll()` for expensive setup (database records, workspace creation)
- Teardown: `afterAll()` for cleanup (delete test records from database)
- Granular setup: `beforeEach()` for test isolation when needed

**Example from `src/__tests__/auth/auth.test.ts`:**
```typescript
describe("Authentication System Tests", () => {
  describe("Password Hashing", () => {
    it("should hash passwords using bcryptjs", async () => {
      const password = "MySecurePassword123";
      const hash = await bcrypt.hash(password, 10);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    it("should verify correct password against hash", async () => {
      const password = "MySecurePassword123";
      const hash = await bcrypt.hash(password, 10);

      const isValid = await bcrypt.compare(password, hash);
      expect(isValid).toBe(true);
    });
  });

  describe("User Creation", () => {
    afterAll(async () => {
      // Cleanup test user
      await db.delete(users).where(eq(users.email, TEST_USER_EMAIL));
    });

    it("should create a user with hashed password", async () => {
      const passwordHash = await bcrypt.hash(TEST_USER_PASSWORD, 10);

      await db.insert(users).values({
        id: `user_${nanoid(8)}`,
        email: TEST_USER_EMAIL,
        name: "Test User",
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const user = await db.query.users.findFirst({
        where: eq(users.email, TEST_USER_EMAIL),
      });

      expect(user).toBeDefined();
      expect(user?.email).toBe(TEST_USER_EMAIL);
    });
  });
});
```

## Mocking

**Framework:** Vitest's built-in `vi` object

**Patterns:**
```typescript
import { vi } from "vitest";

// Mock an entire module
vi.mock("@/lib/db", () => ({
  db: {
    query: {
      skills: {
        findFirst: vi.fn(),
      },
    },
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
  },
}));

// Mock with implementation
vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{ type: "text", text: "Response" }],
      }),
    },
  })),
}));

// Clear mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});
```

**What to Mock:**
- External APIs (Anthropic, GitHub, etc.)
- File system operations (`fs/promises`)
- Database (in API tests that don't use real DB)
- Third-party services

**What NOT to Mock:**
- Database operations (use real test database when possible for integration tests)
- Core business logic (test actual implementations)
- React hooks in component tests (let them run naturally)
- Authentication functions (test real auth flow)

**Example from `src/__tests__/api/skill-summaries-api.test.ts`:**
```typescript
// Mock the database
vi.mock("@/lib/db", () => ({
  db: {
    query: {
      skills: {
        findFirst: vi.fn(),
      },
    },
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
  },
}));

// Mock Anthropic
vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{ type: "text", text: "This is a generated summary." }],
      }),
    },
  })),
}));

describe("POST /api/skills/summaries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return summaries for valid skill IDs", async () => {
    const { POST } = await import("@/app/api/skills/summaries/route");

    const request = new NextRequest("http://localhost:3000/api/skills/summaries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        skillIds: ["analyze_transcript", "generate_prd", "build_prototype"],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.summaries).toBeDefined();
  });
});
```

## Fixtures and Factories

**Test Data:**
- Named constants for test fixtures (workspaceId, projectId, userId patterns)
- Nanoid for generating unique IDs: `const TEST_WORKSPACE_ID = \`test_ws_${nanoid(8)}\`;`
- Inline fixture creation in `beforeAll()` when data is simple
- Test data cleanup in `afterAll()` to prevent test pollution

**Location:**
- Fixtures defined at top of test file as constants
- Complex setup logic in `beforeAll()` hook
- Database insertion uses actual schema and Drizzle ORM

**Example from `src/__tests__/execution/skills.test.ts`:**
```typescript
const TEST_WORKSPACE_ID = `test_ws_${nanoid(8)}`;

describe("Skills System Contract Tests", () => {
  beforeAll(async () => {
    // Create test workspace
    await db.insert(workspaces).values({
      id: TEST_WORKSPACE_ID,
      name: "Test Workspace",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  afterAll(async () => {
    // Cleanup test data
    await db.delete(skills).where(eq(skills.workspaceId, TEST_WORKSPACE_ID));
    await db.delete(workspaces).where(eq(workspaces.id, TEST_WORKSPACE_ID));
  });

  it("should create a local skill", async () => {
    const input: CreateSkillInput = {
      workspaceId: TEST_WORKSPACE_ID,
      source: "local",
      name: "Test Research Skill",
      description: "Analyzes user research transcripts",
      version: "1.0.0",
      trustLevel: "community",
      tags: ["research", "analysis"],
      promptTemplate: "Analyze the following transcript: {{transcript}}",
    };

    const skillId = await createSkill(input);
    expect(skillId).toBeDefined();
    expect(skillId).toMatch(/^skill_/);
  });
});
```

## Coverage

**Requirements:** Not enforced (no coverage threshold in config)

**View Coverage:**
```bash
npm run test:run -- --coverage
```

**Coverage Config:**
- Provider: v8
- Reporters: text, json, html
- Excluded:
  - `node_modules/`
  - `.next/`
  - `**/*.d.ts`
  - `**/*.config.*`
  - `**/types.ts`

## Test Types

**Unit Tests:**
- Scope: Individual functions, business logic, utilities
- Approach: Test in isolation, mock dependencies
- Location: Co-located with source in `src/__tests__/`
- Examples: Permission checks, password hashing, skill creation

**Integration Tests:**
- Scope: Multiple components working together, database operations, full workflows
- Approach: Use real database (test database), test actual operations
- Location: `src/__tests__/execution/integration.test.ts` and similar
- Examples: Full execution flow, workspace creation with permission checks, signal processing

**E2E Tests:**
- Status: Not currently implemented
- Would test: Full user workflows from API entry points
- Note: Current tests are unit/integration; full E2E requires running server

## Common Patterns

**Async Testing:**
```typescript
it("should handle async operations", async () => {
  const result = await asyncFunction();

  expect(result).toBeDefined();
  expect(result.property).toBe(expectedValue);
});
```

**Error Testing:**
```typescript
it("should reject with error for invalid input", async () => {
  const response = await fetch("http://localhost:3000/api/endpoint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ invalid: "data" }),
  });

  expect(response.status).toBe(400);
  const data = await response.json();
  expect(data.error).toBeDefined();
});

it("should throw on missing required field", async () => {
  const user = await db.query.users.findFirst({
    where: eq(users.email, "nonexistent@example.com"),
  });

  expect(user).toBeUndefined();
});
```

**Database Testing:**
```typescript
it("should create and retrieve from database", async () => {
  const testId = nanoid();

  // Insert
  await db.insert(workspaces).values({
    id: testId,
    name: "Test",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Retrieve
  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.id, testId),
  });

  expect(workspace).toBeDefined();
  expect(workspace?.name).toBe("Test");

  // Cleanup
  await db.delete(workspaces).where(eq(workspaces.id, testId));
});
```

**API Route Testing:**
```typescript
it("should validate request and return error", async () => {
  const { POST } = await import("@/app/api/auth/signup/route");

  const request = new NextRequest("http://localhost:3000/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test@example.com" }), // Missing password
  });

  const response = await POST(request);

  expect(response.status).toBe(400);
  const data = await response.json();
  expect(data.error).toContain("password");
});
```

## Environment Setup

**Test Environment Variables:**
- Loaded from `.env.local` in vitest setup
- Critical vars: `DATABASE_URL`, `ANTHROPIC_API_KEY`
- Missing `DATABASE_URL` logs warning but doesn't fail (allows unit tests to run)
- Missing `ANTHROPIC_API_KEY` defaults to test value

**Setup File (`src/__tests__/setup.ts`):**
- Runs before all tests
- Loads env from `.env.local`
- Provides global test utilities (e.g., `testUtils.createMockRequest()`)
- Can be extended with global mocks and configuration

**Running Tests:**
```bash
# All tests in watch mode
npm test

# Single run (for CI)
npm run test:run

# With UI
npm run test:ui

# Specific test file
npm test -- auth.test.ts

# Coverage report
npm run test:run -- --coverage
```

---

*Testing analysis: 2026-01-25*
