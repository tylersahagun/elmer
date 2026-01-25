# .mdc Rule File Schema

This document defines the schema for Cursor rule files using the `.mdc` (Markdown with Cursor) format. These files configure AI behavior and context loading in the workspace.

## File Structure

Every `.mdc` rule file follows this structure:

```
---
[YAML Frontmatter]
---

[Markdown Content]
```

## Frontmatter Schema

The frontmatter is YAML metadata that controls when and how the rule is applied.

### Required Fields

None. All fields are optional, but at least one of `globs` or `alwaysApply` should be set.

### Field Definitions

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `description` | `string` | No | `null` | Human-readable description of what this rule does. Used for documentation and rule discovery. |
| `globs` | `string[]` \| `null` | No | `null` | Array of glob patterns that trigger this rule when matching files are edited. If `null` or empty array, rule is not file-triggered. |
| `alwaysApply` | `boolean` | No | `false` | If `true`, this rule is always active regardless of file context. If `false`, rule only activates when glob patterns match. |

### Frontmatter Examples

#### Always-Applied Rule (No File Triggers)

```yaml
---
description: 'Intelligent command routing - recognizes natural language intent and maps to slash commands'
globs:
alwaysApply: true
---
```

**Notes:**
- `globs:` with no value (null/empty) means no file triggers
- `alwaysApply: true` makes it always active
- Used for workspace-wide behavior rules

#### File-Triggered Rule (Not Always Applied)

```yaml
---
description: "Enforce Storybook standards for all UI components"
globs: ["prototypes/src/components/**/*.tsx", "!prototypes/src/components/**/*.stories.tsx"]
alwaysApply: true
---
```

**Notes:**
- `globs` array specifies file patterns
- Negative patterns (`!`) exclude files
- `alwaysApply: true` means it's always active AND triggers on matching files

#### File-Triggered Only Rule

```yaml
---
description: 'Workspace maintenance agent - validates structure and keeps files synchronized'
globs: ['**/_meta.json', '**/roadmap.json', '**/_index.json']
alwaysApply: false
---
```

**Notes:**
- `alwaysApply: false` means rule only activates when glob patterns match
- Used for context-specific rules that only apply to certain file types

## Content Structure

The markdown content after the frontmatter contains the actual rule instructions. While there's no strict schema, common patterns include:

### Common Sections

1. **Title** - `# Rule Name` (first heading)
2. **Description** - What the rule does
3. **Trigger Conditions** - When the rule activates (if not always-applied)
4. **Behavior/Instructions** - What the AI should do
5. **Examples** - Usage examples
6. **Reference Links** - Links to related rules or docs

### Content Examples

#### Always-Applied Rule Content

```markdown
# Command Router

You intelligently recognize user intent and route to the appropriate slash command workflow...

## Company Context Foundation

**CRITICAL**: Before executing ANY PM-related workflow, ALWAYS load:
1. `@elmer-docs/company-context/product-vision.md`
...
```

#### File-Triggered Rule Content

```markdown
# Storybook Standards

**CRITICAL**: Every UI component MUST have a corresponding Storybook story...

## Mandatory Rule

When creating or modifying a `.tsx` component file in `prototypes/src/components/`:
1. **Check for existing story file**: Look for `[ComponentName].stories.tsx`
2. **Create story if missing**: Every component needs stories
...
```

## Rule Activation Logic

Rules are activated based on the frontmatter configuration:

### Activation Matrix

| `alwaysApply` | `globs` | Activation Behavior |
|---------------|---------|---------------------|
| `true` | `null` or `[]` | Always active, no file triggers |
| `true` | `["pattern"]` | Always active AND triggers on matching files |
| `false` | `null` or `[]` | Never active (invalid configuration) |
| `false` | `["pattern"]` | Only active when editing files matching glob patterns |

### Glob Pattern Syntax

Glob patterns follow standard glob syntax:

- `**/*.tsx` - All `.tsx` files recursively
- `prototypes/**/*.tsx` - All `.tsx` files under `prototypes/`
- `!**/*.stories.tsx` - Exclude story files (negative pattern)
- `**/_meta.json` - All `_meta.json` files recursively
- `['**/_meta.json', '**/roadmap.json']` - Multiple patterns (OR logic)

### Pattern Matching

- Patterns are matched against file paths relative to workspace root
- Negative patterns (`!`) exclude matches
- Multiple patterns use OR logic (file matches if it matches any pattern)
- Patterns are case-sensitive

