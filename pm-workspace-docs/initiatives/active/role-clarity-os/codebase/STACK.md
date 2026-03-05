# Technology Stack

**Analysis Date:** 2026-02-04

## Languages

**Primary:**
- TypeScript 5.8.3 - Main language for web, functions, and build tools
- Python 3.12 - Firebase Functions backend for document processing and ML tasks

**Secondary:**
- JavaScript - Module system and configuration files
- GraphQL - API schema and query language

## Runtime

**Environment:**
- Node 24 - Required for TypeScript functions and web development (`engines.node` in `package.json`)
- Python 3.12 - Firebase Python Functions runtime

**Package Manager:**
- pnpm 10.28.2 - Workspace package manager with lockfile support
- Lockfile: `pnpm-lock.yaml` (present)
- Virtual environment (venv) for Python dependencies in `apps/functions_py`

## Frameworks

**Core:**
- React 18.3.1 - Web frontend UI framework (`apps/web`)
- Firebase Functions 6.1.1 & 7.0.4 - Serverless backend (TypeScript and Python)
- Expo / React Native - Mobile application (`apps/mobile`)
- Electron 38.0.0 - Desktop application shell for web app

**API & GraphQL:**
- graphql-yoga 5.3.1 - GraphQL server
- Apollo Client 3.14.0 - GraphQL client (web)
- urql 4.1.0 - Alternative GraphQL client library
- @graphql-yoga/plugin-defer-stream 3.3.0 - Streaming support

**Database & ORM:**
- Drizzle ORM 0.44.1 - Type-safe PostgreSQL ORM
- drizzle-kit 0.31.8 - Migration and schema generation tool
- better-sqlite3 12.6.2 - SQLite support for local operations

**Testing:**
- Vitest 4.0.17 - Unit and integration test runner
- @playwright/test 1.56.1 - E2E testing for web applications
- @vitest/coverage-v8 4.0.17 - Test coverage reporting
- @testing-library/react 14.3.1 - React component testing utilities
- Firebase Rules Unit Testing 4.0.1 - Security rules testing

**Build/Dev:**
- Vite 6.4.1 - Web bundler and dev server
- esbuild - TypeScript compilation optimization
- tsc-alias 1.8.16 - Path alias resolution
- Storybook 9.1.17 - Component documentation and visual development
- biome 2.3.11 - Linter and code formatter (replaces Prettier + ESLint)

**Infrastructure:**
- Pulumi - Infrastructure-as-code (`apps/pulumi`)
- nx 21.3.4 - Monorepo build orchestration
- concurrently 8.2.2 - Run multiple processes simultaneously

## Key Dependencies

**AI & LLM:**
- @ai-sdk/anthropic 2.0.57 - Anthropic API integration
- @ai-sdk/openai 2.0.89 - OpenAI API integration
- @ai-sdk/google 2.0.52 - Google Gemini integration
- @ai-sdk/google-vertex 3.0.97 - Vertex AI integration
- @ai-sdk/groq 2.0.34 - Groq LLM provider
- @ai-sdk/react 2.0.123 - React AI SDK hooks
- ai 5.0.121 - Unified AI SDK
- @langchain/core 1.1.8 - LangChain framework
- @langchain/langgraph 1.0.5 - LangGraph workflow system
- @modelcontextprotocol/sdk 1.25.2 - MCP protocol support

**CRM Integrations:**
- @hubspot/api-client 11.1.0 - HubSpot CRM SDK
- jsforce 3.7.0 - Salesforce.com API client

**Communication & Notifications:**
- @slack/web-api 7.0.4 - Slack API client
- @sendgrid/mail 8.1.3 - SendGrid email service
- resend 6.6.0 - Email delivery service
- web-push 3.6.7 - Web push notifications
- @novu/react 3.9.3 & @novu/api 3.12.0-rc.0 - Notification platform integration
- @deepgram/sdk 3.11.1 - Transcription service

**Cloud & Storage:**
- firebase 11.0.2 - Firebase SDK
- firebase-admin 13.6.0 - Firebase Admin SDK
- @google-cloud/cloud-sql-connector 1.9.0 - Cloud SQL connection
- @google-cloud/storage 7.18.0 - GCS file storage
- @google-cloud/pubsub 5.2.2 - Pub/Sub messaging
- @google-cloud/functions-framework 5.0.0 - Functions framework

**Database & Caching:**
- pg 8.13.1 - PostgreSQL client
- @valkey/valkey-glide 2.1.0 - Redis/Valkey client library

**Monitoring & Observability:**
- posthog-node 5.10.0 & posthog-js 1.276.0 - Product analytics
- @graphql-hive/yoga 0.33.0 - GraphQL monitoring
- @opentelemetry/* - OpenTelemetry instrumentation (trace, metrics, logs)

**Payments:**
- stripe 19.1.0 - Payment processing integration

**UI Components:**
- shadcn/ui - Headless component library (via Radix UI primitives)
- @radix-ui/* - Unstyled, accessible UI component library
- tailwindcss 4.1.14 - Utility-first CSS framework
- lucide-react 0.545.0 - Icon library

**Form & Validation:**
- react-hook-form 7.55.0 - React form state management
- @hookform/resolvers 5.2.1 - Form validation resolvers
- zod 4.3.6 - TypeScript schema validation

**Utilities:**
- date-fns 3.6.0 & date-fns-tz 3.2.0 - Date manipulation
- axios 1.12.0 - HTTP client
- ulidx 2.4.1 - ULID generator (used for IDs)
- async-mutex 0.5.0 - Async locking
- dataloader 2.2.3 - GraphQL N+1 prevention

## Configuration

**Environment:**
- `.env.example` at workspace root contains Chromatic Visual Testing token
- Environment variables injected via Firebase Cloud Functions `defineSecret()`
- Key secrets include: ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY, GROQ_API_KEY, XAI_API_KEY

**Build:**
- `tsconfig.base.json` - Shared TypeScript compiler options
- `tsconfig.json` - Root TypeScript config (extends base)
- `functions/tsconfig.json` - Functions-specific overrides
- `apps/web/tsconfig.json` - Web-specific overrides
- `biome.json` - Unified formatting and linting rules
- `firebase.json` - Firebase deployment configuration with function rewrites
- `vite.config.ts` - Web bundler configuration
- `playwright.config.ts` - E2E test configuration
- `drizzle.config.ts` - Database migration configuration

**Path Aliases:**
- Defined in `tsconfig.base.json` (currently minimal with notes for future library extraction)
- Common patterns: `@/` for workspace root imports

## Platform Requirements

**Development:**
- Node 24 (specified in engines)
- pnpm 10.28.2 (specified as packageManager)
- Python 3.12 (for Firebase Python functions)
- Docker & Docker Compose (for local PostgreSQL, Redis, emulators)
- Firebase CLI (for emulator and deployment)

**Production:**
- Google Cloud Platform (GCP) - Primary deployment target
- Firebase (Auth, Functions, Storage, Hosting, Realtime Database emulator)
- Cloud SQL PostgreSQL - Managed database
- Cloud Pub/Sub - Event messaging
- Cloud Storage - File uploads/downloads
- Cloud Run (for Python functions) or Cloud Functions

**Local Development Services:**
- PostgreSQL 15+ (via `docker-compose.yml`)
- Valkey/Redis 8 (via `docker-compose.yml`)
- Firebase Emulator Suite (Auth, Functions, Firestore, Storage, Pub/Sub, EventArc)

---

*Stack analysis: 2026-02-04*
