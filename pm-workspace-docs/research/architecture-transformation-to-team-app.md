# PM Workspace → Team Application Transformation

**Date:** 2026-02-01
**Type:** Architecture Research
**Question:** How to transform the pm-workspace into a full team application similar to 8090.ai

---

## Executive Summary

Your current PM workspace is a sophisticated single-player system built on Cursor's agent infrastructure. Transforming it into a multi-player team application would require:

1. **New infrastructure layer** - Database, API, authentication
2. **Agent orchestration platform** - Move from Cursor runtime to standalone agent framework
3. **Web application frontend** - Team UI for configuring and interacting with agents
4. **Multi-tenancy** - Teams, workspaces, permissions
5. **Real-time collaboration** - Shared context, notifications, handoffs

Estimated effort: **6-9 months** for MVP with core functionality.

---

## Current Architecture Analysis

### What You Have Today

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CURSOR IDE                                   │
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │     Rules        │  │     Skills       │  │    Commands      │  │
│  │  (.mdc files)    │  │   (SKILL.md)     │  │   (slash cmds)   │  │
│  │                  │  │                  │  │                  │  │
│  │ • pm-foundation  │  │ • prd-writer     │  │ • /proto         │  │
│  │ • component-pat  │  │ • proto-builder  │  │ • /research      │  │
│  │ • growth-comp    │  │ • jury-system    │  │ • /validate      │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │
│           │                     │                     │            │
│           └──────────────┬──────┴─────────────────────┘            │
│                          │                                          │
│                          ▼                                          │
│              ┌───────────────────────┐                             │
│              │     Subagents         │                             │
│              │  (isolated context)   │                             │
│              │                       │                             │
│              │ • proto-builder       │                             │
│              │ • research-analyzer   │                             │
│              │ • signals-processor   │                             │
│              │ • posthog-analyst     │                             │
│              └───────────┬───────────┘                             │
│                          │                                          │
└──────────────────────────┼──────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────────┐
        │              MCP Tools                    │
        │                                           │
        │  Slack │ Linear │ Notion │ HubSpot │ PH  │
        └──────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────────┐
        │         File-Based Persistence           │
        │                                           │
        │  pm-workspace-docs/                       │
        │  ├── initiatives/     (25+ initiatives)  │
        │  ├── signals/         (research data)    │
        │  ├── hypotheses/      (tracked guesses)  │
        │  ├── personas/        (365 personas)     │
        │  └── company-context/ (vision, guardrails)│
        └──────────────────────────────────────────┘
