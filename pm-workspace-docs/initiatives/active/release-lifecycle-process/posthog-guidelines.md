# PostHog Feature Flags vs Early Access: Guidelines

**Version:** 1.1  
**Owner:** Tyler Sahagun  
**Last Updated:** January 26, 2026

---

## TL;DR: The Lifecycle

```
ALPHA        INVITE-ONLY BETA        OPEN BETA             GA
──────────────────────────────────────────────────────────────────────►

Feature Flag     Feature Flag      Feature Flag            No Flag
├── Rollout: 0%  ├── Rollout: 0%    ├── Rollout: 0%         (remove from code)
├── Condition:   ├── Allowlist     ├── EA Link: YES
│  internal      │  conditions     └── Condition: NO
└── Early Access: NO

WHO DECIDES ACCESS?
├── Alpha: Engineering → Feature Flag (internal only)
├── Invite-only Beta: Product/CS → Allowlist (invite only)
├── Open Beta: User     → Early Access (opt-in)
└── GA: Nobody         → Remove flag
```

---

## Complete Lifecycle: Alpha → Invite-only Beta → Open Beta → GA

### Stage 1: Alpha (Internal Testing)

**Who has access:** Only internal `@askelephant.ai` team  
**Who decides:** Engineering/Product  
**Mechanism:** Feature Flag with conditions

#### PostHog Setup

1. **Create Feature Flag**

   - Key: `your-feature-name`
   - Rollout: `0%`
   - Add condition: `email` contains `askelephant.ai`
   - Enable the condition group at 100%

2. **DO NOT create Early Access Feature**

#### Code

```tsx
const isEnabled = useFeatureFlagEnabled("your-feature-name");
// Only @askelephant.ai users will see true
```

#### Linear/Notion Status

- Linear: Project status = `In Progress`
- Notion: Release Stage = `Alpha`

---

### Stage 2: Invite-only Beta (Invite Only)

**Who has access:** Invited customers + internal  
**Who decides:** Product/CS  
**Mechanism:** Feature Flag allowlist conditions

#### PostHog Setup

1. **Update Feature Flag**

   - Keep rollout at `0%`
   - **Remove** the `@askelephant.ai` condition
   - Add allowlist conditions (workspace/user properties)

2. **Do NOT create Early Access Feature**

3. **The flow now:**
   - Invited users are targeted via allowlist conditions
   - Feature is enabled automatically for invited users

#### Code

```tsx
// Same code - no changes needed
const isEnabled = useFeatureFlagEnabled("your-feature-name");
// Now returns true only for users who opted in
```

#### Linear/Notion Status

- Linear: Project status = `In Progress` or `In Review`
- Notion: Release Stage = `Beta`

---

### Stage 3: Open Beta (User Opt-In)

**Who has access:** Users who opt in via Early Access UI  
**Who decides:** The user  
**Mechanism:** Early Access Feature linked to Feature Flag (0% rollout)

#### PostHog Setup

1. **Create Early Access Feature**
   - Name: "Your Feature Name" (human-readable)
   - Link to your feature flag
   - Add description and documentation URL
2. **Keep flag at 0% rollout**

#### UI

- Show **Beta tag** on feature surfaces

---

### Stage 4: GA (General Availability)

**Who has access:** Everyone  
**Who decides:** Nobody - it's the default  
**Mechanism:** Remove flag (no GA-with-flag)

#### PostHog Setup

1. **Remove Early Access link**

   - Go to Early Access Features
   - Delete or archive the Early Access Feature
   - This prevents users from toggling OFF a GA feature

2. **Remove flag from code**
   - Delete flag checks from code
   - Delete flag from PostHog

#### Code (after graduation)

```tsx
// Remove the flag check entirely
// Feature is now always on
<YourFeature />
```

#### Linear/Notion Status

- Linear: Project status = `Done`
- Notion: Release Stage = `GA`

---

## Visual Lifecycle Summary

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FEATURE LIFECYCLE                                │
├────────────────┬────────────────┬────────────────┬──────────────────────┤
│     ALPHA      │ INVITE-ONLY BETA│   OPEN BETA    │       GA             │
├────────────────┼────────────────┼────────────────┼──────────────────────┤
│ Feature Flag   │ Feature Flag   │ Feature Flag   │ No flag in code      │
│ ├─ Rollout: 0% │ ├─ Rollout: 0% │ ├─ Rollout:100%│                      │
│ ├─ Condition:  │ ├─ Allowlist   │ └─ EA: YES     │                      │
│ │  @askelephant│ │  conditions  │                │                      │
│ └─ EA: NO      │    NONE        │                │                      │
├────────────────┼────────────────┼────────────────┼──────────────────────┤
│ Internal only  │ Invite only    │ User opt-in    │ Everyone (permanent) │
├────────────────┼────────────────┼────────────────┼──────────────────────┤
│ Typical: 2-4wk │ Typical: 4-8wk │ Typical: 2wk   │ Flag removed         │
└────────────────┴────────────────┴────────────────┴──────────────────────┘

