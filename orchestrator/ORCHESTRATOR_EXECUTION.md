# Orchestrator Execution System

This document explains how the execution system works, how to configure it, and how to debug issues.

## Overview

The execution system provides durable, reliable automation for Kanban stage transitions. When a card moves to a new stage, the system:

1. Creates a **run** (queued execution request)
2. A **worker** claims and executes the run
3. **Logs** are streamed in real-time to the UI
4. **Artifacts** (documents, files, URLs) are created
5. **Gates** are checked to determine if the card can advance

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Kanban UI     │────▶│   Runs API      │────▶│   Database      │
│   (React)       │     │   (/api/runs)   │     │   (stage_runs)  │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
        │                                                 │
        │ SSE Logs                                       │ Poll
        │                                                 │
┌───────▼─────────┐     ┌─────────────────┐     ┌────────▼────────┐
│   Run Logs UI   │◀────│   Logs API      │◀────│   Worker        │
│   (streaming)   │     │   (SSE)         │     │   (execution)   │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │   LLM Provider  │
                                                │   (Anthropic)   │
                                                └─────────────────┘
```

## Quick Start

### 1. Start the Application

```bash
cd orchestrator
npm run dev
```

### 2. Start the Worker (in a separate terminal)

```bash
cd orchestrator
npm run worker
```

Or run with custom options:

```bash
WORKER_ID=my-worker POLL_INTERVAL=3000 npm run worker
```

### 3. Configure Stage Recipes (via UI)

Navigate to Settings → Stage Automation to configure:
- Automation level per stage
- Skills to run
- Gates to check

## Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `stage_runs` | Tracks execution requests and status |
| `run_logs` | Step-by-step execution logs |
| `artifacts` | Produced outputs (files, URLs, PRs) |
| `skills` | Global skills catalog |
| `stage_recipes` | Per-stage automation configuration |
| `worker_heartbeats` | Worker health monitoring |
| `stage_transition_events` | Audit trail of stage changes |

### Run Statuses

| Status | Description |
|--------|-------------|
| `queued` | Waiting for a worker to claim |
| `running` | Currently being executed |
| `succeeded` | Completed successfully |
| `failed` | Execution failed |
| `cancelled` | Manually cancelled |

## Configuration

### Workspace Settings

In `settings.json` or via the UI:

```json
{
  "aiExecutionMode": "server",
  "automationMode": "auto_to_stage",
  "automationStopStage": "validate",
  "workerEnabled": true,
  "workerMaxConcurrency": 2,
  "workerPollIntervalMs": 5000
}
```

### Automation Levels

| Level | Behavior |
|-------|----------|
| `fully_auto` | Run automatically, advance on success |
| `auto_notify` | Run automatically, notify on completion |
| `human_approval` | Queue run, wait for user to start |
| `manual` | No automation, user does everything |

### Stage Recipes

Each stage can have a recipe with:

```typescript
interface StageRecipe {
  stage: ProjectStage;
  automationLevel: AutomationLevel;
  recipeSteps: RecipeStep[];
  gates: GateDefinition[];
  onFailBehavior: "stay" | "revert" | "create_questions";
  provider: "anthropic" | "openai" | "cli";
  enabled: boolean;
}

interface RecipeStep {
  skillId: string;
  order: number;
  params?: Record<string, unknown>;
  inputsMapping?: Record<string, string>;
  outputsMapping?: Record<string, string>;
  timeout?: number;
  retryCount?: number;
}