```

### Current System Strengths

| Strength | Value | Reusable? |
|----------|-------|-----------|
| **Agent definitions** | 17 subagents with clear responsibilities | ✅ Yes - Core logic |
| **Skill library** | 25 skills with procedural knowledge | ✅ Yes - Prompt engineering |
| **Initiative lifecycle** | discovery → define → build → validate → launch | ✅ Yes - Workflow model |
| **MCP integrations** | Slack, Linear, Notion, HubSpot, PostHog | ✅ Yes - API patterns |
| **Persona library** | 365 synthetic personas for jury system | ✅ Yes - Data asset |
| **Company context** | Vision, guardrails, strategic alignment | ✅ Yes - Configurable per team |
| **Prototypes** | Storybook component library | ⚠️ Partial - UI patterns |

### Current Limitations for Team Use

| Limitation | Impact | Solution |
|------------|--------|----------|
| **Single user** | Only Tyler can use it | Multi-tenant auth |
| **Cursor-bound** | Requires IDE | Web-based agent runtime |
| **File-based data** | No concurrent access | Database persistence |
| **No permissions** | Anyone sees everything | RBAC system |
| **No real-time** | Async only | WebSocket/SSE |
| **Local-first** | Must clone repo | Cloud-hosted |

---

## Target Architecture (8090.ai Style)

### Reference: What 8090.ai Does

Based on their documentation, 8090.ai provides:
- **Agent marketplace** - Pre-built agents for specific tasks
- **Agent builder** - Custom agent creation
- **Team workspaces** - Shared agent access
- **Integrations** - Connect to external tools
- **Conversation history** - Persistent agent chat logs
- **Multi-model support** - Choose between LLM providers

### Proposed Team Application Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           WEB APPLICATION (Next.js)                          │
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Dashboard  │  │   Agents    │  │ Initiatives │  │  Settings   │        │
│  │             │  │   Library   │  │   Board     │  │             │        │
│  │ • Activity  │  │             │  │             │  │ • Agents    │        │
│  │ • Signals   │  │ • Browse    │  │ • Kanban    │  │ • Integs    │        │
│  │ • Reports   │  │ • Configure │  │ • Timeline  │  │ • Team      │        │
│  │             │  │ • Run       │  │ • Docs      │  │ • Billing   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                              │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API LAYER (tRPC / GraphQL)                         │
│                                                                              │
│  Auth │ Users │ Teams │ Agents │ Initiatives │ Signals │ Integrations      │
│                                                                              │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   │
           ┌───────────────────────┼───────────────────────┐
           │                       │                       │
           ▼                       ▼                       ▼
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│  AGENT RUNTIME      │  │  DATABASE           │  │  INTEGRATIONS       │
│                     │  │                     │  │                     │
│  ┌───────────────┐  │  │  PostgreSQL +       │  │  ┌───────────────┐  │
│  │ Orchestrator  │  │  │  Prisma             │  │  │ Slack         │  │
│  │               │  │  │                     │  │  │ Linear        │  │
│  │ • Queue jobs  │  │  │  Tables:            │  │  │ Notion        │  │
│  │ • Route to    │  │  │  • users            │  │  │ HubSpot       │  │
│  │   agents      │  │  │  • teams            │  │  │ PostHog       │  │
│  │ • Track runs  │  │  │  • agents           │  │  │ GitHub        │  │
│  └───────┬───────┘  │  │  • agent_configs    │  │  │               │  │
│          │          │  │  • initiatives      │  │  │ (Via Composio │  │
│          ▼          │  │  • signals          │  │  │  or direct)   │  │
│  ┌───────────────┐  │  │  • conversations    │  │  └───────────────┘  │
│  │ Agent Pool    │  │  │  • runs             │  │                     │
│  │               │  │  │                     │  │  ┌───────────────┐  │
│  │ • proto-      │  │  │  Vector store:      │  │  │ LLM Providers │  │
│  │   builder     │  │  │  • pgvector for     │  │  │               │  │
│  │ • research-   │  │  │    RAG              │  │  │ • Anthropic   │  │
│  │   analyzer    │  │  │                     │  │  │ • OpenAI      │  │
│  │ • signals-    │  │  │  File storage:      │  │  │ • Groq        │  │
│  │   processor   │  │  │  • S3 for docs,     │  │  │               │  │
│  │ • validator   │  │  │    images           │  │  └───────────────┘  │
│  │ • etc...      │  │  │                     │  │                     │
│  └───────────────┘  │  │                     │  │                     │
│                     │  │                     │  │                     │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

---

## Tech Stack Recommendation

### Core Stack (T3-based)

| Layer | Technology | Why |
|-------|------------|-----|
| **Frontend** | Next.js 14 (App Router) | React ecosystem, SSR, API routes |
| **Styling** | Tailwind CSS + shadcn/ui | Already using in prototypes |
| **API** | tRPC | End-to-end type safety |
| **Database** | PostgreSQL + Prisma | Relational data, excellent tooling |
| **Auth** | Clerk or NextAuth | Team/org support built-in |
| **File Storage** | S3 / Cloudflare R2 | Documents, images, exports |
| **Vector Store** | pgvector | RAG for context retrieval |
| **Queue** | Trigger.dev or Inngest | Background job processing |

### Agent Runtime Options

| Option | Pros | Cons | Fit |
|--------|------|------|-----|
| **Vercel AI SDK** | Simple, streaming, multi-model | Less orchestration | ✅ Good for simple agents |
| **LangChain.js** | Full-featured, tool support | Heavy, complex | ⚠️ Overkill for your use |
| **Mastra** | New, TypeScript-first, workflows | Early stage | ⚠️ Promising but young |
| **Custom (Anthropic SDK)** | Full control, matches your prompts | More work | ✅ Best for your depth |
| **AutoGen** | Multi-agent conversations | Python, complex | ❌ Wrong language |

**Recommendation:** Start with **Vercel AI SDK** for simple interactions, build **custom orchestration** for complex multi-step agents.

### Real-time Options

| Option | Use Case | Complexity |
|--------|----------|------------|
| **Server-Sent Events (SSE)** | Agent streaming responses | Low |
| **WebSockets (Pusher/Ably)** | Notifications, presence | Medium |
| **Supabase Realtime** | Database sync | Medium |
| **Liveblocks** | Collaborative editing | High |

### Hosting

| Service | Use For | Cost |
|---------|---------|------|
| **Vercel** | Frontend, API routes | $20+/mo |
| **Railway / Render** | Database, background workers | $20+/mo |
| **Cloudflare R2** | File storage | Pay-per-use |
| **Upstash** | Redis (rate limiting, cache) | Pay-per-use |

---

## Data Model Changes

### From Files to Database

Your current file structure maps to database tables:

```prisma
// schema.prisma

