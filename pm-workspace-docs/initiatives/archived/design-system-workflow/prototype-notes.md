# Prototype Notes: Design System Workflow

## Current Version: v2

## Overview

Prototype for CI-based design quality enforcement that helps the design team (2:14 designer-to-engineer ratio) scale design review by automating token and component compliance checks.

---

## Iteration History

### v2 (2026-01-23) - Accessibility & Trust Improvements

**Feedback Source:** Design Companion Review

**Key Changes:**

| Change | Rationale |
|--------|-----------|
| **Icons + Colors** | Traffic lights now have icons (⛔/⚠️/✅/❓) alongside colors for color-blind accessibility |
| **Report False Positive** | ViolationCard includes "Report False Positive" button with reason field |
| **Auto-fix Feedback** | 👍/👎 feedback after auto-fix is applied to improve suggestions over time |
| **Low Confidence State** | New "gray/uncertain" severity for edge cases that may be intentional |
| **Enhanced ARIA** | Improved accessibility with proper roles, labels, and keyboard navigation |
| **New Journey Step** | Auto-fix flow now includes feedback collection step |

**Files Changed:**
- `v2/types.ts` - Added `gray` severity, `reportedAsFalsePositive`, `autoFixFeedback` fields
- `v2/components/ViolationCard.tsx` - Icons, false positive reporting, feedback buttons
- `v2/components/PRCheckResult.tsx` - Icons alongside status badges
- `v2/DesignQualityDashboard.tsx` - Gray/uncertain stat card, filter button with icons
- `v2/DesignQualityJourney.tsx` - New feedback step in auto-fix flow

### v1 (2026-01-22) - Initial Prototype

**Key Features:**
- Red/Yellow/Green traffic light system
- Auto-fix one-click suggestions
- Token audit dashboard
- Human-First Design principles guide
- Interactive user journeys (happy path, auto-fix, error recovery)

---

## Chromatic Preview

🔗 **v2 Preview:** https://672502f3cbc6d0a63fdd76aa-ulspbzryjg.chromatic.com/?path=/docs/prototypes-designsystemworkflow-v2-dashboard--docs
⚠️ *Note: Chromatic story extraction has a pre-existing React compatibility issue. Run Storybook locally for full preview.*

🔗 **v1 Preview:** https://672502f3cbc6d0a63fdd76aa-sjoyofngea.chromatic.com/?path=/docs/prototypes-designsystemworkflow-v1-dashboard--docs

📁 **v2 Storybook Paths:**
- Dashboard Overview: `?path=/story/prototypes-designsystemworkflow-v2-dashboard--overview`
- PR Checks View: `?path=/story/prototypes-designsystemworkflow-v2-dashboard--pr-checks`
- Token Audit: `?path=/story/prototypes-designsystemworkflow-v2-dashboard--audit`
- Design Principles: `?path=/story/prototypes-designsystemworkflow-v2-dashboard--principles`
- Auto-fix Flow (with feedback): `?path=/story/prototypes-designsystemworkflow-v2-dashboard--flow-autofix`

---

## Creative Options

### Option A: Maximum Control

**Philosophy:** Every violation requires explicit review.

| Aspect | Details |
|--------|---------|
| Enforcement | All violations are blocking (red) |
| Engineer Action | Must acknowledge each issue |
| Override | Requires comment + Skyler review |
| Best For | New teams, critical UI areas, training |

**Trade-offs:**
- ✅ Maximum consistency
- ✅ Forces learning
- ❌ Higher friction
- ❌ Slower velocity

---

### Option B: Balanced (Recommended)

**Philosophy:** Red blocks, yellow warns, gray suggests review, trust the engineer.

| Aspect | Details |
|--------|---------|
| Enforcement | Red = blocking, Yellow = warning, Gray = uncertain |
| Engineer Action | Must fix red; yellow is informational; gray invites review |
| Override | Yellow auto-allowed; red needs Skyler; gray can be dismissed |
| Best For | Most teams, balanced quality/velocity |

**Trade-offs:**
- ✅ Catches critical issues
- ✅ Reduces friction for minor issues
- ✅ Scalable for large teams
- ✅ Handles edge cases gracefully (gray)
- ❌ Some warnings may be ignored

**🎯 This is the recommended approach for AskElephant.**

---

### Option C: Maximum Efficiency

**Philosophy:** Trust the team, focus on egregious issues only.

| Aspect | Details |
|--------|---------|
| Enforcement | Only severe violations block |
| Engineer Action | Most checks are informational |
| Override | Automatic for most cases |
| Best For | Mature teams, high-velocity sprints |

---

## All States Implemented

| State | Description | v1 Story | v2 Story |
|-------|-------------|----------|----------|
| ✅ Loading | Initial dashboard load | `v1/--loading` | `v2/--loading` |
| ✅ Loading (Long) | Comprehensive audit running | `v1/--loading-long` | `v2/--loading-long` |
| ✅ Success | Dashboard fully loaded | `v1/--overview` | `v2/--overview` |
| ✅ Error | Failed to load | `v1/--error` | `v2/--error` |
| ✅ Empty | No design checks configured | `v1/--empty` | `v2/--empty` |

---

## Interactive Journeys

