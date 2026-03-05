# Testing Patterns

**Analysis Date:** 2026-02-04

## Test Framework

**Runner:**
- Vitest 4.0.17
- Config: Test configuration lives in `package.json` scripts (no separate vitest.config file)

**Assertion Library:**
- Vitest built-in (uses Node assertion compatible API)
- Supports `expect()` from vitest

**Run Commands:**
```bash
pnpm -F functions test              # Watch mode
pnpm -F functions test:ci           # CI mode (run once, exit)
pnpm -F functions test:coverage     # Generate coverage report
pnpm -F functions test:gc           # GC-exposed test (for memory tests)
pnpm -F web test:ci                 # Web app tests
pnpm -F mobile test                 # Mobile app tests (Jest)
pnpm -F apps/mobile test            # Alias for mobile tests
```

**Environment:**
- Tests run with `DEPLOY_ENV=test` environment variable set
- Tests use `--passWithNoTests --silent=true` flags (pass if no tests found, suppress output)

## Test File Organization

**Location:**
- Backend: Co-located with source (e.g., `{feature}.test.ts` next to `{feature}.ts`)
- Web frontend: Co-located with component (e.g., `entity-mention-utils.test.tsx`)
- Mobile: Various patterns including `hooks/__tests__/` subdirectories

**Naming:**
- Unit tests: `{feature}.test.ts` or `{feature}.test.tsx`
- Integration tests: `{feature}.integration.test.ts`
- Compatibility tests: `{feature}.compatibility.test.ts`
- Behavior/contract tests: `{feature}.behavior.test.ts`
- Data source tests: `{feature}.data-source.test.ts`

**Structure:**
```
functions/src/contexts/engagements/
├── engagements.context.ts
├── engagements.context.test.ts          # Unit test
├── engagements.data-source.test.ts      # Data source behavior test
├── engagements.integration.test.ts      # Cross-context integration test
├── engagements.test.factory.ts          # Test data factory
└── resolvers/
    ├── Subscription/
    │   └── engagementBotDetailsUpdatedForUser.test.ts
    └── Query/
        └── engagements.test.ts
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { withRollback } from '@/utils/pg-utils.js';
import { createEngagement } from './engagements.context.js';
import { engagementFactory } from './engagements.test.factory.js';

describe('engagements.context', () => {
  describe('createEngagement', () => {
    it('creates an engagement with valid data', async () => {
      await withRollback(async (tx) => {
        const engagement = await createEngagement({ /* params */ }, tx);
        expect(engagement.id).toMatch(/^eng_/);
      });
    });

    it('handles duplicate engagements gracefully', async () => {
      await withRollback(async (tx) => {
        await createEngagement({ /* params */ }, tx);
        // Test collision path or expected error
      });
    });
  });
});
```

**Patterns:**
- Use `describe()` to group related tests (usually one per exported function)
- Use `it()` for individual test cases with clear, descriptive titles
- `beforeEach()` for test setup that doesn't need rollback isolation
- `afterEach()` for teardown (e.g., clearing fake timers)
- Database tests: Always wrap in `withRollback(async (tx) => { ... })`

## Database Testing

**withRollback Pattern:**
- Wraps every database interaction in a transaction that rolls back after test completes
- Ensures zero test pollution—each test starts with clean state
- Data persists only during test execution, never gets committed

**Factory Pattern:**
- File: `{model}s.test.factory.ts` (example: `privacy-agent-results.test.factory.ts`)
- Export single object: `export const privacyAgentResultFactory = { genId, create }`
- Factories call context functions (not repository directly)
- Never fake data in memory—write real records through context

**Factory API:**
```typescript
// ID generation helper
genId: () => string                    // Returns new prefixed ID

// Create helper with defaults and overrides
create: (
  params: Partial<ModelCreateParams>,
  tx: DrizzleDb
): Promise<DbModel>

// Pattern: spread defaults first, overrides last
const create = async (params: Partial<CreateParams>, tx: DrizzleDb) => {
  return createModel(
    {
      ...{
        name: 'default name',
        email: 'test@example.com',
      },
      ...params,
    },
    tx
  );
};
```

**Example factory:**
```typescript
import { faker } from '@faker-js/faker';
import { createUlid } from '../../db/schema.js';
import { privacyAgentResultFactory } from './privacy-agent-results.test.factory.js';

const genId = () => createUlid('par');

const create = async (
  params: Partial<PrivacyAgentResultCreateParams>,
  tx: DrizzleDb
): Promise<DbPrivacyAgentResult> => {
  return createPrivacyAgentResult(
    {
      ...{
        shortReasonText: faker.lorem.sentence(),
        longReasonMarkdown: faker.lorem.paragraph(),
      },
      ...params,
    },
    tx
  );
};

export const privacyAgentResultFactory = {
  genId,
  create,
};
```

