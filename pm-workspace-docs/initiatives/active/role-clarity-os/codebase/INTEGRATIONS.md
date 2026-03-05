# External Integrations

**Analysis Date:** 2026-02-04

## APIs & External Services

**LLM & AI Providers:**
- Anthropic (Claude) - LLM model for AI tasks
  - SDK: `@ai-sdk/anthropic`
  - Auth: `ANTHROPIC_API_KEY` (Firebase secret)
  - Files: `functions/src/contexts/llm/constants.ts`, `contexts/artifacts/scorecard.ts`

- OpenAI (GPT models) - LLM for chat and processing
  - SDK: `@ai-sdk/openai`
  - Auth: `OPENAI_API_KEY` (Firebase secret)
  - Files: `functions/src/contexts/llm/constants.ts`

- Google Gemini & Vertex AI - Alternative LLM providers
  - SDK: `@ai-sdk/google`, `@ai-sdk/google-vertex`
  - Auth: `GEMINI_API_KEY` (Firebase secret)
  - Files: `functions/src/contexts/llm/constants.ts`

- Groq - Fast LLM inference
  - SDK: `@ai-sdk/groq`
  - Auth: `GROQ_API_KEY` (Firebase secret)

- X.AI (Grok) - LLM provider
  - SDK: Inferred from constants
  - Auth: `XAI_API_KEY` (Firebase secret)

**CRM & Business Apps:**
- HubSpot - Customer relationship management
  - SDK: `@hubspot/api-client`
  - Auth: OAuth 2.0 via `/api/v1/hubspot/oauth/callback`
  - Endpoints: `/api/v1/hubspot/webhook`, `/api/v1/hubspot/chat`, `/api/v1/hubspot/entity-details`
  - Files: `functions/src/contexts/crm/hubspot/`, `media-recording-processing/hubspot/`

- Salesforce - Enterprise CRM platform
  - SDK: `jsforce`
  - Auth: OAuth 2.0 via `/api/v1/salesforce/oauth/callback`
  - Webhook: `/api/v1/salesforce/webhook`
  - Files: `functions/src/contexts/crm/salesforce/`

- Asana - Project management
  - Auth: OAuth 2.0 via `/api/v1/asana/oauth/callback` (appears 2x in firebase.json)

- Zapier - Workflow automation
  - Webhooks: `/api/v1/zapier/import-call`, `/api/v1/zapier/test`, `/api/v1/zapier/subscribe`, `/api/v1/zapier/unsubscribe`, `/api/v1/zapier/list`

**Communication & Notifications:**
- Slack - Team messaging and notifications
  - SDK: `@slack/web-api`
  - Auth: OAuth 2.0 via `/api/v1/slack/oauth/callback`
  - Endpoints: `/api/v1/slack/webhook`, `/api/v1/slack/interactions`
  - Files: `functions/src/contexts/notifications/slack/`, `bot-scheduling/zoom/oauth.ts`

- Deepgram - Speech-to-text transcription
  - SDK: `@deepgram/sdk`
  - Webhook callback: `/api/v1/deepgram/transcription/callback`
  - Files: `functions/src/contexts/transcriptions/`

- Novu - Notification platform
  - SDK: `@novu/react`, `@novu/api`
  - Auth: API key configuration
  - Files: Integrated in notification engine

- Nylas - Email and calendar API
  - SDK: `nylas`
  - Files: `functions/src/contexts/nylas/`

- SendGrid - Email delivery
  - SDK: `@sendgrid/mail`
  - Files: Email contexts

- Resend - Email service
  - SDK: `resend`
  - Webhook: `/api/v1/resend/webhook`

**Video & Meeting Conferencing:**
- Zoom - Video conferencing
  - Auth: OAuth 2.0 via `/api/v1/zoom/oauth/callback`
  - Endpoints: `/api/v1/zoom/zak-token`, `/api/v1/zoom/webhook`
  - Files: `functions/src/contexts/bot-scheduling/zoom/`

- RingCentral - Phone system
  - Auth: OAuth 2.0 via `/api/v1/ring-central/oauth/callback`

- Dialpad - Voice and messaging
  - Auth: OAuth 2.0 via `/api/v1/dialpad/oauth/callback`
  - Webhook: `/api/v1/dialpad/calls-webhook`
  - Files: `functions/src/contexts/dialpad/`

