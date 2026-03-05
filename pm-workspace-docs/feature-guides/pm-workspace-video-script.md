# PM Workspace Walkthrough (Video Script)

**Length target:** 25–35 minutes  
**Audience:** Internal PMs + Engineering/Design partners  
**Secondary:** External redacted version

---

## 0. Cold Open (0:00–1:30)

**Talk track:**  
“This workspace is the product operating system for AskElephant. It connects
research, PRDs, prototypes, and validation into a single workflow—with guardrails
for trust and outcomes. If you can learn this system, you can run an initiative
end-to-end with speed and clarity.”

**On-screen:**  
Title slide + 3 bullets: Outcomes, Trust, Repeatability

---

## 1. The Why (1:30–4:30)

**Talk track:**

- AskElephant is not a note-taker. It’s a revenue outcome system.
- This workspace makes that real through structured workflows.
- We optimize for trust, human-centered AI, and consistent execution.

**On-screen:**  
Outcome chain from product vision.

---

## 2. How The System Works (4:30–9:00)

**Talk track:**  
“There are four layers: rules, skills, agents, commands. Rules set guardrails,
skills encode how to do a thing well, agents run multi-step workflows, and
commands are the entry points.”

**On-screen:**  
Context flow diagram + file tree callouts.

**Demo:**  
Open `AGENTS.md`, highlight the command and skill tables.

---

## 3. Workflow Demo #1: Research → PRD (9:00–15:00)

**Talk track:**  
“We start with signals or a transcript, run research analysis, then create a
PRD grounded in outcomes.”

**Demo steps:**

1. Show `pm-workspace-docs/signals/`
2. Run `/research [initiative]` (or show existing output)
3. Open `research.md`, highlight quotes and insights
4. Run `/pm [initiative]` to generate a PRD

**On-screen:**  
Artifacts created and where they live.

---

## 4. Workflow Demo #2: PRD → Prototype → Validation (15:00–22:00)

**Talk track:**  
“Now we build. The prototype workflow creates all states and a flow story, then
the validator runs a jury evaluation.”

**Demo steps:**

1. Run `/proto [initiative]`
2. Open Storybook or Chromatic link
3. Show `prototype-notes.md`
4. Run `/validate [initiative]` and show jury report

**On-screen:**  
“All states required” checklist.

---

## 5. Operational Workflows (22:00–27:00)

**Talk track:**  
“Day-to-day, we use status, sync, and reporting to keep teams aligned.”

**Demo steps:**

1. `/status [initiative]`
2. `/sync-dev`
3. `/eow` (or show sample output)

---

## 6. Governance + Guardrails (27:00–30:00)

**Talk track:**  
“Guardrails prevent us from shipping unclear or misaligned work. If the outcome
chain is missing, we stop and clarify.”

**On-screen:**  
Strategic guardrails checklist.

---

## 7. Teaching Others (30:00–33:00)

**Talk track:**  
“If you’re onboarding someone, keep it to one workflow. Explain why, demo the
how, then run a short exercise.”

**On-screen:**  
Teaching guide quick-start list.

---

## 8. Closing (33:00–35:00)

**Talk track:**  
“This is the system. If you follow the workflows, your work becomes repeatable,
auditable, and easier to share.”

**On-screen:**  
Links to internal guide + external guide.

---

## Redaction Notes (External Version)

- Remove internal paths and Slack/MCP references
- Replace `/command` usage with generic workflow steps
- Use anonymized examples
