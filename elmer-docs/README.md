# PM Workspace Documentation

> This folder contains all PM documentation, research, and initiative artifacts for AskElephant.

## Strategic Context (Start Here)

The `/company-context/` folder contains the strategic foundation that guides all PM work:

| File | Purpose |
|------|---------|
| `product-vision.md` | Core identity, mission, principles, anti-vision, leadership quotes |
| `strategic-guardrails.md` | Red flags, decision framework, alignment checks, pushback questions |
| `personas.md` | User personas with jobs-to-be-done and pain points |
| `tech-stack.md` | Technology overview |
| `integrations.md` | Integration landscape |

**The AI will automatically reference these** when using any PM command and will push back if initiatives don't align.

---

## Natural Language Support

You don't need to memorize slash commands. Just describe what you want:

| Say this... | AI will... |
|-------------|------------|
| "I have a transcript from a customer call" | Suggest `/research` workflow |
| "Build a prototype for the settings page" | Suggest `/proto` workflow |
| "Save my work" | Auto-run `/save` |
| "What's the roadmap?" | Auto-run `/roadmap` |

The AI recognizes your intent and either executes simple commands automatically or confirms complex workflows before proceeding.

---

## Complete Commands Reference

### Core PM Workflows

| Command | Purpose |
|---------|---------|
| `/research [name]` | Analyze transcripts with strategic lens, flag red flags |
| `/PM [name]` | Create full project documentation (PRD, design brief, eng spec, GTM) |
| `/proto [name]` | Build prototypes in Storybook |
| `/new-initiative [name]` | Create initiative folder structure |

### Validation and Iteration

| Command | Purpose |
|---------|---------|
| `/validate [name]` | Run synthetic user jury evaluation |
| `/iterate [name]` | Refine existing prototype based on feedback |
| `/design [name]` | Review design considerations |
| `/measure [name]` | Generate measurement plan (PostHog events, funnels) |

### Git and Sharing

| Command | Purpose |
|---------|---------|
| `/save` | Stage, commit, and push all changes |
| `/update` | Pull latest changes and sync submodules |
| `/share` | Create Pull Request for review |

### Planning and Discovery

| Command | Purpose |
|---------|---------|
| `/hypothesis [name]` | Track product assumptions to validate |
| `/roadmap` | View/update product roadmap |
| `/brainstorm-board` | Generate creative ideas |
| `/status` | Show workspace overview |

### Signals and Sync

| Command | Purpose |
|---------|---------|
| `/ingest` | Process new signals/feedback |
| `/synthesize` | Find patterns across signals |
| `/sync` | Pull from all external sources |
| `/sync-linear` | Pull issues from Linear |
| `/sync-notion` | Pull from Notion |

### Maintenance and Admin

| Command | Purpose |
|---------|---------|
| `/maintain` | Audit and clean workspace |
| `/admin` | Modify workspace rules/commands |
| `/agents` | Generate AGENTS.md documentation |
| `/help` | Get command guidance |
| `/setup` | One-time workspace setup |

---

## Rules (auto-activate on file patterns)

| Rule | Activates On | Purpose |
|------|-------------|---------|
| `command-router.mdc` | Always | Recognize natural language intent, route to commands |
| `pm-copilot.mdc` | Always | Load company context, enforce strategic alignment |
| `elmer.mdc` | Always | Handle workflows with Notion integration |
| `prd-writer.mdc` | `**/prd*.md` | PRD structure with alignment checks |
| `research-analyst.mdc` | `research/**`, `meeting-notes/**` | Extract insights with strategic filter |
| `prototype-builder.mdc` | `prototypes/**` | Prototype building guidance |
| `context-orchestrator.mdc` | `initiatives/**` | Auto-load relevant context by initiative and phase |
| `jury-system.mdc` | Validation workflows | Synthetic user evaluation |
| `agents-generator.mdc` | AGENTS.md work | Documentation generation |

---

## Folder Structure

```
elmer-docs/
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
│       ├── research.md
│       ├── design-brief.md
│       ├── engineering-spec.md
│       └── gtm-brief.md
├── research/                 # User research
│   ├── user-interviews/
│   ├── competitive/
│   └── leadership/           # Leadership conversation analysis
├── hypotheses/               # Tracked product assumptions
├── personas/                 # Synthetic personas for jury system
├── signals/                  # Ingested feedback signals
├── meeting-notes/            # Meeting documentation
├── knowledge-base-sync/      # Synced from Notion
├── agents-docs/              # AGENTS.md drafts
└── scripts/                  # Automation scripts
```

---

## Strategic Alignment Built-In

The AI will **automatically push back** when:

- Outcomes are unclear ("What business outcome does this enable?")
- Personas are vague ("Which persona - reps, leaders, CSMs, or RevOps?")
- Evidence is missing ("What data supports this need?")
- Revenue impact is fuzzy ("How does this help us land/expand/retain?")
- Trust implications exist ("How does this interact with privacy?")
- Anti-vision territory ("This sounds like 'better notes' - what's our unique angle?")

This ensures initiatives are well-formed before investing in PRDs or prototypes.

---

## Common Workflows

### Create a New Initiative

1. Run `/new-initiative [name]` or copy `initiatives/_template/` to `initiatives/[name]/`
2. Fill out the PRD template
3. Add research notes as you gather them
4. Create prototypes with `/proto [name]`

### Analyze User Research

1. Use `/research [name]` command with the transcript
2. AI will extract insights AND flag strategic alignment
3. Review "Questions to Answer Before PRD" section
4. Address gaps before moving to PRD

### Create Project Documentation

1. Run `/PM [name]` after research is complete
2. AI creates PRD, design brief, engineering spec, GTM brief
3. Documents are synced to Notion automatically
4. Run `/proto [name]` to build prototype

### Create a Prototype

1. Run `/proto [name]` to build components
2. Components go in the configured prototype location (see `workspace-config.json`)
   - Default: `prototypes/src/components/[Name]/`
3. Run Storybook: `cd prototypes && npm run storybook`
4. Test with `/validate [name]`

### Update Strategic Context

1. Add raw AI outputs to `floating-docs/`
2. Synthesize into `company-context/` files
3. The AI will automatically pick up the new context

---

## Tips

- **Natural language works**: Just describe what you want and the AI will suggest the right command
- Use `@` references in prompts to point AI to specific files
- Example: "Read @elmer-docs/company-context/product-vision.md and evaluate this proposal"

---

## Hosted Deployment (Vercel)

The orchestrator can be deployed to Vercel, but the current implementation uses SQLite on disk. Vercel does **not** provide persistent local storage, so production hosting requires a hosted database.

### Recommended Path

1. **Move from SQLite to Postgres** (Neon or Supabase)
   - Update the Drizzle adapter and connection in `orchestrator/src/lib/db/index.ts`.
   - Re-run migrations against the hosted database.
2. **Configure Environment Variables**
   - `DATABASE_URL` for Postgres
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_APP_URL`
3. **Deploy to Vercel**
   - Connect the `orchestrator/` folder as the Vercel project root.
   - Ensure serverless functions have access to the hosted database.

### Notes

- Storybook/prototypes should remain local or deployed separately (e.g., Chromatic).
- File-based workflows (e.g., knowledge base files) should remain in the repo or move to an external storage bucket if used in production.
- **Leadership quotes are in product-vision.md** - the AI will cite them when pushing back
- Run `/save` often to back up your work
- Run `/update` at the start of each day to get latest changes
