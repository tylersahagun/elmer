# Developer Training: Product Process in Elmer
## Session Materials — March 2026

**Format:** 60-minute live session  
**Audience:** Engineering team (Dylan, Caden, Palmer, Eduardo, Jason, Knoxson, Ivan, Brian)  
**Goal:** Engineers understand the two-gate product process, what they receive at Gate 2, and why validated prototypes = their acceptance criteria

---

## Files in This Folder

| File | Purpose | When to use |
|------|---------|-------------|
| `gamma-slide-deck.md` | Complete slide-by-slide script with speaker notes, quotes, and Gamma import prompt | Build the deck in Gamma before the session |
| `figjam-diagram.md` | FigJam Mermaid code + styling guide for the kanban flow diagram | Import into FigJam; share as leave-behind |
| `demo-prep.md` | Browser tab setup, Chromatic walkthrough script, Q&A answers | Open 10 min before the session |
| `linear-ticket-example.md` | Before/after ticket contrast for Slide 11 | Copy into a slide or Notion page for the live demo |

---

## Generated Presentation Links

| Deliverable | Link | Status |
|-------------|------|--------|
| **Gamma Presentation** (primary, aurora theme) | https://gamma.app/docs/vvyow1dsr2jnl67 | ✅ Live — updated with research section |
| **Google Slides** (backup / editable) | https://docs.google.com/presentation/d/1cFyybXNlebTaWPXibeOTTZAjmfsXn9Pfo-9bOleRs4I/edit | ✅ Live |
| **Chromatic Storybook** (live demo) | https://main--696c2c54e35ea5bca2a772d8.chromatic.com | ✅ Live |

---

## Quick-Start: FigJam Diagram

1. Open [figjam.new](https://figjam.new)
2. Click `+` → Plugins → search "Mermaid"
3. Copy the "Mermaid Code (FigJam import)" block from `figjam-diagram.md`
4. Paste and import
5. Apply the brand colors from the "Manual FigJam Styling" table
6. Add the tool connection sticky notes below the main flow
7. Share the FigJam URL with developers after the session

**Estimated FigJam build time:** 15 minutes

---

## Training Flow Summary

```
:00–:10   The Problem (Slides 1–3)
          - The rework problem. The Ivan test. Why 9 isolated projects = 9 isolated failures.

:10–:25   The Lifecycle (Slides 4–6)
          - The kanban overview. Two loops. Two gates.
          - Gate 1 = hypothesis committed (PM's gate)
          - Gate 2 = jury 70%+ (engineering's gate — what you get when you cross it)

:25–:40   The Prototype (Slides 7–10)
          - Not Figma. Storybook. Interactive. Same stack.
          - Three options, all six states.
          - Live Chromatic demo: Agent Command Center v9

:40–:50   Your Tools, Connected (Slides 11–14)
          - Linear ticket contrast: current vs. Elmer-generated
          - GitHub: context in the repo
          - Chromatic: your visual regression baseline
          - Cursor AI: why ticket quality enables agent implementation

:50–:55   What Changes (Slide 15)
          - Before/after. The one thing to ask for.

:55–:60   Roadmap + Q&A (Slide 16)
```

---

## Key Evidence Sources (from workspace research)

These transcripts were reviewed when building this training:

| Source | Key Insight | Used in |
|--------|-------------|---------|
| `pm-workspace-docs/signals/transcripts/2026-02-09-rob-feedback-agent-command-center-v9.md` | Rob validates prototype-first approach; "that's sick" on Chromatic notification | Slide 10 |
| `pm-workspace-docs/signals/memos/memo-8.md` | "9 engineers, 9 projects, no shared context" — engineers' lived reality | Slides 2–3 |
| `pm-workspace-docs/signals/transcripts/2026-01-29-product-vision-robert-henderson.md` | Rob's chief-of-staff vision, proactive/reactive framing | Slide 6 |
| `pm-workspace-docs/signals/transcripts/2026-02-23-agent-first-vision-tyler-team.md` | Team session on agent-first direction | Slide 16 |
| `elmer-docs/STAGE-DOCUMENTATION.md` | Full 11-stage lifecycle documentation | Slides 4–6 |

---

## Post-Session Leave-Behinds to Share in Slack

```
Hey team — slides + resources from today's session:

📊 Presentation: [Gamma link]
📋 Kanban flow diagram: [FigJam link]
🔗 Chromatic Storybook: https://main--696c2c54e35ea5bca2a772d8.chromatic.com
📄 Stage documentation: elmer-docs/STAGE-DOCUMENTATION.md

How to give prototype feedback:
→ Find the story in Chromatic
→ Copy the URL
→ Post in #product with your comment

How to ask for a prototype:
→ If a ticket doesn't have a Storybook link, it hasn't cleared Gate 2
→ Ask: "Can you show me the prototype?"
```
