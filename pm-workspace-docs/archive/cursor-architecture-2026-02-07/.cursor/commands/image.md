# Image Command

Generate images for mockups, diagrams, and visualizations using Cursor 2.4's image generation.

## Usage

```
/image [description]
```

Or just describe what you want in natural language:
```
"Generate an image of a meeting insights dashboard"
```

## Examples

### UI Mockups

```
/image A dashboard showing user engagement metrics with sidebar navigation
/image Mobile meeting summary view with collapsible sections
/image Error state UI for failed CRM sync with retry button
```

### Diagrams

```
/image Data flow diagram from meeting recording to CRM update
/image Architecture diagram showing the integration between Elephant and HubSpot
/image User journey map for the onboarding flow
```

### Design Exploration

```
/image Three variations of a meeting card component: minimal, standard, and detailed
/image Dark mode version of the action items panel
```

## Output

- Images are saved to `assets/` by default
- Inline preview is shown in the conversation
- Can be used as reference for prototype development

## Best Practices

- **Be specific** - Include colors, layout, and component details
- **Reference design system** - Mention existing patterns when applicable
- **Use for exploration** - Great for early concepts before coding
- **Follow up with code** - Use `/proto` to build real components

## When to Use

| Scenario | Recommendation |
|----------|----------------|
| Quick concept visualization | `/image` |
| Stakeholder presentation | `/image` then refine |
| Ready for development | `/proto` with image as reference |
| Architecture planning | `/image` for diagram |

## Related Commands

- `/proto [name]` - Build full Storybook prototype
- `/lofi-proto [name]` - Quick wireframe prototype
- `/design [name]` - Design review and considerations
