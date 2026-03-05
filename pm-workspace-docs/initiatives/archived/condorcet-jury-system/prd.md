# Condorcet Jury System - Integrated Synthetic User Advisory Board

## Overview

Implement a synthetic user advisory system that validates product decisions at every phase of the PM workflow—not just post-prototype. By generating 100-3,000 diverse personas from real AskElephant customer conversations, we create a "digital twin" of our user base that participates in research synthesis, PRD validation, and prototype evaluation.

**Core Insight**: Condorcet's Jury Theorem proves that aggregating many imperfect opinions (each >50% accurate) produces near-perfect collective judgment. We apply this to product decisions by having synthetic personas vote on whether our solutions match their needs.

---

## Problem Statement

### Current State

The existing PM workflow (`research → PM → proto`) operates without systematic user validation:

| Phase | Current Approach | Gap |
|-------|-----------------|-----|
| **Research** | Analyze 1-3 interviews | Small sample, analyst bias |
| **PM** | Tyler writes PRD based on research | Single perspective, assumptions baked in |
| **Prototype** | Build based on PRD | No validation until real users see it |
| **Launch** | Ship and hope | Expensive to fix post-launch |

### Evidence of Need

From James Hinkson interview (2026-01-06):

> "We've had a lot of partners and clients who use the HubSpot agent, like, twice. It does something. They don't know what it does. So they turn it off."

This pattern—building something, shipping it, then discovering it doesn't match user mental models—is what the jury system prevents.

### Desired State

| Phase | With Jury System |
|-------|-----------------|
| **Research** | Extract pain points → Jury validates "Would this pain resonate with you?" across 500 personas |
| **PM** | Write PRD → Jury validates user stories and outcome chains |
| **Prototype** | Build prototype → Jury evaluates usability with persona-appropriate heuristics |
| **Launch** | Ship with confidence | Validated across synthetic population |

---

## Strategic Alignment

### Outcome Chain

```
Synthetic Jury System enables validation at every phase
  → so that product decisions match user mental models
    → so that features ship with higher first-use success rates
      → so that partner retention improves (James's "try twice then quit" problem solved)
        → so that expansion revenue increases
```

### Product Principles Alignment

| Principle | How This Aligns |
|-----------|----------------|
| **Outcomes > Outputs** | Validates business outcomes before building |
| **Human-Centered AI** | Personas represent real humans, not abstractions |
| **Trust Is Foundational** | Catches trust-breaking UX before it ships |
| **Quality Over Velocity** | Slower to build, faster to succeed |

---

## Target Personas

The jury system validates against **our** personas:

- **Sales Representative**: Primary prototype evaluator
- **Sales Leader**: PRD and reporting feature validator
- **CSM**: Retention flow validator
- **RevOps**: Integration and data quality validator

Each synthetic persona is a variation within these archetypes, grounded in real conversation data.

---

## Architecture Overview

### Integrated Workflow (New Commands)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PHASE 1: RESEARCH                                     │
│  @Cursor research [name]                                                    │
│                                                                             │
│  1. Analyze transcript → Extract pain points, quotes, themes                │
│  2. JURY VALIDATION: "Would this pain resonate with you?"                   │
│     - Sample 100-500 personas relevant to research topic                    │
│     - Majority vote on each pain point                                      │
│     - Flag: "92% of Sales Reps agree this is painful"                       │
│  3. Output: research.md + jury-validation/research-v1.json                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PHASE 2: PM / PRD                                     │
│  @Cursor PM [name]                                                          │
│                                                                             │
│  1. Generate PRD, Design Brief, Eng Spec from research                      │
│  2. JURY VALIDATION: Validate each component                                │
│     PRD:                                                                    │
│       - "Does this user story match your workflow?"                         │
│       - "Would this outcome chain benefit you?"                             │
│       - "Is anything missing from your perspective?"                        │
│     Design Brief:                                                           │
│       - "Does this user flow match your mental model?"                      │
│       - "Where would you get confused?"                                     │
│  3. Output: prd.md, design-brief.md, eng-spec.md                            │
│           + jury-validation/prd-v1.json, design-v1.json                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PHASE 3: PROTOTYPE                                    │
│  @Cursor proto [name]                                                       │
│                                                                             │
│  1. Build Storybook prototype based on PRD + Design Brief                   │
│  2. JURY EVALUATION: Full usability assessment                              │
│     - Screenshots captured via Playwright/Vision                            │
│     - Each persona evaluates against Nielsen heuristics                     │
│     - Task completion assessment per scenario                               │
│     - Aggregate via Condorcet voting + BTS for subjective feedback          │
│  3. Output: prototype components + jury-validation/proto-v1.json            │
│           + jury-report.md (actionable synthesis)                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PHASE 4: ITERATE (NEW)                                │
│  @Cursor iterate [name]                                                     │
│                                                                             │
│  1. Read latest jury-report.md, identify top friction points               │
│  2. Propose specific changes to prototype                                   │
│  3. Apply changes → Re-run mini-eval (50 personas, focused scenarios)       │
│  4. Compare: jury-validation/proto-v1.json → proto-v2.json                  │
│  5. Update iteration-log.md with what changed and why                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## File Structure (All Local, No Notion)

