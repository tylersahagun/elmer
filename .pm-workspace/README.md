# PM Workspace

> 🔒 **LOCAL ONLY** - This entire folder is gitignored and will never be pushed to the repository.

## Quick Start

### Syncing with Main Branch
```bash
bash .elmer/scripts/sync-main.sh
```

### Starting Prototype Storybook
```bash
cd prototypes && pnpm install && pnpm storybook
```

## Strategic Context (Start Here)

The `/company-context/` folder contains the strategic foundation that guides all PM work:

| File | Purpose |
|------|---------|
| `product-vision.md` | Core identity, mission, principles, anti-vision, leadership quotes |
| `strategic-guardrails.md` | Red flags, decision framework, alignment checks, pushback questions |
| `personas.md` | User personas with jobs-to-be-done and pain points |
| `tech-stack.md` | Technology overview |
| `integrations.md` | Integration landscape |

**The AI will automatically reference these** when using `/pm`, `/research`, or PRD commands and will push back if initiatives don't align.

## Folder Structure

```
.elmer/
├── company-context/          # Strategic foundation (vision, guardrails, personas)
│   ├── product-vision.md     # Mission, principles, anti-vision, leadership quotes
│   ├── strategic-guardrails.md # Red flags, decision framework, alignment checks
│   ├── personas.md           # User personas
│   ├── tech-stack.md         # Technology overview
│   └── integrations.md       # Integration landscape
├── floating-docs/            # Raw AI analysis outputs to synthesize
├── initiatives/              # Project-specific work
│   └── _template/            # Copy this for new initiatives
│       ├── prd.md
│       ├── research/
│       └── prototype/
├── research/                 # User research
│   ├── user-interviews/
│   ├── competitive/
│   └── leadership/           # Leadership conversation analysis
├── meeting-notes/            # Meeting documentation
├── knowledge-base-sync/      # Synced from Notion
├── agents-docs/              # AGENTS.md drafts
└── scripts/
    └── sync-main.sh          # Git sync helper
```

## Cursor Rules & Commands

### Commands (use with `/`)

| Command | Purpose |
|---------|---------|
| `/pm` | Strategic PM partner—asks clarifying questions, flags misalignment |
| `/research` | Analyze transcripts with strategic lens, flag red flags |
| `/proto` | Build prototypes in Storybook |
| `/new-initiative` | Create initiative folder structure |
| `/agents` | Generate AGENTS.md documentation |

### Rules (auto-activate on file patterns)

| Rule | Activates On | Purpose |
|------|-------------|---------|
| `prd-writer.mdc` | `**/prd*.md` | PRD structure with alignment checks |
| `research-analyst.mdc` | `research/**`, `meeting-notes/**` | Extract insights with strategic filter |
| `prototype-builder.mdc` | `prototypes/**` | Prototype building guidance |
| `agents-generator.mdc` | AGENTS.md work | Documentation generation |

## Strategic Alignment Built-In

The AI will now **automatically push back** when:

- 🚩 Outcomes are unclear ("What business outcome does this enable?")
- 🚩 Personas are vague ("Which persona—reps, leaders, CSMs, or RevOps?")
- 🚩 Evidence is missing ("What data supports this need?")
- 🚩 Revenue impact is fuzzy ("How does this help us land/expand/retain?")
- 🚩 Trust implications exist ("How does this interact with privacy?")
- 🚩 Anti-vision territory ("This sounds like 'better notes'—what's our unique angle?")

This ensures initiatives are well-formed before investing in PRDs or prototypes.

## Common Workflows

### Create a New Initiative
1. Copy `initiatives/_template/` to `initiatives/[your-initiative-name]/`
2. Fill out the PRD template
3. Add research notes as you gather them
4. Create prototypes in `prototypes/src/components/`

### Analyze a Leadership Conversation
1. Use `/research` command with the transcript
2. AI will extract insights AND flag strategic alignment
3. Review "Questions to Answer Before PRD" section
4. Address gaps before moving to PRD

### Create a Prototype
1. Add component in `prototypes/src/components/[ComponentName]/`
2. Create stories file with `.stories.tsx` extension
3. Run Storybook: `cd prototypes && pnpm storybook`
4. Document migration notes when ready

### Update Strategic Context
1. Add raw AI outputs to `floating-docs/`
2. Synthesize into `company-context/` files
3. The AI will automatically pick up the new context

## Tips

- Use `@` references in prompts to point AI to specific files
- Example: "Read @.elmer/company-context/product-vision.md and evaluate this proposal"
- The AI will read from main codebase but write only to local folders
- **Leadership quotes are in `product-vision.md`**—the AI will cite them when pushing back
