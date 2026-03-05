# Universal Agent — Workflow Node

> Run an AI agent with access to your connected apps, directly inside a workflow. The Universal Agent can read, write, and take actions across 30+ third-party services — Gmail, Slack, Google Sheets, Jira, Linear, Notion, HubSpot, and more — all without writing a single line of code.

---

## Table of Contents

1. [What Is the Universal Agent?](#what-is-the-universal-agent)
2. [Prerequisites](#prerequisites)
3. [Adding the Node to a Workflow](#adding-the-node-to-a-workflow)
4. [Configuring the Node](#configuring-the-node)
   - [Instructions Prompt](#1-instructions-prompt)
   - [AI Model](#2-ai-model)
   - [Max Steps](#3-max-steps)
   - [Chat Title](#4-chat-title-optional)
   - [Toolkits & Tools](#5-toolkits--tools)
5. [Connecting Toolkits (OAuth)](#connecting-toolkits-oauth)
6. [Selecting Individual Tools](#selecting-individual-tools)
7. [Outputs](#outputs)
8. [How It Works Under the Hood](#how-it-works-under-the-hood)
9. [Example Workflows](#example-workflows)
10. [Testing Your Workflow](#testing-your-workflow)
11. [Debugging & Troubleshooting](#debugging--troubleshooting)
12. [Limits & Best Practices](#limits--best-practices)
13. [FAQ](#faq)

---

## What Is the Universal Agent?

The **Universal Agent** is a workflow action node that spins up a full AI agent at runtime. Unlike the simpler "Run Prompt" node (which generates text only), the Universal Agent can:

- **Take real actions** in third-party apps (create a Jira ticket, send a Slack message, update a Google Sheet row)
- **Read data** from connected services (fetch a Linear issue, search Gmail, list Notion pages)
- **Chain multiple tool calls** in a single run, reasoning about what to do next at each step
- **Produce a persistent conversation** in AskElephant that you can review, share, and continue later

Think of it as giving your workflow a personal assistant that can operate your connected apps on your behalf.

---

## Prerequisites

Before using the Universal Agent, make sure the following are in place:

### 1. Feature Flag Enabled

The Universal Agent is gated behind the **`COMPOSIO_ENABLED`** feature flag. If you don't see the node in the workflow builder, contact your workspace admin to have it enabled.

> **How to check:** When adding a new action node in the workflow builder, search for "Universal Agent." If it doesn't appear, the feature flag is not enabled for your workspace.

### 2. Workspace Owner Permissions (for connecting toolkits)

Connecting a new toolkit to your workspace (e.g., linking your Slack or Google Sheets account) requires **Owner** permissions on the workspace. Once a toolkit is connected by an owner, any workspace member can use it in their workflows.

### 3. Connected Toolkits

At least one toolkit must be connected before the Universal Agent can interact with external services. Toolkits that require no authentication (like `codeinterpreter` or `composio_search`) work immediately without connection.

---

## Adding the Node to a Workflow

1. Open the **Workflow Builder** from the AskElephant sidebar.
2. Create a new workflow or edit an existing one.
3. Click the **"+"** button on any node to add a new action.
4. In the action picker, search for **"Universal Agent"** (found under the **AskElephant** integration category).
5. Click it to add the node to your workflow canvas.

---

## Configuring the Node

When you select the Universal Agent node, a configuration panel opens on the right side. Here is every field explained:

### 1. Instructions Prompt

**What it is:** The natural-language instruction telling the agent what to do.

**How to write it:** Be specific and explicit. The agent only knows what you tell it — it has no implicit context from earlier workflow nodes unless you pass data in via template variables.

**Template variables:** Use `{{$nodeId.propertyPath}}` syntax to inject data from previous workflow nodes. For example:

```
Summarize the following meeting transcript and create a Jira ticket with the key action items:

Meeting Transcript:
{{$trigger.meetingTranscript}}

Attendees:
{{$trigger.attendeeNames}}
```

> **Important:** The Universal Agent has NO implicit context. If you need meeting data, CRM fields, or any other information from earlier nodes, you must explicitly pass it into the instructions prompt using template references.

### 2. AI Model

**What it is:** The language model that powers the agent's reasoning.

**Options:** Select from the available models in your workspace. The default model is recommended for most use cases.

**When to change it:**
- Use a more capable model (e.g., Claude Sonnet, GPT-4o) for complex multi-step reasoning
- Use a faster model for simple, single-action tasks

### 3. Max Steps

**What it is:** The maximum number of tool-call steps the agent can take before it must return a response.

**Default:** 10 steps

**Range:** 1–20 steps

**How to think about it:**
| Steps | Good for |
|-------|----------|
| 1–3   | Simple single-action tasks ("Send this Slack message") |
| 5–10  | Multi-step tasks ("Find the issue, update it, then notify the channel") |
| 10–20 | Complex reasoning chains ("Analyze data across multiple sources, synthesize, and take action") |

> **Tip:** Start with 10 and increase only if you see the agent being cut off mid-task. Higher values consume more tokens and take longer to execute.

### 4. Chat Title (optional)

**What it is:** A human-readable name for the conversation that gets created.

**Default:** If left empty, AskElephant generates a title automatically based on the conversation content.

**When to set it:** Set a title when you want to easily find and organize agent conversations later, e.g., `"Weekly Pipeline Sync — {{$trigger.meetingTitle}}"`.

### 5. Toolkits & Tools

**What it is:** The external services and specific actions the agent is allowed to use during its run.

This is the most important configuration section. It controls which apps the agent can access and what operations it can perform.

**How toolkits work:**

- A **toolkit** represents a third-party service (e.g., "Slack", "Google Sheets", "Jira")
- Each toolkit contains many **tools** — individual actions like "Send Message", "Create Issue", "Update Row"
- You enable toolkits first, then optionally narrow down to specific tools within each toolkit

---

## Connecting Toolkits (OAuth)

Before you can enable a toolkit, it must be **connected** to your workspace. Here's how:

### Step-by-Step Connection

1. In the Universal Agent configuration panel, scroll to the **"Toolkits & Tools"** section.
2. You'll see a list of available toolkits. Each shows one of three states:
   - **"Connected"** — Ready to use. Toggle the switch to enable it.
   - **"Not connected"** — Requires OAuth setup. Click **"Connect"** to start.
   - **"No auth required"** — Works immediately. Toggle the switch to enable it.
3. Clicking **"Connect"** opens an OAuth popup window where you authorize AskElephant to access that service.
4. After authorizing, close the popup. The toolkit status updates to "Connected."

### Available Toolkits

The following toolkits can be connected at the workspace level:

| Toolkit | Auth Required | Description |
|---------|:---:|-------------|
| **Airtable** | Yes | Manage bases, tables, and records |
| **Ashby** | Yes | ATS operations (candidates, jobs) |
| **ClickUp** | Yes | Task and project management |
| **Dropbox** | Yes | File storage and sharing |
| **Figma** | Yes | Design file access and comments |
| **GitHub** | Yes | Repos, issues, PRs, actions |
| **Google Docs** | Yes | Create and edit documents |
| **Google Drive** | Yes | File management and search |
| **Google Sheets** | Yes | Spreadsheet read/write |
| **Intercom** | Yes | Customer messaging |
| **Jira** | Yes | Issue tracking and project management |
| **Linear** | Yes | Issue tracking (engineering) |
| **Notion** | Yes | Pages, databases, and blocks |
| **OneDrive** | Yes | Microsoft file storage |
| **Outlook** | Yes | Email (Microsoft 365) |
| **PandaDoc** | Yes | Document creation and e-signatures |
| **Slack** | Yes | Messaging and channels |
| **Trello** | Yes | Boards, lists, and cards |
| **Zendesk** | Yes | Support tickets |
| **Gamma** | Yes | Presentation creation |
| **Code Interpreter** | No | Execute Python/JS code |
| **Composio Search** | No | Web search via Composio |
| **Text to PDF** | No | Convert text to PDF documents |

> **Note:** Some toolkits (Gmail, Google Calendar, Google Tasks, Google Meet, LinkedIn, Twitter, Reddit) are available for user-level chat interactions but are **not available** for workspace-level workflow automations due to auth scoping.

---

## Selecting Individual Tools

After enabling a toolkit, you can optionally restrict which tools the agent has access to:

### Step-by-Step Tool Selection

1. Enable a toolkit by toggling its switch to **on**.
2. A badge appears showing **"Tools enabled: 0"** and a **"Manage tools"** button.
3. Click **"Manage tools"** to open the tool selection dialog.
4. In the dialog:
   - **Search** for specific tools by name using the search bar
   - **Check/uncheck** individual tools to enable or disable them
   - Use **"Select all visible"** to enable all tools currently shown
   - Use **"Clear visible"** to deselect all visible tools
   - Click **"Load more"** if the toolkit has more tools than initially displayed (pagination loads 50 at a time)
5. Close the dialog. Your selections are saved automatically.

### Should You Restrict Tools?

| Scenario | Recommendation |
|----------|---------------|
| Agent needs broad access | Leave all tools enabled (0 selected = all available) |
| Agent should only read, not write | Select only read/list/search tools |
| Precise automation (e.g., "only create Jira issues") | Select only the specific tool(s) needed |
| Security-sensitive workflow | Restrict to the minimum tools required |

> **When "Tools enabled: 0":** If you enable a toolkit but select zero specific tools, the agent has access to **all** tools in that toolkit. This is the default behavior. To restrict, explicitly select the tools you want.

---

## Outputs

After the Universal Agent finishes executing, it produces three outputs that downstream workflow nodes can reference:

| Output | Type | Description |
|--------|------|-------------|
| `conversation` | Object Reference | A reference to the AskElephant conversation that was created. Can be passed to subsequent "Send Message to Conversation" or "Attach Documents" nodes. |
| `conversationLink` | String (URL) | A direct, clickable link to the conversation in the AskElephant web app. Useful for including in Slack messages, emails, or notifications. |
| `agentResponse` | String (Text) | The final text response from the agent. This is the agent's summary or answer after completing all tool calls. |

### Referencing Outputs in Downstream Nodes

Use template syntax to pass Universal Agent outputs to later nodes:

```
{{$universalAgentNodeId.agentResponse}}
```

```
View the full conversation: {{$universalAgentNodeId.conversationLink}}
```

---

## How It Works Under the Hood

Understanding the execution flow helps you write better prompts and debug issues:

```
┌─────────────────────────────────────────────────────┐
│  1. Workflow triggers Universal Agent node           │
├─────────────────────────────────────────────────────┤
│  2. A new AskElephant conversation is created       │
├─────────────────────────────────────────────────────┤
│  3. Your instructions prompt is injected as a       │
│     user message (template variables resolved)      │
├─────────────────────────────────────────────────────┤
│  4. Composio MCP tools are initialized based on     │
│     your toolkit/tool configuration                 │
├─────────────────────────────────────────────────────┤
│  5. The AI model processes the message with access   │
│     to all enabled tools                            │
├─────────────────────────────────────────────────────┤
│  6. Agent reasons → calls tool → gets result →      │
│     reasons again → calls next tool → ...           │
│     (up to maxSteps iterations)                     │
├─────────────────────────────────────────────────────┤
│  7. Agent produces a final text response            │
├─────────────────────────────────────────────────────┤
│  8. Response is saved to conversation               │
├─────────────────────────────────────────────────────┤
│  9. Outputs (conversation, link, response) are      │
│     passed to the next workflow node                │
└─────────────────────────────────────────────────────┘
```

Key details:
- The user message (your prompt) is **hidden** in the conversation UI — only the agent's response is visible by default
- The conversation is linked to the workflow run, so you can always trace back
- If the agent encounters an error, the workflow halts and the error is surfaced in the run history
- The Composio MCP connection is automatically cleaned up after the agent finishes

---

## Example Workflows

### Example 1: Post-Meeting Action Items to Jira

**Trigger:** Meeting ends

**Nodes:**
1. **Trigger** → Meeting completed (provides transcript, attendees, title)
2. **Universal Agent** →
   - **Prompt:**
     ```
     You just attended a meeting titled "{{$trigger.meetingTitle}}".

     Here is the full transcript:
     {{$trigger.meetingTranscript}}

     Please:
     1. Extract all action items mentioned in the meeting
     2. For each action item, create a Jira issue in project "TEAM" with:
        - A clear title
        - The action item as the description
        - Priority based on urgency discussed
     3. Summarize what you created
     ```
   - **Toolkits:** Jira (enabled, with "Create Issue" tool selected)
   - **Max Steps:** 15
   - **Model:** Default

### Example 2: Weekly Slack Digest from Google Sheets

**Trigger:** Scheduled (every Monday at 9am)

**Nodes:**
1. **Trigger** → Scheduled trigger
2. **Universal Agent** →
   - **Prompt:**
     ```
     Pull the latest data from the "Sales Pipeline" Google Sheet.
     Summarize the top 5 deals by value and their current stage.
     Then post this summary to the #sales-updates Slack channel
     with a friendly Monday morning greeting.
     ```
   - **Toolkits:** Google Sheets + Slack
   - **Max Steps:** 10

### Example 3: Sync Linear Issues to Notion Database

**Trigger:** Manual run

**Nodes:**
1. **Universal Agent** →
   - **Prompt:**
     ```
     Fetch all Linear issues in the "Sprint 42" cycle that are
     marked as "Done." For each one, create a row in the Notion
     database "Sprint Log" with the issue title, assignee, and
     completion date.
     ```
   - **Toolkits:** Linear + Notion
   - **Max Steps:** 20

### Example 4: Create a Meeting Prep Document

**Trigger:** Calendar event starting in 1 hour

**Nodes:**
1. **Trigger** → Upcoming calendar event
2. **Universal Agent** →
   - **Prompt:**
     ```
     I have a meeting coming up: "{{$trigger.eventTitle}}"
     with {{$trigger.attendeeNames}}.

     Please:
     1. Search for any recent meetings with these attendees
     2. Create a Google Doc titled "Prep: {{$trigger.eventTitle}}"
     3. In the doc, include:
        - Key topics from previous meetings
        - Suggested talking points
        - Any open action items
     4. Share the doc link in your response
     ```
   - **Toolkits:** Google Docs + Google Drive
   - **Max Steps:** 12

---

## Testing Your Workflow

### Step 1: Use the Manual Run

1. Save your workflow.
2. Click **"Run Workflow"** (the play button) to trigger a manual test.
3. If the trigger requires input (e.g., a meeting), select a test meeting/contact/event.

### Step 2: Check the Run History

1. Navigate to the **"Runs"** tab of your workflow.
2. Click on the most recent run.
3. Expand each node step to see:
   - **Status** (success/failure)
   - **Input** (the resolved prompt with variables filled in)
   - **Output** (the agent's response, conversation link, etc.)
   - **Duration** (how long the step took)

### Step 3: Review the Conversation

1. Click the `conversationLink` from the Universal Agent output.
2. In the conversation view, you'll see:
   - The agent's response (visible by default)
   - Each tool call the agent made (expandable)
   - The tool call inputs and outputs (for debugging)

### Step 4: Verify External Actions

Check the target service to confirm the agent's actions took effect:
- Did the Jira ticket get created?
- Did the Slack message get posted?
- Is the Google Sheet updated?

---

## Debugging & Troubleshooting

### "Universal Agent is disabled for this workspace"

**Cause:** The `COMPOSIO_ENABLED` feature flag is not turned on for your workspace.

**Fix:** Contact your workspace administrator or AskElephant support to enable the feature flag.

### The agent didn't perform any actions

**Possible causes:**
1. **No toolkits enabled** — Check the node config and make sure at least one relevant toolkit is toggled on.
2. **Toolkit not connected** — The toolkit shows "Not connected." Click "Connect" and complete the OAuth flow.
3. **Prompt too vague** — The agent needs clear, specific instructions. Instead of "update the sheet," say "update row 5 of the 'Pipeline' sheet in the 'Q4 Planning' spreadsheet to set column C to 'Closed Won'."
4. **Max steps too low** — If the agent ran out of steps before completing, increase `maxSteps`.

### The agent took the wrong action

**Possible causes:**
1. **Too many tools enabled** — When the agent has hundreds of tools available, it may pick the wrong one. Restrict to only the tools needed.
2. **Ambiguous prompt** — Be specific about which app, which project, which channel.
3. **Missing context** — Remember, the agent has no implicit context. Pass in all necessary data via template variables.

### OAuth popup was blocked

**Fix:** Your browser blocked the popup. Allow popups for AskElephant's domain, then click "Connect" again.

### Tool call failed with an error

1. Open the conversation from the `conversationLink`.
2. Find the tool call that failed — it will show an error state.
3. Expand the tool call to see the input/output details.
4. Common causes:
   - **Permission denied** — The connected account doesn't have permission for that action in the third-party service
   - **Resource not found** — The issue, channel, or document referenced doesn't exist
   - **Rate limiting** — Too many API calls to the third-party service in quick succession

### Workflow run shows "Error" on the Universal Agent step

The workflow halts if the agent encounters an unrecoverable error. Check:
1. The run step details for the error message
2. The conversation (if created) for partial progress
3. Whether the connected toolkit's OAuth token has expired (reconnect if so)

---

## Limits & Best Practices

### Limits

| Limit | Value |
|-------|-------|
| Max tool-call steps per run | 20 |
| Instructions prompt | Supports mustache template variables |
| Toolkits per node | No hard limit (enable as many as needed) |
| Tools per toolkit | No hard limit (select as many as needed) |
| Conversation created per run | Exactly 1 |

### Best Practices

1. **Be explicit in your prompt.** The #1 cause of unexpected behavior is vague instructions. Tell the agent exactly what to do, in what order, and what the expected output looks like.

2. **Start with fewer tools, then expand.** Begin with just the tools you need. You can always add more later. Fewer tools = faster reasoning and fewer wrong turns.

3. **Use reasonable max steps.** Don't set max steps to 20 for a task that needs 3 calls. Higher steps = more cost and latency.

4. **Pass data explicitly.** The Universal Agent receives NO context from the workflow unless you pass it via `{{$nodeId.property}}` template references. Always wire in the data the agent needs.

5. **Name your conversations.** Set a descriptive `chatTitle` so you can find and audit agent runs later.

6. **Review runs regularly.** Check the workflow run history and agent conversations periodically to ensure the agent is performing as expected.

7. **Separate concerns.** If you need both reading and writing across many services, consider splitting into multiple Universal Agent nodes — one for data gathering and one for action-taking — to keep prompts focused.

8. **Test with manual runs first.** Before enabling automatic triggers, always test your workflow with a manual run to verify the agent behaves correctly.

---

## FAQ

**Q: How is the Universal Agent different from "Run Prompt"?**

"Run Prompt" is a text-in, text-out node — it generates text using an AI model but cannot take actions in external apps. The Universal Agent can call tools, interact with APIs, and perform real operations across connected services.

**Q: Can I use multiple Universal Agent nodes in one workflow?**

Yes. Each node creates its own conversation and operates independently. You can chain them — for example, one agent gathers data and the next agent takes action based on that data.

**Q: Does the Universal Agent work with my CRM (HubSpot/Salesforce)?**

The Universal Agent uses Composio toolkits for third-party integrations. For deep CRM operations, AskElephant also offers dedicated HubSpot and Salesforce workflow nodes that may be better suited. The Universal Agent is ideal for connecting services that don't have dedicated nodes.

**Q: Who can see the conversations created by the Universal Agent?**

Conversations are created within your AskElephant workspace. Any workspace member with access can view them. If the workflow is triggered by a specific user, the conversation is associated with that user.

**Q: What happens if a toolkit disconnects mid-workflow?**

The agent's tool calls to that toolkit will fail. The agent will report the error in its response. The workflow will halt. Reconnect the toolkit and re-run.

**Q: Is there a cost associated with each Universal Agent run?**

Yes. Each run consumes AI tokens based on the model used, the length of the prompt, the number of tool calls, and the response length. Longer multi-step runs with more tools consume more tokens.

**Q: Can the Universal Agent modify AskElephant data (contacts, companies, meetings)?**

The Universal Agent primarily operates on external services via Composio toolkits. It does not directly modify AskElephant CRM data — for that, use dedicated AskElephant workflow action nodes (e.g., "Update Contact", "Create Note").

---

*Last updated: February 2026*
