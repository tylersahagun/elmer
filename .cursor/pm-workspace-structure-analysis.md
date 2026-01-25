# PM Workspace .cursor/ Directory Structure Analysis

**Source Repository:** https://github.com/tylersahagun/pm-workspace  
**Analysis Date:** January 24, 2026

## Overview

The `.cursor/` directory in the pm-workspace repository is organized into four main subdirectories:
- `commands/` - Slash command definitions
- `skills/` - Reusable skill modules
- `agents/` - Subagent definitions
- `rules/` - Workspace behavior rules

---

## 1. `.cursor/commands/` Directory

### Structure
- **Type:** Flat file structure
- **File Extension:** `.md` (Markdown)
- **Naming Convention:** Kebab-case (lowercase with hyphens)

### Files (42 total)

#### Core PM Workflows
- `research.md` - Research analysis workflow
- `pm.md` - Product management documentation workflow
- `proto.md` - Prototype building workflow
- `context-proto.md` - Context-aware prototype workflow
- `lofi-proto.md` - Low-fidelity prototype workflow
- `placement.md` - Component placement analysis
- `new-initiative.md` - Create new initiative structure
- `iterate.md` - Iterate on existing prototypes
- `validate.md` - Validation workflow

#### Planning & Discovery
- `hypothesis.md` - Hypothesis management
- `roadmap.md` - Roadmap management
- `brainstorm-board.md` - Brainstorming workflow
- `design.md` - Design review workflow
- `design-handoff.md` - Design handoff workflow
- `design-system.md` - Design system management

#### Signals & Sync
- `ingest.md` - Ingest new signals/feedback
- `synthesize.md` - Synthesize patterns across signals
- `sync.md` - General sync workflow
- `sync-linear.md` - Linear sync
- `sync-github.md` - GitHub sync
- `sync-notion.md` - Notion sync
- `sync-dev.md` - Development sync
- `figma-sync.md` - Figma sync

#### Git & Sharing
- `save.md` - Save/commit workflow
- `update.md` - Update/pull workflow
- `share.md` - Create PR workflow

#### Status & Reporting
- `status.md` - Workspace status
- `status-all.md` - Comprehensive status
- `eod.md` - End of day summary
- `eow.md` - End of week summary
- `activity-reporter.md` - Activity reporting

#### Analytics & Measurement
- `posthog.md` - PostHog analytics integration

#### Maintenance & Admin
- `maintain.md` - Workspace maintenance
- `admin.md` - Admin operations
- `agents.md` - Agent management
- `setup.md` - Initial setup

#### Utilities
- `help.md` - Help/guidance
- `image.md` - Image handling
- `collab.md` - Collaboration workflow

### Naming Patterns
- Commands use descriptive kebab-case names
- No prefixes or suffixes
- Names directly reflect the command's purpose
- Examples: `research.md`, `sync-linear.md`, `status-all.md`

---

## 2. `.cursor/skills/` Directory

### Structure
- **Type:** Directory-based structure
- **Organization:** Each skill is a subdirectory
- **File Pattern:** Each skill directory contains a `SKILL.md` file
- **Naming Convention:** Kebab-case directory names

### Skills (19 total)

#### Analysis & Research
- `research-analyst/` - Research analysis capabilities
- `signals-synthesis/` - Signal synthesis capabilities
- `placement-analysis/` - Component placement analysis
- `roadmap-analysis/` - Roadmap analysis capabilities

#### Documentation & Generation
- `prd-writer/` - PRD writing capabilities
- `agents-generator/` - Agent generation capabilities
- `visual-digest/` - Visual digest generation
- `digest-website/` - Website digest capabilities

#### Prototyping & Design
- `prototype-builder/` - Prototype building capabilities
- `design-companion/` - Design companion capabilities

#### Validation & Testing
- `jury-system/` - Jury system for validation

#### Sync & Integration
- `github-sync/` - GitHub synchronization
- `linear-sync/` - Linear synchronization
- `notion-sync/` - Notion synchronization
- `slack-sync/` - Slack synchronization

#### Status & Reporting
- `initiative-status/` - Initiative status tracking
- `portfolio-status/` - Portfolio status tracking
- `activity-reporter/` - Activity reporting

