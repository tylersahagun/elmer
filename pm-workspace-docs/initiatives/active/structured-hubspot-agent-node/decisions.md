# Decisions Log: HubSpot Agent Configuration UI

## Purpose

Track key decisions, their rationale, and any alternatives considered.

---

## Decision: Property-First Configuration (Not Prompt-First)

**Date:** 2026-01-06 **Deciders:** Tyler Sahagun **Status:** Proposed

### Context

The current HubSpot agent requires users to write complex prompts that reference field IDs, specify read order, and handle edge cases—all in a single text area spread across multiple workflow nodes.

### Options Considered

1. **Improve prompt templates** — Provide better starting prompts
   - Pros: Minimal engineering effort
   - Cons: Doesn't solve the fundamental UX problem; still requires prompt engineering

2. **Property-first UI with structured inputs** — Select fields from dropdowns, configure with toggles
   - Pros: Eliminates prompt engineering; makes dependencies explicit; enables validation
   - Cons: More engineering effort; may limit edge case flexibility

3. **Visual workflow builder** — Drag-and-drop nodes for each field
   - Pros: Very visual; familiar pattern
   - Cons: Significant engineering effort; may over-complicate simple cases

### Decision

Option 2: Property-first UI with structured inputs.

We believe this strikes the right balance between usability and flexibility. Power users can still write custom instructions per field, but the structure handles the complexity of field selection, dependencies, and sync configuration.

### Consequences

- Engineering investment in new UI components
- Need migration path for existing prompt-based configurations
- May need "advanced mode" for edge cases not covered by structured inputs

---

## Decision: Read-Before-Write as Explicit Toggle

**Date:** 2026-01-06 **Deciders:** Tyler Sahagun **Status:** Proposed

### Context

James described needing to "digest the content already in the field" before updating, and needing to read 8+ fields before writing a single output. This is currently embedded in prompt instructions.

### Options Considered

1. **Always read before write** — System automatically reads current value
   - Pros: Simpler UI; safer default
   - Cons: Adds latency to every update; may not be desired for all fields

2. **Toggle per field** — User explicitly enables read-before-write
   - Pros: User control; clear data flow
   - Cons: More UI complexity; users must understand when to enable

3. **Smart detection** — LLM analyzes instruction and infers whether to read
   - Pros: "Magic" experience
   - Cons: Unpredictable; hard to debug; may get it wrong

### Decision

Option 2: Explicit toggle per field.

Transparency is critical for trust. Users need to understand exactly what the agent will do, and an explicit toggle makes the behavior predictable.

### Consequences

- Need clear UI indication when read-before-write is enabled
- Need to show what fields are being read in dependency visualization
- Default should probably be OFF to avoid unexpected behavior

---

## Decision: Sync Toggle Per Field (Not Global)

**Date:** 2026-01-06 **Deciders:** Tyler Sahagun **Status:** Proposed

### Context

Users may want to compute values in AskElephant without pushing all of them to HubSpot. For example, intermediate scores that feed into a final probability.

### Options Considered

1. **Global sync toggle** — All or nothing
   - Pros: Simple
   - Cons: Forces users to either sync everything or nothing

2. **Per-field sync toggle** — Choose which fields push to HubSpot
   - Pros: Granular control; supports intermediate calculations
   - Cons: More UI complexity

### Decision

Option 2: Per-field sync toggle.

James described scenarios where internal scoring fields inform a final probability field—only the probability needs to sync to HubSpot.

### Consequences

- Need clear visual distinction between "computed locally" and "synced to HubSpot"
- May need audit log for what was/wasn't synced

---

## Pending Decisions

### Scorecard Builder: MVP or Post-MVP?

**Context:** James described weighted scoring with global downshifts (e.g., "if no buyer present, max 80%"). This is powerful but complex.

**Options:**

1. MVP — Include basic scorecard builder
2. Post-MVP — Ship property configuration first, add scorecard later
3. Advanced mode — Hidden feature for power users

**Status:** Needs team discussion

---

### Migration Strategy for Existing Configs

**Context:** We have partners with complex prompt-based configurations. How do we migrate them?

**Options:**

1. Auto-convert where possible, manual migration for complex cases
2. Run both systems in parallel indefinitely
3. Deprecate prompt interface with migration deadline

**Status:** Needs engineering input on feasibility

---
