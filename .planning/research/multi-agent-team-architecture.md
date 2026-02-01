# Multi-Agent Team Architecture Analysis

> Converting pm-workspace from single-player to a multi-agent team experience similar to 8090.ai

## Executive Summary

Your current pm-workspace is a **single-player orchestration system** where one AI agent (powered by Anthropic) executes tasks in a job queue. To create a multi-agent team experience like 8090.ai, you would need to evolve into a **configurable multi-agent system** where different specialized agents can be created, configured, and orchestrated to work together on PM workflows.

---

## Current Architecture Analysis

### What You Have Today

```
┌─────────────────────────────────────────────────────────────┐
│                    Single-Player Model                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐    ┌──────────────┐    ┌─────────────────┐   │
│  │ Job Queue │ -> │ AgentExecutor │ -> │ Claude (Sonnet) │   │
│  │ (jobs)    │    │ (singleton)   │    │ via Anthropic   │   │
│  └──────────┘    └──────────────┘    └─────────────────┘   │
│        │                                      │              │
│        │         ┌──────────────┐             │              │
│        └─────────│ Stage Recipes │─────────────┘              │
│                  │ (per-stage)   │                           │
│                  └──────────────┘                            │
│                                                              │
│  One AI model, one execution path, one personality          │
└─────────────────────────────────────────────────────────────┘
```

### Current Strengths

1. **Solid job/run tracking** - `stageRuns`, `runLogs`, `artifacts` tables
2. **Workspace isolation** - Multi-tenant at workspace level
3. **Skill system foundation** - `skills` and `stageRecipes` tables
4. **Agent definitions** - `agentDefinitions` table can store agent configs
5. **Tool system** - Extensible tools for agents to use
6. **Human-in-the-loop** - `pendingQuestions` table for interactive agents

### Current Limitations for Multi-Agent

1. **Single executor** - `AgentExecutor` is a singleton using one model/prompt
2. **No agent identity** - Agents don't have persistent personalities/memory
3. **No inter-agent communication** - Agents can't delegate to or collaborate with other agents
4. **No agent configuration UI** - Can't create/customize agents in the UI
5. **No agent marketplace/templates** - Can't share or discover agent configurations
6. **Skills ≠ Agents** - Skills are prompts, not autonomous entities

---

## Target Architecture: Multi-Agent Team Model

### What 8090.ai-style Systems Look Like

Based on common patterns in multi-agent orchestration platforms:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Multi-Agent Team Model                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     Agent Orchestrator                           │    │
│  │  - Routes tasks to appropriate agents                            │    │
│  │  - Manages agent communication                                   │    │
│  │  - Handles consensus/voting                                      │    │
│  │  - Provides shared context/memory                                │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│              │                    │                     │                │
│              ▼                    ▼                     ▼                │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐        │
│  │ Research Agent   │ │ PRD Writer Agent │ │ Prototype Agent  │        │
│  │ ─────────────    │ │ ────────────────  │ │ ───────────────  │        │
│  │ • Persona: Maya  │ │ • Persona: Alex  │ │ • Persona: Raj   │        │
│  │ • Model: Claude  │ │ • Model: GPT-4   │ │ • Model: Claude  │        │
│  │ • Tools: search  │ │ • Tools: docs    │ │ • Tools: code    │        │
│  │ • Memory: vector │ │ • Memory: vector │ │ • Memory: vector │        │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘        │
│              │                    │                     │                │
│              └────────────────────┼─────────────────────┘                │
│                                   ▼                                      │
│                        ┌──────────────────┐                             │
│                        │ Shared Memory    │                             │
│                        │ ──────────────── │                             │
│                        │ • Workspace ctx  │                             │
│                        │ • Conversation   │                             │
│                        │ • Artifacts      │                             │
│                        │ • Decisions      │                             │
│                        └──────────────────┘                             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Concepts from 8090.ai-Style Systems

| Concept | Description | Your Equivalent |
|---------|-------------|-----------------|
| **Agent** | Autonomous entity with personality, tools, memory | `agentDefinitions` (partial) |
| **Team** | Group of agents that can collaborate | None |
| **Workflow** | Multi-step process involving multiple agents | `stageRecipes` |
| **Memory** | Persistent context across conversations | `memoryEntries` (partial) |
| **Tools** | Actions agents can take | `tools.ts` |
| **Handoff** | Passing work between agents | None |
| **Consensus** | Multiple agents voting on decisions | `juryEvaluations` (different purpose) |

