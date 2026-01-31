# Measurement Plan Generator

Generate or update a measurement plan for an initiative, defining how success will be measured with PostHog analytics.

**Delegates to**: posthog-analyst

## Usage

- `/measure [initiative-name]` - Generate measurement plan from PRD
- `/measure [initiative-name] --update` - Update existing plan with new insights

## Process

### 1. Load Initiative Context

Read from `pm-workspace-docs/initiatives/[name]/` (fallback to `elmer-docs/initiatives/[name]/`):

- `prd.md` - Requirements and success metrics
- `design-brief.md` - User flows to instrument
- `research.md` - User problems (inform hypotheses)
- `measurement-plan.md` - Existing plan (if updating)

Also load:

- `elmer-docs/company-context/product-vision.md` - North star context
- `elmer-docs/workspace-config.json` - Check if PostHog is enabled

### 2. Extract Metrics from PRD

If `prd.md` exists, find the "Success Metrics" section and:

1. Identify vague metrics ("increase engagement" → needs formula)
2. Convert to concrete definitions with formulas
3. Separate leading indicators from north star

**Before:**

```
| Metric | Target |
| Engagement | Increase |
```

**After:**

```
| Metric | Definition | Formula | Target |
| Feature adoption | % users who use feature weekly | (weekly_users / active_users) * 100 | ≥40% |
```

### 3. Generate Event Taxonomy

For each user flow in the design brief:

1. Identify key actions (view, click, submit, success, error)
2. Name events in snake*case: `[object]*[action]`
3. Define required vs optional properties
4. Flag privacy-sensitive data

**Event Naming Convention:**

- `feature_viewed` - User opens/sees the feature
- `action_started` - User begins an action
- `action_completed` - User successfully completes
- `action_failed` - Action resulted in error
- `ai_suggestion_shown` - AI provided a suggestion
- `ai_suggestion_accepted` - User accepted AI suggestion
- `ai_suggestion_rejected` - User rejected AI suggestion

### 4. Define Hypotheses

From research and PRD, extract testable hypotheses:

```markdown
#### H1: [Name]

- **We believe:** [what we think is true]
- **Because:** [evidence from research]
- **We'll know we're right when:** [measurable outcome]
- **We'll know we're wrong when:** [failure signal]
```

### 5. Create Decision Rules

For each hypothesis, define what action to take based on results:

| If...                | Then...                     |
| -------------------- | --------------------------- |
| Metric improves ≥X%  | Ship to 100%                |
| Metric improves Y-X% | Iterate on specific area    |
| No change            | Re-evaluate problem framing |
| Guardrail degrades   | Pause and investigate       |

### 6. Save Measurement Plan

Write to `pm-workspace-docs/initiatives/[name]/measurement-plan.md`

### 7. Update PRD (if needed)

If PRD success metrics were vague:

1. Update `prd.md` Success Metrics table with concrete definitions
2. Add reference: "See `measurement-plan.md` for full analytics spec"

## Output Format

```markdown
# Measurement Plan: [Initiative Name]

## 1) Product Outcomes

[North star, leading indicators, guardrails]

## 2) Hypotheses & Decision Rules

[Testable hypotheses with success/failure criteria]

## 3) Event Taxonomy (PostHog)

[Events, properties, privacy notes]

## 4) Funnels & Activation

[Funnel definition, segmentation, drop-off diagnostics]

## 5) Retention & Habit Formation

[Retention definitions, cohorts]

## 6) Experiments / Rollout

[Feature flags, experiment design]

## 7) Dashboards & Alerts

[Dashboard list, alert thresholds]
```

## Response Template

```
✅ Measurement plan created for [initiative]!

📊 **Metrics Defined:**
- North Star: [metric name] (target: [X])
- Leading Indicators: [count]
- Guardrails: [count]

🧪 **Hypotheses:** [count] testable hypotheses with decision rules

📍 **Events:** [count] PostHog events defined
- Key funnel: [funnel steps]

📁 **Files:**
- `pm-workspace-docs/initiatives/[name]/measurement-plan.md`
- Updated: `pm-workspace-docs/initiatives/[name]/prd.md` (if metrics were vague)

⚠️ **Implementation Checklist:**
- [ ] Events implemented in code
- [ ] Events verified in PostHog test mode
- [ ] Dashboards created
- [ ] Alerts configured

**Next:** Implement events, then run `/validate [name]` before launch.
```

## When PRD is Missing or Incomplete

If no PRD exists or success metrics are missing:

1. Warn the user:

   ```
   ⚠️ No PRD found for [initiative]. A measurement plan needs:
   - Defined user problems (what are we solving?)
   - Success criteria (how do we know it worked?)

   Run `/PM [name]` first to create project documentation.
   ```

2. If user wants to proceed anyway, generate a skeleton plan with:
   - Placeholder metrics marked `[TBD - define in PRD]`
   - Standard event patterns for the feature type
   - Notes on what needs to be filled in

## Integration with Workflow

### Validate Command Integration

The `/validate` command checks:

- `measurement-plan.md` exists (Define → Build gate)
- Events are defined (not just placeholder)
- Implementation status before launch (Validate → Launch gate)

### Prototype Command Integration

When `/proto` builds components, reference measurement plan for:

- Which interactions need event tracking
- What states to instrument (loading, success, error)
- AI confidence levels to capture

## PostHog Best Practices Embedded

1. **Event Naming**: `object_action` pattern (e.g., `deal_updated`, `ai_suggestion_accepted`)
2. **Property Naming**: snake_case, consistent across events
3. **User Identification**: Always include `user_id` and `account_id`
4. **Privacy First**: Never log PII, customer content, or sensitive data
5. **Versioning**: Include `feature_version` property for A/B tests