```
.pm-workspace/
├── personas/                              # Synthetic persona library
│   ├── archetypes/                        # Base archetypes (seeded from real interviews)
│   │   ├── sales-rep.json
│   │   ├── sales-leader.json
│   │   ├── csm.json
│   │   └── revops.json
│   ├── generated/                         # Expanded personas (1-3000)
│   │   └── batch-2026-01-08/
│   │       ├── manifest.json              # Metadata about this generation
│   │       ├── personas.json              # All personas in one file
│   │       └── by-archetype/              # Split by role for easier sampling
│   │           ├── sales-rep-001.json ... sales-rep-500.json
│   │           └── ...
│   ├── cohorts/                           # Pre-defined sampling groups
│   │   ├── by-role.json
│   │   ├── by-tech-level.json
│   │   ├── by-trust-level.json
│   │   └── skeptics-only.json             # 15% minimum skeptics
│   └── source-transcripts/                # Real conversations that seed personas
│       └── anonymized/
│
├── scenarios/                             # Evaluation scenarios
│   ├── _template.json
│   └── meeting-review-flow.json
│
├── initiatives/
│   └── [initiative-name]/
│       ├── research.md                    # Phase 1 output
│       ├── prd.md                         # Phase 2 output
│       ├── design-brief.md
│       ├── engineering-spec.md
│       ├── prototype-notes.md             # Phase 3 notes
│       ├── decisions.md
│       ├── iteration-log.md               # NEW: Track jury-driven iterations
│       └── jury-validation/               # NEW: All jury outputs
│           ├── research-v1.json           # Pain point validation
│           ├── prd-v1.json                # User story validation
│           ├── design-v1.json             # Flow validation
│           ├── proto-v1.json              # Usability evaluation
│           ├── proto-v2.json              # After iteration
│           └── jury-report.md             # Human-readable synthesis
│
├── company-context/
│   └── personas.md                        # Existing (keep as reference)
│
└── scripts/
    └── jury-system/                       # NEW: Implementation scripts
        ├── generate_personas.py
        ├── run_validation.py
        ├── run_evaluation.py
        ├── aggregate_results.py
        └── config.json
```

---

## Persona Generation Pipeline

### Stage 1: Archetype Extraction (One-Time Setup)

Extract archetypes from real AskElephant conversations:

**Input**: `.pm-workspace/research/user-interviews/*.md`

**Process**:
1. Parse each interview for role indicators, pain points, quotes, behaviors
2. Cluster similar interviews
3. Create archetype JSON per cluster

**Archetype Schema** (aligned with Document 2):

```json
{
  "archetype_id": "sales-rep-archetype",
  "source_interviews": ["2026-01-06-james-hinkson.md"],
  "demographics": {
    "role_title": "Account Executive",
    "department": "sales",
    "seniority": "individual-contributor",
    "decision_authority": "end-user"
  },
  "firmographics": {
    "company_size_range": ["51-200", "201-1000"],
    "industries": ["SaaS", "Tech"],
    "tech_maturity": "medium"
  },
  "psychographics": {
    "tech_literacy": "medium",
    "ai_adoption_stage": "curious",
    "trust_in_ai": 0.5,
    "patience_for_learning": 0.3,
    "detail_orientation": 0.6
  },
  "context": {
    "primary_pain": "Spends 30min/day on manual CRM logging",
    "current_workarounds": ["Memory", "Sticky notes", "Ignores CRM"],
    "success_looks_like": "CRM updated automatically after every call"
  },
  "voice_quotes": [
    "I don't have time to learn another tool",
    "If it breaks once, I'm going back to my spreadsheet"
  ]
}
```

