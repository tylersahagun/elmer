# Cursor Administrator Command

Manage Cursor workspace configuration (rules, commands, skills, subagents).

## Usage

```
/admin
```

Then describe what you want to do.

## Behavior

**Delegates to**: `workspace-admin` subagent

**Override:** In admin mode, PM-specific context is ignored. Focus is on workspace configuration.

## Capabilities

### Rule Management

- "add rule for [behavior]" → Create `.cursor/rules/[name].mdc`
- "update rule [name]" → Edit existing rule
- "archive rule [name]" → Set `alwaysApply: false`, mark ARCHIVED

### Command Management

- "new command [name]" → Create `.cursor/commands/[name].md`
- "update command [name]" → Edit existing command

### Skill Management

- "new skill [name]" → Create `.cursor/skills/[name]/SKILL.md`
- "update skill [name]" → Edit existing skill

### Subagent Management

- "new subagent [name]" → Create `.cursor/agents/[name].md`
- "update subagent [name]" → Edit existing subagent

## File Access

Admin mode can modify:
- `.cursor/rules/*`
- `.cursor/commands/*`
- `.cursor/skills/*`
- `.cursor/agents/*`
- `pm-workspace-docs/scripts/*`

## Best Practices

- Keep `alwaysApply: true` rules minimal
- Commands should be thin orchestrators
- Complex logic goes in subagents/skills
- Use `model: fast` for simple subagents

---

## Cursor 2.4 Best Practices

### Subagent Configuration

| Field | Options | When to Use |
|-------|---------|-------------|
| `model` | `fast` | Simple, quick subagents (research, signals) |
| `model` | `inherit` | Complex workflows needing full capability |
| `readonly` | `true` | Subagents that only analyze, don't write files |

### Skill vs Subagent Decision

| Use Case | Choice |
|----------|--------|
| Procedural knowledge ("how-to") | Skill |
| Complex multi-step workflow | Subagent |
| Always-on context | Rule with `alwaysApply: true` |
| File-pattern context | Rule with `globs` |
| Dynamic context discovery | Skill |

### AskQuestion Tool

Subagents can now ask clarifying questions mid-task. Add this guidance to subagent prompts:

```
If requirements are unclear, use the AskQuestion tool to clarify before proceeding.
```

### Image Generation

Agents can generate images directly. Images are saved to `assets/` by default. Useful for:
- UI mockups before building components
- Architecture diagrams
- Product assets and visualizations

### Built-in Subagents (Cursor 2.4)

These are available automatically:
- `explore` - Fast codebase research (use for "how does X work?" questions)
- `generalPurpose` - Full tool access for multi-step tasks

### File Formats Reference

**Rules (`.mdc`):**
```yaml
---
description: "Short description for agent decision"
globs: ["*.ts", "src/**/*.tsx"]  # Auto-apply patterns
alwaysApply: false               # true = always on (keep minimal)
---
```

**Skills (`SKILL.md`):**
```yaml
---
name: skill-name
description: When to apply this skill
---
```

**Subagents (`[name].md`):**
```yaml
---
name: subagent-name
description: When to invoke this subagent
model: fast | inherit
readonly: true  # Optional: restrict to read-only operations
---
```

---

## When Done

Return to PM mode with `/pm` or `/research` commands.
