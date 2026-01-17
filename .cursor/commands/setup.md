# PM Workspace Setup

Guided setup for new workspaces. This command walks through product context definition, workspace configuration, and optional repository linking.

## Overview

The setup process has 4 phases:

1. **System Check** - Verify tools are installed
2. **Product Context** - Define your product vision through conversation
3. **Repository Setup** - Optionally add product codebases
4. **Verification** - Test that everything works

---

## Phase 1: System Check

Run these checks first:

### Check Node.js

```bash
node --version
```

**Required:** Node.js 20 or higher

If not installed:

- macOS: `brew install node` or use nvm: `nvm install 20 && nvm use 20`
- Download: https://nodejs.org/

### Check Git Configuration

```bash
git config user.name && git config user.email
```

If either is empty, prompt the user:

```
To save your work, Git needs to know who you are.

What name should appear on your changes? (e.g., "Jane Designer")
> [wait for input]

What's your email? (e.g., "jane@company.com")
> [wait for input]
```

Then run:

```bash
git config user.name "[their name]"
git config user.email "[their email]"
```

---

## Phase 2: Product Context Generation

This is the core of setup. Guide the user through defining their product context via conversation.

### Step 2.1: Product Basics

Ask:

```
Let's set up your product context. I'll ask a few questions to understand what you're building.

**1. What's your product called?**
> [wait for product name]

**2. Describe it in one sentence** (e.g., "A platform that helps sales teams close deals faster")
> [wait for one-liner]

**3. What stage is your product at?**
- idea (just exploring)
- prototype (testing concepts)
- mvp (first users)
- growth (scaling)
- scale (enterprise)
- mature (optimizing)
> [wait for stage]
```

### Step 2.2: Target Market & Personas

Ask:

```
**4. Who are your primary users?** (Name 1-3 roles/personas)
Example: "Sales reps, Sales managers, RevOps analysts"
> [wait for personas]

**5. What market are you targeting?**
Example: "Mid-market B2B SaaS companies with 50-500 employees"
> [wait for target market]
```

### Step 2.3: Outcomes & North Star

Ask:

```
**6. What's the main outcome you're optimizing for?** (Your north star metric)
Example: "Time to first value for new users" or "Revenue per rep"
> [wait for north star]

**7. What other key metrics matter?** (2-4 additional metrics)
Example: "Activation rate, retention, NPS"
> [wait for metrics]
```

### Step 2.4: Anti-Vision

Ask:

```
**8. What are you explicitly NOT building?** (Your anti-vision)
This helps the AI push back on off-strategy requests.

Example anti-vision items:
- "Generic dashboards without actionable insights"
- "Features that compete with Excel"
- "Anything that requires manual data entry"

List 2-4 things you're NOT building:
> [wait for anti-vision items]
```

### Step 2.5: Generate Files

After collecting all answers, generate the context files:

#### Generate product-vision.md

```markdown
# [Product Name] Product Vision

> Last updated: [Today's date]

---

## Core Identity

[Product Name] is [one-liner description].

### The Outcome Chain
```

[Primary user action]
→ so that [immediate benefit]
→ so that [behavior change]
→ so that [north star metric improves]

```

---

## Mission

[Derived from one-liner and outcomes]

---

## Target Market

- **Primary:** [target market]
- **Key personas:** [personas list]
- **Stage:** [product stage]

---

## Success Metrics

### North Star
[north star metric]

### Key Metrics
[list of key metrics]

---

## What We're NOT Building (Anti-Vision)

[List anti-vision items as bullet points]

---

## The One-Liner

**[Product Name] [one-liner].**
```

Save to: `elmer-docs/company-context/product-vision.md`

#### Generate strategic-guardrails.md

```markdown
# Strategic Guardrails

> Use these guardrails to evaluate initiatives and ensure alignment with product vision.

---

## Quick Vision Check (30 Seconds)

Before going deeper, confirm:

- [ ] **Outcome chain exists**: Can you clearly articulate "...so that [business outcome]"?
- [ ] **Human-centered**: Does this help users do better work, not replace them?
- [ ] **Trust-compatible**: Does this maintain or increase user trust?
- [ ] **Not anti-vision**: Is this different from what we said we wouldn't build?

If any of these fail, **STOP and ask clarifying questions**.

---

## Red Flags to Challenge

### 🚩 Unclear User Outcomes

| Signal                            | Challenge Question                                     |
| --------------------------------- | ------------------------------------------------------ |
| "Users can now do X" with no why  | "What business outcome does this enable?"              |
| Feature described without persona | "Which persona needs this? What's their current pain?" |
| No success metric defined         | "How would we know if this is working?"                |

### 🚩 Anti-Vision Triggers

When the request sounds like any of these, push back:

[List anti-vision items with challenge questions]

---

## The Outcome Chain Test

Every initiative should have a clear chain:
```

[This feature] enables [user action]
→ so that [immediate user benefit]
→ so that [behavior change]
→ so that [north star metric: [north star]]

