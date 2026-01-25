# Subagent File Schema

This document defines the structure and format for Cursor subagent definition files (`.md` files in `.cursor/agents/`).

## File Structure

A subagent file consists of two main sections:
1. **Frontmatter** (YAML metadata)
2. **Content** (Markdown instructions)

---

## Frontmatter (YAML)

The frontmatter appears at the top of the file, delimited by `---` markers.

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | string | Unique identifier for the agent (kebab-case) | `proto-builder`, `research-analyzer` |
| `description` | string | Brief description of what the agent does and when to invoke it | `Build Storybook prototypes... Use when user wants to create UI prototypes... Invoke for /proto or /lofi-proto commands.` |
| `model` | string | Model preference: `inherit` (use parent model) or `fast` (use faster model) | `inherit`, `fast` |
| `readonly` | boolean | Whether the agent can modify files (`false`) or is read-only (`true`) | `false` |

### Frontmatter Example

```yaml
---
name: proto-builder
description: Build Storybook prototypes with multiple creative directions, all AI states, and interactive flow stories. Use when user wants to create UI prototypes, mock ups, or build components. Invoke for /proto or /lofi-proto commands.
model: inherit
readonly: false
---
```

---

## Content Structure

The content section uses Markdown and follows a consistent pattern:

### 1. Title

```markdown
# [Agent Name] Subagent
```

### 2. Core Purpose

A brief introduction explaining the agent's primary role and goal.

**Example:**
```markdown
You build interactive Storybook prototypes in `elephant-ai/web/src/components/prototypes/`. Your goal is to create **multiple creative options** that meet human-centric AI design standards.
```

### 3. Clarification Section (Cursor 2.4)

Optional section for handling ambiguous requests using the `AskQuestion` tool.

**Pattern:**
```markdown
## Clarification (Cursor 2.4)

If requirements are unclear, use the **AskQuestion tool** to clarify before proceeding:

- [Condition] → [Question to ask]
- [Condition] → [Question to ask]

You can continue reading files while waiting for clarification.
```

### 4. Before [Action] Section

Context loading instructions that specify which files to read before executing the agent's main workflow.

**Pattern:**
```markdown
## Before [Action]

Load context:
- `@[workspace]/path/to/file.md`
- `@[workspace]/path/to/file.json`
```

**File Reference Syntax:**
- `@[workspace-name]/path/to/file.md` - References files in workspace
- Paths are relative to workspace root
- Can reference multiple workspaces

### 5. Main Instructions

The core workflow, principles, and requirements. This section is highly variable based on the agent's purpose.

**Common Subsections:**
- **Modes/Variants** - Different ways the agent can operate
- **Design Principles** - Core principles to follow
- **Required States/Components** - Mandatory elements
- **Tech Stack** - Technologies to use
- **Anti-Patterns** - What to avoid

**Example Structure:**
```markdown
## Two Modes

### Full Prototype Mode (`/proto`)
[Description]

### LoFi Mode (`/lofi-proto`)
[Description]

## Design Principles

### Trust Before Automation
- [Principle 1]
- [Principle 2]

## Required AI States

Every AI feature needs ALL of these states in Storybook:

```typescript
export const Loading: Story = { ... };
export const Success: Story = { ... };
```
```

### 6. MCP Tools Section (Optional)

If the agent uses MCP (Model Context Protocol) tools, document them here.

**Pattern:**
```markdown
## MCP Tools Available

**Server:** `[server-name]`

You can use MCP tools to [purpose]:

| Source | Tools | Use Case |
|--------|-------|----------|
| **Slack** | `SLACK_FETCH_CONVERSATION_HISTORY` | [Use case] |
```

### 7. Output Format

Specifies the expected response format, including structure, sections, and formatting.

**Pattern:**
```markdown
## Output Format

```markdown
# [Title]

**Field:** [value]

## Section 1
[Content]

## Section 2
[Content]
```
```

### 8. Save Locations

Documents where the agent should save its output files.

**Pattern:**
```markdown
## Save Locations

- [Type] → `path/to/file.md`
- [Type] → `path/to/file.json`
```

