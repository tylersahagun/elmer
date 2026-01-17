# Strategic Guardrails

> **⚠️ TEMPLATE** - Run `/setup` to generate your guardrails, or edit this file directly.
>
> Use these guardrails to evaluate initiatives, push back on unclear proposals, and ensure alignment with product vision before investing in PRDs or prototypes.

---

## Quick Vision Check (30 Seconds)

Before going deeper, confirm:

- [ ] **Outcome chain exists**: Can you clearly articulate "...so that [business outcome]"?
- [ ] **Human-centered**: Does this help users do better work, not replace them?
- [ ] **Trust-compatible**: Does this maintain or increase user trust?
- [ ] **Not anti-vision**: Is this different from what we said we wouldn't build?

If any of these fail, **STOP and ask clarifying questions**.

---

## Red Flags to Challenge

When reviewing transcripts, PRDs, or proposals, **push back immediately** if you detect:

### 🚩 Unclear User Outcomes

| Signal | Challenge Question |
|--------|-------------------|
| "Users can now do X" with no why | "What business outcome does this enable? What changes for the user's day?" |
| Feature described without persona | "Which persona needs this? What's their current pain?" |
| No success metric defined | "How would we know if this is working? What behavior changes?" |
| "Nice to have" framing | "If we didn't build this, what happens? Is there evidence of demand?" |

### 🚩 Business Impact Missing

| Signal | Challenge Question |
|--------|-------------------|
| No tie to key metrics | "How does this improve [north star metric]?" |
| No competitive positioning | "Does this help us win customers we're currently losing?" |
| "Build it and they will come" | "What evidence suggests customers will use this?" |
| Generic "value" claims | "Can you quantify this? What does 'better' mean specifically?" |

### 🚩 Trust / Experience Concerns

| Signal | Challenge Question |
|--------|-------------------|
| New automation without user control | "Can users understand and override this?" |
| Data access expansion | "Does the user understand what we're accessing?" |
| Error states undefined | "What happens when this fails? How do we recover?" |
| "Just trust the AI" framing | "How do we show our work? Can users verify?" |

### 🚩 Anti-Vision Triggers

<!--
CUSTOMIZE: Add your anti-vision items here.
When requests match these, push back.
-->

| Signal | Challenge Question |
|--------|-------------------|
| [Anti-vision item 1] | "This sounds like [anti-vision]. How is this different?" |
| [Anti-vision item 2] | "We said we wouldn't build [this]. What changed?" |

---

## The Outcome Chain Test

Every initiative should have a clear chain. If you can't complete this, the initiative isn't ready:

```
[This feature] enables [user action]
  → so that [immediate user benefit]
    → so that [behavior change]
      → so that [north star metric improves]
```

### Example (Good)

```
New onboarding wizard guides users through setup
  → so that users don't get stuck on configuration
    → so that they reach value faster
      → so that time-to-first-value decreases
```

### Example (Bad - Missing Links)

```
We add a new dashboard
  → so that users can see data
    → ??? (what do they do differently?)
      → ??? (how does this affect outcomes?)
```

---

## Strategic Fit Matrix

Rate each initiative (1-5) on these dimensions:

| Dimension | Question | Weight |
|-----------|----------|--------|
| **Outcome Orientation** | Is there a clear business outcome tied to this? | High |
| **Human Empowerment** | Does this help users do better work? | High |
| **Trust Foundation** | Does this improve reliability or transparency? | High |
| **Differentiation** | Is this uniquely valuable vs. alternatives? | Medium |
| **Persona Fit** | Does this serve our primary personas? | Medium |

**Scoring:**
- 25-30: Strong alignment, proceed
- 18-24: Needs refinement, clarify gaps
- Below 18: Reconsider scope or defer

---

## Questions to Ask Before Prototyping

### On the Problem

1. Who specifically has this problem? (Name personas)
2. What are they doing today to solve it?
3. How often does this pain occur?
4. What's the cost of not solving this?
5. What evidence do we have (quotes, data)?

### On the Solution

1. Why this solution vs. alternatives?
2. What's the minimum version that tests the hypothesis?
3. What could go wrong? What breaks user trust?
4. How do we measure success vs. failure?
5. What do we learn even if it doesn't work?

### On Strategic Fit

1. Which strategic pillar does this strengthen?
2. Does this move us toward our north star or away from it?
3. Is this aligned with "quality over velocity" or are we rushing?

---

## Initiative Readiness Checklist

Before writing a PRD, confirm:

- [ ] **Problem validated**: We have evidence (quotes, data, research)
- [ ] **Persona identified**: We know who this is for and their context
- [ ] **Outcome chain complete**: Clear path from feature → business outcome
- [ ] **Trust implications assessed**: No surprises around privacy/reliability
- [ ] **Success metric defined**: We know what to measure
- [ ] **Strategic fit confirmed**: Aligns with pillars and principles
- [ ] **Anti-vision check passed**: This isn't something we said we wouldn't build

If any boxes are unchecked, the initiative needs more discovery before PRD work begins.

---

## When to Escalate

Flag for discussion if:

1. **Conflicting priorities**: Two initiatives compete for the same capacity
2. **Scope creep toward anti-vision**: The solution is drifting off-strategy
3. **Missing outcome data**: We can't tie the initiative to business impact
4. **Persona confusion**: It's unclear which persona this serves
5. **Trust concerns**: This might undermine user confidence

---

## Reference Quotes

<!--
Add quotes from leadership, customers, or principles that help ground decisions.
Use these when pushing back on misaligned requests.
-->

> "[Quote about product direction]"
> — [Source]

> "[Quote about what you won't build]"
> — [Source]
