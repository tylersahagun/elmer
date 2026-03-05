# Design System & Workflow Modernization PRD

## Overview

- **Owner:** Tyler Sahagun
- **Stakeholders:** Skyler (Design Lead), Adam (Designer), Engineering
- **Target Release:** Q1 2026 (Phase 1: Audit + CI Checks)
- **Status:** Draft
- **Strategic Pillar:** Quality & Consistency (Internal Enablement)
- **2026 Initiative:** Foundation work enabling all product initiatives

---

## Outcome Chain

```
Tokenized design system with automated enforcement
  → so that engineers can't accidentally ship inconsistent UI
    → so that Skyler doesn't have to manually review every PR
      → so that the 2:14 designer-to-engineer ratio scales
        → so that brand perception improves ("Apple effect")
          → so that user trust increases → retention improves
```

---

## Problem Statement

### The Problem

AskElephant has **bad UX visual consistency** across the platform. Despite having a design token system and component library, ~30% of UI elements are "rogue"—custom implementations not referencing the design system.

### Who Has It

**Primary:** Design team (2 people)
- Can't scale review across 14+ engineers
- Get pulled into firefighting inconsistencies post-ship
- Spend time on remediation instead of new design work

**Secondary:** Engineering ("the herd")
- No automated feedback when creating inconsistent UI
- Copy-paste patterns without knowing they're wrong
- Good intentions, no guardrails

**Tertiary:** End users
- Experience inconsistent patterns (headers, modals, buttons vary)
- Subtle trust erosion ("muddy brand perception")

### Why Now

1. **Rebrand incoming** (couple months out) — Need clean token system to inject new brand direction
2. **Designer-engineer ratio** — 2 designers can't manually review all output
3. **Compounding debt** — Every inconsistency shipped makes audit harder
4. **Skyler's Cursor adoption** — High appetite to move away from Figma, need to enable the workflow

### Evidence

**Direct quotes from Skyler:**
> "We have bad consistency throughout the platform."

> "There should be no button that exists that is not referenced from the actual component. There should be no one-off rogue button components anywhere."

> "When the herd is contributing to the code base... 90% should be referencing components, but 100% should be referencing tokenization."

**Observed patterns:**
- Billing page has inconsistent styling vs. rest of platform
- Button variants exist outside the component library
- Shadow/spacing values hardcoded instead of using tokens

---

## Goals & Non-Goals

### Goals (Measurable)

| Goal | Success Metric | Target |
|------|----------------|--------|
| **Eliminate rogue components** | % of UI elements using design system | 100% of new code, 90%+ legacy |
| **Reduce design review bottleneck** | Time from PR → design approval | < 4 hours (down from days) |
| **Enable designer self-service** | Skyler can edit tokens/components directly | Binary: yes/no |
| **Automated enforcement** | PRs with design violations blocked | 100% caught before merge |

### Non-Goals

- **Redesigning the entire UI** — This is infrastructure, not visual refresh
- **Removing Figma entirely** — Still useful for exploration, just not source of truth
- **Building a custom design tool** — Use Cursor + Storybook, not new tooling
- **Perfect tokenization day one** — Iterative improvement, not big bang

**Anti-vision check:** ✅ This is internal enablement tooling, not a customer feature. It supports "Quality Over Velocity" principle.

---

## User Personas

### Primary: Skyler (Design Lead)

- **Job-to-be-done:** Ensure every pixel shipped reflects human-first design principles
- **Current pain:** Manually reviewing PRs, can't scale, finds issues post-ship
- **Success looks like:** "I trust the system to enforce my principles without me being the bottleneck"
- **Trust factors:** Needs to see the automated checks actually catch real issues

### Secondary: Engineer ("The Herd")

- **Job-to-be-done:** Ship features without design expertise
- **Current pain:** No feedback when UI is inconsistent until Skyler sees it
- **Success looks like:** "I get immediate feedback when my UI doesn't match the system"
- **Trust factors:** Checks must be helpful, not pedantic

