# Cursor Workspace Commands

Simple commands for PM workflows with **Synthetic Jury Validation** at every phase.

> All outputs are file-based in `.pm-workspace/`. No external dependencies.

---

## Quick Reference

| What you say | What happens |
|--------------|--------------|
| `@Cursor research [name]` | Analyze transcript → Jury validates pain points → `research.md` + `jury-validation/` |
| `@Cursor PM [name]` | Create PRD + Design Brief + Eng Spec → Jury validates stories/flows |
| `@Cursor proto [name]` | Build Storybook prototype → Jury evaluates usability → `jury-report.md` |
| `@Cursor iterate [name]` | Address jury feedback → Re-evaluate → Track improvements |
| `@Cursor new initiative [name]` | Create initiative folder from template |
| `@Cursor generate-personas` | Generate/refresh synthetic persona pool |

---

## The Condorcet Flow

Each phase includes **synthetic jury validation** using 100-500 diverse personas:

```
┌─────────────────────────────────────────────────────────────────────┐
│  RESEARCH                                                           │
│  @Cursor research hubspot-config                                    │
│                                                                     │
│  1. Analyze transcript → Extract pain points                        │
│  2. JURY: "Would this pain resonate with you?" (200 personas)       │
│  3. Output: research.md + jury-validation/research-v1.json          │
│                                                                     │
│  → "92% of Sales Reps agree this is painful"                        │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│  PM / PRD                                                           │
│  @Cursor PM hubspot-config                                          │
│                                                                     │
│  1. Generate PRD, Design Brief, Eng Spec from research              │
│  2. JURY: Validate user stories + flows (300 personas)              │
│  3. Output: prd.md, design-brief.md, eng-spec.md                    │
│           + jury-validation/prd-v1.json, design-v1.json             │
│                                                                     │
│  → "78% find this flow intuitive; RevOps confused at step 3"        │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│  PROTOTYPE                                                          │
│  @Cursor proto hubspot-config                                       │
│                                                                     │
│  1. Build Storybook prototype from PRD + Design Brief               │
│  2. JURY: Full usability evaluation (500 personas)                  │
│     - Nielsen heuristics scoring                                    │
│     - Task completion assessment                                    │
│     - Friction point identification                                 │
│  3. Output: components + jury-validation/proto-v1.json              │
│           + jury-validation/jury-report.md                          │
│                                                                     │
│  → "68% approval. Top issue: 'Where do I click to start?'"          │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│  ITERATE                                                            │
│  @Cursor iterate hubspot-config                                     │
│                                                                     │
│  1. Read jury-report.md → Identify top 3 friction points            │
│  2. Propose + apply specific changes                                │
│  3. Mini-eval (50 personas) → Validate improvements                 │
│  4. Output: proto-v2.json + iteration-log.md                        │
│                                                                     │
│  → "Approval improved: 68% → 84%. Ready for beta."                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Research

Analyze a transcript and validate findings with synthetic jury.

```
@Cursor research hubspot-config
```

Or with a transcript:

```
@Cursor research hubspot-config

Here's the transcript from today's call:
[paste transcript]
```

**What it does:**

1. Extracts key decisions, user problems, action items
2. Identifies pain points with supporting quotes
3. **JURY VALIDATION**: 200 personas vote on each pain point
4. Saves to `.pm-workspace/initiatives/hubspot-config/`

**Output files:**

```
initiatives/hubspot-config/
├── research.md                      # Standard research summary
└── jury-validation/
    └── research-v1.json             # Pain point resonance data
```

**Response:**

```
✅ Research complete for hubspot-config!

Key Findings:
- Users need visibility into agent behavior (92% resonance)
- Testing workflow is impossible (78% resonance)
- Configuration takes too long (89% resonance)

Jury Insights:
- Sales Reps: 4.1/5 avg resonance
- RevOps: 4.8/5 avg resonance (highest concern about audit trail)

Gaps Identified:
- "Notification when something changes unexpectedly" (12% mentioned)

📁 Files:
- .pm-workspace/initiatives/hubspot-config/research.md
- .pm-workspace/initiatives/hubspot-config/jury-validation/research-v1.json

Next: Say 'PM hubspot-config' to create project documentation
```

---

## PM / PRD

Create full project documentation with jury validation.

```
@Cursor PM hubspot-config
```

Or:

```
@Cursor PRD hubspot-config
```

**What it creates:**

| Document | Focus | Jury Validation |
|----------|-------|-----------------|
| **prd.md** | Problem, outcomes, MVP scope | User story relevance |
| **design-brief.md** | User flows, interactions | Flow mental model match |
| **engineering-spec.md** | Architecture, APIs, data models | — |

**Output files:**

```
initiatives/hubspot-config/
├── prd.md
├── design-brief.md
├── engineering-spec.md
├── decisions.md
└── jury-validation/
    ├── research-v1.json             # (from previous step)
    ├── prd-v1.json                  # User story validation
    └── design-v1.json               # Flow validation
```

**Response:**

```
✅ Project documentation created for hubspot-config!

