# Strategic Guardrails

> Use these guardrails to evaluate initiatives, push back on unclear proposals, and ensure alignment with elmer's product vision before investing in PRDs or prototypes.

---

## Quick Vision Check (30 Seconds)

Before going deeper, confirm:

- [ ] **Discovery compression**: Does this reduce time from idea to validated prototype?
- [ ] **Iterative-loop friendly**: Does this support feedback cycles, or does it enforce linear waterfall?
- [ ] **Human-in-the-loop compatible**: Can users control the automation level?
- [ ] **Not anti-vision**: Is this different from "better notes," static docs, or feature factory acceleration?

If any of these fail, **STOP and ask clarifying questions**.

---

## Red Flags to Challenge

When reviewing transcripts, PRDs, or proposals, **push back immediately** if you detect:

### Discovery Compression Missing

| Signal | Challenge Question |
|--------|-------------------|
| Feature doesn't touch the discovery → prototype flow | "How does this compress discovery or reduce engineering waste?" |
| Static documentation without prototype | "Where's the working prototype? Docs alone aren't validated." |
| No tie to time-to-validated-prototype metric | "How does this improve our north star (time from idea to validated prototype)?" |
| "Ship faster" without validation | "Are we compressing discovery or just accelerating a feature factory?" |

### Iterative Loop Violations

| Signal | Challenge Question |
|--------|-------------------|
| Linear-only flow (no backward movement) | "What happens when validation fails? Can we iterate without starting over?" |
| Single approval gate instead of feedback loop | "Is this a one-shot approval or an iterative refinement cycle?" |
| "Move fast, skip validation" | "How do we avoid engineering waste if we skip prototype validation?" |
| Rigid stage gates | "Are these stages flexible for iteration, or are we enforcing waterfall?" |

### Automation Control Missing

| Signal | Challenge Question |
|--------|-------------------|
| Fully automated with no human override | "How does a user pause or intervene in this automation?" |
| No configuration for automation level | "Can users choose hands-on vs. hands-off for this stage?" |
| "AI decides, human accepts" | "Where's the human-in-the-loop control? Users should choose their automation level." |
| Black box AI decisions | "How do we show our work? Can users see why AI made this choice?" |

### Anti-Vision Triggers

| Signal | Challenge Question |
|--------|-------------------|
| "Better notes/documentation" framing | "We're not building Notion. How does this connect to working prototypes?" |
| Static artifacts as end goal | "Documents without prototypes aren't validated. What's the working software?" |
| Feature factory acceleration | "We compress discovery to validate, not to ship more features. How does this improve quality?" |
| Enterprise compliance theater | "Are these approval gates necessary, or are we adding friction?" |
| Replacing human judgment | "AI accelerates, humans decide. Where's the human decision point?" |

---

## The Outcome Chain Test

Every initiative should trace back to discovery compression or engineering waste reduction:

```
[This feature] enables [user action]
  → so that [discovery is compressed OR engineering waste is reduced]
    → so that [time-to-validated-prototype decreases OR rework rate drops]
      → so that [teams build the right thing the first time]
```

### Example (Good)

```
AI-generated design variants from PRD
  → so that PMs see 3-5 UI approaches instantly instead of waiting for designer
    → so that design iteration happens in hours, not days
      → so that discovery compresses and validated prototypes ship faster
```

### Example (Bad - Missing Links)

```
Better PRD templates
  → so that PRDs are more structured
    → ??? (how does a better template compress discovery?)
      → ??? (what's the impact on engineering waste?)
```

---

## Strategic Fit Matrix

Rate each initiative (1-5) on these dimensions:

| Dimension | Question | Weight |
|-----------|----------|--------|
| **Discovery Compression** | Does this reduce time from idea to validated prototype? | High |
| **Engineering Waste Reduction** | Does this prevent rework by validating before building? | High |
| **Iteration Support** | Does this enable feedback loops, not linear flow? | High |
| **Human Control** | Can users configure automation level? | Medium |
| **Minimal Friction** | Does this reduce steps/approvals, not add them? | Medium |

**Scoring:**
- 25-30: Strong alignment, proceed
- 18-24: Needs refinement, clarify gaps
- Below 18: Reconsider scope or defer

---

## Questions to Ask Before Prototyping

### On Discovery Compression

1. How does this reduce time from idea to validated prototype?
2. What manual step does this automate or accelerate?
3. How does this get working software in front of stakeholders faster?
4. What feedback loop does this enable?

### On Engineering Waste

1. How does this prevent engineers from building the wrong thing?
2. Does validation happen before or after engineering starts?
3. What's the cost if we skip this validation step?
4. How do we know the prototype matches what engineering will build?

### On Iteration

1. What happens when validation fails?
2. Can this flow move backward, or is it one-way?
3. How many iterations does the user control?
4. Is the AI jury used, human feedback, or both?

### On Automation Control

1. What's the default automation level?
2. Can users override or pause the automation?
3. What triggers human intervention?
4. How transparent is the AI's reasoning?

---

## Initiative Readiness Checklist

Before writing a PRD, confirm:

- [ ] **Discovery compression tie-in**: Clear path to reducing time-to-validated-prototype
- [ ] **Iterative loop support**: Feature supports feedback cycles, not waterfall
- [ ] **Human control points**: Users can configure automation level
- [ ] **Prototype deliverable**: This results in working software, not just docs
- [ ] **Success metric defined**: Ties to north star or key metrics
- [ ] **Anti-vision check passed**: Not "better notes," static docs, or feature factory acceleration

If any boxes are unchecked, the initiative needs more discovery before PRD work begins.

---

## When to Escalate

Flag for discussion if:

1. **Conflicting priorities**: Two initiatives compete for the same capacity
2. **Scope creep toward anti-vision**: The solution is drifting toward static docs or feature factory
3. **Missing iteration support**: The proposed flow is strictly linear
4. **Automation without control**: Users can't configure or override AI behavior
5. **No prototype deliverable**: The outcome is documentation without working software

---

## Reference Quotes

> "We're not optimizing the SDLC. We're using AI to compress discovery so we catch problems before they're hard to fix."
> — Sam Ho, "The PM's Guide to Building the Right Thing"

> "The PRD is now fuel for AI prototype generation, not documentation for humans to read."
> — Sam Ho, "The PM's Guide to Building the Right Thing"

> "Discover and fix issues when iteration is cheap (prototype stage), not expensive (production code stage)."
> — Sam Ho, "The PM's Guide to Building the Right Thing"

> "Don't wait for engineering to adopt AI—start with discovery. You can improve discovery immediately while engineering figures out their AI adoption path."
> — Sam Ho, "The PM's Guide to Building the Right Thing"
