# HubSpot Sync

**Feature status:** Generally available  
**Availability:** AskElephant workspaces with an active HubSpot integration

---

## Overview

HubSpot Sync is AskElephant's post-meeting CRM update layer. After every recorded meeting, the AI agent reads the conversation and proposes a precise set of changes to your HubSpot records — creating new contacts, updating existing contacts, advancing deal fields, and logging meeting outcomes. These proposals appear inside the meeting page for you to review, edit if needed, and push to HubSpot with one click.

Nothing is written to HubSpot automatically. You stay in control of every field before it lands in your CRM.

---

## Who it's for

- **Sales reps and AEs** who spend time manually updating HubSpot after calls and want that work done for them
- **Sales leaders** who need deal fields (next steps, deal intelligence, close probability) kept current without chasing reps to update them
- **RevOps** who need consistent, structured CRM data without manual entry error
- **CSMs** managing post-call contact creation and account updates

---

## Where to find it

1. Open any meeting recording or engagement in AskElephant.
2. Look at the **left sidebar** inside the meeting page — you'll see a tab labeled **"HubSpot sync"**.
3. A badge on the tab shows the current state:
   - **Orange "Not updated"** — the AI has proposed changes that are waiting for your approval.
   - **Green "Updated"** — all proposed changes have been successfully pushed to HubSpot.

If you do not see the HubSpot sync tab, confirm your workspace has an active HubSpot integration. Contact your AskElephant admin if the tab is missing.

---

## How it works

### Step 1 — Meeting is processed

When AskElephant finishes processing a recorded meeting, the AI agent analyzes the transcript and determines what should change in HubSpot. This runs automatically — no action required.

### Step 2 — Review the proposed changes

Click the **"HubSpot sync"** tab in the sidebar. A card appears showing all proposed updates grouped by object type:

