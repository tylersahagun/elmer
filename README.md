# PM Workspace

An AI-powered product management workspace for research, documentation, prototyping, and validation.

## What Is This?

PM Workspace is a Cursor-based environment that helps product managers:

- **Research** - Analyze user interviews and transcripts with strategic lens
- **Document** - Generate PRDs, design briefs, engineering specs, and GTM plans
- **Prototype** - Build interactive UI prototypes in Storybook
- **Validate** - Test designs with synthetic user personas

The workspace uses your product vision to keep all work strategically aligned, pushing back on misaligned requests and ensuring outcomes-focused thinking.

---

## Quick Start (5 minutes)

### 1. Install Cursor

Download [Cursor](https://cursor.sh) if you don't have it.

### 2. Clone or Fork This Repository

```bash
# Clone
git clone git@github.com:your-org/elmer.git
cd elmer

# Or fork first, then clone your fork
```

### 3. Open in Cursor

```bash
cursor .
```

### 4. Run Setup

Press `Cmd+K` (Mac) or `Ctrl+K` (Windows), type `/setup`, and press Enter.

The setup command will:
- Check your system has the right tools
- **Guide you through defining your product context** (vision, personas, outcomes)
- Optionally link your product codebase
- Install dependencies and verify everything works

That's it! Your workspace is configured for your product.

---

## Natural Language Support

You don't need to memorize slash commands. Just describe what you want:

| Say this...                                  | AI will...                     |
| -------------------------------------------- | ------------------------------ |
| "I have a transcript from a customer call"   | Suggest `/research` workflow   |
| "Build a prototype for the settings page"    | Suggest `/proto` workflow      |
| "Save my work"                               | Auto-run `/save`               |
| "What's the roadmap?"                        | Auto-run `/roadmap`            |
| "Help me understand the commands"            | Auto-run `/help`               |

The AI recognizes your intent and either executes simple commands automatically or confirms complex workflows before proceeding.

---

## Core Workflows

### 1. Research → Documentation → Prototype → Validate

```
/research [name]  →  Analyze user feedback/transcripts
        ↓
/PM [name]        →  Generate PRD, design brief, eng spec, GTM
        ↓
/proto [name]     →  Build interactive Storybook prototype
        ↓
/validate [name]  →  Test with synthetic user personas
        ↓
/iterate [name]   →  Refine based on feedback
```

### 2. Viewing Prototypes

```bash
cd prototypes
npm run storybook
```

Then open http://localhost:6006 and find your prototypes under "Prototypes" in the sidebar.

### 3. Saving Your Work

```
/save    # Commit and push all changes
/update  # Pull latest changes
/share   # Create a PR for review
```

---

## Complete Commands Reference

### Getting Started

| Command   | What it does                           |
| --------- | -------------------------------------- |
| `/setup`  | Guided workspace setup                 |
| `/help`   | Get guidance on available commands     |
| `/status` | See workspace overview and active work |

### Core PM Workflows

| Command                  | What it does                                                         |
| ------------------------ | -------------------------------------------------------------------- |
| `/research [name]`       | Analyze user research/transcripts with strategic lens                |
| `/PM [name]`             | Create full project documentation (PRD, design brief, eng spec, GTM) |
| `/proto [name]`          | Build Storybook prototype                                            |
| `/new-initiative [name]` | Create initiative folder structure                                   |

### Git & Sharing

| Command   | What it does            |
| --------- | ----------------------- |
| `/save`   | Save and push your work |
| `/update` | Get latest changes      |
| `/share`  | Create a PR for review  |

### Validation & Iteration

| Command            | What it does                                |
| ------------------ | ------------------------------------------- |
| `/validate [name]` | Test prototype with synthetic users         |
| `/iterate [name]`  | Refine existing prototype based on feedback |
| `/design [name]`   | Review design considerations                |

### Planning & Discovery

| Command              | What it does                          |
| -------------------- | ------------------------------------- |
| `/hypothesis [name]` | Track product assumptions to validate |
| `/roadmap`           | View/update product roadmap           |
| `/brainstorm-board`  | Generate creative ideas               |

### Signals & Sync

| Command        | What it does                   |
| -------------- | ------------------------------ |
| `/ingest`      | Process new signals/feedback   |
| `/synthesize`  | Find patterns across signals   |
| `/sync`        | Pull from all external sources |
| `/sync-linear` | Pull issues from Linear        |

### Maintenance & Admin

| Command     | What it does                     |
| ----------- | -------------------------------- |
| `/maintain` | Audit and clean workspace        |
| `/admin`    | Modify workspace rules/commands  |
| `/agents`   | Generate AGENTS.md documentation |

---

## Product Context

All work is guided by your product vision defined during `/setup`. The AI will:

- **Push back** on requests that don't align with your product vision
- **Ask clarifying questions** about outcomes, personas, and evidence
- **Reference your principles** when challenging unclear proposals

Key context files:

- `elmer-docs/company-context/product-vision.md` - Core identity and mission
- `elmer-docs/company-context/strategic-guardrails.md` - Alignment checks
- `elmer-docs/company-context/personas.md` - User personas
- `elmer-docs/workspace-config.json` - Workspace configuration

---

## Repository Structure

```
elmer/
├── product-repos/            # Optional: Product codebases as submodules
│   └── [repo-name]/
├── prototypes/               # Standalone prototypes (always available)
│   ├── src/
│   │   └── [ProjectName]/
│   └── package.json
├── elmer-docs/        # PM documentation
│   ├── company-context/      # Product vision, personas, guardrails
│   ├── initiatives/          # Project folders (one per initiative)
│   ├── research/             # User research
│   ├── hypotheses/           # Tracked assumptions
│   ├── personas/             # Synthetic personas for jury system
│   └── workspace-config.json # Configuration
├── .cursor/
│   ├── commands/             # Slash commands
│   └── rules/                # AI behavior rules
└── README.md
```

---

## Adding Product Codebases

You can optionally link your product codebase(s) as submodules:

```bash
git submodule add git@github.com:your-org/your-app.git product-repos/your-app
```

This enables:
- Building prototypes using your real components
- Referencing your codebase patterns
- Eventually promoting prototypes to production

Update `elmer-docs/workspace-config.json` to configure prototype paths.

---

## Troubleshooting

### "I can't push my changes"
You need push access to the repository.

### "Setup failed"
Make sure you have:
- Node.js 20+ installed (`node --version`)
- Git configured (`git config user.name`)

### "Storybook won't start"

```bash
cd prototypes
npm install
npm run storybook
```

### "I messed something up"
Don't worry! Run `/update` to reset, or ask for help.

---

## For Advanced Users

<details>
<summary>Manual Git Commands</summary>

The slash commands wrap these git operations:

```bash
# Save work
git add -A
git commit -m "Your message"
git push

# Update
git fetch origin main
git checkout main && git pull
git checkout your-branch
git rebase main

# Create branch
git checkout -b collab/yourname-$(date +%Y-%m-%d)
```

</details>

<details>
<summary>Submodule Management</summary>

```bash
# Add a submodule
git submodule add <repo-url> product-repos/<name>

# Initialize submodules
git submodule update --init --recursive

# Update to latest
git submodule update --remote product-repos/<name>
git add product-repos/<name>
git commit -m "Update submodule"
```

</details>

<details>
<summary>Workspace Configuration</summary>

Edit `elmer-docs/workspace-config.json`:

```json
{
  "workspace": {
    "name": "My PM Workspace",
    "initialized": true
  },
  "product": {
    "name": "My Product",
    "one_liner": "Description",
    "stage": "growth"
  },
  "repos": [
    {
      "name": "my-app",
      "path": "product-repos/my-app",
      "prototype_path": "src/components/prototypes/"
    }
  ],
  "prototypes": {
    "default_location": "prototypes/",
    "storybook_port": 6006
  }
}
```

</details>

---

## Creating Your Own PM Workspace

This repository can be used as a template. To create your own:

1. Fork or clone this repository
2. Run `/setup` to configure for your product
3. Start creating initiatives!

---

## Getting Help

- **In Cursor**: Just describe what you're trying to do and ask for help
- **Commands**: Type `/help` for command overview
