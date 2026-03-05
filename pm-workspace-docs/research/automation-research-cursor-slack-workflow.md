# Cursor + Slack PM Workflow Automation Research

> **Date**: January 7, 2026  
> **Author**: AI Research Assistant  
> **Status**: Deep Research Complete  

## TL;DR

You can automate your PM workflow (research → PM → prototype) using **Cursor's native Slack integration** combined with **Storybook auto-deployment**. The key insight is that Cursor Background Agents can be triggered directly from Slack by mentioning `@Cursor`, and Storybook can be auto-deployed to generate shareable preview URLs.

---

## Executive Summary

Your desired flow:
```
AskElephant Conversation Completes
        ↓
Webhook triggers Slack message
        ↓
Slack prompts: "Run research/PM/prototype?"
        ↓
You respond (mobile-friendly)
        ↓
@Cursor executes commands in your repo
        ↓
Storybook deploys automatically
        ↓
Slack sends you interactive prototype link
```

**Feasibility**: ✅ **Fully achievable** with existing tools

---

## Architecture Options

### Option 1: Native Cursor + Slack Integration (Recommended)

**How it works:**
- Cursor has a first-party Slack integration that lets you trigger Background Agents by mentioning `@Cursor` in Slack
- You can write prompts like `@Cursor run the research command for the HubSpot config UI initiative`
- Cursor executes the command against your repo and reports back in Slack

**Requirements:**
1. Cursor Pro/Business subscription (Background Agents feature)
2. GitHub repository connected to Cursor
3. Slack workspace with Cursor app installed

**Setup Steps:**
1. Go to Cursor Settings → Integrations
2. Click "Connect" next to Slack
3. Install Cursor app in your Slack workspace
4. Connect your GitHub repository
5. Configure privacy settings

**Pros:**
- Native integration, no middleware required
- Works directly from Slack (mobile-friendly)
- Uses your existing Cursor rules and commands
- Background Agents run independently

**Cons:**
- Requires Cursor subscription with Background Agents
- Commands are text-based (not button-based)
- No visual workflow builder

---

### Option 2: Orchestrated Workflow (n8n/Zapier)

**How it works:**
- Use n8n (self-hosted) or Zapier (SaaS) as the orchestration layer
- AskElephant sends webhook → n8n receives → sends Slack message with buttons → user clicks → triggers Cursor via Slack → monitors completion → triggers next step

**Components:**
1. **Webhook receiver**: n8n or Zapier catches AskElephant completion events
2. **Slack bot**: Sends interactive messages with button options
3. **Cursor trigger**: Uses `@Cursor` mention to trigger Background Agents
4. **Completion monitor**: Watches for Cursor completion signals
5. **Prototype deployer**: Triggers Storybook build/deploy
6. **Notification sender**: Sends prototype URL back to Slack

**n8n Workflow Example:**
```
Webhook Trigger (AskElephant)
    ↓
Parse conversation metadata
    ↓
Create Slack message with buttons:
  [Research] [PM] [Prototype] [Skip]
    ↓
Wait for button click
    ↓
If Research: Send "@Cursor research for {initiative}"
    ↓
Wait for completion
    ↓
If PM: Send "@Cursor PM for {initiative}"
    ↓
Wait for completion
    ↓
If Prototype: Send "@Cursor prototype for {initiative}"
    ↓
Trigger Storybook deploy
    ↓
Send prototype URL to Slack
```

**Pros:**
- Visual workflow builder
- Interactive buttons in Slack (better UX)
- Sequential workflow handling
- Custom logic and conditions
- Can add approval steps

**Cons:**
- Additional service to maintain
- More complex setup
- Potential cost (Zapier) or self-hosting (n8n)

---

### Option 3: AskElephant Native Workflows

**How it works:**
- Use AskElephant's built-in Workflows Beta feature
- Configure triggers that fire when conversations complete
- Send Slack notifications directly from AskElephant
- Use Slack's Workflow Builder for the interactive part

**Components:**
1. AskElephant Workflow trigger on conversation completion
2. AskElephant Slack integration for notifications
3. Slack Workflow Builder for interactive responses
4. Cursor Slack integration for command execution

**Pros:**
- Uses your existing AskElephant investment
- Native integration, less middleware
- Built-in context from conversations

**Cons:**
- Beta feature (may change)
- Less flexibility for custom orchestration

---

## Prototype Hosting & Sharing

### Option A: Chromatic (Recommended for Storybook)

**What it is:** Chromatic is Storybook's official cloud platform for visual testing and hosting.

**How it works:**
1. Add Chromatic to your GitHub Actions
2. On push/PR, Chromatic builds and publishes Storybook
3. Generates unique preview URL for each build
4. URL can be sent via webhook/Slack

**Implementation:**
```yaml
# .github/workflows/chromatic.yml
name: Chromatic

on:
  push:
    paths:
      - 'prototypes/**'

jobs:
  chromatic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
      - run: cd prototypes && pnpm install
      - run: cd prototypes && pnpm build-storybook
      - uses: chromaui/action@latest
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          storybookBuildDir: prototypes/storybook-static
```

