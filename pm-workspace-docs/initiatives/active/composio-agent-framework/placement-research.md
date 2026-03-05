# Placement Research: Composio Agent Framework

**Initiative:** composio-agent-framework  
**Researched:** 2026-01-22  
**Status:** Complete

---

## Feature Classification

| Aspect | Phase 1: Universal Agent Node | Phase 2: Agent Configurator |
|--------|------------------------------|----------------------------|
| **Type** | Workflow node extension | Component family + pages |
| **Scope** | Integrated (extends workflows) | Cross-cutting (new domain) |
| **Domain** | `workflows` | New: `agents` |
| **Complexity** | Medium (extends existing patterns) | High (new patterns) |

---

## Phase 1: Universal Agent Node

### Recommended Location

**Primary:** `components/workflows/` (extend existing workflow node system)

| Component | Path | Rationale |
|-----------|------|-----------|
| Node component | `components/workflows/nodes/UniversalAgentNode.tsx` | Follows workflow node pattern |
| Node config forms | `components/workflows/form-renderers/universal-agent/` | Existing form renderer pattern |
| Integration picker | `components/workflows/dialogs/integration-picker-dialog.tsx` | Reusable dialog pattern |

### File Structure

```
elephant-ai/web/src/components/workflows/
├── nodes/                                    # NEW folder for complex nodes
│   └── UniversalAgentNode/
│       ├── UniversalAgentNode.tsx            # Main node component
│       ├── UniversalAgentNode.stories.tsx    # Storybook
│       ├── IntegrationPicker.tsx             # Integration search/select
│       ├── ToolSelector.tsx                  # Per-integration tool toggles
│       ├── ConnectionStatus.tsx              # Auth state display
│       └── index.ts
├── form-renderers/
│   └── universal-agent-config.tsx            # Node config panel
├── dialogs/
│   └── integration-picker-dialog.tsx         # Modal for integration discovery
└── ...existing files...
```

### Integration Points

**Workflow Node System:**
- Extend `WorkflowNodeType` in `hooks/workflow/workflowHookUtils.ts`
- Add to `RFNodeTypes` mapping for React Flow
- Register new operation type in GraphQL schema

**Existing Patterns to Follow:**

| Pattern | Location | What to Reuse |
|---------|----------|---------------|
| Node card UI | `workflow-nodes.tsx` | Card styling, handles, badges |
| Form rendering | `form-renderers/*.tsx` | Input patterns, validation |
| Tool selection | `ai-tool-selector.tsx` | Multi-select with enable/disable |
| Integration icons | `integrations/icons.tsx` | Integration branding |

**Data Dependencies:**
- `useWorkflowState` hook for node state
- `useNodeSchema` hook for config forms
- New: `useComposioIntegrations` hook for Composio API

---

## Phase 2: Agent Configurator

### Recommended Location

**Primary:** New top-level domain: `components/agents/` + `routes/.../agents/`

### Alternatives Considered

| Option | Location | Pros | Cons | Decision |
|--------|----------|------|------|----------|
| **A: New domain** | `components/agents/` | Clean separation, scalable, clear ownership | New pattern | ✅ **Recommended** |
| **B: Extend ai-agents** | `components/ai-agents/` | Existing folder | Too small, conflates chat tools with automation agents | ❌ Rejected |
| **C: Under automations** | `components/automations/agents/` | Groups with workflows | "Automations" namespace overloaded | ❌ Rejected |

**Rationale:** Agent Configurator is a significant new feature that warrants its own domain. It's not just a workflow extension—it's a new paradigm for automation. Clean separation enables:
- Independent iteration
- Clear engineering ownership
- Future expansion (agent marketplace, etc.)

### File Structure

```
elephant-ai/web/src/
├── components/
│   └── agents/                               # NEW domain
│       ├── AgentCard.tsx                     # List item card
│       ├── AgentCard.stories.tsx
│       ├── AgentBuilder/                     # Template builder
│       │   ├── AgentBuilder.tsx              # Main builder component
│       │   ├── AgentBuilder.stories.tsx
│       │   ├── BasicInfoStep.tsx
│       │   ├── TriggersStep.tsx
│       │   ├── IntegrationsStep.tsx
│       │   ├── InstructionsStep.tsx
│       │   ├── PublishStep.tsx
│       │   └── index.ts
│       ├── UserEnrollment/                   # Opt-in experience
│       │   ├── EnrollModal.tsx
│       │   ├── ConnectionProgress.tsx
│       │   └── index.ts
│       ├── AgentActivity/                    # Activity logs
│       │   ├── ActivityTimeline.tsx
│       │   ├── ActionDetail.tsx
│       │   └── index.ts
│       ├── hooks/
│       │   ├── useAgentTemplates.ts
│       │   ├── useAgentEnrollment.ts
│       │   └── useComposioConnections.ts
│       ├── types.ts
│       └── index.ts
├── routes/
│   └── workspaces/
│       └── $workspaceId/
│           └── agents/                       # NEW route
│               ├── index.tsx                 # Agent list (admin + user views)
│               └── $agentId/
│                   ├── index.tsx             # Agent detail/edit
│                   └── activity.tsx          # Activity log
└── hooks/
    └── agents/                               # NEW hooks folder
        └── useAgentActivity.ts
```

### Navigation Entry Points

**Sidebar Navigation (nav-main.tsx):**

```typescript
// Add after "Automations" or "Workflows" item
{
  title: 'Agents',
  url: Routes.agents.list(workspaceId),
  icon: BotIcon, // or SparklesIcon
  beta: true,
  items: [],
}
```

**Feature flag:** `composio-agents-enabled` or `agents-page-enabled`