PRD Jury Validation:
- User Stories: 8/10 passed (>70% relevance)
- 2 stories flagged for revision:
  - "As a RevOps admin..." (only 58% found relevant)
  - "As a new user..." (unclear acceptance criteria)

Design Brief Jury Validation:
- Flow intuition: 78% found intuitive overall
- Hesitation points flagged:
  - Step 3: "Select read-before-write fields" (32% confused)
  - Step 5: "Save and test" (22% expected different location)

📁 Files:
- prd.md, design-brief.md, engineering-spec.md
- jury-validation/prd-v1.json, design-v1.json

Next: Say 'proto hubspot-config' to build interactive prototype
```

---

## Prototype

Build a Storybook prototype with full jury evaluation.

```
@Cursor proto hubspot-config
```

Or with specific instructions:

```
@Cursor proto hubspot-config add validation toggle for each field
```

**What it does:**

1. Reads PRD and Design Brief
2. Checks existing patterns in `elephant-ai/web/src/components/`
3. Creates components in `elephant-ai/web/src/components/prototypes/[ProjectName]/`
4. Creates Storybook stories with `Prototypes/` title prefix
5. **JURY EVALUATION**: 500 personas evaluate against scenarios
6. Generates `jury-report.md` with actionable insights

**Output files:**

```
elephant-ai/web/src/components/prototypes/HubSpotConfig/
├── HubSpotFieldMapper.tsx
├── HubSpotFieldMapper.stories.tsx
└── index.ts

initiatives/hubspot-config/
├── prototype-notes.md
└── jury-validation/
    ├── proto-v1.json                # Raw evaluation data
    └── jury-report.md               # Synthesized insights
```

**Response:**

```
✅ Prototype created for hubspot-config!

🎨 Components:
- HubSpotFieldMapper.tsx
- HubSpotFieldMapper.stories.tsx
- SyncStatusIndicator.tsx

📱 Preview:
- Local: `cd elephant-ai && npm run storybook -w web`

👥 Jury Evaluation (500 personas):

Overall Approval: 68%
- Would use: 68%
- Would recommend: 62%
- Task completion confidence: 3.2/5

Top Friction Points:
1. "Where do I click to start?" (127 mentions, 45%)
2. "Empty state is confusing" (89 mentions, 31%)
3. "Read-before-write toggle unclear" (67 mentions, 24%)

Heuristic Scores:
- Visibility of status: 3.8/5
- Match with expectations: 3.2/5 ⚠️
- User control: 4.1/5
- Consistency: 4.0/5
- Error prevention: 2.9/5 ⚠️

Segment Insights:
- Sales Reps: 71% approval (higher than average)
- RevOps: 52% approval ⚠️ (need audit trail visibility)
- Skeptics: 45% approval ⚠️ (trust concerns)

📁 Files:
- jury-validation/proto-v1.json
- jury-validation/jury-report.md

Next: Say 'iterate hubspot-config' to address top friction points
```

---

## Iterate

Address jury feedback and re-validate improvements.

```
@Cursor iterate hubspot-config
```

**What it does:**

1. Reads latest `jury-report.md`
2. Identifies top 3 friction points
3. Proposes specific changes to prototype
4. Applies changes
5. Runs mini-eval (50 personas, focused scenarios)
6. Compares v1 → v2 results
7. Updates `iteration-log.md`

**Output files:**

```
initiatives/hubspot-config/
├── iteration-log.md                 # Track all iterations
└── jury-validation/
    ├── proto-v1.json
    ├── proto-v2.json                # New evaluation
    └── jury-report.md               # Updated with comparison
```

**Response:**

```
✅ Iteration complete for hubspot-config!

Changes Applied:
1. Added prominent "Get Started" button in header
2. Created onboarding wizard for empty state
3. Added tooltip explaining read-before-write toggle

Mini-Eval Results (50 personas):

| Metric | v1 | v2 | Delta |
|--------|----|----|-------|
| Overall approval | 68% | 84% | +16% ✅ |
| Task completion | 3.2 | 4.1 | +0.9 ✅ |
| Would recommend | 3.5 | 4.2 | +0.7 ✅ |

Remaining Issues:
- RevOps still wants audit log (42% mention)
- Loading states need work (18% mention)

📁 Files:
- jury-validation/proto-v2.json
- iteration-log.md (updated)

Recommendation: 84% approval meets threshold. Ready for beta.
Or: Say 'iterate hubspot-config' again to address remaining issues.
```

---

## Generate Personas

Generate or refresh the synthetic persona pool.

```
@Cursor generate-personas
```

Or with specific count:

```
@Cursor generate-personas count=500
```

**What it does:**

1. Reads archetypes from `.pm-workspace/personas/archetypes/`
2. Uses Verbalized Sampling to generate diverse variations
3. Enforces stratification (role, company size, tech level, AI adoption)
4. Ensures 15% minimum skeptics
5. Saves to `.pm-workspace/personas/generated/batch-[date]/`

**Output files:**

```
personas/generated/batch-2026-01-08/
├── manifest.json                    # Generation metadata
├── personas.json                    # All personas
└── by-archetype/
    ├── sales-rep-001.json ... sales-rep-200.json
    ├── sales-leader-001.json ... sales-leader-125.json
    ├── csm-001.json ... csm-100.json
    └── revops-001.json ... revops-075.json
