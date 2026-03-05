# Research Summary: Design System & Workflow Modernization

**Date:** 2026-01-22  
**Participants:** Tyler Sahagun (PM), Skyler (Design Lead), Adam (mentioned), Rob (mentioned)  
**Type:** Internal Process Discovery

---

## TL;DR

Tyler and Skyler discussed the future of design handoff at AskElephant. Key decision: **Figma is no longer central to the workflow**—design will happen primarily in Cursor/Storybook with tokenized components. Skyler articulated two core design principles: **Human-First Design** and **High UX Visual Consistency**. The outcome is a plan to (1) audit legacy components, (2) implement design quality checks in CI, and (3) create a token-based design system that engineers must use.

---

## Strategic Alignment

**Score:** Strong ✅

**Aligned:**
- ✅ **Quality Over Velocity**: Explicitly about building a foundation for consistent quality
- ✅ **Human-Centered**: Skyler's "Human-First Design" framework directly maps to product principles
- ✅ **Trust Foundation**: UX consistency builds user trust ("Apple unboxing" metaphor)
- ✅ **Outcome-oriented**: Clear tie to brand perception and team efficiency

**Concerns:**
- ⚠️ **Internal vs. Customer Impact**: This is enabler tooling—we should ensure we don't gold-plate the process
- ⚠️ **Alma.ai dependency**: Skyler waiting on demo (week and a half delay)—may need fallback plan

---

## Key Decisions

1. **Figma is NOT central to the new workflow** — Design happens in Cursor/Storybook
   > "I don't see Figma as a crucial part of this process." — Skyler

2. **Storybook + Chromatic is the source of truth** for both discussion and handoff

3. **Design tokens will define what prototypes can look like** — Components reference tokens, not custom styles

4. **Design quality checks will be added to CI** — Like lint/code quality, but for design consistency

5. **Red/Yellow/Green light system** for design reviews:
   - 🟢 Green = No changes needed
   - 🟡 Yellow = Changes needed, then good to go
   - 🔴 Red = Back to drawing board

---

## Action Items

- [ ] **Tyler**: Run audit of legacy components to find "rogue" non-tokenized elements
- [ ] **Tyler**: Set up design quality check in CI workflow (agent-based review)
- [ ] **Skyler**: Provide documentation/resources for design principles:
  - Atomic Design by Brad Frost
  - Human-First Design pillars
  - UX consistency references
- [ ] **Skyler**: Learn Storybook editing workflow (currently unfamiliar with direct editing)
- [ ] **Tyler & Rob**: Continue process discussion and bring Rob into alignment
- [ ] **Follow-up**: Explore Alma.ai as potential design tool (Skyler waiting on demo)

---

## User Problems (Internal Team)

### Design Handoff Friction

