# elephant-ai as Submodule: Architecture Recommendation

> Generated: 2026-03-04
> Context: Option 3 hybrid architecture (Elmer + PM workspace agents + elephant-ai)
> Problem: elephant-ai is declared as a submodule in pm-workspace but never initialized. Elmer has a manual stub copy of 2 prototypes, a standalone Storybook 8 app that doesn't import from real production components, and no live connection to the elephant-ai codebase.

---

## The Actual Current State

There are three separate, disconnected things named "prototypes":

| Location | What It Is | Connected to elephant-ai? |
|----------|-----------|--------------------------|
| `/Users/tylersahagun/Source/elephant-ai/apps/web/src/components/prototypes/` | Does not exist yet | N/A — the canonical target that doesn't exist yet |
| `/Users/tylersahagun/Source/elmer/prototypes/` | Standalone Storybook 8 app (`askelephant-prototypes`) with its own copied UI components | No — has its own shadcn copies |
| `/Users/tylersahagun/Source/elmer/elephant-ai/web/src/components/prototypes/` | Manual stub with 2 component files (CRMExperience, RepWorkspace) | No — no tsconfig, no package.json, no node_modules |
| `/Users/tylersahagun/Source/pm-workspace/elephant-ai/` | Git submodule mount point, completely empty (not initialized) | No — empty directory |

The design intent in the pm-workspace SKILL.md and Elmer's README is correct: prototypes should live at `elephant-ai/apps/web/src/components/prototypes/[InitiativeName]/v1/` and import from the real production component tree via the `@/` alias. That target doesn't currently exist.

**elephant-ai is on Storybook 9.1.x with `@storybook/react-vite`, pnpm workspaces, and Nx.** Elmer's prototypes app is Storybook 8.0 with its own build chain. These are incompatible.

---

## The Core Tension

You want:
1. **Prototypes to use real production components** — so they look and behave like the actual app
2. **Elmer to track and visualize prototypes** — project detail tab, Chromatic URLs, metadata
3. **Agents to build prototypes** — writing code into elephant-ai via Cursor
4. **Elmer to stay in sync with git changes in elephant-ai** — as main evolves, prototype context stays current

These four goals have different implications:

| Goal | Best Approach | Tension |
|------|--------------|---------|
| Real production components | Prototypes live inside elephant-ai's `apps/web/` | elephant-ai is a separate repo with its own CI/CD |
| Elmer tracks prototypes | Elmer stores metadata (Chromatic URL, path, status) | Elmer doesn't own the code |
| Agents build prototypes | Agents write files into elephant-ai via git | Agents need elephant-ai checked out locally |
| Stay in sync with git | Submodule OR separate clone + fetch | Submodule has UX friction; separate clone is simpler |

---

## Three Patterns, One Recommendation

### Pattern A: Git Submodule (pm-workspace owns the reference)

```
pm-workspace/
├── .gitmodules  →  elephant-ai @ specific commit
├── elephant-ai/  (initialized submodule)
│   └── apps/web/src/components/prototypes/
└── .cursor/agents/  (agents write into elephant-ai/)
```

