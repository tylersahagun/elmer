# Help Command

Show available commands and guidance.

## Usage

```
/help                  # Show all commands
/help [command-name]   # Show specific command help
```

## Command Categories

### Core PM Workflows

| Command            | Description                                          |
| ------------------ | ---------------------------------------------------- |
| `/research [name]` | Analyze user research → `research-analyzer` subagent |
| `/pm [name]`       | Create PRD + docs → `prd-writer` skill               |
| `/proto [name]`    | Build Storybook prototype → `proto-builder` subagent |
| `/validate [name]` | Run jury evaluation → `validator` subagent           |
| `/iterate [name]`  | Refine with feedback → `iterator` subagent           |

### Quick Actions

| Command                  | Description                         |
| ------------------------ | ----------------------------------- |
| `/save`                  | Stage, commit, and push all changes |
| `/update`                | Pull latest and sync submodules     |
| `/status`                | Show workspace overview             |
| `/roadmap`               | View/update product roadmap         |
| `/new-initiative [name]` | Create initiative folder            |
| `/merge-initiative`      | Consolidate duplicate initiatives   |

### Design & Validation

| Command              | Description                     |
| -------------------- | ------------------------------- |
| `/design [name]`     | Review design considerations    |
| `/lofi-proto [name]` | Build quick wireframe prototype |

### Thinking & Growth

| Command    | Description                                  |
| ---------- | -------------------------------------------- |
| `/think`   | Guided brainstorming with probing questions  |
| `/teach`   | Teach-back challenge to deepen understanding |
| `/reflect` | Periodic reflection on values and growth     |
| `/unstick` | Problem reframing when blocked               |

### Signals & Sync

| Command           | Description                                         |
| ----------------- | --------------------------------------------------- |
| `/ingest`         | Process new signals/feedback                        |
| `/synthesize`     | Find patterns across signals                        |
| `/context-review` | Promote approved signal context into canonical docs |
| `/sync`           | Process inbox files                                 |
| `/feature-guide`  | Generate customer-facing feature guides             |

## Typical Workflow

```
1. /research [name]     # Analyze customer feedback
2. /pm [name]           # Create PRD and docs
3. /proto [name]        # Build prototype
4. /validate [name]     # Run jury evaluation
5. /iterate [name]      # Refine based on feedback
6. /save                # Commit your work
```

## Getting Started

- New initiative: `/new-initiative [name]`
- Have a transcript: `/research [name]` + paste content
- Ready to build: `/proto [name]`
- Check progress: `/status [name]`

## Architecture

This workspace uses:

- **Rules**: Lightweight always-applied context in `pm-foundation.mdc`
- **Skills**: Specialized knowledge packages in `.cursor/skills/`
- **Subagents**: Isolated context for complex workflows in `.cursor/agents/`
- **Commands**: Thin wrappers that delegate to skills/subagents

---

## Cursor 2.4 Features

| Feature                     | Usage                                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Image Generation**        | Say "generate an image of..." to create mockups, diagrams, or visualizations. Images save to `assets/`. |
| **Clarification Questions** | The agent can ask you questions mid-task when requirements are unclear.                                 |
| **Built-in Explore**        | Codebase research ("how does X work?") runs automatically via the `explore` subagent.                   |
| **Readonly Subagents**      | Some subagents (like `research-analyzer`, `validator`) run in read-only mode for safety.                |

### Image Generation Examples

```
"Generate an image of a dashboard mockup showing user engagement metrics"
"Create a visualization of the data flow between CRM and our system"
"Make a wireframe image of the mobile meeting view"
```

### Admin & Configuration

Use `/admin` to manage workspace configuration:

- Create/update rules, skills, subagents, commands
- See Cursor 2.4 file format documentation
- Archive unused configurations