- **Created new contact** — a new HubSpot contact record that the AI identified from the conversation
- **Edited contact** — updates to an existing contact (location, channel, properties derived from the call)
- **Edited deal** — deal field updates including next steps, close date, deal intelligence fields (why they'll buy, risk factors, competitive positioning scores), seats, amount
- **Edited meeting** — meeting outcome, meeting type, internal notes

Each group includes:
- A link to the contact or deal inside AskElephant
- A **"View in HubSpot"** button to open the record directly in HubSpot
- A field-by-field diff showing the proposed change:
  - **Strikethrough text on stone/gray background** = the current value in HubSpot
  - **Blue highlighted text** = the new value the AI is proposing to write

Fields with a green check icon next to them are included in the approval batch.

### Step 3 — Edit values before approving (optional)

If any proposed value needs adjustment, click the **pencil icon** next to a field row. Edit the value inline and confirm. The corrected value replaces the AI's proposal. You can edit as many fields as needed before approving.

### Step 4 — Approve

**For update changes (edited contacts, deals, meetings):**  
Click **"Approve and update"** in the card footer. All proposed field updates are pushed to HubSpot simultaneously. The footer changes to confirm: _"All updates have been successfully pushed to HubSpot."_ The sidebar badge turns green ("Updated").

**For new record creation (created contacts):**  
Each new record card has its own **"Approve and create"** button. New records are approved individually, not in bulk.

### Step 5 — If something needs to be skipped

To skip a specific object without pushing it, use the **Reject** option on that card. The record is removed from the approval batch. If you change your mind, use **"Unreject"** to restore it to the review queue.

If a push fails (for example, due to an expired HubSpot authentication), a **Retry** button appears on the failed card.

---

## Common questions & answers

**Q: Does HubSpot sync push changes automatically after every meeting?**  
A: No. Every proposed change sits in a review state first. Nothing is written to HubSpot until you click "Approve and update" or "Approve and create."

**Q: How does the AI know which HubSpot deal or contact to update?**  
A: AskElephant matches participants in the meeting to existing HubSpot records using contact email and deal associations. If a participant is new, the AI proposes creating a contact rather than guessing at an existing record.

**Q: Can I change a proposed value before approving?**  
A: Yes. Click the pencil icon on any field row to edit the value inline. The edit takes effect immediately. Your edited value is what gets pushed when you approve.

**Q: What happens to fields the AI didn't fill in?**  
A: Only fields with proposed values appear in the sync card. Blank or unchanged fields are not included and won't be overwritten.

**Q: Can I push some updates and skip others?**  
A: Yes. Use the Reject button on any object card you want to skip. The remaining cards can still be approved.

**Q: What kinds of fields does the AI update on deals?**  
A: Standard HubSpot deal fields (deal stage, close date, amount, seats) plus custom deal intelligence fields configured for your workspace — including next steps, next step date, deal scoring fields like "Why will they buy?", "Why might this fail?", competitive positioning scores, and more.

**Q: Will the sync overwrite notes or text fields I already wrote?**  
A: The AI proposes a new value for each field. The diff view shows what is currently in HubSpot (strikethrough) alongside what the AI proposes (blue). You decide whether to approve or edit before anything is overwritten.

**Q: What if I just want to view the AI's analysis without pushing to HubSpot?**  
A: You can open the HubSpot sync card, read the proposed updates, and close it without taking action. No changes are made unless you click approve.

**Q: Is this the same as the Structured HubSpot Agent in Workflow Builder?**  
A: Related but distinct. The Structured HubSpot Agent is a workflow action you configure manually to run on specified properties. HubSpot Sync is the review UI shown at the meeting level that surfaces all the AI's proposed changes — whether they originated from a workflow agent node or from AskElephant's default post-meeting pipeline.

---

## Troubleshooting

**I don't see the HubSpot sync tab after a meeting:**
- Confirm your workspace has an active, connected HubSpot integration (check Settings → Integrations).
- The meeting may still be processing — wait a few minutes and reload.
- The tab may be hidden by a workspace-level feature flag. Contact your AskElephant admin.

**The badge shows "Not updated" but I already approved:**
- Reload the page. The badge state is pushed in real time via subscription but occasionally requires a refresh.
- Check the card footer — it may show individual field failures rather than a full success.

**I approved but the record didn't change in HubSpot:**
- Check whether your HubSpot connection has expired. Go to Settings → Integrations → HubSpot and reconnect.
- Verify the field name and property type are valid for the HubSpot object (some custom properties require specific permissions).
- Use the Retry button on failed cards after reconnecting auth.

**A new contact was created in HubSpot that I didn't want:**
- This happens only if you clicked "Approve and create" on a new contact card. Reject the card instead to prevent creation.
- If it was created accidentally, delete it directly in HubSpot.

**The AI proposed values that look wrong:**
- Edit the field inline before approving using the pencil icon.
- If you consistently see bad values for a specific field, this may indicate a workflow configuration issue — check the relevant Structured HubSpot Agent node in Workflow Builder for that field's extraction instructions.

**The "Edited deal" card is missing a field I expected:**
- Only fields with a proposed value appear. If the AI did not extract a value from the conversation for a field, it will not appear in the diff.
- Custom deal intelligence fields must be configured in your workspace's workflow to populate.

---

## Release notes snapshot

The HubSpot Sync review UI (ExternalObjectSync) was built as the human-in-the-loop approval layer for the integration push events system. Key milestones:

- **Integration push events infrastructure** — batch update and create event handling via Pub/Sub queue, enabling AI-proposed changes to queue as `IN_REVIEW` records before any HubSpot API writes
- **ExternalObjectSync review card** — the meeting-level sidebar card showing grouped diffs per object type with approve/reject/edit controls
- **Inline field editing** — pencil icon edit-before-approve flow, including automatic re-execution on edit
- **Per-object create approval** — individual approve/reject for new contact/company creation separate from bulk update approval
- **Retry and cancel states** — failure recovery via Retry button; cancel (Reject) per object with Unreject recovery
- **Real-time badge updates** — sidebar badge reflecting live sync status via GraphQL subscription
- **Salesforce parity** — the same ExternalObjectSync component and pipeline supports Salesforce in addition to HubSpot via adapter pattern

---

## Known limitations

- HubSpot sync only appears after a meeting has been fully processed by the AI pipeline. It is not available for meetings that failed to record or transcribe.
- The sync card is only visible on the web app (engagement page). It is not available from the mobile app.
- The "Approve and update" button approves all pending update events in bulk. There is no per-field approval toggle in the current UI (you can edit or reject whole object cards, but not selectively include/exclude individual fields within one object's card).
- If HubSpot authentication expires between when proposals are generated and when you click approve, writes will fail. Reconnect HubSpot and use Retry.
- Custom deal intelligence fields (deal scoring, competitive positioning, urgency plays) only appear in the sync card if the workspace workflow has been configured with Structured HubSpot Agent nodes targeting those fields.
- Availability depends on the workspace-level feature flag `push-event-visibility-component-hidden`. If this flag is enabled, the sidebar tab will not appear.

---

## Internal references

- **Initiative (Structured HubSpot Agent):** `pm-workspace-docs/initiatives/active/structured-hubspot-agent-node/`
- **PRD:** `pm-workspace-docs/initiatives/active/structured-hubspot-agent-node/prd.md`
- **Related feature guide (workflow configuration):** `pm-workspace-docs/feature-guides/structured-hubspot-agent.md`
- **Feature flag:** `push-event-visibility-component-hidden` (PostHog) — hides sidebar tab when enabled
- **Main card component:** `elephant-ai/apps/web/src/components/external-object-sync/external-object-sync.tsx`
- **Sidebar tab:** `elephant-ai/apps/web/src/components/chat/chats-tabs.tsx`
- **Field diff rendering:** `elephant-ai/apps/web/src/components/external-object-sync/property-types.tsx`
- **Create rendering:** `elephant-ai/apps/web/src/components/external-object-sync/create-property-types.tsx`
- **GraphQL mutations:**
  - `executeExternalObjectSyncForEngagement` — bulk approve all update events
  - `executeExternalObjectCreate` — approve a single new record creation
  - `editExternalObjectSyncProperty` — edit a field value before approving an update
  - `editExternalObjectCreateProperty` — edit a field value before approving a create
  - `updateExternalPropertyChangeStatus` — cancel an individual field change
  - `updateExternalObjectCreateStatus` — approve or reject a create event
- **GraphQL subscription:** `engagementIntegrationPushEvents` — real-time badge updates
- **Route:** `/workspaces/:workspaceId/engagements/:engagementId`
- **Internal name:** `ExternalObjectSync` / `IntegrationPushEvents`
