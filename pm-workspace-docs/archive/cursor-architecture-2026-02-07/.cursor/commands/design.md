# Design Command

Review design considerations for an initiative using human-centric AI design principles.

## Usage

```
/design [initiative-name]
```

## Behavior

**Uses**: `design-companion` skill

This command will:
1. Load initiative's design brief and prototype notes
2. Apply human-centric AI design checklist
3. Review trust, emotion, and accessibility criteria
4. Flag anti-patterns and concerns
5. Provide actionable recommendations

## Design Checklist

### Trust Check
- [ ] User understands what AI will do before it acts
- [ ] User can see evidence for AI decisions (receipts)
- [ ] User can easily undo AI actions
- [ ] AI admits uncertainty appropriately
- [ ] Failures are graceful and recoverable

### Emotional Design
- **Visceral**: Does it look trustworthy at first glance?
- **Behavioral**: Are interactions predictable?
- **Reflective**: Does user feel augmented, not replaced?

### Accessibility
- [ ] Keyboard navigable
- [ ] Screen reader compatible
- [ ] Sufficient color contrast
- [ ] Animation respects reduced motion

## Anti-Patterns Flagged

🚩 Confident wrongness
🚩 Unexplained actions
🚩 Silent failure
🚩 Over-automation
🚩 Surveillance vibes
🚩 Replacement framing

## Output

Design review report with:
- Trust assessment
- Emotional design evaluation
- Accessibility check
- Specific recommendations

## Next Steps

After design review:
- Address concerns: Update design brief and prototype
- Ready for validation: Run `/validate [name]`
