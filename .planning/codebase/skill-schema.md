# SKILL.md Format Schema

This document defines the schema and structure for SKILL.md files used in Cursor skills. Based on analysis of three sample skills from pm-workspace.

## Frontmatter Format (YAML)

### Required Fields

All SKILL.md files MUST start with YAML frontmatter delimited by `---`:

```yaml
---
name: skill-name
description: Brief description of what this skill does and when to use it
---
```

### Field Specifications

| Field | Type | Required | Constraints | Purpose |
|-------|------|----------|-------------|---------|
| `name` | string | ✅ Yes | Max 64 chars, lowercase letters/numbers/hyphens only | Unique identifier for the skill |
| `description` | string | ✅ Yes | Max 1024 chars, non-empty | Helps agent decide when to apply the skill (triggering mechanism) |

### Description Best Practices

The description is **critical** for skill discovery. It should:

1. **Be written in third person** (the description is injected into the system prompt)
   - ✅ Good: "Processes Excel files and generates reports"
   - ❌ Bad: "I can help you process Excel files"

2. **Include both WHAT and WHEN**:
   - WHAT: What the skill does (specific capabilities)
   - WHEN: When the agent should use it (trigger scenarios)

3. **Include trigger terms** that match user intent patterns

### Example Frontmatter

```yaml
---
name: prototype-builder
description: Build human-centric AI prototypes with multiple creative directions, required states, and interactive flow stories. Use when creating Storybook components or UI mockups.
---
```

```yaml
---
name: research-analyst
description: Extract actionable insights from user research, transcripts, and feedback with strategic alignment assessment. Use when analyzing any customer conversation, interview, or feedback document.
---
```

```yaml
---
name: jury-system
description: Condorcet Jury System for synthetic user validation. Use when running persona-based evaluation of prototypes, PRDs, or research findings.
---
```

### Optional Frontmatter Fields

Some skills may include additional metadata (not standard):

```yaml
---
name: skill-creator
description: Guide for creating effective skills...
metadata:
  short-description: Create or update a skill
---
```

**Note**: The standard format only requires `name` and `description`. Additional fields are skill-specific and not part of the core schema.

---

## Markdown Body Structure

### Common Section Patterns

Based on the analyzed skills, common sections include:

#### 1. Title Section
```markdown
# [Skill Name] Skill
```
or
```markdown
# [Skill Name]
```

#### 2. When to Use Section
```markdown
## When to Use

- Use case 1
- Use case 2
- Use case 3
```

#### 3. Core Principles / Design Principles
```markdown
## Design Principles

### Principle Name
- Explanation
- Examples
```

#### 4. Workflow / Process Sections
```markdown
## [Workflow Name]

### Step 1
Instructions...

### Step 2
Instructions...
```

#### 5. Templates / Patterns
```markdown
## [Template Name]

```markdown
Template content here
```
```

#### 6. Reference Tables
```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Value 1  | Value 2  | Value 3  |
```

#### 7. Code Examples
```markdown
```typescript
// Code example
```
```

#### 8. File Location References
```markdown
## Save Locations

| Type | Location |
|------|----------|
| Type 1 | `path/to/file.md` |
```

#### 9. Anti-Patterns / Quality Checks
```markdown
## Anti-Patterns

🚩 Pattern to avoid - Explanation
```

```markdown
## Quality Checks

Before trusting results:
- [ ] Check 1
- [ ] Check 2
```

### Section Hierarchy

Skills typically follow this structure:

```
# Title (H1)
## When to Use (H2)
## Core Principles / Design Principles (H2)
  ### Sub-principle (H3)
## Workflow / Process (H2)
  ### Step Name (H3)
## Templates / Patterns (H2)
## Reference Tables (H2)
## File Locations (H2)
## Anti-Patterns / Quality Checks (H2)
## Scripts Reference (H2) [if applicable]
```

---

## Key Fields Identification

### From Frontmatter

1. **name** - Skill identifier (lowercase, hyphens)
2. **description** - Trigger mechanism (includes WHAT + WHEN)

### From Body Content

3. **Triggers** - Usually in "When to Use" section or embedded in description
4. **Steps** - Usually in workflow/process sections
5. **Templates** - Code blocks or markdown templates
6. **File References** - Paths to other files (scripts, references, assets)
7. **Output Locations** - Where results should be saved

---

## File References and Paths

Skills may reference:

### 1. Scripts
```markdown
## Scripts Reference

Existing scripts in `path/to/scripts/`:
- `script_name.py` - Description
```

