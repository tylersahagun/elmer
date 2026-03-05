# Prototype Notes: CRM Readiness Diagnostic

> **Version:** v4.1 (Mission Control + Design System)
> **Date:** 2026-01-21
> **Status:** ✅ Design system compliant
> **Initiative:** `crm-readiness-diagnostic`
> **Design System:** `.interface-design/system.md` (AskElephant)

---

## Summary

The CRM Readiness Diagnostic helps users understand if their HubSpot CRM is properly configured for AskElephant. It surfaces issues proactively—before workflows fail—so customers can either self-remediate or get partner help.

**v4 introduces a "Mission Control" design direction** based on the Interface Design skill methodology, replacing generic dashboard patterns with a distinctive pre-flight checklist aesthetic.

---

## Version History

| Version | Focus | Status |
|---------|-------|--------|
| **v1** | Initial prototype | Jury validated (74%) |
| **v2** | Customer-facing with jury fixes | Ready for re-validation |
| **v3** | Partner-only variant | Ready for stakeholder review |
| **v4** | Mission Control design refresh | Design review complete |
| **v4.1** | Design system compliance | ✅ Current |

---

## v4.1: Design System Compliance (NEW)

### Changes Made

Updated v4 components to comply with `.interface-design/system.md`:

| Area | Before | After |
|------|--------|-------|
| **Component imports** | Manual divs | `Card`, `Skeleton` from `@/components/ui/` |
| **Layout** | Manual flex classes | `row-container`, `col-container` utilities |
| **Colors** | Hardcoded `slate-*` | Semantic `bg-muted`, `text-muted-foreground` |
| **Depth** | Mixed approach | Consistent borders-only via Card |
| **Partner CTA button** | `bg-purple-600` inline | `variant="primary-blue"` |
| **Loading state** | Custom skeleton | `Skeleton` component |

### Design System Checklist

| Check | Status |
|-------|--------|
| Uses `cn()` from `@/lib/utils` | ✅ |
| Imports from `@/components/ui/` | ✅ |
| Uses layout utilities | ✅ |
| Uses semantic color variables | ✅ |
| Borders-only depth | ✅ |
| Matches AskElephant patterns | ✅ |

### Files Updated

```
elephant-ai/web/src/components/prototypes/CrmReadinessDiagnostic/v4/
├── DiagnosticPanel.tsx   ✅ Updated
├── LaunchStatus.tsx      ✅ Updated  
├── ChecklistItem.tsx     ✅ Updated
├── types.ts              (no changes needed)
└── v4.stories.tsx        (no changes needed)
```

---

## v4: Mission Control (NEW)

### Design Intent (Interface Design Methodology)

**Who is this human?**
RevOps person checking if their CRM is ready for launch. They're hopeful but nervous—they've been burned by tools that didn't work because of data issues.

**What must they accomplish?**
Understand blockers, know what's holding them back, decide whether to self-fix or get help.

**What should this feel like?**
Like a pilot running pre-flight checks — systematic, confidence-building, not punitive.

### Design Direction

| Aspect | v3 (Previous) | v4 (New) |
|--------|---------------|----------|
| **Metaphor** | Traffic light health check | Pre-flight checklist |
| **Score Display** | Circle with percentage | "Launch confidence" meter |
| **Issue Cards** | Card with left border accent | Checklist item with status light |
| **Vocabulary** | "Optimization opportunities" | "Pre-flight checklist" |
| **Severity Colors** | Purple/Amber/Gray | Go (emerald) / Review (amber) / Hold (rose) |
| **Depth Strategy** | Mixed (borders + shadows) | Borders-only (clean, technical) |
| **Data Display** | Standard text | Monospace for precision |

### Signature Elements

1. **Status "lights"** — Small colored dots that indicate go/no-go status
2. **Launch confidence** — Numeric score with mission control aesthetic
3. **Monospace typography** — For data elements, signals precision
4. **Systematic grouping** — Blocking → Review → Passing (not by severity)

### v4 Components

```
elephant-ai/web/src/components/prototypes/CrmReadinessDiagnostic/v4/
├── types.ts              # Mission control types + mock data
├── LaunchStatus.tsx      # Confidence meter with status light
├── ChecklistItem.tsx     # Pre-flight check item
├── DiagnosticPanel.tsx   # Full mission control panel
├── v4.stories.tsx        # Storybook stories
└── index.ts              # Barrel export
```

### Design Tokens (system.md format)

