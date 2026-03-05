# Observability & Monitoring — Lifecycle + Outstanding Work

## Sources
- Notion project: https://www.notion.so/2c0f79b2c8ac8102a30eda8d8d8d602a
- Linear project: https://linear.app/askelephant/project/observability-and-monitoring-05b9ddc05a93
- Phase: Done - Full Release

## Outstanding Tasks (Linear)
Linear project issues: 23 total (priority counts: P0=22, P4=1).
Top items:
- [ ] CEX-353: Add "exception" log level + relax error requirement
  - https://linear.app/askelephant/issue/CEX-353/add-exception-as-one-level-log-that-takes-error-msg-and-make-error-not
- [ ] CEX-351: Require functionName in loggingContext
  - https://linear.app/askelephant/issue/CEX-351/add-functionname-to-be-required-as-well-in-the-loggingcontext-function
- [ ] CEX-347: Update AGENTS.md for logging utils
  - https://linear.app/askelephant/issue/CEX-347/update-agentsmd-file-to-incorporate-new-logging-util-functions
- [ ] CEX-346: Convention for logs tied to alerts
  - https://linear.app/askelephant/issue/CEX-346/set-up-convention-to-indicate-this-log-is-tighten-to-an-alert-so-dont
- [ ] CEX-345: Record Loom on creating alerts
  - https://linear.app/askelephant/issue/CEX-345/record-a-loom-video-about-how-to-create-alerts

## MVP → Beta → GA Lifecycle
- MVP: Logging standards + baseline tracing + actionable alerts for top flows
- Beta: Expanded metrics coverage + CI linting checks + draft IR runbook
- GA: Full alert protocol + post-mortem workflow + ongoing coverage audits

## Next Work (Estimate)
- 2–3 weeks: logging conventions, CI rules, and documentation
- 2–3 weeks: alert workflow examples + training materials

## Design/UX Gaps and Proposed Flows
No customer-facing UI, but internal tooling needs clear transparency.
- Internal alert triage flow:
  1. Alert fires with actionable summary and owner.
  2. On-call acknowledges with reason and next step.
  3. Linked dashboard shows trace + recent deploys.
  4. Resolution notes captured for post-mortem.
- Trust/Transparency: include evidence links and “why this alert fired” in all
  dashboards; ensure clear recovery steps.
