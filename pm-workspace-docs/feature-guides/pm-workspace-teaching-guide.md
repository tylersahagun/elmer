# PM Workspace Teaching Guide

This guide helps you teach others how to use the PM Workspace effectively,
including a structured onboarding path and facilitation tips.

---

## Teaching Goals

By the end of the walkthrough, learners should be able to:

- Explain the four layers (rules, skills, agents, commands)
- Run a basic workflow (research → PRD or PRD → prototype)
- Locate where artifacts are stored
- Understand guardrails and when to pause

---

## Recommended Session Format (60–90 minutes)

1. **15 min: System overview**
   - Why this exists (outcomes, trust, consistency)
   - Four layers and where artifacts live
2. **20–30 min: Live workflow demo**
   - Pick one workflow and run the commands end-to-end
3. **10–15 min: Exercises**
   - Short tasks with clear outputs
4. **10–15 min: FAQ + troubleshooting**

---

## First 15 Minutes (Quick Start)

1. Open `AGENTS.md` and show the system map
2. Show the command list (auto-execute vs confirm-first)
3. Run `/status [initiative]` to show artifact readiness
4. Show where outputs live in `pm-workspace-docs/`

---

## Guided Exercise (Hands-On)

**Option A: Discovery**

1. `/research [initiative]` with a sample transcript
2. Review the generated `research.md`
3. Run `/pm [initiative]` to generate a PRD

**Option B: Build/Validate**

1. `/proto [initiative]` to build a prototype
2. Review the Storybook output and `prototype-notes.md`
3. `/validate [initiative]` to run the jury evaluation

---

## Troubleshooting (Common Issues)

| Symptom                | Likely Cause                 | Fix                          |
| ---------------------- | ---------------------------- | ---------------------------- |
| Command not recognized | Typo or missing handler      | Check `/help` or `AGENTS.md` |
| Output missing         | Command blocked by guardrail | Re-run with required input   |
| Prototype incomplete   | Missing PRD/design brief     | Ensure PRD exists first      |
| Workflow stuck         | Guardrail requires approval  | Confirm next step with human |

---

## Facilitation Tips

- Keep the demo scoped (one workflow only)
- Explain “why” before “how”
- Use guardrails as teaching moments
- Emphasize artifacts and where they live

---

## FAQ (Starter)

**Q: What’s the difference between skills and agents?**  
A: Skills are recipes; agents are multi-step workflow executors.

**Q: Can I use this without Notion/Slack integrations?**  
A: Yes, but some sync workflows require MCP integrations.

**Q: How do I know where to put new docs?**  
A: Follow the `pm-workspace-docs/` structure by initiative.

---

## External Version Notes

If you are teaching an external audience, use:

- `pm-workspace-docs/feature-guides/pm-workspace-external.md`
- `pm-workspace-docs/feature-guides/pm-workspace-redaction-checklist.md`
