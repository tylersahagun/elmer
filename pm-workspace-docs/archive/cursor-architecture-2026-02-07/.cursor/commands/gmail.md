# /gmail Command

Scan Gmail inbox, classify messages by priority, apply triage labels, and perform cleanup actions.

## Usage

```
/gmail                    # Full triage (classify + label + cleanup)
/gmail scan               # Read-only scan (no modifications)
/gmail cleanup            # Aggressive cleanup (archive, mark read)
/gmail inbox-zero         # Maximum cleanup (archive everything except Act/Decide)
/gmail drafts             # Create response drafts for Act items
/gmail status             # Check when email was last triaged
/gmail mark-read          # Mark as caught up without scanning
```

## Behavior

**Delegates to:** `gmail-monitor` subagent

### Default Mode (`/gmail`)

1. **Fetch up to 100 unread inbox messages** (excluding promotions/social/forums)
2. **Classify each message** using the triage framework (Act/Decide/Aware/Capture/Archive)
3. **Apply Gmail labels** (PM/Act, PM/Decide, PM/Aware, PM/Capture, PM/Follow-Up)
4. **Mark low-priority as read** (Aware + Archive items)
5. **Generate triage report** with recommended focus order
6. **Offer to draft responses** for Act items

### Read-Only Mode (`/gmail scan`)

- Classify and report only
- No labels applied, no read status changes
- Safe for reviewing without modifying inbox

### Cleanup Mode (`/gmail cleanup`)

- Apply all triage labels
- Mark everything as read
- Archive Aware and Archive items
- Star Act items for visibility
- Keep only Act and Decide in inbox

### Inbox Zero Mode (`/gmail inbox-zero`)

- Everything from cleanup mode, plus:
- Trash obvious spam/marketing
- Archive all Aware items
- Only Act and Decide remain in inbox

### Draft Mode (`/gmail drafts`)

- Create Gmail drafts for all Act items
- Suggested responses based on context and sender
- Tyler reviews and sends from Gmail

## Triage Classification

| Category       | Criteria                                                      | Action                      |
| -------------- | ------------------------------------------------------------- | --------------------------- |
| **🔴 Act**     | Leadership email, direct question, approval request, blocker  | Draft response, keep unread |
| **🟡 Decide**  | Tool notification with mention, meeting invite, design review | Keep unread, label          |
| **🟢 Aware**   | FYI broadcasts, release notes, confirmations                  | Mark read, label            |
| **📊 Capture** | Customer feedback, partner requests, churn signals            | Save as signal, label       |
| **🗑️ Archive** | Newsletters, marketing, expired notifications, spam           | Mark read, archive          |

## Gmail Labels Created

On first run, the following nested labels are created under `PM/`:

| Label          | Color  | Purpose          |
| -------------- | ------ | ---------------- |
| `PM/Act`       | Red    | Must respond     |
| `PM/Decide`    | Yellow | Needs evaluation |
| `PM/Aware`     | Green  | For context      |
| `PM/Capture`   | Blue   | Product signal   |
| `PM/Follow-Up` | Purple | Tracking thread  |
| `PM/Processed` | Gray   | Already triaged  |

## MCP Tools Used

**Server:** `google`

- `GOOGLESUPER_FETCH_EMAILS` - Fetch inbox messages with query
- `GOOGLESUPER_ADD_LABEL_TO_EMAIL` - Add/remove labels per message
- `GOOGLESUPER_BATCH_MODIFY_MESSAGES` - Bulk label and read-status changes
- `GOOGLESUPER_LIST_LABELS` - Check existing labels
- `GOOGLESUPER_CREATE_LABEL` - Create triage labels (first run)
- `GOOGLESUPER_CREATE_EMAIL_DRAFT` - Draft responses for Act items
- `GOOGLESUPER_MOVE_TO_TRASH` - Trash spam/marketing
- `GOOGLESUPER_GET_PROFILE` - Get Tyler's email address

## State Tracking

State file: `pm-workspace-docs/status/gmail/.gmail-monitor-state.json`

Tracks:

- `last_check` — When email was last triaged
- `messages_found` — Total messages in last scan
- `action_required` — Count of Act items
- `labels_created` — Which PM labels exist

## Output

Report saved to: `pm-workspace-docs/status/gmail/digests/gmail-digest-YYYY-MM-DD.md`

### Example Output

```markdown
# Gmail Triage: Feb 5, 2026

**Period:** Since last check (6 hours ago)
**Messages Scanned:** 47
**Unread Found:** 23

## 🔴 Act (3) — Needs Your Response

### 1. Re: Q2 Roadmap Planning

**From:** Sam Ho | **Time:** 2:15 PM

> "Tyler, can you send me the updated roadmap by EOD Friday?"

**Suggested response:**

> "On it — I'll have the updated Q2 roadmap to you by Friday EOD."

**Draft created:** ✅ Yes

### 2. [Next item...]

## 🟡 Decide (5) — Review and Evaluate

### 1. [Linear] You were assigned ASK-1234

...

## 🟢 Aware (8) — For Context

- **Deploy notification** - From: GitHub Actions - Production deploy successful
- ...

## 🗑️ Archived (7) — Auto-Cleaned

- 4 newsletters archived
- 2 expired calendar notifications cleaned
- 1 marketing email archived

## Summary

- 🔴 **3 Act** — needs response today (~10 min)
- 🟡 **5 Decide** — review and evaluate
- 🟢 **8 Aware** — for context
- 🗑️ **7 Archived** — auto-cleaned
```

## Integration Points

### With /triage

- `/triage email` delegates directly to this command
- Combined with Slack results in unified triage output

### With /morning

- `/morning` can include email summary via this command
- High-priority emails surface in daily focus

### With Signals Processor

- 📊 Capture items route to `/ingest` for deeper processing

## Best Practices

### Batched Processing

Run `/gmail` at fixed times (e.g., 9am and 2pm) alongside `/triage`. Resist checking between sessions.

### Response Drafts

The command creates drafts, not sent emails. Review every draft before sending — edit for tone and accuracy.

### Label Maintenance

Periodically review PM/ labels in Gmail. The `PM/Processed` label helps track what's been triaged. Clear it weekly.

## Related Commands

- `/triage` - Combined Slack + Email triage
- `/triage email` - Email-only triage (same as `/gmail`)
- `/morning` - Daily planning (includes email summary)
- `/ingest` - Deep signal processing from captured emails
- `/slack-monitor` - Slack equivalent of this command

## Recommended Schedule

```
9:00am   /gmail          # Morning email triage after /morning
2:00pm   /gmail          # Afternoon email triage
```

Or combine with Slack:

```
9:00am   /triage         # Full triage (Slack + Email)
2:00pm   /triage         # Afternoon triage
```