### Stage 2: Verbalized Sampling for Diversity

Expand archetypes to 100-3000 personas using **Verbalized Sampling** (per Document 1, Section 2.3):

**Prompt Template**:

```
You are generating synthetic user personas for AskElephant, a meeting recording and AI analysis platform.

Base archetype: {archetype_json}

Generate 5 DISTINCT variations of this archetype. Each must:
1. Have probability < 0.10 (sample from distribution tails)
2. Include at least one "skeptic" or "resistant" variation
3. Vary on: company size, tech comfort, AI trust, patience level
4. Include authentic voice quotes that match the variation

Return JSON array with 'probability' and 'persona' for each variation.
Previous personas in this batch (avoid similarity): {previous_n}
```

**Diversity Enforcements**:
- 15% minimum skeptics (`ai_adoption_stage: "skeptic"`)
- No duplicate (role + company_size + tech_level) combinations
- Vary demographics (names, industries, company sizes)
- Temperature: 0.8-1.0 for generation diversity

### Stage 3: Stratified Distribution

Ensure representative coverage:

| Dimension | Distribution |
|-----------|--------------|
| **Role** | Sales Rep: 40%, Sales Leader: 25%, CSM: 20%, RevOps: 15% |
| **Company Size** | SMB: 20%, Mid-market: 50%, Enterprise: 30% |
| **Tech Proficiency** | Novice: 25%, Intermediate: 50%, Advanced: 25% |
| **AI Adoption** | Skeptic: 15%, Curious: 40%, Early Adopter: 35%, Power User: 10% |

---

## Jury Validation by Phase

### Phase 1: Research Validation

**When**: After extracting pain points from transcript analysis

**What**: Validate that identified pains resonate broadly

**Prompt** (per persona):

```
You ARE {persona.name}, a {persona.role.title} at a {persona.firmographics.company_size} company.

Your context:
- Tech comfort: {persona.psychographics.tech_literacy}
- AI attitude: {persona.psychographics.ai_adoption_stage}
- Current pain: {persona.context.primary_pain}

A product team has identified this pain point from customer research:

PAIN POINT: {extracted_pain_point}
QUOTE: {supporting_quote}

As {persona.name}, respond:

1. RESONANCE (1-5): How much does this pain point match your experience?
   1 = "This is not a problem for me"
   5 = "This is exactly my biggest frustration"

2. YOUR PERSPECTIVE: In 2-3 sentences, explain why this does or doesn't resonate. Speak in first person.

3. WHAT'S MISSING: Is there a related pain they might have overlooked?
```

**Aggregation**:
- Majority vote on resonance (threshold: >60% rate 4+)
- Cluster qualitative feedback by theme
- Flag gaps mentioned by >10% of personas

**Output**: `jury-validation/research-v1.json`

```json
{
  "validation_type": "research",
  "timestamp": "2026-01-08T14:30:00Z",
  "initiative": "hubspot-agent-config-ui",
  "sample_size": 200,
  "pain_points": [
    {
      "pain": "Zero visibility into agent behavior",
      "source_quote": "Not seeing what happened is one of the bigger pains today.",
      "resonance": {
        "mean": 4.3,
        "pct_strong_resonance": 0.78,
        "by_role": {
          "sales_rep": 4.1,
          "sales_leader": 4.6,
          "revops": 4.8
        }
      },
      "qualitative_themes": [
        "Can't debug when something goes wrong",
        "Lose trust when I don't understand what happened",
        "Have to ask support for every issue"
      ],
      "gaps_identified": [
        "Notification when something changes unexpectedly (12%)",
        "Undo capability (8%)"
      ],
      "verdict": "VALIDATED"
    }
  ]
}
```

### Phase 2: PRD Validation

**When**: After generating PRD and Design Brief

**What**: Validate user stories, outcome chains, and user flows

**Prompts**:

**User Story Validation**:
```
You ARE {persona.name}. A product team proposes this user story:

USER STORY:
As a {story.persona}, I want to {story.action} so that {story.benefit}.

ACCEPTANCE CRITERIA:
{story.criteria}

Evaluate as yourself:

1. RELEVANCE (1-5): Does this story describe something you actually need?
2. CLARITY: Do you understand what this feature would do?
3. COMPLETENESS: What's missing from your perspective?
4. PRIORITY: If this existed, how often would you use it?
   (Daily / Weekly / Monthly / Rarely / Never)
```

