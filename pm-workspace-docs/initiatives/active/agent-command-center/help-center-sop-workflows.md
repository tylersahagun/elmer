# Help Center SOP: AskElephant Workflows

> **Assignment for Elephant AI team**: Turn this SOP into a world-class, customer-facing help center article (or series of articles). The content below is sourced directly from the production codebase and represents the ground truth of how Workflows work today. Your job is to make this accessible, beautiful, and genuinely useful for customers ranging from first-time users to power users building complex automations.

---

## Problem Statement

AskElephant's **Workflows** feature is a visual automation builder that lets users create trigger-action chains across 10+ integrations (Slack, HubSpot, Salesforce, Google, Linear, Notion, and more). It's our most powerful feature — and our most under-documented.

**Current state:**

- No comprehensive help center article exists
- Support tickets about workflow configuration are rising
- Users discover capabilities by trial and error
- Power users have no reference for advanced patterns (variable chaining, object references, sub-workflows)
- Onboarding friction: new users don't know where to start

**Desired outcome:**
A help center article (or structured series) that:

1. Gets a new user from zero to a working workflow in under 10 minutes
2. Serves as an ongoing reference for configuration options
3. Teaches best practices that prevent common mistakes
4. Showcases advanced patterns that drive deeper adoption

---

## Feature Overview (From Codebase)

### What Workflows Are

Workflows are visual, node-based automations built on a drag-and-drop canvas (React Flow). Each workflow consists of:

- **One trigger** (the event that starts the workflow)
- **One or more actions** (the steps that execute in sequence)
- **Edges** (connections between nodes defining execution order)
- **Configuration** per node (dynamic forms that change based on the action type)

Think of it as "if this happens, then do this, then this, then this" — but with a visual graph and deep integrations into your sales stack.

### Workflow Properties

| Property    | Required | Description                                                  |
| ----------- | -------- | ------------------------------------------------------------ |
| Name        | Yes      | Internal name shown in the workflow list                     |
| Description | No       | Optional context for your team about what this workflow does |
| Active      | Toggle   | Whether the workflow is live and executing on triggers       |

---

## Integration Sources (Trigger & Action Providers)

Each integration provides both **triggers** (events that start workflows) and **actions** (steps that execute). Integrations are color-coded in the canvas:

| Integration           | Color  | Example Triggers                                    | Example Actions                                     |
| --------------------- | ------ | --------------------------------------------------- | --------------------------------------------------- |
| **Elephant (Native)** | Blue   | Meeting ended, Engagement created, Signal extracted | Send AI prompt, Extract signals, Create action item |
| **Slack**             | Purple | Message received, Reaction added                    | Send message, Update channel topic                  |
| **HubSpot**           | Orange | Deal stage changed, Contact created                 | Update deal, Create task, Log activity              |
| **Google**            | Red    | Calendar event created, Email received              | Send email, Create calendar event                   |
| **Salesforce**        | Blue   | Opportunity updated, Case created                   | Update record, Create task                          |
| **Linear**            | Purple | Issue created, Status changed                       | Create issue, Update issue                          |
| **Notion**            | Black  | Page updated, Database item created                 | Create page, Update database                        |
| **Microsoft**         | Blue   | Teams message, Outlook email                        | Send Teams message, Create event                    |
| **Monday**            | Yellow | Item created, Status changed                        | Create item, Update column                          |
| **+ Composio**        | Varies | 100+ additional triggers via Composio platform      | 100+ additional actions                             |

> **Note**: Integrations must be **connected** before their triggers/actions appear. If an integration shows "Not Connected," the user needs to complete the OAuth flow first.

---

## Node Types & Configuration

### The 33 Configuration Controls

Every action node has a dynamic configuration form generated from its JSON schema. The system uses 33 specialized form renderers to handle different input types:

#### Text & Data Input

| Control                 | What It Does                                                                                      | When You See It                             |
| ----------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| **Text Input**          | Standard text field                                                                               | Simple string fields (subject lines, names) |
| **Rich Text (Lexical)** | Rich editor with **variable insertion** — type `{{` to autocomplete variables from previous nodes | Message bodies, email content, AI prompts   |
| **Number Input**        | Numeric field                                                                                     | Quantities, scores, thresholds              |
| **Boolean Toggle**      | On/off switch                                                                                     | Feature flags, enable/disable options       |
| **Slider**              | Numeric range slider                                                                              | Confidence thresholds, temperature settings |

