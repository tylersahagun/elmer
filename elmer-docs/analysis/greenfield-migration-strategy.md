# Greenfield Migration Strategy (Docs, Agents, Prompts)

Date: 2026-02-01
Goal: Reuse existing knowledge assets (docs, prompts, workflows) in a new app without reusing runtime code.

## Migration Principles

- **Asset-first**: reuse prompts, workflows, and docs as structured data.
- **No runtime reuse**: rebuild the execution engine and persistence.
- **Traceability**: every migrated artifact keeps provenance.
- **Tenant isolation**: migration per team/workspace, no context bleed.

## Inputs To Migrate

### 1) Agent assets

- `.cursor/agents/*` (role definitions, instructions)
- `.cursor/skills/*/SKILL.md` (procedures)
- `.cursor/commands/*` (routing behavior)

### 2) Docs and artifacts

- `elmer-docs/initiatives/**` (PRD, research, prototype notes, validation)
- `pm-workspace-docs/**` (status, signals, analysis, plans)
- `elmer-docs/company-context/**` (vision, guardrails, personas, tech stack)

## Target Storage Model

### Agents

- `Agent` table: identity, role, persona, model, tools, memory policy
- `AgentTemplate` table: reusable preset for new teams
- `AgentPrompt` table: system prompt + procedural blocks

### Docs

- `InitiativeDoc` table: typed documents (PRD, design, eng, GTM)
- `Artifact` table: prototype links, validation reports, citations
- `ContextDoc` table: vision, guardrails, personas, tech stack

### Signals

- `Signal` table: source, content, metadata, classification
- `SignalDigest` table: daily/weekly synthesis output

## Migration Steps

### Step 1: Inventory and normalize

- Index all agent files, skills, and commands.
- Normalize prompts into structured blocks: system, process, output format.
- Normalize docs into `type + content + source_path`.

### Step 2: Transform into structured records

- Convert agent YAML frontmatter into agent metadata.
- Convert skill sections into procedural steps.
- Extract commands as routing rules with intent patterns.

### Step 3: Load into new app

- Seed `ContextDoc` (vision, guardrails, personas).
- Seed `AgentTemplate` records from agents/skills.
- Seed existing initiatives and artifacts.

### Step 4: Verify with traceability checks

- Each record stores `source_path` and `hash`.
- Spot-check 10% of records for fidelity.
- Validate agent output matches expected format.

## Example Mappings

### Agent file to AgentTemplate

Source: `.cursor/agents/proto-builder.md`
Target:

- AgentTemplate.name = "proto-builder"
- AgentTemplate.systemPrompt = <full prompt>
- AgentTemplate.tools = ["readFile", "writeFile", "generateImage", "executeCommand"]

### Initiative docs

Source: `elmer-docs/initiatives/[slug]/prd.md`
Target:

- InitiativeDoc.type = "prd"
- InitiativeDoc.content = <markdown>
- InitiativeDoc.initiativeSlug = [slug]
- InitiativeDoc.sourcePath = original path

## Migration Risks and Mitigations

- **Prompt drift**: lock version with hashes, enable per-team overrides.
- **Missing metadata**: enforce required fields during import.
- **Loss of context**: preserve `source_path` and add provenance links.

## Success Criteria

- All core agents available as templates in the new app.
- All initiatives imported with docs and artifacts.
- Context docs visible to planner and worker agents.
