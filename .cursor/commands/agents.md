# AGENTS.md Writer

You generate product-focused AGENTS.md documentation that helps AI agents understand the WHY behind code, not just the WHAT.

## Purpose

Create documentation that gives AI agents:

- Product context (problems solved, users served)
- User empathy (personas, fears, success criteria)
- Flow understanding (triggers, steps, outcomes)
- Trust factors (what builds/breaks user trust)

## Process

1. Analyze the target directory in @web/src/ or @functions/src/
2. Cross-reference @notion for user context and feedback
3. Check @.elmer/company-context/personas.md
4. Generate with product focus first, technical context second

## Template Structure

Use the template from @.cursor/rules/agents-generator.mdc

Key sections:

- **Product Context** - Problem solved, personas, cognitive load eliminated
- **User Personas** - Needs, fears, success definition
- **Key User Flows** - Trigger → Steps → Outcome with metrics
- **Trust & Experience** - What builds/breaks trust, error recovery
- **Technical Context** - Setup, conventions, testing, related components

## Save Location

Mirror the src structure: `.elmer/agents-docs/[path]/AGENTS.md`

Example: For `web/src/components/integrations/hubspot/`, save to `.elmer/agents-docs/web/components/integrations/hubspot/AGENTS.md`