**Flow Validation**:
```
You ARE {persona.name}. Here's a proposed user flow:

TRIGGER: {flow.trigger}
STEPS:
1. {step_1}
2. {step_2}
...
OUTCOME: {flow.outcome}

Walk through this flow as yourself:
1. At which step would you hesitate or get confused?
2. Does this match how you'd expect to accomplish this task?
3. What would you try to do that isn't covered?
```

**Aggregation**:
- User stories: Pass threshold (>70% rate relevance 4+)
- Flows: Flag steps where >20% report confusion
- Prioritize: Borda count on user story importance

**Output**: `jury-validation/prd-v1.json`, `jury-validation/design-v1.json`

### Phase 3: Prototype Evaluation

**When**: After Storybook prototype is built

**What**: Full usability assessment with Nielsen heuristics

**Process** (per Document 1, Section 4-5):

1. **Visual Capture**: Use vision model to "see" prototype (screenshot or spec)
2. **Persona Evaluation**: Each persona critiques against scenario
3. **Self-Consistency**: Each agent generates 3 responses, votes internally
4. **Aggregation**: Condorcet voting for issues, BTS for subjective feedback

**Evaluation Prompt**:
```
You ARE {persona.name}, a {persona.role.title}.

YOUR CONTEXT:
- Tech comfort: {persona.psychographics.tech_literacy}
- AI trust: {persona.psychographics.trust_in_ai}
- Patience: {persona.psychographics.patience_for_learning}

SCENARIO: {scenario.description}
YOUR TASK: {scenario.task.primary_goal}
PROTOTYPE: [Description or screenshot]

Evaluate this prototype:

1. FIRST IMPRESSION (in your voice):
   What do you notice? What's unclear?

2. TASK WALKTHROUGH:
   - How would you attempt {task}?
   - Where do you hesitate?
   - Would you give up? When?

3. HEURISTIC SCORES (1-5):
   - Visibility of system status
   - Match with your expectations
   - User control and freedom
   - Consistency
   - Error prevention

4. SPECIFIC ISSUES:
   - What: [description]
   - Where: [UI element]
   - Severity: [cosmetic/minor/major/catastrophic]
   - Why it matters TO YOU: [persona-specific impact]

5. VERDICT: Would you use this? Why/why not?
```

**Aggregation** (per Document 2, Section "Voting and aggregation"):
- Issues: 20% threshold (must appear in 20%+ of evaluations)
- Heuristics: Mean, std, min/max by segment
- Qualitative: MoA synthesis with proposer-aggregator pattern

**Output**: `jury-validation/proto-v1.json`, `jury-validation/jury-report.md`

---

## Implementation Architecture

### Option A: Cursor-Native (Recommended for MVP)

All logic lives in Cursor rules and agent prompts:

```
.cursor/rules/
├── jury-system.mdc           # Core jury orchestration rules
├── jury-research.mdc         # Research phase validation
├── jury-prd.mdc              # PRD phase validation
├── jury-prototype.mdc        # Prototype phase evaluation
└── jury-iterate.mdc          # Iteration phase

.cursor/commands/
├── generate-personas.md      # /generate-personas
├── research.md               # Updated with jury validation
├── pm.md                     # Updated with jury validation
├── proto.md                  # Updated with jury evaluation
└── iterate.md                # New command
```

**Pros**: No external infrastructure, works immediately
**Cons**: Manual batching, limited parallelism

### Option B: MCP Server (Recommended for Scale)

Python MCP server handles heavy lifting (per Document 1, Section 7):

```python
# mcp-server/jury_server.py
from fastmcp import FastMCP, Context
import asyncio

mcp = FastMCP("AskElephant Jury System")

@mcp.tool(task=True)
async def validate_research(
    initiative: str,
    pain_points: list[dict],
    sample_size: int = 200,
    ctx: Context = None
) -> str:
    """Validate research pain points with synthetic jury"""
    personas = await load_personas(sample_size)
    results = await parallel_evaluate(personas, pain_points, "research")
    report = await aggregate_research(results)
    save_validation(initiative, "research", report)
    return f"Validation complete. See jury-validation/research-v1.json"

@mcp.tool(task=True)
async def evaluate_prototype(
    initiative: str,
    prototype_path: str,
    scenario: str,
    sample_size: int = 500,
    ctx: Context = None
) -> str:
    """Full prototype evaluation with jury"""
    # Capture prototype (vision or spec-based)
    # Run parallel persona evaluations
    # Aggregate with Condorcet + BTS
    # Generate synthesis report
    pass
```