TRANSITIONS:
  Alpha → Invite-only Beta: Remove internal condition, add allowlist conditions
  Invite-only Beta → Open Beta: Create Early Access link (keep flag at 0%)
  Open Beta → GA:    Remove flag from code entirely
```

---

## Tracking: Where to Maintain the Running List

### Recommended: Notion as Source of Truth

Create a **Feature Release Tracker** database in Notion with these properties:

| Property         | Type   | Values                                         |
| ---------------- | ------ | ---------------------------------------------- |
| Feature Name     | Title  | -                                              |
| PostHog Flag Key | Text   | e.g., `your-feature-name`                      |
| Release Stage    | Select | `Alpha`, `Invite-only Beta`, `Open Beta`, `GA` |
| Owner            | Person | Engineering owner                              |
| Alpha Start      | Date   | When internal testing began                    |
| Beta Start       | Date   | When Early Access was enabled                  |
| GA Date          | Date   | When released to all                           |
| Graduated Date   | Date   | When flag was removed from code                |
| Linear Project   | URL    | Link to Linear project                         |
| Notes            | Text   | Any relevant context                           |

#### Notion Views

1. **By Stage** - Kanban grouped by Release Stage
2. **Timeline** - Calendar view showing GA dates
3. **Stale Features** - Filter: Alpha > 4 weeks, Beta > 8 weeks

### Linear Integration

Linear tracks **development** (build progress), not **release stage** (customer availability).

#### Linear Project Properties

Add a custom field `Release Stage` with values:

- `Alpha` - Internal testing
- `Beta` - Early Access
- `GA` - Generally available
- `Graduated` - Flag removed

#### Linear Labels

Use labels to quickly filter:

- `release:alpha`
- `release:invite-beta`
- `release:open-beta`
- `release:ga`

#### Workflow

1. When project enters QA → Update to `Alpha`
2. When QA passes, ready for invite-only → Update to `Invite-only Beta`
3. When invite-only feedback positive → Update to `Open Beta`
4. When ready for GA → Update to `GA`

### PostHog Tags (Optional)

You can also tag flags in PostHog directly:

- Add tag: `stage:alpha`, `stage:beta`, `stage:ga`
- Filter flags by tag to see current state

---

## Quick Reference: Stage Transitions

### Alpha → Invite-only Beta Checklist

- [ ] Feature works end-to-end (internal testing complete)
- [ ] No critical bugs in 2+ weeks of internal use
- [ ] Documentation drafted (KB article or internal doc)
- [ ] Help center article drafted
- [ ] Revenue training prepared (if customer-facing)
- [ ] **PostHog:** Remove `@askelephant.ai` condition from flag
- [ ] **PostHog:** Add allowlist conditions
- [ ] **Notion:** Update Release Stage to `Invite-only Beta`
- [ ] **Linear:** Update Release Stage field to `Invite-only Beta`
- [ ] **Announce:** Post in #product-updates

### Invite-only Beta → Open Beta Checklist

- [ ] 2+ weeks in Invite-only Beta without critical bugs
- [ ] Positive feedback from beta users
- [ ] KB article published
- [ ] Revenue team trained (if customer-facing)
- [ ] **PostHog:** Create Early Access Feature, link to flag
- [ ] **PostHog:** Keep flag at 0% rollout
- [ ] **Notion:** Update Release Stage to `Open Beta`
- [ ] **Linear:** Update Release Stage field to `Open Beta`
- [ ] **Announce:** Post in #product-updates with release notes

### Open Beta → GA Checklist

- [ ] 2+ weeks in Open Beta without issues
- [ ] Beta badge removed from UI
- [ ] **Code:** Remove feature flag checks from codebase
- [ ] **PostHog:** Delete the feature flag
- [ ] **Notion:** Update Release Stage to `GA`
- [ ] **Linear:** Update Release Stage field to `GA`

---

## The Two Mechanisms

### Feature Flags

**Purpose:** Controlled rollout managed by engineering/product

**How it works:**

1. Code checks flag state at runtime
2. Rollout controlled by % or property conditions
3. Users don't see or control the flag
4. Used for: gradual rollout, A/B testing, kill switches, internal testing

**PostHog UI:** Feature Flags section

### Early Access Features

**Purpose:** User self-service opt-in for beta features

**How it works:**

1. Feature appears in user's Early Access UI
2. User toggles ON to enable
3. PostHog automatically enables the linked flag FOR THAT USER
4. Used for: beta programs, optional features, power user features

**PostHog UI:** Early Access Features section

---

## When to Use Feature Flags (NOT Early Access)

| Scenario                             | Use Feature Flag | Why                      |
| ------------------------------------ | ---------------- | ------------------------ |
| Gradual % rollout (10% → 50% → 100%) | ✓                | Need controlled rollout  |
| Internal team testing only           | ✓                | Not user-facing          |
| A/B testing                          | ✓                | Random assignment needed |
| Kill switch for risky code           | ✓                | Emergency control        |
| Integration toggles (CRM, calendar)  | ✓                | Backend capability       |
| Backend/infrastructure features      | ✓                | Not user-visible         |
| Workspace-specific enablement        | ✓                | Sales/CS controlled      |

### Feature Flag Examples

```
✓ `dataloaders-enabled` - Backend optimization
✓ `mediaclip-processing-v2` - Internal testing
✓ `composio-enabled` - Workspace-specific
✓ `fga-performance-comparison` - Engineering test
✓ `integration-google-calendar-mcp-enabled` - Integration toggle
```

---

## When to Use Early Access

| Scenario                                | Use Early Access | Why                  |
| --------------------------------------- | ---------------- | -------------------- |
| User should control opt-in              | ✓                | Self-service         |
| Gathering feedback from early adopters  | ✓                | Intentional beta     |
| Feature is stable but not GA            | ✓                | Optional enhancement |
| Power user feature (not everyone needs) | ✓                | Opt-in by choice     |
| Feature will appear in Beta Settings UI | ✓                | User-facing toggle   |

### Early Access Examples

```
✓ SSO Login - Workspace admin opts in
✓ Browser Notifications - User preference
✓ Theme Switcher - User preference
✓ Advanced CRM Agent - Power user feature
```

---

## Critical Rule: Never Both at 100%

**THE PROBLEM:** If a flag is at 100% rollout AND linked to Early Access:

- User sees feature in Early Access UI as "opt-in"
- But feature is already enabled for everyone via flag rollout
- User toggles OFF → feature disappears unexpectedly
- Confusion: "I never opted in, why did it break?"

**THE RULE:**

- If flag is at 100% → Remove Early Access link OR graduate the flag
- If using Early Access → Flag should be at 0% (EA controls per-user)

### Decision Matrix

| Flag Rollout | Early Access Link? | Correct? | Action                               |
| ------------ | ------------------ | -------- | ------------------------------------ |
| 0%           | Yes                | ✓        | Correct - EA controls opt-in         |
| 0%           | No                 | ✓        | Correct - staged for future rollout  |
| 50%          | No                 | ✓        | Correct - gradual rollout            |
| 50%          | Yes                | ✗        | Remove EA link - rollout controls    |
| 100%         | No                 | ✓        | Should graduate (remove flag)        |
| 100%         | Yes                | ✗        | PROBLEM - remove EA link or graduate |

---

## Naming Conventions

### Feature Flags

```
# Pattern: [feature]-[type]-[optional-version]
knowledge-bases
salesforce-v2-beta
integration-google-calendar-mcp-enabled
fga-engine-beta
```

### Early Access Features

```
# Pattern: Human-readable name
"Knowledge Base Beta"
"Salesforce Direct Integration"
"Advanced CRM Agent"
"Browser Notifications"
```

---

## FAQ

### Q: Can I use both Feature Flag AND Early Access?

A: Yes, but the flag should be at 0%. Early Access controls opt-in per user. If the flag is at any % > 0, you have conflicting control mechanisms.

### Q: What if I want 50% of users plus Early Access opt-in?

A: Don't. Pick one mechanism:

- Gradual rollout? Use flag at 50%, no EA
- User opt-in? Use EA, flag at 0%

### Q: How do I handle workspace-level features?

A: Use feature flags with workspace properties:

```json
{
  "properties": [{ "key": "workspaceId", "value": ["wrks_xxx"] }]
}
```

Early Access is per-user, not per-workspace.

### Q: What about features that are user preference?

A: Perfect for Early Access. Examples:

- Theme switcher
- Browser notifications
- Horizontal layout options

### Q: When should I remove a flag (GA)?

A: When ALL are true:

- Feature is in Open Beta with stable usage (2+ weeks)
- No bugs reported in 2+ weeks
- Internal documentation complete
- Revenue team trained

### Q: Where should I track what stage each feature is in?

A: **Notion** is recommended as the source of truth for release stage, with Linear tracking development progress. See "Tracking: Where to Maintain the Running List" section above.

---

## Related Documents

- [PostHog Audit (2026-01-26)](../feature-availability-audit/posthog-audit-2026-01-26.md)
- [Release Lifecycle PRD](./prd.md)
- [Feature Flag Categorization Worksheet](./feature-flag-categorization.md)
- [System Integration Audit](./system-integration-audit.md)

---

_Owner: Tyler Sahagun_  
_Approved by: [Pending Engineering Review]_
