# Human-Centric Design Principles for HubSpot Agent Config

**Date:** 2026-01-09
**Status:** Active Design Revision
**Trigger:** Confidence percentages are meaningless to users. The design is overly technical.

---

## What's Wrong with the Current Design

### The Confidence Percentage Problem

Showing "92% confidence" or "68% confidence" fails users because:

1. **It's meaningless** — Users don't know what 68% means. Is that good? Bad? Should they worry?
2. **It shifts burden to users** — Now THEY have to interpret the number and decide what to do
3. **It's false precision** — We're pretending we can quantify something inherently fuzzy
4. **It creates anxiety** — Any number less than 100% makes users wonder "what if it's wrong?"
5. **It's not actionable** — If it's 68%, what do I DO? The number doesn't help me.

### Strategic Guardrail Violations

The current design violates several guardrails from `strategic-guardrails.md`:

| Signal | Violation |
|--------|-----------|
| "Heavy setup/config required" | Multiple dropdowns, filters, thresholds to configure |
| "Users will configure..." | Requiring users to set pipeline filters, probability ranges, etc. |
| "Just trust the AI" | Showing confidence % but not explaining WHY |
| Adding friction to existing flows | Preview modal, multi-match dialogs, configuration panels |

### What Users Actually Need

From James Hinkson interview:
> "My outcome is that I know 100% confidently that every field I want updated in HubSpot is updated after every call."

Users want:
- **Certainty** — "This will update the right deal"
- **Visibility** — "I can see what happened if I need to"
- **Recovery** — "I can fix it if something goes wrong"

They DON'T want:
- To configure matching logic
- To interpret confidence scores
- To confirm every single sync

---

## New Design Philosophy

### Principle 1: AI-First, Zero-Config Default

**The default experience should be:**
1. Connect HubSpot ✓
2. Select fields to update ✓
3. It just works ✓

**No pipelines. No probability ranges. No "multi-match strategies."**

AI figures it out. For most meetings, there's ONE obvious deal (or contact or company). The AI should handle this silently.

### Principle 2: Show Reasoning, Not Scores

**Instead of:**
> "92% confidence match"

**Say:**
> "Updating **Acme Corp - Enterprise** because John Smith (attendee) is the primary contact on this deal."

The reasoning IS the confidence. If the reasoning is strong, users trust it. If it's weak, they see why.

### Principle 3: Exception-Based Intervention

**Only interrupt users when genuinely uncertain.** Not "68% confidence" but:

> "We found 2 deals for Acme Corp. Which one was this meeting about?"
> - Acme - Enterprise License (John Smith is the contact)
> - Acme - Professional Services (Sarah Chen is the contact)

This is clear, actionable, and human. No percentages needed.

### Principle 4: Undo Beats Preview

**The preview paradigm is broken.** It:
- Creates friction for every sync
- Makes users confirm things that are obviously correct
- Slows down the "just works" experience

**Better approach:**
- Sync happens automatically (no preview)
- Toast shows what was synced with one-click undo
- Undo window is generous (30 days per PRD)
- Activity log shows full history

This flips the model: **trust first, verify if needed**.

### Principle 5: Progressive Complexity (Hidden by Default)

For power users who genuinely need to restrict matching:
- Put configuration in "Advanced Settings" (collapsed)
- Use human language: "Only update deals in the **New Business** pipeline"
- Never show percentage inputs or confidence thresholds

---

## New UI Patterns

### Pattern A: Zero-Config First Run

When user first sets up HubSpot agent:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ HubSpot Agent Setup                                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  What do you want to update after each call?                           │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  💰 The deal associated with this meeting                          │ │
│  │     We'll find the right deal based on who attended.               │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  👤 The contacts who attended                                       │ │
│  │     Match attendee emails to HubSpot contacts.                     │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  🏢 The company                                                     │ │
│  │     Match by attendee email domains.                                │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  That's it! Select fields to update →                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**No configuration. No pipelines. No thresholds.**

### Pattern B: Success State (Most Syncs)

