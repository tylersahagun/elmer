# Command File Analysis Summary

Analysis of pm-workspace command files to understand command definition format and structure.

## Files Analyzed

1. `proto.md` - Prototype Command
2. `research.md` - Research Command
3. `pm.md` - PM Command
4. `validate.md` - Validate Command
5. `ingest.md` - Signal Ingest Command

## Key Findings

### 1. Standard Structure

All command files follow a consistent structure:

```
# [Command Name]
[Brief description]

## Usage
[Command syntax with examples]

## Behavior
[Delegation + execution steps]

## Prerequisites (optional)
[Required conditions]

## Output / Output Location (optional)
[Files/artifacts created]

## Next Steps (optional)
[Follow-up suggestions]
```

### 2. Delegation Patterns

Commands delegate execution in three ways:

#### A. Subagent Delegation
- **Pattern**: `**Delegates to**: [name] subagent`
- **Example**: `proto.md` → `proto-builder` subagent
- **Example**: `research.md` → `research-analyzer` subagent
- **Example**: `validate.md` → `validator` subagent
- **Example**: `ingest.md` → `signals-processor` subagent

#### B. Skill Delegation
- **Pattern**: `**Uses**: [name] skill`
- **Example**: `pm.md` → `prd-writer` skill

#### C. Direct Execution
- Commands that execute directly without delegation
- Not seen in analyzed files, but pattern exists

### 3. Parameter Patterns

#### Required Parameters
- Format: `[param-name]` in backticks
- Example: `` `/proto [initiative-name]` ``
- Example: `` `/research [initiative-name]` ``

#### Optional Instructions
- Format: Additional text after required params
- Example: `` `/proto hubspot-config add validation toggle` ``

#### Subcommands
- Format: Space-separated after command name
- Example: `` `/ingest transcript` ``
- Example: `` `/ingest ticket` ``
- Example: `` `/ingest issue [linear-id]` ``
- Example: `` `/ingest conversation` ``

#### Flags/Options
- Format: `` `--flag-name [value]` ``
- Example: `` `/validate [name] --phase [phase]` ``
- Example: `` `/validate [name] --criteria-only` ``

### 4. Routing Logic

Commands don't contain explicit routing logic. Instead:

1. **Delegation statement** indicates which handler to invoke
2. **Behavior steps** describe what the handler does
3. **Prerequisites** may trigger validation or pre-checks
4. **Next Steps** suggest follow-up commands (implicit routing)

### 5. Handler Invocation

#### Subagent Pattern
```markdown
## Behavior

**Delegates to**: `proto-builder` subagent

The subagent will:
1. Load PRD and Design Brief from initiative folder
2. Load design system from `.interface-design/system.md`
3. Create 2-3 creative options (Max Control, Balanced, Efficient)
...
```

**Parser Action**: When `/proto` is invoked, route to `proto-builder` subagent with:
- Command: `proto`
- Parameters: `[initiative-name]` and optional instructions
- Context: Initiative folder path

#### Skill Pattern
```markdown
## Behavior

**Uses**: `prd-writer` skill

This command will:
1. Load company context (product-vision, strategic-guardrails, personas)
2. Load existing research if available
3. **Check strategic alignment** before proceeding
...
```

**Parser Action**: When `/pm` is invoked, use `prd-writer` skill with:
- Command: `pm`
- Parameters: `[initiative-name]`
- Context: Company context files

### 6. Command Metadata

#### Command Name
- Extracted from H1 heading
- Normalized by removing "Command" suffix
- Example: `# Prototype Command` → `proto`

#### File Naming
- File name matches command name
- Example: `proto.md` → `/proto` command

#### Description
- First paragraph(s) after title
- Brief 1-3 sentence description

### 7. Execution Flow

Based on analyzed commands, execution flow is:

