# Project Bapar — Decision Log

> Track key decisions, what was considered, and why we chose what we did.

---

## Decisions

| # | Decision | Options Considered | Chosen | Rationale | Date | Owner |
|---|----------|--------------------|--------|-----------|------|-------|
| 1 | Separate sub-projects vs. combined | Single combined feature vs. Meeting Summary + Action Items as two sub-projects | Two separate sub-projects | Allows independent shipping and clearer scope | 2026-03-09 | Tyler |
| 2 | Primary input format | Recording upload, transcript paste, structured file import | AskElephant native note taker recordings | Primary input is native to the product; no upload UI needed for v1 | 2026-03-09 | Rob |
| 3 | V1 integration targets | All integrations vs. phased | Calendar + Email (Gmail) + Slack for v1 | Start with highest signal sources; CRM/Drive/Linear/Notion post-v1 | 2026-03-09 | Rob |
| 4 | V1 UX format | Per-meeting report view, inbox-style list, chat-based homepage | Interactive chat-based homepage with artifacts | Creates the "lightbulb moment" — proactive push, not passive view | 2026-03-09 | Rob |
| 5 | Pilot strategy | Wait for external users vs. internal + willing early adopters | AskElephant revenue team + external willing group | Fastest feedback loop; revenue team is highly motivated | 2026-03-09 | Rob |

---

## Pending Decisions

- [ ] Which Calendar API first — Google Calendar only, or also Outlook?
- [ ] How is role context established — explicit onboarding, inferred from data, or both?
- [ ] What is the eval framework for quality? (No framework yet — must define before pilot)
- [ ] What does the artifact card format look like — how much structure vs. conversational?