interface GateDefinition {
  id: string;
  type: "file_exists" | "sections_exist" | "jury_score" | "custom";
  config: Record<string, unknown>;
  required: boolean;
  message?: string;
}
```

## Stage Executors

### Implemented Stages (v1)

| Stage | Automation | Outputs |
|-------|------------|---------|
| Inbox | Extract insights from transcript | `research.md` |
| Discovery | Synthesize signals into hypotheses | `discovery.md`, `hypotheses/` |
| PRD | Generate product documentation | `prd.md`, `design-brief.md`, `engineering-spec.md`, `gtm-brief.md` |
| Design | Create design review | `design-review.md` |
| Prototype | Generate component specification | `prototype-notes.md`, prototype record |
| Validate | Run synthetic jury evaluation | `validation-report.md`, jury record |
| Tickets | Generate implementation tickets | `tickets.md`, ticket records |

### Later Stages (planned)

| Stage | Notes |
|-------|-------|
| Build | PR creation, CI integration |
| Alpha | Feature flag rollout |
| Beta | Metrics gates, PostHog integration |
| GA | Full rollout |

## API Reference

### Runs API

#### List Runs
```
GET /api/runs?cardId={cardId}
GET /api/runs?workspaceId={workspaceId}&status=queued
```

#### Create Run
```
POST /api/runs
{
  "cardId": "card_123",
  "workspaceId": "ws_456",
  "stage": "prd",
  "triggeredBy": "user"
}
```

#### Get Run Details
```
GET /api/runs/{runId}
```

Returns: run, logs, artifacts

#### Actions
```
POST /api/runs/{runId}
{ "action": "retry" }
{ "action": "cancel", "reason": "User cancelled" }
```

### Logs API (SSE)

Stream logs in real-time:
```
GET /api/runs/{runId}/logs?stream=true
```

### Workers API

```
GET /api/workers?workspaceId={workspaceId}
POST /api/workers
{ "action": "health_check" }
{ "action": "rescue" }
{ "action": "cleanup" }
```

## Worker Operation

### Starting the Worker

The worker is a long-running process that:
1. Registers itself via heartbeat
2. Polls for queued runs
3. Claims and executes runs
4. Updates status and logs
5. Handles errors and retries

```typescript
import { startWorker } from "@/lib/execution";

await startWorker({
  workerId: "worker-1",
  workspaceId: "ws_123", // optional, limits to one workspace
  pollIntervalMs: 5000,
  maxConcurrent: 2,
});
```

### Worker Health

Workers send heartbeats every 15 seconds. Workers are considered stale after 60 seconds without a heartbeat.

The system includes automatic rescue for:
- **Stuck runs**: Running for >5 minutes without worker heartbeat
- **Stuck cards**: Locked by failed/stuck runs

### No-Worker Handling

If no workers are available:
1. Runs are still created (queued status)
2. UI shows "No workers available" warning
3. Cards are NOT locked forever
4. Runs start automatically when a worker connects

## Debugging

### Check Worker Status

```bash
curl http://localhost:3000/api/workers
```

Response includes:
- Active workers and their status
- Queue length
- Failure rate

### Check Run Status

```bash
curl http://localhost:3000/api/runs/{runId}
```

Returns full run details with logs and artifacts.

### Common Issues

#### Run stuck in "queued"
1. Check if workers are running: `GET /api/workers`
2. Start a worker: `npm run worker`
3. Check for errors in worker console

#### Run stuck in "running"
1. Worker may have died - wait for auto-rescue (5 min)
2. Manually rescue: `POST /api/workers { "action": "rescue" }`
3. Check worker logs for errors

#### Card locked forever
This should NOT happen with the new system. If it does:
1. Check active run for the card
2. Cancel or wait for the run to complete
3. The card unlocks automatically on run completion

### Viewing Logs

1. **UI**: Click on a card → Logs panel
2. **API**: `GET /api/runs/{runId}/logs`
3. **Streaming**: `GET /api/runs/{runId}/logs?stream=true`

## Execution Providers

### Anthropic (default)

Uses the Anthropic API for LLM execution.

```typescript
import { AnthropicProvider } from "@/lib/execution";

const provider = new AnthropicProvider(
  process.env.ANTHROPIC_API_KEY,
  "claude-sonnet-4-20250514"
);
```

### CLI Provider

For local CLI tools like `claude` or `codex`:

```typescript
import { CLIProvider } from "@/lib/execution";