---

## Required Architectural Changes

### 1. Agent Entity Layer (New)

Create a first-class `Agent` entity distinct from skills/definitions:

```typescript
// New schema additions
export const agents = pgTable("agents", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").references(() => workspaces.id),
  
  // Identity
  name: text("name").notNull(),
  role: text("role").notNull(), // "researcher", "writer", "reviewer", etc.
  persona: text("persona"), // Personality description
  avatar: text("avatar"), // Avatar URL or emoji
  
  // Configuration
  model: text("model").default("claude-sonnet-4-20250514"),
  provider: text("provider").$type<"anthropic" | "openai" | "custom">(),
  temperature: real("temperature").default(0.7),
  maxTokens: integer("max_tokens").default(4096),
  
  // System prompt components
  systemPromptTemplate: text("system_prompt_template"),
  contextInstructions: text("context_instructions"),
  outputFormat: text("output_format"),
  
  // Capabilities
  enabledTools: jsonb("enabled_tools").$type<string[]>(),
  canDelegateToAgents: jsonb("can_delegate_to").$type<string[]>(),
  
  // Memory configuration
  memoryType: text("memory_type").$type<"none" | "conversation" | "semantic">(),
  memoryWindowSize: integer("memory_window_size").default(10),
  
  // State
  isActive: boolean("is_active").default(true),
  lastActiveAt: timestamp("last_active_at"),
  
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Agent-to-Agent relationships (teams)
export const agentTeams = pgTable("agent_teams", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").references(() => workspaces.id),
  name: text("name").notNull(),
  description: text("description"),
  
  // Team configuration
  orchestratorAgentId: text("orchestrator_agent_id").references(() => agents.id),
  consensusMode: text("consensus_mode").$type<"majority" | "unanimous" | "orchestrator">(),
  
  createdAt: timestamp("created_at").notNull(),
});

export const agentTeamMembers = pgTable("agent_team_members", {
  id: text("id").primaryKey(),
  teamId: text("team_id").references(() => agentTeams.id),
  agentId: text("agent_id").references(() => agents.id),
  role: text("role"), // Role within the team
  priority: integer("priority").default(0),
});
```

### 2. Agent Memory System (Enhanced)

Upgrade from basic `memoryEntries` to semantic vector memory per agent:

```typescript
export const agentMemories = pgTable("agent_memories", {
  id: text("id").primaryKey(),
  agentId: text("agent_id").references(() => agents.id),
  workspaceId: text("workspace_id").references(() => workspaces.id),
  
  // Memory content
  type: text("type").$type<"fact" | "decision" | "preference" | "context">(),
  content: text("content").notNull(),
  summary: text("summary"), // AI-generated summary
  
  // Vector embedding for semantic search
  embedding: vector("embedding", { dimensions: 1536 }),
  
  // Provenance
  sourceConversationId: text("source_conversation_id"),
  sourceProjectId: text("source_project_id").references(() => projects.id),
  
  // Lifecycle
  importance: real("importance").default(0.5),
  accessCount: integer("access_count").default(0),
  lastAccessedAt: timestamp("last_accessed_at"),
  expiresAt: timestamp("expires_at"),
  
  createdAt: timestamp("created_at").notNull(),
});
```

### 3. Agent Conversation/Thread System

Track multi-turn conversations with agents:

```typescript
export const agentConversations = pgTable("agent_conversations", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").references(() => workspaces.id),
  projectId: text("project_id").references(() => projects.id),
  
  // Participants
  initiatedByUserId: text("initiated_by_user_id").references(() => users.id),
  involvedAgents: jsonb("involved_agents").$type<string[]>(),
  
  // Context
  title: text("title"),
  purpose: text("purpose"),
  
  // State
  status: text("status").$type<"active" | "completed" | "archived">(),
  
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const agentMessages = pgTable("agent_messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id").references(() => agentConversations.id),
  
  // Sender
  senderType: text("sender_type").$type<"user" | "agent" | "system">(),
  senderAgentId: text("sender_agent_id").references(() => agents.id),
  senderUserId: text("sender_user_id").references(() => users.id),
  
  // Content
  content: text("content").notNull(),
  contentType: text("content_type").$type<"text" | "tool_call" | "tool_result" | "handoff">(),
  
  // Metadata
  metadata: jsonb("metadata").$type<{
    toolName?: string;
    toolInput?: Record<string, unknown>;
    toolOutput?: unknown;
    handoffToAgentId?: string;
    reasoning?: string;
    tokensUsed?: number;
  }>(),
  
  createdAt: timestamp("created_at").notNull(),
});
```

### 4. Multi-Agent Executor

Replace the singleton `AgentExecutor` with a multi-agent orchestration system:

```typescript
// lib/multi-agent/orchestrator.ts

export class MultiAgentOrchestrator {
  private agentInstances: Map<string, AgentInstance> = new Map();
  
  /**
   * Route a task to the appropriate agent(s)
   */
  async routeTask(task: Task): Promise<TaskResult> {
    // Determine which agent(s) should handle this
    const selectedAgents = await this.selectAgents(task);
    
    if (selectedAgents.length === 1) {
      // Single agent execution
      return this.executeSingleAgent(selectedAgents[0], task);
    } else {
      // Multi-agent collaboration
      return this.executeTeam(selectedAgents, task);
    }
  }
  
  /**
   * Execute a task with a team of agents
   */
  async executeTeam(agents: Agent[], task: Task): Promise<TaskResult> {
    const teamConfig = await this.getTeamConfig(agents);
    
    switch (teamConfig.consensusMode) {
      case "sequential":
        return this.executeSequential(agents, task);
      case "parallel":
        return this.executeParallel(agents, task);
      case "debate":
        return this.executeDebate(agents, task);
      case "consensus":
        return this.executeConsensus(agents, task);
    }
  }
  
  /**
   * Handle agent-to-agent delegation
   */
  async handleHandoff(
    fromAgent: Agent,
    toAgentId: string,
    task: Task,
    context: HandoffContext
  ): Promise<void> {
    // Validate the handoff is allowed
    if (!fromAgent.canDelegateToAgents.includes(toAgentId)) {
      throw new Error(`Agent ${fromAgent.id} cannot delegate to ${toAgentId}`);
    }
    
    // Transfer context and continue execution
    const toAgent = await this.getAgent(toAgentId);
    await this.executeSingleAgent(toAgent, task, context);
  }
}
```

### 5. Agent Configuration UI

Create UI for users to create and configure agents:

```tsx
// components/agents/AgentBuilder.tsx

interface AgentBuilderProps {
  workspaceId: string;
  onSave: (agent: Agent) => void;
}

export function AgentBuilder({ workspaceId, onSave }: AgentBuilderProps) {
  return (
    <div className="agent-builder">
      {/* Identity Section */}
      <section>
        <h3>Agent Identity</h3>
        <Input label="Name" placeholder="Research Assistant" />
        <Select label="Role">
          <option value="researcher">Researcher</option>
          <option value="writer">Writer</option>
          <option value="reviewer">Reviewer</option>
          <option value="analyst">Analyst</option>
          <option value="custom">Custom</option>
        </Select>
        <Textarea label="Persona" placeholder="Describe how this agent should behave..." />
      </section>
      
      {/* Model Configuration */}
      <section>
        <h3>AI Model</h3>
        <Select label="Provider">
          <option value="anthropic">Anthropic (Claude)</option>
          <option value="openai">OpenAI (GPT-4)</option>
        </Select>
        <Select label="Model">
          <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
          <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</option>
          <option value="gpt-4o">GPT-4o</option>
        </Select>
        <Slider label="Temperature" min={0} max={1} step={0.1} />
      </section>
      
      {/* Tools & Capabilities */}
      <section>
        <h3>Tools & Capabilities</h3>
        <MultiSelect label="Enabled Tools" options={availableTools} />
        <MultiSelect label="Can Delegate To" options={otherAgents} />
      </section>
      
      {/* System Prompt */}
      <section>
        <h3>System Prompt</h3>
        <Textarea label="Instructions" rows={10} />
        <Textarea label="Output Format" rows={4} />
      </section>
      
      {/* Memory Settings */}
      <section>
        <h3>Memory</h3>
        <Select label="Memory Type">
          <option value="none">None</option>
          <option value="conversation">Conversation History</option>
          <option value="semantic">Semantic (Vector)</option>
        </Select>
        <Input type="number" label="Memory Window" />
      </section>
    </div>
  );
}
```

