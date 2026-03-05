# Collaboration Routing

Suggest teammates to involve based on the current work context.

## Usage

```
/collab
/collab [topic or initiative]
```

## Behavior

References `tyler-context.md` team map to suggest appropriate collaborators.

## When to Suggest Collaboration

| Work Type | Likely Collaborators |
|-----------|---------------------|
| Technical architecture | Engineering leads |
| Design decisions | Design team |
| Customer-facing changes | CS, Sales leads |
| Roadmap/prioritization | Product leadership |
| Data/analytics | Data team |
| Go-to-market | Marketing, Sales |

## Team Map Reference

Load `@pm-workspace-docs/company-context/tyler-context.md` for:
- Current team structure
- Escalation paths
- Handoff patterns
- Who owns what areas

## Questions to Consider

1. **Who is affected?** - Stakeholders who need to know
2. **Who has context?** - People who've worked on related areas
3. **Who decides?** - Approval needed from whom
4. **Who implements?** - Engineering/design involvement

## Output Format

```
📋 **Collaboration Suggestion for [topic]**

**Should involve:**
- [Name] - [Role] - [Why]
- [Name] - [Role] - [Why]

**Timing:**
- [When to loop in: early design, before build, at review, etc.]

**Suggested approach:**
- [Async update, sync meeting, design review, etc.]
```

## Integration with Other Commands

After running complex workflows, suggest collaboration:

- After `/pm` → "Consider sharing PRD with [stakeholders] for review"
- After `/proto` → "Ready for design review? Loop in [designer]"
- After `/validate` → "Share jury results with [product lead]"
