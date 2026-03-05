# Prototype Notes: Universal Signal Tables

## Overview

This prototype explores the **ColumnConfigPopover** component—the core interaction point for Signal Tables. When a user clicks a column header or adds a new column, this popover appears with configuration options.

**Date:** January 9, 2026
**Builder:** Tyler (via PM Copilot + Design Companion + Prototype Builder)

---

## Creative Directions Explored

Three distinct approaches to column configuration, mapped to the autonomy spectrum from human-centric AI design research.

### Option A: Maximum Control

**Philosophy:** User confirms everything. Nothing runs automatically.

| Attribute | Value |
|-----------|-------|
| Trust required | Low |
| User control | Maximum |
| Time to insight | Slowest |
| Best for | New users, skeptics, high-stakes |
| Learning curve | Lowest |

**Key Design Choices:**
- Step-by-step numbered flow (Step 1, Step 2, Step 3)
- Explicit "Preview" button required before any AI runs
- Confirmation dialog for destructive actions (delete)
- Verbose explanations at each step
- "Manual Mode" badge sets expectations

**Rationale:** For users who've had bad AI experiences or are new to the system, maximum control builds trust by never surprising them. Every action is explicit. The trade-off is more clicks—but for anxious users, clicks feel better than mystery.

---

### Option B: Balanced (⭐ Recommended)

**Philosophy:** AI suggests, user overrides. Auto-preview builds trust progressively.

| Attribute | Value |
|-----------|-------|
| Trust required | Medium |
| User control | Balanced |
| Time to insight | Medium |
| Best for | Most users (default) |
| Learning curve | Medium |

**Key Design Choices:**
- **Auto-preview** after typing stops (500ms debounce)
- Inline configuration (Notion pattern)
- Single-click actions with easy undo
- Evidence visible alongside results
- Compact footer for secondary actions

**Rationale:** This is the sweet spot for most users. The auto-preview is the key innovation—users see AI results *before* committing to a full run. This is the "receipt" pattern from human-centric AI design: AI demonstrates competence before asking for trust.

**Why Recommended:**
- Embodies design brief: "Notion's accessibility + Clay's AI power"
- Matches the "Results First, Configure Second" principle
- Builds trust through demonstrated accuracy
- Fast enough for repeat use, transparent enough for first use

---

### Option C: Maximum Efficiency

**Philosophy:** One click, AI handles the rest. Minimal configuration.

| Attribute | Value |
|-----------|-------|
| Trust required | High |
| User control | Minimal |
| Time to insight | Fastest |
| Best for | Power users, routine tasks |
| Learning curve | Highest (assumes prior knowledge) |

**Key Design Choices:**
- One-click templates run immediately (no confirmation)
- Keyboard shortcut (⌘↵) to run from prompt
- Minimal chrome, maximum content
- Compact progress states
- AI auto-suggests column name and output type

**Rationale:** For users who've built trust through repeated use, speed becomes the priority. This variant assumes the user knows what they're doing and wants to get to results fast. Risk: if they make a mistake, they've committed resources.

---

## Comparison Table

| Criteria | Option A (Max Control) | Option B (Balanced) ⭐ | Option C (Max Efficiency) |
|----------|------------------------|----------------------|---------------------------|
| **Trust level required** | Low | Medium | High |
| **User control** | Maximum | Balanced | Minimal |
| **Clicks to first result** | 4-5 | 2-3 (auto-preview) | 1-2 |
| **Time to insight** | Slowest | Medium | Fastest |
| **Learning curve** | Lowest | Medium | Highest |
| **Error recovery** | Verbose, guided | Clear, actionable | Minimal, quick retry |
| **Best for persona** | New/skeptical users | Most users | Power users |
| **Matches design brief** | Partially (safe, not scary) | **Fully** (Notion + Clay) | Partially (efficient) |
| **Trust-building** | Through control | Through transparency | Assumed (prior trust) |
| **Risk of "scary" feeling** | Lowest | Low | Medium (too fast) |