const provider = new CLIProvider("claude");
```

### Custom Providers

Implement the `ExecutionProvider` interface:

```typescript
interface ExecutionProvider {
  name: string;
  execute(
    systemPrompt: string,
    userPrompt: string,
    context: ExecutionContext,
    callbacks?: StreamCallback
  ): Promise<ExecutionResult>;
}
```

## Skills System

The skills system provides a global catalog of reusable automation units that can be composed into per-stage recipes.

### Skills Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Local Skills  │     │   Skills DB     │     │   SkillsMP      │
│   (/skills/)    │────▶│   (skills)      │◀────│   (API)         │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  Stage Recipes  │
                        │  (stage_recipes)│
                        └─────────────────┘
```

### Skills Model

```typescript
interface Skill {
  id: string;
  workspaceId: string;
  source: "local" | "skillsmp";
  name: string;
  description?: string;
  version: string;
  promptTemplate?: string;
  trustLevel: "vetted" | "community" | "experimental";
  tags?: string[];
  inputSchema?: object;  // JSON Schema for inputs
  outputSchema?: object; // JSON Schema for outputs
  entrypoint?: string;   // For local skills
  remoteMetadata?: object; // For SkillsMP skills
}
```

### Local Skills

Store local skills in `/skills/{skill-id}/`:

```
/skills/
  analyze-transcript/
    SKILL.md          # Skill definition (parsed)
    prompt.txt        # Prompt template
  generate-prd/
    SKILL.md
    templates/
      prd-template.md
```

**SKILL.md Format:**
```markdown
# Analyze Transcript

Extracts key insights from user research transcripts.

## Inputs
- transcript: string (required) - Raw transcript text
- personas: string[] (optional) - Target personas

## Outputs
- summary: string - TL;DR summary
- problems: Problem[] - User problems with quotes
- requests: Request[] - Feature requests

## Tags
research, analysis, transcript
```

Sync local skills to database:
```bash
POST /api/skills
{ "action": "sync", "workspaceId": "ws_123", "skillsPath": "/path/to/skills" }
```

### SkillsMP Integration

Search and import skills from the SkillsMP marketplace:

```bash
# Search skills
GET /api/skills?source=skillsmp&q=prd+generation

# Import a skill
POST /api/skills
{
  "action": "import",
  "workspaceId": "ws_123",
  "skillsmpId": "smp_abc123",
  "trustLevel": "community",
  "pinVersion": true
}
```

### Trust Levels

| Level | Description | Fully Auto |
|-------|-------------|------------|
| `vetted` | Reviewed and approved | ✅ Yes |
| `community` | From SkillsMP, not reviewed | ❌ Requires approval |
| `experimental` | In development | ❌ Requires approval |

**Important**: Skills with `community` or `experimental` trust level cannot run in `fully_auto` automation mode. They require human approval or must be vetted first.

### Vetting Skills

To vet a skill for fully_auto use:
```bash
PATCH /api/skills/{skillId}
{ "trustLevel": "vetted" }
```

### Stage Recipes

Recipes define which skills run at each stage:

```typescript
interface StageRecipe {
  stage: ProjectStage;
  automationLevel: "fully_auto" | "auto_notify" | "human_approval" | "manual";
  recipeSteps: RecipeStep[];
  gates: GateDefinition[];
  onFailBehavior: "stay" | "revert" | "create_questions" | "review_required";
  provider: "anthropic" | "openai" | "cli";
  enabled: boolean;
}

interface RecipeStep {
  skillId: string;
  order: number;
  paramsJson?: object;
  inputsMapping?: Record<string, string>;
  outputsMapping?: Record<string, string>;
  timeout?: number;
  retryCount?: number;
}
```

### Default Automation Levels

| Stage | Default Level | Rationale |
|-------|---------------|-----------|
| Inbox | `fully_auto` | Simple extraction, low risk |
| Discovery | `auto_notify` | Synthesis needs review |
| PRD | `auto_notify` | Documentation needs review |
| Design | `auto_notify` | Design needs review |
| Prototype | `auto_notify` | Code needs review |
| Validate | `human_approval` | Decisions need human input |
| Tickets | `human_approval` | External system writes |
| Build | `manual` | Complex integration |
| Alpha | `manual` | Deployment decisions |
| Beta | `manual` | Rollout decisions |
| GA | `manual` | Launch decisions |

