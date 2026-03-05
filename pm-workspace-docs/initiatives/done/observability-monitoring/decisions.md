# Architectural Decisions: Automated Metrics & Observability

## Decision Log

### ADR-001: Feature Registry as Source of Truth

**Date:** 2026-01-08

**Status:** Proposed

**Context:**
Currently, metrics instrumentation is scattered across the codebase with no central definition of what each feature should track. This leads to inconsistent coverage, forgotten events, and difficulty auditing instrumentation.

**Decision:**
Create a centralized Feature Registry (`src/metrics/feature-registry.ts`) that defines:
- All features and their category
- Required PostHog events per feature
- LangSmith project/dataset configuration for AI features
- Alert thresholds

**Consequences:**
- ✅ Single source of truth for metrics requirements
- ✅ Enables automated dashboard/project creation
- ✅ Makes coverage gaps visible via audits
- ⚠️ Requires discipline to update registry when adding features
- ⚠️ Initial migration effort to populate existing features

---

### ADR-002: Dual-Track Observability (PostHog + LangSmith)

**Date:** 2026-01-08

**Status:** Confirmed (Already Implemented)

**Context:**
Need to track both product usage metrics (who uses what, how often) and AI quality metrics (latency, accuracy, cost). PostHog excels at product analytics; LangSmith excels at LLM observability.

**Decision:**
Maintain two observability platforms:
1. **PostHog**: Usage metrics, funnels, retention, session replay, feature flags
2. **LangSmith**: LLM tracing, evaluation datasets, prompt versioning, cost tracking

Sync critical LangSmith metrics to PostHog for unified dashboards.

**Consequences:**
- ✅ Best-of-breed for each domain
- ✅ Existing integrations already in place
- ⚠️ Requires data sync mechanism between platforms
- ⚠️ Two systems to maintain and learn

---

### ADR-003: Decorator-Based Auto-Instrumentation

**Date:** 2026-01-08

**Status:** Proposed

**Context:**
Manual event emission is error-prone. Engineers forget to add events, or add them inconsistently.

**Decision:**
Create wrapper functions/decorators that automatically emit start/complete/fail events:
- TypeScript: `withFeatureMetrics(featureId, fn)`
- Python: `@with_feature_metrics(feature_id, category)`

These wrappers read from the Feature Registry and emit standardized events.

**Consequences:**
- ✅ Consistent event emission
- ✅ Less boilerplate in feature code
- ✅ Automatic timing/error capture
- ⚠️ Requires wrapping existing functions
- ⚠️ May need escape hatches for custom properties

---

### ADR-004: Scheduled Evaluation Pipelines (Not Real-Time)

**Date:** 2026-01-08

**Status:** Proposed

**Context:**
LLM evaluations (using LLM-as-judge patterns) are expensive and slow. Running them on every request is not feasible.

**Decision:**
Run evaluations on a schedule:
- **Daily**: Full evaluation suite on sampled traces (10-20%)
- **Weekly**: Regression testing against golden datasets
- **On-demand**: Ad-hoc evaluation during development

Sample traces into evaluation datasets automatically using LangSmith rules.

**Consequences:**
- ✅ Cost-effective evaluation
- ✅ Catches regressions within 24 hours
- ⚠️ Not suitable for real-time quality gating
- ⚠️ Sampling may miss edge cases

---

### ADR-005: LangSmith Project Per Feature Per Environment

**Date:** 2026-01-08

**Status:** Proposed

**Context:**
Need isolation between:
- Different features (chat vs. extraction vs. workflows)
- Different environments (staging vs. production)

**Decision:**
Create LangSmith projects with naming convention: `{feature}_{environment}`

Examples:
- `global-chat_production`
- `global-chat_staging`
- `transcript-extraction_production`

**Consequences:**
- ✅ Clear isolation and organization
- ✅ Easy to compare staging vs. production
- ✅ Feature-specific dashboards and metrics
- ⚠️ More projects to manage
- ⚠️ Need automation to create projects consistently

---

### ADR-006: PostHog for Unified Cost Attribution

**Date:** 2026-01-08

**Status:** Proposed

**Context:**
LLM costs are tracked in LangSmith per-trace, but we need to attribute costs by:
- Feature
- Workspace
- User segment
- Model

**Decision:**
Sync cost metrics from LangSmith to PostHog using custom events:
- `$ai_generation` events (already captured via `@posthog/ai`)
- Add `$ai_project_metrics` for aggregated project-level metrics

Build cost dashboards in PostHog to correlate with user behavior.

**Consequences:**
- ✅ Unified cost visibility with product metrics
- ✅ Can segment costs by PostHog properties
- ⚠️ Slight data duplication
- ⚠️ Sync latency (up to 1 hour for aggregates)

---

### ADR-007: OTel for Infrastructure, PostHog/LangSmith for Product

**Date:** 2026-01-08

**Status:** Confirmed (Already Implemented)

**Context:**
OpenTelemetry is already set up for infrastructure observability (HTTP, gRPC, Postgres, etc.).

**Decision:**
Maintain separation:
- **OpenTelemetry → Google Cloud**: Infrastructure metrics (latency, error rates, resource usage)
- **PostHog**: Product metrics (user behavior, feature adoption, funnels)
- **LangSmith**: AI quality metrics (LLM latency, token usage, evaluations)

**Consequences:**
- ✅ Each system optimized for its purpose
- ✅ Infrastructure team uses familiar tools
- ⚠️ Three systems to correlate for debugging
- Consider: Future OTEL integration with LangSmith for trace correlation

---

## Future Considerations

### Not Decided Yet

1. **Real-time quality gating**: Should we block low-quality responses before sending to users?
2. **User feedback loop**: How to incorporate thumbs up/down into evaluation datasets?
3. **A/B testing prompts**: How to run prompt experiments with proper statistical rigor?
4. **Cross-feature attribution**: How to track when one feature triggers another (e.g., workflow → chat)?

