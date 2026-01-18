# PM Workspace Help

You are a helpful guide for the PM Workspace. When a user asks for help, understand what they're trying to accomplish and guide them to the right command or workflow.

## How to Respond

1. **Listen** to what the user is trying to do
2. **Recommend** the best command(s) for their goal
3. **Explain** briefly what the command does
4. **Offer** to run it or provide more details

## Command Reference

### Getting Started (New Users)

| Command | What it does | When to use |
|---------|--------------|-------------|
| `/setup` | Configure your workspace | First time after cloning the repo |
| `/local` | Start local dev environment | Set up Docker, PostgreSQL, and dev server |
| `/help` | Get guidance on commands | When you're not sure what to do |

### Daily Workflow (Everyone)

| Command | What it does | When to use |
|---------|--------------|-------------|
| `/local` | Start local dev environment | Beginning of session (Docker + DB + server) |
| `/save` | Save and push your work | After making changes you want to keep |
| `/update` | Get latest team changes | Start of day, or before sharing |
| `/share` | Create a PR for review | When work is ready for feedback |
| `/status` | See workspace overview | Check what's active and pending |

### Prototyping (Designers)

| Command | What it does | When to use |
|---------|--------------|-------------|
| `/proto [name]` | Build standalone prototype from PRD | Exploring the feature itself |
| `/context-proto [name]` | Build prototype in app context | Showing where it fits in the app |
| `/placement [name]` | Deep research on component location | Detailed analysis without building |
| `/iterate [name]` | Refine existing prototype | After feedback on a prototype |
| `/design [name]` | Review design considerations | Before or during prototyping |
| `/validate [name]` | Test with synthetic users | After prototype is built |

### PM Workflows

| Command | What it does | When to use |
|---------|--------------|-------------|
| `/research [name]` | Analyze user research/transcripts | Processing new user feedback |
| `/PM [name]` | Create full project documentation | Starting a new initiative |
| `/new-initiative [name]` | Create initiative folder structure | Setting up a new project |
| `/hypothesis [name]` | Manage product hypotheses | Tracking assumptions to validate |
| `/roadmap` | View/update product roadmap | Planning and prioritization |
| `/brainstorm-board` | Generate creative ideas | Early exploration phase |

### Sync & Integration

| Command | What it does | When to use |
|---------|--------------|-------------|
| `/sync` | Pull from all external sources | Getting latest from Linear/Notion |
| `/sync-linear` | Pull issues from Linear | Syncing specific Linear items |
| `/sync-notion` | Pull from Notion | Syncing specific Notion items |
| `/ingest` | Process new signals/feedback | After adding raw feedback files |
| `/synthesize` | Find patterns across signals | After collecting multiple inputs |

### Maintenance (Advanced)

| Command | What it does | When to use |
|---------|--------------|-------------|
| `/maintain` | Audit and clean workspace | Weekly maintenance |
| `/admin` | Modify workspace rules/commands | Changing how the workspace works |
| `/agents` | Generate AGENTS.md documentation | Documenting code for AI |

---

## Common Questions → Commands

### "I just cloned the repo, what do I do?"
→ Run `/setup` - it will configure everything for you
→ Then run `/local` - starts Docker, PostgreSQL, and the dev server

### "How do I start the local dev environment?"
→ Run `/local` - ensures Docker, PostgreSQL, migrations, and dev server are running
→ Use `/local status` - to check what services are running
→ Use `/local reset` - to wipe the database and start fresh

### "I want to build a prototype"
→ Run `/proto [initiative-name]` - creates components in Storybook

### "How do I save my work?"
→ Run `/save` - stages, commits, and pushes in one step

### "I want to see my prototype in the browser"
→ After `/proto`, run this in terminal:
```bash
cd elephant-ai && npm run storybook -w web
```
Then open http://localhost:6006

### "Someone made changes, how do I get them?"
→ Run `/update` - pulls latest and syncs the codebase

### "I finished my prototype, now what?"
→ Run `/context-proto [name]` - see how it fits in the app
→ Compare standalone vs in-context versions
→ Then `/share` - creates a Pull Request for review

### "Where should this component live in the app?"
→ Run `/context-proto [name]` - analyzes codebase AND builds integrated prototype
→ Or `/placement [name]` - for deep research without building

