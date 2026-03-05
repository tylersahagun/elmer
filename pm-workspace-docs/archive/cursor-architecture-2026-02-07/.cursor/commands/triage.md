# /triage Command

Batch process Slack messages and email in structured triage sessions.

## Usage

```
/triage              # Full triage (Slack + Email)
/triage slack        # Slack only
/triage email        # Email only
/triage quick        # Quick mode — 🔴 Act items only (Slack + Email)
```

## Behavior

**Delegates to:**

- **Slack:** `slack-monitor` subagent (via `composio-config`)
- **Email:** `gmail-monitor` subagent (via `google`)

### Full Triage (`/triage`)

1. **Pull Slack activity** — Via `slack-monitor` subagent (since last check)
2. **Pull Gmail inbox** — Via `gmail-monitor` subagent (up to 100 unread)
3. **Merge and classify** — Unified triage categories across both platforms
4. **Apply actions** — Labels (Gmail), state update (Slack), cleanup
5. **Generate response drafts** — For 🔴 Act items (Gmail drafts + Slack suggestions)
6. **Track processed** — Update both state files

### Slack Only (`/triage slack`)

Delegates entirely to `slack-monitor` subagent. Same as `/slack-monitor`.

### Email Only (`/triage email`)

Delegates entirely to `gmail-monitor` subagent. Same as `/gmail`.

### Quick Mode (`/triage quick`)

Runs both Slack and Email scans but only surfaces 🔴 Act items. Skips Decide/Aware/Capture categories for speed.

## Output

### Combined Triage Session

```markdown
# Triage Session - [Date], [Time]

**Slack:** [X] new messages since last check
**Email:** [Y] unread inbox messages
**Total items:** [Z]

---

## 🔴 Respond Now ([count])

### 1. [Slack] DM from Bryan - Architecture question

**Source:** Slack #proj-composio | **Link:** [View](permalink)

> "Hey, quick question about the Composio auth flow..."

**Suggested response:**

> "Good question. The decision was workspace-level auth for workflows.
> See the decision log in the PRD: [link]"

[ ] Send response

### 2. [Email] Re: Q2 Roadmap Planning

**Source:** Gmail | **From:** Sam Ho

> "Tyler, can you send me the updated roadmap by EOD Friday?"

**Suggested response:**

> "On it — I'll have the updated Q2 roadmap to you by Friday EOD."

**Draft created:** ✅ In Gmail drafts

[ ] Review and send

### 3. [Slack] #product-forum - Woody asking about settings redesign

**Source:** Slack | **Link:** [View](permalink)

> "Tyler, where are we on settings?"

**Suggested response:**

> "Good timing — design review is Thursday. Quick preview:
> Early Access tab is in prototype, onboarding flow is next."

[ ] Send response

---

## 🟡 Schedule / Decide ([count])

- [Email] Linear assignment: ASK-1234 → Review in Linear
- [Slack] Design feedback in #design-ux → Review in next Design Review
- [Email] Meeting invite: Product sync Thursday → Accept/Decline

## 🟢 FYI ([count])

- [Slack] Win in #sales-closed-won — Acme Corp closed $45K
- [Email] GitHub Actions — Production deploy successful
- [Slack] Release notes in #product-updates — v2.14 shipped

## 🗑️ Auto-Cleaned ([count])

- [Email] 4 newsletters archived, 2 notifications marked read
- [Slack] Acknowledged in state file

---

## Summary

| Source    | 🔴 Act  | 🟡 Decide | 🟢 Aware | 📊 Capture | 🗑️ Clean |
| --------- | ------- | --------- | -------- | ---------- | -------- |
| Slack     | [X]     | [X]       | [X]      | [X]        | —        |
| Email     | [X]     | [X]       | [X]      | —          | [X]      |
| **Total** | **[X]** | **[X]**   | **[X]**  | **[X]**    | **[X]**  |

**Time to clear all 🔴 items:** ~[X] min
```

## Triage Classification

| Category           | Criteria                                            | Action                        |
| ------------------ | --------------------------------------------------- | ----------------------------- |
| **🔴 Respond Now** | Direct mention, leadership question, blocking issue | Draft response, send          |
| **🟡 Schedule**    | Needs research, future meeting, non-urgent review   | Add to sync-queue or calendar |
| **🟢 FYI**         | Informational, no action needed                     | Mark as read / archive        |
| **📊 Capture**     | Customer signal, feedback, churn indicator          | Save to signals system        |
| **🗑️ Clean**       | Newsletters, spam, expired notifications            | Archive / trash               |

## MCP Tools Used

### Slack (via `composio-config`)

- `SLACK_FETCH_CONVERSATION_HISTORY` - Get channel messages
- `SLACK_SEARCH_MESSAGES` - Find mentions and keywords
- `SLACK_SEND_MESSAGE` - Send responses (after approval)

### Gmail (via `google`)

- `GOOGLESUPER_FETCH_EMAILS` - Fetch inbox messages
- `GOOGLESUPER_ADD_LABEL_TO_EMAIL` - Apply triage labels
- `GOOGLESUPER_BATCH_MODIFY_MESSAGES` - Bulk mark read / archive
- `GOOGLESUPER_CREATE_EMAIL_DRAFT` - Draft responses
- `GOOGLESUPER_CREATE_LABEL` - Create triage labels (first run)
- `GOOGLESUPER_MOVE_TO_TRASH` - Trash spam

## State Files

| Platform | State File                                                 |
| -------- | ---------------------------------------------------------- |
| Slack    | `pm-workspace-docs/status/slack/.slack-monitor-state.json` |
| Gmail    | `pm-workspace-docs/status/gmail/.gmail-monitor-state.json` |

Both state files are updated after each triage session with current timestamp.

## Best Practices

### Batched Processing

Run `/triage` at fixed times (e.g., 9am and 2pm) rather than continuously checking. This protects focus time.

### Response Drafts

The command generates response drafts. Review before sending — edit for tone and accuracy.

### Archive Aggressively

FYI items don't need responses. Capture any signals to sync-queue, then archive.

## Integration Points

### With Slack Monitor

- `/triage slack` uses `slack-monitor` subagent
- Shares Slack state file for "last checked" tracking

### With Gmail Monitor

- `/triage email` uses `gmail-monitor` subagent
- Shares Gmail state file for "last checked" tracking
- Creates Gmail labels for persistent triage categories

### With Daily Planner

- `/morning` surfaces high-priority Slack + Email items
- `/triage` handles the full combined inbox

### With Signals Processor

- Notable signals (feature requests, feedback) route to `/ingest`
- `/triage` captures and routes, doesn't process deeply

## Related Commands

- `/morning` - Daily planning (includes Slack + Email summary)
- `/slack-monitor` - Just check Slack status
- `/gmail` - Just check Gmail
- `/gmail scan` - Read-only Gmail scan
- `/gmail cleanup` - Aggressive Gmail cleanup
- `/ingest slack [channel]` - Deep signal processing from Slack
- `/ingest` - Process captured signals

## Recommended Schedule

```
9:00am   /triage    # Morning batch after /morning
2:00pm   /triage    # Afternoon batch
```

Two sessions per day is enough. Resist checking between sessions.