---

## User Stories

### Design Lead Stories
- As Skyler, I want automated design quality checks in CI **so that** I'm not the bottleneck for every PR
- As Skyler, I want to edit tokens directly in Cursor **so that** I have precision control without Figma
- As Skyler, I want a component audit report **so that** I know the scope of remediation work

### Engineer Stories
- As an engineer, I want immediate feedback on design violations **so that** I can fix them before review
- As an engineer, I want clear documentation on which components to use **so that** I don't create rogue implementations
- As an engineer, I want design checks to be actionable **so that** I know exactly what to fix

---

## Requirements

### Must Have (MVP - Phase 1)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| **M1** | Component audit tool | Identifies all non-tokenized/non-componentized UI elements |
| **M2** | Design quality check in CI | Runs on every PR touching `web/src/components` |
| **M3** | Red/Yellow/Green classification | Blocking (red), warnings (yellow), passing (green) |
| **M4** | Documentation of design principles | Human-First Design + UX Consistency codified |
| **M5** | Storybook training for Skyler | Designer can edit components directly |

### Should Have (Phase 2)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| **S1** | Design jury agent | AI evaluates against Human-First Design principles |
| **S2** | Legacy remediation tracker | Dashboard showing % of codebase componentized |
| **S3** | Token auto-suggestion | CI suggests which token to use for hardcoded values |

### Could Have (Phase 3)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| **C1** | Figma → Storybook MCP integration | Designer can pull from Figma into Cursor |
| **C2** | Design system visual diff | Chromatic catches visual regressions |
| **C3** | Component usage analytics | Track which components are most/least used |

---

## User Flows

### Flow: Engineer Creates UI Component

**Trigger:** Engineer adds new UI to a PR

**Steps:**
1. Engineer writes component in `web/src/components/`
2. PR is opened → CI runs design quality check
3. Check analyzes:
   - Are color values using tokens? (`bg-primary` vs `bg-[#5B5FC7]`)
   - Are spacing values using scale? (`p-4` vs `p-[17px]`)
   - Are components from `ui/` library? (`<Button>` vs `<button>`)
4. Results categorized as Red/Yellow/Green
5. If Red: PR blocked, engineer must fix
6. If Yellow: Warning shown, Skyler reviews
7. If Green: Auto-approved for design

**Outcome:** Engineer gets immediate feedback; Skyler only reviews edge cases

**Error states:**
- Check fails to run → Default to manual review (yellow)
- False positive → Engineer can request override with explanation

### Flow: Designer Edits Token

**Trigger:** Skyler wants to adjust brand colors

**Steps:**
1. Open `web/design-tokens/light.json` in Cursor
2. Edit token value (e.g., `primary` color)
3. Run `npx tsx scripts/tokens-to-css.ts` to generate CSS
4. Preview in Storybook (`npm run storybook -w web`)
5. If satisfied, commit changes
6. CI validates token structure
7. Changes reflected across all components using that token

**Outcome:** Designer has direct control without Figma round-trip

---

## Design Principles to Codify

### Skyler's Human-First Design (3 Pillars)

1. **Meet them where they're at**
   - Design for user's mental model
   - Progressive disclosure over cognitive overload
   - AI check: "Does this UI require the user to learn something new?"

2. **Make it obvious**
   - Clarity over cleverness
   - Primary action is unmistakable
   - AI check: "Is the next step clear without explanation?"

3. **Make their lives better**
   - Genuine value, not feature bloat
   - Removes friction, doesn't add it
   - AI check: "Does this save the user time/effort?"

### UX Visual Consistency Rules

| Pattern | Rule | Enforcement |
|---------|------|-------------|
| **Headers** | All page headers use `PageHeader` component | CI check |
| **Modals** | All modals use `Dialog` from ui/ | CI check |
| **Buttons** | Only variants defined in `button.tsx` | CI check |
| **Colors** | Semantic tokens only (no hex/hsl) | CI check |
| **Spacing** | Tailwind scale only (4, 8, 12...) | CI check |
| **Shadows** | Token shadows only (`shadow-sm`, etc.) | CI check |

