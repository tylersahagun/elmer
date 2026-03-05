# Product Vision Research Prompt

Use this prompt with AskElephant's global chat to extract product vision insights from leadership conversations.

---

## Master Prompt (Copy & Use)

```
Search through all conversations with leadership and founders to help me understand and document our product vision. I'm looking for:

**Core Identity & Mission**
- How do we describe what AskElephant is in our own words?
- What problem do we believe we're uniquely positioned to solve?
- What's our "reason for being" beyond just features?

**Strategic Direction**
- Where are we trying to go in the next 12-24 months?
- What markets or use cases are we prioritizing?
- What are we explicitly NOT building?

**Product Principles**
- What tradeoffs do we consistently make?
- What do we believe that others don't?
- What user behaviors are we trying to enable or change?

**Success Metrics**
- How do we know if we're winning?
- What does "good" look like for our users?
- What outcomes matter more than vanity metrics?

**Competitive Positioning**
- Who do we see as competitors and how are we different?
- What's our moat or defensibility?
- Why do customers choose us over alternatives?

Please pull direct quotes where possible and note which conversations these came from.
```

---

## Follow-Up Prompts

### For Roadmap Alignment
```
Looking at our product vision conversations, what themes or features come up repeatedly as priorities? Create a prioritized list based on how often leadership mentions them and the urgency expressed.
```

### For Prototype Guidance
```
Based on what leadership has said about our product direction, what questions should I ask before building any new feature? Generate a checklist that ensures alignment with our stated vision.
```

### For Decision Framework
```
From our leadership conversations, extract any explicit or implicit decision-making criteria. What factors do we weigh when choosing what to build? Create a decision framework based on patterns in our discussions.
```

### For Messaging & Positioning
```
How does leadership describe our value prop to customers, investors, and the team? Find variations and synthesize into a consistent narrative.
```

---

## Research Questions to Answer

Use the insights gathered to update `product-vision.md` with answers to:

1. **The One-Liner**: What's the most compelling single sentence that captures what we do?
2. **The Why Now**: What market shift or timing makes this the right moment?
3. **The Ideal Customer**: Who gets the most value from us and why?
4. **The Core Loop**: What's the primary action users take that creates value?
5. **The Anti-Vision**: What would we never build, even if users asked?
6. **The North Star**: What single metric best captures if we're succeeding?
7. **The Bet**: What contrarian belief are we building around?

---

## Suggested Filters

When running these prompts, consider filtering by:
- **Participants**: Tyler, [other founders/leaders]
- **Meeting types**: Leadership sync, strategy, planning, investor prep
- **Date range**: Last 6 months for current thinking, all-time for historical context
- **Keywords**: vision, strategy, roadmap, priority, focus, north star, mission

---

## Output Template

After gathering insights, structure findings like this:

```markdown
## Vision Insights from Leadership Conversations

### Core Identity
> [Direct quote from conversation]
- Source: [Meeting name, date]

[Synthesized insight]

### Strategic Priorities
1. [Priority 1] - mentioned in X conversations
2. [Priority 2] - mentioned in Y conversations

### Product Principles (Extracted)
- [Principle]: [Evidence/quote]

### Open Questions
- [Questions that weren't clearly answered]

### Recommended Updates to Product Vision
- [ ] Add/update section on...
- [ ] Clarify position on...
- [ ] Remove outdated reference to...
```

---

## Next Steps

1. Run the master prompt in AskElephant global chat
2. Use follow-up prompts to dig deeper on specific areas
3. Synthesize findings into the output template
4. Update `product-vision.md` with new insights
5. Create a "Prototype Alignment Checklist" based on findings

