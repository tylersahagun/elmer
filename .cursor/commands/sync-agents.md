# Sync Agents from PM Workspace

Pull agent and skill updates from the pm-workspace GitHub repository and apply path adaptations for elmer.

## Usage

- `sync-agents` - Show status and available updates
- `sync-agents pull` - Pull all updates from pm-workspace
- `sync-agents pull [agent-name]` - Pull specific agent
- `sync-agents diff` - Show differences between local and remote
- `sync-agents skills` - Sync skills only

## Source Repository

**Repository:** `https://github.com/tylersahagun/pm-workspace`
**Branch:** `main`

**Source paths:**

- Agents: `.cursor/agents/`
- Skills: `.cursor/skills/`

## Path Adaptations (Applied Automatically)

When pulling from pm-workspace, these transformations are applied:

| pm-workspace                                       | elmer                                      |
| -------------------------------------------------- | ------------------------------------------ |
| `pm-workspace-docs/`                               | `elmer-docs/`                              |
| `@pm-workspace-docs/`                              | `@elmer-docs/`                             |
| `elephant-ai/web/src/components/prototypes/`       | `prototypes/src/components/`               |
| `elephant-ai/web/src/components/`                  | `prototypes/src/components/`               |
| `cd elephant-ai && npm run build-storybook -w web` | `cd prototypes && npm run build-storybook` |
| `cd elephant-ai && npm run chromatic -w web`       | `cd prototypes && npm run chromatic`       |
| `tylersahagun/pm-workspace` (GitHub URLs)          | `tylersahagun/elmer`                       |

**Chromatic Configuration (preserved for elmer):**

- Token: `chpt_46b823319a0135f`
- App ID: `696c2c54e35ea5bca2a772d8`
- Production URL: `https://main--696c2c54e35ea5bca2a772d8.chromatic.com`

## Process

### Step 1: Fetch Remote Content

For each agent/skill to sync:

```
https://raw.githubusercontent.com/tylersahagun/pm-workspace/main/.cursor/agents/[name].md
https://raw.githubusercontent.com/tylersahagun/pm-workspace/main/.cursor/skills/[name]/SKILL.md
```

### Step 2: Apply Path Transformations

Replace all pm-workspace paths with elmer equivalents using the mapping table above.

### Step 3: Preserve Elmer-Specific Config

Keep elmer's Chromatic credentials (don't overwrite with pm-workspace values):

- `CHROMATIC_PROJECT_TOKEN="chpt_46b823319a0135f"`
- App ID in URLs: `696c2c54e35ea5bca2a772d8`

### Step 4: Write Updated Files

Save to corresponding locations:

- `.cursor/agents/[name].md`
- `.cursor/skills/[name]/SKILL.md`

### Step 5: Log Changes

Record sync to `elmer-docs/maintenance/logs/agent-sync.log`:

```
[YYYY-MM-DD HH:MM:SS] Synced [agent-name] from pm-workspace (commit: abc123)
  - Lines changed: X
  - Path adaptations: Y
```

## Agent Inventory

### Core Workflow Agents

| Agent                   | Local                                     | Remote | Status            |
| ----------------------- | ----------------------------------------- | ------ | ----------------- |
| `proto-builder`         | `.cursor/agents/proto-builder.md`         | ✓      | [synced/outdated] |
| `validator`             | `.cursor/agents/validator.md`             | ✓      | [synced/outdated] |
| `iterator`              | `.cursor/agents/iterator.md`              | ✓      | [synced/outdated] |
| `research-analyzer`     | `.cursor/agents/research-analyzer.md`     | ✓      | [synced/outdated] |
| `signals-processor`     | `.cursor/agents/signals-processor.md`     | ✓      | [synced/outdated] |
| `context-proto-builder` | `.cursor/agents/context-proto-builder.md` | ✓      | [synced/outdated] |

### Supporting Agents