**Data Integration & ETL:**
- Recall.ai - Bot status tracking
  - Webhooks: `/api/v1/recall/webhook`, `/api/v1/recall/calendar-webhook`
  - Files: `functions/src/contexts/recall-bots/`

- Gong - Sales intelligence platform
  - Files: `functions/src/contexts/gong/`

- Grain - Video highlight tool
  - Files: `functions/src/contexts/grain/`

- Fireflies - Meeting transcription
  - Endpoint: `/api/v1/fireflies/importCallWithTranscript`

- Merge.dev - Unified API wrapper
  - Webhook: `/api/v1/merge/webhook`

- Pipedream - Workflow automation
  - Webhook: `/api/v1/pipedream/webhook`
  - SDK: `@pipedream/sdk`

**Search & Content:**
- Google Custom Search - Web search API
  - SDK: `@googleapis/customsearch`
  - Files: `functions/src/contexts/search/`

- ScrapingBee - Web scraping service
  - SDK: `scrapingbee`

**Payments & Billing:**
- Stripe - Payment processing
  - SDK: `stripe`
  - Webhook: `/api/v1/stripe/webhook`
  - Files: `functions/src/contexts/billing/`

**Identity & Authentication:**
- WorkOS - Enterprise identity and SSO
  - SDK: `@workos-inc/node` (functions), `@workos-inc/authkit-react` (web)
  - Webhooks: `/api/v1/workos/webhook`, `/api/v1/workos/actions/webhook`
  - Files: `functions/src/contexts/auth/`

**AI Frameworks:**
- LangChain - LLM orchestration framework
  - SDK: `@langchain/core`, `@langchain/langgraph`
  - Files: `functions/src/contexts/llm/agents/`

- Composio - Tool integration framework
  - SDK: `@composio/core`, `@composio/vercel`
  - Files: Agent tool integrations

- Model Context Protocol (MCP) - Standard for tool integration
  - SDK: `@modelcontextprotocol/sdk`
  - Files: `functions/src/contexts/mcp/`

**Search Providers:**
- Tavily - AI-powered search
  - SDK: `@tavily/core`

## Data Storage

**Databases:**
- PostgreSQL (Cloud SQL in production, Docker locally)
  - Connection: Environment-configured through Cloud SQL Connector
  - Client: `pg` (Node.js) with `drizzle-orm` ORM
  - Schema managed via `drizzle-kit`
  - Files: `functions/src/db/schema.ts`, migrations in `functions/drizzle/`

- Firebase Realtime Database / Firestore (emulated locally)
  - Used for auth and storage in development
  - Emulator: Port 8080 (Firestore), 5174 (Hosting)

**File Storage:**
- Google Cloud Storage (GCS) / Firebase Storage
  - Upload/download: Files via Firebase Storage SDK
  - Emulator: Port 9199
  - Rules: `storage.rules`, `storage.test.ts`

**Caching:**
- Valkey/Redis (Cloud Memorystore in production, Docker locally)
  - Client: `@valkey/valkey-glide` (primary), redis for CLI
  - Connection: `redis://redis:6379` (locally), cloud endpoint (production)
  - Use: Session management, cache, pub/sub subscriptions
  - Tools: RedisInsight UI (port 5540)
  - Files: `functions/src/contexts/infra/valkey/`

## Authentication & Identity

**Auth Provider:**
- Firebase Auth
  - Implementation: Native Firebase Auth for web/mobile
  - Web client: `firebase` package
  - Admin: `firebase-admin` package
  - Emulator: Port 9099

**Single Sign-On (SSO):**
- WorkOS (enterprise SSO)
  - SAML 2.0 and OIDC support
  - Web SDK: `@workos-inc/authkit-react`
  - Server SDK: `@workos-inc/node`

## Monitoring & Observability

**Error Tracking:**
- PostHog - Product analytics and feature flags
  - SDKs: `posthog-node` (backend), `posthog-js` (frontend)
  - Auth: API keys in `functions/src/contexts/infra/post-hog/posthog.constants.js`
  - Files: Analytics integration throughout codebase

**Logs:**
- Firebase Cloud Logging (via Firebase Functions)
- Custom logging: `createLogger()` utility from `@/utils/logger`
- OpenTelemetry exporters: Cloud Trace, Cloud Monitoring, Cloud Logging