### 9. After [Action] Section

Post-execution steps, such as updating metadata files, committing changes, or suggesting next steps.

**Pattern:**
```markdown
## After [Action]

1. Update `_meta.json` with [details]
2. Save report to `path/to/location/`
3. If [condition]: Suggest [next action]
4. If [condition]: Suggest [alternative action]
```

### 10. Response Format (Alternative)

Some agents include a "Response Format" section that shows the exact format to use when replying to the user.

**Pattern:**
```markdown
## Response Format

```
✅ [Status message]

🔗 **Link:** [URL]

📦 **Details:** [List]

📋 **Files:**
- [File paths]

**Next:** [Suggestion]
```
```

---

## Common Patterns Across Agents

### Command Triggers

The `description` field typically includes:
- When to use the agent
- Which commands invoke it (e.g., `/proto`, `/research`)

**Example:**
```yaml
description: Analyze transcripts and user research with strategic alignment lens. Use when processing interviews, call recordings, customer feedback, or any user research. Invoke for /research command.
```

### File References

Agents reference files using workspace syntax:
- `@pm-workspace-docs/company-context/product-vision.md`
- `@pm-workspace-docs/initiatives/[name]/prd.md`
- `@.interface-design/system.md`

### Structured Outputs

Agents often define structured output formats using:
- Markdown tables
- JSON schemas
- Code blocks with examples

### Phase/Workflow Integration

Agents reference:
- Initiative phases (discovery → define → build → validate → launch)
- Metadata files (`_meta.json`)
- Versioned folders (`v1/`, `v2/`)

---

## Complete Example Structure

```markdown
---
name: agent-name
description: Brief description. Use when [conditions]. Invoke for /command.
model: inherit
readonly: false
---

# Agent Name Subagent

[Core purpose paragraph]

## Clarification (Cursor 2.4)

[Clarification instructions]

## Before [Action]

Load context:
- `@workspace/path/to/file.md`

## Main Instructions

[Core workflow and principles]

## MCP Tools Available (Optional)

[Tool documentation]

## Output Format

[Expected output structure]

## Save Locations

[File paths]

## After [Action]

[Post-execution steps]

## Response Format

[User-facing response template]

## Anti-Patterns (Optional)

[What to avoid]
```

---

## Schema Validation Checklist

When creating or validating a subagent file, ensure:

- [ ] Frontmatter contains all required fields (`name`, `description`, `model`, `readonly`)
- [ ] `name` is kebab-case and matches filename (without `.md`)
- [ ] `description` includes when to use and which commands invoke it
- [ ] Content starts with `# [Agent Name] Subagent` title
- [ ] Core purpose is clearly stated
- [ ] Context files are specified in "Before [Action]" section
- [ ] Main workflow is documented
- [ ] Output format is specified
- [ ] Save locations are documented
- [ ] Post-execution steps are included
- [ ] File references use `@workspace/` syntax

---

## Parser Implementation Notes

### Frontmatter Parsing

1. Extract content between first `---` and second `---`
2. Parse as YAML
3. Validate required fields exist
4. Validate field types

### Content Parsing

1. Extract content after second `---`
2. Parse Markdown structure
3. Extract sections using heading levels (`##`, `###`)
4. Identify:
   - File references (lines starting with `- \``@`)
   - Code blocks (```)
   - Tables (| syntax)
   - Command references (`/command`)

### Key Extraction Points

- **Name**: From frontmatter `name` field
- **Description**: From frontmatter `description` field
- **Model**: From frontmatter `model` field
- **Readonly**: From frontmatter `readonly` field
- **Command Triggers**: Extract from `description` field (look for "Invoke for /command")
- **Context Files**: Extract from "Before [Action]" section
- **Output Format**: Extract from "Output Format" section
- **Save Locations**: Extract from "Save Locations" section
- **MCP Tools**: Extract from "MCP Tools Available" section (if present)

---

## References

- Sample agents:
  - `proto-builder.md` - Prototype building agent
  - `research-analyzer.md` - Research analysis agent
  - `validator.md` - Validation and jury evaluation agent
