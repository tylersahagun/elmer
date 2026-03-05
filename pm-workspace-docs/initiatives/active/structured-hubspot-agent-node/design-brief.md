# Design Brief: HubSpot Agent Configuration UI

## User Flow
1. Choose action type (update existing, create new, or update-or-create).
2. Choose context source (latest call, select meeting, or paste transcript).
3. Select the HubSpot object type to update (deal, contact, company, note, task, custom).
4. Define association & matching signals (company domain, contact email, deal name, meeting title).
5. Choose behavior when no match is found (skip update vs create new object).
6. Select properties to update and configure each property (instructions, read before write, dependencies, write mode).
7. Choose human review at the object level (auto vs review first) and optional run condition.
8. (Optional) Add related activities (note/task) for the object.
9. Save configuration and run the action in a workflow.

## Key Screens/States
- **Context Source**
  - Latest call (default), select meeting, paste transcript
  - Transcript input when pasted transcript is selected
- **Action Type**
  - Update existing, create new, update-or-create
- **Object Type + Custom Object**
  - Standard object list plus custom object name field
- **Association & Matching**
  - Match signal chips
  - No match behavior selector
  - Required fields input for create
- **Property Configuration**
  - Ordered list with reorder controls
  - Expanded/collapsed cards with read-before-write, dependencies, and write mode
- **Human Review**
  - "Just do it" vs "Review first" at the object level
- **Run Condition**
  - Optional condition to gate execution
- **Related Activities**
  - Optional note/task creation with templates
- **Post-Sync Summary**
  - Link to the HubSpot record and list of fields updated

## Interaction Patterns
- Progressive disclosure: show advanced configuration only after properties selected.
- Reorderable list with up/down actions to show execution order.
- Match signals are multi-select chips (toggle on/off).
- Sync mode selection uses descriptive cards (clear trust framing).
- Action type selection uses cards with short explanations.
- Related activity toggles expand to show lightweight templates.

## Edge Cases
- No match found:
  - **Skip**: show a concise summary of what was skipped.
  - **Create**: require minimum fields and show what will be created.
- Multiple matches:
  - Default to "Review first" and ask for confirmation.
- Low confidence:
  - Use hedged copy and require review for the object.
- Empty properties list:
  - Prompt user to select properties and explain the impact.
- Custom object:
  - Require object name before property selection.
- HubSpot link unavailable:
  - Show "Open in HubSpot" disabled state and provide fallback copy.

## AI State Requirements
- **Loading**: "Retrieving properties..." with accessible progress text.
- **Success**: Confirmation with undo option for the most recent sync.
- **Error**: Specific errors (e.g., "Couldn't connect to HubSpot") with retry.
- **Low Confidence**: Muted styling + "Needs review" badge + call-to-action.
- **Empty**: Encouraging message and clear next step.

## Accessibility Considerations
- All controls keyboard accessible.
- Dynamic status updates announce via `aria-live`.
- Color never the only indicator (icons + text labels).
- Avoid reading-level above 8th grade for critical states.
- Respect `prefers-reduced-motion`.

## Design References
- `pm-workspace-docs/initiatives/hubspot-agent-config-ui/research/human-centric-design-principles.md`
- `prototypes/src/components/HubSpotConfig/` (v1 and v2 workflow styles)
