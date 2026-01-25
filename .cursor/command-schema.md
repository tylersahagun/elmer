# Command File Schema

This document defines the schema for `.cursor/commands/*.md` command definition files, based on the pm-workspace command format.

## File Structure

Each command file follows this structure:

```markdown
# [Command Name]

[Brief description of what the command does]

## Usage

[Command syntax with examples]

## Behavior

[What happens when executed, including delegation]

## Prerequisites

[Optional - Required conditions or files]

## Output

[What files/locations are created or modified]

## Next Steps

[Suggested follow-up commands or actions]
```

## Schema Definition

### Required Sections

#### 1. Title (`# [Command Name]`)
- **Type**: H1 heading
- **Required**: Yes
- **Format**: Command name in title case
- **Example**: `# Prototype Command`, `# Research Command`

#### 2. Description
- **Type**: Paragraph(s) immediately after title
- **Required**: Yes
- **Format**: 1-3 sentences describing the command's purpose
- **Example**: "Build interactive Storybook prototypes with multiple creative directions."

#### 3. Usage Section (`## Usage`)
- **Type**: Code block(s) showing command syntax
- **Required**: Yes
- **Format**: 
  - Basic usage: `` `/command [required-param]` ``
  - With options: `` `/command [param] --option value` ``
  - With subcommands: `` `/command subcommand [param]` ``
- **Example**:
  ```markdown
  ## Usage
  
  ```
  /proto [initiative-name]
  ```
  
  Optionally include specific instructions:
  ```
  /proto hubspot-config add validation toggle
  ```
  ```

#### 4. Behavior Section (`## Behavior`)
- **Type**: Paragraph(s) describing execution flow
- **Required**: Yes
- **Format**: 
  - **Delegation statement**: "**Delegates to**: `[subagent-name]`" or "**Uses**: `[skill-name]`"
  - Numbered list of steps the handler performs
- **Example**:
  ```markdown
  ## Behavior
  
  **Delegates to**: `proto-builder` subagent
  
  The subagent will:
  1. Load PRD and Design Brief from initiative folder
  2. Load design system from `.interface-design/system.md`
  3. Create 2-3 creative options (Max Control, Balanced, Efficient)
  4. Implement all required AI states (Loading, Success, Error, etc.)
  5. Create interactive Flow_* stories for user journeys
  6. Build and deploy to Chromatic
  7. Document in prototype-notes.md
  8. Commit and push changes
  ```

### Optional Sections

#### 5. Prerequisites (`## Prerequisites`)
- **Type**: Bullet list or paragraph
- **Required**: No
- **Format**: List of required files, commands, or conditions
- **Example**:
  ```markdown
  ## Prerequisites
  
  - PRD should exist at `pm-workspace-docs/initiatives/[name]/prd.md`
  - Design Brief should exist at `pm-workspace-docs/initiatives/[name]/design-brief.md`
  
  If these don't exist, run `/pm [name]` first.
  ```

#### 6. Output (`## Output` or `## Output Location`)
- **Type**: Bullet list, table, or paragraph
- **Required**: No (but recommended)
- **Format**: Files, directories, or artifacts created/modified
- **Example**:
  ```markdown
  ## Output
  
  - Components: `elephant-ai/web/src/components/prototypes/[Initiative]/v1/`
  - Stories: All options + all states + Flow_* journeys
  - Notes: `pm-workspace-docs/initiatives/[name]/prototype-notes.md`
  - Chromatic URL for sharing
  ```

#### 7. Examples (`## Examples`)
- **Type**: Code blocks showing usage scenarios
- **Required**: No
- **Format**: Multiple usage examples with context
- **Example**:
  ```markdown
  ## Examples
  
  ```
  /research hubspot-config
  [paste transcript]
  ```
  
  ```
  /research crm-sync
  @pm-workspace-docs/meeting-notes/2026-01-23-customer-call.md
  ```
  ```

#### 8. Options/Flags (`## Options` or within Usage)
- **Type**: Table or list
- **Required**: No
- **Format**: Command-line flags and their meanings
- **Example**:
  ```markdown
  Options:
  ```
  /validate [name] --phase [phase]     # Validate specific phase
  /validate [name] --criteria-only     # Skip jury, just check criteria
  ```
  ```

#### 9. Next Steps (`## Next Steps`)
- **Type**: Bullet list or paragraph
- **Required**: No (but recommended)
- **Format**: Suggested follow-up commands or actions
- **Example**:
  ```markdown
  ## Next Steps
  
  After prototype is complete:
  - Ready for validation? Run `/validate [name]`
  - Need feedback? Share Chromatic URL with stakeholders
  - Need iteration? Run `/iterate [name]` after gathering feedback
  ```

## Delegation Patterns

### Subagent Delegation
```markdown
**Delegates to**: `[subagent-name]` subagent

The subagent will:
1. [Step 1]
2. [Step 2]
3. [Step 3]
```

### Skill Delegation
```markdown
**Uses**: `[skill-name]` skill

This command will:
1. [Step 1]
2. [Step 2]
```

### Direct Execution
```markdown
**Executes**: [Description of direct execution]

This command will:
1. [Step 1]
2. [Step 2]
```

## Parameter Patterns

### Required Parameters
- Format: `[param-name]` in usage examples
- Example: `` `/command [initiative-name]` ``

### Optional Parameters
- Format: `[param-name]` with "Optionally" prefix
- Example: "Optionally include specific instructions: `` `/command [name] [instructions]` ``"

### Subcommands
- Format: `` `/command subcommand [param]` ``
- Example: `` `/ingest transcript` ``, `` `/ingest ticket` ``