**Cursor MCP Config** (`.cursor/mcp.json`):
```json
{
  "mcpServers": {
    "jury": {
      "command": "uv",
      "args": ["run", "--with", "fastmcp", ".pm-workspace/scripts/jury-system/server.py"],
      "env": {
        "ANTHROPIC_API_KEY": "${ANTHROPIC_API_KEY}"
      }
    }
  }
}
```

---

## Model Selection and Cost

Based on Document 2 cost modeling:

| Operation | Model | Cost Estimate |
|-----------|-------|---------------|
| Persona Generation (1000) | Claude Haiku | ~$0.80 |
| Research Validation (200 personas × 5 pains) | Claude Haiku | ~$0.50 |
| PRD Validation (300 personas × 10 stories) | Claude Haiku | ~$1.00 |
| Prototype Evaluation (500 personas) | Claude Haiku | ~$2.00 |
| Synthesis/Aggregation | Claude Sonnet | ~$0.50 |
| **Total per initiative** | | **~$5.00** |

**Optimization** (per Document 2):
- Prompt caching: Structure persona as system prompt
- Batch API: 50% discount for non-urgent runs
- Response caching: Same persona + unchanged input = cached result

---

## Success Metrics

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Prototype iterations before ship | 3-5 | 1-2 | Count PRs with "feedback" commits |
| First-use success rate | Unknown | >80% | PostHog: completed vs. abandoned flows |
| Partner "try twice then quit" | High (per James) | Low | HubSpot agent usage patterns |
| Time to confidence | Days (wait for user feedback) | Hours (jury report) | Time from proto to decision |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Mode collapse (all personas agree) | False confidence | Verbalized sampling, 15% skeptic minimum, diversity audits |
| LLM errors correlate | Condorcet fails | Prompt diversity (5 framings), self-consistency filtering |
| Synthetic != Real users | Wrong signals | Calibrate against real feedback, flag divergences |
| Over-reliance on jury | Skip real research | Jury supplements, doesn't replace interviews |
| Cost overruns | Budget issues | Model tiering, caching, batch processing |

---

## Implementation Phases

### Phase 0: Persona Foundation (Week 1)

- [ ] Extract archetypes from existing interview notes
- [ ] Create persona JSON schema
- [ ] Generate initial 500 personas with stratification
- [ ] Validate diversity (no mode collapse)

### Phase 1: Research Validation (Week 2)

- [ ] Update `research` command with jury validation
- [ ] Implement pain point resonance prompt
- [ ] Create `jury-validation/research-v1.json` output
- [ ] Test on hubspot-agent-config-ui initiative

### Phase 2: PRD Validation (Week 2-3)

- [ ] Update `PM` command with jury validation
- [ ] Implement user story and flow validation prompts
- [ ] Create design brief jury assessment
- [ ] Add to prd.md generation flow

### Phase 3: Prototype Evaluation (Week 3-4)

- [ ] Implement prototype capture (spec-based first, vision later)
- [ ] Build heuristic evaluation prompts
- [ ] Implement aggregation (voting + MoA synthesis)
- [ ] Create `jury-report.md` synthesis output

### Phase 4: Iteration Loop (Week 4)

- [ ] Create `iterate` command
- [ ] Implement change detection (v1 vs v2)
- [ ] Build mini-eval for validation
- [ ] Create iteration-log.md tracking

---

## Open Questions

1. **Calibration**: How do we measure if synthetic feedback matches real user behavior?
2. **Vision vs Spec**: Should we invest in Playwright vision capture or stick with spec-based evaluation?
3. **Scope per run**: 100 vs 500 vs 1000 personas—what's the sweet spot for signal vs cost?
4. **Integration depth**: Should jury run automatically on every command or be opt-in (`research --jury`)?
5. **Persona refresh**: How often should we regenerate personas as we learn more about users?

---

*Last updated: 2026-01-08*
*Owner: Tyler Sahagun*
