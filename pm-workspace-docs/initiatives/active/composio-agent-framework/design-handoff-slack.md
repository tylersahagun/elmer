# Slack Message: Composio Agent Framework Design Handoff

> Copy-paste this message to Slack or email when handing off to designer.

---

🎨 **Design Handoff: Composio Agent Framework**

## The Quick Pitch

Users want to automate CRM updates, email drafts, and follow-ups based on meeting insights—but our workflow builder is too complex. This initiative simplifies automation to: **triggers + permissions + instructions**.

> "Workflow building is so complex... Just like the trigger, give it permissions, and then tell it what you wanna do."

**Impact:** Higher automation adoption → more value delivered → expansion revenue

---

## Links

| Resource | Link |
|----------|------|
| 🎯 **Full Brief (read first!)** | `pm-workspace-docs/initiatives/composio-agent-framework/design-handoff.md` |
| 🖥️ **Chromatic Preview** | Run `cd elephant-ai && npm run storybook -w web` → Navigate to `Prototypes/ComposioAgentFramework/v6-SkillsIntegration` |
| 📋 **PRD** | `pm-workspace-docs/initiatives/composio-agent-framework/prd.md` |
| 📊 **Version** | v6 (Unified Framework) |

---

## Quick Start

1. **Read the brief** — 10 min to understand the WHY
2. Open Storybook locally: `cd elephant-ai && npm run storybook -w web`
3. Navigate to `Prototypes/ComposioAgentFramework/v6-SkillsIntegration`
4. Try the `CreateAgentFlow` story to see the full journey
5. Story URLs in brief for Storybook Connect

---

## Key Design Decisions Already Made

| Decision | Rationale |
|----------|-----------|
| 1. **Conversational setup (Option D)** | Users intimidated by blank forms; chat guides progressively |
| 2. **Service accounts as default** | Transparency about "who did this" — Linear agent guidelines |
| 3. **Skills layer** | Expert prompts reduce configuration friction |
| 4. **Activity log** | Top jury concern (26 mentions) — trust requires transparency |
| 5. **Test before activate** | Second-highest jury suggestion (18 mentions) |

---

## What Needs Your Magic ✨

- [ ] **Visual polish** — spacing, icons, color, typography
- [ ] **Micro-copy refinement** — button labels, empty states, errors
- [ ] **Motion/transitions** — typewriter timing, view transitions
- [ ] **Empty/error state illustration** — No agents, connection failed

---

## Jury Validation

✅ **92% pass rate** (target: 80%)  
✅ **78% approval rate** (target: 70%)  
⭐ All top concerns addressed in v2-v4 iterations

---

**Questions?** Check the brief first, then ping me!

Let me know when Figma is ready for `/figma-sync`! 🚀
