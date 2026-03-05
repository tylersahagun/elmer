# Engineering Spec: Composio Agent Framework

**Initiative:** composio-agent-framework  
**Last Updated:** 2026-01-22  
**Tech Lead:** TBD

---

## Technical Overview

This initiative integrates Composio's agent infrastructure into AskElephant, enabling users to leverage 877+ integrations through AI agents.

### Architecture Clarity (2026-01-22)
> **Composio = Toolbox Only.** Skills, Memory, and Sub-Agents are separate layers we build.

**Phase roadmap:**
1. **Phase 1:** Universal Agent Node in existing workflow system
2. **Phase 2:** Standalone Agent Configurator with user-level authentication  
3. **Phase 3:** Skills Layer (reusable expertise prompts)
4. **Future:** Memory Layer + Sub-Agent Delegation

Composio provides integrations and tool execution. AskElephant provides orchestration, UX, skills, and business logic.

---

## Architecture Overview

### Phase 1: Universal Agent Node

```
┌─────────────────────────────────────────────────────────────┐
│                    AskElephant Workflows                     │
├─────────────────────────────────────────────────────────────┤
│  Trigger Node  →  Universal Agent Node  →  Output Node      │
│                          │                                   │
│                          ▼                                   │
│                   ┌─────────────────┐                        │
│                   │  Agent Runtime  │                        │
│                   │  - Instructions │                        │
│                   │  - Tool Access  │                        │
│                   │  - Context      │                        │
│                   └────────┬────────┘                        │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Composio Platform                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Tool Router  │  │ Connections  │  │  Triggers    │       │
│  │ (Discovery)  │  │ (OAuth/Auth) │  │  (Events)    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                              │
│  877 Integrations: Slack, HubSpot, Salesforce, Gmail...     │
└─────────────────────────────────────────────────────────────┘
```

### Phase 2: Agent Configurator

```
┌─────────────────────────────────────────────────────────────┐
│                  AskElephant Platform                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Agent Configurator UI                   │    │
│  │  - Agent Templates (workspace-level)                 │    │
│  │  - User Opt-in (user-level)                          │    │
│  │  - Activity Logs                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                            │                                 │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Agent Orchestration Service             │    │
│  │  - Template resolution                               │    │
│  │  - User connection mapping                           │    │
│  │  - Execution scheduling                              │    │
│  │  - Error handling & retries                          │    │
│  └─────────────────────────────────────────────────────┘    │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                             ▼
                      [Composio Platform]
```

### Phase 3: Skills Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  AskElephant Platform                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  Skills Registry                    │    │
│  │  - Workspace Skills (admin-configured)              │    │
│  │  - Built-in Skills (RevOps, Follow-up, etc.)       │    │
│  │  - Progressive Disclosure Loader                    │    │
│  └─────────────────────────────────────────────────────┘    │
│                            │                                 │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Agent Runtime (Updated)                │    │
│  │  - Skill injection based on task context            │    │
│  │  - Auto-discovery: sees name/description            │    │
│  │  - On-demand: loads full instructions when needed   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Progressive Disclosure Pattern:**
```
Skills Registry
├── RevOpsExpertSkill/
│   ├── manifest.json        # Name + description (always loaded)
│   │   {
│   │     "name": "RevOps Expert",
│   │     "description": "CRM best practices for HubSpot/Salesforce",
│   │     "triggers_on": ["CRM update", "deal stage change"]
│   │   }
│   └── instructions.md      # Full skill instructions (loaded on demand)
│       - 500+ lines of CRM hygiene best practices
│       - Field mapping rules
│       - Data quality guidelines
```

Agent sees skill descriptions → decides relevance → loads full context when needed.

---

## Data Model Changes

### Phase 1: Workflow Node Schema

```typescript
// New node type in workflow schema
interface UniversalAgentNode {
  type: 'universal-agent';
  id: string;
  
  config: {
    // Natural language instructions
    instructions: string;
    
    // Enabled integrations and their tools
    integrations: Array<{
      composioIntegrationId: string;
      name: string;
      enabledTools: string[]; // Tool IDs
      connectionId: string | null; // Composio connection ID
    }>;
    
    // Context variables passed from previous nodes
    contextMapping: Record<string, string>;
  };
}

// Connection stored at workspace level
interface ComposioConnection {
  id: string;
  workspaceId: string;
  composioConnectionId: string;
  integrationId: string;
  integrationName: string;
  connectedBy: string; // User ID
  connectedAt: Timestamp;
  connectionType: 'service-account' | 'personal';
  status: 'active' | 'revoked' | 'error';
}
```