## Rule Priority

When multiple rules are active:

1. **Always-applied rules** (`alwaysApply: true`) are always loaded
2. **File-triggered rules** are loaded when their glob patterns match
3. Rules are combined additively (all active rules apply)
4. No explicit priority/ordering system (rules should be independent)

## Schema Validation

A valid `.mdc` rule file must:

1. ✅ Start with YAML frontmatter delimited by `---`
2. ✅ Have valid YAML syntax in frontmatter
3. ✅ Have at least one of: `alwaysApply: true` OR non-empty `globs` array
4. ✅ Have markdown content after frontmatter
5. ✅ Use `.mdc` file extension

### Invalid Configurations

❌ **No activation method:**
```yaml
---
description: 'Rule with no activation'
globs: []
alwaysApply: false
---
```
*This rule would never activate*

❌ **Invalid YAML:**
```yaml
---
description: 'Unclosed string
globs: []
---
```
*YAML syntax error*

❌ **Missing frontmatter:**
```markdown
# Rule without frontmatter
This rule has no YAML frontmatter.
```
*No metadata to determine activation*

## Parser Implementation Guide

To parse `.mdc` rule files:

### Step 1: Extract Frontmatter

```typescript
function parseMDC(fileContent: string) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = fileContent.match(frontmatterRegex);
  
  if (!match) {
    throw new Error('Invalid .mdc file: missing frontmatter');
  }
  
  const [, yamlContent, markdownContent] = match;
  return { yamlContent, markdownContent };
}
```

### Step 2: Parse YAML

```typescript
import yaml from 'yaml';

function parseFrontmatter(yamlContent: string) {
  const parsed = yaml.parse(yamlContent);
  
  return {
    description: parsed.description || null,
    globs: parsed.globs || null,
    alwaysApply: parsed.alwaysApply ?? false,
  };
}
```

### Step 3: Validate Schema

```typescript
function validateRule(rule: ParsedRule) {
  const hasGlobs = rule.globs && rule.globs.length > 0;
  const isAlwaysApplied = rule.alwaysApply === true;
  
  if (!hasGlobs && !isAlwaysApplied) {
    throw new Error('Rule must have either globs or alwaysApply: true');
  }
  
  return true;
}
```

### Step 4: Determine Activation

```typescript
function shouldActivateRule(rule: ParsedRule, filePath: string): boolean {
  // Always-applied rules are always active
  if (rule.alwaysApply) {
    return true;
  }
  
  // File-triggered rules only activate on matching files
  if (rule.globs && rule.globs.length > 0) {
    return rule.globs.some(pattern => matchesGlob(filePath, pattern));
  }
  
  return false;
}
```

## Example Rule Files

### Example 1: Always-Applied Rule

**File:** `.cursor/rules/command-router.mdc`

```yaml
---
description: 'Intelligent command routing - recognizes natural language intent and maps to slash commands'
globs:
alwaysApply: true
---
```

**Activation:** Always active

### Example 2: File-Triggered + Always Applied

**File:** `.cursor/rules/storybook-standards.mdc`

```yaml
---
description: "Enforce Storybook standards for all UI components"
globs: ["prototypes/src/components/**/*.tsx", "!prototypes/src/components/**/*.stories.tsx"]
alwaysApply: true
---
```

**Activation:** Always active, and also triggers when editing matching `.tsx` files

### Example 3: File-Triggered Only

**File:** `.cursor/rules/workspace-maintenance.mdc`

```yaml
---
description: 'Workspace maintenance agent - validates structure and keeps files synchronized'
globs: ['**/_meta.json', '**/roadmap.json', '**/_index.json']
alwaysApply: false
---
```

**Activation:** Only when editing `_meta.json`, `roadmap.json`, or `_index.json` files

## Best Practices

1. **Descriptive descriptions** - Use clear, concise descriptions for rule discovery
2. **Specific globs** - Use precise glob patterns to avoid unintended activation
3. **Independent rules** - Rules should be self-contained and not depend on order
4. **Documentation** - Include examples and usage patterns in content
5. **Validation** - Validate glob patterns against actual file structure

## Related Files

- Rule files are stored in `.cursor/rules/`
- Rule metadata can be indexed for discovery
- Rules can reference other rules via markdown links
- Rules can reference workspace files via `@` syntax (e.g., `@elmer-docs/...`)
