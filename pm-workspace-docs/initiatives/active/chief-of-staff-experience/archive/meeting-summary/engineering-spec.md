# Engineering Spec: Meeting Summary

**Initiative:** Meeting Summary
**Parent:** Chief of Staff Experience
**Owner:** Tyler Sahagun
**Eng Lead:** TBD
**Phase:** Define
**PRD:** [prd.md](./prd.md)
**Design Brief:** [design-brief.md](./design-brief.md)

---

## Technical Approach Overview

Meeting Summary introduces a **first-class artifact layer** on top of the existing transcript/workflow pipeline. Rather than replacing the workflow engine, we add a presentation + edit layer that reads from generated summary data, allows template-based formatting, supports section-level AI rewrite, and persists user edits as versioned artifacts.

**Key architectural decisions:**

1. Summary is a **new data entity**, not a modification to existing workflow output
2. Template rendering happens **client-side** — templates define section structure; AI fills content
3. Section-level AI edit routes through **Global Chat** infrastructure (existing conversational AI)
4. Evidence links resolve to **transcript segments** (timestamp + speaker + text)
5. Edit history is **append-only** for auditability

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                   │
│  ┌──────────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ MeetingSummary│  │ Template │  │  Section Edit  │  │
│  │   (container) │  │  Picker  │  │  (AI rewrite)  │  │
│  └──────┬───────┘  └────┬─────┘  └───────┬───────┘  │
│         │               │                │           │
│  ┌──────▼───────────────▼────────────────▼─────────┐ │
│  │          Apollo Client (GraphQL cache)           │ │
│  └──────────────────────┬──────────────────────────┘ │
└─────────────────────────┼───────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────┐
│                    API Layer (GraphQL)                │
│  ┌──────────────┐  ┌──────────┐  ┌───────────────┐  │
│  │   Summary     │  │ Template │  │  AI Edit       │  │
│  │   Resolver    │  │ Resolver │  │  Resolver      │  │
│  └──────┬───────┘  └────┬─────┘  └───────┬───────┘  │
│         │               │                │           │
│  ┌──────▼───────┐  ┌────▼─────┐  ┌───────▼───────┐  │
│  │  Summary     │  │ Template │  │  Global Chat   │  │
│  │  Service     │  │ Service  │  │  Service       │  │
│  └──────┬───────┘  └────┬─────┘  └───────────────┘  │
└─────────┼───────────────┼───────────────────────────┘
          │               │
