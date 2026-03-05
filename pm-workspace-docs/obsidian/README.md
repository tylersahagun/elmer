# Obsidian Knowledge Vault Pipeline

This setup builds a personal Obsidian vault from:

- PM workspace context (`pm-workspace-docs`)
- raw LLM exports in iCloud data path

It is designed so Notion remains team source-of-truth while Obsidian becomes your personal context engine.

## Current data source path

`/Users/tylersahagun/Library/Mobile Documents/com~apple~CloudDocs/data`

## Scripts

- `pm-workspace-docs/scripts/obsidian/bootstrap_vault.py`
  - Creates vault structure, templates, and system config.
- `pm-workspace-docs/scripts/obsidian/ingest_pm_workspace.py`
  - Imports core PM workspace context into Obsidian notes.
- `pm-workspace-docs/scripts/obsidian/ingest_provider_exports.py`
  - Imports provider exports (currently implemented for Claude JSON export).

## Default vault path

`/Users/tylersahagun/Library/Mobile Documents/com~apple~CloudDocs/data/obsidian-vault`

## Run the pipeline

From repo root:

```bash
python3 pm-workspace-docs/scripts/obsidian/bootstrap_vault.py
python3 pm-workspace-docs/scripts/obsidian/ingest_pm_workspace.py
python3 pm-workspace-docs/scripts/obsidian/ingest_provider_exports.py --provider claude
```

Import all providers (implemented + detection/reporting):

```bash
python3 pm-workspace-docs/scripts/obsidian/ingest_provider_exports.py --provider all
```

## What gets created

- `10_sources/pm-workspace/` notes for core strategy docs
- `20_entities/projects/index.md` from active initiative metadata
- `10_sources/providers/claude/` conversation notes with frontmatter and messages
- `_system/reports/*.json` ingestion run reports

## Notes on Obsidian CLI

Your local `obsidian` command currently launches app-level arguments, but terminal command output support may vary by app version. This pipeline writes vault content directly and then opens the vault in Obsidian.

Reference: https://help.obsidian.md/cli

## Recommended next steps

1. Export ChatGPT/Cursor/Perplexity to `data/raw/<provider>/`.
2. Re-run provider ingestion.
3. Add janitor + heartbeat jobs once multi-provider data is available.