---

## Recommendation

**Start with Option B (Balanced) as the default experience.**

**Reasoning:**
1. **Matches design mandate:** "Our version cannot scare people" — Option B is safe without being slow
2. **Auto-preview is key:** Users see AI's work before committing (receipt pattern)
3. **Inline editing is modern:** Follows Notion's accessibility pattern that users expect
4. **Trust progression:** As users gain confidence, they naturally use it faster

**Future consideration:** Consider offering Option C as a "Power Mode" toggle for repeat users. Could trigger after 5+ successful tables created.

---

## AI States Implemented

All variants include all required AI states:

| State | Visual Treatment | When It Appears |
|-------|-----------------|-----------------|
| **Idle** | Clean, editable form | Default state |
| **Loading (short)** | Subtle spinner, "Thinking..." | Preview running (~1-3s) |
| **Loading (long)** | Progress stages with messages | Full run on all calls |
| **Success** | Check mark, count, muted colors | Extraction complete |
| **Error** | Warning icon, red tones, retry button | Extraction failed |
| **Low Confidence** | Amber tones, dotted border, hedging language | AI uncertain |
| **Empty** | (Not shown in popover—handled at table level) | No results |

---

## Trust & Emotion Checklist

### Trust Checklist
- [x] User understands what AI will do before it acts (preview in A & B)
- [x] User can see evidence for AI decisions (receipt pattern)
- [x] User can easily undo AI actions (delete, re-run)
- [x] AI admits uncertainty appropriately (low-confidence state)
- [x] Failures are graceful and recoverable (error state with retry)

### Emotion Checklist
- [x] First impression feels trustworthy (clean design, no jargon)
- [x] Interactions are predictable (consistent patterns across variants)
- [x] User feels augmented, not replaced (AI assists, user decides)
- [x] No surveillance vibes (this is a leader tool, not rep tracking)
- [x] No replacement framing (AI extracts, human interprets)

### Accessibility Checklist
- [x] Keyboard navigable (all interactive elements focusable)
- [x] Screen reader compatible (semantic HTML, labels)
- [ ] Color contrast audit needed (WCAG AA)
- [x] Animation respects `prefers-reduced-motion` (spinner only)
- [x] Reading level appropriate (simple, direct language)

---

## Open Questions for Stakeholder Review

1. **Default variant:** Is Option B the right default, or should we start with Option A for new users and graduate to B?

2. **Auto-preview trigger:** 500ms debounce feels right, but should we test 300ms (faster) or 800ms (more intentional)?

3. **Keyboard shortcuts:** Option C includes ⌘↵—should we add this to Option B as well for power users who discover it?

4. **Error messaging:** Current error messages are generic. Should we tailor them based on error type (network, transcript missing, prompt unclear)?

5. **Low confidence threshold:** Currently set at 60%—what confidence level should trigger the warning state?

6. **Conditional execution visibility:** In Option B, the "Saves 89 rows" badge appears when conditions are set. Is this too prominent or just right?

---

## Files Created

```
elephant-ai/web/src/components/prototypes/UniversalSignalTables/
├── types.ts                           # Shared type definitions
├── ColumnConfigPopover.tsx            # Main component (3 variants)
├── ColumnConfigPopover.stories.tsx    # All stories + comparisons
└── index.ts                           # Exports
```

---

## Running the Prototype

```bash
cd elephant-ai
npm run storybook -w web
```

Navigate to: **Prototypes → UniversalSignalTables → ColumnConfigPopover**

---

## Next Steps

1. **Stakeholder review:** Present all three options, get feedback on direction
2. **User testing:** Test Option B with 2-3 design partners
3. **Iterate:** Refine based on feedback, potentially merge best of B + C
4. **Full table prototype:** Build the complete table view with popover integrated

---

*Last updated: January 9, 2026*
*Prototype Builder: PM Copilot + Design Companion*