**Slack Notification:**
Add a step to send the Chromatic URL to Slack:
```yaml
      - name: Notify Slack
        uses: slackapi/slack-github-action@v1.27.0
        with:
          channel-id: 'C123456'
          slack-message: "🎨 New prototype ready: ${{ steps.chromatic.outputs.storybookUrl }}"
```

**Cost:** Free tier includes 5,000 snapshots/month

---

### Option B: Vercel Preview Deployments

**What it is:** Auto-deploy Storybook to Vercel on every push/PR.

**How it works:**
1. Connect prototypes folder to Vercel
2. Configure build command: `cd prototypes && pnpm build-storybook`
3. Vercel auto-generates preview URLs for branches/PRs
4. GitHub integration posts URL to PR or can trigger webhook

**Implementation:**
```json
// prototypes/vercel.json
{
  "buildCommand": "pnpm build-storybook",
  "outputDirectory": "storybook-static",
  "installCommand": "pnpm install"
}
```

**Pros:**
- Fast deployments
- Preview URLs for every change
- GitHub integration
- Free tier generous

**Cons:**
- Additional service
- Not Storybook-specific (no visual testing)

---

### Option C: StackBlitz/CodeSandbox (Instant Prototypes)

**What it is:** Browser-based IDEs that can load projects from GitHub.

**How it works:**
1. Push prototype code to repo
2. Generate StackBlitz URL: `https://stackblitz.com/github/your-org/repo/tree/branch/prototypes`
3. Share URL - opens instantly in browser
4. No deploy step needed

**Pros:**
- Zero deploy time
- Interactive editing in browser
- Works on mobile (limited)

**Cons:**
- Slower initial load
- Less polished for end-user review
- Mobile experience not ideal

---

## Recommended Implementation Plan

### Phase 1: Foundation (Week 1)

1. **Enable Cursor + Slack Integration**
   - Connect Cursor to Slack
   - Connect GitHub repo to Cursor
   - Test `@Cursor` commands from Slack

2. **Set Up Chromatic**
   - Create Chromatic account
   - Add GitHub Action for auto-deploy
   - Configure Slack notifications

3. **Create AskElephant Webhook**
   - Enable Workflows Beta in AskElephant
   - Create trigger on conversation completion
   - Configure Slack notification

### Phase 2: Workflow Automation (Week 2)

4. **Set Up n8n (or Zapier)**
   - Install n8n (Docker recommended) or create Zapier account
   - Create webhook endpoint for AskElephant
   - Build interactive Slack message workflow

5. **Create Command Templates**
   - Standardize your Cursor command prompts
   - Create templates for research, PM, prototype
   - Test each workflow end-to-end

### Phase 3: Polish (Week 3)

6. **Add Completion Detection**
   - Monitor for Cursor completion signals
   - Chain workflows automatically
   - Add error handling

7. **Mobile Optimization**
   - Test full flow from mobile Slack
   - Adjust message formatting
   - Add quick-reply options

---

## Technical Implementation Details

### Cursor Command Templates

For consistency, create standardized prompts for Slack:

```
@Cursor Please run the research workflow for the {initiative_name} initiative.
Read the transcript at .pm-workspace/knowledge-base-sync/{file}.md and:
1. Extract key decisions and action items
2. Identify user problems with verbatim quotes
3. Save analysis to .pm-workspace/initiatives/{initiative_name}/research.md
```

```
@Cursor Please run the PM workflow for the {initiative_name} initiative.
Read the research at .pm-workspace/initiatives/{initiative_name}/research.md and:
1. Create or update the PRD
2. Ensure company context is referenced
3. Document open questions
```

```
@Cursor Please run the prototype workflow for the {initiative_name} initiative.
Read the PRD at .pm-workspace/initiatives/{initiative_name}/prd.md and:
1. Create components in prototypes/src/components/{ComponentName}/
2. Include Storybook stories
3. Document migration notes
Then commit and push to trigger Chromatic deployment.
```

### Slack Interactive Message Format

Using Slack's Block Kit for better UX:

```json
{
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "🐘 AskElephant: Conversation Complete"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Meeting:* HubSpot Config UI Discussion\n*Duration:* 45 min\n*Participants:* James Hinkson, Tyler Sahagun"
      }
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": { "type": "plain_text", "text": "🔬 Research" },
          "value": "research_hubspot-config-ui",
          "action_id": "run_research"
        },
        {
          "type": "button",
          "text": { "type": "plain_text", "text": "📋 PM" },
          "value": "pm_hubspot-config-ui",
          "action_id": "run_pm"
        },
        {
          "type": "button",
          "text": { "type": "plain_text", "text": "🎨 Prototype" },
          "value": "prototype_hubspot-config-ui",
          "action_id": "run_prototype"
        },
        {
          "type": "button",
          "text": { "type": "plain_text", "text": "⏭️ Skip" },
          "value": "skip",
          "action_id": "skip_workflow"
        }
      ]
    }
  ]
}
```

### n8n Workflow Configuration