### Phase 2: Agent Templates Schema

```typescript
interface AgentTemplate {
  id: string;
  workspaceId: string;
  
  // Basic info
  name: string;
  description: string;
  icon: string;
  
  // Configuration
  instructions: string;
  triggers: Array<{
    type: 'composio' | 'askelephant';
    triggerId: string;
    config: Record<string, any>;
  }>;
  integrations: Array<{
    composioIntegrationId: string;
    name: string;
    requiredTools: string[];
    optionalTools: string[];
  }>;
  
  // Publish state
  status: 'draft' | 'shared' | 'recommended' | 'required';
  requiredForTeams: string[]; // Team IDs if status === 'required'
  
  // Metadata
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  version: number;
}

interface UserAgentEnrollment {
  id: string;
  userId: string;
  workspaceId: string;
  agentTemplateId: string;
  
  // User's connections for this agent
  connections: Array<{
    integrationId: string;
    composioConnectionId: string;
    status: 'connected' | 'pending' | 'error';
  }>;
  
  // State
  enabled: boolean;
  enabledAt: Timestamp | null;
  
  // Activity
  lastRunAt: Timestamp | null;
  totalRuns: number;
  errorCount: number;
}

interface AgentActivityLog {
  id: string;
  userId: string;
  agentTemplateId: string;
  enrollmentId: string;
  
  // Execution info
  triggerId: string;
  triggerPayload: Record<string, any>;
  startedAt: Timestamp;
  completedAt: Timestamp | null;
  
  // Results
  status: 'running' | 'success' | 'partial' | 'failed';
  actions: Array<{
    integrationId: string;
    toolId: string;
    input: Record<string, any>;
    output: Record<string, any> | null;
    status: 'success' | 'failed';
    error: string | null;
  }>;
}
```

### Phase 3: Skills Schema

```typescript
interface Skill {
  id: string;
  workspaceId: string | null; // null = built-in skill
  
  // Discovery metadata (always loaded)
  name: string;
  description: string;
  triggersOn: string[]; // Keywords that indicate skill relevance
  category: 'revops' | 'sales' | 'cs' | 'general';
  
  // Configuration
  scope: 'builtin' | 'workspace' | 'user';
  enabled: boolean;
  
  // Full instructions (loaded on demand)
  instructionsPath: string; // Path to full instructions markdown
  instructionsVersion: number;
  
  // Metadata
  createdBy: string | null; // null = AskElephant-authored
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface SkillManifest {
  // Minimal metadata for discovery (always in memory)
  id: string;
  name: string;
  description: string;
  triggersOn: string[];
  scope: 'builtin' | 'workspace' | 'user';
}

interface AgentSkillAssignment {
  id: string;
  agentTemplateId: string;
  skillId: string;
  enabled: boolean;
  priority: number; // For conflict resolution
  assignedAt: Timestamp;
}

// Skill usage tracking for progressive loading decisions
interface SkillUsageLog {
  id: string;
  agentRunId: string;
  skillId: string;
  wasLoaded: boolean; // Did agent decide to load full instructions?
  loadedAt: Timestamp | null;
  usedInOutput: boolean; // Did skill influence the output?
}
```

---

## API Changes

### Phase 1: Workflow Node APIs

```typescript
// Get available integrations from Composio
GET /api/composio/integrations
Response: {
  integrations: Array<{
    id: string;
    name: string;
    icon: string;
    category: string;
    toolCount: number;
    authType: 'oauth' | 'api-key' | 'basic';
  }>;
}

// Get tools for an integration
GET /api/composio/integrations/:integrationId/tools
Response: {
  tools: Array<{
    id: string;
    name: string;
    description: string;
    category: 'read' | 'write' | 'delete';
    isDestructive: boolean;
    parameters: JSONSchema;
  }>;
}

// Initiate OAuth connection
POST /api/composio/connections/connect
Body: {
  integrationId: string;
  workspaceId: string;
  connectionType: 'service-account' | 'personal';
  redirectUrl: string;
}
Response: {
  authUrl: string;
  connectionId: string; // Pending connection
}

// Callback handler
GET /api/composio/connections/callback
// Handles OAuth callback, updates connection status

// Execute agent within workflow
POST /api/workflows/:workflowId/nodes/:nodeId/execute
Body: {
  context: Record<string, any>; // From previous nodes
}
Response: {
  success: boolean;
  actions: Array<{
    tool: string;
    result: any;
    error: string | null;
  }>;
}
```