**Metrics & Traces:**
- OpenTelemetry
  - SDKs: `@opentelemetry/sdk-node`, `@opentelemetry/sdk-trace-node`, `@opentelemetry/sdk-metrics`
  - Instrumentation: Auto-instrumentation for Express, GraphQL, gRPC, HTTP, PostgreSQL, Undici
  - Exporters: GCP Cloud Trace, Cloud Monitoring (metrics)
  - Files: `functions/src/utils/telemetry/`

**GraphQL Monitoring:**
- GraphQL Hive - GraphQL monitoring and schema registry
  - SDK: `@graphql-hive/yoga`

## CI/CD & Deployment

**Hosting:**
- Firebase Hosting (web SPA)
  - Target: `web` (main app), `storybook` (component docs)
  - Rewrites: All endpoints routed through functions or SPA fallback
  - Emulator: Port 5174

- Google Cloud Functions
  - TypeScript runtime: Node 24
  - Python runtime: Python 3.12
  - Region: us-west3 (primary)
  - Deployment via `firebase deploy`

**CI Pipeline:**
- GitHub Actions (inferred from `.github/` directory)
- Manual Firebase deployment with `firebase deploy --only functions,hosting`

**Build & Package Management:**
- pnpm workspaces with shared lockfile
- Predeploy: Lint and build functions before deployment
- Test: `pnpm test:ci` for all packages

## Environment Configuration

**Required env vars (at runtime):**
- `ANTHROPIC_API_KEY` - Anthropic API key
- `OPENAI_API_KEY` - OpenAI API key
- `OPENAI_ORG_ID` - OpenAI organization ID
- `GEMINI_API_KEY` - Google Gemini API key
- `GROQ_API_KEY` - Groq API key
- `XAI_API_KEY` - X.AI Grok API key
- Database connection strings (Cloud SQL)
- Firebase credentials and config
- Third-party API keys for HubSpot, Salesforce, Slack, Zoom, etc. (loaded per integration)

**Secrets location:**
- Firebase Cloud Secret Manager (production)
- `.env.local` / environment variables (local development)
- `.env.example` contains Chromatic token only

**Feature Flags:**
- PostHog for feature flag management
- Custom flags defined in `features/` contexts

## Webhooks & Callbacks

**Incoming Webhooks (Firebase functions handle these):**
- Deepgram transcription callback: `/api/v1/deepgram/transcription/callback`
- HubSpot: `/api/v1/hubspot/webhook`
- Stripe: `/api/v1/stripe/webhook`
- Zoom: `/api/v1/zoom/webhook`
- Slack: `/api/v1/slack/webhook`, `/api/v1/slack/interactions`
- WorkOS: `/api/v1/workos/webhook`, `/api/v1/workos/actions/webhook`
- Recall.ai: `/api/v1/recall/webhook`, `/api/v1/recall/calendar-webhook`
- Resend: `/api/v1/resend/webhook`
- Merge.dev: `/api/v1/merge/webhook`
- Pipedream: `/api/v1/pipedream/webhook`
- Dialpad: `/api/v1/dialpad/calls-webhook`
- Zapier: `/api/v1/zapier/import-call`, `/api/v1/zapier/test`, `/api/v1/zapier/subscribe`, `/api/v1/zapier/unsubscribe`, `/api/v1/zapier/list`

**Outgoing Webhooks:**
- Novu notifications sent to users
- Web push via FCM (Firebase Cloud Messaging)
- Slack messages sent via `@slack/web-api`
- Email sent via SendGrid or Resend

**OAuth Callback Handlers:**
- `/api/v1/google/oauth/callback`
- `/api/v1/gmail/oauth/callback`
- `/api/v1/microsoft/oauth/callback`
- `/api/v1/salesforce/oauth/callback`
- `/api/v1/hubspot/oauth/callback`
- `/api/v1/asana/oauth/callback` (appears 3x)
- `/api/v1/ring-central/oauth/callback`
- `/api/v1/slack/oauth/callback`
- `/api/v1/zoom/oauth/callback`
- `/api/v1/dialpad/oauth/callback`

**GraphQL & Chat APIs:**
- `/graphql` - GraphQL server endpoint
- `/graphql/subscriptions` - WebSocket subscriptions
- `/api/v1/chat` - Chat API
- `/api/v1/clip-chat` - Clip-based chat
- `/api/v1/hubspot/chat` - HubSpot-integrated chat
- `/api/v1/hubspot/entity-details` - Entity lookup for HubSpot

---

*Integration audit: 2026-02-04*