```
User invokes: /command [params]
    ↓
Parser reads: .cursor/commands/command.md
    ↓
Extracts: delegation target, parameters, prerequisites
    ↓
Validates: prerequisites (if any)
    ↓
Routes to: subagent OR skill OR direct execution
    ↓
Handler executes: steps defined in Behavior section
    ↓
Outputs: files/artifacts listed in Output section
    ↓
Suggests: Next Steps (if defined)
```

### 8. Special Sections

Some commands include specialized sections:

#### Graduation Criteria (`validate.md`)
- Defines phase transition requirements
- Used for validation logic

#### Signal Types (`ingest.md`)
- Table mapping subcommands to save locations
- Used for routing subcommands

#### Strategic Alignment Check (`pm.md`)
- Checklist of alignment requirements
- Used for pre-execution validation

### 9. Parameter Extraction Rules

#### Required Parameters
- Pattern: `[param-name]` in usage code blocks
- Type: Usually `initiative-name` (string)
- Validation: Check if initiative folder exists

#### Optional Parameters
- Pattern: Additional text after required params
- Type: Free-form instructions
- Example: "add validation toggle"

#### Flags
- Pattern: `--flag-name [value]` or `--flag-name`
- Type: Boolean or value
- Example: `--phase [phase]`, `--criteria-only`

#### Subcommands
- Pattern: Space-separated word after command
- Type: Enum (limited set of values)
- Example: `transcript`, `ticket`, `issue`, `conversation`

### 10. Handler Interface

Based on delegation patterns, handlers receive:

```typescript
interface CommandInvocation {
  command: string;           // e.g., "proto", "research"
  params: {
    required: Record<string, string>;  // e.g., { initiativeName: "hubspot-config" }
    optional?: string[];                // e.g., ["add", "validation", "toggle"]
    flags?: Record<string, string | boolean>;  // e.g., { phase: "build", criteriaOnly: true }
    subcommand?: string;                // e.g., "transcript"
  };
  context: {
    workspaceRoot: string;
    initiativePath?: string;
    // ... other context
  };
}
```

## Schema Summary

See `command-schema.md` for complete schema definition.

### Minimal Required Fields

1. **Title** (H1): Command name
2. **Description**: What the command does
3. **Usage**: Command syntax
4. **Behavior**: Delegation + execution steps

### Optional Fields

- Prerequisites
- Output/Output Location
- Examples
- Options/Flags
- Next Steps
- Special sections (Graduation Criteria, Signal Types, etc.)

## Parser Implementation Notes

### Step 1: Parse Markdown Structure
- Extract H1 as command name
- Extract first paragraph(s) as description
- Extract sections by `##` headings

### Step 2: Extract Usage
- Find `## Usage` section
- Parse code blocks for command syntax
- Extract parameters using regex: `\[(\w+)\]`
- Extract flags using regex: `--(\w+)(?:\s+\[(\w+)\])?`

### Step 3: Extract Behavior
- Find `## Behavior` section
- Extract delegation: `\*\*Delegates to\*\*:\s*`([^`]+)`` or `\*\*Uses\*\*:\s*`([^`]+)``
- Extract numbered list items as steps

### Step 4: Extract Optional Sections
- Prerequisites: Bullet list or paragraphs
- Output: Bullet list, table, or paragraphs
- Examples: Code blocks with context
- Next Steps: Bullet list or paragraphs

### Step 5: Build Command Object
- Create structured object with extracted data
- Validate required fields
- Return command definition for routing

## Differences from Local Commands

The pm-workspace commands are **simpler** than local `.cursor/commands/*.md` files:

| Aspect | pm-workspace | Local (elmer) |
|--------|--------------|---------------|
| **Purpose** | Command definition | Agent behavior rules |
| **Structure** | Simple, declarative | Detailed, instructional |
| **Delegation** | Explicit (`Delegates to`) | Implicit (in rules) |
| **Length** | ~50-100 lines | ~200-300 lines |
| **Focus** | What to do | How to do it |

**Recommendation**: Use pm-workspace format for command definitions, keep detailed rules in `.cursor/rules/` directory.