| Agent                | Local                                  | Remote | Status            |
| -------------------- | -------------------------------------- | ------ | ----------------- |
| `docs-generator`     | `.cursor/agents/docs-generator.md`     | ✓      | [synced/outdated] |
| `hypothesis-manager` | `.cursor/agents/hypothesis-manager.md` | ✓      | [synced/outdated] |
| `workspace-admin`    | `.cursor/agents/workspace-admin.md`    | ✓      | [synced/outdated] |

### Integration Agents

| Agent              | Local                                | Remote | Status            |
| ------------------ | ------------------------------------ | ------ | ----------------- |
| `figjam-generator` | `.cursor/agents/figjam-generator.md` | ✓      | [synced/outdated] |
| `figma-sync`       | `.cursor/agents/figma-sync.md`       | ✓      | [synced/outdated] |
| `hubspot-activity` | `.cursor/agents/hubspot-activity.md` | ✓      | [synced/outdated] |
| `notion-admin`     | `.cursor/agents/notion-admin.md`     | ✓      | [synced/outdated] |
| `posthog-analyst`  | `.cursor/agents/posthog-analyst.md`  | ✓      | [synced/outdated] |
| `slack-monitor`    | `.cursor/agents/slack-monitor.md`    | ✓      | [synced/outdated] |

### Skills

| Skill                    | Local                                            | Remote | Status            |
| ------------------------ | ------------------------------------------------ | ------ | ----------------- |
| `prototype-notification` | `.cursor/skills/prototype-notification/SKILL.md` | ✓      | [synced/outdated] |
| `prototype-builder`      | `.cursor/skills/prototype-builder/SKILL.md`      | ✓      | [synced/outdated] |
| `jury-system`            | `.cursor/skills/jury-system/SKILL.md`            | ✓      | [synced/outdated] |
| `initiative-status`      | `.cursor/skills/initiative-status/SKILL.md`      | ✓      | [synced/outdated] |
| `slack-block-kit`        | `.cursor/skills/slack-block-kit/SKILL.md`        | ✓      | [synced/outdated] |

## Elmer-Only Files (Never Sync)

These files are specific to elmer and should NOT be overwritten:

- `.cursor/agents/subagent-schema.md` - Elmer's schema definition
- `.cursor/rules/*.mdc` - Elmer-specific rules
- `.cursor/commands/*.md` - Elmer-specific commands (only delegation notes)

## Output Format

### Status Check (`sync-agents`)

```
🔄 Agent Sync Status

**Source:** github.com/tylersahagun/pm-workspace (main)
**Last sync:** YYYY-MM-DD HH:MM

## Agents (15)
✅ proto-builder - up to date
⚠️ validator - remote has updates (3 days ago)
✅ iterator - up to date
...

## Skills (5)
✅ prototype-notification - up to date
⚠️ jury-system - remote has updates (1 day ago)
...

**Summary:** 2 agents/skills have updates available

Run `sync-agents pull` to update all, or `sync-agents pull [name]` for specific files.
```

### After Pull (`sync-agents pull`)

```
✅ Agent sync complete!

**Updated:**
- validator.md (12 lines changed)
- jury-system/SKILL.md (8 lines changed)

**Path adaptations applied:**
- pm-workspace-docs/ → elmer-docs/ (23 occurrences)
- elephant-ai/ → prototypes/ (7 occurrences)

**Chromatic config preserved:**
- Token: chpt_46b823319a0135f ✓
- App ID: 696c2c54e35ea5bca2a772d8 ✓

📝 Log: elmer-docs/maintenance/logs/agent-sync.log
```

## Conflict Resolution

If local modifications exist that differ from both original pm-workspace AND current pm-workspace:

1. **Prompt user** with diff showing:
   - Original pm-workspace version (at last sync)
   - Current pm-workspace version
   - Current local version

2. **Options:**
   - `keep` - Keep local version
   - `update` - Overwrite with remote (re-apply adaptations)
   - `merge` - Attempt automatic merge

## Related Commands

- `/admin` - Modify workspace rules and commands
- `/maintain` - Audit workspace health
- `/update` - Pull git updates (different from agent sync)
