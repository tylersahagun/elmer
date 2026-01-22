# Testing Patterns

**Analysis Date:** 2026-01-21

## Test Framework

**Runner:**
- Vitest (detected from import statements in test files)
- Config file: Not found in root (likely inferred from package.json or tsconfig)
- Imported via: `import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest"`

**Assertion Library:**
- Vitest built-in expect (uses Chai-style assertions)

**Run Commands:**
Tests are defined but no explicit test commands found in orchestrator `package.json`. Configuration would be:
```bash
vitest                  # Run tests in watch mode
vitest run             # Run tests once
vitest --coverage      # Run with coverage
```

## Test File Organization

**Location:**
- Co-located in `src/__tests__/` directory (separate from source)
- Organized by feature: `execution/` contains execution-related tests

**Naming:**
- Format: `{feature}.test.ts` (e.g., `skills.test.ts`, `gates.test.ts`)
- Located in: `orchestrator/src/__tests__/execution/`

**Structure:**
```
orchestrator/
├── src/
│   ├── __tests__/
│   │   ├── execution/
│   │   │   ├── gates.test.ts
│   │   │   ├── skills.test.ts
│   │   │   ├── stage-recipes.test.ts
│   │   │   ├── integration.test.ts
│   │   │   └── run-lifecycle.test.ts
│   ├── lib/
│   ├── components/
│   └── app/
```

## Test Structure

**Suite Organization:**
```typescript
/**
 * Contract Tests: [Feature Name]
 *
 * Description of what's tested:
 * - Feature 1
 * - Feature 2
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import { tables, otherDeps } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { functionToTest } from "@/lib/module";

// Test fixtures
const TEST_WORKSPACE_ID = `test_ws_${nanoid(8)}`;

describe("Feature Contract Tests", () => {
  beforeAll(async () => {
    // Setup shared test data
  });

  afterAll(async () => {
    // Cleanup test data
  });

  describe("Sub-feature", () => {
    it("should do something specific", async () => {
      // Arrange
      const input = { /* ... */ };

      // Act
      const result = await functionToTest(input);

      // Assert
      expect(result).toBeDefined();
      expect(result).toMatch(/^prefix_/);

      // Cleanup if needed
      await db.delete(table).where(eq(table.id, result));
    });
  });
});
```

**Patterns:**
- Setup phase: `beforeAll()` creates test workspace/project fixtures
- Teardown phase: `afterAll()` deletes test data via drizzle-orm
- Per-test cleanup: individual tests delete their records after assertions
- Nested describe blocks for logical grouping

## Mocking

**Framework:** Drizzle ORM for database - tests use real database (not mocked)

**Patterns:**
Tests use actual database queries, not mocks:
```typescript
// Create test workspace
await db.insert(workspaces).values({
  id: TEST_WORKSPACE_ID,
  name: "Test Workspace",
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Query created data
const skill = await getSkillById(skillId);
expect(skill).toBeDefined();
expect(skill?.name).toBe("Test Research Skill");

// Cleanup
await db.delete(skills).where(eq(skills.id, skillId));
```

**Context Mocking:**
For gate evaluation tests, mock data structures are passed as parameters:
```typescript
const files = new Map([["initiatives/test/prd.md", "# PRD Content"]]);
const metrics = new Map([["jury_score", 85]]);

const result = await evaluateGate(gate, {
  cardId: TEST_PROJECT_ID,
  workspaceId: TEST_WORKSPACE_ID,
  stage: "prd",
  files,
  metrics,
});
```

**What to Mock:**
- File systems: Use Map<string, string> for file paths/content
- Metrics data: Use Map<string, number> for metric values
- External API responses: Not shown in current tests (database-focused)

**What NOT to Mock:**
- Database operations: Use real database connection
- Date/time: Use `new Date()` directly
- IDs: Generate with `nanoid()` in fixtures
- Core business logic functions

## Fixtures and Factories

**Test Data:**
Fixtures created at test start using nanoid for uniqueness:
```typescript
const TEST_WORKSPACE_ID = `test_ws_${nanoid(8)}`;
const TEST_PROJECT_ID = `test_proj_${nanoid(8)}`;
const TEST_WORKER_ID = `test_worker_${nanoid(8)}`;
```

Factory-like objects created in beforeAll:
```typescript
const testSkills: CreateSkillInput[] = [
  {
    workspaceId: TEST_WORKSPACE_ID,
    source: "local",
    name: "Research Analyzer",
    description: "Analyzes user research data",
    version: "1.0.0",
    trustLevel: "vetted",
    tags: ["research", "analysis"],
  },
  // More skill definitions
];

for (const skill of testSkills) {
  const id = await createSkill(skill);
  skillIds.push(id);
}
```

**Location:**
- Inline in test files within `beforeAll()` hooks
- No separate fixtures directory or factory pattern file
- Fixtures scoped to describe blocks where they're used

## Coverage

**Requirements:** Not enforced (no coverage configuration found)

**View Coverage:** Would require vitest config with coverage reporter (not currently configured)

**Current Test Gaps:**
- No UI component tests (component testing not set up)
- No API route tests (need separate test setup)
- No hook tests (React hooks testing library not installed)
- Database tests comprehensive but frontend/API routes untested

## Test Types

**Unit Tests:**
- Scope: Individual module functions in isolation
- Approach: Database-backed integration tests in unit naming (e.g., `createSkill()`, `getSkillById()`)
- Example: `Skills System Contract Tests` - tests skills CRUD operations
- Database layer tested with real data, not unit-isolated

