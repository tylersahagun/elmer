# External Integrations

**Analysis Date:** 2026-01-25

## APIs & External Services

**AI & LLM:**
- Anthropic Claude - Core AI inference for extraction, classification, chat
  - SDK: `@anthropic-ai/sdk`
  - Auth: `ANTHROPIC_API_KEY`
  - Usage: Signal extraction, skill summaries, stage recipe chat, inbox processing, classification
  - Integration points: `src/lib/classification/`, `src/lib/ai/`, `src/app/api/ai/generate/route.ts`

- OpenAI - Text embeddings and model selection support
  - SDK: `openai`
  - Auth: `OPENAI_API_KEY`
  - Models: text-embedding-3-small (1536-dimensional vectors)
  - Usage: Signal embeddings, project embeddings for classification
  - Integration points: `src/lib/ai/embeddings.ts`, `src/lib/classification/classifier.ts`

**Version Control & Code Integration:**
- GitHub - Repository access, content reading, PR/commit writing
  - SDK: `@octokit/rest`
  - Auth: OAuth 2.0 via NextAuth (scope: `read:user`, `user:email`, `repo`)
  - Env vars: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
  - Features: Repository listing, tree/content access, branch management, PR creation, commits
  - Webhooks: None configured in this service (receives from Pylon/external sources)
  - Integration points: `src/lib/github/auth.ts`, `src/app/api/github/**`
  - User token storage: `accounts` table (Auth.js DrizzleAdapter)

**Skills & Tools:**
- SkillsMP - Skills marketplace search and discovery
  - Custom client: `src/lib/skills/skillsmp-client.ts`
  - API base: https://skillsmp.com/api/v1
  - Auth: Bearer token via `SKILLMP_API_KEY` (optional)
  - Features: Keyword search, AI semantic search, skill fetching
  - Usage: Recipe creation, skill discovery

- Composio - Tool/integration execution platform
  - SDK: `@composio/core`
  - Auth: API key per workspace in `workspace.settings.composio.apiKey`
  - Features: Execute third-party tools (Slack, etc.), service connections
  - Integration: `src/lib/composio/service.ts`
  - Stored in workspace settings: `settings.composio`

## Data Storage

**Databases:**
- PostgreSQL (primary database)
  - Connection: `DATABASE_URL` environment variable
  - Auto-detection:
    - If URL contains "neon.tech" → Use Neon serverless HTTP driver
    - Otherwise → Use standard `pg` (node-postgres) client
  - Client library: Drizzle ORM 0.45.1
  - Extensions: pgvector (for vector embeddings)
  - Migrations: Drizzle-kit with auto-detection of driver type
  - Docker setup: pgvector/pgvector:pg16 in docker-compose.yml

**File Storage:**
- Local filesystem only
  - Prototypes/artifacts: Stored in project directories
  - Documents: Synced from GitHub repositories

**Caching:**
- In-memory via TanStack React Query (client-side caching)
- No external caching service configured

**Vector/Embeddings Storage:**
- PostgreSQL with pgvector extension
  - Signal embeddings: Base64-encoded 1536-dimensional vectors in `signals.embedding` column
  - Project embeddings: Stored in `projects.embedding` column
  - Custom Drizzle type: `vector` with dimensions config in `src/lib/db/schema.ts`

## Authentication & Identity

**Primary Auth Provider:**
- NextAuth.js (Auth.js) with JWT session strategy
  - Session max age: 30 days
  - Configuration: `src/auth.ts`
  - Database adapter: Drizzle ORM with standard NextAuth tables

**Authentication Methods:**
1. Google OAuth 2.0
   - Env vars: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
   - Provider: `next-auth/providers/google`
   - Used for: "Sign in with Google"

2. GitHub OAuth 2.0
   - Env vars: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (optional - conditional provider)
   - Provider: `next-auth/providers/github`
   - Scopes: `read:user`, `user:email`, `repo`
   - Used for: Repository access and "Sign in with GitHub"

3. Credentials (Email/Password)
   - Local user management with bcryptjs password hashing
   - Stored in `users` table with `passwordHash` column
   - Provider: `next-auth/providers/credentials`

**OAuth Account Linking:**
- Enabled: `allowDangerousEmailAccountLinking: true`
- Allows linking Google + GitHub to same email account
- Safe because both providers verify emails

**Token Storage:**
- OAuth tokens: Stored in `accounts` table (Auth.js schema)
- Session tokens: JWT stored in secure HTTP-only cookies