### Gates

Gates define pass/fail criteria for stage completion:

```typescript
interface GateDefinition {
  id: string;
  name: string;
  type: "file_exists" | "content_check" | "artifact_exists" | "metric_threshold";
  config: Record<string, unknown>;
  required: boolean;
  failureMessage: string;
}
```

**Gate Types:**

| Type | Config | Example |
|------|--------|---------|
| `file_exists` | `{ pattern: "*.md" }` | Check PRD exists |
| `content_check` | `{ file: "prd.md", requiredSections: [...] }` | Check required headings |
| `artifact_exists` | `{ artifactType: "url", label: "Chromatic" }` | Check Chromatic URL |
| `metric_threshold` | `{ metric: "jury_score", threshold: 70, operator: ">=" }` | Check jury score |

### Recipe API

```bash
# List recipes for workspace
GET /api/stage-recipes?workspaceId=ws_123

# Get recipe for stage
GET /api/stage-recipes/prd?workspaceId=ws_123

# Initialize default recipes
POST /api/stage-recipes
{ "action": "initialize", "workspaceId": "ws_123" }

# Update recipe
PATCH /api/stage-recipes/prd
{
  "workspaceId": "ws_123",
  "automationLevel": "human_approval",
  "recipeSteps": [
    { "skillId": "skill_abc", "order": 1, "paramsJson": { "model": "claude-3" } }
  ]
}
```

### Recipe Validation

The system validates recipes before execution:

```typescript
interface RecipeValidation {
  valid: boolean;
  errors: string[];     // Blocking issues
  warnings: string[];   // Non-blocking concerns
  skillsStatus: {
    skillId: string;
    name: string;
    found: boolean;
    trusted: boolean;
    source: string;
  }[];
}
```

**Validation Rules:**
1. All referenced skills must exist
2. `fully_auto` recipes must use only `vetted` skills
3. Gates should have at least one required gate

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Anthropic API key | required |
| `SKILLMP_API_KEY` | SkillsMP API key for marketplace | optional |
| `WORKER_ID` | Unique worker identifier | auto-generated |
| `POLL_INTERVAL` | Worker poll interval (ms) | 5000 |
| `MAX_CONCURRENT` | Max concurrent runs | 1 |
| `WORKSPACE_PATH` | Path to elmer-docs | cwd |

## Running Tests

The execution system includes comprehensive contract tests:

### Test Suites

| Suite | Description |
|-------|-------------|
| `run-lifecycle.test.ts` | Run creation, claiming, completion, cancellation |
| `skills.test.ts` | Skills CRUD, trust levels, search |
| `stage-recipes.test.ts` | Recipe configuration, validation |
| `gates.test.ts` | Gate evaluation logic |
| `integration.test.ts` | End-to-end execution flows |

### Running Tests

```bash
cd orchestrator

# Run all execution tests
npm test -- src/__tests__/execution/

# Run specific test suite
npm test -- src/__tests__/execution/run-lifecycle.test.ts

# Run with coverage
npm test -- --coverage src/__tests__/execution/
```

### Test Database

Tests use the same database but with isolated test fixtures. Each test suite creates/cleans its own workspace and data.

## Migrations

Run migrations to create execution tables:

```bash
cd orchestrator
npx drizzle-kit push
```

Or apply the migration file:
```sql
-- drizzle/0001_execution_system.sql
```

## Troubleshooting

### Skills not showing in UI

1. Ensure skills are synced: `POST /api/skills { "action": "sync", "workspaceId": "..." }`
2. Check database: `SELECT * FROM skills WHERE workspace_id = '...'`

### Recipe not executing

1. Check recipe is enabled: `GET /api/stage-recipes/{stage}?workspaceId=...`
2. Verify automation level allows execution
3. Check worker is running

### Gate failures

1. Review gate configuration in stage recipe
2. Check run logs for specific gate failure messages
3. Verify required files/artifacts exist

### SkillsMP connection issues

1. Check `SKILLMP_API_KEY` environment variable is set
2. Verify network connectivity to SkillsMP API
3. Check for rate limiting