```markdown
## Direction
Personality: Mission Control / Pre-Flight
Foundation: Cool slate
Depth: Borders-only

## Tokens
### Spacing
Base: 8px
Scale: 8, 16, 24, 32, 48

### Colors
--status-go: emerald-500
--status-review: amber-500
--status-hold: rose-500

### Typography
--font-data: font-mono
--confidence: text-3xl font-bold tracking-tight
--label: text-[10px] uppercase tracking-wider
```

### Self-Check Results (Interface Design Skill)

| Check | Result |
|-------|--------|
| **Swap test** | ✓ Typeface and layout are distinctive |
| **Squint test** | ✓ Hierarchy visible, nothing jarring |
| **Signature test** | ✓ Status lights appear throughout |
| **Token test** | ✓ `--status-go`, `--status-hold` evoke domain |

---

## v3: Partner Variant

### Why Partner-Only?

Internal feedback revealed a critical positioning risk:

> "If we make it super easy for us to simulate the fix and fix and go do that, then it comes up with a question of, like, why is Crispy even needed?"

Partners like Crispy make their money doing CRM audits and remediation. A customer-facing tool could:
- Threaten partner business model
- Damage partner relationships
- Reduce partner referrals

### Partner Variant Features

| Feature | Description |
|---------|-------------|
| **Billable Hours** | Each issue shows estimated billable hours for partner |
| **Engagement Value** | Total $ opportunity based on partner's hourly rate |
| **Detailed Playbooks** | Step-by-step remediation with tool tags (HubSpot, Clay, etc.) |
| **Client Deliverables** | What partner delivers to client for each fix |
| **Multi-Client Support** | Client selector for managing multiple accounts |
| **Export Proposal** | Generate client-facing proposal document |
| **Private Dashboard** | Results visible only to partner, not customer |

### Partner Components

```
elephant-ai/web/src/components/prototypes/CrmReadinessDiagnostic/
├── partner-types.ts           # 🆕 Partner-specific types, mock data
├── PartnerPlaybookCard.tsx    # 🆕 Issue card with billable hours, playbook
├── PartnerDiagnosticPanel.tsx # 🆕 Full partner dashboard
└── CrmReadiness.stories.tsx   # 🆕 Partner stories added
```

### Partner vs Customer Comparison

| Feature | Customer (v2) | Partner (v3) |
|---------|---------------|--------------|
| Readiness Score | ✓ | ✓ |
| Issue List | ✓ | ✓ |
| How to Fix | Basic | Detailed playbook |
| **Billable Hours** | — | ✓ ($$$) |
| **Engagement Value** | — | ✓ |
| **Step-by-Step Playbook** | — | ✓ |
| **Client Deliverables** | — | ✓ |
| **Multi-Client Support** | — | ✓ |
| **Export Proposal** | — | ✓ |

---

## v1 → v2 Changes (Jury Feedback)

### ✅ P0 Implemented

| Issue | Before | After |
|-------|--------|-------|
| **Accusatory messaging** (31% felt blamed) | "Action required", red colors | "Let's get you expert help", purple colors |
| **Vague remediation** (42% said too generic) | "Fix associations in HubSpot" | Video tutorials, step-by-step guides |
| **No ownership clarity** | Users didn't know who should fix | "Who can fix" badges (self/admin/partner) |

### ✅ P1 Implemented

| Issue | Implementation |
|-------|----------------|
| **Time estimates** (28% requested) | `~15 min` badge on each issue |
| **Affected features** (24% requested) | Chips showing "Deal insights", "Pipeline forecasting", etc. |
| **Dismiss functionality** (21% requested) | X button to dismiss intentional CRM choices |
| **Elevated partner CTA** (18% said buried) | Prominent purple CTA card for RED status |

---

## Components (All Versions)

### Location

```
elephant-ai/web/src/components/prototypes/CrmReadinessDiagnostic/
├── types.ts                    # v2: Added WhoCanFix, estimatedTime, affectedFeatures
├── CrmReadinessScore.tsx       # v2: Softer messaging, purple for RED
├── CrmIssueCard.tsx            # v2: Time, features, who can fix, dismiss, video
├── CrmReadinessPanel.tsx       # v2: Elevated partner CTA, dismiss state
├── partner-types.ts            # v3: Partner-specific types, billable hours
├── PartnerPlaybookCard.tsx     # v3: Issue card with playbook steps
├── PartnerDiagnosticPanel.tsx  # v3: Full partner dashboard
├── CrmReadiness.stories.tsx    # All stories (v2 + v3)
└── index.ts                    # Barrel exports
```