┌─────────▼───────────────▼───────────────────────────┐
│                   Data Layer                          │
│  ┌──────────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  meeting_     │  │ summary_ │  │ summary_edit_ │  │
│  │  summaries    │  │ templates│  │   history      │  │
│  └──────────────┘  └──────────┘  └───────────────┘  │
│  ┌──────────────┐  ┌──────────┐                      │
│  │  summary_    │  │ evidence │                      │
│  │  sections    │  │ _links   │                      │
│  └──────────────┘  └──────────┘                      │
└─────────────────────────────────────────────────────┘
```

---

## Data Model Changes

### New Tables

#### `meeting_summaries`

Primary entity for the summary artifact.

| Column           | Type        | Constraints                    | Description                   |
| ---------------- | ----------- | ------------------------------ | ----------------------------- |
| `id`             | UUID        | PK, default gen_random_uuid()  | Summary identifier            |
| `engagement_id`  | UUID        | FK → engagements.id, NOT NULL  | Parent engagement             |
| `template_id`    | UUID        | FK → summary_templates.id      | Template used to generate     |
| `status`         | ENUM        | NOT NULL, default 'generating' | generating, ready, error      |
| `version`        | INT         | NOT NULL, default 1            | Incremented on each save      |
| `created_by`     | UUID        | FK → users.id                  | User who triggered generation |
| `last_edited_by` | UUID        | FK → users.id, NULLABLE        | Last user to edit             |
| `created_at`     | TIMESTAMPTZ | NOT NULL, default now()        |                               |
| `updated_at`     | TIMESTAMPTZ | NOT NULL, default now()        |                               |
| `deleted_at`     | TIMESTAMPTZ | NULLABLE                       | Soft delete                   |

Indexes: `(engagement_id)`, `(template_id)`, `(created_by, created_at)`

#### `summary_sections`

Individual sections within a summary.

| Column                 | Type         | Constraints                         | Description                                                            |
| ---------------------- | ------------ | ----------------------------------- | ---------------------------------------------------------------------- |
| `id`                   | UUID         | PK                                  | Section identifier                                                     |
| `summary_id`           | UUID         | FK → meeting_summaries.id, NOT NULL | Parent summary                                                         |
| `template_section_key` | VARCHAR(100) | NOT NULL                            | Template-defined section identifier (e.g., "overview", "action_items") |
| `title`                | VARCHAR(255) | NOT NULL                            | Display title                                                          |
| `content`              | TEXT         | NOT NULL                            | Section content (markdown)                                             |
| `sort_order`           | INT          | NOT NULL                            | Display ordering                                                       |
| `is_ai_generated`      | BOOLEAN      | NOT NULL, default true              | Whether content is AI-generated or manually written                    |
| `last_edited_by`       | UUID         | FK → users.id, NULLABLE             |                                                                        |
| `last_edited_at`       | TIMESTAMPTZ  | NULLABLE                            |                                                                        |
| `created_at`           | TIMESTAMPTZ  | NOT NULL                            |                                                                        |

Indexes: `(summary_id, sort_order)`

#### `summary_templates`

Template definitions for meeting types.

| Column            | Type         | Constraints             | Description                                                        |
| ----------------- | ------------ | ----------------------- | ------------------------------------------------------------------ |
| `id`              | UUID         | PK                      | Template identifier                                                |
| `name`            | VARCHAR(255) | NOT NULL                | Display name (e.g., "Discovery Call")                              |
| `meeting_type`    | VARCHAR(50)  | NOT NULL                | discovery, demo, qbr, one_on_one, internal, general                |
| `description`     | TEXT         | NULLABLE                | Brief description shown in picker                                  |
| `sections_schema` | JSONB        | NOT NULL                | Ordered array of section definitions `[{key, title, prompt_hint}]` |
| `is_system`       | BOOLEAN      | NOT NULL, default false | System-provided vs user-created                                    |
| `owner_id`        | UUID         | FK → users.id, NULLABLE | NULL for system templates                                          |
| `organization_id` | UUID         | FK → organizations.id   | Org scope                                                          |
| `created_at`      | TIMESTAMPTZ  | NOT NULL                |                                                                    |
| `updated_at`      | TIMESTAMPTZ  | NOT NULL                |                                                                    |

Indexes: `(organization_id, meeting_type)`, `(owner_id)`

#### `summary_edit_history`

Append-only audit log for edits.

| Column             | Type        | Constraints                        | Description                                |
| ------------------ | ----------- | ---------------------------------- | ------------------------------------------ |
| `id`               | UUID        | PK                                 |                                            |
| `section_id`       | UUID        | FK → summary_sections.id, NOT NULL |                                            |
| `edit_type`        | ENUM        | NOT NULL                           | ai_rewrite, manual_edit, template_switch   |
| `previous_content` | TEXT        | NOT NULL                           | Content before edit                        |
| `new_content`      | TEXT        | NOT NULL                           | Content after edit                         |
| `ai_prompt`        | TEXT        | NULLABLE                           | Prompt used for AI rewrite (if applicable) |
| `edited_by`        | UUID        | FK → users.id, NOT NULL            |                                            |
| `created_at`       | TIMESTAMPTZ | NOT NULL                           |                                            |

Indexes: `(section_id, created_at)`

#### `evidence_links`

Links between summary insights and transcript source.

| Column                  | Type         | Constraints                        | Description                 |
| ----------------------- | ------------ | ---------------------------------- | --------------------------- |
| `id`                    | UUID         | PK                                 |                             |
| `section_id`            | UUID         | FK → summary_sections.id, NOT NULL |                             |
| `transcript_segment_id` | UUID         | FK → transcript_segments.id        | Source transcript segment   |
| `quote_text`            | TEXT         | NOT NULL                           | Extracted quote             |
| `speaker_name`          | VARCHAR(255) | NULLABLE                           | Attributed speaker          |
| `timestamp_seconds`     | INT          | NULLABLE                           | Position in recording       |
| `confidence_score`      | FLOAT        | NULLABLE                           | Extraction confidence (0-1) |
| `flagged_inaccurate`    | BOOLEAN      | NOT NULL, default false            | User-reported inaccuracy    |
| `created_at`            | TIMESTAMPTZ  | NOT NULL                           |                             |

Indexes: `(section_id)`, `(transcript_segment_id)`

---

## API Endpoints

### GraphQL Queries

```graphql
type Query {
  meetingSummary(engagementId: ID!): MeetingSummary
  summaryTemplates(meetingType: String): [SummaryTemplate!]!
  summaryEditHistory(sectionId: ID!, limit: Int): [SummaryEdit!]!
}

