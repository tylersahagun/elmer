# Research: Settings Page & Early Access Revamp

## Summary

Research converges on two core needs: (1) consistent release lifecycle definitions with clear customer visibility, and (2) clear settings scope for admins vs users. These are trust problems first, UI problems second.

**Merged from:**

- `release-lifecycle-process/research.md`
- `settings-redesign/research.md`
- `feature-availability-audit/research.md` (audit evidence)
- `signals/transcripts/2026-02-03-alpha-beta-feature-flags.md`

---

## Key Findings

1. **Feature maturity is unclear**  
   Internal and customer experiences diverge; release stage definitions are missing or inconsistent.

2. **Settings scope is confusing**  
   Workspace settings need explicit "manager/owner only" messaging; users need personal settings clarity.

3. **Beta discovery is broken**  
   Users do not know what is available or how to opt in. Alpha visibility should be dynamic.

4. **Documentation gating is required**  
   "Learn more" links should only appear when KB docs exist.

---

## Decisions Captured

- Stage order: Alpha -> Invite-only Beta -> Open Beta -> GA
- GA removes feature from beta list (no GA with flag)
- Alpha is internal/invite-only; beta is opt-in
- Privacy settings apply to managers/owners only
- Users can mark meetings public, not private

---

## Evidence Sources

- Leadership meeting on feature flag hell (Jan 13)
- Settings redesign planning session (Jan 16)
- Alpha/Beta visibility transcript (Feb 3)

---

## Open Questions

1. Should alpha toggles be view-only or self-serve?
2. Where should integrations live (Settings vs dedicated area)?
3. How do we communicate scope changes to existing customers?
