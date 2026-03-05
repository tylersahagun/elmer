# Merge Assessment: Settings Page & Early Access Revamp

**Canonical initiative:** `settings-page-early-access-revamp`  
**Source (Linear):** Settings Page & Early Access Revamp  
**Description:** PostHog-driven early access lifecycle with redesigned Settings shell and embedded Beta/Labs UI; legacy routes remain when the flag is off.

## Candidates

- `release-lifecycle-process`
- `settings-page-redesign`
- `settings-redesign`
- `feature-availability-audit`

## Doc Presence Matrix

| Artifact              | release-lifecycle-process | settings-page-redesign | settings-redesign                  | feature-availability-audit |
| --------------------- | ------------------------- | ---------------------- | ---------------------------------- | -------------------------- |
| `research.md`         | ✅                        | —                      | ✅                                 | ✅                         |
| `prd.md`              | ✅                        | —                      | ✅                                 | ✅                         |
| `design-brief.md`     | ✅                        | ✅                     | —                                  | ✅ (no UI)                 |
| `engineering-spec.md` | ✅                        | ✅                     | —                                  | ✅                         |
| `prototype-notes.md`  | ✅                        | —                      | ✅                                 | —                          |
| `gtm-brief.md`        | ✅                        | —                      | —                                  | ✅                         |
| Validation artifacts  | —                         | —                      | ✅ (jury evals, validation report) | —                          |

## Related Signals (last 30 days)

1. `sig-2026-02-03-alpha-beta-feature-flags` (transcript)
   - Direct input on alpha/beta visibility, dynamic “Learn more” links, and settings placement.
2. `sig-2026-01-24-council-of-product` (transcript)
   - Calls out release stage clarity gaps and early access UI issues.
3. `sig-2026-01-26-council-of-product` (transcript)
   - Highlights missing sign-off step in release process (links to lifecycle).
4. `sig-2026-02-01-slack-since-2026-01-28` (slack digest)
   - Access/permission pain points that affect settings scope and trust.
5. `sig-2026-02-01-linear-recent-issues` (issues digest)
   - Limited direct overlap; included for context on workflow reliability and permissions.

## Overlap Summary

- **Release stages + UI:** `release-lifecycle-process` defines Alpha/Beta/GA and ships Beta Features UI; `settings-page-redesign` embeds that UI into a redesigned Settings IA.
- **Settings scope & trust:** `settings-redesign` focuses on privacy settings scope and admin/user separation, which is core to the new settings shell.
- **Feature flag hygiene:** `feature-availability-audit` provides the audit that powers stage tagging and cleanup.

## Conflict Summary

- **Pillar mismatch:** `feature-availability-audit` is **data-knowledge**; others are **customer-trust**.
- **Phase mismatch:** `settings-redesign` is **validate**, `settings-page-redesign` is **define**, `release-lifecycle-process` is **build**.
- **Scope mismatch:** `feature-availability-audit` is technical cleanup (no UI), while others are user-facing IA/process changes.
- **Integration placement:** `settings-page-redesign` suggests integrations outside settings; `settings-redesign` includes integrations in settings.

## Proposed Canonical Structure

1. **Core PRD (canonical):** Early access lifecycle + settings IA + beta features UI in one PRD.
2. **Design brief:** Use `settings-page-redesign/design-brief.md` as the primary UI source; append lifecycle UI rules from `release-lifecycle-process/design-brief.md`.
3. **Engineering spec:** Keep `release-lifecycle-process/engineering-spec.md` as the base; add settings shell routing/IA changes.
4. **Privacy scope decisions:** Pull `settings-redesign` decisions into a “Privacy Settings Scope” section.
5. **Technical audit appendix:** Link to `feature-availability-audit` artifacts as supporting evidence.

## Separation Pushback Gate (Recommendation)

**Do not fully merge** `feature-availability-audit` into the canonical initiative.  
Rationale: different pillar, technical scope, and success metrics. Keep as a supporting technical initiative with explicit links.

**Treat `settings-redesign` as a legacy validation source**, not a live parallel initiative.  
Rationale: it is in validate with existing prototypes; merge only its decisions and validated learnings.

## Open Questions (Blocking a Clean Merge)

1. Should integrations live outside Settings (as per transcript) or remain in the settings IA?
2. Are we allowing customer self-toggle for alpha features or view-only?
3. Is the canonical outcome focused on **release lifecycle clarity**, **settings discoverability**, or both equally?
4. Should the new canonical initiative inherit the **customer-trust** pillar or be dual‑pillar with data‑knowledge?
