# Prototype Notes: HubSpot Agent Configuration UI

## Overview

This prototype replaces the prompt-based HubSpot agent configuration with a structured property-based interface. Built in `prototypes/src/components/HubSpotConfig/`.

**Status:** ✅ v1 Standalone complete | ✅ v2 Workflow-Integrated complete

## Prototype Versions

### 🔹 v1-Standalone

The original standalone configuration UI panel. This version shows the core configuration components in isolation, useful for:

- Exploring the UI patterns
- Testing configuration state management
- Understanding the component architecture

**Location:** `prototypes/src/components/HubSpotConfig/`

### 🔸 v2-Workflow (NEW)

The workflow-integrated version that shows how the configuration would appear inside the actual workflow builder. This version:

- Wraps configuration in the `WorkflowNodeSheet` panel pattern
- Uses `LabeledRenderer` for consistent form field styling (matches `form-renderers/`)
- Includes Configuration/Outputs tabs
- Shows integration with workflow node header styling
- Demonstrates the full workflow builder experience

**Location:** `prototypes/src/components/HubSpotConfig/v2-workflow/`

## Components Built

### v1 Standalone Components

| Component | Status | Location | Description |
| --- | --- | --- | --- |
| `HubSpotAgentConfig` | ✅ Complete | `HubSpotAgentConfig.tsx` | Main container with object type selector and property list |
| `PropertySelector` | ✅ Complete | `PropertySelector.tsx` | Dropdown for selecting HubSpot properties to update |
| `FieldConfigCard` | ✅ Complete | `FieldConfigCard.tsx` | Per-property config: prompt, read-before-write, dependencies |
| `types.ts` | ✅ Complete | `types.ts` | TypeScript interfaces and mock data |
| Storybook stories | ✅ Complete | `HubSpotAgentConfig.stories.tsx` | Interactive demos for all states |

### v2 Workflow-Integrated Components

| Component | Status | Location | Description |
| --- | --- | --- | --- |
| `WorkflowNodeSheetMock` | ✅ Complete | `v2-workflow/WorkflowNodeSheetMock.tsx` | Replicates the WorkflowNodeSheet sliding panel |
| `HubSpotAgentNodeConfig` | ✅ Complete | `v2-workflow/HubSpotAgentNodeConfig.tsx` | Config using LabeledRenderer pattern |
| `LabeledRenderer` | ✅ Complete | `v2-workflow/LabeledRenderer.tsx` | Matches form-renderers/labeled-renderer.tsx |
| Storybook stories | ✅ Complete | `v2-workflow/HubSpotAgentWorkflow.stories.tsx` | Workflow integration demos |

### Shared UI Components

| Component     | Location              | Description                |
| ------------- | --------------------- | -------------------------- |
| `Button`      | `ui/button.tsx`       | Standard button component  |
| `Badge`       | `ui/badge.tsx`        | Status and label badges    |
| `Switch`      | `ui/switch.tsx`       | Toggle switch for booleans |
| `Select`      | `ui/select.tsx`       | Single-select dropdown     |
| `MultiSelect` | `ui/multi-select.tsx` | Multi-select dropdown      |
| `Textarea`    | `ui/textarea.tsx`     | Text input area            |
| `Tabs`        | `ui/tabs.tsx`         | Tab navigation             |
| `Collapsible` | `ui/collapsible.tsx`  | Expand/collapse sections   |
| `Tooltip`     | `ui/tooltip.tsx`      | Info tooltips              |

## Running the Prototype

```bash
cd prototypes
npm install
npm run storybook -- --port 6007
```

Then open http://localhost:6007 and navigate to:

### v1 Standalone Stories

- `Prototypes/HubSpotConfig/v1-Standalone/HubSpotAgentConfig` - Main container
- `Prototypes/HubSpotConfig/v1-Standalone/PropertySelector` - Property selector alone
- `Prototypes/HubSpotConfig/v1-Standalone/FieldConfigCard` - Individual card configuration

### v2 Workflow-Integrated Stories

- `Prototypes/HubSpotConfig/v2-Workflow` - Full workflow builder integration demos

## Stories Available

### v1 Standalone Stories

| Story                       | Description                                                           |
| --------------------------- | --------------------------------------------------------------------- |
| `Empty`                     | Initial empty state, no properties selected                           |
| `WithSelectedProperties`    | 3 properties configured with dependencies                             |
| `FullDealScorecard`         | Complete deal scoring config (6 properties with complex dependencies) |
| `Loading`                   | Shows loading state                                                   |
| `ContactObjectType`         | Demo with contact properties                                          |
| `PropertySelectorEmpty`     | Just the property selector component                                  |
| `FieldConfigCardConfigured` | Single card with full configuration                                   |
| `FieldConfigCardLocalOnly`  | Card with syncToHubSpot disabled                                      |

