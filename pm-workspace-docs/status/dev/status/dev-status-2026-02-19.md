# Development Status Report

**Generated:** 2026-02-19 (MT)  
**Sources:** Linear (Development team), GitHub merged PRs (last 7 days), Notion Projects DB

## Snapshot

- Engineering work is active and shipping across chat, onboarding, mobile, workflows, and integrations.
- Two missing Notion project records were added to close mapping gaps:
  - `Product Clarity & Communication`
  - `Onboarding v2 (carousel & seeding)`
- Highest remaining visibility gap: many active Linear issues are still not attached to a Linear project (`project: null`), which weakens Notion mapping.

## By Engineer (Current Focus)

- **Dylan Shallow**
  - Active: Global Chat + LLM analytics reliability (`ASK-5380`, `ASK-5373`, `ASK-5376`, `ASK-5358`)
  - Shipped: multiple merged PRs tied to analytics and query reliability
  - Notion mapping: mostly aligns to `Global Chat & Internal Search`

- **Jason Harmon**
  - Active: beta features and onboarding flow updates (`ASK-5362`, `ASK-5375`, `ASK-5374`)
  - Shipped: onboarding/beta frontend and UX updates
  - Notion mapping: now aligns via new `Onboarding v2 (carousel & seeding)` and `Product Clarity & Communication`

- **Palmer Turley**
  - Active: meeting summary and daily prep agent (`ASK-5369`, `ASK-5382`)
  - Shipped: `ASK-5378`, `ASK-5379`, plus summary FE/BE work
  - Notion mapping: partial; some work likely under chat/automation themes but project association in Linear is often missing

- **Matt Noxon**
  - Active: workflow assistant satisfaction feedback and workflow/platform fixes (`ASK-5367` and related)
  - Shipped: workflow/tooling and platform updates
  - Notion mapping: partial due to missing Linear project assignment on many active issues

- **Ivan Garcia**
  - Active: integrations and import reliability (`ASK-5345`, `ASK-5277`, `ASK-5276`)
  - Shipped: retry logic and import hardening (`ASK-5267`, `ASK-5260`)
  - Notion mapping: aligns to `Call & Data Imports`; some integration work remains unmapped due to null project on issues

- **Eduardo Gueiros**
  - Active: mobile and recording reliability (`ASK-5346`, `ASK-5359`)
  - Shipped: mobile chat/refocus and OTA/build cleanups
  - Notion mapping: aligns to `Mobile v2 Redesign`

- **Bryan Lund**
  - Active: security/vulnerability remediation (`ASK-5371`) plus product/platform coordination tickets
  - Shipped: multiple reliability/security PRs
  - Notion mapping: mixed; several tasks are cross-cutting without stable project tags

## Project Mapping Health

### Clean/Usable Mapping

- Linear `Global Chat` -> Notion `Global Chat & Internal Search`
- Linear `Call & Data Imports` -> Notion `Call & Data Imports`
- Linear mobile work -> Notion `Mobile v2 Redesign`
- Linear `Product Clarity & Communication` -> Notion `Product Clarity & Communication` (added)
- Linear `Onboarding v2 (carousel & seeding)` -> Notion `Onboarding v2 (carousel & seeding)` (added)

### Remaining Gaps

- Active issues without a Linear project cannot be reliably rolled up into Notion project views.
- Some merged PRs do not include `ASK-####` in branch/title, reducing automated traceability.

## Recommended Daily Operating Cadence

1. Ensure each active Linear issue has a project.
2. Ensure each PR includes `ASK-####` in branch name or title.
3. Run this report daily and update Notion project phase/status based on issue state.
4. Flag any issue in `In Progress` + `project: null` as a routing error for same-day cleanup.

