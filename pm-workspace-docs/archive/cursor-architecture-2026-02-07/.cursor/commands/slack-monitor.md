# Slack Monitor Command

Scan Slack for activity and get prioritized recommendations for where to respond.

## Usage

```
/slack-monitor
/slack-monitor [time range]
/slack-monitor [focus]
/slack-monitor [special command]
```

## Examples

```
/slack-monitor                    # Since last check (or 24h if first run)
/slack-monitor today              # Today's activity
/slack-monitor since monday       # This week
/slack-monitor last 2 days        # Last 48 hours
/slack-monitor product            # Just product/design channels
/slack-monitor leadership         # Just leadership messages
/slack-monitor urgent             # Only 🔴 Action Required items
/slack-monitor full scan          # Ignore last check, scan 24-48h
/slack-monitor mark as read       # Update timestamp without scanning
/slack-monitor when               # Show when you last checked
```

## "Unread" Tracking

**Note:** Slack's API doesn't expose true unread status to bots.

**Workaround:** We track when you last ran `/slack-monitor` in a state file. Each subsequent run shows only messages **since your last check** - effectively simulating "unread" behavior.

- **State file:** `pm-workspace-docs/status/slack/.slack-monitor-state.json`
- **First run:** Defaults to last 24 hours
- **Subsequent runs:** Only shows new messages since last check

### Catch Up Without Reading

If you've already caught up in the Slack app and want to reset the timestamp:

```
/slack-monitor mark as read
```

This updates the "last check" time without scanning, so your next check starts fresh.

## Behavior

**Delegates to:** `slack-monitor` subagent

**Model:** `fast`

**MCP Server:** `composio-config` (Slack tools)

## What It Does

1. **Checks state file** for last check timestamp
2. **Scans relevant Slack channels** using MCP tools (only messages since last check)
3. **Identifies messages requiring your attention:**
   - Direct @mentions
   - Messages from leadership (Sam, Woody, Bryan)
   - Product discussions needing PM input
   - Threads you participated in with new replies
4. **Classifies by priority:**
   - 🔴 **Action Required** - Respond within hours
   - 🟡 **Review** - Respond within 1-2 days
   - 🟢 **FYI** - Awareness only
   - 📊 **Signal** - Product intelligence to capture
5. **Updates state file** with current timestamp
6. **Provides response recommendations:**
   - What to respond to and why
   - Suggested draft responses
   - Who to loop in

## Output

A prioritized digest showing:

- Items needing immediate response
- Items to review
- Notable activity for awareness
- Customer/product signals
- Recommended focus order
- Time estimate to clear urgent items

## Channels Monitored

### Product & Engineering

- #product-forum, #product-issues, #product-requests
- #product-updates, #design-ux
- #team-dev, #epd-all

### Customer Signals

- #customer-feedback, #customer-quotes
- #churn-alert

### Company

- #general (for company-wide announcements)
- #growth

## Key People Tracked

Messages from these people are flagged for review:

- **Sam Ho** (your manager)
- **Woody Klemetson** (CEO)
- **Bryan Lund** (Engineering)
- **Skylar Sanford** (Design)
- **Ben Harrison** (CX)

## Related Commands

| Command   | Purpose                                     |
| --------- | ------------------------------------------- |
| `/eod`    | End-of-day report (includes Slack activity) |
| `/eow`    | End-of-week report (includes Slack summary) |
| `/status` | Initiative status (not Slack-focused)       |

## Tips

- **Run daily** to stay on top of Slack without scrolling through everything
- **Use "urgent"** when short on time: `/slack-monitor urgent`
- **Use "leadership"** before 1:1s to catch up on context
- **Combine with `/eod`** for a complete picture of the day
