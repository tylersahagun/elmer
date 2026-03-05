# Engineering Focus Board

**Date:** 2026-02-26  
**Window:** 2025-11-28 to 2026-02-26 (AskElephant, Linear, Slack, GitHub)  
**Audience:** Product + Engineering leadership

## Team-Level Snapshot

| Engineer | Primary Focus Areas | Active Load Signal | Unlinked Work Signal | PM Definition Risk |
| --- | --- | --- | --- | --- |
| Kaden Wilkinson | Composio tools, MCP server, SSO/user provisioning | High | High | High |
| Bryan Lund | Platform reliability, SOC2/compliance, cross-project direction | Medium | Medium-High | Medium-High |
| Dylan Shallow | Global Chat, Signals, voiceprint/speaker quality | Very High | High | High |
| Eduardo Gueiros | Mobile + desktop reliability, recording/upload fixes | High | High | High |
| Ivan Garcia | Integrations/import pipelines (Gong/Aircall/Fathom), chat reliability | Medium-High | Medium-High | High |
| Jason Harmon | Privacy + onboarding/settings + design-system backlog | Very High | Very High | Very High |
| Matt Noxon | Workflow platform + MCP creation + instrumentation | Very High | Very High | Very High |

## Engineer Board

### Kaden Wilkinson

- **Now working on**
  - `ASK-5511` Follow up with Vercel sandboxes
  - `ASK-5506` Expose more MCP tools
  - `ASK-5504` Add Composio usage analytics
- **Focus clusters**
  - Tools Autopilot (Composio), MCP Server, SSO/User Provisioning
- **Platform signals**
  - Linear: 96 issues total, large active queue
  - Slack: very high activity; heavy in `team-dev-code-review`
  - GitHub: 75 PRs in window (high feature output)
  - AskElephant: appears in vertical planning and product training meetings
- **Needs PM definition**
  - Group tooling/platform tickets into explicit initiative tracks with owner + milestone dates

### Bryan Lund

- **Now working on**
  - `ASK-5496` Custom projects prototype implementation
  - `ASK-5492` Fresh signed URL reliability on exports
  - `ASK-5424` CRM relation backfill script
- **Focus clusters**
  - Reliability work, SOC2/compliance, cross-team direction
- **Platform signals**
  - Linear: 73 issues, mixed product + compliance streams
  - Slack: high coordination load in engineering/product channels
  - GitHub: 38 PRs (strong bug-fix + feature mix)
  - AskElephant: high meeting load across vertical syncs/council
- **Needs PM definition**
  - Separate compliance stream from customer-facing delivery stream in roadmap comms

### Dylan Shallow

- **Now working on**
  - `ASK-5502` Track chat improvements in Linear
  - `ASK-5501` Email draft autofill behavior
  - `ASK-5470` Chat menu positioning and UX
- **Focus clusters**
  - Global Chat, Signals, speaker/voiceprint quality
- **Platform signals**
  - Linear: 173 issues, very high backlog/throughput
  - Slack: high signal in product issues + code review
  - GitHub: 39 PRs, mostly improvements
  - AskElephant: involved in chat/metrics and training conversations
- **Needs PM definition**
  - Consolidate chat work into a single prioritized outcome plan with metric checkpoints

### Eduardo Gueiros

- **Now working on**
  - `ASK-5505` Desktop settings persistence + reset bug
  - `ASK-5454` Duplicate meeting creation on mobile
  - `ASK-5416` Frequent desktop update pop-up bug
- **Focus clusters**
  - Mobile reliability, desktop recording/upload reliability, notification path
- **Platform signals**
  - Linear: bug-heavy queue, many reliability tasks
  - Slack: high activity in mobile and issue channels
  - GitHub: 21 PRs, mostly bug fixes
  - AskElephant: high volume of test/reliability sessions + standups
- **Needs PM definition**
  - Create one reliability lane with release gates (P0/P1) and explicit customer impact labels

### Ivan Garcia

- **Now working on**
  - `ASK-5512` Gong auto-import missing calls
  - `ASK-5345` Aircall integration
  - `ASK-5277` Sync health digest + alerting
- **Focus clusters**
  - Integration imports, chat reliability, migration/automation support
- **Platform signals**
  - Linear: smaller queue but meaningful blocked import work
  - Slack: lower volume than peers, high technical issue density
  - GitHub: 20 PRs, mostly integration fixes/features
  - AskElephant: appears in standups/vertical syncs; participant naming is inconsistent in records
- **Needs PM definition**
  - Publish integration priority order (customer risk + revenue impact) and unblock dependencies weekly

### Jason Harmon

- **Now working on**
  - `ASK-5508` Filter inactive team members on team page
  - `ASK-5489` Primitives/design-system follow-through
  - `ASK-5427` Web layout improvements
- **Focus clusters**
  - Privacy/permissions, onboarding/settings, design-system and UI backlog
- **Platform signals**
  - Linear: 191 issues, biggest backlog and breadth
  - Slack: very high async coordination load
  - GitHub: 80 PRs, broad spread across feature/fix/improvement
  - AskElephant: high cadence in privacy and team-wide meetings
- **Needs PM definition**
  - Apply WIP caps and hard scope boundaries by vertical to avoid backlog sprawl

### Matt Noxon

- **Now working on**
  - `ASK-5517` MCP create_workflow tool
  - `ASK-5498` Workflow builder analytics instrumentation
  - `ASK-5497` User-scoped Composio toolkit connections
- **Focus clusters**
  - Workflow platform, MCP tooling, builder instrumentation/usability
- **Platform signals**
  - Linear: many in-code-review items plus high unlinked queue
  - Slack: frequent workflow/project coordination
  - GitHub: 37 PRs, many open and in-flight
  - AskElephant: strong presence in workflows standups and workflow review calls
- **Needs PM definition**
  - Define workflow release sequence (node quality bar, rollout criteria, instrumentation minimums)

## Needs Definition Queue (PM Action Board)

| Priority | Area | Owner | Why It Needs PM Guidance | Next PM Action |
| --- | --- | --- | --- | --- |
| P0 | Privacy stream scope | Jason + Product | Scope breadth is high with mixed backlog quality | Lock top 3 outcomes and freeze non-critical intake this week |
| P0 | Workflow release criteria | Matt + Product | Many in-flight workflow changes without one shared gate | Publish launch checklist and required success metrics |
| P0 | Chat improvements fragmentation | Dylan + Product | Chat work spread across unlinked issues/projects | Create one parent initiative and map all active tickets |
| P1 | Reliability bug lane | Eduardo + Product | Bug load is high across mobile/desktop with split prioritization | Define P0/P1 bug triage rubric + weekly reliability review |
| P1 | Integrations unblock plan | Ivan + Product | Import/integration tasks have blocked dependencies | Maintain dependency log with owner + due date |
| P1 | Tooling/platform initiative map | Kaden + Product | Large tooling volume with weak initiative linkage | Group tickets into 2-3 platform initiatives with milestones |
| P1 | Compliance vs product stream split | Bryan + Product | SOC2 and product delivery compete for visibility | Separate reporting lanes in weekly status |

## Suggested Weekly Ritual

- Monday: update each engineer's top 3 commitments
- Wednesday: PM unblock review on all blocked or unlinked critical tickets
- Friday: demo + close loop on what shipped vs what slipped and why