---

## Technical Considerations

### Existing Foundation

✅ **Already have:**
- Design tokens in `web/design-tokens/` (global, light, dark)
- Token extraction script (`extract-design-tokens.ts`)
- Token → CSS script (`tokens-to-css.ts`)
- shadcn/ui component library with variants (e.g., `button.tsx`)
- Chromatic for visual regression testing

🔨 **Need to build:**
- CI workflow for design quality checks
- AST-based analyzer for detecting rogue styling
- Design principles documentation (from Skyler's framework)
- Storybook training materials

### Integration Points

- **GitHub Actions:** New workflow for design checks
- **ESLint:** Custom rule for detecting hardcoded values
- **Storybook:** Component documentation + token visualization
- **Chromatic:** Visual diff on token changes

### Reliability Risks

| Risk | Mitigation |
|------|------------|
| False positives annoy engineers | Start with warnings (yellow), tune before blocking |
| Check too slow | Run only on changed files |
| Skyler bypasses system | Involve in design of checks, make it genuinely useful |

---

## Success Metrics

### North Star
**% of UI elements referencing design system**
- Current: ~70% (estimated)
- Target: 95%+ for new code, 90%+ overall

### Leading Indicators
- PRs with design violations caught before merge
- Time from PR open → design approval
- Number of Skyler manual reviews per week

### Guardrails (What We Don't Want to Break)
- Engineer velocity (checks shouldn't add > 2 min to CI)
- Design flexibility (legitimate exceptions must be easy)
- Team morale (helpful not pedantic)

---

## Strategic Alignment Checklist

- [x] **Outcome chain complete** — Links to user trust + retention
- [x] **Persona validated** — Direct input from Skyler
- [x] **Trust implications assessed** — Improves user trust via consistency
- [x] **Not in anti-vision territory** — Internal tooling, not customer feature
- [x] **Supports 2026 initiative stack** — Enables rebrand + all feature work

---

## Phases

### Phase 1: Foundation (4 weeks)
- [ ] Run component audit
- [ ] Document design principles (from Skyler)
- [ ] Create CI design check (warnings only)
- [ ] Train Skyler on Cursor + Storybook editing

### Phase 2: Enforcement (4 weeks)
- [ ] Enable blocking checks (red)
- [ ] Add design jury agent
- [ ] Begin legacy remediation (priority areas)

### Phase 3: Scale (Ongoing)
- [ ] Complete legacy cleanup
- [ ] Add usage analytics
- [ ] Integrate with rebrand rollout

---

## Open Questions

1. **What's the enforcement appetite?** — Start with warnings or go straight to blocking?
2. **Who owns legacy remediation?** — Engineers? Dedicated sprint? Design team?
3. **How strict on tokenization?** — Allow some flexibility for truly custom elements?
4. **Alma.ai integration?** — Skyler waiting on demo; should we plan without it?
5. **Rebrand timeline dependency?** — Is this blocking the brand refresh?

---

## Appendix: Design Token Structure

Current token hierarchy (from `web/design-tokens/`):

```
global.json
├── typography (fontFamily, fontSize, fontWeight, lineHeight)
├── spacing (4, 8, 12, 16...)
├── borderRadius (sm, md, lg, xl)
├── shadow (sm, md, lg, even)
├── duration (fast, normal, slow)
├── easing (ease-out-expo, etc.)
└── zIndex (50, 100, 150...)

light.json / dark.json
├── semantic colors (primary, secondary, destructive...)
├── background colors (background, card, popover...)
├── foreground colors (foreground, muted-foreground...)
├── sidebar colors
├── chart colors
└── state colors (success, warning, error)
```

---

## References

- Atomic Design by Brad Frost (Skyler recommendation)
- Existing token system: `elephant-ai/web/design-tokens/README.md`
- Button variants example: `elephant-ai/web/src/components/ui/button.tsx`
