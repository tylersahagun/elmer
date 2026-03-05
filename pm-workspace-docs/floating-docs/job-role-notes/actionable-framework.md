# Tyler's Actionable Operating Framework

**Created:** February 5, 2026  
**Purpose:** A practical guide for daily decisions about what to do and what to decline.

---

## Your Role in One Sentence

**You are the translation layer between engineering and revenue/PMM.** Your job is to KNOW what's happening and FACILITATE handoffs - not to DO the work on either side.

---

## The Priority Stack (Feb-Mar 2026)

### 🔴 P0: Must Protect (Glass Balls)

These will break if dropped. Protect them.

| Priority | Why | Time/Week |
|----------|-----|-----------|
| **Sam alignment** | New boss, unclear expectations = failure mode | 3-4 hours |
| **Know what engineering is building** | Your core value proposition | 5-6 hours |
| **Critical customer escalations** | Fishbowl SF, churn alerts | 2-3 hours |
| **Release communication** | Revenue needs to know what shipped | 2-3 hours |

### 🟡 P1: Should Do (Rubber Balls)

These matter but will bounce if dropped for a day.

| Priority | Why | Time/Week |
|----------|-----|-----------|
| **Top 3 initiative documentation** | PRDs, specs for what's in flight | 4-5 hours |
| **Answer stakeholder questions** | "What's next?" "When does X ship?" | 3-4 hours |
| **Linear/Slack triage** | Route signals to right owners | 2-3 hours |

### 🟢 P2: Can Wait (Plastic Balls)

Drop these without guilt.

| Priority | Why | Delegate To |
|----------|-----|-------------|
| PM workspace tooling | Overbuilt, maintenance overhead | Archive |
| PMM enablement | Tony/Kensi's job | Tony/Kensi |
| Code/PostHog work | Engineering's job | Linear ticket |
| Discovery research | Sam's job now | Sam |
| Roadmap definition | Sam's job now | Sam |
| Process documentation | Nice-to-have | Later |

---

## Daily Rhythm Template

### Morning (8:00-10:00 AM)

```
1. [ ] Check Slack for overnight fires (15 min)
2. [ ] Run /slack-monitor (10 min review)
3. [ ] Review Linear for blocked items (15 min)
4. [ ] Identify TODAY's top 2 deliverables
5. [ ] Attend engineering standup (if applicable)
```

### Mid-Day (10:00 AM - 2:00 PM)

```
1. [ ] LUNCH (non-negotiable, leave desk)
2. [ ] Deep work: ONE initiative documentation
3. [ ] Answer accumulated questions (batch process)
```

### Afternoon (2:00-5:00 PM)

```
1. [ ] Follow up on morning items
2. [ ] Prepare handoff notes for anything shipping
3. [ ] Draft communication for revenue team
4. [ ] /eod command
5. [ ] Close laptop
```

### What NOT to Do