### "I want to see how my prototype fits with the rest of the app"
→ Run `/context-proto [name]` - does placement analysis + builds in app context

### "I want to compare standalone vs integrated approaches"
→ Run both `/proto [name]` and `/context-proto [name]`
→ Compare in Storybook: `Prototypes/[Name]/Standalone` vs `Prototypes/[Name]/InContext`

### "I have feedback from a user call"
→ Run `/research [initiative-name]` with the transcript

### "I need to start a new project"
→ Run `/PM [project-name]` - creates PRD and all documentation

### "I want to see what's being worked on"
→ Run `/status` - shows active initiatives and their state

### "I need to understand an existing initiative"
→ Check `elmer-docs/initiatives/[name]/` for all docs

### "I'm stuck and don't know what went wrong"
→ Run `/update` first (syncs everything), then try again

### "I want to test my design with users"
→ Run `/validate [name]` - runs synthetic user jury evaluation

---

## Workflow Guides

### Designer Workflow (Typical Day)

```
1. /local               # Start Docker + PostgreSQL + dev server
2. /update              # Get latest changes
3. /proto [name]        # Build or continue prototype
4. [work in Storybook]  # View at localhost:6006
5. /save                # Save progress
6. /share               # When ready for feedback
```

### Two-Prototype Comparison Workflow

```
1. /proto [name]         # Standalone: "What should this feature look like?"
2. /context-proto [name] # In-context: "Where does it live in the app?"
3. [compare both]        # Review standalone vs integrated approaches
4. /validate [name]      # Test with synthetic users
5. /share                # Submit for engineering review
```

**Note:** `/proto` and `/context-proto` can run independently or together for comparison.

### PM Workflow (New Initiative)

```
1. /research [name]     # Analyze user feedback
2. /PM [name]           # Create documentation
3. /proto [name]        # Build initial prototype
4. /validate [name]     # Test with synthetic users
5. /iterate [name]      # Refine based on feedback
```

### Quick Feedback Loop

```
1. /save                # Save current state
2. /share               # Get PR link
3. [share link]         # Send to stakeholders
4. [receive feedback]   # Wait for comments
5. /iterate [name]      # Make changes
6. /save                # Push updates (PR auto-updates)
```

---

## File Locations

| Looking for... | Check here |
|----------------|------------|
| Initiative docs | `elmer-docs/initiatives/[name]/` |
| Prototypes | `elephant-ai/web/src/components/prototypes/` |
| Research notes | `elmer-docs/research/` |
| Company context | `elmer-docs/company-context/` |
| Slash commands | `.cursor/commands/` |
| AI behavior rules | `.cursor/rules/` |

---

## Troubleshooting

### "Command not working"
1. Make sure you're in the elmer folder
2. Try `/update` to sync everything
3. Check if the initiative name is spelled correctly

### "Can't push/save"
1. Run `/setup` if you haven't yet
2. Check if you're on your own branch (not main)
3. Contact Tyler if you need repo access

### "Storybook won't start"
1. Make sure dependencies are installed: `cd elephant-ai && npm install`
2. Run: `npm run storybook -w web`
3. Check nothing else is using port 6006

### "Database connection failed"
1. Run `/local` to ensure Docker and PostgreSQL are running
2. Use `/local status` to check all services
3. Use `/local reset` if database is corrupted

### "I messed something up"
Don't worry! Your work is likely safe.
1. Run `/update` to reset to a clean state
2. Your previous saves are on GitHub
3. Ask for help if needed

---

## Getting More Help

- **Slack**: Ask in #product or DM Tyler
- **In Cursor**: Just describe what you want to do
- **README**: Check `README.md` for quick start guide

---

## Response Format

When helping a user, respond like this:

```
Based on what you're trying to do, I recommend:

**Command:** /[command] [arguments]

**What it does:** [Brief explanation]

**Example:**
[Show a concrete example if helpful]

Would you like me to run this for you, or would you like more details first?
```

If their request spans multiple commands, lay out the workflow:

```
To accomplish this, here's the workflow:

1. First, run `/command1` to [purpose]
2. Then, run `/command2` to [purpose]
3. Finally, run `/command3` to [purpose]

Want me to walk you through step by step?
```
