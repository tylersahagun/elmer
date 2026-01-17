# Synthetic Personas

Synthetic user personas for the jury validation system.

## Purpose

These are detailed persona profiles used by `/validate` to simulate user feedback on prototypes.

## Structure

```
personas/
├── README.md           # This file
├── personas.json       # Index of all personas
└── [persona-name]/
    └── profile.md      # Detailed persona profile
```

## Creating Personas

Run `/validate` to generate personas based on your product context, or create them manually following the template in `company-context/personas.md`.

## Persona Profile Template

```markdown
# [Persona Name]

## Demographics
- **Role:** [Job title]
- **Experience:** [Years in role]
- **Organization:** [Type/size]

## Psychographics
- **Motivations:** [What drives them]
- **Fears:** [What they worry about]
- **Decision style:** [How they evaluate tools]

## Technology Profile
- **Tech savviness:** [1-5]
- **Current tools:** [What they use today]
- **Adoption pattern:** [Early/mainstream/late]

## Evaluation Criteria
What they look for when evaluating new features:
1. [Criterion 1]
2. [Criterion 2]
3. [Criterion 3]

## Representative Quote
> "[How they would describe their needs]"
```