> "You've asked the question a couple times... like, how do I actually make edits to this?" — Tyler (about Skyler's feedback)

- **Pain**: Designers can't easily tweak prototypes in Storybook
- **Current State**: Designers review in Chromatic → feedback loop → engineer makes changes
- **Desired State**: Designers can directly edit tokens/components in Cursor

### Component Inconsistency

> "We have bad consistency throughout the platform... there should be no button that exists that is not referenced from the actual component." — Skyler

- **Pain**: 30%+ of components are "rogue" one-offs not in design system
- **Impact**: Brand feels muddy, trust erosion, maintenance burden
- **Example**: Billing page has inconsistent styling vs. rest of platform

### Designer-Engineer Ratio Imbalance

> "We have two designers and [many] engineers... unless we have some sort of token system [we're handicapped]" — Tyler

- **Pain**: 2 designers can't review all engineer output
- **Solution**: Token system gives every line of code "Skyler's seal of approval"

---

## Skyler's Design Framework

### Human-First Design (3 Pillars)

1. **Meet them where they're at** — Design for user's context and mental model
2. **Make it obvious** — Clarity over cleverness
3. **Make their lives better** — Genuine value, not feature bloat

> "It's meeting them where the rat [they're at], and then it's making their lives better." — Skyler

### High UX Visual Consistency

**Definition**: When navigating the platform, patterns are predictable:
- Consistent header structure
- Predictable modal/form interactions
- Same drawer patterns throughout
- Creates "pattern of expectation"

**The Apple Effect:**
> "When you unbox an incredible new laptop from Apple and the cord is mono-neat perfect... They must put so much care and consideration into the rest of the product." — Skyler

**dbrand Example**: Consistent brand voice from packaging → website → support → social. Creates cohesive perception.

---

## Feature Ideas / Solutions Discussed

### 1. Design Quality Check in CI

**Concept**: Add automated design review to PR workflow (alongside code quality)

**How it would work:**
- Agent reviews PR for:
  - New components that should be in Storybook
  - Rogue styling not using tokens
  - Human-first design violations
  - UX consistency issues
- Blocking vs. non-blocking checks (like yellow/red/green system)

**Outcome chain:** ✅ Clear
```
Automated design checks catch inconsistencies
  → so that engineers get immediate feedback
    → so that rogue components don't ship
      → so that UX consistency improves
        → so that user trust increases
```

### 2. Token-Based Component System

**Concept**: All components must reference design tokens, not custom values

**Levels** (per Atomic Design):
- **Atoms**: Base tokens (colors, spacing, typography)
- **Molecules**: Combinations of atoms (button = color + spacing + typography + border)
- **Components**: Full reusable elements

**Benefit**: Engineers can't accidentally break design language

### 3. Legacy Audit & Componentization

**Three-step process** (from Skyler):
1. **Audit**: Find all non-componentized/non-tokenized elements
2. **Refactor/Overhaul**: Create proper components in Storybook
3. **Redeploy**: Replace rogue elements with proper component references

### 4. Design Jury Agent (Extension of User Jury)

**Concept**: Create synthetic "designer" personas that evaluate designs against principles

> "I want an agent jury that's going through and evaluating those principles, design principles." — Skyler

**Difference from User Jury:**
- User Jury = Validates from customer persona perspective
- Design Jury = Validates from design principle perspective

---

## Insights & Patterns

### Cursor as Design Tool
Skyler has successfully used Cursor + Figma MCP for design work:
> "I did design in Figma to start, and then I used a Cursor MCP to pull it in... I did that to get 75% of the way there. And then I just did the rest of the refining inside Cursor."

**Implication**: The future is Cursor-native design, not Figma-export design.

### Brand Rebrand Timing
> "With the rebrand, we're one of the next phases... I wanna inject where it makes sense a lot of that new brand direction, colors, vibe, type also into the product." — Skyler

**Timeline**: "A couple months out" — Design system work enables this.

### Product Ops Role
> "You know what you're doing? You're fulfilling natively a bunch of product ops... You're enabling other people." — Skyler (to Tyler)

Tyler's PM workspace work is effectively internal product tooling.

---

## Open Questions

1. **What's the Alma.ai fallback?** — Skyler is waiting on a demo, but it's a week and a half delayed. Should we plan without it?

2. **How does rebrand timing affect this?** — Is design system work blocking the brand refresh, or parallel?

3. **What's the minimum viable audit?** — Can we scope to "buttons only" or "billing page only" first?

4. **Who owns Storybook component creation going forward?** — Engineers? Designers? Both?

5. **What training does Skyler need?** — He said he's never worked directly in Storybook.

---

## Questions to Answer Before PRD

1. **What does a "design quality check" specifically check for?** — Need Skyler's documentation
2. **What's the token structure?** — Does current codebase have any tokenization to build on?
3. **What's the scope of legacy audit?** — Full platform or priority areas?
4. **What's the timeline expectation?** — Tied to rebrand or independent?

---

## Resources to Gather

From Skyler (action item):
- [ ] Atomic Design by Brad Frost
- [ ] Human-First Design documentation
- [ ] Design system course notes (mentioned taking one)
- [ ] UX consistency examples/references

---

## Next Steps

This warrants becoming a full initiative. Suggested path:

1. **Immediate**: Document Skyler's design principles properly
2. **Short-term**: Run component audit to quantify the problem
3. **Medium-term**: Build design quality check for CI
4. **Long-term**: Full tokenization + design system overhaul

---

## Verbatim Quotes

### On Figma's Role
> "I don't see Figma as a crucial part of this process." — Skyler

### On Human-First Design
> "Meeting them where they're at, and then it's making their lives better." — Skyler

### On Consistency
> "There should be no button that exists that is not referenced from the actual component. There should be no one-off rogue button components out of our platform anywhere." — Skyler

### On Apple Effect
> "When somebody notices high quality work, their opinion of that brand can resonate through other touch points." — Skyler

### On Token Adoption
> "When the herd is contributing to the code base... 90% of the components of what they're doing is referencing either components, but 100% should be referencing tokenization." — Skyler

### On Designer Adoption of Cursor
> "My appetite to adopt Cursor is very high." — Skyler
