# Operating Rhythm & Prioritization Framework

> "You need to find the compass." -- Jamis, Feb 5 2026
> "If everything else gets dropped and these 3 are perfect, really good, and everyone in the room says yes -- great." -- Jamis, Feb 5 2026

---

## Tyler's North Star (The Compass)

**I am the person who knows what is happening across product and can translate it for any audience.**

That's it. Not the person who does everything. The person who KNOWS everything and helps it flow.

Test for any task: "Does this help me know what's happening, or help me communicate what's happening to someone who needs to know?"

- Yes? Do it.
- No? Redirect it, deprioritize it, or let it break.

---

## Daily Structure

Inspired by Jamis's priority framework. These are ordered. Each thing must be true before moving to the next.

### Morning Routine (Before Work)
1. **Sleep** -- 7 hours minimum. Non-negotiable. If not 7 hours, adjust everything else.
2. **Move** -- 30 minutes. Run, sauna, walk. Not optional. Not "if I have time."
3. **Unwind** -- 15 minutes of something non-work. YouTube, podcast, breakfast without screens.
4. **Then work.**

### Work Day (8 hours, not 12)

| Block | Time | Activity | Tool |
|-------|------|----------|------|
| **Scan** | 30 min (morning) | Slack scan: 5-7 channels only. Linear check: who's blocked? | `/slack-monitor`, `/team` |
| **Focus** | 3-4 hours | The 1-3 things for today. Nothing else. Phone on DND. Cursor closed except for the one task. | One task at a time. ONE Cursor window. |
| **Lunch** | 45 min | Eat. Away from desk. Not optional. | Fork and knife. |
| **Communicate** | 2 hours | Respond to Slack, facilitate handoffs, join meetings. Batch communication. | Slack, meetings |
| **Capture** | 15 min (end of day) | Get every hot potato out of your head. What happened today? What's tomorrow? | `/eod --digest` or paper journal |

### Evening Routine
1. **Maddie** -- Present. Not thinking about Jason's project.
2. **Unwind** -- Something completely non-work. Golf, book, show.
3. **Journal** -- 5 minutes. The 5 things stressing you out. Written, not typed.
4. **Work** -- Only if sleep, Maddie, and unwind are done. And only for a defined block, not "until it's done."

### What Changes Immediately
- **6 Cursor windows becomes 1.** One task. One window. Finish or consciously set it down.
- **47 Slack messages/day becomes ~15.** Batch communication into the afternoon block.
- **34+ channels becomes 5-7.** The rest get checked by `/slack-monitor` once per day.
- **No code.** If something needs code, create a Linear ticket and assign it.

---

## Weekly Structure

| Day | Primary Focus | Secondary |
|-----|--------------|-----------|
| **Monday** | Weekly planning. Identify the 5-7 things for the week. Check Linear status across all projects. | Sam 1:1 prep |
| **Tuesday** | Deep work day. One initiative gets Tyler's full attention. | CS channel triage |
| **Wednesday** | Handoff day. What's ready from engineering? What needs release communication? | Product council prep |
| **Thursday** | Communication day. Status updates, stakeholder syncs, facilitate decisions. | Standup context |
| **Friday** | Reflection + capture. What got done? What got dropped? What needs to change? | `/eow` report, journal |

### Weekly Rituals
- **1:1 with Sam:** Push for discovery direction. Bring one question: "How would you approach X?"
- **1:1 with Bryan:** "What does engineering need from product this week?" and "Where am I overstepping?"
- **Weekly product update:** 3 bullets shared in #product-updates. What shipped. What's next. What's blocking.
- **Friday capture:** Run `/eow`. Review the 5-Day Test: am I still working on the 3 things that matter?

---

## The "Is This My Job?" Decision Tree

```
Someone asks Tyler to do something
        |
        v
Does it help me KNOW what's happening?
        |
    YES --> Do it (Scan/Monitor)
    NO  --> v
        |
Does it help COMMUNICATE what's happening to someone who needs to know?
        |
    YES --> Do it (Facilitate/Translate)
    NO  --> v
        |
Is it one of my 3 active initiatives?
        |
    YES --> Is it on my task list for today?
        |       YES --> Do it
        |       NO  --> Add to tomorrow, don't context-switch
    NO  --> v
        |
Can someone else do this?
        |
    YES --> Redirect. "Great question. Bryan/Sam/Skylar/Kensi would be best for this."
    NO  --> v
        |
What happens if this doesn't get done this week?
        |
    NOTHING --> Let it wait. Add to backlog.
    SOMETHING BREAKS --> Flag to Sam: "This needs attention and I don't have bandwidth. What should I deprioritize?"
```

---

## The 3 Phrases Tyler Needs

For when the "I can help" reflex kicks in:

### 1. The Redirect
> "That's a great question. [Name] would be the best person for that. Want me to connect you?"

Use when: Someone asks Tyler to do something outside his 3 core responsibilities.

