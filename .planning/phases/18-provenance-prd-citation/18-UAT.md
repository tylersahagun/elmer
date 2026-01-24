---
status: complete
phase: 18-provenance-prd-citation
source: 18-01-SUMMARY.md, 18-02-SUMMARY.md, 18-03-SUMMARY.md, 18.1-01-SUMMARY.md
started: 2026-01-24T02:35:00Z
updated: 2026-01-24T02:41:00Z
---

## Current Test

[testing complete]

## Tests

### 1. View Linked Signals on Project Page
expected: Navigate to a project that has linked signals. The project page should show a section titled "Signals that informed this project (N)" where N is the count of linked signals. This section should be visible and display the list of signals.
result: pass

### 2. Signal Provenance Display
expected: In the linked signals section, each signal should show: (1) the signal verbatim text, (2) source badge, (3) severity badge if present, (4) "Linked {date} by {name}" showing who linked it, (5) AI confidence percentage if it was AI-suggested (e.g., "85% AI confidence"), and (6) link reason in italics below the badges if present (e.g., "Reason: AI-suggested association accepted by user").
result: pass

### 3. PRD Generation Includes Signal Evidence
expected: Generate a PRD for a project that has linked signals. The generated PRD should include a "Supporting User Evidence" section that cites the linked signals. Each citation should show the signal source, severity, and a truncated verbatim quote (up to 200 chars). Maximum 10 signals should be cited.
result: pass

### 4. Project Cards Show Signal Count Badge
expected: On the kanban board, project cards that have linked signals should display a MessageSquare icon badge showing the signal count (e.g., "3" with a message icon). This badge should appear after the prototype count badge if present.
result: pass

### 5. Create Project from Signal Cluster
expected: On the signals page, there should be a "Discover Patterns" button. Clicking it should analyze signals and show cluster cards. Each cluster card should display: theme, signal count badge, severity badge, confidence badge, and preview of first 3 signals. Clicking "Create Project" on a cluster card should open a modal pre-filled with the cluster theme as the project name.
result: pass

### 6. Complete Cluster-to-Project Flow
expected: In the CreateProjectFromClusterModal, enter a project name (or keep the pre-filled theme), optionally add a description, and submit. The modal should close, a new project should be created, all signals from the cluster should be linked to the new project with the cluster theme as the link reason, and you should be navigated to the new project page.
result: pass

## Summary

total: 6
passed: 6
issues: 0
pending: 0
skipped: 0

## Gaps

[none yet]
