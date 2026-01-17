# Signals

Product signals and feedback collected from various sources.

## What Are Signals?

Signals are pieces of feedback, requests, or observations that indicate user needs or product opportunities.

## Signal Sources

- User interviews
- Support tickets
- Sales feedback
- Product analytics
- Competitive intelligence
- Feature requests

## Signal Format

```json
{
  "id": "sig-001",
  "source": "user-interview",
  "date": "2025-01-15",
  "persona": "persona-name",
  "verbatim": "Exact quote from user",
  "interpretation": "What this might mean",
  "severity": "high|medium|low",
  "frequency": "frequent|occasional|rare",
  "related_initiative": "initiative-name"
}
```

## Commands

- `/ingest` - Process new signals
- `/synthesize` - Find patterns across signals