### Flags/Options
- Format: `` `--flag-name [value]` ``
- Example: `` `/validate [name] --phase [phase]` ``

## Complete Example

```markdown
# Validate Command

Run jury evaluation and check graduation criteria for an initiative.

## Usage

```
/validate [initiative-name]
```

Options:
```
/validate [name] --phase [phase]     # Validate specific phase
/validate [name] --criteria-only     # Skip jury, just check criteria
```

## Behavior

**Delegates to**: `validator` subagent

The subagent will:
1. Load initiative metadata and documents
2. Check graduation criteria for current phase
3. Run synthetic jury evaluation (if applicable)
4. Generate validation report
5. Recommend next steps (advance, iterate, or block)

## Graduation Criteria

### Discovery → Define
- Research exists with user quotes
- Persona(s) identified
- 3+ evidence points

### Define → Build
- PRD exists and approved
- Design brief exists
- Outcome chain defined

### Build → Validate
- Prototype covers all states
- Storybook stories complete
- Flow stories implemented

### Validate → Launch
- Jury pass rate ≥ 70%
- Stakeholder approval
- No P0 blockers

## Jury Evaluation

Uses Condorcet Jury Theorem with:
- 100-500 synthetic personas
- Stratified sampling (15% skeptics minimum)
- Role distribution: Rep 40%, Leader 25%, CSM 20%, RevOps 15%

## Output

- Report: `pm-workspace-docs/initiatives/[name]/jury-evaluations/`
- Updated `_meta.json` with results

## Next Steps

Based on results:
- **Passed**: Advance to next phase
- **Failed**: Run `/iterate [name]` to address feedback
- **Contested**: Review concerns with stakeholders
```

## Parser Schema (JSON)

For building a parser, here's a JSON schema representation:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["title", "description", "usage", "behavior"],
  "properties": {
    "title": {
      "type": "string",
      "description": "Command name in title case"
    },
    "description": {
      "type": "string",
      "description": "Brief description of command purpose"
    },
    "usage": {
      "type": "object",
      "required": ["basic"],
      "properties": {
        "basic": {
          "type": "string",
          "description": "Basic command syntax"
        },
        "examples": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Additional usage examples"
        },
        "options": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "syntax": {
                "type": "string"
              },
              "description": {
                "type": "string"
              }
            }
          }
        },
        "subcommands": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      }
    },
    "behavior": {
      "type": "object",
      "required": ["delegation"],
      "properties": {
        "delegation": {
          "type": "object",
          "required": ["type", "target"],
          "properties": {
            "type": {
              "type": "string",
              "enum": ["subagent", "skill", "direct"]
            },
            "target": {
              "type": "string",
              "description": "Name of subagent, skill, or execution description"
            }
          }
        },
        "steps": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Numbered list of execution steps"
        }
      }
    },
    "prerequisites": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "output": {
      "type": "object",
      "properties": {
        "files": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "directories": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "artifacts": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      }
    },
    "examples": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "command": {
            "type": "string"
          },
          "context": {
            "type": "string"
          }
        }
      }
    },
    "nextSteps": {
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  }
}
```

## Parsing Rules

### 1. Title Extraction
- Extract H1 heading (`# [Command Name]`)
- Remove "Command" suffix if present for normalized name

### 2. Description Extraction
- Extract paragraph(s) immediately following title
- Stop at first `##` heading

### 3. Usage Extraction
- Find `## Usage` section
- Extract all code blocks (```)
- Parse first code block as basic syntax
- Additional code blocks are examples or options

### 4. Behavior Extraction
- Find `## Behavior` section
- Extract delegation pattern: `**Delegates to**:` or `**Uses**:`
- Extract numbered list items as steps

### 5. Prerequisites Extraction
- Find `## Prerequisites` section (if exists)
- Extract bullet list items or paragraphs

### 6. Output Extraction
- Find `## Output` or `## Output Location` section (if exists)
- Extract bullet list items, table rows, or paragraphs

### 7. Examples Extraction
- Find `## Examples` section (if exists)
- Extract code blocks and their context

### 8. Next Steps Extraction
- Find `## Next Steps` section (if exists)
- Extract bullet list items or paragraphs

## Validation Rules

1. **Required sections must exist**: Title, Description, Usage, Behavior
2. **Delegation must be specified**: Either "Delegates to" or "Uses" in Behavior section
3. **Usage must contain command syntax**: At least one code block with command pattern
4. **Behavior must contain steps**: Numbered list of execution steps

## Common Patterns

### Pattern 1: Simple Command with Subagent
```markdown
# [Command]

[Description]

## Usage
`/[command] [param]`

## Behavior
**Delegates to**: `[subagent]` subagent
[Steps]

## Output
[Files/locations]

## Next Steps
[Follow-ups]
```

### Pattern 2: Command with Options
```markdown
# [Command]

[Description]

## Usage
`/[command] [param]`
Options:
`/[command] [param] --option value`

## Behavior
**Uses**: `[skill]` skill
[Steps]

## Prerequisites
[Requirements]

## Output
[Files/locations]
```

### Pattern 3: Command with Subcommands
```markdown
# [Command]

[Description]

## Usage
`/[command] subcommand [param]`

## Behavior
**Delegates to**: `[subagent]` subagent
[Steps]

## Examples
[Usage examples]
```

## Notes

- Command files are markdown files in `.cursor/commands/` directory
- File name matches command name (e.g., `proto.md` for `/proto` command)
- Commands can delegate to subagents (separate AI agents) or skills (reusable capabilities)
- Parameters use `[param-name]` syntax in documentation
- Options use `--flag-name` syntax
- Subcommands are space-separated after the command name
