# AGENTS.md Writer Command

Generate product-focused AGENTS.md documentation for AI agents.

## Usage

```
/agents [path-to-component]
```

Example:
```
/agents web/src/components/integrations/hubspot
```

## Behavior

**Delegates to**: `docs-generator` subagent
**Uses**: `agents-generator` skill

The subagent will:
1. Analyze the target directory structure
2. Cross-reference with related initiatives and research
3. Check personas from company context
4. Generate AGENTS.md with product focus first, technical context second

## Purpose

Create documentation that gives AI agents:
- **Product context** - Problems solved, users served
- **User empathy** - Personas, fears, success criteria
- **Flow understanding** - Triggers, steps, outcomes
- **Trust factors** - What builds/breaks user trust

## Template Sections

```markdown
# [Component Name]

## Product Context
- Problem Solved
- Users Served
- Cognitive Load Eliminated

## User Personas
- Needs, Fears, Success definition

## Key User Flows
- Trigger → Steps → Outcome

## Trust & Experience
- What Builds Trust
- What Breaks Trust
- Error Recovery

## Technical Context
- Setup, Conventions, Testing

## AI Agent Guidelines
- What to do / avoid
```

## Save Location

Mirror the source structure:
```
Source: elephant-ai/web/src/components/integrations/hubspot/
Output: pm-workspace-docs/agents-docs/web/components/integrations/hubspot/AGENTS.md
```

## Quality Focus

Good AGENTS.md is:
- Product-first (problem before code)
- Persona-aware (specific names)
- Flow-complete (entry → success → failure)
- Trust-conscious (build/break factors)