**Routes.ts addition:**

```typescript
agents: {
  list: (workspaceId: string) => `${baseRoute(workspaceId)}/agents`,
  detail: (workspaceId: string, agentId: string) => `${baseRoute(workspaceId)}/agents/${agentId}`,
  activity: (workspaceId: string, agentId: string) => `${baseRoute(workspaceId)}/agents/${agentId}/activity`,
},
```

### Embedding Contexts

| Context | Component | How It Embeds |
|---------|-----------|---------------|
| Agent list page | `routes/agents/index.tsx` | Full page |
| Agent builder | `AgentBuilder/AgentBuilder.tsx` | Full page or sheet |
| User opt-in | `EnrollModal.tsx` | Modal over agent card |
| Workflow builder | `workflow-actions-dialog.tsx` | Could link to agents |
| Settings/Integrations | `settings/integrations.tsx` | Connection management |

### Data Dependencies

**Hooks needed:**
- `useAgentTemplates` - CRUD for agent templates
- `useAgentEnrollment` - User enrollment state
- `useComposioConnections` - Composio OAuth flows
- `useComposioIntegrations` - Available integrations
- `useComposioTriggers` - Available triggers

**Context providers:**
- Potentially `AgentBuilderProvider` for multi-step builder state

**API routes (backend):**
- `GET/POST /api/agents/templates`
- `GET/PUT/DELETE /api/agents/templates/:id`
- `POST /api/agents/enroll/:templateId`
- `GET /api/agents/enrollments`
- `GET /api/agents/activity`
- `GET/POST /api/composio/connections`

---

## Existing Patterns to Follow

### Similar Components

| Component | Path | Pattern to Reuse |
|-----------|------|------------------|
| Workflow cards | `workflows/workflow-cards.tsx` | Card layout, status badges |
| Knowledge base list | `knowledge-base/` | List + detail pattern |
| Settings tabs | `settings/components/*.tsx` | Tab-based configuration |
| Chat tool cards | `chat/tools/*.tsx` | Integration result display |
| Enabled tools selector | `enabled-tools-selector.tsx` | Tool enable/disable pattern |

### Reusable UI Primitives

| Primitive | Location | Use For |
|-----------|----------|---------|
| Card | `@/components/ui/card` | Agent cards, step cards |
| Dialog/Sheet | `@/components/ui/dialog`, `sheet` | Modals, config panels |
| Tabs | `@/components/ui/tabs` | Builder steps, views |
| Select/Combobox | `@/components/ui/select` | Integration picker |
| Badge | `@/components/ui/badge` | Status, beta flags |
| Button | `@/components/ui/button` | Actions |
| Form | `@/components/ui/form` | Config forms |
| Textarea | `@/components/ui/textarea` | Instructions editor |

### Reusable Hooks

| Hook | Location | Use For |
|------|----------|---------|
| `useViewer` | `hooks/useViewer.ts` | Current user/workspace |
| `useFeatureFlagEnabled` | posthog | Feature gating |
| `useCurrentWorkspace` | `hooks/useCurrentWorkspace.ts` | Workspace context |

---

## Shared Components (Both Phases)

Some components will be used by both Phase 1 and Phase 2:

| Component | Location | Used By |
|-----------|----------|---------|
| Integration picker | `components/agents/shared/IntegrationPicker.tsx` | Both |
| Tool selector | `components/agents/shared/ToolSelector.tsx` | Both |
| Connection manager | `components/agents/shared/ConnectionManager.tsx` | Both |
| Composio hooks | `hooks/agents/useComposio*.ts` | Both |

**Recommendation:** Build these in the `agents/shared/` folder first, then import into workflow node.

---

## Pre-Flight Checklist

### Before Building Phase 1 (Universal Agent Node)

- [x] Confirmed node doesn't already exist
- [x] Identified React Flow node patterns
- [x] Mapped to existing workflow form renderer pattern
- [ ] GraphQL schema for new node type (backend)
- [ ] Composio API integration (backend)

### Before Building Phase 2 (Agent Configurator)

- [x] Identified navigation integration approach
- [x] Mapped route structure
- [x] Listed similar components for pattern reference
- [ ] API design for agent templates (backend)
- [ ] Enrollment/connection flow design (backend)

---

## Migration Path

### Prototype to Production

1. **Prototype phase:** Build in `components/prototypes/ComposioAgentFramework/`
2. **Validation:** Test with synthetic users + real beta users
3. **Promotion:**
   - Phase 1: Move node to `components/workflows/nodes/`
   - Phase 2: Create `components/agents/` and `routes/.../agents/`
4. **Cleanup:** Remove from prototypes folder

### From Workflows to Agents

Users with existing workflows using Universal Agent Node:
- Workflows continue to work
- Agent Configurator offers migration: "Convert to Agent Template"
- No breaking changes

---

## Summary

| Phase | Primary Location | Navigation | Route |
|-------|------------------|------------|-------|
| **Phase 1** | `components/workflows/nodes/UniversalAgentNode/` | Existing workflows | N/A (node in builder) |
| **Phase 2** | `components/agents/` | New "Agents" nav item | `/workspaces/:id/agents` |

**Key Principle:** Phase 1 extends existing patterns; Phase 2 establishes new patterns. Keep them cleanly separated but share underlying Composio integration components.

---

## Next Steps

1. **Run `/proto composio-agent-framework`** — Start with Phase 1 Universal Agent Node UI
2. **Create shared hooks** — `useComposioIntegrations`, `useComposioConnections`
3. **Review with engineering** — Validate backend API approach before frontend build
4. **After validation** — Promote from prototypes to recommended locations