### Happy Path Journey
- PR passes design checks on first try
- Steps: PR opened → CI runs → Success

### Auto-fix Journey (v2 Enhanced)
- Violations found, engineer applies one-click fixes
- **v2:** Now includes feedback collection step
- Steps: PR opened → CI runs → Violations → Review → Auto-fix → **Feedback** → Re-run → Success

### Error Recovery Journey
- CI service temporarily fails, engineer retries
- Steps: PR opened → CI fails → Retry → Recovery

---

## Components Created

```
elephant-ai/web/src/components/prototypes/DesignSystemWorkflow/
├── index.ts                           # Re-exports v2 (updated)
├── v1/                                # Original prototype (preserved)
│   ├── DesignQualityDashboard.tsx
│   ├── DesignQualityDashboard.stories.tsx
│   ├── DesignQualityJourney.tsx
│   ├── types.ts
│   ├── index.ts
│   └── components/
│       ├── PRCheckResult.tsx
│       ├── TokenAuditPanel.tsx
│       ├── DesignPrinciplesGuide.tsx
│       ├── ViolationCard.tsx
│       ├── ComplianceChart.tsx
│       └── index.ts
├── v2/                                # Iterated prototype with accessibility
│   ├── DesignQualityDashboard.tsx     # Updated with gray severity, icons
│   ├── DesignQualityDashboard.stories.tsx  # Updated stories
│   ├── DesignQualityJourney.tsx       # Added feedback step
│   ├── types.ts                       # Added gray severity, feedback fields
│   ├── index.ts
│   └── components/
│       ├── PRCheckResult.tsx          # Icons alongside status
│       ├── TokenAuditPanel.tsx        # Icons in metric cards
│       ├── DesignPrinciplesGuide.tsx  # Enhanced ARIA
│       ├── ViolationCard.tsx          # False positive, feedback buttons
│       ├── ComplianceChart.tsx        # ARIA improvements
│       └── index.ts
```

---

## Design Decisions

### v2: Icons Alongside Colors (Accessibility)
Added icons to all severity indicators:
- ⛔ `Ban` icon for Red/Blocking
- ⚠️ `CircleAlert` icon for Yellow/Warning
- ❓ `CircleHelp` icon for Gray/Uncertain (new)
- ✅ `CircleCheck` icon for Green/Passed

This ensures color-blind users can distinguish severity levels.

### v2: Report False Positive Flow
Engineers can now flag violations as false positives with a reason. This:
- Builds trust ("the system listens to me")
- Collects data to improve rules over time
- Reduces frustration with incorrect flags

### v2: Auto-fix Feedback
After applying an auto-fix, engineers can rate it 👍/👎. This:
- Improves suggestion quality over time
- Shows engineers their input matters
- Identifies problematic auto-fix patterns

### v2: Gray/Uncertain Severity
For edge cases where the check isn't confident:
- Custom brand gradients that might be intentional
- One-off components for specific pages
- Legitimate exceptions to general rules

Gray severity shows a "This might be intentional" message and doesn't block.

### v1: Red/Yellow/Green Classification
Traffic light colors for immediate recognition. Red for blocking (hardcoded colors, custom buttons), yellow for warnings (minor spacing), green for passed.

### v1: Auto-fix Feature
One-click fixes dramatically reduce friction. Engineers don't need to understand tokens—they just click "Auto-fix".

### v1: Progressive Disclosure for Violations
Violations are collapsed by default, expandable to show code + suggestion.

---

## Open Questions for Stakeholder Review

1. **Enforcement Rollout Strategy**
   - Start with warnings only (Option C) and tighten to balanced (Option B)?
   - Or launch with balanced and adjust based on feedback?

2. **Override Workflow**
   - Should yellow warnings require any acknowledgment?
   - How should legitimate exceptions be documented?
   - **v2:** Is the "Report False Positive" flow sufficient for exceptions?

3. **Legacy Remediation**
   - Who owns fixing existing violations? Engineers? Dedicated sprint?
   - Should we create a prioritized backlog of worst offenders?

4. **Skyler's Direct Involvement**
   - What level of review does Skyler want for yellow warnings?
   - Should certain components/pages be exempt from checks?
   - **v2:** How should false positive reports be reviewed?

---

## Recommendation

**Start with Option B (Balanced)** because:

1. **Catches critical issues** without blocking velocity
2. **Scales well** for 2:14 designer-to-engineer ratio
3. **Builds trust** by being helpful, not pedantic
4. **Auto-fix reduces friction** to near-zero for common issues
5. **v2:** Gray severity handles edge cases gracefully
6. **v2:** False positive reporting builds trust with engineers

---

## Next Steps

1. ✅ Run `/validate design-system-workflow` - Synthetic jury passed (83%)
2. ✅ Run `/design design-system-workflow` - Design review completed
3. ✅ Iterate based on design review feedback - v2 created
4. ⬜ Deploy v2 to Chromatic
5. ⬜ Share Chromatic preview with Skyler for design review
6. ⬜ Schedule stakeholder walkthrough to choose enforcement level
7. ⬜ Conduct usability test with Skyler on token editing flow
8. ⬜ Plan Phase 1 implementation based on feedback

---

*Last updated: January 23, 2026*
*Current version: v2*
