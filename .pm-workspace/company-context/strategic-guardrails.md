# Strategic Guardrails

> Use these guardrails to evaluate initiatives, push back on unclear proposals, and ensure alignment with product vision before investing in PRDs or prototypes.

---

## Quick Vision Check (30 Seconds)

Before going deeper, confirm:

- [ ] **Outcome chain exists**: Can you clearly articulate "...so that [business outcome]"?
- [ ] **Human-centered**: Does this help humans do better work, not replace them?
- [ ] **Trust-compatible**: Does this maintain or increase user trust?
- [ ] **Not me-too**: Would we be proud to talk about this, or is it just checkbox parity?

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

### 🚩 Revenue / Business Impact Missing

| Signal | Challenge Question |
|--------|-------------------|
| No tie to expansion, retention, or acquisition | "How does this help us land, expand, or retain customers?" |
| No competitive positioning | "Does this help us win deals we're currently losing? Which ones?" |
| "Build it and they will come" | "What evidence suggests customers will use this?" |
| Generic "value" claims | "Can you quantify this? What does 'better' mean specifically?" |

### 🚩 Trust / Privacy Concerns

| Signal | Challenge Question |
|--------|-------------------|
| New automation without privacy check | "How does this interact with privacy determination? What if capture fails?" |
| Data access expansion | "Does the user understand what we're accessing? Is consent clear?" |
| Error states undefined | "What happens when this fails? How do we recover user trust?" |
| "Just trust the AI" framing | "How do we show our work? Can users verify/correct?" |

### 🚩 Misalignment with Principles

| Signal | Challenge Question |
|--------|-------------------|
| Heavy setup/config required | "How do we make this invisible until valuable?" |
| Adding friction to existing flows | "Is the value worth the new complexity? Can we simplify?" |
| "Users will configure..." | "Can AI infer this instead of asking users to configure?" |
| Feature matches competitor exactly | "What's our unique angle? Why is this AskElephant specifically?" |
| Shipping fast without quality plan | "What's our reliability bar? How do we avoid trust debt?" |

---

## The Outcome Chain Test

Every initiative should have a clear chain. If you can't complete this, the initiative isn't ready:

```
[This feature] enables [user action]
  → so that [immediate user benefit]
    → so that [behavior change]
      → so that [business outcome: quota capacity / time-to-close / retention / win rate]
```

### Example (Good)

```
Privacy Determination Agent classifies call privacy automatically
  → so that users don't have to manually toggle privacy settings
    → so that they record more executive calls confidently
      → so that they have better coaching data
        → so that win rates improve
```

### Example (Bad - Missing Links)

```
We add a new dashboard
  → so that users can see data
    → ??? (what do they do differently?)
      → ??? (how does this affect business outcomes?)
```

---

## Strategic Fit Matrix

Rate each initiative (1-5) on these dimensions:

| Dimension | Question | Weight |
|-----------|----------|--------|
| **Trust Foundation** | Does this improve reliability, privacy, or transparency? | High |
| **Outcome Orientation** | Is there a clear business outcome tied to this? | High |
| **Human Empowerment** | Does this help humans do better work? | High |
| **Data Capture** | Does this improve the consistency/quality of data we capture? | Medium |
| **Differentiation** | Is this uniquely AskElephant? | Medium |
| **Expansion Driver** | Does this help us land/expand with target personas? | Medium |

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
5. What evidence do we have (quotes, data, churn reasons)?

### On the Solution

1. Why this solution vs. alternatives?
2. What's the minimum version that tests the hypothesis?
3. What could go wrong? What breaks user trust?
4. How do we measure success vs. failure?
5. What do we learn even if it doesn't work?

### On Strategic Fit

1. Which strategic pillar does this strengthen? (Trust / Data Knowledge / Trend Visibility)
2. Which 2026 initiative does this support?
3. Does this move us toward "revenue outcome system" or away from it?
4. Would leadership be excited about this or confused why we built it?
5. Is this aligned with "quality over velocity" or are we rushing?

---

## Initiative Readiness Checklist

Before writing a PRD, confirm:

- [ ] **Problem validated**: We have evidence (quotes, data, churn analysis)
- [ ] **Persona identified**: We know who this is for and their context
- [ ] **Outcome chain complete**: Clear path from feature → business outcome
- [ ] **Trust implications assessed**: No surprises around privacy/reliability
- [ ] **Success metric defined**: We know what to measure
- [ ] **Strategic fit confirmed**: Aligns with pillars and principles
- [ ] **Anti-vision check passed**: This isn't something we said we wouldn't build

If any boxes are unchecked, the initiative needs more discovery before PRD work begins.

---

## When to Escalate for Clarification

Flag to leadership if:

1. **Conflicting priorities**: Two initiatives compete for the same capacity with unclear priority
2. **Scope creep toward anti-vision**: The solution is drifting toward "generic AI notes"
3. **Trust debt accumulating**: We're shipping fast but degrading reliability
4. **Missing outcome data**: We can't tie the initiative to business impact after trying
5. **Persona confusion**: It's unclear if this is for reps, leaders, CSMs, or RevOps

---

## Reference: Leadership Quotes to Cite

When pushing back, reference these directly:

> "It matters about the outcome that what they build delivers."
> — Woody (on why we don't compete on features)

> "If you are not helping orchestrate a human outcome, then you are not working on the right thing."
> — Woody (on human-centered AI)

> "We need to learn to...slow down first."
> — Leadership (on quality over velocity)

> "Technology is not a moat..."
> — Woody (on why experience/delivery matter more than features)

