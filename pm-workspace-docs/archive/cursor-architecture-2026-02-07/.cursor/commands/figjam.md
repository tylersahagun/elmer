# FigJam Diagram Command

Generate diagrams in FigJam using natural language descriptions.

## Usage

```
/figjam [description]
```

## Examples

```
/figjam lead qualification flow for sales
/figjam sequence diagram for webhook processing
/figjam state machine for meeting recording lifecycle
/figjam gantt chart for Q1 roadmap
```

## Behavior

**Delegates to**: `figjam-generator` subagent

The subagent will:

1. Identify the appropriate diagram type from your description
2. Generate valid Mermaid.js syntax
3. Call the Figma MCP tool to create the diagram
4. Return a clickable link to the FigJam diagram

## Supported Diagram Types

| Type          | Keywords                          | Best For                   |
| ------------- | --------------------------------- | -------------------------- |
| Flowchart     | flow, process, steps, journey     | Workflows, user journeys   |
| Sequence      | sequence, API, calls, interaction | Service interactions       |
| State         | state, status, lifecycle          | Object states, transitions |
| Gantt         | timeline, schedule, roadmap       | Project planning           |
| Decision Tree | decision, if/then, qualification  | Conditional logic          |

## Not Supported

- UI mockups or wireframes (use `/proto` instead)
- Class diagrams, ERDs, pie charts
- Layout adjustments after generation (edit in FigJam directly)

## Tips

- **Keep it simple**: Start with happy path, add complexity later
- **Be specific**: "lead qualification with budget and timeline checks" > "sales flow"
- **Iterate**: Ask for changes and the diagram will be regenerated

## After Generation

The subagent returns a FigJam URL. In FigJam you can:

- Move and resize shapes
- Add colors and styling
- Connect to other FigJam content
- Share with teammates