#### Selection Controls

| Control                     | What It Does                          | When You See It                |
| --------------------------- | ------------------------------------- | ------------------------------ |
| **Enum Selector**           | Dropdown for predefined options       | Status fields, priority levels |
| **Tag Selector**            | Multi-select tags                     | Categorization, labeling       |
| **Channel Type Selector**   | Slack channel type picker             | Slack-specific actions         |
| **Communication Direction** | Inbound/Outbound selector             | Email and call workflows       |
| **Media Type Selector**     | Audio/video type picker               | Engagement-related actions     |
| **Language Model Selector** | AI model picker (GPT-4, Claude, etc.) | AI prompt actions              |

#### Entity References

| Control                     | What It Does                                                                         | When You See It                                    |
| --------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------- |
| **Person Selector**         | Pick a single person                                                                 | Assigning tasks, sending DMs                       |
| **People Selector**         | Pick multiple people                                                                 | CC fields, team assignments                        |
| **Group Selector**          | Pick a team/group                                                                    | Team notifications, group assignments              |
| **Object Reference**        | Reference a workflow object (person, company, meeting) from a previous node's output | Dynamic lookups — "Update the company from step 1" |
| **Workflow Selector**       | Pick another workflow                                                                | Sub-workflow execution                             |
| **Document Selector**       | Pick documents/knowledge base items                                                  | AI context, attachments                            |
| **Knowledge Base Selector** | Pick a knowledge base                                                                | AI grounding sources                               |

#### CRM & Integration Fields

| Control                             | What It Does                             | When You See It              |
| ----------------------------------- | ---------------------------------------- | ---------------------------- |
| **CRM Property Select**             | Pick a HubSpot/Salesforce property       | CRM update actions           |
| **External Object Property Select** | Pick external object fields              | Integration sync actions     |
| **External Object Type Select**     | Pick object types                        | Integration configuration    |
| **Generic Property Select**         | Universal property picker                | Various integration actions  |
| **Composio Toolkits Selector**      | Pick Composio tools with connection flow | Advanced integration actions |
| **Enabled Tools Selector**          | Toggle available tools                   | AI agent actions             |

#### Complex Data

| Control                    | What It Does                                                           | When You See It                 |
| -------------------------- | ---------------------------------------------------------------------- | ------------------------------- |
| **Array of Strings**       | List of text values                                                    | Recipients, tags, categories    |
| **Array of Objects**       | Nested list of structured items                                        | Multi-step configurations       |
| **Object Renderer**        | Nested object configuration                                            | Complex settings                |
| **Key-Value Pairs**        | Dictionary editor                                                      | Custom headers, metadata        |
| **Email Array**            | List of email addresses                                                | Distribution lists              |
| **Signal Filters Array**   | Signal filtering rules                                                 | Signal extraction configuration |
| **Signal Property Select** | Signal property picker                                                 | Signal-specific actions         |
| **Signal Tags Selector**   | Signal tag picker                                                      | Signal categorization           |
| **Variable Extraction**    | Variable name input (validated: alphanumeric + underscore/hyphen only) | Custom variable definitions     |

---

## The Variable System (Power Feature)

The most important concept for advanced workflows is the **variable system**. Every node's output becomes available as variables in subsequent nodes.

### How Variables Work

1. **Trigger fires** → outputs data (e.g., meeting details, contact info)
2. **Each action node** can reference outputs from ANY previous node in the chain
3. Variables use **mustache syntax**: `{{nodeId.fieldName}}`
4. The rich text editor (Lexical) provides **autocomplete** when you type `{{`

### Variable Types

| Type                      | Syntax               | Example                               |
| ------------------------- | -------------------- | ------------------------------------- |
| Simple value              | `{{1.contactEmail}}` | Insert the email from node 1's output |
| Nested property           | `{{1.company.name}}` | Access nested object properties       |
| Object reference (single) | `{{2.person.id}}`    | Reference an entity ID for lookups    |
| Object reference (multi)  | `{{2.people.ids}}`   | Reference multiple entity IDs         |

### Variable Grouping

Variables are grouped by their source node and labeled with the node's position and title:

- "1 - Meeting Trigger" → `{{1.attendees}}`, `{{1.summary}}`, `{{1.duration}}`
- "2 - Extract Signals" → `{{2.signals}}`, `{{2.confidence}}`
- "3 - Send Slack Message" → `{{3.messageId}}`, `{{3.timestamp}}`