### v2 Workflow-Integrated Stories

| Story                     | Description                                                         |
| ------------------------- | ------------------------------------------------------------------- |
| `EmptyConfiguration`      | New HubSpot Agent node with no properties (shows "New" badge)       |
| `ConfiguredDealScorecard` | Deal scorecard agent inside workflow sheet (shows "Modified" badge) |
| `ContactUpdater`          | Contact object configuration in workflow context                    |
| `WithConditionalTrigger`  | Shows conditional trigger configuration                             |
| `SideBySideWithCanvas`    | **FULL WORKFLOW MOCKUP** with node canvas + config panel            |

---

## Integration Notes

### Props the Real WorkflowNode Passes to Config

Based on analysis of `web/src/components/workflows/workflow-node-sheet.tsx`:

```typescript
interface WorkflowNodeSheetProps {
  data: WorkflowNode; // Node data including operation and config
  nodeId: string; // Unique node identifier
  open: boolean; // Sheet open state
  setOpen: (open: boolean) => void;
  primaryColor?: string; // Node accent color
  backgroundColor?: string; // Node background color
  onAfterConfigUpdate?: (config: Record<string, unknown>, sourceNodeId: string) => void;
}
```

The config is passed as `props.data.config` and updated via:

```typescript
onAfterConfigUpdate(newConfig, nodeId);
```

### State Management Approach

**Current Prototype:** Local React state via `useState`

**Real Implementation Options:**

1. **Local state + onConfigChange callback** (Recommended for MVP)
   - Keep config state local in component
   - Call `onAfterConfigUpdate` on blur/save
   - Matches current JsonForms pattern in workflow-node-sheet.tsx

2. **Workflow Context via Apollo**
   - Use `WorkflowStateService.dispatchStateActions()` for batched updates
   - More complex but enables real-time sync across nodes

**Recommendation:** Start with option 1. The current workflow sheet already debounces config updates on change, so our component can follow the same pattern:

```typescript
// From workflow-node-sheet.tsx pattern
const handleConfigChange = useCallback(
  debounce((newConfig: Record<string, unknown>) => {
    onAfterConfigUpdate?.(newConfig, nodeId);
  }, 300),
  [onAfterConfigUpdate, nodeId]
);
```

### What Changes in the Real Node to Integrate

1. **Update `hubspotAgentAction` inputSchema** (`functions/src/contexts/integrations/hubspot/actions.ts`)

```typescript
// Current schema uses simple prompt field
inputSchema: z.object({
  relatedObjectType: z.enum([...]).optional(),
  prompt: z.string().optional(),
  // ... other fields
})

// New schema needs structured properties
inputSchema: z.object({
  objectType: z.enum(['deal', 'contact', 'company', 'meeting']),
  properties: z.array(z.object({
    propertyName: z.string(),
    instruction: z.string(),
    readBeforeWrite: z.boolean(),
    dependencies: z.array(z.string()),
    writeMode: z.enum(['overwrite', 'append', 'append_if_new']),
    syncToHubSpot: z.boolean(),
  })),
  updateTrigger: z.enum(['after_call', 'daily', 'on_stage_change']).optional(),
})
```

2. **Create custom form renderer** (`web/src/components/workflows/form-renderers/`)

The workflow sheet uses JsonForms with custom renderers. We need:

```
web/src/components/workflows/form-renderers/
  └── hubspot-agent-config-renderer.tsx   # New file
```

Register in `FormRenderers` to render our component when the schema matches.

3. **Update agent execution logic** (`functions/src/contexts/llm/agents/agent-nodes/feature-agent-nodes/hubspot.v2.ts`)

The agent needs to:

- Parse the structured `properties` config
- Execute in dependency order (topological sort)
- Respect `readBeforeWrite` by fetching current values first
- Apply `writeMode` when constructing updates

4. **Fetch HubSpot properties dynamically**

Need GraphQL query or hook to fetch properties from connected HubSpot account:

```typescript
// Similar to existing useCrmProperties hook
const { properties, loading } = useCrmProperties(objectType);
```

Already exists at `web/src/hooks/use-crm-properties.ts` - reuse this!

---

## Dependencies/Patterns Needed in Main Repo

### Already Available

- ✅ `cn()` utility - `web/src/lib/utils.ts`
- ✅ Tailwind CSS classes match
- ✅ `useCrmProperties` hook
- ✅ shadcn/ui components (just need to map our custom elements)

### Need to Add

- `lucide-react` icons used - already in main repo ✅
- Component structure is compatible

### Pattern Adjustments

| Prototype             | Main Repo Equivalent                           |
| --------------------- | ---------------------------------------------- |
| Custom toggle buttons | Use `Switch` from `@/components/ui/switch`     |
| Custom dropdowns      | Use `Select` from `@/components/ui/select`     |
| Custom text input     | Use `Textarea` from `@/components/ui/textarea` |
| Badge-style tags      | Use `Badge` from `@/components/ui/badge`       |