### 2. Reference Files
```markdown
Before analyzing ANY research, reference:
- `path/to/file.md` - Description
```

### 3. Output Locations
```markdown
## Save Locations

| Type | Location |
|------|----------|
| Type 1 | `path/to/output/` |
```

### 4. Asset References
```markdown
Generated images save to `assets/` by default
```

---

## Complete Schema Definition

### SKILL.md File Structure

```typescript
interface SkillFile {
  frontmatter: {
    name: string;           // Required, max 64 chars, lowercase-hyphens
    description: string;    // Required, max 1024 chars, includes WHAT + WHEN
    metadata?: {            // Optional, skill-specific
      [key: string]: any;
    };
  };
  
  body: {
    title: string;          // H1 heading
    sections: Section[];    // Array of markdown sections
  };
}

interface Section {
  level: number;            // Heading level (2-6)
  title: string;            // Section title
  content: string;          // Markdown content
  subsections?: Section[];   // Nested sections
}

interface FileReference {
  type: 'script' | 'reference' | 'output' | 'asset';
  path: string;
  description?: string;
}
```

### Parser Requirements

A SKILL.md parser should:

1. **Extract Frontmatter**
   - Parse YAML between `---` delimiters
   - Validate `name` (required, format, length)
   - Validate `description` (required, length)
   - Extract optional metadata

2. **Parse Markdown Body**
   - Extract H1 title
   - Identify all H2-H6 sections
   - Extract code blocks (with language)
   - Extract tables
   - Extract file references (paths in backticks or code blocks)
   - Extract lists (ordered/unordered)
   - Extract checkboxes

3. **Identify Key Elements**
   - "When to Use" section → triggers
   - Workflow sections → steps
   - Code blocks → templates/examples
   - File paths → references
   - Tables → structured data

4. **Validate Structure**
   - Frontmatter present and valid
   - Body has at least H1 title
   - File references are valid paths
   - Code blocks have appropriate language tags

---

## Example Parsed Structure

### prototype-builder.skill

```json
{
  "frontmatter": {
    "name": "prototype-builder",
    "description": "Build human-centric AI prototypes with multiple creative directions, required states, and interactive flow stories. Use when creating Storybook components or UI mockups."
  },
  "body": {
    "title": "Prototype Builder Skill",
    "sections": [
      {
        "level": 2,
        "title": "When to Use",
        "content": "- Creating new UI prototypes\n- Building Storybook stories\n..."
      },
      {
        "level": 2,
        "title": "Design Principles",
        "subsections": [
          {
            "level": 3,
            "title": "Trust Before Automation",
            "content": "- New features start as suggestions..."
          }
        ]
      }
    ]
  },
  "fileReferences": [
    {
      "type": "output",
      "path": "prototypes/[Initiative]/",
      "description": "Component structure location"
    }
  ]
}
```

---

## Validation Rules

### Frontmatter Validation

- ✅ `name` exists and is non-empty
- ✅ `name` matches pattern: `^[a-z0-9-]+$`
- ✅ `name` length ≤ 64 characters
- ✅ `description` exists and is non-empty
- ✅ `description` length ≤ 1024 characters
- ✅ YAML is valid and properly delimited

### Body Validation

- ✅ At least one H1 heading exists
- ✅ File references use valid path syntax
- ✅ Code blocks have language identifiers (when applicable)
- ✅ Tables are properly formatted
- ✅ No broken markdown syntax

### Content Quality Checks

- ✅ Description includes trigger terms ("Use when...")
- ✅ "When to Use" section present (recommended)
- ✅ Examples or templates provided (recommended)
- ✅ File references are documented (if applicable)

---

## Notes for Parser Implementation

1. **YAML Parsing**: Use a YAML parser (e.g., `yaml` in Node.js, `PyYAML` in Python) to parse frontmatter
2. **Markdown Parsing**: Use a markdown parser (e.g., `marked`, `markdown-it`, `remark`) to parse body
3. **Path Extraction**: Use regex to find paths in backticks: `` `path/to/file` ``
4. **Section Extraction**: Parse AST from markdown parser to extract heading hierarchy
5. **Code Block Detection**: Extract from markdown AST, preserve language tags
6. **Table Parsing**: Extract from markdown AST, convert to structured data

---

## References

- Sample skills analyzed:
  1. `prototype-builder/SKILL.md`
  2. `research-analyst/SKILL.md`
  3. `jury-system/SKILL.md`

- Skill creation guides:
  - `~/.cursor/skills-cursor/create-skill/SKILL.md`
  - `~/.codex/skills/.system/skill-creator/SKILL.md`