```json
{
  "name": "AskElephant to Cursor PM Workflow",
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "askelephant-complete",
        "httpMethod": "POST"
      }
    },
    {
      "name": "Send Slack Buttons",
      "type": "n8n-nodes-base.slack",
      "parameters": {
        "operation": "postMessage",
        "channel": "#pm-workflows",
        "blocksUi": "{{ $json.slackBlocks }}"
      }
    },
    {
      "name": "Wait for Response",
      "type": "n8n-nodes-base.wait",
      "parameters": {
        "resume": "webhook"
      }
    },
    {
      "name": "Trigger Cursor",
      "type": "n8n-nodes-base.slack",
      "parameters": {
        "operation": "postMessage",
        "channel": "#cursor-commands",
        "text": "@Cursor {{ $json.cursorCommand }}"
      }
    }
  ]
}
```

---

## Cost Estimates

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Cursor Pro | N/A | $20/month (includes Background Agents) |
| Chromatic | 5,000 snapshots/mo | $149/mo for more |
| n8n | Self-hosted (free) | Cloud: $20/mo |
| Zapier | 100 tasks/mo | $20/mo for 750 |
| Vercel | Hobby (free) | Pro: $20/mo |
| Slack | Free | Standard: $8.75/user/mo |

**Recommended Stack Cost**: ~$20-40/month (Cursor Pro required)

---

## Alternative: Fully Custom Solution

If you want maximum control, you could build a custom solution:

1. **Custom Slack Bot** (Node.js + Bolt SDK)
   - Receives webhooks from AskElephant
   - Sends interactive messages
   - Handles button clicks

2. **Claude API for Code Generation**
   - Use Claude API directly instead of Cursor
   - Headless operation, fully programmable
   - Can generate code, commit to GitHub

3. **GitHub Actions for Orchestration**
   - Trigger workflows via repository dispatch
   - Build and deploy Storybook
   - Post results to Slack

**Pros:** Maximum flexibility, no Cursor dependency
**Cons:** Significant development effort, maintenance burden

---

## Recommendations

### For Quick Start (1-2 weeks):
1. Set up **Cursor + Slack integration**
2. Add **Chromatic** for prototype hosting
3. Use **AskElephant workflows** for initial triggers
4. Manually chain commands initially

### For Full Automation (3-4 weeks):
1. Everything above, plus:
2. Add **n8n** for orchestration
3. Build **interactive Slack messages**
4. Create **command templates**
5. Add **completion monitoring**

### For Maximum Flexibility (6+ weeks):
1. Build **custom Slack bot**
2. Integrate **Claude API** directly
3. Create **GitHub Actions workflows**
4. Build **dashboard for monitoring**

---

## Next Steps

1. [ ] Verify Cursor subscription includes Background Agents
2. [ ] Connect Cursor to Slack workspace
3. [ ] Test `@Cursor` commands from Slack
4. [ ] Set up Chromatic for prototypes folder
5. [ ] Configure AskElephant webhook trigger
6. [ ] Choose orchestration approach (n8n vs native)
7. [ ] Build and test full workflow

---

## Resources

- [Cursor Slack Integration Docs](https://docs.cursor.com/slack)
- [Chromatic Quick Start](https://www.chromatic.com/docs/setup)
- [n8n Slack Integration](https://n8n.io/integrations/webhook/and/slack/)
- [Slack Block Kit Builder](https://app.slack.com/block-kit-builder)
- [AskElephant Workflows](https://help.askelephant.ai/en/articles/11571180-integrations-workflow-set-up)
- [Zapier Cursor Integration](https://zapier.com/apps/cursor-ca228182/integrations/slack)

---

## Open Questions

1. Does your Cursor subscription include Background Agents?
2. Do you have a preference for n8n (self-hosted) vs Zapier (SaaS)?
3. Is Chromatic's free tier sufficient for your prototype volume?
4. How should the system handle errors/failures?
5. Do you need approval gates between workflow steps?

---

## Critical Update: Separating PM Work from Dev Repo

### The Problem

Cursor's Slack integration runs Background Agents against a **GitHub repository**, not local files. Your current setup has PM files gitignored in elephant-ai, meaning the Slack agent can't see them.

### The Solution: Separate Private PM Repository

Create a private repo specifically for PM work that includes elephant-ai as a submodule:

```
pm-workspace/                          # Your private repo
├── elephant-ai/                       # Git submodule (read-only reference)
├── .pm-workspace/                     # Your PM work
├── prototypes/                        # Storybook prototypes
└── .cursor/
    ├── commands/                      # PM commands
    └── rules/                         # PM rules
```

**Benefits:**
- ✅ Completely separate from elephant-ai (devs never see it)
- ✅ Full codebase access via submodule
- ✅ Works with Cursor Slack integration
- ✅ Private to you only

### Setup Script

Run the setup script to create this structure:

```bash
bash .pm-workspace/scripts/setup-pm-repo.sh
```

This will:
1. Create a new directory at `~/Source/pm-workspace`
2. Add elephant-ai as a git submodule
3. Copy your existing PM files
4. Set up Cursor commands and rules

### After Setup

1. Create a private GitHub repo
2. Push your PM workspace to it
3. Connect Cursor Slack to the new repo
4. Use `@Cursor` from Slack against the PM repo