**Using factories in tests:**
```typescript
describe('getPrivacyAgentResultsByIds', () => {
  it('returns privacy agent results by ids', async () => {
    await withRollback(async (tx) => {
      const result1 = await privacyAgentResultFactory.create({}, tx);
      const result2 = await privacyAgentResultFactory.create({}, tx);

      const results = await getPrivacyAgentResultsByIds([result1.id, result2.id], tx);

      expect(results).toHaveLength(2);
      expect(results.map((r) => r.id)).toContain(result1.id);
      expect(results.map((r) => r.id)).toContain(result2.id);
    });
  });
});
```

## Context Testing Requirements

**What to test:**
- Every exported context function
- Happy path and error/collision paths
- Boundary conditions (empty lists, null values, etc.)

**What NOT to test:**
- Internal helper functions (only test the exported API)
- Mocked database operations (test with real database)
- Repository implementations directly (test via context functions)

**Example test pattern:**
```typescript
describe('createEngagement', () => {
  it('creates engagement with valid data', async () => {
    await withRollback(async (tx) => {
      const result = await createEngagement({ /* params */ }, tx);
      expect(result.id).toMatch(/^eng_/);
      expect(result.createdAt).toBeInstanceOf(Date);
    });
  });

  it('throws on invalid data', async () => {
    await withRollback(async (tx) => {
      await expect(() =>
        createEngagement({ /* invalid params */ }, tx)
      ).rejects.toThrow();
    });
  });
});
```

## Mocking

**What to Mock:**
- External API calls (Salesforce, Gong, etc.)
- Firebase services (Auth, Cloud Functions triggers)
- Third-party services (Stripe, Novu, etc.)
- Time/timers (via `vi.useFakeTimers()`)

**What NOT to Mock:**
- Database operations (use `withRollback` with real database)
- Internal context functions (call them directly)
- GraphQL resolvers that coordinate contexts (test the orchestration)

**Mocking Patterns:**

**1. vi.useFakeTimers() for time-dependent logic:**
```typescript
describe('Lock Functions', () => {
  let client: InMemoryClient;

  beforeEach(() => {
    client = new InMemoryClient();
    vi.useFakeTimers();  // Enable fake timers
  });

  afterEach(() => {
    client.clear();
    vi.useRealTimers();  // Reset to real timers
  });

  it('should allow acquiring an expired lock', async () => {
    await acquireLock(client, 'test-key', 'test-value', 1);
    vi.advanceTimersByTime(1100);  // Advance time
    const secondAcquire = await acquireLock(client, 'test-key', 'test-value-2');
    expect(secondAcquire).toBe(true);
  });
});
```

**2. Mock external API clients (if needed):**
```typescript
import { vi } from 'vitest';

const mockGongClient = {
  getCallDetails: vi.fn().mockResolvedValue({ /* mock data */ }),
};

// Inject mock in test
const result = await processCallImport(mockGongClient, params);
```

**3. vi.fn() for function spies:**
```typescript
const logSpy = vi.fn();
// Inject or replace logger
await runWithLoggingContext({ logger: logSpy }, async () => {
  // Test code
});
expect(logSpy).toHaveBeenCalledWith('expected message');
```

## Frontend Testing (Web & Mobile)

**Web (Vitest + Testing Library):**
```typescript
import { describe, it, expect } from 'vitest';
import { createEditor, $getRoot, $createParagraphNode } from 'lexical';
import { extractEntityMentions } from './entity-mention-utils';

describe('extractEntityMentions', () => {
  it('extracts text from simple text nodes', () => {
    const editor = createEditor({});

    editor.update(() => {
      const root = $getRoot();
      root.clear();
      const paragraph = $createParagraphNode();
      paragraph.append($createTextNode('Hello world'));
      root.append(paragraph);
    }, { discrete: true });

    const result = extractEntityMentions(editor.getEditorState());
    expect(result.expandedText).toBe('Hello world');
  });
});
```

**Mobile (Jest):**
- Config: `apps/mobile/jest.config.js`
- Command: `pnpm -F mobile test` or `pnpm -F apps/mobile test`
- Uses same `describe`/`it`/`expect` API as Vitest

**Storybook Testing:**
- Web: `pnpm -F web storybook`
- Create stories with typed props using `makeFragmentData` for GraphQL mocks:

```typescript
import { makeFragmentData } from '@/lib/gql';
import { MyComponent, MyComponentFragment } from './my-component';

export const Default: Story = {
  args: {
    data: makeFragmentData(
      { id: '1', name: 'Test', description: 'Description' },
      MyComponentFragment
    ),
  },
};
```

## Async Testing