- ❌ Run 6 Cursor windows
- ❌ Start new automation projects
- ❌ Write code for PostHog/settings/feature flags
- ❌ Create training materials (that's PMM)
- ❌ Define roadmap (that's Sam)
- ❌ Work past 6:00 PM unless true emergency

---

## Decision Framework

When a new task comes to you, run through this:

### Step 1: Is this my job?

| If the task is... | Answer |
|-------------------|--------|
| Understanding what engineering built | ✅ Yes, do it |
| Translating to revenue/PMM | ✅ Yes, do it |
| Answering "what's happening" questions | ✅ Yes, do it |
| Writing code | ❌ No, make Linear ticket |
| Defining roadmap | ❌ No, ask Sam |
| Creating training | ❌ No, route to PMM |
| Discovery research | ❌ No, flag to Sam |
| Fixing process gaps | ⚠️ Flag it, do minimum viable |

### Step 2: Is this in my top 3?

If not in your top 3 initiatives, ask:
- "Is this a critical customer issue?" → Do it
- "Can this wait until Monday?" → It can wait
- "Am I the only one who can do this?" → Usually no

### Step 3: What's the minimum viable action?

| Instead of... | Do... |
|---------------|-------|
| Building an automation | Write 3 bullet points |
| Creating a subagent | Answer the question directly |
| Writing a PRD from scratch | Copy a template and fill gaps |
| Running the training yourself | Send Kensi the doc and deadlines |
| Fixing the code bug | Create Linear ticket with context |

---

## Boundary Scripts

Use these when people ask you to do things that aren't your job:

### For PMM requests (Tony/Kensi)

> "I can give you the context and bullet points, but creating the training/materials is in your court. Here's what I know: [3 bullets]. Let me know if you need clarification."

### For code requests

> "That sounds like an engineering task. I'll create a Linear ticket with the context. [Create ASK-XXXX]. Bryan can prioritize it."

### For roadmap questions

> "Sam is owning roadmap decisions now. I can tell you what's currently in flight, but for 'what's next' strategy, you'll want to loop him in."

### For discovery research

> "That's discovery work - Sam mentioned he wants to own that process. Let me flag it to him and see how he wants to approach it."

### For "can you just..."

> "I can help with context, but I'm focused on [top priority] today. If it can wait until [day], I can look at it then. Otherwise, [person] might be able to help sooner."

---

## The "Not My Job" List

Post this where you can see it:

### Things Tyler Does NOT Own

1. ❌ Product roadmap (Sam)
2. ❌ Discovery research (Sam)
3. ❌ Engineering management (Bryan)
4. ❌ Code/PostHog implementation (Engineering)
5. ❌ Training development (PMM)
6. ❌ Customer enablement materials (PMM)
7. ❌ Sales enablement (PMM)
8. ❌ Linear cleanup/maintenance (Engineering)
9. ❌ Feature flag management (Engineering)
10. ❌ Process documentation beyond your workflow

### Things Tyler DOES Own

1. ✅ Knowing what engineering is building
2. ✅ Translating engineering work to revenue/PMM
3. ✅ Answering "what's happening" questions
4. ✅ Release documentation (Ivan Test format)
5. ✅ Critical customer escalation context
6. ✅ Top 3 initiative documentation
7. ✅ Asking Sam for direction when unclear
8. ✅ Flagging gaps (but not filling all of them)

---

## Weekly Check-In (Every Friday)

Ask yourself:

1. **Did I protect my glass balls?** (Sam alignment, engineering context, customer escalations, release comms)
2. **Did I say no to at least 3 things this week?**
3. **Did I take lunch away from my desk 3+ days?**
4. **Am I running 1 Cursor window or 6?**
5. **Can I explain what the top 3 initiatives status is in 30 seconds?**

If any answer is "no," course correct next week.

---

## PM Workspace Simplification Plan

### Week 1: Archive

Move to `/archived/` folder:
- All skills except: `activity-reporter`, `initiative-status`, `slack-sync`
- All subagents except: `slack-monitor`, `signals-processor`, `proto-builder`
- All commands except: `/eod`, `/eow`, `/status`, `/slack-monitor`, `/save`, `/update`

### Week 2: Consolidate

- Reduce initiatives from 25 to top 5 active + archive the rest
- Consolidate 365 personas to 6 core archetypes
- Delete unused hypotheses

### Week 3: Document

- Create 1-page "Tyler's Operating Model" doc for Sam
- Define Linear workflow labels you'll use
- Set up simple daily tracking (not automated)

---

## Success Metrics (30-60-90)

### 30 Days

- [ ] Sam can articulate what your job is
- [ ] Revenue team says "Tyler knows what's going on"
- [ ] You've archived 50% of PM workspace
- [ ] You're taking lunch 4/5 days

### 60 Days

- [ ] Decision rights documented with Sam
- [ ] Top 3 initiatives tracked (not 25)
- [ ] You've said "no" to 10+ things
- [ ] Working 40 hours, not 50+

### 90 Days

- [ ] Sam calls you "right hand for execution"
- [ ] Brian says "handoffs are clean"
- [ ] You have a non-work hobby
- [ ] You can answer Jamis's question

---

## Emergency Reference Card

**When overwhelmed, ask:**

1. "What's the ONE thing I must do today?"
2. "Is this my job or am I filling someone else's gap?"
3. "What would I tell a friend in this situation?"
4. "What's the 80% solution I could ship to learn?"

**When someone asks for something:**

1. "Is this in my top 3?"
2. "Who should actually own this?"
3. "What's the minimum viable response?"
4. "Can I flag this and move on?"

**When spinning:**

1. Stop. Walk outside. 5 minutes.
2. Write down the 3 stressors.
3. Pick ONE. Do the smallest next step.
4. The rest can wait.

---

*Print this. Keep it visible. Revisit weekly.*