### Variable Filtering

For **Object Reference** fields, variables are automatically filtered by compatible type:

- A "Person" reference field only shows variables that output person objects
- A "Company" reference field only shows company-typed outputs
- Supports both single and multi-select references

---

## Workflow Lifecycle

### Creation Flow

```
1. Click "Create Workflow" → Name + Description dialog
2. Select a Trigger → Integration sidebar → trigger card grid
3. Configure Trigger → Right-side sheet with dynamic form
4. Add Action → Click "+" below trigger node → action selection
5. Configure Action → Right-side sheet with dynamic form
6. Repeat 4-5 for additional actions
7. Connect nodes → Drag edges or auto-connect via "+"
8. Review validation → Check for ⚠️ warning icons
9. Activate → Toggle "Active" switch
```

### Node States (Visual Indicators)

| Badge      | Color  | Meaning                               |
| ---------- | ------ | ------------------------------------- |
| "Trigger"  | —      | This is the workflow's starting event |
| "Added"    | Green  | Node was just added (unsaved)         |
| "Modified" | Yellow | Node config has unsaved changes       |
| ⚠️ Warning | —      | Node has validation errors            |

### Execution & History

- **Test Run**: Execute workflow manually without a trigger event
- **Run History**: View per-node execution logs with inputs/outputs
- **Webhook History**: For webhook-triggered nodes, see request/response payloads
- **Error Tracking**: Failed nodes show error details in run history

---

## Recipes (Pre-Built Templates)

Workflows can be created from **Recipes** — pre-built templates for common automation patterns. These provide:

- Pre-configured trigger + action chains
- Sensible default configurations
- A starting point that users can customize

---

## Best Practices (SOP for Customers)

### 1. Start Simple, Then Layer

**Do this:**

- Build a 2-node workflow first (trigger → one action)
- Verify it works
- Add nodes one at a time

**Don't do this:**

- Build a 10-node workflow from scratch and wonder why it fails

### 2. Name Workflows Descriptively

**Good names:**

- "Post Meeting Summary to #sales-updates Slack Channel"
- "Create HubSpot Task When Action Item Assigned to Rep"
- "Alert CSM on Low Health Score Detection"

**Bad names:**

- "Workflow 1"
- "Test"
- "My Automation"

### 3. Use Variables Instead of Hardcoding

**Do this:**

```
Send message to: {{1.attendee.email}}
Subject: Meeting follow-up: {{1.meeting.title}}
```

**Don't do this:**

```
Send message to: john@company.com
Subject: Meeting follow-up: Q4 Planning
```

### 4. Validate Before Activating

- Check every node for ⚠️ warning icons
- Run a test execution
- Review test output in run history
- Only then toggle Active

### 5. Handle Edge Cases

Consider what happens when:

- The trigger fires but the referenced entity doesn't exist
- A CRM field is empty or has unexpected data
- The AI model returns low-confidence results
- A Slack channel has been archived
- Rate limits are hit on external APIs

### 6. Use Object References for Dynamic Lookups

Instead of hardcoding IDs, use object references to dynamically resolve entities:

- "Update the company that was mentioned in the meeting" (uses object reference from Signal extraction)
- "Assign task to the meeting organizer" (uses person reference from trigger output)

### 7. Monitor Active Workflows

- Check run history periodically for failures
- Set up a "meta-workflow" that alerts on workflow errors
- Review workflow activity after integration changes (new CRM fields, Slack workspace changes)

---

## Common Patterns (Workflow Recipes to Document)

### Pattern 1: Post-Meeting Intelligence → CRM

```
Trigger: Meeting Ended (Elephant)
  → Action 1: Extract Signals (Elephant AI)
  → Action 2: Generate Meeting Summary (Elephant AI)
  → Action 3: Update Deal Notes (HubSpot)
  → Action 4: Create Follow-Up Task (HubSpot)
  → Action 5: Post Summary to Slack (Slack)
```

### Pattern 2: Customer Health Alert

```
Trigger: Health Score Changed (Elephant)
  → Action 1: Check if score < threshold
  → Action 2: Send Alert to CSM Slack Channel (Slack)
  → Action 3: Create Escalation Ticket (Linear)
  → Action 4: Update CRM Risk Field (HubSpot)
```

### Pattern 3: Signal-Driven Outreach