### Key Design Decisions

**v2 (Customer):**
1. **Purple instead of Red** - Less alarming, still attention-getting
2. **Sparkles icon instead of X/Alert** - Opportunity framing, not failure
3. **"Who can fix" prominent** - Sales reps need to know this isn't their job
4. **Video tutorials primary CTA** - For issues with video, it's the main action
5. **Normalization messaging** - "90% of HubSpots have gaps" reduces blame

**v3 (Partner):**
1. **Dark header with lock icon** - Signals "partner-only" exclusivity
2. **Billable hours prominent** - Key partner metric, shows engagement value
3. **Engagement value in $** - Based on partner's hourly rate ($175 default)
4. **Playbook steps with tool tags** - HubSpot, Clay, AskElephant, Other
5. **Client deliverables** - What partner delivers for each fix
6. **Copy playbook button** - Easy export for proposals

---

## Storybook Stories

### Customer Stories (v2)

| Story | Purpose |
|-------|---------|
| `Score: All Variants` | Compare v2 messaging for GREEN/YELLOW/RED |
| `Issue Card: All v2 Features` | Shows time, features, who can fix |
| `Issue Card: Who Can Fix Variants` | Self vs Admin vs Partner |
| `Issue Card: Dismiss Functionality` | Interactive dismiss demo |
| `Panel: Expert Help (Red)` | Elevated partner CTA |
| `v2 Feature Showcase` | Full comparison of v1 → v2 changes |
| `In Settings Page Context` | Integration placement demo |
| `Interactive Demo (v2)` | State transitions with fixes |

### Partner Stories (v3) 🆕

| Story | Purpose |
|-------|---------|
| `🔒 Partner: Playbook Card` | Single issue with billable hours |
| `🔒 Partner: Playbook Cards (All Severities)` | Blocker, Important, Nice to have |
| `🔒 Partner: Dashboard (Full)` | Complete partner experience |
| `🔒 Partner: Dashboard (No Client Selected)` | Empty state |
| `🆚 Partner vs Customer Comparison` | Side-by-side comparison |

---

## Preview

```bash
# From elephant-ai directory
npm run storybook -w web
# Navigate to: Prototypes/CrmReadinessDiagnostic
```

---

## Strategic Decision Required

**Before v4 or production:** Need to resolve positioning:

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **Customer-Only** | v2 for all users | Helps self-serve | Threatens partners |
| **Partner-Only** | v3 for partners only | Strengthens channel | Self-serve blocked |
| **Hybrid** ✨ | Basic for customers, advanced for partners | Best of both | More complex |

**Stakeholders needed:**
- [ ] James (internal perspective)
- [ ] Crispy (partner perspective)
- [ ] Tyler (product decision)

---

## Next Steps

1. [ ] **Show v3 to James** for internal input
2. [ ] **Show v3 to Crispy** directly—gauge reaction
3. [ ] **Resolve positioning decision** (Customer vs Partner vs Hybrid)
4. [ ] Re-run jury validation on v2 customer variant
5. [ ] Schedule real user validation with 3-5 RevOps users
6. [ ] Create engineering spec for API/backend requirements

---

## Technical Notes

### Future Hook API (Not Implemented)

```typescript
// Customer variant:
const { data, isLoading, error, refetch } = useCrmReadiness({
  workspaceId,
  integrationId,
});

// Partner variant:
const { data, isLoading, error, refetch } = usePartnerDiagnostic({
  partnerId,
  clientId,
  config: { hourlyRate: 175 },
});
```

### Required HubSpot API Scopes (TBD)

- `crm.objects.deals.read`
- `crm.objects.contacts.read`
- `crm.objects.companies.read`
- `crm.schemas.read` (for property definitions)

---

## Files

- **Components:** `elephant-ai/web/src/components/prototypes/CrmReadinessDiagnostic/`
- **PRD:** `pm-workspace-docs/initiatives/crm-readiness-diagnostic/prd.md`
- **Research:** `pm-workspace-docs/initiatives/crm-readiness-diagnostic/research.md`
- **Decisions:** `pm-workspace-docs/initiatives/crm-readiness-diagnostic/decisions.md`
- **Jury Report:** `pm-workspace-docs/initiatives/crm-readiness-diagnostic/jury-evaluations/jury-report.md`
- **Placement Research:** `pm-workspace-docs/initiatives/crm-readiness-diagnostic/placement-research.md`