**How it works:**
- Agents write prototype code directly into the initialized submodule at `elephant-ai/apps/web/src/components/prototypes/[Initiative]/v1/`
- Storybook runs from inside the submodule: `cd elephant-ai && pnpm storybook`
- Commits to the submodule are separate git operations (elephant-ai gets a PR, pm-workspace's submodule pointer updates)
- Elmer reads the Chromatic URL after build/deploy

**Pros:**
- Prototypes are in the real codebase, use real components, pass real CI
- Single source of truth for component code
- Clear separation: prototype code belongs to elephant-ai, metadata belongs to Elmer

**Cons:**
- Two-step commit: write to elephant-ai submodule, then update pm-workspace pointer
- Submodule must be initialized (`git submodule update --init --recursive`) on every fresh clone
- If elephant-ai moves fast (it does — 5+ commits/day), the submodule pointer goes stale quickly
- Agent needs to know to commit in the submodule, then in the parent

---

### Pattern B: Separate Clone + Elmer Workspace Config (Elmer owns the path)

```
~/Source/
├── elephant-ai/  (standalone clone, kept current via git pull)
│   └── apps/web/src/components/prototypes/
├── pm-workspace/  (no elephant-ai submodule)
│   └── .cursor/  (agents reference elephant-ai by configured path)
└── elmer/
    └── orchestrator/
        └── workspace settings: { githubRepo: "AskElephant/elephant-ai", prototypesPath: "apps/web/src/components/prototypes" }
```

**How it works:**
- elephant-ai lives as a standalone clone at a known path (e.g., `~/Source/elephant-ai`)
- Elmer workspace settings store: `githubRepo`, `baseBranch`, `prototypesPath`
- Agents read `workspace.settings.prototypesPath` to know where to write prototype files
- Storybook is already running at `localhost:6006` from the standalone elephant-ai clone
- Elmer's `write_repo_files` tool commits directly to elephant-ai's GitHub via Octokit
- Chromatic builds from elephant-ai's CI on merge to main

**Pros:**
- No submodule complexity -- elephant-ai is just a local directory
- `git pull origin main` in elephant-ai keeps it fresh independently
- Works with the Elmer architecture already in place (tools.ts uses `workspace.githubRepo`)
- Agents can reference production components without submodule initialization
- Most matches how the team actually works today

**Cons:**
- Depends on a local path convention (`~/Source/elephant-ai`) that must be configured per machine
- No version pinning -- prototype code may reference components that don't exist on main yet
- pm-workspace doesn't have a formal reference to which elephant-ai commit prototypes were built against

---

### Pattern C: elephant-ai as an Elmer Workspace + Registered Product Repo (Recommended)

```
elmer/
├── orchestrator/
│   ├── product-repos/   (gitmodules target)
│   │   └── elephant-ai/  (git submodule → AskElephant/elephant-ai)
│   └── workspace settings:
│       githubRepo: "AskElephant/elephant-ai"
│       baseBranch: "main"
│       contextPaths: ["apps/web/src/components/", "packages/"]
│       prototypesPath: "apps/web/src/components/prototypes"
│       storybookPort: 6006
```

**How it works:**

1. **Elmer's `product-repos/` becomes real.** The `.gitmodules` template in Elmer is already written for this. Add elephant-ai: `git submodule add git@github.com:AskElephant/elephant-ai.git product-repos/elephant-ai`

2. **Elmer's workspace settings configure the connection.** The `workspace.settings` fields (`githubRepo`, `baseBranch`, `prototypesPath`, `storybookPort`) are already in the schema. Wire them to the elephant-ai submodule path.

3. **Agents write into the submodule.** When a prototype-building agent runs, it writes files into `product-repos/elephant-ai/apps/web/src/components/prototypes/[Initiative]/v1/` -- real files, real component code, using `@/` imports that resolve within elephant-ai's build context.

4. **Storybook runs from the submodule.** Elmer's workspace can provide a "Preview Storybook" button that runs `pnpm storybook` inside the submodule. The `storybookPort` setting tells Elmer where to iframe the preview.

5. **Chromatic deploy is triggered on commit.** The existing `deploy_chromatic` tool runs against the submodule. Elmer stores the resulting Chromatic URL in the `prototypes` table.

6. **Submodule syncs on demand, not continuously.** When the team needs the latest production components available for prototyping, they run `/update` (which already calls `git submodule update`) or Elmer triggers a submodule fetch as part of the workspace sync flow.

**Key insight:** The submodule doesn't need to be pinned to a specific commit. It should track `main` and be fetched before major prototype-building sessions. This gives you:
- Current production components when building prototypes
- A formal link between Elmer and elephant-ai (not just a path convention)
- Version tracking: the submodule commit pointer records which version of elephant-ai the prototype was built against

---

## Recommended Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Elmer (orchestrator)                                            │
│                                                                  │
│  Workspace Settings:                                             │
│    githubRepo: "AskElephant/elephant-ai"                         │
│    baseBranch: "main"                                            │
│    prototypesPath: "apps/web/src/components/prototypes"          │
│    storybookPort: 6006                                           │
│    cursorDeepLinkTemplate: "cursor://..."                        │
│                                                                  │
│  product-repos/                                                  │
│    elephant-ai/  ← git submodule (AskElephant/elephant-ai@main) │
│      apps/web/                                                   │
│        src/components/                                           │
│          prototypes/           ← agents write here              │
│            meeting-summary/v1/                                   │
│            engagement-tracking/v1/                               │
│          primitives/           ← agents import from here         │
│          ui/                   ← agents import from here         │
│          [domain]/             ← agents import from here         │
│        .storybook/             ← Storybook 9.1, react-vite       │
│                                                                  │
│  Prototypes table:                                               │
│    { projectId, path, chromaticUrl, branch, commit, status }    │
└─────────────────────────────────────────────────────────────────┘
         │ write_repo_files (Octokit)       │ deploy_chromatic
         ▼                                  ▼
┌──────────────────────┐     ┌──────────────────────────────┐
│  Cursor Agents       │     │  Chromatic                    │
│  (write prototype    │     │  (builds Storybook, deploys,  │
│   component files)   │     │   returns URL to Elmer)       │
└──────────────────────┘     └──────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│  GitHub (AskElephant/elephant-ai)                             │
│  PR: "feat(prototypes): add meeting-summary v1"               │
│  Branch: prototypes/meeting-summary-v1                        │
│  CI: pnpm build, pnpm storybook:build, chromatic deploy       │
└──────────────────────────────────────────────────────────────┘
```

---

## Migration Steps

### Step 1: Activate Elmer's product-repos submodule (30 min)

```bash
cd /Users/tylersahagun/Source/elmer
git submodule add git@github.com:AskElephant/elephant-ai.git product-repos/elephant-ai
git commit -m "feat: add elephant-ai as product repo submodule"
```

### Step 2: Configure Elmer workspace settings (15 min)

In Elmer's workspace settings UI (Settings > General):
- `githubRepo`: `AskElephant/elephant-ai`
- `baseBranch`: `main`
- `prototypesPath`: `apps/web/src/components/prototypes`
- `storybookPort`: `6006`

Or via the workspace settings API:
```json
{
  "githubRepo": "AskElephant/elephant-ai",
  "baseBranch": "main",
  "prototypesPath": "apps/web/src/components/prototypes",
  "storybookPort": 6006
}
```

### Step 3: Wire Elmer's execution context to the submodule path (1-2 days)

In `orchestrator/src/lib/execution/providers.ts`, the `workspacePath` needs to resolve to the submodule:

```typescript
// Current (generic)
workspacePath: workspace.settings?.workspacePath ?? process.cwd()

// New: resolve product-repos submodule path
workspacePath: path.join(
  process.cwd(),
  'product-repos',
  repoName(workspace.settings?.githubRepo ?? '')
)
```

### Step 4: Update Elmer's prototype-related MCP tools (2-3 days)

The MCP server's `build-standalone-prototype` and `build-context-prototype` tools need to:
1. Resolve the prototype path: `${submodulePath}/${settings.prototypesPath}/${initiativeName}/v1/`
2. Read available production components from the submodule's component tree
3. Generate real component code that uses `@/` imports (which resolve within elephant-ai's Vite config)
4. Write files into the submodule via the filesystem (local) or `write_repo_files` tool (remote)

### Step 5: Update pm-workspace's submodule (15 min)

```bash
cd /Users/tylersahagun/Source/pm-workspace
git submodule init
git submodule update --remote elephant-ai
```

Update `.cursor/skills/prototype-system/SKILL.md` to reference the submodule path for local development.

### Step 6: Remove the disconnected copies (1 hour)

- Delete `elmer/elephant-ai/` (the manual stub -- replace with the real submodule in `product-repos/`)
- Keep `elmer/prototypes/` but mark it as legacy; migrate any reusable components into elephant-ai

### Step 7: Update Storybook references (1 day)

Ensure the Storybook preview URL in Elmer's project detail (`/projects/[id]` → Prototypes tab) pulls from the elephant-ai Chromatic project (`chpt_b6891b...`), not the standalone `askelephant-prototypes` Chromatic project (`696c2c54e35ea5bca2a772d8`).

---

## Submodule Lifecycle: Staying Current with git changes

The main concern is keeping the submodule current as elephant-ai evolves (5+ commits/day on main).

**Don't track `HEAD` automatically.** That would break prototype builds if someone merges a breaking change.

**Instead, use a "sync before build" pattern:**

```bash
# Before any prototype-building session, pull latest elephant-ai components
cd product-repos/elephant-ai
git fetch origin main
git checkout main
git pull --ff-only
cd ../../
git add product-repos/elephant-ai
git commit -m "chore: sync elephant-ai submodule to latest main"
```

Elmer can expose this as a workspace action: **"Sync product repo"** button in settings that runs this sequence and updates the submodule pointer in Elmer's git history.

**For CI/CD in Elmer:** The `deploy_chromatic` execution should run `git submodule update --remote product-repos/elephant-ai` before building, so Chromatic always builds against the latest elephant-ai components.

---

## What Agents Need to Know

The pm-foundation rule and prototype-system skill need a small update to make this concrete for agents:

```markdown
## Prototype Location

Prototypes live in the elephant-ai submodule at:
  product-repos/elephant-ai/apps/web/src/components/prototypes/[InitiativeName]/v1/

Import path alias: @/ resolves to product-repos/elephant-ai/apps/web/src/
  → @/components/primitives/button  (preferred)
  → @/components/ui/calendar
  → @/components/[domain]/[component]

Run Storybook: cd product-repos/elephant-ai && pnpm storybook
  → http://localhost:6006
  → Story title: Prototypes/[InitiativeName]/[ComponentName]
```

---

## What Elmer Stores vs. What elephant-ai Stores

| Data | Stored In | Format |
|------|----------|--------|
| Prototype component code | elephant-ai repo | `.tsx` files |
| Prototype metadata | Elmer `prototypes` table | `{ projectId, path, chromaticUrl, branch, commit }` |
| Which elephant-ai commit prototype was built against | Elmer `prototypes.metadata.elephantAiCommit` | SHA |
| Storybook URL (local) | Elmer workspace settings | `http://localhost:6006` |
| Chromatic URL (published) | Elmer `prototypes.chromaticStorybookUrl` | `https://main--[token].chromatic.com` |
| Component registry (what exists) | Read from elephant-ai submodule at build time | Filesystem scan |
| Prototype notes / feedback | Elmer `documents` table (type: prototype_notes) | Markdown |
| Jury evaluation results | Elmer `juryEvaluations` table | JSON |

---

## Answers to the Original Questions

**"I want it to be able to reference the code that exists"**
→ Pattern C (submodule in `product-repos/`) gives agents read access to all production components at `product-repos/elephant-ai/apps/web/src/components/`. The component-registry scan that prototype-system uses can be a filesystem scan of this path.

**"But also be up to date with git changes"**
→ Don't auto-track HEAD. Instead: sync the submodule pointer before prototype-building sessions via the "Sync product repo" action. This gives you a stable build environment while keeping access to recent components.

**"Storybook should be able to actually build code inside of it"**
→ Storybook 9.1 already exists in elephant-ai. Prototype files written to `apps/web/src/components/prototypes/` are automatically picked up by the existing stories glob (`'../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'`). No Storybook config changes needed.

**"Access components and use the UI for prototypes information"**
→ The `@/` alias in elephant-ai's Vite config resolves to `apps/web/src/`. Prototype components use the same import path as production code. This is already how the pm-workspace prototype-system skill expects prototypes to be written.

**"I don't actually know the best way to have this as part of Elmer"**
→ Elmer owns the **metadata** (Chromatic URL, path, status, commit, jury results), not the **code**. The code lives in elephant-ai. Elmer connects to it via the submodule in `product-repos/` and the existing GitHub writeback tools. This is the cleanest separation: Elmer orchestrates, elephant-ai stores runnable code.