---

## Tech Stack Recommendations

### Current Stack (Keep)

| Component | Technology | Notes |
|-----------|------------|-------|
| Frontend | Next.js 15 (App Router) | Keep - excellent for this use case |
| Database | PostgreSQL + Drizzle ORM | Keep - add pgvector extension |
| Styling | Tailwind CSS + shadcn/ui | Keep |
| Auth | NextAuth.js | Keep |
| AI SDK | Anthropic SDK | Expand to support multiple providers |

### Additions for Multi-Agent

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Multi-Model Support** | Vercel AI SDK (`ai` package) | Unified interface for Claude, GPT-4, etc. |
| **Vector Store** | pgvector (already have) or Pinecone | Semantic memory for agents |
| **Message Queue** | BullMQ + Redis | Robust job queue for agent tasks |
| **Real-time Updates** | Socket.io or Pusher | Live agent conversation streaming |
| **Agent Framework** | LangChain or custom | Agent orchestration (consider custom) |

### Alternative Architectures to Consider

#### Option A: Custom Multi-Agent (Recommended)

Build on your existing foundation:

```
Your Current System
      │
      ▼
┌─────────────────────────────────────┐
│ Multi-Agent Layer (custom)          │
│ • Agent entity management           │
│ • Orchestration logic               │
│ • Inter-agent communication         │
│ • Memory management                 │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│ AI Provider Abstraction             │
│ • Vercel AI SDK                     │
│ • Anthropic, OpenAI, etc.           │
└─────────────────────────────────────┘
```

**Pros:**
- Leverages your existing schema and UI
- Full control over agent behavior
- No vendor lock-in

**Cons:**
- More development work
- Need to build orchestration from scratch

#### Option B: LangChain/LangGraph Integration

Add LangChain for agent orchestration:

```
Your Current System
      │
      ▼
┌─────────────────────────────────────┐
│ LangChain/LangGraph                 │
│ • Agent definition                  │
│ • Tool binding                      │
│ • Multi-agent graphs                │
│ • Memory management                 │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│ Your Database (PostgreSQL)          │
│ • Persist LangChain states          │
│ • Store agent configurations        │
└─────────────────────────────────────┘
```

**Pros:**
- Mature agent patterns
- Built-in multi-agent support (LangGraph)
- Community tooling

**Cons:**
- Heavy abstraction layer
- Python-centric (TypeScript support is secondary)
- May conflict with your existing patterns

#### Option C: CrewAI-Style Framework

Adopt a crew/team-based model:

```typescript
// Define agents
const researcher = new Agent({
  name: "Research Agent",
  role: "Senior User Researcher",
  goal: "Extract insights from user feedback",
  tools: [searchTool, summarizeTool],
});

const writer = new Agent({
  name: "PRD Writer",
  role: "Product Manager",
  goal: "Create comprehensive PRDs",
  tools: [documentTool],
});

// Define a crew
const prdCrew = new Crew({
  agents: [researcher, writer],
  tasks: [
    { description: "Analyze user research", agent: researcher },
    { description: "Draft PRD based on research", agent: writer },
  ],
  process: "sequential",
});

// Execute
const result = await prdCrew.kickoff({ input: transcriptData });
```

**Pros:**
- Clean mental model
- Easy to understand workflows
- Good for PM use cases

**Cons:**
- CrewAI is Python-only
- Would need TypeScript port or inspiration

---

## Implementation Roadmap

### Phase 1: Agent Entity Foundation (2-3 weeks)

1. Create `agents` table schema
2. Build Agent CRUD API
3. Create basic Agent Builder UI
4. Migrate `agentDefinitions` to new model

### Phase 2: Multi-Provider Support (1-2 weeks)

