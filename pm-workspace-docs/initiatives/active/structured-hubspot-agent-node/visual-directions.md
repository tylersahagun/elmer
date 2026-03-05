# Visual Directions: Structured HubSpot Agent Node

> **Generated**: 2026-02-12
> **Directions Per Screen**: 2-3
> **Chosen Direction**: Pending validation
> **Validated**: No

## Design Brief Summary

**Primary Goal**: Replace prompt-based HubSpot agent configuration with a property-first structured UI that RevOps can configure in under 5 minutes.

**Key Constraints**:

- Must use AskElephant design system (shadcn/ui, Inter font, 4px grid, semantic color tokens)
- Progressive disclosure: show advanced config only after properties are selected
- All controls must be keyboard accessible
- Confidence states must be visually distinct (not color-only)
- Must surpass Fathom's simplicity while delivering Momentum's depth

**Target Persona**: RevOps Admin -- configures CRM automation, needs to trust what the agent will write. Fears ungovernable AI, lack of auditability.

---

## Competitive Context

**Patterns informing these directions** (from `competitive-landscape.md`):

- **Fathom's simplicity benchmark**: Zero-config onboarding sets the bar for "getting started" UX. Our template selection screen must match this speed.
- **Momentum's prompt library anti-pattern**: 200+ prompts that take 100+ hours to configure is exactly what we're replacing. Our property cards must make prompt engineering unnecessary.
- **No competitor offers preview/diff**: The before/after sync preview is our unique trust mechanism. No competitor shows what will be written before it happens.
- **Avoma's field mapping**: Closest existing pattern to our property-first approach -- but limited to note field sync, not AI-powered extraction.

**Differentiation target**: The configurability of Gong/Momentum with the simplicity of Fathom, plus trust features (preview, diff, confidence) that no one else has.

---

## Key Screens

### Screen 1: Property Configuration Panel

This is the primary screen where RevOps defines which HubSpot fields to update and how. Users will spend the most time here. This screen defines the visual language of the entire feature.

#### Direction A: "Structured Form Cards"

- **Philosophy**: Conservative card-based form that matches existing AskElephant UI patterns. Each property is an expandable card with standard form controls.
- **Rationale**: Minimizes design system impact. Familiar shadcn/ui card + form pattern that existing users will recognize. Matches how Avoma handles field mapping (Settings > CRM style).
- **Trade-offs**: Safe but may feel like "just another settings page." Doesn't visually communicate the power of the property-first approach. Risk of looking like a basic admin form rather than an intelligent configuration tool.
- **Image**: `assets/mockups/config-panel-direction-a.png`

**What it shows**: Left sidebar with step indicator (Object Type, Matching, Properties, Review). Main area with expandable property cards showing Deal Stage expanded with instruction field, read-before-write toggle, write mode selector. Collapsed cards for Next Steps, MEDDIC Score, Close Date with dependency indicator. Clean, predictable, no surprises.

#### Direction B: "Live Preview Configuration"

- **Philosophy**: Elevated two-column layout that shows configuration AND its effect simultaneously. The right panel simulates a HubSpot record updating in real-time as users configure properties.
- **Rationale**: Leapfrogs Momentum by showing extraction previews inline. The live preview panel builds trust by answering "what will this actually do?" before saving. Surpasses Fathom's simplicity by being visual, not just toggles.
- **Trade-offs**: More complex implementation (requires sample meeting data for preview). Two-column layout may not work well on smaller screens. Higher initial cognitive load but faster trust-building.
- **Image**: `assets/mockups/config-panel-direction-b.png`

**What it shows**: Horizontal progress bar. Two-column layout: left side has property cards with rich inline editing, confidence scores, and extraction previews from sample meeting text. Right side shows a simulated HubSpot deal record (Acme Corp) with before/after field annotations. Template badge shows "Using: Deal Scoring Template." MEDDIC scoring breakdown visible inline.

#### Direction C: "Extraction Pipeline"

- **Philosophy**: Radical departure -- treats property configuration as a visual data pipeline. Meeting transcript flows left-to-right through extraction nodes into a HubSpot record preview.
- **Rationale**: Makes the AI extraction process visible and auditable. No competitor shows WHERE in the conversation each value was extracted from. Creates a direct visual link between source text and CRM field values. Surpasses every competitor's opaque "AI fills in fields" approach.
- **Trade-offs**: Highest implementation complexity. Requires transcript highlighting and flow visualization. May overwhelm simple use cases (just sync meeting notes). Bold visual departure from existing AskElephant patterns.
- **Image**: `assets/mockups/config-panel-direction-c.png`

**What it shows**: Left panel with meeting transcript snippet showing highlighted passages. Center: horizontal pipeline of extraction nodes (Deal Stage, Next Steps, Close Date, MEDDIC Score) connected by flow lines with dependency arrows. Each node shows extracted value and confidence ring. Right panel: HubSpot record preview with before/after values. Bottom trust bar: "4 fields configured | 3 high confidence | 1 needs review."

---

### Screen 2: Preview/Diff (Pre-Sync Review)

This is AskElephant's unique competitive differentiator -- no competitor offers this screen. It shows exactly what the agent will write to the CRM before it happens.

