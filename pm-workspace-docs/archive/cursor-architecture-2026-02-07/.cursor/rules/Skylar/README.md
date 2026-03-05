# Skylar Designer Toolkit

**You describe it. Cursor builds it. Every change is world-class.**

This toolkit turns Cursor into a design tool. You speak in plain language about what you want visually -- spacing, color, hierarchy, rhythm, weight -- and Cursor handles all the code, git, and terminal commands for you. You never need to touch a terminal, write code, or think about git.

---

## Getting Started (First Time)

### 1. Open Cursor

Open this project folder (`pm-workspace`) in Cursor. The rules and skills in this toolkit activate automatically.

### 2. Start the App

Open the Cursor chat (Cmd+L) and say:

> "Start Storybook so I can see the components"

Cursor will handle everything -- installing dependencies, starting the server, and telling you where to look in your browser. Storybook runs at **localhost:6006** and shows every component in isolation.

To see the full app instead:

> "Start the dev server so I can see the app"

The app runs at **localhost:5173**.

### 3. Make a Change

Describe what you want visually. For example:

> "The card padding feels too tight. Give it more breathing room."

> "Make the primary button more prominent -- it gets lost next to the secondary."

> "The sidebar text hierarchy is flat. The section headers need more weight."

Cursor will find the right component, make the change using the design system, and commit it automatically.

### 4. See Your Change

After Cursor makes a change, refresh your browser. If Storybook or the dev server is running, changes appear automatically via hot reload.

### 5. Undo a Change

> "Undo that last change"

> "Revert back to before I changed the card"

Cursor handles the git revert for you.

---

## How This Works

### You Speak Design Language

Talk about what you see and feel, not about code:

- "This feels crowded" (not "increase the padding")
- "The hierarchy is weak" (not "make the font bigger")
- "These elements don't breathe" (not "add margin-bottom")
- "The contrast is too low" (not "change the text color")
- "This button should feel like the primary action" (not "change the variant")

Cursor translates your design intent into code that follows the AskElephant design system.

### Cursor Handles Everything Technical

- **Code**: Cursor reads and writes React components, Tailwind classes, and CSS tokens
- **Git**: Every change is an atomic commit with a design-intent message like "Increase card padding for better breathing room"
- **Terminal**: Storybook, dev server, dependency installs -- all automated
- **Linting**: Cursor fixes code quality issues silently
- **Stories**: Cursor updates Storybook stories to show your changes

### Cursor Questions You

When your request is ambiguous, Cursor will ask clarifying questions:

> You: "Make it better"
>
> Cursor: "Better in what way? I can see a few directions:
> 1. More whitespace -- the elements feel crowded
> 2. Stronger hierarchy -- the title doesn't stand out enough
> 3. Warmer color temperature -- the grays feel cold
>
> Which direction resonates?"

This is by design. Clarity produces better outcomes.

---

## Common Phrases

| What you say | What happens |
|---|---|
| "Start Storybook" | Launches component viewer at localhost:6006 |
| "Start the app" | Launches full app at localhost:5173 |
| "Save my changes" | Commits with a design-intent message and pushes |
| "Undo that" | Reverts the last commit |
| "Show me all the buttons" | Lists button variants with descriptions |
| "What components do we have?" | Explores the UI library |
| "How does this look on mobile?" | Shows responsive behavior at 375px |
| "Check this in dark mode" | Verifies dark mode rendering |
| "Review the design quality" | Runs a comprehensive design QA audit |
| "Make a new branch for my changes" | Creates a branch like `skylar/card-spacing-updates` |
| "Create a PR" | Opens a pull request with a design summary |

---

## Reference Docs

These files live alongside this README for quick reference:

| File | What it contains |
|---|---|
| `DESIGN-SYSTEM.md` | Complete color, typography, spacing, and component token reference |
| `QUICK-REFERENCE.md` | Cheat sheet mapping plain-language phrases to design outcomes |
| `PERSONAS.md` | User persona cards with design implications for every decision |

---

## Troubleshooting

### "Storybook won't start"

Say: "Storybook crashed. Fix it and restart."

Cursor will read the error, fix the issue, and restart the server.

### "My change broke something"

Say: "Something broke. Undo my last change and try a different approach."

### "I don't know where a component is"

Say: "Where is the engagement card component?" or "Find the sidebar navigation."

Cursor knows the entire codebase structure and will locate any component for you.

### "The change doesn't look right"

Say: "That's not what I meant. I wanted [describe what you actually wanted]."

Cursor will revert and try again with your clarification.

### "I want to start fresh today"

Say: "Reset to the latest main branch and start a new design branch."

---

## Philosophy

This toolkit is built on three beliefs:

1. **Designers should design, not code.** Your value is in judgment, taste, and user empathy -- not in knowing React syntax. Cursor handles the implementation.

2. **Every pixel matters.** No change is too small to get right. Consistent spacing, proper token usage, responsive behavior, dark mode support, and accessibility are non-negotiable on every change.

3. **Clarity over speed.** It is better to ask a clarifying question than to build the wrong thing. When in doubt, Cursor will ask. When you're in doubt, describe what you're feeling and Cursor will help you articulate it.