```

**Response:**

```
✅ Generated 500 personas!

Distribution:
- Sales Rep: 200 (40%)
- Sales Leader: 125 (25%)
- CSM: 100 (20%)
- RevOps: 75 (15%)

Diversity Check:
- Tech proficiency spread: ✅ (std: 0.82)
- AI adoption spread: ✅ (std: 0.91)
- Skeptics: 78 (15.6%) ✅

📁 Files:
- .pm-workspace/personas/generated/batch-2026-01-08/

Personas ready for jury validation.
```

---

## New Initiative

Create a new initiative folder from template.

```
@Cursor new initiative salesforce-sync
```

With initial context:

```
@Cursor new initiative salesforce-sync

Context: Users report slow sync times. Need to investigate batch processing.
```

**What it creates:**

```
initiatives/salesforce-sync/
├── prd.md                           # Template with context
├── research.md                      # Empty template
├── design-brief.md                  # Empty template
├── engineering-spec.md              # Empty template
├── decisions.md                     # Decision log
├── prototype-notes.md               # Prototype notes
├── iteration-log.md                 # For tracking jury-driven iterations
├── research/
│   └── interview-notes.md           # Template
└── jury-validation/                 # Ready for jury outputs
```

---

## Full Workflow Example

**Step 1: After a user call**

```
@Cursor research hubspot-config

Transcript from today's call with James:
[paste transcript]
```

→ Gets research summary + jury-validated pain points

**Step 2: Create full documentation**

```
@Cursor PM hubspot-config
```

→ Gets PRD + Design Brief + Eng Spec with jury validation

**Step 3: Build prototype**

```
@Cursor proto hubspot-config
```

→ Gets Storybook components + jury evaluation report

**Step 4: Address feedback**

```
@Cursor iterate hubspot-config
```

→ Gets improved prototype + comparison metrics

**Step 5: Final validation**

```
@Cursor proto hubspot-config
```

→ Full re-evaluation to confirm readiness

---

## File Structure

All outputs are local in `.pm-workspace/`:

```
.pm-workspace/
├── personas/                        # Synthetic persona pool
│   ├── archetypes/                  # Base persona types
│   ├── generated/                   # Expanded personas (100-3000)
│   └── cohorts/                     # Sampling groups
│
├── scenarios/                       # Evaluation scenarios
│
├── initiatives/
│   └── [name]/
│       ├── research.md              # Phase 1 output
│       ├── prd.md                   # Phase 2 output
│       ├── design-brief.md
│       ├── engineering-spec.md
│       ├── prototype-notes.md       # Phase 3 notes
│       ├── decisions.md
│       ├── iteration-log.md         # Track improvements
│       └── jury-validation/         # All jury outputs
│           ├── research-v1.json
│           ├── prd-v1.json
│           ├── design-v1.json
│           ├── proto-v1.json
│           ├── proto-v2.json
│           └── jury-report.md
│
└── company-context/                 # Product vision, personas, etc.
```

---

## Jury System Details

### Sample Sizes

| Phase | Default | Rationale |
|-------|---------|-----------|
| Research | 200 | Pain point resonance |
| PRD | 300 | Story + flow validation |
| Prototype | 500 | Full usability eval |
| Iterate (mini) | 50 | Focused re-validation |

### Passing Thresholds

| Validation Type | Pass Threshold |
|-----------------|----------------|
| Pain point resonance | >60% rate 4+ |
| User story relevance | >70% rate 4+ |
| Flow intuition | <20% hesitation per step |
| Prototype approval | >70% would use |
| Issue significance | >20% mention rate |

### Cost Estimate

| Phase | Cost |
|-------|------|
| Research validation | ~$0.50 |
| PRD validation | ~$1.00 |
| Prototype evaluation | ~$2.00 |
| Iterate mini-eval | ~$0.25 |
| Synthesis | ~$0.50 |
| **Total per initiative** | **~$4.00** |

---

## Tips

- **Validate early**: Run research validation before investing in PRD
- **Trust skeptics**: If the 15% skeptics reject something, pay attention
- **Segment insights matter**: Sales Reps may love what RevOps hates
- **Iterate until 80%+**: Don't ship with <70% approval
- **Jury supplements, not replaces**: Still do real user interviews

---

## Troubleshooting

**"Jury validation is taking too long"**
- Reduce sample size for quick validation: `research [name] --sample=50`
- Use mini-eval for iteration: automatically uses 50 personas

**"All personas agree (mode collapse)"**
- Check diversity metrics in generation manifest
- Regenerate with explicit skeptic requirement
- Verify temperature settings (should be 0.8-1.0)

**"Jury says pass but real users struggle"**
- Run calibration: compare synthetic vs real PostHog data
- Add more skeptics to sample
- Review if personas match actual user base
