# Decisions Log: Universal Signal Tables

## Purpose
Track key decisions, their rationale, and any alternatives considered.

---

## Decision: Primary Persona is Sales Leader, Not Reps
**Date:** 2026-01-07
**Deciders:** Woody, Tyler, Matt
**Status:** Accepted

### Context
Needed to determine who the primary user of Universal Signal Tables would be. Reps vs Leaders have different needs and technical comfort levels.

### Options Considered
1. **Sales Reps as primary users**
   - Pros: Larger user base, self-service model
   - Cons: Reps won't do this; too much cognitive load for daily workflow

2. **Sales Leaders as primary users**
   - Pros: Matches "anxiety relief" use case; leaders are exploring/researching
   - Cons: Smaller user count per account

### Decision
Sales Leaders (Roger persona) are the primary user. RevOps (Otis) is secondary. Reps may view outputs but won't build tables.

### Consequences
- UX should optimize for exploration and iteration, not speed
- Onboarding should target leadership workflows
- Reps get "read-only" access or consumption views

---

## Decision: Data is Persistent, Not Dynamic
**Date:** 2026-01-07
**Deciders:** Woody, Tyler, Adia
**Status:** Accepted

### Context
When a user creates a table and adds columns, does the data refresh automatically on future visits?

### Options Considered
1. **Dynamic/Auto-refresh**
   - Pros: Always current data
   - Cons: Expensive; unclear user expectation; most tables are one-time use

2. **Persistent with manual re-run**
   - Pros: Cost control; clear mental model; users understand snapshot
   - Cons: Data may be stale if user doesn't realize

### Decision
Tables save with timestamp. Roll-up data (from existing annotations) is always fresh. AI-extracted columns require manual re-run for new engagements. Users pay for re-runs.

### Consequences
- UX must show "last run" timestamp
- Need clear affordance for "run on new data"
- Potential for "graduation" path to ongoing signal

---

## Decision: Chat + Builder Dual Interface
**Date:** 2026-01-07
**Deciders:** Woody, Skyler, Adam
**Status:** Proposed

### Context
How do users build and configure tables? Pure chat? Pure manual builder? Hybrid?

### Options Considered
1. **Chat-only**
   - Pros: Lowest friction; AI-first; matches vision
   - Cons: Lack of visibility creates trust issues

2. **Builder-only**
   - Pros: Full control; transparency
   - Cons: Intimidating; Clay-like complexity

3. **Chat + Builder hybrid**
   - Pros: Chat for speed, builder for visibility/trust; similar to Cursor
   - Cons: More complex to build; need clear separation

### Decision
Hybrid approach. Chat builds the table configuration; builder panel shows what was built. Users can edit in builder or iterate via chat.

### Consequences
- Two UI surfaces to design and maintain
- Need clear visual connection between chat commands and builder state
- Builder provides the "show your work" trust signal

---

## Decision: Conditional Column Execution
**Date:** 2026-01-07
**Deciders:** Woody, Adia, Tyler
**Status:** Accepted

### Context
Should all columns run on all rows, or can execution be conditional (if column A is true, run column B)?

### Options Considered
1. **All columns run on all rows**
   - Pros: Simpler implementation; predictable
   - Cons: Expensive; wasteful tokens; worse UX

2. **Conditional execution**
   - Pros: Cost savings; focused analysis; natural "choose your own adventure" flow
   - Cons: More complex configuration

### Decision
Conditional execution is core to the product. Current signals already support "only run if X is true" — extend this pattern.

### Consequences
- Column dependencies need visual representation
- Error handling for dependency chains
- Cost model benefits from this pattern

---

## Decision: Prototype Target is Tomorrow Afternoon
**Date:** 2026-01-07
**Deciders:** Tyler
**Status:** Action Item

### Context
How quickly should we have something visual to react to?

### Decision
Tyler pushing for prototype by EOD Jan 8. "This is a table, not a big design lift."

### Consequences
- Adam to create low-fi prototype quickly
- Iterate from something concrete vs. abstract discussion
- Risk of premature commitment if prototype becomes "the design"

---