```

---

## Questions to Ask Before Prototyping

### On the Problem
1. Who specifically has this problem?
2. What are they doing today to solve it?
3. What evidence do we have?

### On the Solution
1. Why this solution vs. alternatives?
2. What's the minimum version that tests the hypothesis?
3. How do we measure success vs. failure?

---

## Initiative Readiness Checklist

Before writing a PRD, confirm:

- [ ] **Problem validated**: We have evidence
- [ ] **Persona identified**: We know who this is for
- [ ] **Outcome chain complete**: Clear path to [north star]
- [ ] **Anti-vision check passed**: This isn't something we said we wouldn't build
```

Save to: `elmer-docs/company-context/strategic-guardrails.md`

#### Generate personas.md

```markdown
# User Personas

---

[For each persona provided, create a section:]

## [Persona Name]

**Role:** [Role description]

### What They Need

- [Inferred from product description]

### What They Fear

- [Generic fears for this role type]

### Success Looks Like

- [Tied to product outcomes]

---
```

Save to: `elmer-docs/company-context/personas.md`

#### Update workspace-config.json

Update the config file with the collected information:

```json
{
  "workspace": {
    "name": "[Product Name] PM Workspace",
    "initialized": true,
    "created_at": "[ISO timestamp]"
  },
  "product": {
    "name": "[Product Name]",
    "one_liner": "[one-liner]",
    "stage": "[stage]",
    "target_market": "[target market]",
    "anti_vision": ["[item1]", "[item2]", ...]
  },
  "personas": {
    "primary": ["[persona1]", "[persona2]", ...],
    "secondary": []
  },
  "outcomes": {
    "north_star": "[north star]",
    "key_metrics": ["[metric1]", "[metric2]", ...]
  },
  ...
}
```

---

## Phase 3: Repository Setup (Optional)

Ask:

```
**Do you have an existing product codebase to link?**

If yes, I can help you add it as a submodule. This lets you:
- Build prototypes using your real components
- Reference your codebase patterns
- Eventually promote prototypes to production

Options:
1. Yes, add a repository
2. No, I'll use standalone prototypes for now

> [wait for choice]
```

### If they choose to add a repo:

```
**What's the Git URL for your repository?**
Example: git@github.com:myorg/my-app.git
> [wait for URL]

**What should we call this repo in the workspace?**
Example: my-app
> [wait for name]
```

Then run:

```bash
cd /path/to/elmer
git submodule add [URL] product-repos/[name]
git submodule update --init --recursive
```

Ask about prototype location:

```
**Where should prototypes go in this repo?**
Common patterns:
- src/components/prototypes/
- packages/prototypes/
- (custom path)

> [wait for path, default to src/components/prototypes/]
```

Update workspace-config.json to add the repo:

```json
{
  "repos": [
    {
      "name": "[name]",
      "path": "product-repos/[name]",
      "prototype_path": "[prototype_path]",
      "components_path": "src/components"
    }
  ]
}
```

---

## Phase 4: Verification

### Install Dependencies

```bash
cd /path/to/elmer/prototypes
npm install
```

### Create User Branch

```bash
USERNAME=$(git config user.name | tr ' ' '-' | tr '[:upper:]' '[:lower:]')
DATE=$(date +%Y-%m-%d)
BRANCH="collab/${USERNAME}-${DATE}"

git checkout -b "$BRANCH"
```

### Test Storybook

```bash
cd /path/to/elmer/prototypes
timeout 30 npm run storybook &
sleep 15
curl -s http://localhost:6006 > /dev/null && echo "✅ Storybook works!" || echo "⚠️ Storybook didn't start"
kill %1 2>/dev/null
```

---

## Success Message

After all phases complete:

```
╔══════════════════════════════════════════════════════════════╗
║                    🎉 Setup Complete!                        ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Product: [Product Name]                                     ║
║  Stage: [stage]                                              ║
║  North Star: [north star]                                    ║
║                                                              ║
║  📁 Context files generated:                                 ║
║  ─────────────────────────────────────────────────────────── ║
║  • elmer-docs/company-context/product-vision.md       ║
║  • elmer-docs/company-context/strategic-guardrails.md ║
║  • elmer-docs/company-context/personas.md             ║
║  • elmer-docs/workspace-config.json                   ║
║                                                              ║
║  Quick Commands:                                             ║
║  ─────────────────────────────────────────────────────────── ║
║  /new-initiative [name]  Start a new initiative              ║
║  /proto [name]           Build a prototype                   ║
║  /save                   Save and push your work             ║
║  /help                   See all commands                    ║
║                                                              ║
║  To run Storybook (see your prototypes):                     ║
║  cd prototypes && npm run storybook                          ║
║  Then open: http://localhost:6006                            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

## Re-running Setup

Running `/setup` again will:

- Skip system checks if already passing
- Offer to update product context (preserves existing)
- Allow adding more repositories
- Re-verify everything works

---

## Troubleshooting

### Permission denied on git push

You need push access to the repository.

### Submodule won't initialize

Check SSH keys or use HTTPS with personal access token.

### npm install fails

- Clear cache: `npm cache clean --force`
- Delete node_modules: `rm -rf node_modules && npm install`
- Check Node version is 20+

### Storybook won't start

- Make sure you're in the prototypes directory
- Check for port conflicts on 6006
