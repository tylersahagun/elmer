# Engineer Workload & Focus Analysis (Last 30 Days)
This report provides a comprehensive view of engineer activity across AskElephant meetings, Linear issues, GitHub PRs, and Slack discussions, mapped to active product initiatives.

## Bryan Lund
### 💬 Communication & Focus (Slack)
* **Focus Areas:** Customer Data Export API. He recently shared documentation outlining cursor-based pagination and export by specific IDs, offering his assistance to teams needing to export call data.
* **Active Channels:** Direct Messages (assisting specific users with API integration), `#product-issues`

### 🐘 AskElephant Meetings
- **Focus Areas:** Project 'Babar' (Chief of Staff/Meeting summaries), Privacy/Permissions, Integrations (Redo), Security (Tabletop exercise).
- **Meetings:** Vertical planning (Privacy, Workflows, Platform), Eng Standups, Redo Gameplan, Council of Product.

### Linear Activity
- 🚀 **Initiative Work**: [ASK-5496] Implement CUSTOM projects prototype (prototype-only) at /custom-projects (Project: None, State: Acceptance Review)
- 🚀 **Initiative Work**: [ASK-5492] Ensure /api/v1/meetings/export always returns fresh media signed URLs (Project: None, State: In Progress)
- 🛠️ **Standalone / Unlinked**: [ASK-5456] High vulnerabilities identified in packages are addressed (GCP Container) for jaraco-context:5.3/CVE-2026-23949 (Type: Other, State: Triage)
- 🛠️ **Standalone / Unlinked**: [ASK-5448] System Description (Section III) (Type: Other, State: Done)
- 🛠️ **Standalone / Unlinked**: [ASK-5424] Create backfill script for crmRelation fields on companies and contacts (Type: Other, State: In Progress)
- 🛠️ **Standalone / Unlinked**: [ASK-5389] High vulnerabilities identified in packages are addressed (GitHub Repo) (Type: Other, State: Todo)
- 🛠️ **Standalone / Unlinked**: [ASK-5371] High vulnerabilities identified in packages are addressed (GitHub Repo) (Type: Other, State: Todo)