type MeetingSummary {
  id: ID!
  engagementId: ID!
  template: SummaryTemplate
  status: SummaryStatus!
  version: Int!
  sections: [SummarySection!]!
  createdBy: User
  lastEditedBy: User
  createdAt: DateTime!
  updatedAt: DateTime!
}

type SummarySection {
  id: ID!
  templateSectionKey: String!
  title: String!
  content: String!
  sortOrder: Int!
  isAiGenerated: Boolean!
  evidenceLinks: [EvidenceLink!]!
  lastEditedBy: User
  lastEditedAt: DateTime
}

type EvidenceLink {
  id: ID!
  quoteText: String!
  speakerName: String
  timestampSeconds: Int
  confidenceScore: Float
  flaggedInaccurate: Boolean!
}

type SummaryTemplate {
  id: ID!
  name: String!
  meetingType: String!
  description: String
  sectionsSchema: JSON!
  isSystem: Boolean!
}
```

### GraphQL Mutations

```graphql
type Mutation {
  # Generate or regenerate summary for an engagement
  generateSummary(engagementId: ID!, templateId: ID): MeetingSummary!

  # Switch template (re-renders summary with new structure)
  switchSummaryTemplate(summaryId: ID!, templateId: ID!): MeetingSummary!

  # AI rewrite a specific section
  rewriteSection(sectionId: ID!, instruction: String!): SectionRewriteResult!

  # Apply or discard a rewrite preview
  applySectionRewrite(
    sectionId: ID!
    rewriteId: ID!
    action: RewriteAction! # APPLY or DISCARD
  ): SummarySection!

  # Manual edit a section
  updateSectionContent(sectionId: ID!, content: String!): SummarySection!

  # Save current summary structure as a template
  saveAsTemplate(
    summaryId: ID!
    name: String!
    meetingType: String!
    description: String
  ): SummaryTemplate!

  # Share summary with privacy check
  shareSummary(
    summaryId: ID!
    sectionIds: [ID!]
    method: ShareMethod! # COPY_LINK, EMAIL, SLACK
    privacyAcknowledged: Boolean!
  ): ShareResult!

  # Flag an evidence link as inaccurate
  flagEvidenceLink(evidenceLinkId: ID!, reason: String): EvidenceLink!
}

type SectionRewriteResult {
  rewriteId: ID!
  originalContent: String!
  rewrittenContent: String!
  diffHtml: String!
}

