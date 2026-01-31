# Availability Check

Validate analytics and monitoring coverage for a feature or initiative.

**Delegates to**: posthog-analyst

## Usage

- `/availability-check [initiative]`

## Behavior

- Review instrumentation coverage and data freshness.
- Confirm dashboards or alerts exist for key metrics.
- Write results to `pm-workspace-docs/status/availability-check.md` using `write_repo_files`.
