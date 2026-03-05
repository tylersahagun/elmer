# Productivity System Research: PM Time Management & Automation

**Date:** February 7, 2026  
**Author:** Tyler Sahagun (via PM Copilot)  
**Purpose:** Deep research on productivity systems, automation, and time management for a junior PM

---

## Executive Summary

After analyzing your current PM workspace setup and researching productivity systems, here are the key findings:

1. **Your current workspace is already highly automated** - You have 28 skills, 15+ subagents, and MCP integrations with Slack, Linear, Notion, HubSpot, PostHog, Google Calendar, and GitHub
2. **The gap is not automation, but orchestration** - Individual pieces work well; what's missing is proactive scheduling and time-boxing
3. **Recommended approach:** Enhance existing `/morning` command with intelligent prioritization + use calendar blocking religiously
4. **Don't build a web app** - The cognitive overhead of another tool will hurt more than help

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Your Specific Schedule Constraints](#your-specific-schedule-constraints)
3. [Webhook & Automation Options](#webhook--automation-options)
4. [Productivity Frameworks for Junior PMs](#productivity-frameworks-for-junior-pms)
5. [AI Tools & Integrations](#ai-tools--integrations)
6. [Time Management Recommendations](#time-management-recommendations)
7. [Implementation Options](#implementation-options)
8. [Final Recommendation](#final-recommendation)

---

## Current State Analysis

### What You Already Have (Strong Foundation)

| Capability | Current Tool | Status |
|------------|--------------|--------|
| **Slack monitoring** | `/slack-monitor` + `slack-sync` skill | ✅ Automated |
| **Calendar integration** | `daily-planner` skill via Google MCP | ✅ Automated |
| **Task management** | Google Tasks via MCP | ✅ Automated |
| **Linear tracking** | `linear-sync` + `team-dashboard` | ✅ Automated |
| **GitHub PR tracking** | `github-sync` skill | ✅ Automated |
| **Notion sync** | `notion-sync` + `notion-admin` | ✅ Automated |
| **HubSpot activity** | `hubspot-activity` subagent | ✅ Automated |
| **End-of-day reports** | `activity-reporter` skill | ✅ Automated |
| **Morning planning** | `daily-planner` skill (`/morning`) | ⚠️ Manual trigger |
| **Priority routing** | `task_routing` in workspace-config.yaml | ⚠️ Guidance only |

### What's Missing

| Gap | Impact | Solution Complexity |
|-----|--------|---------------------|
| **Proactive time-boxing** | High - no protected focus time | Medium |
| **Real-time priority shifts** | High - doesn't adapt throughout day | High |
| **Meeting prep automation** | Medium - no automatic context for upcoming meetings | Low |
| **Decision urgency signals** | Medium - blocked items don't escalate | Low |
| **Cross-system duplicate detection** | Low - same task in Linear + Google Tasks | Low |

### Current `/morning` Command Capability

Your existing `daily-planner` skill already does:
1. Pull Google Calendar events
2. Pull Google Tasks (due today/overdue)
3. Invoke slack-monitor for priority messages
4. Extract initiative actions from roadmap.json
5. Calculate available focus blocks
6. Generate `today.md` with prioritized actions

**The foundation is solid.** The gap is in:
- Proactive calendar blocking
- Real-time adjustments
- Meeting context preparation

---

## Your Specific Schedule Constraints

### Weekly Pattern

| Day | Working Hours | Available Focus Time |
|-----|--------------|----------------------|
| Monday | 8:00 AM - 12:00 AM (16h) | Extended deep work possible |
| Tuesday | 8:00 AM - 6:00 PM (10h) | Standard day |
| Wednesday | 8:00 AM - 6:00 PM (10h) | Standard day |
| Thursday | 8:00 AM - 12:00 AM (16h) | Extended deep work possible |
| Friday | 8:00 AM - 6:00 PM (10h) | Standard day |

### Implications

**Monday/Thursday (Long Days):**
- Use 6-10 PM for deep work (PRDs, research, prototypes)
- Customer interviews can be scheduled late
- Document creation when office is quiet

**Tuesday/Wednesday/Friday (Short Days):**
- Batch meetings in the morning
- Protect 2-4 PM for focus
- Triage Slack at start and end of day only

---

## Webhook & Automation Options

### Can You Add Webhooks?

**Short answer:** Yes, but it adds infrastructure complexity that may not be worth it.

| Platform | Webhook Available | What It Would Enable | Recommendation |
|----------|-------------------|---------------------|----------------|
| **Slack** | ✅ Events API | Real-time mention alerts, message reactions | ⚠️ Requires server |
| **Linear** | ✅ Webhooks | Issue state changes, assignment notifications | ⚠️ Requires server |
| **Notion** | ❌ No official webhooks | N/A (use polling via MCP) | Use MCP sync |
| **HubSpot** | ✅ Webhooks | Deal stage changes, task assignments | ⚠️ Requires server |
| **Google Calendar** | ✅ Push notifications | Meeting reminders, cancellations | ⚠️ Requires server |
| **GitHub** | ✅ Webhooks | PR reviews needed, CI failures | Already via `gh` CLI |

**The Problem with Webhooks:**
1. **Requires always-on server** - You'd need a cloud function or service
2. **Where does it notify you?** - Another Slack message? Defeats the purpose
3. **MCP already provides pull-based access** - Just need to trigger it proactively

**Better Alternative:** Enhance `/morning` and add `/triage` to run at scheduled intervals.

### If You Still Want Real-Time Webhooks

**Option A: Zapier/Make.com (No-Code)**
- Connect Slack → Google Tasks for urgent mentions
- Connect Linear "blocked" labels → Slack DM
- Cost: $20-50/month

**Option B: n8n (Self-Hosted)**
- Free, runs on your machine
- Complex setup, requires maintenance

**Option C: GitHub Actions Scheduled Workflows**
- Run `/morning` equivalent on a schedule
- Push summary to Slack
- Free within limits

---

## Productivity Frameworks for Junior PMs

### Framework 1: Maker's Schedule vs Manager's Schedule (Paul Graham)

**Core Idea:** Protect large blocks for deep work, batch interruptions.

**Application for You:**
- **Maker time:** Monday/Thursday evenings (6-10 PM) for PRDs, research
- **Manager time:** Tuesday-Friday mornings for meetings, Slack, triage
- **Transition rituals:** `/morning` at start, `/eod` at end

### Framework 2: Getting Things Done (GTD) - David Allen

**Core Idea:** Capture → Clarify → Organize → Reflect → Engage

**Application for You:**

| GTD Step | Your Implementation |
|----------|---------------------|
| **Capture** | Signals inbox, `/ingest`, Slack monitor |
| **Clarify** | `/research` to analyze, ask "what's the next action?" |
| **Organize** | Linear (team), Google Tasks (personal), PM workspace (artifacts) |
| **Reflect** | `/morning` (daily), `/eow` (weekly) |
| **Engage** | Priority actions in `today.md` |

**What's Missing:** Weekly review ritual (already have `/eow`, but add explicit reflection).

### Framework 3: Time Boxing (Elon Musk, Cal Newport)

**Core Idea:** Assign every minute of your day to a task in advance.

**Application for You:**
1. Run `/morning` at 8:00 AM
2. Use `/block [task] [duration]` to create calendar events
3. Work ONLY on what's blocked during that time
4. Re-block remaining tasks at end of day

**Enhancement Needed:** Make `/morning` automatically suggest time blocks.

### Framework 4: Eat That Frog (Brian Tracy)

**Core Idea:** Do your hardest, most important task first thing.

**Application for You:**
- `/morning` should surface the "frog" - the task you're avoiding but is highest impact
- Schedule it in the first focus block of the day

### Framework 5: Working with Your PM Lead (Junior PM Specific)

**Core Idea:** Proactive communication, documentation before asking, bring recommendations not just problems.

**Application for You:**
- **Before asking Sam:** "I've researched X, found Y options, recommend Z because..."
- **Document decisions:** Your PRD templates already support this
- **Surface blockers early:** Use `/team --help-needed` to identify what's stuck

**Red Flags You're Missing the Ball:**
| Signal | Detection Method | Remedy |
|--------|------------------|--------|
| Sam or Brian asking for update you don't have | Slack mentions in #product-forum | Set reminder to proactively update |
| Customer exploration sitting idle | Notion project with no activity | `/notion-admin audit` weekly |
| PRD requested but not started | Linear `workflow/needs-prd` label | `/team --help-needed` daily |
| Prototype feedback not incorporated | Jury evaluation < 70% | `/iterate` on failing initiatives |

---

## AI Tools & Integrations

### What You Already Have (Cursor + PM Workspace)

Your setup is **best-in-class** for AI-assisted PM work:

| Capability | Tool | How to Use |
|------------|------|------------|
| **Intelligent summarization** | Claude in Cursor | `/research` for transcripts |
| **PRD generation** | `prd-writer` skill | `/pm [initiative]` |
| **Prototype building** | `proto-builder` subagent | `/proto [initiative]` |
| **Analytics interpretation** | `posthog-analyst` subagent | `/posthog question [query]` |
| **Diagram generation** | `figjam-generator` subagent | `/figjam [description]` |

### External AI Tools Worth Considering

| Tool | What It Does | Integration with Your Stack | Recommendation |
|------|--------------|----------------------------|----------------|
| **Reclaim.ai** | Auto-schedules focus time, defends calendar | Google Calendar | ✅ **Strongly recommend** |
| **Motion** | AI task scheduler, auto-rescheduling | Google Calendar, Linear (Zapier) | ⚠️ Expensive ($34/mo), overlaps with Reclaim |
| **Clockwise** | Focus time protection, meeting scheduling | Google Calendar | ⚠️ Team-oriented, less useful solo |
| **Sunsama** | Daily planning, timeboxing | Google Calendar, Linear, Notion | ⚠️ Yet another interface |
| **Akiflow** | Task aggregation, time blocking | Multi-source | ⚠️ Similar to what you have |

### Deep Dive: Reclaim.ai

**Why It's the Best Fit:**
1. **Automatic focus time blocking** - Looks at your tasks, finds gaps, creates blocks
2. **Habit scheduling** - "I want 2 hours of deep work daily" → It finds slots
3. **Smart meeting scheduling** - Prioritizes your preferences
4. **Works with Google Calendar** - Already integrated
5. **Linear integration** - Can auto-block time for assigned issues
6. **$10/month** - Reasonable cost

**How It Would Work with Your Setup:**
```
Morning:
1. Run /morning → Generates priority actions
2. Reclaim sees your tasks → Auto-blocks calendar
3. You follow the calendar

Throughout Day:
4. New urgent item appears (Slack mention)
5. Reclaim auto-adjusts remaining blocks

End of Day:
6. Run /eod → Captures what actually happened
```

### What About Claude Code / Cursor Agent?

You're already using this effectively. The gap isn't the AI—it's the **trigger mechanism**.

**Current State:** You manually invoke commands
**Ideal State:** Proactive AI that surfaces what you need

**Option: Cursor Background Agent (Emerging Feature)**
- Cursor is developing "always-on" agent capabilities
- Would allow scheduled runs of `/morning`, `/slack-monitor`, etc.
- **Not yet production-ready** - Watch for updates

---

## Time Management Recommendations

### Daily Rituals (Recommended Schedule)

#### Standard Days (Tue/Wed/Fri): 8 AM - 6 PM

| Time | Activity | Command/Tool |
|------|----------|--------------|
| **8:00-8:15** | Morning planning | `/morning` |
| **8:15-8:30** | Triage Slack | Review output, respond to 🔴 items |
| **8:30-9:00** | Email batch | Superhuman |
| **9:00-12:00** | Meeting zone | Let meetings happen here |
| **12:00-12:30** | Lunch | Off |
| **12:30-1:00** | Slack triage #2 | `/slack-monitor` |
| **1:00-4:00** | Focus time | **PROTECT THIS** - `/block` |
| **4:00-4:30** | Team sync | `/team` - check blockers |
| **4:30-5:30** | Communication debt | Respond to 🟡 items, update docs |
| **5:30-6:00** | End of day | `/eod --digest` |

#### Extended Days (Mon/Thu): 8 AM - 12 AM

| Time | Activity | Command/Tool |
|------|----------|--------------|
| **8:00-6:00** | Same as standard days | See above |
| **6:00-7:00** | Dinner break | Off |
| **7:00-10:00** | Deep work zone | PRDs, research, prototypes |
| **10:00-10:30** | Weekly planning (Thu) or Backlog grooming (Mon) | `/status-all`, Linear |
| **10:30-12:00** | Flex time | Continue deep work or wind down |

### Weekly Rituals

| Day | Ritual | Command |
|-----|--------|---------|
| **Monday 8 AM** | Week planning | `/status-all`, `/roadmap` |
| **Wednesday 4 PM** | Mid-week check | `/team --help-needed` |
| **Friday 5 PM** | Week review | `/eow`, reflect on what shipped |
| **Friday 5:30** | Next week prep | Update Linear priorities |

### "Frog" Identification (What to Do First)

Your `/morning` should surface the highest-impact task. Here's how to identify it:

| Criteria | Weight | Source |
|----------|--------|--------|
| Blocking others (team waiting on you) | 5x | `/team --help-needed` |
| P0 initiative with stale progress | 4x | `/status-all` |
| Leadership explicitly requested | 3x | Slack 🔴 items |
| Customer-facing deadline | 3x | Notion launches |
| Overdue task | 2x | Google Tasks |
| Personal growth opportunity | 1x | Tyler context |

---

## Implementation Options

### Option A: Enhance Existing Commands (Recommended)

**Effort:** Low (1-2 days)  
**Maintenance:** None additional  
**Effectiveness:** High

**Changes:**
1. **Enhance `/morning` to auto-create calendar blocks** via `GOOGLESUPER_CREATE_EVENT`
2. **Add "frog" identification** to `/morning` output
3. **Create `/triage` command** that combines `/slack-monitor` + email check
4. **Add meeting prep** - For each upcoming meeting, pull relevant context

### Option B: Add Reclaim.ai

**Effort:** Low (2-3 hours setup)  
**Maintenance:** $10/month  
**Effectiveness:** High for time protection

**Integration:**
1. Connect Reclaim to Google Calendar
2. Add tasks from Linear via Reclaim's integration
3. Set habits: "2 hours deep work daily", "30 min planning daily"
4. Let Reclaim manage your calendar

### Option C: Build Dedicated Web App (Not Recommended)

**Effort:** High (2-4 weeks)  
**Maintenance:** Ongoing development  
**Effectiveness:** Unknown

**Why Not:**
- Another interface to check
- Duplicates what `/morning` + Reclaim can do
- Takes PM time away from actual PM work
- Your AI copilot in Cursor IS the interface

### Option D: GitHub Actions for Scheduled Runs

**Effort:** Medium (1 day)  
**Maintenance:** Low  
**Effectiveness:** Medium

**Setup:**
```yaml
# .github/workflows/morning-digest.yml
name: Morning Digest
on:
  schedule:
    - cron: '0 15 * * 1-5'  # 8 AM Mountain Time (UTC-7)
jobs:
  morning:
    runs-on: ubuntu-latest
    steps:
      - name: Run morning planning
        run: |
          # Call MCP endpoints or Slack webhook
          # Push summary to Slack DM
```

**Limitation:** Can't run Cursor commands directly; would need separate script.

---

## Final Recommendation

### Tier 1: Do Now (This Week)

1. **Add Reclaim.ai** ($10/month)
   - Connect Google Calendar
   - Set habit: "2 hours focus time daily"
   - Set habit: "30 min morning planning"
   - Enable Linear integration if available

2. **Commit to the rituals**
   - `/morning` at 8:00 AM every day
   - `/eod` at 5:30 PM every day
   - `/eow` on Friday

3. **Use `/block` religiously**
   - After `/morning`, immediately block your top 3 tasks
   - Example: `/block "Write Privacy Agent PRD" 2h`

### Tier 2: Do Soon (Next 2 Weeks)

4. **Enhance `/morning` output**
   - Add "Your Frog Today" section (highest impact, most avoided)
   - Add "Meeting Prep Needed" section
   - Add "Blockers You Can Clear" section

5. **Create `/prep [meeting]` command**
   - Pulls context for upcoming meeting
   - Loads relevant initiative, customer context from HubSpot
   - Surfaces open questions

### Tier 3: Consider Later

6. **Experiment with Background Agents**
   - Watch for Cursor updates on scheduled/background agents
   - Could enable proactive notifications without webhook infrastructure

7. **Weekly Review Template**
   - Structured reflection beyond `/eow`
   - "What did I learn?", "Where did I drop the ball?", "What's my frog next week?"

---

## What NOT to Do

| Anti-Pattern | Why It Fails | Better Alternative |
|--------------|--------------|---------------------|
| Build a custom web app | Cognitive overhead, maintenance burden | Enhance existing commands |
| Add more Slack bots | More noise, not less | Use `/slack-monitor` with state |
| Check Slack constantly | Interruption-driven, reactive | Batch triage 2-3x/day |
| Skip morning planning | Day becomes reactive | `/morning` is non-negotiable |
| Ignore calendar blocking | Deep work never happens | `/block` + Reclaim.ai |
| Say yes to everything | Scope creep, missed commitments | "Let me check my priorities" |

---

## Success Metrics

How to know if this is working:

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Focus hours per week** | 10+ hours | Reclaim dashboard |
| **🔴 Slack items at EOD** | 0 | `/slack-monitor` |
| **Blocked teammates** | 0 for >24h | `/team --help-needed` |
| **Initiatives advancing** | 1+ phase transition/week | `/status-all` |
| **PRD turnaround time** | <3 days from request | Linear labels |
| **Sam asking for updates** | Never (you push proactively) | Slack history |

---

## Appendix: Reclaim.ai Setup Guide

### Step 1: Connect Google Calendar
1. Go to reclaim.ai, sign up with Google account
2. Grant calendar access

### Step 2: Create Habits
- **Deep Work:** 2 hours/day, prefer afternoons, high priority
- **Morning Planning:** 30 min/day, 8-9 AM, high priority
- **Slack Triage:** 15 min, 2x/day (12:30 PM, 4:30 PM), medium priority

### Step 3: Import Tasks
- Connect Linear if available
- Or manually add top tasks weekly

### Step 4: Set Preferences
- **Focus time:** Prefer 1-4 PM
- **Meeting times:** Prefer 9 AM - 12 PM
- **No meetings:** After 4:30 PM

### Step 5: Defend Your Time
- Let Reclaim auto-decline or reschedule conflicts
- Review weekly and adjust habits

---

## Appendix: Enhanced `/morning` Specification

**Proposed additions to `daily-planner` skill:**

```markdown
## Your Frog Today 🐸

The one task that's highest impact AND you're most avoiding:

**[Task Name]** - [Why it's important] - [Why you're avoiding it]

Scheduled: [time block] in your calendar

---

## Meeting Prep Needed

| Meeting | Time | Context Loaded | Open Questions |
|---------|------|----------------|----------------|
| {title} | {time} | [Customer: X, Initiative: Y] | [List] |

---

## Blockers You Can Clear

These teammates are waiting on you:

1. **[Person]** needs: [PRD/Decision/Review] for [Project]
   - Impact: Unblocks [X] issues
   - Time estimate: [Y] minutes
```

---

*Research compiled by PM Copilot. Last updated: February 7, 2026.*