---

## Testing Checklist

### Functionality Verified in Storybook

- [x] Object type switching clears properties (v1) / shows dropdown (v2)
- [x] Property selection adds/removes from list
- [x] Search filters property dropdown
- [x] Read-before-write toggle works
- [x] Dependencies can be added/removed
- [x] Write mode radio selection works
- [x] Sync toggle works
- [x] Cards expand/collapse correctly
- [x] Status badges show when collapsed
- [x] Expand All / Collapse All toggle (v2)
- [x] Properties initialize expanded by default (both versions)

### Before Migration

- [ ] Unit tests for config transformation
- [ ] Test with real HubSpot property data
- [ ] Verify dependency cycle detection
- [ ] Test with >20 properties (performance)
- [ ] A11y audit (keyboard nav, screen readers)

---

## Known Limitations

1. **No dependency cycle detection** - User can create circular dependencies. Need validation before save.

2. **No drag-to-reorder** - Properties are in selection order. May want drag handles.

3. **No preview mode** - PRD mentions "Preview Output" but not implemented yet.

4. **No templates** - Quick-start templates are PRD "Should Have" but not in prototype.

---

## Next Steps

1. [ ] Add dependency visualization (DAG graph)
2. [ ] Add template selector modal
3. [ ] Add circular dependency validation
4. [ ] Create JsonForms renderer wrapper
5. [ ] Write unit tests
6. [ ] Migration guide for existing configs

---

## v2 Workflow Integration Patterns

The v2 prototype demonstrates how to integrate with the workflow builder. Key patterns matched:

### Form Field Pattern (LabeledRenderer)

```tsx
// From form-renderers/labeled-renderer.tsx
<LabeledRenderer label="Field Label" description="Help text shown in tooltip" errors={validationErrors}>
  <InputComponent />
</LabeledRenderer>
```

### WorkflowNodeSheet Structure

```
┌─────────────────────────────────┐
│ [Icon] Node Title    [x]        │  ← Header with edit capability
│ [New/Modified badge]            │
├─────────────────────────────────┤
│ Configuration | Outputs         │  ← Tabs
├─────────────────────────────────┤
│                                 │
│  [LabeledRenderer fields]       │  ← Configuration tab content
│                                 │
├─────────────────────────────────┤
│       [Save Configuration]      │  ← Footer with save button
└─────────────────────────────────┘
```

### Key v2 Differences from v1

| Aspect       | v1 Standalone           | v2 Workflow                         |
| ------------ | ----------------------- | ----------------------------------- |
| Container    | Card with custom header | WorkflowNodeSheet panel             |
| Field layout | Custom spacing          | LabeledRenderer (pb-6/pb-12)        |
| Toggles      | Custom switch           | Form-renderer Switch pattern        |
| Dropdowns    | Custom popover          | Form-renderer MultiSelect           |
| Styling      | Standalone colors       | Integration colors (HubSpot orange) |
| Context      | Isolated                | Workflow canvas visible             |

### Recommended Migration Path

1. **Phase 1:** Use v1 components directly (faster to ship)
   - Wrap in WorkflowNodeSheet
   - Use existing config state management

2. **Phase 2:** Migrate to v2 patterns (better consistency)
   - Replace v1 components with v2 equivalents
   - Use LabeledRenderer throughout
   - Match form-renderer styling exactly

3. **Phase 3:** Create JsonForms renderer
   - Integrate with existing workflow system
   - Auto-render based on inputSchema

---

## Screenshots

Run Storybook to see interactive demos:

### v1 Key Stories

- `v1-Standalone/FullDealScorecard` - Shows complex real-world configuration
- `v1-Standalone/FieldConfigCardConfigured` - Shows all field options

### v2 Key Stories

- `v2-Workflow/SideBySideWithCanvas` - **Full workflow builder experience**
- `v2-Workflow/ConfiguredDealScorecard` - Workflow panel with configuration

---

## Feature Summary

### ✅ Completed Features

1. **Object Type Selection** - Both v1 (button group) and v2 (dropdown) support Deal, Contact, Company, Meeting
2. **Property Selection** - Multi-select with search, grouped by property type, shows type badges
3. **Per-Property Configuration** - Instructions, read-before-write, dependencies, write mode, sync toggle
4. **Expand/Collapse** - Individual property cards expandable, v2 includes "Expand All / Collapse All" button
5. **Properties Expanded by Default** - All properties show their full configuration initially
6. **Update Trigger** - After call, daily batch, or on stage change options
7. **Conditional Trigger** - Optional condition text for when to run (v2)
8. **Workflow Integration Demo** - v2 shows full workflow canvas + config panel side-by-side

_Last updated: 2026-01-06_
