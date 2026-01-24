# Elmer PM Orchestration Platform

## What This Is

A PM orchestration platform that captures user feedback from multiple sources, auto-triages signals to projects, finds patterns across feedback, and maintains provenance so every product decision traces back to user evidence. Built on a multi-user workspace foundation with role-based collaboration.

## Core Value

Every product decision traces back to user evidence. No more lost feedback, no more "why did we build this?" Signals flow in, get processed, route to projects, and become the provenance chain for PRDs and prototypes.

## Current Milestone: v1.1 Signals System

**Goal:** Build a signal ingestion and intelligence layer that transforms the inbox into a processing queue for user feedback, auto-classifies and routes signals to projects, and synthesizes patterns to propose new initiatives.

**Target features:**

- Inbox redesign as signal processing queue
- Multi-source ingestion (webhooks, upload, paste, video links)
- Auto-triage: existing project vs new initiative
- Signal clustering and synthesis (`/synthesize`)
- Signal → project linking with provenance

## Requirements

### Validated

<!-- Shipped capabilities -->

- ✓ Kanban board with 11 workflow stages (inbox → discovery → PRD → design → prototype → validate → tickets → build → alpha → beta → GA) — existing
- ✓ Project management (create, update, delete, stage transitions) — existing
- ✓ Workspace configuration containers — existing
- ✓ AI job processing system (AgentExecutor + ExecutionWorker for automated PM work) — existing
- ✓ Document generation (PRDs, design briefs, engineering specs, GTM briefs) — existing
- ✓ Prototype generation via Cursor agent integration — existing
- ✓ PostgreSQL database with Drizzle ORM — existing
- ✓ Next.js 16 with React 19, TypeScript stack — existing
- ✓ Background worker system for async jobs — existing
- ✓ Knowledge base sync for workspace context — existing
- ✓ Stage automation with configurable recipes — existing
- ✓ Email/password authentication — v1.0
- ✓ Session management with JWT — v1.0
- ✓ User-owned workspaces with switcher — v1.0
- ✓ Invitation system with magic links — v1.0
- ✓ Role-based access control (Admin/Member/Viewer) — v1.0
- ✓ Activity logging and audit trail — v1.0
- ✓ Data migration for existing workspaces — v1.0

### Active

<!-- v1.1 Signals System -->

**Signal Ingestion (Layer 1):**

- [ ] Inbox redesign as signal processing queue (not project queue)
- [ ] Webhook endpoint to receive signals from external sources
- [ ] File upload for documents, transcripts
- [ ] Paste text/transcript directly
- [ ] Video link input (YouTube, Loom, etc.)
- [ ] Signal schema: source, verbatim, interpretation, severity, frequency, related_initiative
- [ ] Signal storage in database with workspace association

**Signal Intelligence (Layer 2):**

- [ ] Auto-classify: "this belongs to Project X" vs "this is new"
- [ ] Extract structured signal data from raw input
- [ ] Cluster related signals by topic/theme
- [ ] Frequency and severity ranking across signals
- [ ] `/ingest` command to process raw input into structured signal
- [ ] `/synthesize` command to find patterns and propose initiatives

**Signal → Project Integration (Layer 3):**

- [ ] Signals visible on project page as linked evidence
- [ ] "Signals that informed this project" section
- [ ] Signals can trigger PRD iteration/refinement
- [ ] Provenance chain: trace PRD decisions to source signals
- [ ] Create new project from clustered signals

### Out of Scope

- Audio/video transcription — handled externally by Ask Elephant, elmer receives pre-transcribed text
- Pylon ticket integration — nice-to-have for future, not v1.1
- Real-time signal processing — batch processing is sufficient
- Google OAuth login — paused from v1.0, can enable later
- Password reset via email — paused from v1.0, needs email service
- Email sending for invitations — paused from v1.0, links shared manually

## Context

**Existing System:**
Elmer is a fully functional PM orchestration tool with:

- Glassmorphic Kanban UI for managing product initiatives
- AI-powered document generation (PRDs, specs, briefs)
- Prototype building via Cursor agent with Storybook integration
- Synthetic jury validation using Condorcet voting
- Linear/Jira ticket generation from validated prototypes
- Background job system with retry logic and progress tracking
- Configurable automation per workflow stage

**Current State (after v1.0):**

- Multi-user authentication with email/password
- User-owned workspaces with invitation system
- Role-based permissions (Admin/Member/Viewer)
- Activity logging for audit trail
- Inbox currently creates projects directly (not signals)

**Why Signals:**

- User feedback comes from many sources (Ask Elephant transcripts, documents, conversations)
- Currently: manual process to extract insights and create projects
- Goal: automate ingestion, classification, routing, and pattern finding
- Every PRD should trace back to the user evidence that sparked it

**Integration Points:**

- Ask Elephant sends webhooks with transcripts
- Signals land in inbox, get processed, route to projects
- Projects accumulate signals as evidence over time

## Constraints

- **Tech Stack**: Must use existing elmer stack (TypeScript, Next.js 16, React 19, PostgreSQL, Drizzle ORM)
- **Deployment**: Self-hosted via local PostgreSQL (Docker) + Cloudflare Tunnel (https://elmer.studio)
- **Database**: Extend existing Drizzle schema for signals table; pgvector extension required
- **UI Framework**: Use existing Radix UI + Tailwind CSS v4 for consistency
- **External Transcription**: Elmer does not transcribe — receives pre-transcribed text
- **Webhook Security**: Webhooks should be authenticated (API key or signature verification)

## Key Decisions

| Decision                                          | Rationale                                                                          | Outcome   |
| ------------------------------------------------- | ---------------------------------------------------------------------------------- | --------- |
| User-owned workspaces                             | Matches Notion/Figma model where users create spaces and invite others             | ✓ Good    |
| Three-role permission model (Admin/Member/Viewer) | Simple enough to understand, covers 95% of collaboration patterns                  | ✓ Good    |
| Magic links for invites only                      | Reduces invite friction without complicating general authentication                | ✓ Good    |
| First user owns all existing data                 | Clean migration path for brownfield deployment                                     | ✓ Good    |
| Inbox becomes signal queue                        | Signals are the input, projects are the output — separates ingestion from creation | — Pending |
| Pre-transcribed text only                         | Transcription handled by Ask Elephant, reduces complexity                          | — Pending |
| Three-layer signal architecture                   | Ingestion → Intelligence → Integration allows incremental delivery                 | — Pending |
| Provenance chain for PRDs                         | Every decision traces to user evidence — builds trust and audit capability         | — Pending |

---

_Last updated: 2026-01-22 after v1.1 milestone initialization_