1. Integrate Vercel AI SDK
2. Abstract model selection in executor
3. Add model configuration to Agent entity
4. Test with Claude, GPT-4, etc.

### Phase 3: Agent Memory System (2-3 weeks)

1. Create `agentMemories` table with pgvector
2. Build memory retrieval/storage APIs
3. Implement semantic search for context
4. Add memory management UI

### Phase 4: Conversations & Threads (2-3 weeks)

1. Create conversation/message schema
2. Build chat UI for agent interactions
3. Implement streaming responses
4. Add conversation history

### Phase 5: Multi-Agent Orchestration (3-4 weeks)

1. Build orchestrator service
2. Implement handoff protocol
3. Add team configuration
4. Build consensus/voting mechanisms

### Phase 6: Agent Templates & Marketplace (2-3 weeks)

1. Create agent template system
2. Build template library UI
3. Add import/export functionality
4. Community sharing (optional)

---

## Key Architectural Decisions

### Decision 1: Agent Identity vs. Ephemeral

**Question:** Should agents have persistent identity across sessions?

**Recommendation:** Yes - persistent identity enables:
- Accumulated memory/learning
- User trust/relationship building
- Consistent behavior
- Team dynamics

### Decision 2: Orchestration Model

**Question:** How should multiple agents coordinate?

**Options:**
1. **Hierarchical** - One orchestrator agent routes to specialists
2. **Peer-to-Peer** - Agents communicate directly
3. **Workflow-based** - Predefined sequences (like your stage recipes)

**Recommendation:** Hybrid approach:
- Use workflow-based for predictable PM stages
- Allow peer delegation for complex tasks
- Orchestrator for routing ambiguous requests

### Decision 3: Memory Scope

**Question:** Should agents share memory or have isolated memory?

**Recommendation:** Both:
- **Private memory** - Agent-specific preferences and patterns
- **Shared memory** - Workspace context, decisions, artifacts
- **Project memory** - Project-specific context all agents can access

### Decision 4: Model Selection

**Question:** Should users be able to choose models per agent?

**Recommendation:** Yes - different tasks benefit from different models:
- Claude for nuanced writing/analysis
- GPT-4o for speed on simpler tasks
- Specialized models for code generation

---

## Comparison: Current vs. Target

| Feature | Current | Target |
|---------|---------|--------|
| Agents | 1 (implicit) | N (configurable) |
| Models | Claude only | Multi-provider |
| Memory | Basic (`memoryEntries`) | Semantic vector per agent |
| Delegation | None | Agent-to-agent handoff |
| Teams | None | Configurable teams |
| Conversations | Job-based | Thread-based |
| Configuration | Stage recipes | Agent builder UI |
| Personalization | None | Personas per agent |

---

## Estimated Effort

| Phase | Effort | Dependencies |
|-------|--------|--------------|
| Phase 1: Agent Entity | 2-3 weeks | None |
| Phase 2: Multi-Provider | 1-2 weeks | Phase 1 |
| Phase 3: Memory System | 2-3 weeks | Phase 1 |
| Phase 4: Conversations | 2-3 weeks | Phase 1, 3 |
| Phase 5: Orchestration | 3-4 weeks | Phase 1-4 |
| Phase 6: Templates | 2-3 weeks | Phase 1-5 |

**Total: ~14-18 weeks** for full multi-agent team experience

---

## Quick Wins (Can Start Now)

1. **Add model selection to existing jobs** - Allow choosing Claude vs GPT-4
2. **Rename `agentDefinitions` to `agentTemplates`** - Clearer mental model
3. **Add persona field to stage recipes** - First step to agent personality
4. **Expose agent configuration in settings** - Basic agent customization
5. **Add streaming to job execution** - Better UX for long-running agents

---

## Conclusion

Converting pm-workspace to a multi-agent team experience is achievable by:

1. **Promoting agents to first-class entities** with identity, memory, and configuration
2. **Adding multi-provider support** via Vercel AI SDK
3. **Building an orchestration layer** for agent collaboration
4. **Creating a conversation system** for threaded agent interactions
5. **Exposing agent configuration** through a builder UI

The existing foundation (jobs, runs, skills, workspace isolation) provides a solid base. The main gaps are agent identity, inter-agent communication, and the orchestration layer.