### GitHub Activity
- 🚀 **Initiative Work**: [#5761] custom projects (prototype) (State: MERGED, Project: ASK-5496)
- 🛠️ **Standalone / Unlinked**: [#5759] Project prototype (State: MERGED)
- 🛠️ **Standalone / Unlinked**: [#5755] Ensure meetings export returns fresh media signed URLs (State: MERGED)
- 🚀 **Initiative Work**: [#5682] Broaden minimatch override to fix CVE-2026-26996 across all workspaces (State: MERGED, Project: ASK-5389)
- 🛠️ **Standalone / Unlinked**: [#5676] Remove meeting trigger privacy feature flag (State: MERGED)
- 🚀 **Initiative Work**: [#5662] Resolve high-severity npm vulnerabilities across all workspace packages (State: MERGED, Project: ASK-5371)
- 🛠️ **Standalone / Unlinked**: [#5633] fix security vulnerabilties with minor version bumps (State: MERGED)

---

## Dylan Shallow
### 💬 Communication & Focus (Slack)
* **Focus Areas:** Model response evaluations and observability. Working on a PostHog dashboard to evaluate model responses (checking for appropriate citations and request satisfaction) and adding tool usage metadata to traces.
* **Active Channels:** `#general` / evaluating model responses channels, Direct Messages, `#product-issues`, `#team-dev-bricks`

### 🐘 AskElephant Meetings
- **Focus Areas:** Speaker identification/VoicePrints, Chat metrics, LLM analytics, query timeout bugs.
- **Meetings:** VoicePrints convo, Chat metrics, Eng standups.

### Linear Activity
- 🚀 **Initiative Work**: [ASK-5502] Create Linear project to track 'chat' improvements (Project: None, State: In Progress)
- 🛠️ **Standalone / Unlinked**: [ASK-5501] email draft should populate to and cc fields (Type: Other, State: Todo)
- 🛠️ **Standalone / Unlinked**: [ASK-5479] add nested transaction test coverage (Type: Other, State: Todo)
- 🚀 **Initiative Work**: [ASK-5470] chat menus don't adjust to stay on the page (Project: Global Chat & Internal Search, State: Acceptance Review)
- 🛠️ **Standalone / Unlinked**: [ASK-5457] deprecate old models (Type: Other, State: Todo)
- 🛠️ **Standalone / Unlinked**: [ASK-5455] Assess chat creation/interaction metrics (Type: Other, State: Acceptance Review)
- 🛠️ **Standalone / Unlinked**: [ASK-5415] [Bug]: Search Past Meetings Query Timeout (Type: Bug, State: Acceptance Review)
- 🛠️ **Standalone / Unlinked**: [ASK-5422] posthog llm analytics for whether a generation used the outputs of a given tool (Type: Other, State: In Progress)
- 🛠️ **Standalone / Unlinked**: [ASK-5384] add enabled tools to posthog LLM analytics (Type: Other, State: Canceled)
- 🛠️ **Standalone / Unlinked**: [ASK-5383] add chat admin-only debug link to posthog LLM trace (Type: Other, State: Done)
- 🚀 **Initiative Work**: [ASK-5380] recent/upcoming meetings should have reasonable LIMITs (Project: Global Chat & Internal Search, State: Done)
- 🛠️ **Standalone / Unlinked**: [ASK-5377] long query false positives? (Type: Other, State: Acceptance Review)
- 🛠️ **Standalone / Unlinked**: [ASK-5376] fix posthog llm analytics tool call args (Type: Other, State: Done)
- 🚀 **Initiative Work**: [ASK-5373] fix LLM analytics - label workflow outputs as workflow outputs (Project: Global Chat & Internal Search, State: Done)
- 🛠️ **Standalone / Unlinked**: [ASK-5370] Injected tool call outputs should be type:json (or some other structured type) (Type: Other, State: Duplicate)
- 🛠️ **Standalone / Unlinked**: [ASK-5358] add monitoring for long queries (Type: Other, State: Done)
- 🛠️ **Standalone / Unlinked**: [ASK-5356] [Bug]: Search Page for Redo Shows No Calls (Type: Bug, State: Done)
- 🛠️ **Standalone / Unlinked**: [ASK-5355] check on 'high' vulns in pyannote-embedding image (Type: Other, State: Canceled)
- 🛠️ **Standalone / Unlinked**: [ASK-5354] put pyannote-embedding image build script into version control (Type: Other, State: In Code Review)
- 🚀 **Initiative Work**: [ASK-5352] Evals on chat responses (Project: Global Chat & Internal Search, State: Acceptance Review)
- 🛠️ **Standalone / Unlinked**: [ASK-5351] Assess diarization (Type: Other, State: Todo)

### GitHub Activity
- 🚀 **Initiative Work**: [#5777] small query improvement (State: MERGED, Project: ASK-5377)
- 🚀 **Initiative Work**: [#5760] log full query for long queries (State: MERGED, Project: ASK-5377)
- 🚀 **Initiative Work**: [#5744] chat menus stay on screen (State: MERGED, Project: ASK-5470)
- 🛠️ **Standalone / Unlinked**: [#5716] Add grok-4-1-fast-non-reasoning and grok-4-1-fast-reasoning (State: MERGED)
- 🚀 **Initiative Work**: [#5712] engagements queries performance (State: MERGED, Project: ASK-5415)
- 🚀 **Initiative Work**: [#5690] Link to posthog trace in debug menu (State: MERGED, Project: ASK-5383)
- 🚀 **Initiative Work**: [#5689] add index and tests for engagements queries (State: MERGED, Project: ASK-5415)
- 🚀 **Initiative Work**: [#5680] better GET_ADDITIONAL_CONTEXT for mentioned entities (State: MERGED, Project: ASK-5380)
- 🚀 **Initiative Work**: [#5667] Posthog LLM Analytics tool calls (State: MERGED, Project: ASK-5376)
- 🚀 **Initiative Work**: [#5665] label workflow chat processing correctly (State: MERGED, Project: ASK-5373)
- 🚀 **Initiative Work**: [#5664] Posthog LLM analytics (State: MERGED, Project: ASK-5352)

---

## Eduardo Gueiros
### 💬 Communication & Focus (Slack)
* **Focus Areas:** Mobile App Development. Received high praise for the state of the mobile app, specifically its voice-to-text capabilities, execution of HubSpot updates, and fast response times which have elevated it beyond an MVP.
* **Active Channels:** `#general` (recipient of team shoutouts), `#team-dev-code-review`, `#product-issues`, `#epd-all`

### 🐘 AskElephant Meetings
- **Focus Areas:** Mobile app updates, Desktop app/Peanut SDK, Audio recording functionality.
- **Meetings:** Mobile app sync, Audio Testing (multiple), Eduardo / Mikael desktop app review, Eng standups.

### Linear Activity
- 🛠️ **Standalone / Unlinked**: [ASK-5505] Unify desktop settings persistence and fix callDetection reset bug (Type: Other, State: Acceptance Review)
- 🛠️ **Standalone / Unlinked**: [ASK-5454] [Bug]: Duplicate Meeting Creation on Mobile App (Type: Other, State: Todo)
- 🛠️ **Standalone / Unlinked**: [ASK-5418] [Bug]: user can't record using the "Record Now" button (Type: Bug, State: Done)
- 🛠️ **Standalone / Unlinked**: [ASK-5416] [Bug]: Frequent Update Pop Ups for Desktop App (Type: Bug, State: Todo)
- 🛠️ **Standalone / Unlinked**: [ASK-5359] [Bug]: Meeting Recorded with the Record Now button, but there isn't any audio. (Type: Bug, State: Todo)
- 🛠️ **Standalone / Unlinked**: [ASK-5346] Mobile Home v2 (Type: Other, State: In Code Review)

### GitHub Activity
- 🚀 **Initiative Work**: [#5775] refactor: unify desktop settings persistence and fix callDetection reset bug (State: MERGED, Project: ASK-5505)
- 🛠️ **Standalone / Unlinked**: [#5750] fix(mobile): expand reliability and chat lifecycle analytics (State: MERGED)
- 🛠️ **Standalone / Unlinked**: [#5745] chore(mobile): bump version to 1.4.3 for App Store / Play Store release (State: MERGED)
- 🚀 **Initiative Work**: [#5734] fix(uploads): bind resumable sessions to allowed request origins (State: MERGED, Project: ASK-5418)
- 🚀 **Initiative Work**: [#5718] feat(uploads): migrate file uploads from Firebase SDK to GCS signed URLs (State: MERGED, Project: ASK-5418)

---

## Ivan Garcia
### 💬 Communication & Focus (Slack)
* **Focus Areas:** Composio Integration. Engaged in discussions regarding the plan for potentially pausing or modifying the Composio integration.
* **Active Channels:** Group Direct Messages (with Sam Ho and Tyler Sahagun), `#mpdm-sam.ho--tyler.sahagun--ivan.garcia-1`, `#churn-alert`, `#sales-linkedin-stuff`

### 🐘 AskElephant Meetings
- **Focus Areas:** Integrations (Vertical - Integrations).
- **Meetings:** Vertical - Integrations - Weekly, Eng standups. 

### GitHub Activity
- 🛠️ **Standalone / Unlinked**: [#5783] fix(functions): double gong call import lookback window to 4 hours (State: MERGED)
- 🛠️ **Standalone / Unlinked**: [#5779] feat(functions): add aircall integration (State: MERGED)
- 🛠️ **Standalone / Unlinked**: [#5754] fix(functions): add notion scope error observability and composio tool logging (State: MERGED)
- 🛠️ **Standalone / Unlinked**: [#5748] feat(functions): add skipAutomations flag to call import endpoints (State: MERGED)
- 🛠️ **Standalone / Unlinked**: [#5743] remove ashby from enabled composio toolkits (State: MERGED)

---

## Jason Harmon
### 💬 Communication & Focus (Slack)
* **Focus Areas:** Workspace administration and Sales enablement. Fixed a bug preventing AskElephant admins from joining other workspaces with their internal email. Setup and invited the sales team to the "Demo AskElephant" workspace.
* **Active Channels:** `#team-sales`, core product channels, `#growth`, `#proj-settings-refresh`, `#product-issues`

### 🐘 AskElephant Meetings
- **Focus Areas:** Privacy vertical (permissions, beta features refactoring), Security.
- **Meetings:** Vertical - Privacy, Security Tabletop, Eng standups.

### Linear Activity
- 🛠️ **Standalone / Unlinked**: [ASK-5522] refactor settings privacy for clarity (Type: Other, State: Backlog)
- 🛠️ **Standalone / Unlinked**: [ASK-5500] fix cursor agent setup (Type: Other, State: Backlog)
- 🛠️ **Standalone / Unlinked**: [ASK-5499] privacy problem briefs (Type: Other, State: Done)
- 🛠️ **Standalone / Unlinked**: [ASK-5508] Filter inactive team members on team page (Type: Other, State: In Progress)
- 🛠️ **Standalone / Unlinked**: [ASK-5489] point remaining files to primitives layer (Type: Other, State: Backlog)
- 🛠️ **Standalone / Unlinked**: [ASK-5460] more metrics requests (Type: Feature Request, State: Done)
- 🛠️ **Standalone / Unlinked**: [ASK-5445] Onboarding contact import fails fetching email contacts (Type: Bug, State: Done)
- 🛠️ **Standalone / Unlinked**: [ASK-5444] fix radix-autocapture conflicts (Type: Bug, State: Done)
- 🛠️ **Standalone / Unlinked**: [ASK-5443] change data analytics id for toggles (Type: Other, State: Done)
- 🛠️ **Standalone / Unlinked**: [ASK-5431] remove old settings code (Type: Other, State: Done)
- 🛠️ **Standalone / Unlinked**: [ASK-5427] webapp layout improvements (Type: Other, State: Backlog)
- 🛠️ **Standalone / Unlinked**: [ASK-5426] replace top level nav provider (Type: Other, State: Canceled)
- 🛠️ **Standalone / Unlinked**: [ASK-5425] improved calendar widget (Type: Other, State: Backlog)
- 🛠️ **Standalone / Unlinked**: [ASK-5414] other table improvements (Type: Other, State: Backlog)
- 🛠️ **Standalone / Unlinked**: [ASK-5413] table scrollbar (Type: Other, State: Backlog)
- 🛠️ **Standalone / Unlinked**: [ASK-5393] table buttons (Type: Other, State: Backlog)
- 🛠️ **Standalone / Unlinked**: [ASK-5392] table tags (Type: Other, State: Backlog)
- 🛠️ **Standalone / Unlinked**: [ASK-5391] table colors (Type: Other, State: Backlog)
- 🛠️ **Standalone / Unlinked**: [ASK-5385] posthog tracking requests (Type: Feature Request, State: Done)
- 🛠️ **Standalone / Unlinked**: [ASK-5375] fix participant creation in copy (Type: Bug, State: Done)
- 🛠️ **Standalone / Unlinked**: [ASK-5368] revisit firebase hooks (Type: Other, State: Backlog)
- 🛠️ **Standalone / Unlinked**: [ASK-5363] upload profile picture (Type: Other, State: Backlog)
- 🛠️ **Standalone / Unlinked**: [ASK-5362] beta features page refactor (Type: Other, State: Done)

### GitHub Activity
- 🛠️ **Standalone / Unlinked**: [#5740] change imports to primitives layer (State: MERGED)
- 🛠️ **Standalone / Unlinked**: [#5732] add remaining component primitive wrappers (State: MERGED)
- 🛠️ **Standalone / Unlinked**: [#5729] fix separated personal and workspace settings (State: MERGED)
- 🚀 **Initiative Work**: [#5723] skip composio fetch if not verified (State: MERGED, Project: ASK-5445)
- 🚀 **Initiative Work**: [#5721] reflect checked state in analytics id (State: MERGED, Project: ASK-5443)
- 🛠️ **Standalone / Unlinked**: [#5720] re separate workspace & personal sections (State: MERGED)

---

## Matt Noxon
### 💬 Communication & Focus (Slack)
* **Focus Areas:** Automations and Workflow Triggers. Actively triaging and working on high-priority Linear issues, specifically `ASK-5519: Implement "Event Transcript Ready" trigger node`, which fires downstream actions when meeting transcripts become available.
* **Active Channels:** `#product-issues` (via Linear integrations), `#churn-alert`

### 🐘 AskElephant Meetings
- **Focus Areas:** Workflows (node development, silent failures, builder usability), Memory Graphs.
- **Meetings:** Vertical - Workflows, Research findings (workflow onboarding), AI Research Interview.

### Linear Activity
- 🛠️ **Standalone / Unlinked**: [ASK-5519] Implement "Event Transcript Ready" trigger node (Type: Other, State: Triage)
- 🛠️ **Standalone / Unlinked**: [ASK-5517] Add MCP create_workflow tool for headless workflow creation (Type: Other, State: In Code Review)
- 🛠️ **Standalone / Unlinked**: [ASK-5498] Add workflow builder analytics instrumentation (Type: Other, State: In Code Review)
- 🛠️ **Standalone / Unlinked**: [ASK-5497] Add user-scoped Composio toolkit connections (Type: Other, State: In Code Review)
- 🛠️ **Standalone / Unlinked**: [ASK-5485] Add primaryExternalCompany to calendar event trigger (Type: Other, State: In Code Review)
- 🛠️ **Standalone / Unlinked**: [ASK-5481] Fix non-manager workflow validation blocking test/activate (Type: Other, State: In Code Review)
- 🛠️ **Standalone / Unlinked**: [ASK-5476] Extract shared engagementTriggerIds constant (Type: Other, State: Acceptance Review)
- 🛠️ **Standalone / Unlinked**: [ASK-5474] Workflow messages are sent as Woody (bot) instead of the workflow creator (Type: Other, State: Triage)
- 🛠️ **Standalone / Unlinked**: [ASK-5473] Fix workflow auto layout after assistant run operations (Type: Other, State: In Code Review)
- 🛠️ **Standalone / Unlinked**: [ASK-5471] [Bug]: Tag Meeting Node Can't Locate Meetings (Type: Bug, State: Todo)
- 🛠️ **Standalone / Unlinked**: [ASK-5463] Add team member selection to Slack workflow node (Type: Other, State: In Code Review)
- 🛠️ **Standalone / Unlinked**: [ASK-5462] Add workflow direct builder tools (Type: Other, State: Acceptance Review)
- 🛠️ **Standalone / Unlinked**: [ASK-5390] [Bug]: Structured HubSpot Agent Not Writing Notes to HubSpot (Type: Bug, State: Todo)
- 🛠️ **Standalone / Unlinked**: [ASK-5367] Add workflow assistant run satisfaction feedback (Type: Other, State: In Code Review)
- 🛠️ **Standalone / Unlinked**: [ASK-5357] [Bug]: No bot, but meeting was set to record, no timeout or kick. (Type: Bug, State: Todo)

### GitHub Activity
- 🚀 **Initiative Work**: [#5747] ASK-5476: Extract shared engagementTriggerIds constant (State: MERGED, Project: ASK-5476)
- 🚀 **Initiative Work**: [#5736] ASK-5462: Add workflow direct builder tools (State: MERGED, Project: ASK-5462)
- 🛠️ **Standalone / Unlinked**: [#5660] Remove deprecated flags from workflow nodes (State: MERGED)
- 🛠️ **Standalone / Unlinked**: [#5654] Add all-users workflows access authorization and visibility (State: MERGED)

---

## Kaden Wilkinson
### 💬 Communication & Focus (Slack)
* **Focus Areas:** Composio Tools functionality and safety. Implemented a change to make Composio tools an opt-in toggle per chat rather than on by default, preventing accidental tool executions (like sending emails).
* **Active Channels:** `#proj-composio`, `#product-issues`, `#team-dev-bricks`

### 🐘 AskElephant Meetings
- **Focus Areas:** Integrations strategy (Redo), Infrastructure (Vercel Sandbox), PostHog analytics, Project coordination.
- **Meetings:** PostHog, Vercel Sandbox GA, Redo Customer Churn Risk, Council of Product, Projects sync.

### Linear Activity
- 🛠️ **Standalone / Unlinked**: [ASK-5513] Meet with composio team about tool router and custom tools (Type: Other, State: Done)
- 🛠️ **Standalone / Unlinked**: [ASK-5511] Followup with Vercel team about their sandboxes (Type: Other, State: Todo)
- 🛠️ **Standalone / Unlinked**: [ASK-5510] Create project plan (Type: Other, State: Acceptance Review)
- 🛠️ **Standalone / Unlinked**: [ASK-5506] Expose more MCP tools (Type: Other, State: Todo)
- 🛠️ **Standalone / Unlinked**: [ASK-5504] Add composio usage analytics (Type: Other, State: Todo)
- 🛠️ **Standalone / Unlinked**: [ASK-5503] Add MCP server usage analytics (Type: Other, State: Todo)
- 🛠️ **Standalone / Unlinked**: [ASK-5484] Usage dashboard only shows partial data (Type: Bug, State: In Progress)
- 🛠️ **Standalone / Unlinked**: [ASK-5480] Create reproducible example for daytona opencode (Type: Other, State: Todo)
- 🛠️ **Standalone / Unlinked**: [ASK-5469] Support custom in house tools in universal agent workflow action (Type: Other, State: Todo)
- 🛠️ **Standalone / Unlinked**: [ASK-5468] Support composio workflow triggers (Type: Other, State: Todo)
- 🚀 **Initiative Work**: [ASK-5466] Setup Composio webhook endpoint (Project: None, State: Done)
- 🛠️ **Standalone / Unlinked**: [ASK-5465] Fix OAuth 2.1 client registration (Type: Other, State: Done)
- 🚀 **Initiative Work**: [ASK-5464] Fix tool results not being visible to the client (Project: None, State: Acceptance Review)
- 🛠️ **Standalone / Unlinked**: [ASK-5441] Security audit of OAuth 2.1 (Type: Other, State: Todo)
- 🚀 **Initiative Work**: [ASK-5440] Chat UI support for HITL with AI SDK v6 (Project: None, State: In Progress)
- 🛠️ **Standalone / Unlinked**: [ASK-5439] Workspace owner integration management (Type: Other, State: Todo)
- 🛠️ **Standalone / Unlinked**: [ASK-5438] Super admin ui for managing composio tools (Type: Other, State: Todo)
- 🛠️ **Standalone / Unlinked**: [ASK-5437] Create universal agent workflow action (Type: Other, State: Done)
- 🛠️ **Standalone / Unlinked**: [ASK-5436] Add composio to chats behind FF (Type: Other, State: Done)
- 🛠️ **Standalone / Unlinked**: [ASK-5435] Meet with REDO IT Admin (Type: Other, State: Todo)
- 🛠️ **Standalone / Unlinked**: [ASK-5434] Add MCP Tools for querying calls by CRM ids (Type: Other, State: Acceptance Review)
- 🛠️ **Standalone / Unlinked**: [ASK-5433] Add MCP Server endpoint (Type: Other, State: Done)
- 🛠️ **Standalone / Unlinked**: [ASK-5432] Support OAuth 2.1 for MCP server (Type: Other, State: Done)
- ⚠️ **NEEDS DEFINITION / BLOCKED**: [ASK-5430] NO ASSIGNMENT - needs work defined (Project: None)
- 🛠️ **Standalone / Unlinked**: [EPD-1624] Update calendar visibility & reminders (Type: Other, State: Triage)
- 🛠️ **Standalone / Unlinked**: [EPD-1622] Prepare shared Deep Work doc/template (Type: Other, State: Triage)
- 🛠️ **Standalone / Unlinked**: [EPD-1620] Confirm personal focus goals for next Deep Work Wednesday (Type: Other, State: Triage)
- 🛠️ **Standalone / Unlinked**: [ASK-5347] [Bug]: Send Message to Conversation Node just sent a \n (Type: Bug, State: Todo)
- 🛠️ **Standalone / Unlinked**: [EPD-1604] Follow up on optional input and confirm availability (Type: Other, State: Duplicate)

### GitHub Activity
- 🛠️ **Standalone / Unlinked**: [#5766] docs: Enterprise API & Developer Portal plan (Phases 0-6) (State: MERGED)
- 🛠️ **Standalone / Unlinked**: [#5765] chore: update Claude Code settings permissions (State: MERGED)
- 🛠️ **Standalone / Unlinked**: [#5762] Development environment setup (State: MERGED)
- 🚀 **Initiative Work**: [#5739] [ASK-5466] Add Composio webhook endpoint and rewrites (State: MERGED, Project: ASK-5466)
- 🚀 **Initiative Work**: [#5738] [ASK-5464] fix: include MCP structured payload in text content responses (State: MERGED, Project: ASK-5464)
- 🛠️ **Standalone / Unlinked**: [#5735] feat(functions): support workspace-linked OAuth clients (State: MERGED)