### Phase 2: Agent Configurator APIs

```typescript
// Agent Templates (Admin)
GET    /api/agents/templates
POST   /api/agents/templates
GET    /api/agents/templates/:id
PUT    /api/agents/templates/:id
DELETE /api/agents/templates/:id

// User Enrollment
GET    /api/agents/available          // Templates user can opt into
POST   /api/agents/enroll/:templateId // Start opt-in flow
PUT    /api/agents/enrollments/:id    // Update connections
DELETE /api/agents/enrollments/:id    // Unenroll

// Activity
GET    /api/agents/enrollments/:id/activity
GET    /api/agents/activity           // All user's agent activity

// Triggers
GET    /api/composio/triggers         // Available Composio triggers
GET    /api/triggers                  // AskElephant native triggers
```

---

## Frontend Components

### Phase 1: Universal Agent Node

```
components/
  workflows/
    nodes/
      UniversalAgentNode/
        ├── index.tsx                    # Main node component
        ├── IntegrationPicker.tsx        # Search & select integrations
        ├── ToolSelector.tsx             # Per-integration tool toggles
        ├── InstructionsEditor.tsx       # NL prompt with variables
        ├── ConnectionStatus.tsx         # Show auth state per integration
        └── ServiceAccountBanner.tsx     # Recommendation message
```

### Phase 2: Agent Configurator

```
pages/
  agents/
    ├── index.tsx                        # Agent list (admin + user views)
    └── [id]/
        ├── edit.tsx                     # Agent builder (admin)
        └── activity.tsx                 # Activity log

components/
  agents/
    ├── AgentCard.tsx                    # List item for agent
    ├── AgentBuilder/
    │   ├── BasicInfoStep.tsx
    │   ├── TriggersStep.tsx
    │   ├── IntegrationsStep.tsx
    │   ├── InstructionsStep.tsx
    │   └── PublishStep.tsx
    ├── UserEnrollment/
    │   ├── EnrollModal.tsx              # Opt-in flow
    │   ├── ConnectionProgress.tsx       # Connect required integrations
    │   └── EnrolledAgentCard.tsx        # User's enabled agents
    └── ActivityLog/
        ├── ActivityTimeline.tsx
        └── ActionDetail.tsx
```

---

## Backend Services

### ComposioService

```typescript
class ComposioService {
  // Integration discovery
  async getIntegrations(category?: string): Promise<Integration[]>;
  async getTools(integrationId: string): Promise<Tool[]>;
  async searchIntegrations(query: string): Promise<Integration[]>;
  
  // Connections
  async initiateConnection(params: ConnectionParams): Promise<AuthUrl>;
  async handleCallback(code: string, state: string): Promise<Connection>;
  async getConnection(connectionId: string): Promise<Connection>;
  async revokeConnection(connectionId: string): Promise<void>;
  
  // Execution
  async executeTools(params: ExecuteParams): Promise<ExecutionResult>;
}
```

### AgentOrchestrationService (Phase 2)

```typescript
class AgentOrchestrationService {
  // Template management
  async createTemplate(template: AgentTemplateInput): Promise<AgentTemplate>;
  async updateTemplate(id: string, updates: Partial<AgentTemplate>): Promise<AgentTemplate>;
  async publishTemplate(id: string, status: PublishStatus): Promise<void>;
  
  // Enrollment
  async enrollUser(userId: string, templateId: string): Promise<Enrollment>;
  async getEnrollmentStatus(enrollmentId: string): Promise<EnrollmentStatus>;
  async enableAgent(enrollmentId: string): Promise<void>;
  async disableAgent(enrollmentId: string): Promise<void>;
  
  // Execution
  async handleTrigger(trigger: TriggerEvent): Promise<void>;
  async executeAgent(enrollment: Enrollment, context: any): Promise<ActivityLog>;
  
  // Monitoring
  async getActivity(enrollmentId: string, options?: ActivityOptions): Promise<ActivityLog[]>;
}
```

