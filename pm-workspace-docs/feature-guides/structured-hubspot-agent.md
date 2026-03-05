# Structured HubSpot Agent

**Feature status:** Rolling out (workspace-dependent)  
**Availability:** AskElephant workspaces with HubSpot integration and Structured HubSpot Agent access

---

## Overview

Structured HubSpot Agent is a workflow action that updates HubSpot records using a clear, structured configuration instead of one long prompt. You define:

- Which HubSpot object(s) to update
- How to find the right record
- Which properties to write
- How each property should be generated
- Whether updates should require approval before writing

It can optionally use a meeting as context to extract property values from conversation content.

---

## Who it's for

- RevOps teams managing CRM hygiene and field consistency
- Sales leaders who need reliable post-call updates
- Revenue teams who want less manual HubSpot data entry
- Admins who need configurable automation with approval controls

---

## Preconditions and setup

Before using Structured HubSpot Agent, confirm:

1. Your workspace has an active HubSpot connection.
2. You can access Workflow Builder in AskElephant.
3. The Structured HubSpot Agent action is available in your node/action list.
4. You know which HubSpot object and properties you want to update.
5. (Recommended) You start in a sandbox or test workflow before enabling broad automations.

If you do not see the action, contact your AskElephant admin or support to confirm feature access for your workspace.

---

## Where to find it

1. Open AskElephant.
2. Go to **Workflow Builder**.
3. Add a new action/node.
4. Select **Structured HubSpot Agent**.

---

## How it works (step-by-step)

1. **Add optional meeting context**
   - Choose a meeting when you want extraction based on call content.
   - Leave blank when you want non-meeting-based updates.

2. **Add an object configuration**
   - Set **Object type** (for example: deal, contact, company, or other HubSpot object type).
   - Add **Search instructions** describing how the agent should find the right record.
   - Optionally enable **Create if not found**.

3. **Configure one or more properties**
   - Select the property name.
   - Add per-property instructions for how to extract or generate the value.
   - Optionally enable **Read before write** to include current value context.
   - Optionally add **Additional properties for context** to improve extraction quality.
   - Choose **Update method**:
     - **Replace**: overwrite existing value
     - **Append**: add to existing value
   - Optionally enable **Require confirmation** to pause for human approval.

4. **Repeat for additional object types**
   - You can configure multiple object types in one action.

5. **Run and review**
   - Execute the workflow.
   - Review update outcomes per object and per property.
   - If confirmation is required, approve pending updates before they sync.

---

## Configuration guidance (best practices)

- Start with 1 object + 1-2 high-confidence properties first.
- Keep search instructions explicit (for example, reference company/domain/deal context clearly).
- Use **Read before write** for fields where existing value should influence output.
- Use **Append** for additive notes/history fields; use **Replace** for canonical status fields.
- Turn on **Require confirmation** during rollout until confidence is high.
- Enable **Create if not found** only when you are comfortable with object creation behavior.

---

## Meeting-context extraction behavior

When a meeting is provided:

- The agent can use meeting context to generate property values from conversation content.
- Search and update logic can include meeting-derived context in object matching and value extraction.
- This is useful for post-call workflows (for example, updating deal notes, action fields, or qualification context).

When no meeting is provided:

- The action still runs using your object and property instructions, but without meeting-based extraction context.

---

## Common questions (FAQ)

**Do I need to write one giant prompt?**  
No. This action is designed for structured, per-property configuration.

**Can I update multiple objects in one action?**  
Yes. You can configure multiple object types and multiple properties per object.

**Can I avoid writing directly to HubSpot immediately?**  
Yes. Use **Require confirmation** for human-in-the-loop approval.

**What happens if no matching record is found?**  
If **Create if not found** is enabled, the action can create a record; otherwise it will return no-match behavior in results.

**Can I preserve existing text and add new details?**  
Yes. Use **Append** update method.

**Can I use this without a meeting?**  
Yes. Meeting context is optional.

---

## Troubleshooting

**I don't see Structured HubSpot Agent in Workflow Builder**

- Confirm workspace feature access and rollout status with your admin/support.
- Confirm HubSpot integration is connected for the workspace.

**Updates show success but HubSpot did not change**

- Check for expired HubSpot auth and reconnect if needed.
- Review whether updates are pending confirmation.
- Confirm property names are valid and writable for the selected object type.

**Wrong record was updated**

- Tighten search instructions.
- Add clearer identifying context in your search criteria.
- Test in a low-risk workflow before broad rollout.

**No values are being extracted from meetings**

- Confirm a meeting was actually passed into the action.
- Make per-property instructions more specific.
- Add read-context fields to improve extraction quality.

**Unexpected duplicates**

- Review when **Create if not found** is enabled.
- Strengthen matching/search instructions before allowing create behavior.

---

## Release notes snapshot

Recent related implementation and rollout evidence:

- PR: [first pass for structured hubspot agent action](https://github.com/AskElephant/elephant-ai/pull/5007)
- PR: [Palmer/ask 4480 workflow action for configurable updates](https://github.com/AskElephant/elephant-ai/pull/4948)
- PR: [Include AI reasoning in structured HubSpot agent output](https://github.com/AskElephant/elephant-ai/pull/5582)
- PR: [Moved the strucutred HubSpot node into its own FF](https://github.com/AskElephant/elephant-ai/pull/5710)
- Linear: [ASK-5423 UX for the HubSpot structured agent](https://linear.app/askelephant/issue/ASK-5423/ux-for-the-hubspot-structured-agent)
- Linear: [ASK-5390 Bug: Structured HubSpot Agent Not Writing Notes to HubSpot](https://linear.app/askelephant/issue/ASK-5390/bug-structured-hubspot-agent-not-writing-notes-to-hubspot)
- Slack signal summary documenting shipped status and configuration scope: [sig-2026-01-26-hubspot-salesforce-update](../signals/transcripts/2026-01-26-hubspot-salesforce-update.md)

---

## Known limitations and edge cases

- Feature access may still be workspace-dependent during rollout.
- HubSpot authentication expiry can cause write failures until reconnected.
- Misconfigured search instructions can match incorrect objects.
- Enabling **Create if not found** can create unintended records if matching logic is too broad.
- Property update success depends on valid HubSpot object/property compatibility and permissions.
- Some trust features (such as deeper preview/diff and richer audit controls) are still evolving.

---

## Assumptions

- The feature displayed in your screenshot corresponds to the backend action named **Structured HubSpot Agent**.
- Your support audience is using Workflow Builder (not legacy prompt-only HubSpot node flows).

---

## Evidence gaps

- A single canonical public-facing "GA completed for all workspaces" source was not found; evidence indicates rollout and feature-flag transition activity.
- End-user UI labels/flows can vary by workspace version, so exact button text may differ slightly.

---

## Internal references

- Initiative: [structured-hubspot-agent-node](../initiatives/active/structured-hubspot-agent-node/)
- PRD: [HubSpot Agent Configuration UI PRD](../initiatives/active/structured-hubspot-agent-node/prd.md)
- Research summary: [HubSpot Agent Configuration UI research](../initiatives/active/structured-hubspot-agent-node/research.md)
- User interview: [2026-01-06 HubSpot agent configuration](../research/user-interviews/2026-01-06-hubspot-agent-configuration-james-hinkson.md)
- Engineering implementation: `elephant-ai/apps/functions/src/contexts/integrations/hubspot/actions.ts`
- Slack evidence permalink (release conversation): https://askelephant.slack.com/archives/C093P8NNJ01/p1771870644255069
- Slack evidence permalink (support error example): https://askelephant.slack.com/archives/C09HYDFST8E/p1771866199883839
