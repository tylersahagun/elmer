---
name: design-companion
description: Human-centric AI design review for trust, emotion, and accessibility. Use when reviewing design briefs, prototypes, or any AI feature design.
---

# Design Companion Skill

Specialized knowledge for reviewing designs against human-centric AI principles.

## When to Use

- Reviewing design briefs
- Evaluating prototype designs
- Checking AI feature implementations
- Accessibility audits
- Trust and emotion assessments

## Quick Trust Check

Before approving any AI feature design:

- [ ] User understands what AI will do before it acts
- [ ] User can see evidence for AI decisions (receipts)
- [ ] User can easily undo AI actions
- [ ] User can correct AI and see learning
- [ ] AI admits uncertainty appropriately
- [ ] AI failures are graceful and recoverable

## State Design Requirements

Every AI feature needs all states designed:

| State | Required Elements |
|-------|------------------|
| **Loading** | Progress, "AI is thinking" for screen readers |
| **Success** | Confirmation, what happened, undo option |
| **Error** | What went wrong, how to fix, alternative path |
| **Low Confidence** | Muted styling, hedging language, verification prompt |
| **Empty** | Encouraging message, actionable next step |

## Emotional Design Checklist

### Visceral (First Impression)
- Does it look trustworthy and polished?
- Is AI visually distinguished from static content?
- Do animations convey intelligence without gimmicks?

### Behavioral (During Use)
- Is response time acceptable (faster than manual)?
- Are interactions predictable and consistent?
- Can users easily dismiss or correct AI?

### Reflective (After Use)
- Does user feel augmented, not replaced?
- Would they recommend to a colleague?
- Do they feel more capable, not dependent?

## Persona Concerns

### Sales Reps Fear
- Replacement ("Will AI take my job?")
- Surveillance ("Is AI tracking my performance?")
- Embarrassment ("Will AI make me look bad?")

**Design Response**: AI helps YOU, doesn't report ON you. Rep gets credit. Suggestions private until rep acts.

### Sales Managers Fear
- Losing touch with team
- AI replacing judgment on people
- Creating surveillance culture

**Design Response**: AI surfaces insights, manager decides. Coaching, not scoring.

## Accessibility Quick Check

- [ ] All AI features keyboard-accessible
- [ ] Dynamic content uses `aria-live`
- [ ] Color is not sole information carrier
- [ ] Reading level ≤ 8th grade for important info
- [ ] Animation respects `prefers-reduced-motion`
- [ ] Alternative text for visual AI elements

## Anti-Patterns to Flag

🚩 **Confident wrongness** - AI asserting incorrect info confidently
🚩 **Unexplained actions** - Acting without user understanding
🚩 **Silent failure** - No response or vague deflection
🚩 **Over-automation** - Acting without authorization
🚩 **Creepy personalization** - Using undisclosed data
🚩 **Replacement framing** - Suggesting AI replaces human value

## Copy Guidelines

### Loading States
- Short: No copy needed
- Medium: "Analyzing your conversation..."
- Long: "Processing 45-minute call... this may take a moment"

### Error States
- Be specific: "Couldn't connect to HubSpot" not "Something went wrong"
- Offer action: "Try reconnecting"
- Never blame user

### Low Confidence
- Hedge: "I think...", "This might be...", "Consider..."
- Invite verification: "Does this look right?"
- Offer alternatives: "Or did you mean...?"

## Review Questions

When reviewing prototypes, ask:

1. Would a user trust this immediately?
2. Does user understand what AI can/can't do?
3. What happens when AI is wrong?
4. Is AI faster than the manual alternative?
5. Can user see WHY AI made this decision?
6. Can user easily override or correct?
7. Does this work for all users?

## Reference

Full research: `pm-workspace-docs/research/human-centric-ai-design-research.md`