model Team {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  createdAt   DateTime @default(now())
  
  users       UserTeam[]
  agents      TeamAgent[]
  initiatives Initiative[]
  signals     Signal[]
  contexts    TeamContext[]
}

model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String
  
  teams       UserTeam[]
  agentRuns   AgentRun[]
}

model Agent {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  description String
  model       String   @default("claude-3-sonnet")
  
  // System prompt (from your current SKILL.md / agent.md files)
  systemPrompt String  @db.Text
  
  // Configuration schema (JSON Schema)
  configSchema Json?
  
  // Skills this agent can use
  skills      AgentSkill[]
  
  // Which teams have access
  teamAgents  TeamAgent[]
  
  runs        AgentRun[]
}

model TeamAgent {
  id          String   @id @default(cuid())
  team        Team     @relation(fields: [teamId], references: [id])
  teamId      String
  agent       Agent    @relation(fields: [agentId], references: [id])
  agentId     String
  
  // Team-specific configuration
  config      Json?
  enabled     Boolean  @default(true)
  
  @@unique([teamId, agentId])
}

model Initiative {
  id          String   @id @default(cuid())
  team        Team     @relation(fields: [teamId], references: [id])
  teamId      String
  
  name        String
  slug        String
  phase       InitiativePhase
  status      InitiativeStatus
  priority    Int?
  
  // Documents (replaces your .md files)
  prd         String?  @db.Text
  designBrief String?  @db.Text
  research    String?  @db.Text
  prototypeNotes String? @db.Text
  
  // Metadata
  metadata    Json?
  
  signals     SignalInitiative[]
  agentRuns   AgentRun[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum InitiativePhase {
  DISCOVERY
  DEFINE
  BUILD
  VALIDATE
  LAUNCH
}

enum InitiativeStatus {
  ON_TRACK
  AT_RISK
  BLOCKED
  COMPLETE
}

model Signal {
  id          String   @id @default(cuid())
  team        Team     @relation(fields: [teamId], references: [id])
  teamId      String
  
  type        SignalType
  source      String   // slack, linear, hubspot, etc.
  topic       String
  content     String   @db.Text
  
  // Extracted data
  tldr        String?
  quotes      Json?    // Array of verbatim quotes
  actionItems Json?    // Array of action items
  
  capturedAt  DateTime @default(now())
  
  initiatives SignalInitiative[]
}

enum SignalType {
  TRANSCRIPT
  TICKET
  ISSUE
  CONVERSATION
  SLACK
  HUBSPOT
}

model AgentRun {
  id          String   @id @default(cuid())
  agent       Agent    @relation(fields: [agentId], references: [id])
  agentId     String
  user        User     @relation(fields: [userId], references: [id])
  userId      String
  initiative  Initiative? @relation(fields: [initiativeId], references: [id])
  initiativeId String?
  
  // Input/Output
  input       String   @db.Text
  output      String?  @db.Text
  
  // Run metadata
  status      RunStatus
  startedAt   DateTime @default(now())
  completedAt DateTime?
  tokensUsed  Int?
  cost        Float?
  
  // Conversation history for multi-turn
  messages    AgentMessage[]
}

enum RunStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
}
```

### Context Storage (RAG)

Your `company-context/` files become team-specific embeddings:

```prisma
model TeamContext {
  id          String   @id @default(cuid())
  team        Team     @relation(fields: [teamId], references: [id])
  teamId      String
  
  type        ContextType
  name        String
  content     String   @db.Text
  
  // Vector embedding for RAG
  embedding   Unsupported("vector(1536)")?
  
  updatedAt   DateTime @updatedAt
}

enum ContextType {
  PRODUCT_VISION
  STRATEGIC_GUARDRAILS
  PERSONAS
  TECH_STACK
  CUSTOM
}
```

---

## Agent Migration Strategy

### Step 1: Extract Agent Definitions

Convert your `.cursor/agents/*.md` files into database-ready format:

```typescript
// lib/agents/proto-builder.ts

export const protoBuilderAgent = {
  slug: 'proto-builder',
  name: 'Prototype Builder',
  description: 'Build Storybook prototypes with multiple creative directions',
  model: 'claude-3-sonnet',
  
  systemPrompt: `
You build interactive Storybook prototypes. Your goal is to create 
multiple creative options that meet human-centric AI design standards.

## Before Building

1. Load context:
   - Product vision
   - Initiative PRD
   - Design brief
   - Design system

2. Read existing patterns in codebase

## Design Principles

### Trust Before Automation
- New features start as suggestions, not automations
- Show receipts (evidence) for every AI decision
- Make confidence levels explicit
- Graceful failure > silent failure

...
  `,
  
  configSchema: {
    type: 'object',
    properties: {
      mode: {
        type: 'string',
        enum: ['full', 'lofi'],
        description: 'Full prototype or quick wireframe',
      },
      creativityLevel: {
        type: 'number',
        minimum: 1,
        maximum: 3,
        description: 'Number of creative options to generate',
      },
    },
  },
  
  skills: ['prototype-builder', 'placement-analysis'],
  
  tools: [
    'readFile',
    'writeFile',
    'executeCommand',
    'generateImage',
  ],
};
```

### Step 2: Build Agent Runtime

```typescript
// lib/agents/runtime.ts

import Anthropic from '@anthropic-ai/sdk';
import { db } from '@/lib/db';

interface AgentRunContext {
  agent: Agent;
  user: User;
  team: Team;
  initiative?: Initiative;
  input: string;
}

export async function runAgent(ctx: AgentRunContext) {
  const { agent, user, team, initiative, input } = ctx;
  
  // 1. Create run record
  const run = await db.agentRun.create({
    data: {
      agentId: agent.id,
      userId: user.id,
      initiativeId: initiative?.id,
      input,
      status: 'RUNNING',
    },
  });
  
  // 2. Build context from team data
  const teamContext = await buildTeamContext(team.id);
  const initiativeContext = initiative 
    ? await buildInitiativeContext(initiative.id) 
    : '';
  
  // 3. Construct messages
  const systemPrompt = `
${agent.systemPrompt}

## Team Context
${teamContext}

${initiativeContext ? `## Initiative Context\n${initiativeContext}` : ''}
  `.trim();
  
  // 4. Call LLM
  const client = new Anthropic();
  const response = await client.messages.create({
    model: agent.model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: input }],
  });
  
  // 5. Update run record
  const output = response.content[0].type === 'text' 
    ? response.content[0].text 
    : '';
    
  await db.agentRun.update({
    where: { id: run.id },
    data: {
      output,
      status: 'COMPLETED',
      completedAt: new Date(),
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    },
  });
  
  return { run, output };
}
```

### Step 3: Map Commands to API Routes

| Current Command | API Route | Handler |
|-----------------|-----------|---------|
| `/proto [name]` | `POST /api/agents/proto-builder/run` | `protoBuilderAgent` |
| `/research [name]` | `POST /api/agents/research-analyzer/run` | `researchAnalyzerAgent` |
| `/validate [name]` | `POST /api/agents/validator/run` | `validatorAgent` |
| `/eod` | `POST /api/agents/activity-reporter/run` | `activityReporterAgent` |
| `/status [name]` | `GET /api/initiatives/[slug]/status` | Direct query |
| `/ingest` | `POST /api/signals/ingest` | `signalsProcessorAgent` |

---

## UI Components to Build

### From Your Prototypes

You already have Storybook components that can be promoted:

| Prototype | Team App Use |
|-----------|--------------|
| `JourneyWorkspace` | Initiative detail view |
| `RepWorkspace` | Dashboard |
| `SignalTables` | Signals list/grid |
| `HubSpotConfig` | Agent configuration |
| `BetaFeatures` | Feature flags UI |

### New Components Needed

```
src/
├── components/
│   ├── agents/
│   │   ├── AgentCard.tsx           # Agent library item
│   │   ├── AgentConfigForm.tsx     # Configure agent per team
│   │   ├── AgentRunner.tsx         # Chat/run interface
│   │   └── AgentRunHistory.tsx     # Past runs
│   │
│   ├── initiatives/
│   │   ├── InitiativeBoard.tsx     # Kanban view
│   │   ├── InitiativeDetail.tsx    # Full detail page
│   │   ├── InitiativeDocEditor.tsx # PRD, design brief editors
│   │   └── PhaseTimeline.tsx       # Phase progression
│   │
│   ├── signals/
│   │   ├── SignalFeed.tsx          # Real-time signal stream
│   │   ├── SignalDetail.tsx        # Signal analysis view
│   │   └── SignalIngester.tsx      # Manual signal entry
│   │
│   ├── team/
│   │   ├── TeamMembers.tsx         # Member management
│   │   ├── TeamSettings.tsx        # Team configuration
│   │   └── IntegrationSetup.tsx    # Connect Slack, etc.
│   │
│   └── shared/
│       ├── MarkdownEditor.tsx      # For docs
│       ├── StreamingResponse.tsx   # Agent output
│       └── ContextPanel.tsx        # Side panel context
```

---

## Integration Strategy

### Current: MCP via Cursor

```typescript
// Current: Cursor invokes MCP tools
CallMcpTool: pm-mcp-config / SLACK_FETCH_CONVERSATION_HISTORY
```

### Future: Direct API + Composio

```typescript
// Option 1: Composio SDK
import { ComposioToolSet } from 'composio-core';

const toolset = new ComposioToolSet({ apiKey: process.env.COMPOSIO_API_KEY });

export async function getSlackHistory(channelId: string, since: Date) {
  const tools = await toolset.getTools(['slack']);
  const result = await tools.executeAction('SLACK_FETCH_CONVERSATION_HISTORY', {
    channel: channelId,
    oldest: Math.floor(since.getTime() / 1000),
    limit: 100,
  });
  return result;
}

// Option 2: Direct Slack API
import { WebClient } from '@slack/web-api';

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

export async function getSlackHistory(channelId: string, since: Date) {
  const result = await slack.conversations.history({
    channel: channelId,
    oldest: (since.getTime() / 1000).toString(),
    limit: 100,
  });
  return result.messages;
}
```

### OAuth Flow for Team Integrations

```typescript
// pages/api/integrations/slack/callback.ts

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const teamId = req.nextUrl.searchParams.get('state');
  
  // Exchange code for token
  const response = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID!,
      client_secret: process.env.SLACK_CLIENT_SECRET!,
      code: code!,
    }),
  });
  
  const data = await response.json();
  
  // Store token for team
  await db.teamIntegration.create({
    data: {
      teamId,
      provider: 'slack',
      accessToken: encrypt(data.access_token),
      metadata: data,
    },
  });
  
  return NextResponse.redirect('/settings/integrations?connected=slack');
}
```

---

## Migration Path

### Phase 1: Foundation (Weeks 1-4)

**Goal:** Core infrastructure without agents

- [ ] Next.js app with Clerk auth
- [ ] PostgreSQL + Prisma schema
- [ ] Team/user management
- [ ] Basic dashboard shell
- [ ] File storage (R2)

**Deliverable:** Users can sign up, create teams, invite members

### Phase 2: Data Migration (Weeks 5-6)

**Goal:** Import existing workspace data

- [ ] Script to convert markdown files → database records
- [ ] Import initiatives with documents
- [ ] Import signals
- [ ] Import personas (for jury system)
- [ ] Import company context → TeamContext

**Deliverable:** All existing data accessible via API

### Phase 3: Agent Runtime (Weeks 7-10)

**Goal:** Run agents from web app

- [ ] Agent definition format
- [ ] Agent runtime (Anthropic SDK)
- [ ] Tool execution layer
- [ ] Streaming responses
- [ ] Run history/logging

**Deliverable:** Can run proto-builder, research-analyzer from web

### Phase 4: Initiative Workflow (Weeks 11-14)

**Goal:** Full initiative lifecycle

- [ ] Kanban board
- [ ] Document editors (PRD, design brief)
- [ ] Phase transitions
- [ ] Jury system (validate command)
- [ ] Agent integration per phase

**Deliverable:** Complete initiative workflow from discovery to launch

### Phase 5: Integrations (Weeks 15-18)

**Goal:** External tool connections

- [ ] OAuth flows for Slack, Linear, Notion
- [ ] Direct API integration
- [ ] Signal ingestion from sources
- [ ] Activity reporter aggregation

**Deliverable:** Same integration depth as current MCP setup

### Phase 6: Team Features (Weeks 19-22)

**Goal:** Collaboration

- [ ] Team permissions (viewer, editor, admin)
- [ ] Notifications
- [ ] Activity feed
- [ ] Comments/discussion on initiatives
- [ ] Shared agent configurations

**Deliverable:** Multiple team members can collaborate

### Phase 7: Polish (Weeks 23-26)

**Goal:** Production readiness

- [ ] Error handling
- [ ] Rate limiting
- [ ] Billing/usage tracking
- [ ] Audit logging
- [ ] Documentation

**Deliverable:** Ready for external users

---

## Key Decisions to Make

### 1. Single-Tenant vs Multi-Tenant

| Approach | Pros | Cons |
|----------|------|------|
| **Single-tenant (AskElephant only)** | Simpler, tailored to one team | Not a product |
| **Multi-tenant (SaaS)** | Scalable, revenue potential | More complex, security concerns |

**Recommendation:** Start single-tenant for internal use, design for multi-tenant expansion.

### 2. Agent Customization Depth

| Level | What Users Can Do | Complexity |
|-------|-------------------|------------|
| **Use only** | Run pre-built agents | Low |
| **Configure** | Adjust parameters, enable/disable | Medium |
| **Customize prompts** | Edit system prompts | Medium-High |
| **Build custom** | Create entirely new agents | High |

**Recommendation:** Start with "Configure", add "Customize prompts" later.

### 3. Code Generation

Your current agents generate code (prototypes). Options:

| Approach | Pros | Cons |
|----------|------|------|
| **Generate to repo** | Familiar, git history | Requires repo access |
| **Generate to platform** | Self-contained | Need sandbox |
| **Preview only** | Safe, simple | Less useful |

**Recommendation:** Generate to connected GitHub repo (like current setup).

### 4. LLM Provider

| Provider | Model | Pros | Cons |
|----------|-------|------|------|
| **Anthropic** | Claude 3.5 Sonnet | Best for coding, your current choice | Cost |
| **OpenAI** | GPT-4o | Good all-around | Less code-focused |
| **Groq** | Llama/Mixtral | Fast, cheap | Less capable |

**Recommendation:** Default to Claude, allow override per agent.

---

## Cost Estimate (Monthly)

| Item | Low (MVP) | Medium | High (Scale) |
|------|-----------|--------|--------------|
| Vercel Pro | $20 | $20 | $400+ |
| Database (Railway) | $20 | $50 | $200+ |
| LLM (Anthropic) | $100 | $500 | $2,000+ |
| File storage (R2) | $5 | $20 | $100+ |
| Auth (Clerk) | Free | $25 | $99+ |
| **Total** | **$145/mo** | **$615/mo** | **$2,800+/mo** |

---

## Alternative: Lighter Approaches

If full application is too much, consider:

### Option A: Shared Cursor Workspace

- Everyone installs Cursor
- Clone same pm-workspace repo
- Use git for coordination
- **Effort:** 1-2 weeks setup
- **Limitation:** Still IDE-bound

### Option B: Slack Bot + Existing Agents

- Build Slack bot that invokes current agents
- Run agents on a server with Cursor-like context
- **Effort:** 4-6 weeks
- **Limitation:** Slack-only interface

### Option C: Notion/Linear Integration Deep Dive

- Push all initiative data to Notion
- Use Notion as the UI
- Agents run as background jobs
- **Effort:** 4-8 weeks
- **Limitation:** Notion is the bottleneck

---

## Conclusion

Transforming your PM workspace into a team application is a significant undertaking (6-9 months for MVP). The good news:

1. **Your agent definitions are already mature** - 17 agents, 25 skills
2. **Your data model is proven** - Initiative lifecycle, signals, personas
3. **Your integrations work** - MCP patterns translate to direct APIs
4. **Your prototypes are reusable** - Storybook components → production

The main work is building:
- Infrastructure (auth, database, API)
- Agent runtime (replaces Cursor)
- Web UI (dashboard, initiative board, agent chat)
- Multi-tenancy (teams, permissions)

If AskElephant sees value in a PM productivity platform, this could be a product direction. If it's for internal use only, consider the lighter approaches first.

---

## Next Steps

1. **Validate demand** - Would other AskElephant team members use this?
2. **Prototype core flow** - Build agent runner + one agent in Next.js
3. **Test migration** - Convert one initiative to database format
4. **Decide scope** - Internal tool vs product direction

Would you like me to dive deeper into any section?
