# Figma Sync

Sync Figma designs into Storybook components and specs.

**Delegates to**: figma-sync

## Usage

- `/figma-sync [figma-url] [initiative]`

## Behavior

- Extract Figma spec via MCP tools.
- Generate Storybook scaffolds and spec files.
- Save any generated notes to `pm-workspace-docs/status/figma-sync.md` using `write_repo_files`.
