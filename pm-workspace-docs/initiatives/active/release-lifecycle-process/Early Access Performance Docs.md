# PostHog Early Access Performance Analysis (2026-02-03)

## Purpose

Document performance considerations for using PostHog Early Access features more frequently, and highlight likely causes of the prior performance dip.

## Quick takeaways

- Early Access flags **cannot be locally evaluated** on the server, which forces remote `/flags` calls in server-side SDKs. This is the most likely source of the previous performance regression.
- Early Access is **JS SDK only** and **does not support groups**, so workspace-scoped Early Access toggles can produce inconsistent behavior.
- Early Access opt-in **overrides release conditions**, which can bypass allowlists if used incorrectly.

## Relevant PostHog docs (performance + behavior)

- Local evaluation restrictions: Early Access flags are not locally evaluatable.  
  https://posthog.com/docs/feature-flags/local-evaluation
- Feature flag costs and `/flags` request behavior (server-side calls are per-evaluation).  
  https://posthog.com/docs/feature-flags/cutting-costs
- Early Access behavior (opt-in override, JS-only, no groups, caching).  
  https://posthog.com/docs/feature-flags/early-access-feature-management
- Feature flag best practices (minimize call sites, local eval where possible).  
  https://posthog.com/docs/feature-flags/best-practices

## What likely caused the prior performance dip

**Root cause candidate:** server-side evaluation of Early Access–linked flags.  
PostHog does not allow local evaluation for Early Access flags, so calls to `isFeatureEnabled()` or `getFeatureFlag()` in backend code would fall back to network `/flags` requests per call. If those checks were on hot paths (auth, chat, media processing, etc.), it would create continuous evaluation and performance regressions.

## Implications for AskElephant’s current architecture

- **Backend feature flag evaluation** currently calls PostHog’s Node SDK and allows remote fallback.  
  This is safe for normal flags, but expensive for Early Access–linked flags.
- **Frontend feature flags** are evaluated in PostHog JS (Early Access is designed for this), but can still incur additional `/flags` requests on initialize/identify/reload.
- **Workspace-scoped features** in Early Access (per-user opt-in) can lead to mismatches if backend expects workspace-level gating.

## Risk/concern checklist

- **Performance risk:** server-side evaluation of Early Access flags on hot paths.
- **Behavioral risk:** per-user opt-in for features intended to be workspace-scoped.
- **Control risk:** allowlist conditions are overridden by Early Access opt-ins.
- **Cache staleness:** Early Access list is cached per browser load; force reloads add latency.

## Recommendations

1. **Keep Early Access evaluation on the client** (JS SDK) and avoid server-side checks for EA flags.
2. **If backend gating is required**, store opt-in state in the DB and treat Early Access as UI for enrollment, not the server-side source of truth.
3. **Reserve Early Access for user-scoped features**. Keep workspace-scoped features on standard flags or allowlists.
4. **Minimize flag call sites** (wrap in single helper) and avoid re-checking in hot code paths.
5. **Avoid `force_reload` in Early Access list** except for admin flows; prefer default caching.

## Open questions to resolve before rollout

- Do we need backend enforcement for any Early Access features, or can it be client-only?
- Which features are truly user-scoped vs workspace-scoped?
- Where are the current hot-path server-side feature flag checks that might touch EA flags?

## Related internal references

- `release-lifecycle-process/early-access-release-cycle.md`
- `release-lifecycle-process/posthog-guidelines.md`
- `release-lifecycle-process/engineering-spec.md`