## Monitoring & Observability

**Error Tracking:**
- Not detected

**Logs:**
- Console logging for debugging
- Signal processing logs: `src/lib/signals/processor.ts`
- Database query logging: Drizzle ORM built-in logging

## Webhooks & Callbacks

**Incoming Webhooks:**
- Slack Events API
  - Endpoint: `POST /api/webhooks/slack/events`
  - Auth: HMAC-SHA256 signature verification (v0 format)
  - Features: URL verification challenge, message ingestion
  - Signature header: `x-slack-signature`
  - Timestamp header: `x-slack-request-timestamp`
  - Replay prevention: 5-minute timestamp validation
  - Integration: `src/app/api/webhooks/slack/events/route.ts`, `src/lib/integrations/slack.ts`
  - Signal creation: Signals created with source "slack" and sourceRef for idempotency

- Signals Custom Webhooks
  - Endpoint: `POST /api/webhooks/signals/[key]` (key-based auth)
  - Generic signal ingestion via webhook keys
  - Integration: `src/app/api/webhooks/signals/[key]/route.ts`

- Pylon/External Webhooks
  - Endpoint: `POST /api/webhooks/pylon`
  - For external system integrations

**Outgoing Webhooks:**
- Slack Composio tools
  - Via Composio service for sending messages, posting to channels
  - Integration: `src/lib/composio/service.ts` with `SLACK_SEND_MESSAGE` tool

- GitHub Operations
  - PR creation: `POST /api/github/write/pr`
  - Commit creation: `POST /api/github/write/commit`
  - Prepare changes: `POST /api/github/write/prepare`
  - Integration: Uses authenticated Octokit client

## Integration Configuration

**Workspace-Level Settings:**
- Stored in `workspaces.settings` (JSONB column)
- Composio configuration: `settings.composio.apiKey`, `settings.composio.enabled`, `settings.composio.connectedServices`
- Linear integration: `settings.linearTeamId`
- Notion integration: `settings.notionWorkspaceId`
- PostHog: `settings.posthogProjectId`
- Knowledge base mapping: `settings.knowledgebaseMapping`

**Required Environment Variables (Production):**
- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - NextAuth secret (generate: `openssl rand -base64 32`)
- `AUTH_URL` - Deployed app URL
- `GOOGLE_CLIENT_ID` - Google OAuth credentials
- `GOOGLE_CLIENT_SECRET` - Google OAuth credentials
- `ANTHROPIC_API_KEY` - Claude API key
- `OPENAI_API_KEY` - OpenAI API key (for embeddings)

**Optional Environment Variables:**
- `GITHUB_CLIENT_ID` - GitHub OAuth (enables repo access)
- `GITHUB_CLIENT_SECRET` - GitHub OAuth
- `LINEAR_API_KEY` - Linear API for ticket management
- `NOTION_API_KEY` - Notion for knowledge sync
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog analytics
- `NEXT_PUBLIC_POSTHOG_HOST` - PostHog host (default: https://app.posthog.com)
- `CHROMATIC_PROJECT_TOKEN` - Storybook visual testing/embedding
- `SKILLMP_API_KEY` - SkillsMP marketplace API

## Integrations Database Schema

**Integration Platforms Supported:**
- `slack` - Slack workspace integration
  - Fields: `slackTeamId`, `webhookSecret` for verification
- Others: Configurable via schema (`IntegrationPlatform` union type)

**Integration Storage:**
- Table: `integrations`
- Per-workspace configuration
- Columns:
  - `platform` - Integration type (slack, etc.)
  - `slackTeamId` - Slack team identifier
  - `webhookSecret` - Webhook signature secret
  - `isActive` - Integration enabled/disabled flag
  - `settings` - JSONB for platform-specific config

**Third-Party Tool Integrations:**
- Linear mapping: `linearMappings` table - Maps signals to Linear issues
- Tickets: `tickets` table - Synced ticket data with project references

## Deployment & Infrastructure

**Hosting:**
- Vercel (inferred from Next.js app and youtube-caption-extractor Vercel detection)
- Self-hosted Node.js capable (using Next.js standard)

**CI/CD:**
- Not detected in codebase (no .github/workflows, CircleCI, etc.)

**Cloudflare Integration:**
- Tunnel support: `npm run tunnel` command
  - Uses cloudflared CLI tool
  - Configuration: `Chillax` and `Synonym` directories (infrastructure examples)

---

*Integration audit: 2026-01-25*
