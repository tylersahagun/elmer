# Sync Command

Unified command for syncing signals from external sources.

**Delegates to**: signals-processor

## Usage

- `/sync` - Show sync status and options
- `/sync inbox` - Process files from inbox folders (Option 1: file-based)
- `/sync linear` - Pull issues from Linear (Option 2: MCP integration)
- `/sync notion` - Pull items from Notion inbox (Option 2: MCP integration)
- `/sync all` - Run all sync operations

## Subcommands

### `sync inbox`

Process files dropped into `pm-workspace-docs/signals/inbox/` folders.

**Folders monitored:**

- `pm-workspace-docs/signals/inbox/transcripts/` - Meeting transcripts
- `pm-workspace-docs/signals/inbox/tickets/` - Support tickets
- `pm-workspace-docs/signals/inbox/conversations/` - Slack/email threads
- `pm-workspace-docs/signals/inbox/misc/` - Anything else

**Process:**

1. Read each file in inbox folders
2. Auto-detect personas, severity, problems
3. Move to appropriate signals folder with proper naming
4. Update `signals/_index.json`
5. Flag for full AI processing via `/ingest`

**Usage tips:**

- Drop `.txt` or `.md` files into inbox folders
- Files are processed and moved automatically
- Original filename is preserved in metadata

### `sync linear`

Pull issues from Linear that need PM attention.

See: `/sync-linear` for full documentation.

**Quick start:**

1. Create a "pm-review" label in Linear
2. Apply label to issues needing PM attention
3. Run `sync linear` to pull them

### `sync notion`

Pull items from Notion inbox database.

See: `/sync-notion` for full documentation.

**Quick start:**

1. Create an "Inbox" database in Notion
2. Add items with Type and Status properties
3. Run `sync notion` to pull unprocessed items

### `sync all`

Run all sync operations in sequence:

1. Process inbox files
2. Pull from Linear
3. Pull from Notion
4. Generate synthesis report

## Automation Status

Check current automation setup:

```
📁 Inbox Monitoring
   Folder: signals/inbox/
   Status: [Check launchd status]
   Schedule: Every 15 minutes

🔗 Linear Sync
   Status: [Manual or scheduled]
   Label: pm-review

📝 Notion Sync
   Status: [Manual or scheduled]
   Database: PM Inbox
```

## Quick Actions

After syncing, common next steps:

- `/synthesize` - Find patterns across new signals
- `/hypothesis list active` - See current hypotheses
- `/ingest` - Full AI processing of a specific signal

## Setting Up Automation

### File-based (runs locally)

```bash
# One-time setup
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.pmworkspace.auto-ingest.plist
```

### MCP-based (requires Cursor)

MCP commands run in Cursor context. For full automation:

1. Use Pipedream webhooks to trigger
2. Or run sync commands in scheduled Cursor sessions

## Sync History

Recent syncs are logged to:
`pm-workspace-docs/status/sync-log.md`

View recent activity:

```
tail -50 elmer-docs/maintenance/logs/sync.log
```
