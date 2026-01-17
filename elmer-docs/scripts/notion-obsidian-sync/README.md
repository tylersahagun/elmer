# Notion ↔ Obsidian Sync

Sync Notion pages/databases into `elmer-docs/NotionSync/` and push local edits back to Notion with last-write-wins conflict handling.

## Prerequisites

- Node.js 20+
- Notion integration token with access to the target pages/databases

## Setup

1. Copy `config.example.json` to `config.json` and update IDs (or edit the existing `config.json`).
2. Export your token: `export NOTION_TOKEN="your-token"`
3. Install dependencies:
   - `cd elmer-docs/scripts/notion-obsidian-sync`
   - `npm install`

## Usage

- `npm run sync` (two-way sync; default)
- `npm run pull` (Notion → Markdown)
- `npm run push` (Markdown → Notion)

## Environment Variables

- `NOTION_TOKEN` (required)
- `NOTION_SYNC_ROOT` (optional) default: `elmer-docs/NotionSync`

## Notes

- Registry state lives in `elmer-docs/NotionSync/.sync/index.json`.
- YAML frontmatter includes:
  - `notion_id`
  - `notion_url`
  - `notion_last_edited_time`
  - `sync_last_synced_at`
  - `source` (page or database)
  - `database_id` (when applicable)