After a meeting syncs successfully:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ✓ Synced to HubSpot                                            [Undo]  │
│                                                                         │
│   Updated **Acme Corp - Enterprise** (Deal)                            │
│   • Next Step: "Send proposal"                                         │
│   • Probability: 40% → 65%                                             │
│                                                                         │
│   Why this deal? John Smith (attendee) is the primary contact.         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Shows the reasoning. One-click undo. No preview required.**

### Pattern C: Disambiguation (Rare Case)

Only shown when AI genuinely can't determine the right object:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Which deal was this meeting about?                              [Skip] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  We found 2 active deals with Acme Corp. Please select one:            │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ ○ Acme Corp - Enterprise License                                   │ │
│  │   $125,000 • Demo Scheduled • John Smith is on this deal           │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ ○ Acme Corp - Professional Services                               │ │
│  │   $45,000 • Scoping • Sarah Chen is on this deal                   │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  [ ] Remember this for future meetings with John                        │
│                                                                         │
│                                           [Skip] [Update Selected Deal] │
└─────────────────────────────────────────────────────────────────────────┘
```

**No percentages. No "confidence." Just clear choices with reasons.**

### Pattern D: Advanced Settings (Hidden, Optional)

For power users only, collapsed by default:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ▼ Advanced: Restrict which deals can be matched                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Only update deals in these pipelines:                                  │
│  [New Business ✓] [Expansion ✓] [Services] [Partner]                   │
│                                                                         │
│  Only update deals in these stages:                                     │
│  [Any active stage (not closed) ▾]                                      │
│                                                                         │
│  If we can't find a matching deal:                                      │
│  (●) Skip the update and notify me                                      │
│  ( ) Create a new deal                                                  │
│                                                                         │
│  If we're not sure which deal:                                          │
│  (●) Ask me to choose                                                   │
│  ( ) Use the deal with the most recent activity                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Human language. No percentages. Clear actions.**

---

## Implementation Changes

### Remove from Current Prototype

1. ❌ `confidence: number` scores everywhere
2. ❌ "High/Medium/Low confidence" labels
3. ❌ Color-coded confidence badges (green/amber/red)
4. ❌ "Auto-sync if confidence > X%" threshold
5. ❌ Percentage displays in any UI
6. ❌ Complex `AssociationConfig` with technical fields

### Replace With

1. ✅ `reasoning: string` — Human-readable explanation
2. ✅ `needsHumanDecision: boolean` — Binary: can AI decide or not?
3. ✅ `alternatives: Candidate[]` — Only shown if `needsHumanDecision`
4. ✅ Simple pipeline/stage filters in "Advanced" (collapsed)
5. ✅ Undo-first instead of preview-first

### New Component Structure

| Component | Purpose | When Shown |
|-----------|---------|------------|
| `SimpleObjectSelector` | Choose deal/contact/company | Initial setup only |
| `FieldConfiguration` | Pick fields, write instructions | Setup flow |
| `SyncSuccessToast` | "Synced to X. Undo?" | After every successful sync |
| `DisambiguationDialog` | "Which deal?" | Only when AI is uncertain |
| `SyncActivityLog` | What was synced, when, with undo | On-demand review |
| `AdvancedFilters` | Pipeline/stage restrictions | Collapsed, optional |

---

## Measuring Success

### The Real Test

Ask users:
1. "Was the right deal updated?" → Yes/No
2. "Did you have to do anything?" → Ideally no
3. "If it was wrong, could you fix it?" → Yes, easily

**We should not measure:**
- Confidence scores
- How often users "confirm" previews
- Configuration completion rates

**We should measure:**
- % of syncs to correct object (accuracy)
- % of syncs requiring user intervention (autonomy)
- Time from meeting end to HubSpot update (speed)
- Undo rate (error detection)
- User-reported trust (qualitative)

---

## Next Steps

1. Redesign `PreSyncPreviewEnhanced` → `SyncSuccessToast` (undo-first)
2. Redesign `MultiMatchDialog` → `DisambiguationDialog` (no percentages)
3. Simplify `AssociationSettings` → `AdvancedFilters` (collapsed, optional)
4. Add human-readable reasoning to all sync operations
5. Run jury evaluation with new design