#### Direction B: "Field Diff Table"

- **Philosophy**: Code-review inspired before/after diff, presented as a clean table. Each row is a HubSpot field showing current value, proposed value, confidence score, source quote, and approval status.
- **Rationale**: Borrows the mental model of code review (PR diff) that RevOps and technical users understand. Shows confidence AND evidence (the source quote) for each extraction. Auto-approved vs. needs-review distinction makes the trust threshold visible.
- **Trade-offs**: Table layout works well for 4-10 fields but may need scrolling for larger configurations. Source quotes add density. Could be simplified for quick approvals.
- **Image**: `assets/mockups/preview-diff-direction-b.png`

**What it shows**: "Review Sync: Acme Corp - Enterprise Deal" header with meeting reference. Table with columns: Field, Before, After, Confidence & Source, Status. Deal Stage changes from "Proposal Sent" to "Closed Won" (94% confidence, auto-approved). MEDDIC Score shows 72% confidence with amber "Needs Review" badge. Bottom: "3 fields will auto-sync. 1 field requires your review." with Approve All and Run as Test buttons.

---

### Screen 3: Template Selection (Entry Point)

This is where users start -- the "getting started in under 5 minutes" promise.

#### Direction B: "Template Gallery"

- **Philosophy**: Welcoming, low-friction entry point that makes getting started feel effortless. Pre-built templates with clear descriptions reduce the "blank page" problem.
- **Rationale**: Matches Fathom's onboarding speed (minutes, not hours) while offering the depth that Fathom can't. "6 properties pre-configured" communicates immediate value. "Most Popular" badge guides uncertain users. Recent Configurations section shows returning users their existing work.
- **Trade-offs**: Template curation requires ongoing maintenance. Users who want full custom may find the template step unnecessary (addressed by "Custom Configuration" card with dashed border).
- **Image**: `assets/mockups/template-selection-direction-b.png`

**What it shows**: "Create New Agent Configuration" header with subtitle about 5-minute setup. 2x3 grid of template cards: Deal Scoring, Meeting Notes (Most Popular), Next Steps Tracker, Pipeline Update, Contact Enrichment, Custom Configuration (dashed border). Each card shows icon, name, description, property count, and "Use Template" button. Below: Recent Configurations section with quick-edit links.

---

## Recommendation

**Recommended Direction**: **B ("Elevated")** across all three screens, with elements borrowed from Direction C for the property configuration panel.

**Reasoning**:

- **Competitive positioning**: Direction B's live preview panel is a clear leap beyond Momentum (prompts without preview), Fathom (no configuration), and Gong (opaque enterprise setup). The preview/diff screen is a capability NO competitor has.

- **Implementation feasibility**: Direction B is achievable with existing shadcn/ui components (Card, Table, Badge, Progress). The live preview requires sample meeting data, which we already have in PostHog. Direction C's flow visualization would require a custom canvas component (higher risk).

- **Design system coherence**: Direction B extends the existing card + form pattern without breaking it. Direction A is too conservative (misses the opportunity to differentiate). Direction C introduces a new visual paradigm that may conflict with the rest of the app.

- **Persona alignment**: RevOps admins need to TRUST what the agent will do. Direction B's live preview and the diff screen directly address the core fear: "I don't trust AskElephant with my information or to manage my CRM." Seeing the extraction happen in real-time, with confidence scores and source quotes, builds trust before the first sync.

- **Borrow from C**: The transcript highlighting and source-quote provenance from Direction C should be incorporated into Direction B's extraction previews. Showing WHERE in the conversation each value came from is a trust mechanism worth the implementation cost.

---

## Design Vocabulary Established

These terms carry directly into Storybook implementation:

| Term               | Description                                                             | Component Mapping     |
| ------------------ | ----------------------------------------------------------------------- | --------------------- |
| Property Card      | Expandable configuration card for a single HubSpot field                | `PropertyConfigCard`  |
| Extraction Preview | Inline sample showing what the AI would extract from a meeting          | `ExtractionPreview`   |
| Confidence Badge   | Colored badge (emerald/amber/rose) showing extraction confidence %      | `ConfidenceBadge`     |
| Live Preview Panel | Right sidebar simulating a HubSpot record with proposed changes         | `LivePreviewPanel`    |
| Field Diff Row     | Before/after row with source quote and approval status                  | `FieldDiffRow`        |
| Trust Bar          | Bottom status bar showing field counts, confidence breakdown, last test | `TrustBar`            |
| Template Card      | Selectable card for pre-built agent configurations                      | `TemplateCard`        |
| Dependency Arrow   | Visual indicator showing field execution dependencies                   | `DependencyIndicator` |
| Source Quote       | Italic transcript excerpt linked to an extracted value                  | `SourceQuote`         |
| Review Badge       | Amber "Needs Review" indicator with action button                       | `ReviewBadge`         |

---

## Chosen Direction

- **Direction Chosen**: Pending
- **Modifications Requested**: None yet
- **Validated By**: Pending
- **Validated At**: Pending
- **Notes**: Recommendation is Direction B with transcript highlighting borrowed from Direction C. Review with Skylar and engineering before committing.