#### Brainstorming
- `brainstorm/` - Brainstorming capabilities

### Internal Structure
Each skill directory follows this pattern:
```
skills/[skill-name]/
  └── SKILL.md
```

### Naming Patterns
- Skills use descriptive kebab-case names
- Names reflect the capability or domain
- Examples: `research-analyst/`, `prototype-builder/`, `github-sync/`

---

## 3. `.cursor/agents/` Directory

### Structure
- **Type:** Flat file structure
- **File Extension:** `.md` (Markdown)
- **Naming Convention:** Kebab-case (lowercase with hyphens)

### Agents (12 total)

#### Core Workflow Agents
- `research-analyzer.md` - Research analysis agent
- `proto-builder.md` - Prototype building agent
- `context-proto-builder.md` - Context-aware prototype builder
- `iterator.md` - Iteration agent
- `validator.md` - Validation agent

#### Documentation & Management
- `docs-generator.md` - Documentation generation agent
- `hypothesis-manager.md` - Hypothesis management agent
- `workspace-admin.md` - Workspace administration agent

#### Integration Agents
- `signals-processor.md` - Signal processing agent
- `figma-sync.md` - Figma synchronization agent
- `posthog-analyst.md` - PostHog analytics agent

### Naming Patterns
- Agents use descriptive kebab-case names
- Often end with role suffixes: `-analyzer`, `-builder`, `-manager`, `-processor`
- Names reflect the agent's primary responsibility
- Examples: `research-analyzer.md`, `proto-builder.md`, `workspace-admin.md`

---

## 4. `.cursor/rules/` Directory

### Structure
- **Type:** Flat file structure
- **File Extension:** `.mdc` (Markdown with Cursor-specific metadata)
- **Naming Convention:** Kebab-case (lowercase with hyphens)

### Rules (4 total)
- `pm-foundation.mdc` - Product management foundation rules
- `component-patterns.mdc` - Component organization patterns
- `cursor-admin.mdc` - Cursor administration rules
- `growth-companion.mdc` - Growth companion rules

### Naming Patterns
- Rules use descriptive kebab-case names
- File extension is `.mdc` (not `.md`)
- Names reflect the domain or concern
- Examples: `pm-foundation.mdc`, `component-patterns.mdc`

---

## Summary: File Naming Conventions

| Directory | Extension | Naming Pattern | Example |
|-----------|-----------|---------------|---------|
| `commands/` | `.md` | kebab-case | `research.md`, `sync-linear.md` |
| `skills/` | `SKILL.md` (inside dirs) | kebab-case directories | `research-analyst/SKILL.md` |
| `agents/` | `.md` | kebab-case | `research-analyzer.md` |
| `rules/` | `.mdc` | kebab-case | `pm-foundation.mdc` |

## Key Observations

1. **Consistent Naming:** All directories use kebab-case (lowercase with hyphens) consistently
2. **File Extensions:** 
   - Commands and agents use `.md`
   - Rules use `.mdc` (Cursor-specific)
   - Skills use `SKILL.md` inside directories
3. **Organization:**
   - Commands: Flat structure (42 files)
   - Skills: Directory-based (19 directories, each with `SKILL.md`)
   - Agents: Flat structure (12 files)
   - Rules: Flat structure (4 files)
4. **Total Files:**
   - Commands: 42 `.md` files
   - Skills: 19 directories × 1 `SKILL.md` each = 19 files
   - Agents: 12 `.md` files
   - Rules: 4 `.mdc` files
   - **Total: 77 files** (plus directory structure)

## Import Considerations

When importing an agent architecture from pm-workspace:

1. **Commands:** Parse all `.md` files in `.cursor/commands/`
2. **Skills:** Parse all `SKILL.md` files inside `.cursor/skills/[skill-name]/` directories
3. **Agents:** Parse all `.md` files in `.cursor/agents/`
4. **Rules:** Parse all `.mdc` files in `.cursor/rules/`

5. **Dependencies:** Check for cross-references between:
   - Commands → Skills (commands may reference skills)
   - Commands → Agents (commands may invoke agents)
   - Rules → Commands/Skills/Agents (rules may reference other components)

6. **File Parsing:** All files are Markdown-based, so a Markdown parser is sufficient for content extraction