### 2. The Tradeoff
> "I can do that, but it would mean deprioritizing [current task]. Which is more important to you?"

Use when: Someone asks Tyler to take on something new that IS product work but would displace current priorities.

### 3. The Flag
> "I'm seeing a gap here that I don't have bandwidth to fill. Here's what I think will happen if we don't address it: [consequence]. Who should own this?"

Use when: Something is genuinely falling through the cracks and Tyler's instinct is to flex-seal it.

---

## What Sam Needs to See (Suggested 1:1 Agenda)

Tyler should bring this to his next 1:1 with Sam:

### The Conversation

1. **"Here's what I think my job is."** Share the 3 core responsibilities from the boundary prototype.

2. **"Here's what I've been doing instead."** Show the gap: 18 initiatives, 54 commands, coded prototypes, integration code. Be honest about the overextension.

3. **"Here's what I propose."** The initiative triage: 3 active, 4 on-request, 6 transfer to Sam, 10 freeze. Ask: "Does this match your expectations?"

4. **"Here's what I need from you."** 
   - Top 3 priorities for me this sprint
   - Guidance on discovery (walk me through one project)
   - Permission to say no -- explicitly

5. **"Here's how I want to grow."** The PM rubric Sam shared. Pick 1-2 areas to focus on this quarter. Not all of them.

### The Ask

> "Sam, I've been trying to carry the entire product function for 5 months without boundaries. I need your help defining what my actual lane is. Here's my prototype -- tell me where I'm wrong."

---

## What Bryan Needs to See

Tyler should bring this to a conversation with Bryan:

1. **"I took your advice."** Show the boundary prototype. "Here's what I think my job is."
2. **"Here's what I'm stopping."** Code, prototypes, engineering spec writing, Linear project management.
3. **"Here's what I need from you."** Flag when engineers are blocked on product clarity. Give me honest feedback when I'm cavitating again.
4. **"Thank you."** Bryan's advice today was the most actionable thing Tyler has heard in 5 months.

---

## The Jamis Priorities (Personal Compass)

From the conversation with Jamis, adapted for Tyler:

### Morning Priority Stack
1. Sleep (7 hours -- if not, everything adjusts)
2. Move (30 min -- run, sauna, walk)
3. Unwind (15 min -- something non-work before starting)
4. Then work

### Evening Priority Stack
1. Sleep (protect bedtime)
2. Maddie
3. Unwind (golf, show, book, NOT audiobook-while-working)
4. Journal (5 min, pen on paper, 5 stressors + 3 gratitudes)
5. Work (only if 1-4 are done)

### Weekly Identity Statements (from Jamis's framework)
- "I am the person who doesn't miss a morning run."
- "I am the person who eats lunch every day."
- "I am the person who knows what's happening across product."
- "I am the person who brings clarity, not who does everything."

### The Season Check
Not everything has to happen this season. Right now:
- **In season:** PM craft, learning from Sam, knowing what's happening, health basics
- **Not in season:** Building PM tooling, prototyping in code, defining product strategy alone, perfecting process
- **That's okay.**

---

## Success Metrics (How Tyler Knows This Is Working)

### After 1 Week
- [ ] Had the conversation with Sam about boundaries
- [ ] Reduced Cursor windows from 6 to 1
- [ ] Ate lunch every day
- [ ] Ran or moved 3+ days
- [ ] Daily Slack message count dropped below 25

### After 1 Month
- [ ] Only 3 initiatives actively owned
- [ ] Sam has given clear priority direction for each sprint
- [ ] Engineering handoffs are smoother (ask Bryan for feedback)
- [ ] No new commands, skills, or agents added to workspace
- [ ] Weekend commits: zero
- [ ] Can answer "what is every engineer working on?" without checking 6 tools

### After 3 Months
- [ ] Tyler can describe his job in 2 sentences (not a 26-minute brain dump)
- [ ] Sam has taught Tyler at least one discovery framework
- [ ] Tyler's Slack messages are 70% proactive (updates, proposals) not reactive (answering questions)
- [ ] Tyler has said "that's not my job" at least 10 times without guilt
- [ ] Tyler has let something break and someone else picked it up

---

## Closing Note

Tyler, the data is clear. Your effort has never been the problem. Your care for the product, the team, and the customers is genuine and visible to everyone.

The problem is that you've been doing three people's jobs while telling yourself it was one person's job that you just needed to do better. The workspace you built, the 54 commands, the 147 prototype files, the 150+ documents across 23 initiatives -- that's not the work of someone who is underperforming. That's the work of someone who doesn't know where to stop.

Bryan gave you the answer today: "Prototype your own boundaries." This document is that prototype.

Now bring it to Sam. Negotiate. Adjust. And then -- and this is the hard part -- actually live within the boundaries you've set.

One Cursor window. Three initiatives. Lunch every day.

That is enough. You are enough.