---

## Dependencies

### External
| Dependency | Purpose | Risk |
|------------|---------|------|
| Composio SDK | Integration infrastructure | Low (contractual) |
| OpenAI/Claude | Agent reasoning | Low (existing) |

### Internal
| Dependency | Purpose | Status |
|------------|---------|--------|
| Workflow Engine | Phase 1 node execution | ✅ Exists |
| Auth Service | User/workspace identity | ✅ Exists |
| Privacy Determination | Check before trigger | 🟡 In Progress |

---

## Migration Strategy

### Phase 1
- No migration needed
- New node type added to workflow builder
- Existing workflows unaffected

### Phase 2
- No breaking changes
- Agent Configurator is additive
- Consider: Offer migration path for simple workflows → agents

---

## Testing Strategy

### Unit Tests
- ComposioService methods
- Tool selection logic
- Connection state management

### Integration Tests
- OAuth flow end-to-end (mock Composio)
- Agent execution with multiple tools
- Error handling and retry logic

### E2E Tests
- Create workflow with Universal Agent Node
- Connect integration via OAuth
- Execute and verify action in target system (sandbox)

### Load Tests
- Concurrent agent executions
- Large tool sets (100+ tools per integration)
- Rate limit behavior

---

## Monitoring & Observability

### Metrics
| Metric | Purpose |
|--------|---------|
| `agent.executions.total` | Total agent runs |
| `agent.executions.success_rate` | Reliability tracking |
| `agent.executions.duration_p99` | Performance |
| `composio.api.latency_p99` | External dependency health |
| `composio.api.error_rate` | External dependency reliability |

### Alerts
| Alert | Threshold | Action |
|-------|-----------|--------|
| High error rate | >10% in 5min | Page on-call |
| Composio API down | >1min unavailable | Page on-call + status page |
| Rate limit hit | Any | Log, notify user |

### Logging
- Log all agent executions with trace IDs
- Log tool inputs/outputs (redact sensitive data)
- Log connection state changes

---

## Security Considerations

### OAuth Token Storage
- Encrypted at rest
- Composio handles token refresh
- We store connection IDs, not raw tokens

### Permission Scoping
- Tools explicitly enabled per integration
- Destructive tools require confirmation (Phase 2)
- Rate limits prevent runaway agents

### Audit Trail
- All agent actions logged
- Connection events logged
- Admin actions on templates logged

### Privacy
- Check Privacy Determination before trigger execution
- Don't pass private meeting content to external integrations without consent

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Composio API rate limits | Implement queuing, backoff |
| Long-running agent execution | Timeout + partial result handling |
| Credential exposure | Never log tokens, use Composio's storage |
| Agent infinite loop | Action budget per execution |
| Integration breaks | Graceful degradation, user notification |

---

## Open Technical Questions

1. **How do we handle Composio's reinforcement learning?**
   - Is it per-workspace or global?
   - Privacy implications of learning from our users' actions

2. **Trigger deduplication:**
   - If multiple agents subscribe to same trigger, execute all or dedupe?

3. **Connection sharing:**
   - Can workspace connection be used by user agents?
   - Or must users always connect individually?

4. **Offline/async execution:**
   - What if user disconnects mid-execution?
   - How long can an agent run?

---

## Timeline Estimate

### Phase 1: Universal Agent Node
| Task | Estimate |
|------|----------|
| Composio SDK integration | 3 days |
| Connection management | 3 days |
| Workflow node UI | 5 days |
| Execution engine | 5 days |
| Testing & QA | 3 days |
| **Total** | **~4 weeks** |

### Phase 2: Agent Configurator
| Task | Estimate |
|------|----------|
| Data model & migrations | 3 days |
| Agent builder UI | 8 days |
| User enrollment flow | 5 days |
| Orchestration service | 8 days |
| Activity logging | 3 days |
| Testing & QA | 5 days |
| **Total** | **~6-8 weeks** |
