# Synthetic Personas

Synthetic user personas for the jury validation system. The jury system uses these personas to simulate user feedback on research findings, PRDs, and prototypes.

## Structure

```
personas/
├── README.md           # This file
├── archetypes/         # Archetype definitions (templates)
│   ├── sales-rep.json
│   ├── sales-leader.json
│   ├── operations.json
│   ├── csm.json
│   └── strategic-consultant.json
├── seeds/              # Small committed set (3-5 per archetype)
│   ├── sales-rep-personas.json
│   ├── sales-leader-personas.json
│   ├── operations-personas.json
│   ├── csm-personas.json
│   └── strategic-consultant-personas.json
└── generated/          # Large generated batches (gitignored)
    └── batch-YYYY-MM-DD/
        ├── personas.json
        ├── all-personas.json
        └── personas-stats.json
```

## How It Works

### Archetypes
Template definitions for each persona type. Define:
- Role characteristics and responsibilities
- Common pains and success criteria
- Evaluation heuristics (how they judge features)
- Typical tools they use
- Fears and concerns
- Psychographic ranges for generation

### Seeds (Committed)
A small set of fully-formed personas (3-5 per archetype) committed to the repo. These allow:
- **Running jury evaluations immediately** without generation
- **Deterministic testing** with known persona set
- **Local development** without API costs

### Generated (Gitignored)
Large batches (100-1000+) created by `expand_personas.py`. These provide:
- **Higher statistical confidence** for jury verdicts
- **More realistic distribution** of characteristics
- **Greater diversity** in feedback

## Running Jury Evaluations

The jury system automatically finds personas in this order:
1. **Generated batch** (if exists) - uses `generated/batch-*/all-personas.json`
2. **Seed personas** - falls back to `seeds/*.json`
3. **Expansion** - if seeds are insufficient, expands them with light variation

```bash
# Works immediately with just seeds
python elmer-docs/scripts/jury-system/simulate_jury.py \
  --initiative [name] --phase research --jury-size 25

# For higher confidence, generate a larger batch first
python elmer-docs/scripts/jury-system/expand_personas.py
```

## Generating More Personas

To create a large batch for higher confidence evaluations:

```bash
# Generate 1000 personas from seeds
python elmer-docs/scripts/jury-system/expand_personas.py

# Output goes to generated/batch-YYYY-MM-DD/
```

## Persona Schema

Each persona includes:

```json
{
  "id": "unique_identifier",
  "archetype_id": "sales-rep",
  "demographics": {
    "name": "Marcus Chen",
    "age": 28,
    "location": "San Francisco, CA",
    "years_experience": 4
  },
  "firmographics": {
    "industry": "B2B SaaS",
    "company_size": "51-200",
    "funding_stage": "series-b"
  },
  "psychographics": {
    "tech_literacy": "advanced",
    "ai_adoption_stage": "early-adopter",
    "trust_in_ai": 0.72,
    "tool_fatigue": 0.45,
    "patience_for_learning": 0.68,
    "communication_style": "driver",
    "complexity_tolerance": 0.7,
    "migration_sensitivity": 0.4
  },
  "context": {
    "primary_pain": "Spending too much time on CRM updates",
    "fear": "AI making mistakes that hurt my deals"
  }
}
```

## Key Fields for Jury Evaluation

| Field | Used For |
|-------|----------|
| `ai_adoption_stage` | Stratified sampling (ensure skeptic representation) |
| `trust_in_ai` | Base probability for approval |
| `tool_fatigue` | Resistance to new tools |
| `patience_for_learning` | Tolerance for complexity |
| `archetype_id` | Role-specific concerns and suggestions |
| `context.fear` | Generate realistic objections |

## Maintaining Skeptic Representation

The jury system enforces **minimum 15% skeptics** in every sample. This is critical because:
- Skeptics catch issues optimists miss
- Real user bases include skeptics
- Early adopter bias produces unrealistic results

Seed personas include at least one skeptic per archetype to ensure this is always possible.

## Adding New Archetypes

1. Create `archetypes/[archetype-id].json` with template
2. Create `seeds/[archetype-id]-personas.json` with 3-5 personas
3. Ensure at least one seed has `ai_adoption_stage: "skeptic"`
4. Run jury evaluation to verify loading works
