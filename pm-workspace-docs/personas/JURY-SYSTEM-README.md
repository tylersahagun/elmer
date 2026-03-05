# Condorcet Jury System - Synthetic User Validation

## Overview

The Condorcet Jury System uses 1,000 synthetic user personas to validate product decisions at every phase of development. Based on Condorcet's Jury Theorem: if individual voters have >50% accuracy, the majority verdict approaches certainty as group size increases.

## Generated Assets

```
.pm-workspace/
├── personas/
│   ├── archetypes/                 # 5 master archetypes
│   │   ├── sales-rep.json          # 35% of personas
│   │   ├── sales-leader.json       # 25% of personas
│   │   ├── csm.json                # 15% of personas
│   │   ├── operations.json         # 15% of personas
│   │   └── strategic-consultant.json # 10% of personas
│   ├── generated/
│   │   └── batch-2026-01-08/
│   │       ├── all-personas.json   # 1000 personas
│   │       └── personas-stats.json # Diversity metrics
│   └── persona-schema.json         # JSON schema for personas
├── scripts/jury-system/
│   ├── generate_personas.py        # API-based generation
│   ├── expand_personas.py          # Procedural expansion
│   ├── jury_evaluator.py           # Full API evaluation
│   └── simulate_jury.py            # Local simulation
└── initiatives/[name]/
    └── jury-evaluations/           # Evaluation results
        ├── research-eval-*.json
        └── research-report-*.md
```

## Persona Distribution

| Archetype | Count | Percent |
|-----------|-------|---------|
| Sales Rep | 350 | 35% |
| Sales Leader | 250 | 25% |
| CSM | 150 | 15% |
| Operations | 150 | 15% |
| Strategic Consultant | 100 | 10% |

### AI Adoption Distribution (Critical for skeptic coverage)

| Stage | Percent | Base Approval Rate |
|-------|---------|-------------------|
| Skeptic | 35.1% | ~25% |
| Curious | 20.8% | ~55% |
| Early-Adopter | 20.4% | ~75% |
| Power-User | 23.7% | ~85% |

## How to Use

### 1. Run Simulation (No API Key Required)

```bash
python .pm-workspace/scripts/jury-system/simulate_jury.py \
  --initiative hubspot-agent-config-ui \
  --phase research \
  --jury-size 100
```

Phases: `research`, `prd`, `prototype`

### 2. Run Full API Evaluation (Requires ANTHROPIC_API_KEY)

```bash
export ANTHROPIC_API_KEY=your_key
python .pm-workspace/scripts/jury-system/jury_evaluator.py \
  --initiative hubspot-agent-config-ui \
  --phase research \
  --jury-size 100 \
  --skeptics 0.20
```

### 3. Integrate into PM Workflow

Add to your workflow commands:

```
@Cursor eval hubspot-config
```

This will:
1. Load 1000 personas from `all-personas.json`
2. Sample stratified jury (20% skeptics minimum)
3. Run parallel evaluations
4. Aggregate using Condorcet principles
5. Generate report with actionable recommendations

## Interpreting Results

### Verdict Thresholds

| Combined Pass Rate | Verdict | Action |
|-------------------|---------|--------|
| ≥80% | STRONG PASS | Ship with confidence |
| ≥60% | PASS | Address key concerns, proceed |
| ≥40% | CONDITIONAL | Iterate before proceeding |
| <40% | FAIL | Major pivot needed |

### Key Metrics to Watch

1. **Skeptic Pass Rate** - If <25%, skeptics see fundamental issues
2. **Archetype Variance** - High variance = segment-specific problems
3. **Top Friction Points** - Prioritize fixing highest-frequency issues
4. **Voice Feedback** - Qualitative insights from personas

## Example Report Highlights

From hubspot-agent-config-ui evaluation (1000 personas):

**Verdict:** FAIL (50.6% combined)

**Breakdown by Adoption Stage:**
- Skeptic: 18.2% pass
- Curious: 52.9% pass
- Early-Adopter: 66.2% pass  
- Power-User: 83.1% pass

**Top Friction Points:**
1. Rollback if something breaks (282 mentions)
2. Integration with existing tools (274 mentions)
3. Compliance/security concerns (250 mentions)

**Top Suggestions:**
1. Show what will sync before it syncs (174 mentions)
2. Clear activity log (180 mentions)
3. One-click pause/resume (161 mentions)

## Extending the System

### Add New Personas

1. Edit archetype in `archetypes/[name].json`
2. Run expansion: `python expand_personas.py --count 1000`
3. Verify diversity: check `personas-stats.json`

### Custom Evaluation Prompts

Edit prompt templates in `jury_evaluator.py`:
- `RESEARCH_EVAL_PROMPT` - Problem validation
- `PRD_EVAL_PROMPT` - Solution validation
- `PROTOTYPE_EVAL_PROMPT` - UI/UX validation

### Cost Optimization

- **Simulation**: Free (deterministic model)
- **API with Haiku**: ~$0.50 per 100 evaluations
- **API with Sonnet synthesis**: ~$0.10 per report

## Theoretical Foundation

Condorcet's Jury Theorem states:
- If each juror has probability p > 0.5 of being correct
- Then P(majority correct) → 1 as n → ∞

With n=100 and p=0.65:
- P(majority correct) ≈ 99.9%

This makes synthetic user validation highly reliable when:
1. Personas accurately represent target users
2. Evaluation prompts elicit authentic responses
3. Jury size is sufficiently large (n ≥ 50)