**Async functions in tests:**
```typescript
it('waits for async operation', async () => {
  await withRollback(async (tx) => {
    const result = await someAsyncFunction(tx);
    expect(result).toBeDefined();
  });
});
```

**Expecting async errors:**
```typescript
it('throws on invalid input', async () => {
  await withRollback(async (tx) => {
    await expect(async () => {
      await invalidOperation(tx);
    }).rejects.toThrow('expected error message');
  });
});
```

**Using fake timers with async:**
```typescript
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it('expires after timeout', async () => {
  const promise = waitForExpire();
  vi.advanceTimersByTime(5000);
  await promise;
  expect(...).toBe(true);
});
```

## Snapshot Testing

**Web Components:**
- Snapshot tests are allowed for UI structure validation
- Regenerate snapshots ONLY when visual changes are intentional
- Snapshots live alongside test files with `.snap.ts` extension

**When to use:**
- Stable component structure
- Complex conditional rendering
- Output validation

**When NOT to use:**
- Dynamic content (IDs, timestamps)
- API responses that change frequently
- Avoid snapshot tests that are too large or complex

## Coverage

**Requirements:**
- No explicit coverage target enforced per context/file
- Aim for >80% coverage on critical paths (context layer)
- Coverage gaps identified during code review

**Generate coverage report:**
```bash
pnpm -F functions test:coverage
```

**View coverage:**
```bash
# After running test:coverage
open coverage/index.html
```

## E2E Testing

**Runner:**
- Playwright 1.56.1
- Config: `playwright.config.ts` at repo root

**Run Commands:**
```bash
pnpm test:e2e           # Headless E2E tests
pnpm test:e2e:ui        # Interactive UI mode
```

**Test Files:**
- Located in `apps/web/e2e/` (example: `login.spec.ts`, `grain-modal-test.spec.ts`)
- Filename pattern: `{feature}.spec.ts`

**Example E2E test:**
```typescript
import { test, expect } from '@playwright/test';

test('user can login and see dashboard', async ({ page }) => {
  await page.goto('http://localhost:3001');
  await page.fill('input[name=email]', 'test@example.com');
  await page.fill('input[name=password]', 'password');
  await page.click('button[type=submit]');
  await expect(page).toHaveURL(/.*dashboard/);
});
```

## Common Test Patterns

**Testing database operations with factory:**
```typescript
it('filters engagements by workspace', async () => {
  await withRollback(async (tx) => {
    const workspace1 = await workspaceFactory.create({ name: 'WS1' }, tx);
    const workspace2 = await workspaceFactory.create({ name: 'WS2' }, tx);

    const eng1 = await engagementFactory.create({ workspaceId: workspace1.id }, tx);
    const eng2 = await engagementFactory.create({ workspaceId: workspace2.id }, tx);

    const results = await getEngagementsByWorkspaceId(workspace1.id, tx);

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(eng1.id);
  });
});
```

**Testing empty/edge cases:**
```typescript
it('returns empty array for non-existent workspace', async () => {
  await withRollback(async (tx) => {
    const results = await getEngagementsByWorkspaceId('non-existent-id', tx);
    expect(results).toHaveLength(0);
  });
});
```

**Testing collision paths (unique constraints):**
```typescript
it('handles duplicate engagement gracefully', async () => {
  await withRollback(async (tx) => {
    const params = { externalId: 'ext_123', workspaceId: 'ws_1' };

    const first = await createEngagement(params, tx);
    const second = await createEngagement(params, tx);

    // Verify collision was detected
    expect(first.id).toBe(second.id);
  });
});
```

**Testing computed values or transformations:**
```typescript
it('computes display name from first and last name', () => {
  const result = displayName({ firstName: 'John', lastName: 'Doe' });
  expect(result).toBe('John Doe');
});

it('returns first name if last name missing', () => {
  const result = displayName({ firstName: 'John', lastName: undefined });
  expect(result).toBe('John');
});
```

## Quality Gates

**Before committing:**
- Run `pnpm -F functions test:ci` (backend)
- Run `pnpm -F web test:ci` (frontend)
- Run `pnpm lint:ci` (all linting)
- Ensure no skipped tests (`it.skip`, `describe.skip`)

**Before opening PR:**
- All tests passing in CI mode
- New behavior has test coverage
- No mock database operations in integration tests
- E2E tests passing if UI changes made

## Debugging Tests

**Run single test file:**
```bash
pnpm -F functions test:ci -- src/contexts/engagements/engagements.context.test.ts
```

**Run tests matching pattern:**
```bash
pnpm -F functions test -- --grep "createEngagement"
```

**Debug in watch mode:**
```bash
pnpm -F functions test -- --inspect-brk --inspect
```

**Check test coverage gaps:**
```bash
pnpm -F functions test:coverage
# View at: coverage/index.html
```

---

*Testing analysis: 2026-02-04*