```
Trigger: Signal Extracted (Elephant)
  → Action 1: Check Signal Type (condition)
  → Action 2: Draft Follow-Up Email (AI Prompt)
  → Action 3: Create Task for Rep (HubSpot)
  → Action 4: Log Activity (CRM)
```

### Pattern 4: Meeting Prep Automation

```
Trigger: Calendar Event Created (Google)
  → Action 1: Lookup Attendee Companies (Elephant)
  → Action 2: Pull Recent Engagements (Elephant)
  → Action 3: Generate Prep Brief (AI Prompt + Knowledge Base)
  → Action 4: Send Prep to Organizer (Slack DM)
```

### Pattern 5: Action Item Follow-Through

```
Trigger: Action Item Created (Elephant)
  → Action 1: Assign to Mentioned Person (Elephant)
  → Action 2: Create CRM Task (HubSpot)
  → Action 3: Send Reminder in Slack (Slack)
  → Action 4: Schedule Follow-Up Check (Calendar)
```

---

## Deliverable Requirements

### What the Elephant AI team should produce:

1. **Main Article: "Getting Started with Workflows"**
   - Zero-to-working-workflow walkthrough with screenshots
   - 10-minute target completion time
   - Include a simple recipe (e.g., "Post meeting summary to Slack")

2. **Reference Article: "Workflow Actions & Configuration Reference"**
   - Complete table of all 33 form renderers with descriptions
   - Organized by category (Text, Selection, Entity, CRM, Complex)
   - Include examples for each control type

3. **Guide: "Using Variables in Workflows"**
   - The variable system explained with visual examples
   - Mustache syntax reference
   - Object reference patterns
   - Common variable chains

4. **Guide: "Workflow Best Practices & Troubleshooting"**
   - The 7 best practices above, expanded with screenshots
   - Troubleshooting section for common errors
   - FAQ: "Why isn't my workflow firing?" etc.

5. **Article: "Workflow Recipes & Templates"**
   - The 5 patterns above, fully documented
   - Step-by-step recreation instructions
   - Suggested customizations for each pattern

### Quality Bar

- **Stripe-level documentation quality**: Clear, scannable, technically precise
- **Progressive disclosure**: Start simple, reveal complexity only when needed
- **Real examples**: Every concept illustrated with a concrete use case
- **Visual-first**: Diagrams, screenshots, and flow illustrations where possible
- **Searchable**: Headers, keywords, and metadata for help center search
- **Versioned**: Note which integrations/features require which plan tier

---

## Source Code Reference

For the Elephant AI team building these docs, here are the exact files to reference:

| Component                | Path                                                                    |
| ------------------------ | ----------------------------------------------------------------------- |
| Workflow creation dialog | `apps/web/src/components/workflows/workflow-form-dialog.tsx`            |
| Trigger selection        | `apps/web/src/components/workflows/workflow-triggers-dialog.tsx`        |
| Action selection         | `apps/web/src/components/workflows/workflow-actions-dialog.tsx`         |
| Canvas nodes             | `apps/web/src/components/workflows/workflow-nodes.tsx`                  |
| Node state visuals       | `apps/web/src/components/workflows/workflow-state-node.tsx`             |
| Node configuration sheet | `apps/web/src/components/workflows/workflow-node-sheet.tsx`             |
| All 33 form renderers    | `apps/web/src/components/workflows/form-renderers/`                     |
| Variable autocomplete    | `apps/web/src/components/workflows/form-renderers/lexical-input.tsx`    |
| Object references        | `apps/web/src/components/workflows/form-renderers/object-reference.tsx` |
| GraphQL operations       | `apps/web/src/components/workflows/workflowHookUtils.ts`                |
| Workflow context         | `apps/web/src/components/workflows/workflow-context.tsx`                |
| Recipes                  | `apps/web/src/components/workflows/workflow-recipes.tsx`                |
| Run history              | `apps/web/src/components/workflows/workflow-run-steps-drawer.tsx`       |

---

## Timeline & Priority

- **P0**: Getting Started article (unblocks onboarding)
- **P1**: Variables guide + Best Practices (reduces support tickets)
- **P2**: Configuration reference (power user enablement)
- **P3**: Recipes article (drives adoption of advanced patterns)

Estimated effort: 3-5 days for a technical writer with codebase access.

---

_Generated from AskElephant codebase analysis on February 9, 2026. All feature details sourced from production code in `elephant-ai/apps/web/src/components/workflows/`._