**Integration Tests:**
- Scope: Multiple functions working together in a workflow
- Approach: Tests the complete flow: create → search → update → delete
- Example from `run-lifecycle.test.ts`:
  1. Create run with specific status
  2. Claim run (worker assignment)
  3. Add logs to run
  4. Create artifacts
  5. Complete run
  6. Verify status transitions

**Contract Tests:**
- Named "Contract Tests" in this codebase (descriptive label, not formal pattern)
- Tests contracts between modules and database
- Verifies: inputs → expected outputs, state transitions, data persistence
- Example: `Skills System Contract Tests` verifies skill service contract with database

**E2E Tests:**
- Not found in current test suite
- Would be needed for full stage execution workflows

## Test Examples

**Skill Creation Test:**
```typescript
describe("Skill Creation", () => {
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

    const skill = await getSkillById(skillId);
    expect(skill).toBeDefined();
    expect(skill?.name).toBe("Test Research Skill");
    expect(skill?.source).toBe("local");
    expect(skill?.trustLevel).toBe("community");

    // Cleanup
    await db.delete(skills).where(eq(skills.id, skillId));
  });
});
```

**Gate Evaluation Test:**
```typescript
describe("File Existence Gates", () => {
  it("should pass when file exists", async () => {
    const gate: GateDefinition = {
      id: "test_file",
      name: "Test File Gate",
      type: "file_exists",
      config: { pattern: "prd.md" },
      required: true,
      failureMessage: "PRD not found",
    };

    const files = new Map([["initiatives/test/prd.md", "# PRD Content"]]);

    const result = await evaluateGate(gate, {
      cardId: TEST_PROJECT_ID,
      workspaceId: TEST_WORKSPACE_ID,
      stage: "prd",
      files,
    });

    expect(result.passed).toBe(true);
  });

  it("should fail when file does not exist", async () => {
    const gate: GateDefinition = {
      id: "test_file",
      name: "Test File Gate",
      type: "file_exists",
      config: { pattern: "prd.md" },
      required: true,
      failureMessage: "PRD not found",
    };

    const files = new Map([["initiatives/test/research.md", "# Research"]]);

    const result = await evaluateGate(gate, {
      cardId: TEST_PROJECT_ID,
      workspaceId: TEST_WORKSPACE_ID,
      stage: "prd",
      files,
    });

    expect(result.passed).toBe(false);
    expect(result.message).toBe("PRD not found");
  });
});
```

## Async Testing

**Pattern:**
All test functions are `async` with `await` for database operations:
```typescript
it("should create a run with queued status", async () => {
  const runId = await createRun({
    cardId: TEST_PROJECT_ID,
    workspaceId: TEST_WORKSPACE_ID,
    stage: "inbox",
    triggeredBy: "test",
  });

  expect(runId).toBeDefined();

  const run = await getRunById(runId);
  expect(run?.status).toBe("queued");
});
```

**Callbacks:**
Stream callbacks tested by capturing in function:
```typescript
// In actual code
callbacks.onLog("info", "Starting discovery synthesis", "discovery");

// In tests, use mock callback or inline evaluation
const context: StageContext = {
  run: /* ... */,
  callbacks: {
    onLog: (level, msg, context) => {
      // Verify in assertions
    }
  }
};
```

## Error Testing

**Pattern:**
Tests verify both success and failure paths:
```typescript
describe("Skill Deletion", () => {
  it("should delete a skill", async () => {
    const skillId = await createSkill(input);
    let skill = await getSkillById(skillId);
    expect(skill).toBeDefined();

    const deleted = await deleteSkill(skillId);
    expect(deleted).toBe(true);

    skill = await getSkillById(skillId);
    expect(skill).toBeNull();
  });

  it("should return false when deleting non-existent skill", async () => {
    const deleted = await deleteSkill("skill_nonexistent123");
    expect(deleted).toBe(false);
  });
});
```

**Error Cases:**
- Missing required data: "No research signals found"
- Invalid state transitions: gates blocking advancement
- Missing metrics: "Metric not found"
- Null/undefined returns: verified with `expect(result).toBeNull()`

## Database Testing

**Setup:**
- Real Neon PostgreSQL database used (configured via environment)
- Connection: `import { db } from "@/lib/db"`
- Migrations applied before tests

**Operations:**
- Insert: `await db.insert(table).values({ /* data */ })`
- Select: `await db.select().from(table).where(eq(table.id, id))`
- Delete: `await db.delete(table).where(eq(table.id, id))`

**Cleanup Strategy:**
- Each test deletes its own records after assertions
- `afterAll()` performs bulk cleanup for shared fixtures
- Uses `eq()` and `and()` from drizzle-orm for conditions

## Adding New Tests

**Location:** Create file in `src/__tests__/{feature}/`

**Template:**
```typescript
/**
 * Contract Tests: [Feature Name]
 *
 * Tests the [feature] functionality:
 * - [Functionality 1]
 * - [Functionality 2]
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import { /* required schemas */ } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { /* functions to test */ } from "@/lib/module";

// Test fixtures
const TEST_ID = `test_${nanoid(8)}`;

describe("[Feature] Tests", () => {
  beforeAll(async () => {
    // Setup
  });

  afterAll(async () => {
    // Cleanup
  });

  describe("[Sub-feature]", () => {
    it("should [expected behavior]", async () => {
      // Test code
    });
  });
});
```

**Guidelines:**
- Use database-backed tests for contract testing
- One file per feature area
- Include both success and failure cases
- Clean up all test data after each test
- Organize with nested describe blocks
- Use clear assertion messages

---

*Testing analysis: 2026-01-21*
