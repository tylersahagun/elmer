# Prototype Alignment Checklist

Before building any prototype, run through these questions to ensure alignment with product vision.

> **Note**: Run `/setup` first to populate your product vision and personas.

---

## Quick Gut Check (30 seconds)

- [ ] Does this feel uniquely "us" or could any competitor build this?
- [ ] Would our primary persona care about this tomorrow?
- [ ] Is this invisible until valuable, or does it add friction?

---

## Strategic Alignment (2 minutes)

### Mission Fit
- [ ] Does this align with our stated mission?
- [ ] Which core value prop does this strengthen?
  - [ ] [Value prop 1 from product-vision.md]
  - [ ] [Value prop 2]
  - [ ] [Value prop 3]

### Persona Alignment
- [ ] Who is this for? _______________
- [ ] Is this persona in our target market?
- [ ] Does this solve a top-3 problem for them?

### Product Principles Check
Review your principles from `product-vision.md`:
- [ ] **[Principle 1]** - Does this align?
- [ ] **[Principle 2]** - Does this align?
- [ ] **[Principle 3]** - Does this align?

---

## Anti-Patterns to Avoid

Before proceeding, confirm this prototype does NOT:

- [ ] Require significant user setup before showing value
- [ ] Add steps to existing workflows without clear payoff
- [ ] Build features competitors already have (me-too features)
- [ ] Optimize for vanity metrics over real outcomes
- [ ] Match anything in your anti-vision list

Check your anti-vision from `product-vision.md`:
- [ ] [Anti-vision item 1] - This is NOT that
- [ ] [Anti-vision item 2] - This is NOT that

---

## Success Criteria

Define before building:

1. **User outcome**: What can users do after that they couldn't before?
   > _______________

2. **Measurable signal**: How would we know if this is working?
   > _______________

3. **Minimum bar**: What's the simplest version that tests the hypothesis?
   > _______________

---

## Conversation Test

Imagine explaining this to:

**A customer**: "This helps you _______________ so that _______________"
- [ ] Does this sound compelling?

**Leadership**: "We built this because _______________"
- [ ] Does this align with stated priorities?

**An investor**: "This moves the needle on _______________ metric"
- [ ] Is this connected to your north star?

---

## Decision: Build or Skip?

| Signal | Yes | No |
|--------|-----|-----|
| Aligns with product vision | | |
| Target persona would pay/engage | | |
| Passes product principles | | |
| Avoids anti-patterns | | |
| Has clear success metric | | |

**Recommendation**: 
- 5 Yes = Build now
- 3-4 Yes = Needs refinement
- <3 Yes = Revisit scope or skip

---

## Template: Prototype Brief

If proceeding, document in the initiative's PRD:

```markdown
## Prototype: [Name]

**Date**: 
**Owner**: 

### Hypothesis
We believe [persona] will [behavior] if we [feature] because [insight].

### Aligned With
- Vision element: [which part of product vision]
- Principle: [which product principle]

### Success Looks Like
[Measurable outcome tied to north star]

### Minimum Scope
[Simplest version to test]

### Out of Scope
[What we're explicitly NOT building in v1]
```