enum SummaryStatus {
  GENERATING
  READY
  ERROR
}
enum RewriteAction {
  APPLY
  DISCARD
}
enum ShareMethod {
  COPY_LINK
  EMAIL
  SLACK
}
```

---

## Frontend Components

### New Components (`components/engagements/meeting-summary/`)

| Component              | File                         | Responsibility                                           |
| ---------------------- | ---------------------------- | -------------------------------------------------------- |
| `MeetingSummary`       | `meeting-summary.tsx`        | Root container; fetches data, orchestrates state         |
| `SummaryHeader`        | `summary-header.tsx`         | Template picker, metadata display, action buttons        |
| `SummarySection`       | `summary-section.tsx`        | Section card with content, evidence links, edit trigger  |
| `SummarySectionEdit`   | `summary-section-edit.tsx`   | Inline AI edit panel: prompt input, suggestions, preview |
| `SummarySectionDiff`   | `summary-section-diff.tsx`   | Diff display for AI rewrite preview                      |
| `TemplatePickerSelect` | `template-picker-select.tsx` | Meeting-type template dropdown                           |
| `EvidencePopover`      | `evidence-popover.tsx`       | Source quote popover for evidence links                  |
| `ShareDialog`          | `share-dialog.tsx`           | Privacy check + share method dialog                      |
| `SaveTemplateDialog`   | `save-template-dialog.tsx`   | Name + save template dialog                              |
| `SummarySkeleton`      | `summary-skeleton.tsx`       | Loading skeleton with progressive reveal                 |
| `SummaryEmpty`         | `summary-empty.tsx`          | Empty state (no transcript / no recording)               |
| `SummaryError`         | `summary-error.tsx`          | Error state with retry                                   |

### Modified Components

| Component               | Change                                                                         |
| ----------------------- | ------------------------------------------------------------------------------ |
| `ChatsTabs`             | Add "Summary" tab; conditionally set as default when engagement has transcript |
| Engagement detail route | Fetch summary availability; pass to ChatsTabs                                  |

### Apollo Cache Strategy

- `meetingSummary` query cached by `engagementId` — invalidate on mutation
- `summaryTemplates` query cached globally — invalidate on `saveAsTemplate` mutation
- `rewriteSection` returns preview without cache update; `applySectionRewrite` updates section in cache via `cache.modify`
- Optimistic updates for `updateSectionContent` (manual edit) to avoid perceived latency

---

## Integration Points

### Global Chat (AI Section Rewrite)

The `rewriteSection` mutation delegates to the Global Chat service for AI processing:

1. Frontend calls `rewriteSection(sectionId, instruction)`
2. API layer constructs a prompt combining: section content + transcript context + user instruction + template section purpose
3. Global Chat service processes the rewrite request
4. API returns `SectionRewriteResult` with original, rewritten, and diff HTML
5. Frontend shows preview; user applies or discards

**Prompt construction includes:**

- Current section content
- Template section definition (what this section is supposed to capture)
- Relevant transcript segments (for context, not full transcript)
- User's natural-language instruction
- System guardrails: "Rewrite only this section. Maintain factual accuracy. Preserve evidence links."

### Transcript Pipeline

Summary generation triggers after transcript processing completes:

1. Transcript pipeline finishes for an engagement
2. Event published: `transcript.processed`
3. Summary service listens and auto-generates summary using:
   - User's preferred template for the detected meeting type (or General default)
   - Full transcript as input
   - Template section schema as structure guide
4. Summary status transitions: `generating` → `ready` (or `error`)
5. Frontend polls or subscribes to status for real-time readiness

### Privacy Framework

Share controls integrate with the existing platform privacy framework:

- Summary access inherits engagement recording consent permissions
- `shareSummary` mutation checks: (a) user has share permission, (b) privacy acknowledged, (c) if external participants exist, additional flag is set
- Share audit logged to existing audit trail infrastructure

---

## Performance Considerations

### AI Rewrite Latency

- **Target:** Section rewrite completes in <5 seconds (p95 <8 seconds)
- **Strategy:** Stream rewrite response; show progressive content as it generates
- **Fallback:** If >5 seconds, show progress indicator with cancel option
- **Optimization:** Send only relevant transcript context (not full transcript) to reduce token count

### Summary Generation

- **Target:** Full summary ready within 60 seconds of transcript completion
- **Strategy:** Async generation with status polling; skeleton UI while generating
- **Optimization:** Generate sections in parallel (each section is independent) and stream to frontend as they complete

### Progressive Loading

- **Initial load:** Fetch summary metadata + first 3 sections; lazy-load remaining sections on scroll
- **Evidence links:** Loaded on-demand when popover triggered (not pre-fetched for all sections)
- **Edit history:** Loaded on-demand when user opens edit history panel

### Client Bundle

- **Code splitting:** `MeetingSummary` component tree lazy-loaded (not in initial engagement detail bundle)
- **Estimated addition:** ~15-20KB gzipped for summary component tree (acceptable within budget)

---

## Feature Flags

| Flag                             | Type    | Purpose                                       | Default |
| -------------------------------- | ------- | --------------------------------------------- | ------- |
| `meeting-summary-enabled`        | Boolean | Master kill switch for entire feature         | false   |
| `meeting-summary-ai-edit`        | Boolean | Enable AI section rewrite capability          | false   |
| `meeting-summary-templates`      | Boolean | Enable template selection (vs. General-only)  | false   |
| `meeting-summary-save-template`  | Boolean | Enable save-as-template functionality         | false   |
| `meeting-summary-evidence-links` | Boolean | Show evidence links in sections               | false   |
| `meeting-summary-share`          | Boolean | Enable share functionality with privacy check | false   |

**Rollout strategy:** Flags are progressively enabled. `meeting-summary-enabled` gates the tab. Sub-flags gate individual capabilities so they can be tested independently.

---

## Migration Strategy

### Existing Summaries → New Artifact Model

Current state: Summary content is generated by workflows and stored as workflow output.

**Migration approach (non-destructive):**

1. **Phase 1 — Dual write:** When a new summary is generated, write to both workflow output (existing) and `meeting_summaries` table (new). Existing summaries are not migrated.
2. **Phase 2 — Read from new:** Frontend reads from `meeting_summaries` when `meeting-summary-enabled` flag is on; falls back to workflow output when flag is off or no new-format summary exists.
3. **Phase 3 — Backfill (optional):** Background job converts historical workflow summaries to new format. This is lower priority and can happen post-GA.

**Zero-downtime approach:** Feature flag controls which read path is active. Rolling back is flag-flip only.

### Template Seeding

System templates seeded via database migration:

| Meeting Type | Template Name  | Sections                                                                                      |
| ------------ | -------------- | --------------------------------------------------------------------------------------------- |
| `general`    | General        | Overview, Key Discussion Points, Action Items, Next Steps                                     |
| `discovery`  | Discovery Call | Overview, Pain Points Identified, Qualification Criteria, Competitive Mentions, Next Steps    |
| `demo`       | Demo           | Overview, Features Discussed, Questions & Objections, Engagement Level, Follow-up Actions     |
| `qbr`        | QBR            | Executive Summary, Metrics Review, Risks & Escalations, Expansion Opportunities, Action Items |
| `one_on_one` | 1:1            | Topics Discussed, Decisions Made, Action Items, Follow-up Date                                |
| `internal`   | Internal       | Agenda Recap, Decisions, Action Items, Open Questions                                         |

---

## Testing Strategy

### Unit Tests

- Summary section rendering with various content types (markdown, lists, evidence links)
- Template picker state management (selection, loading, error)
- AI edit panel flow (prompt → loading → preview → apply/discard)
- Evidence popover rendering and positioning
- Privacy check logic in share dialog
- Edit history append-only invariant

### Integration Tests

- Full flow: Generate summary → switch template → edit section → save
- Apollo cache behavior: Mutations correctly update cached summary
- Feature flag gating: Components hidden/shown based on flag state
- Error recovery: Network failures during rewrite, template switch, save

### E2E Tests

- Open engagement → see summary tab as default → read sections
- Switch template → verify sections re-render with new structure
- AI rewrite → verify preview → apply → verify section updated
- Share flow → privacy check → confirm → verify share action
- Evidence link → popover → "View in transcript" navigation

### Performance Tests

- Summary load time with 10 sections and 50 evidence links (target: <2s)
- AI rewrite latency under concurrent usage (target: p95 <8s)
- Template switch re-render time (target: <3s)

### Accessibility Tests

- Keyboard navigation through all flows
- Screen reader announcement of state changes (loading, edit, save)
- Color contrast in both light and dark modes
- Focus trap in dialogs (share, save template)

---

## Rollout Plan

### Phase 1: Internal Dogfood (Week 1-2)

- **Flag:** `meeting-summary-enabled` = true for AskElephant org only
- **Scope:** Summary tab visible, General template only, manual edit only (no AI rewrite)
- **Goal:** Validate core artifact model, catch data model issues, gather team feedback
- **Exit criteria:** No P0 bugs; >80% of team uses summary tab at least once

### Phase 2: AI Edit Beta (Week 3-4)

- **Flag:** Enable `meeting-summary-ai-edit` and `meeting-summary-evidence-links` for internal
- **Scope:** AI section rewrite and evidence links available
- **Goal:** Validate AI rewrite quality, evidence link accuracy, latency targets
- **Exit criteria:** AI edit acceptance rate >60%; evidence link accuracy >90%; p95 rewrite <8s

### Phase 3: Template Beta (Week 4-5)

- **Flag:** Enable `meeting-summary-templates` and `meeting-summary-save-template` for internal + beta cohort (10-20 external accounts)
- **Scope:** Full template system including save-as-template
- **Goal:** Validate template usefulness, meeting-type coverage, save-as-template adoption
- **Exit criteria:** >30% of beta users switch template at least once; no template-related P0s

### Phase 4: Share + GA (Week 6-7)

- **Flag:** Enable `meeting-summary-share` for beta; then all flags to true for all accounts
- **Scope:** Full feature set including share with privacy check
- **Goal:** Validate share flow, privacy check UX, full feature adoption
- **Exit criteria:** Share rate >15% of summary views; zero privacy bypass incidents; all success metrics trending toward targets

---

## Security Considerations

- **Summary data access** inherits engagement-level RBAC — users can only see summaries for engagements they have access to
- **AI rewrite** sends section content + transcript context to LLM — same data handling as existing Global Chat; no new data exposure
- **Share audit** — all share actions logged with user, timestamp, method, recipients for compliance
- **Evidence links** — read-only references to transcript segments; no new write access to transcript data
- **Template save** — user-scoped by default; team templates (v2) will require org-admin approval

---

## Open Technical Questions

- [ ] Should AI rewrite use streaming response for progressive preview, or batch response?
- [ ] What is the maximum section content length before we truncate in the API?
- [ ] Should evidence links resolve via a separate query or be eagerly loaded with sections?
- [ ] What is the GraphQL subscription strategy for summary generation status updates (polling vs. subscription)?
- [ ] How should we handle concurrent edits if two users edit the same summary? (Likely edge case in v1)
- [ ] Should template `sections_schema` support conditional sections (e.g., "only show Competitive Mentions if detected")?

---

_Last updated: 2026-02-18_
_Owner: Tyler Sahagun_
