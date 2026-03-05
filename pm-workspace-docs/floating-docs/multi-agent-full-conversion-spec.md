# Full Multi-Agent Conversion Specification

> Complete specification for converting pm-workspace to a first-class multi-agent team experience with Google A2UI patterns and Vercel AI SDK

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Google A2UI Design Patterns](#google-a2ui-design-patterns)
3. [Vercel AI SDK Integration](#vercel-ai-sdk-integration)
4. [Agent Experience Architecture](#agent-experience-architecture)
5. [UI Component Specifications](#ui-component-specifications)
6. [Database Schema Changes](#database-schema-changes)
7. [Implementation Phases](#implementation-phases)

---

## Executive Summary

This document specifies the complete conversion from a single-agent PM copilot to a **first-class multi-agent team experience**. The conversion touches:

- **Frontend**: New A2UI-pattern components for agent interactions
- **Backend**: Vercel AI SDK for streaming, multi-provider, and tool orchestration
- **Database**: New agent, conversation, and memory schemas
- **UX**: Agent personas, team collaboration, and persistent memory

### Key Technologies

| Layer | Current | Target |
|-------|---------|--------|
| AI SDK | `@anthropic-ai/sdk` (direct) | `ai@6` (Vercel AI SDK v6) |
| Agent Definition | Custom `AgentExecutor` | v6 `agent()` function |
| Chat UI | Custom `ChatSidebar` | A2UI-pattern `AgentChat` |
| React Hooks | None | v6 `useAgent` + `useAgentThreads` |
| Streaming | None | v6 `toAgentStream()` + streaming tools |
| Multi-Provider | Claude only | Claude, GPT-4, Gemini |
| Tool Execution | Custom `executeTool` | v6 `tool()` with generator streaming |
| Multi-Agent | None | v6 orchestrator + delegation |
| Agent Memory | Basic `memoryEntries` | Semantic vector + conversation threads |
| Middleware | None | v6 `defineMiddleware()` for observability |

---

## Google A2UI Design Patterns

### What is A2UI?

A2UI (Agent-to-User Interface) is Google's design framework for AI agent experiences. Key principles:

1. **Agent Presence** - Agents have persistent identity and visual representation
2. **Transparency** - Users see agent thinking, actions, and reasoning
3. **Control** - Users can interrupt, redirect, and configure agents
4. **Collaboration** - Multiple agents can work together visibly
5. **Context Awareness** - Agents understand and adapt to user context

### A2UI Component Patterns

#### 1. Agent Avatar & Presence

```tsx
interface AgentPresence {
  // Visual identity
  avatar: string | ReactNode;      // Avatar image or icon component
  name: string;                     // "Research Agent", "Maya"
  role: string;                     // "User Researcher"
  statusIndicator: "idle" | "thinking" | "acting" | "waiting";
  
  // Personality indicators
  specialization: string[];         // ["research", "analysis", "synthesis"]
  confidenceLevel?: number;         // 0-1 for current task
  
  // State
  currentTask?: string;             // "Analyzing transcript..."
  lastActiveAt?: Date;
}
```

**UI Implementation:**

```tsx
// components/agents/AgentPresenceBadge.tsx
export function AgentPresenceBadge({ agent, size = "md" }: Props) {
  return (
    <div className="flex items-center gap-2">
      {/* Avatar with status ring */}
      <div className="relative">
        <Avatar className={cn(sizeClasses[size])}>
          <AvatarImage src={agent.avatar} />
          <AvatarFallback>{getInitials(agent.name)}</AvatarFallback>
        </Avatar>
        
        {/* Status indicator ring */}
        <span className={cn(
          "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background",
          statusColors[agent.statusIndicator]
        )}>
          {agent.statusIndicator === "thinking" && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          )}
        </span>
      </div>
      
      {/* Name and role */}
      <div className="flex flex-col">
        <span className="font-medium text-sm">{agent.name}</span>
        <span className="text-xs text-muted-foreground">{agent.role}</span>
      </div>
    </div>
  );
}
```

#### 2. Agent Thinking Transparency

A2UI emphasizes showing the agent's "thought process" to build trust:

```tsx
interface AgentThinkingState {
  stage: "planning" | "researching" | "analyzing" | "synthesizing" | "verifying";
  currentStep: string;
  stepsCompleted: number;
  totalSteps: number;
  reasoning?: string;              // Why the agent is doing this
  toolsUsed: Array<{
    name: string;
    status: "pending" | "running" | "complete" | "failed";
    input?: Record<string, unknown>;
    output?: unknown;
  }>;
}
```

**UI Implementation:**

```tsx
// components/agents/AgentThinkingPanel.tsx
export function AgentThinkingPanel({ thinking, expanded = false }: Props) {
  return (
    <motion.div 
      className="rounded-lg bg-muted/50 border border-border"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
    >
      {/* Thinking header with stage indicator */}
      <div className="flex items-center gap-3 p-3 border-b border-border">
        <Brain className="w-4 h-4 text-purple-500 animate-pulse" />
        <div className="flex-1">
          <p className="text-sm font-medium">{stageLabels[thinking.stage]}</p>
          <p className="text-xs text-muted-foreground">{thinking.currentStep}</p>
        </div>
        <Progress 
          value={(thinking.stepsCompleted / thinking.totalSteps) * 100}
          className="w-20 h-1.5"
        />
      </div>
      
      {/* Expandable reasoning */}
      <Collapsible open={expanded}>
        <CollapsibleContent>
          {thinking.reasoning && (
            <div className="p-3 text-xs text-muted-foreground italic">
              "{thinking.reasoning}"
            </div>
          )}
          
          {/* Tool execution timeline */}
          <div className="px-3 pb-3 space-y-2">
            {thinking.toolsUsed.map((tool, i) => (
              <div key={i} className="flex items-center gap-2">
                <ToolStatusIcon status={tool.status} />
                <span className="text-xs font-mono">{tool.name}</span>
                {tool.status === "running" && (
                  <Loader2 className="w-3 h-3 animate-spin" />
                )}
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
}
```

#### 3. Agent Action Cards

When agents take actions, show them as discrete, reviewable cards:

```tsx
interface AgentAction {
  id: string;
  type: "tool_call" | "document_create" | "document_update" | "api_call" | "delegation";
  agent: AgentPresence;
  timestamp: Date;
  
  // Action details
  title: string;
  description: string;
  
  // For tool calls
  toolName?: string;
  toolInput?: Record<string, unknown>;
  toolOutput?: unknown;
  
  // For delegations
  delegatedToAgent?: AgentPresence;
  delegationReason?: string;
  
  // State
  status: "pending" | "running" | "complete" | "failed" | "cancelled";
  canUndo: boolean;
  canRetry: boolean;
}
```

**UI Implementation:**

```tsx
// components/agents/AgentActionCard.tsx
export function AgentActionCard({ action, onUndo, onRetry }: Props) {
  return (
    <Card className={cn(
      "overflow-hidden transition-all",
      action.status === "running" && "ring-2 ring-purple-500/50"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <ActionTypeIcon type={action.type} />
            <div>
              <CardTitle className="text-sm">{action.title}</CardTitle>
              <p className="text-xs text-muted-foreground">
                by {action.agent.name} • {formatTime(action.timestamp)}
              </p>
            </div>
          </div>
          <ActionStatusBadge status={action.status} />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground">{action.description}</p>
        
        {/* Tool execution details */}
        {action.type === "tool_call" && action.toolName && (
          <div className="mt-3 p-2 rounded bg-muted/50 font-mono text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Terminal className="w-3 h-3" />
              {action.toolName}
            </div>
            {action.toolOutput && (
              <pre className="mt-2 text-foreground overflow-x-auto">
                {JSON.stringify(action.toolOutput, null, 2)}
              </pre>
            )}
          </div>
        )}
        
        {/* Delegation chain */}
        {action.type === "delegation" && action.delegatedToAgent && (
          <div className="mt-3 flex items-center gap-2 p-2 rounded bg-purple-500/10">
            <ArrowRight className="w-3 h-3 text-purple-500" />
            <AgentPresenceBadge agent={action.delegatedToAgent} size="sm" />
            {action.delegationReason && (
              <span className="text-xs text-muted-foreground">
                "{action.delegationReason}"
              </span>
            )}
          </div>
        )}
      </CardContent>
      
      {/* Action controls */}
      {(action.canUndo || action.canRetry) && (
        <CardFooter className="pt-0 gap-2">
          {action.canUndo && (
            <Button variant="ghost" size="sm" onClick={onUndo}>
              <Undo className="w-3 h-3 mr-1" />
              Undo
            </Button>
          )}
          {action.canRetry && action.status === "failed" && (
            <Button variant="ghost" size="sm" onClick={onRetry}>
              <RotateCcw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
```

#### 4. Multi-Agent Team View

Show multiple agents working together:

```tsx
// components/agents/AgentTeamPanel.tsx
export function AgentTeamPanel({ team, currentTask }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Team header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{team.name}</h3>
            <p className="text-sm text-muted-foreground">{currentTask}</p>
          </div>
          <TeamStatusBadge status={team.status} />
        </div>
      </div>
      
      {/* Agent avatars in a row */}
      <div className="p-4 flex items-center gap-4">
        <div className="flex -space-x-3">
          {team.agents.map((agent, i) => (
            <Tooltip key={agent.id}>
              <TooltipTrigger>
                <div 
                  className={cn(
                    "relative",
                    agent.statusIndicator === "acting" && "ring-2 ring-purple-500"
                  )}
                  style={{ zIndex: team.agents.length - i }}
                >
                  <Avatar className="w-10 h-10 border-2 border-background">
                    <AvatarImage src={agent.avatar} />
                    <AvatarFallback>{getInitials(agent.name)}</AvatarFallback>
                  </Avatar>
                  <StatusDot status={agent.statusIndicator} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{agent.name}</p>
                <p className="text-xs text-muted-foreground">{agent.role}</p>
                {agent.currentTask && (
                  <p className="text-xs mt-1">{agent.currentTask}</p>
                )}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        
        {/* Active agent's current action */}
        {team.activeAgent && (
          <div className="flex-1 ml-2">
            <p className="text-sm font-medium">{team.activeAgent.name}</p>
            <p className="text-xs text-muted-foreground">
              {team.activeAgent.currentTask}
            </p>
          </div>
        )}
      </div>
      
      {/* Conversation flow between agents */}
      <div className="border-t border-border max-h-[300px] overflow-y-auto">
        {team.conversation.map((message) => (
          <AgentMessage key={message.id} message={message} />
        ))}
      </div>
    </div>
  );
}
```

#### 5. Agent Control Panel

A2UI emphasizes user control over agents:

```tsx
// components/agents/AgentControlPanel.tsx
export function AgentControlPanel({ agent, onPause, onResume, onStop, onConfigure }: Props) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
      {/* Agent identity */}
      <AgentPresenceBadge agent={agent} size="sm" />
      
      {/* Control buttons */}
      <div className="flex-1" />
      
      {agent.status === "acting" ? (
        <>
          <Button variant="ghost" size="sm" onClick={onPause}>
            <Pause className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onStop}>
            <Square className="w-4 h-4" />
          </Button>
        </>
      ) : agent.status === "paused" ? (
        <Button variant="ghost" size="sm" onClick={onResume}>
          <Play className="w-4 h-4" />
        </Button>
      ) : null}
      
      <Button variant="ghost" size="sm" onClick={onConfigure}>
        <Settings className="w-4 h-4" />
      </Button>
    </div>
  );
}
```

---

## Vercel AI SDK v6 Integration

### Installation

```bash
cd orchestrator
npm install ai@6 @ai-sdk/anthropic @ai-sdk/openai @ai-sdk/google
```

### What's New in AI SDK v6

AI SDK v6 introduces first-class agent support with new primitives:

1. **`agent()` Function** - Declarative agent definition with tools and instructions
2. **`useAgent` Hook** - React hook for agent interactions with built-in state management
3. **Agent Streams** - `toAgentStream()` for real-time streaming of agent responses
4. **Tool Result Streaming** - Stream tool outputs as they execute
5. **Conversation Threads** - Built-in thread/conversation management
6. **Multi-Agent Coordination** - Native support for agent-to-agent handoffs
7. **Middleware Support** - Intercept and modify agent behavior
8. **Improved Observability** - Better logging and tracing for agent actions

### Provider Setup

```typescript
// lib/ai/providers.ts
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { agent, type Agent as AIAgent, type Tool } from "ai";

export type AIProvider = "anthropic" | "openai" | "google";

export const providers = {
  anthropic: anthropic,
  openai: openai,
  google: google,
} as const;

export function getModel(provider: AIProvider, modelId: string) {
  switch (provider) {
    case "anthropic":
      return anthropic(modelId);
    case "openai":
      return openai(modelId);
    case "google":
      return google(modelId);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

// Default models per provider
export const defaultModels: Record<AIProvider, string> = {
  anthropic: "claude-sonnet-4-20250514",
  openai: "gpt-4o",
  google: "gemini-2.0-flash",
};

// Model capabilities for agent selection
export const modelCapabilities: Record<string, {
  maxTokens: number;
  supportsTools: boolean;
  supportsStreaming: boolean;
  costTier: "low" | "medium" | "high";
}> = {
  "claude-sonnet-4-20250514": {
    maxTokens: 8192,
    supportsTools: true,
    supportsStreaming: true,
    costTier: "medium",
  },
  "gpt-4o": {
    maxTokens: 16384,
    supportsTools: true,
    supportsStreaming: true,
    costTier: "high",
  },
  "gemini-2.0-flash": {
    maxTokens: 8192,
    supportsTools: true,
    supportsStreaming: true,
    costTier: "low",
  },
};
```

### AI SDK v6 Agent Definition

The new `agent()` function in v6 provides declarative agent creation:

```typescript
// lib/ai/agents/pm-agent.ts
import { agent, tool } from "ai";
import { z } from "zod";
import { anthropic } from "@ai-sdk/anthropic";
import { getWorkspaceContext, getProjectContext } from "@/lib/context/resolve";

// Define reusable tools
export const pmTools = {
  getProjectStatus: tool({
    description: "Get the current status of a project including stage and key metrics",
    parameters: z.object({
      projectId: z.string().describe("The project ID to check"),
    }),
    execute: async ({ projectId }) => {
      const project = await getProject(projectId);
      return {
        name: project?.name,
        stage: project?.stage,
        status: project?.status,
        documentsCount: project?.documents?.length ?? 0,
      };
    },
  }),

  createDocument: tool({
    description: "Create or update a document for a project",
    parameters: z.object({
      projectId: z.string(),
      type: z.enum(["prd", "design_brief", "engineering_spec", "research"]),
      content: z.string(),
    }),
    execute: async ({ projectId, type, content }) => {
      const doc = await saveDocument(projectId, type, content);
      return { documentId: doc.id, saved: true };
    },
  }),

  searchKnowledge: tool({
    description: "Search the workspace knowledge base for relevant information",
    parameters: z.object({
      query: z.string().describe("Search query"),
      limit: z.number().optional().default(5),
    }),
    execute: async ({ query, limit }, { context }) => {
      const results = await searchKnowledgeBase(context.workspaceId, query, limit);
      return results;
    },
  }),

  // v6: Tool with streaming output for long-running operations
  analyzeTranscript: tool({
    description: "Analyze a transcript and extract insights",
    parameters: z.object({
      transcript: z.string().describe("The transcript text to analyze"),
      projectId: z.string().optional(),
    }),
    // v6: Streaming tool execution
    execute: async function* ({ transcript, projectId }) {
      yield { status: "Extracting key quotes..." };
      const quotes = await extractQuotes(transcript);
      
      yield { status: "Identifying themes...", quotes };
      const themes = await identifyThemes(transcript);
      
      yield { status: "Generating summary...", quotes, themes };
      const summary = await generateSummary(transcript, themes);
      
      return { quotes, themes, summary };
    },
  }),
};

// Create the PM Agent using v6 agent() function
export function createPMAgent(config: {
  workspaceId: string;
  projectId?: string;
  customInstructions?: string;
}) {
  return agent({
    model: anthropic("claude-sonnet-4-20250514"),
    
    // System instructions with context
    system: async () => {
      const workspaceContext = await getWorkspaceContext(config.workspaceId);
      const projectContext = config.projectId 
        ? await getProjectContext(config.projectId) 
        : "";
      
      return `You are an expert PM assistant helping with product management tasks.

## Your Capabilities
- Analyze user research and transcripts
- Create PRDs, design briefs, and engineering specs  
- Search and synthesize knowledge base information
- Track project status and suggest next steps

## Workspace Context
${workspaceContext}

${projectContext ? `## Current Project\n${projectContext}` : ""}

${config.customInstructions ?? ""}

Be concise and actionable. Always cite sources when referencing knowledge base.`;
    },
    
    // Available tools
    tools: pmTools,
    
    // v6: Context passed to all tools
    context: {
      workspaceId: config.workspaceId,
      projectId: config.projectId,
    },
    
    // v6: Agent behavior configuration
    maxSteps: 10,           // Maximum tool execution steps
    maxRetries: 3,          // Retry failed tool calls
    
    // v6: Callbacks for observability
    onStepStart: ({ step, tools }) => {
      console.log(`[Agent] Starting step ${step}`, tools);
    },
    onStepFinish: ({ step, result, duration }) => {
      console.log(`[Agent] Completed step ${step} in ${duration}ms`);
    },
    onToolCall: ({ tool, args }) => {
      console.log(`[Agent] Calling tool: ${tool}`, args);
    },
  });
}
```

### Streaming Chat API with v6 Agent

```typescript
// app/api/chat/route.ts
import { createPMAgent } from "@/lib/ai/agents/pm-agent";

export async function POST(req: Request) {
  const { messages, workspaceId, projectId, agentId } = await req.json();

  // Get custom agent config if specified
  const agentConfig = agentId ? await getAgentConfig(agentId) : null;
  
  // Create agent instance
  const pmAgent = createPMAgent({
    workspaceId,
    projectId,
    customInstructions: agentConfig?.systemPrompt,
  });

  // v6: Execute agent with streaming response
  const result = await pmAgent.run({
    messages,
    // v6: Conversation thread support
    threadId: req.headers.get("x-thread-id") ?? undefined,
  });

  // v6: Return agent stream with tool results
  return result.toAgentStream();
}
```

### Multi-Agent Orchestration with v6

```typescript
// lib/ai/agents/orchestrator.ts
import { agent, tool } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { createPMAgent } from "./pm-agent";
import { createResearchAgent } from "./research-agent";
import { createPrototypeAgent } from "./prototype-agent";

// Create specialized agents
const agents = {
  research: createResearchAgent,
  pm: createPMAgent,
  prototype: createPrototypeAgent,
};

// v6: Orchestrator agent that delegates to specialists
export function createOrchestratorAgent(config: {
  workspaceId: string;
  projectId?: string;
  availableAgents: string[];
}) {
  // Create delegation tools for each available agent
  const delegationTools = Object.fromEntries(
    config.availableAgents.map(agentType => [
      `delegateTo${capitalize(agentType)}`,
      tool({
        description: `Delegate a task to the ${agentType} agent specialist`,
        parameters: z.object({
          task: z.string().describe("The task to delegate"),
          context: z.string().optional().describe("Additional context"),
        }),
        // v6: Agent-to-agent delegation with streaming
        execute: async function* ({ task, context }) {
          const specialist = agents[agentType]({
            workspaceId: config.workspaceId,
            projectId: config.projectId,
          });
          
          yield { status: `Delegating to ${agentType} agent...` };
          
          // v6: Stream results from delegated agent
          const result = await specialist.run({
            messages: [{ role: "user", content: `${task}\n\nContext: ${context}` }],
          });
          
          // Yield streaming chunks from sub-agent
          for await (const chunk of result.stream) {
            yield chunk;
          }
          
          return result.finalOutput;
        },
      }),
    ])
  );

  return agent({
    model: anthropic("claude-sonnet-4-20250514"),
    system: `You are an orchestrator agent that coordinates specialized agents.

Available specialists:
${config.availableAgents.map(a => `- ${a}: ${getAgentDescription(a)}`).join('\n')}

Analyze user requests and delegate to the appropriate specialist.
You can delegate to multiple agents if the task requires it.
Always synthesize results from delegated agents into a coherent response.`,
    
    tools: delegationTools,
    maxSteps: 15, // Higher limit for multi-agent coordination
    
    // v6: Track delegation chain
    context: {
      workspaceId: config.workspaceId,
      delegationDepth: 0,
      maxDelegationDepth: 3,
    },
  });
}
```

### React Hook Integration with v6 `useAgent`

AI SDK v6 introduces the `useAgent` hook for seamless React integration:

```typescript
// hooks/useAgentChat.ts
"use client";

import { useAgent, type AgentState, type ToolInvocation } from "ai/react";
import { useMemo, useCallback } from "react";
import type { Agent as DBAgent } from "@/lib/db/schema";

interface UseAgentChatOptions {
  agent: DBAgent;
  workspaceId: string;
  projectId?: string;
  threadId?: string;
  onDelegation?: (delegation: AgentDelegation) => void;
}

interface AgentDelegation {
  fromAgentId: string;
  toAgentId: string;
  task: string;
}

export function useAgentChat({
  agent,
  workspaceId,
  projectId,
  threadId,
  onDelegation,
}: UseAgentChatOptions) {
  // v6: useAgent hook with full agent state management
  const {
    messages,
    input,
    setInput,
    handleSubmit,
    
    // v6: Agent-specific state
    isRunning,          // Agent is actively processing
    isPending,          // Waiting for user input
    currentStep,        // Current execution step number
    totalSteps,         // Total steps in current run
    
    // v6: Tool execution state
    activeTools,        // Currently executing tools
    completedTools,     // Completed tool invocations
    
    // v6: Streaming state
    streamingContent,   // Current streaming text
    streamingToolOutput, // Current streaming tool output
    
    // v6: Control methods
    stop,               // Stop agent execution
    retry,              // Retry last failed step
    reset,              // Reset conversation
    
    // v6: Thread management
    thread,             // Current conversation thread
    switchThread,       // Switch to different thread
    
    error,
  } = useAgent({
    api: "/api/chat",
    
    // v6: Agent configuration
    agentId: agent.id,
    
    // v6: Request body
    body: {
      workspaceId,
      projectId,
      agentId: agent.id,
    },
    
    // v6: Thread support for conversation persistence
    threadId,
    
    // v6: Event callbacks with rich context
    onStepStart: ({ step, toolCalls }) => {
      console.log(`[useAgent] Step ${step} starting`, toolCalls);
    },
    
    onStepComplete: ({ step, result, duration }) => {
      console.log(`[useAgent] Step ${step} complete in ${duration}ms`);
    },
    
    onToolCall: ({ tool, args, step }) => {
      console.log(`[useAgent] Tool call: ${tool}`, args);
      
      // Detect delegation events
      if (tool.startsWith("delegateTo")) {
        const targetAgent = tool.replace("delegateTo", "").toLowerCase();
        onDelegation?.({
          fromAgentId: agent.id,
          toAgentId: targetAgent,
          task: args.task as string,
        });
      }
    },
    
    // v6: Streaming tool results
    onToolStream: ({ tool, chunk }) => {
      console.log(`[useAgent] Tool stream: ${tool}`, chunk);
    },
    
    onError: (error) => {
      console.error("[useAgent] Error:", error);
    },
    
    onFinish: ({ totalSteps, duration, tokensUsed }) => {
      console.log(`[useAgent] Finished in ${duration}ms, ${totalSteps} steps, ${tokensUsed} tokens`);
    },
  });

  // v6: Computed thinking state from agent state
  const thinking = useMemo(() => {
    if (!isRunning) return null;
    
    const activeTool = activeTools[0];
    return {
      stage: activeTool ? "acting" : "thinking",
      currentStep: activeTool 
        ? `Executing ${activeTool.name}...`
        : streamingContent 
          ? "Generating response..."
          : "Processing...",
      progress: totalSteps > 0 ? currentStep / totalSteps : 0,
      activeTools: activeTools.map(t => ({
        name: t.name,
        status: "running" as const,
        args: t.args,
        streamingOutput: t.id === streamingToolOutput?.toolId 
          ? streamingToolOutput.output 
          : undefined,
      })),
    };
  }, [isRunning, activeTools, currentStep, totalSteps, streamingContent, streamingToolOutput]);

  // v6: All tool invocations with status
  const toolInvocations = useMemo(() => {
    return [
      ...activeTools.map(t => ({ ...t, status: "running" as const })),
      ...completedTools.map(t => ({ ...t, status: "complete" as const })),
    ];
  }, [activeTools, completedTools]);

  // Quick actions based on enabled tools
  const quickActions = useMemo(() => {
    return agent.enabledTools?.map((toolName) => ({
      label: getToolLabel(toolName),
      description: getToolDescription(toolName),
      execute: () => {
        setInput(getToolPrompt(toolName));
      },
    })) ?? [];
  }, [agent.enabledTools, setInput]);

  // v6: Submit with thread context
  const submit = useCallback((e?: React.FormEvent) => {
    handleSubmit(e, {
      // v6: Attach files or context to message
      experimental_attachments: undefined,
    });
  }, [handleSubmit]);

  return {
    // Message state
    messages,
    input,
    setInput,
    handleSubmit: submit,
    
    // v6: Rich agent state
    isRunning,
    isPending,
    thinking,
    toolInvocations,
    currentStep,
    totalSteps,
    
    // v6: Streaming state
    streamingContent,
    streamingToolOutput,
    
    // Controls
    stop,
    retry,
    reset,
    
    // v6: Thread management
    thread,
    switchThread,
    
    // Error handling
    error,
    
    // Helpers
    quickActions,
    agent,
    
    // Computed
    isThinking: thinking !== null,
    hasActiveTools: activeTools.length > 0,
  };
}

// Helper functions
function getToolLabel(toolName: string): string {
  const labels: Record<string, string> = {
    getProjectStatus: "Check Status",
    createDocument: "Create Document",
    searchKnowledge: "Search Knowledge",
    analyzeTranscript: "Analyze Transcript",
    delegateToResearch: "Ask Research Agent",
    delegateToPm: "Ask PM Agent",
  };
  return labels[toolName] ?? toolName;
}

function getToolDescription(toolName: string): string {
  const descriptions: Record<string, string> = {
    getProjectStatus: "Get current project status and metrics",
    createDocument: "Create or update a project document",
    searchKnowledge: "Search the knowledge base",
    analyzeTranscript: "Extract insights from a transcript",
  };
  return descriptions[toolName] ?? "";
}

function getToolPrompt(toolName: string): string {
  const prompts: Record<string, string> = {
    getProjectStatus: "What's the current status?",
    searchKnowledge: "Search the knowledge base for ",
    analyzeTranscript: "Analyze this transcript: ",
  };
  return prompts[toolName] ?? "";
}
```

### v6 Thread Management

AI SDK v6 has built-in conversation thread support:

```typescript
// hooks/useAgentThreads.ts
import { useAgentThreads } from "ai/react";

export function useWorkspaceThreads(workspaceId: string, agentId: string) {
  const {
    threads,          // List of conversation threads
    activeThread,     // Currently selected thread
    createThread,     // Create new thread
    deleteThread,     // Delete a thread
    switchThread,     // Switch active thread
    isLoading,
  } = useAgentThreads({
    api: "/api/threads",
    body: { workspaceId, agentId },
  });

  return {
    threads,
    activeThread,
    createThread,
    deleteThread,
    switchThread,
    isLoading,
  };
}
```
```

### Agent Chat Component with v6

Full A2UI-pattern chat component using AI SDK v6:

```tsx
// components/agents/AgentChat.tsx
"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAgentChat } from "@/hooks/useAgentChat";
import { AgentPresenceBadge } from "./AgentPresenceBadge";
import { AgentThinkingPanel } from "./AgentThinkingPanel";
import { AgentActionCard } from "./AgentActionCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Send, 
  Loader2, 
  Square, 
  Sparkles,
  Bot,
  User,
  RotateCcw,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Agent } from "@/lib/db/schema";
import ReactMarkdown from "react-markdown";

interface AgentChatProps {
  agent: Agent;
  workspaceId: string;
  projectId?: string;
  threadId?: string;
  className?: string;
}

export function AgentChat({ 
  agent, 
  workspaceId, 
  projectId, 
  threadId,
  className 
}: AgentChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // v6: Use the new useAgent-powered hook
  const {
    messages,
    input,
    setInput,
    handleSubmit,
    
    // v6: Rich agent state
    isRunning,
    thinking,
    toolInvocations,
    currentStep,
    totalSteps,
    
    // v6: Streaming state
    streamingContent,
    streamingToolOutput,
    
    // v6: Controls
    stop,
    retry,
    reset,
    
    // v6: Thread management
    thread,
    
    error,
    quickActions,
    isThinking,
    hasActiveTools,
  } = useAgentChat({
    agent,
    workspaceId,
    projectId,
    threadId,
  });
  
  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking, streamingContent]);
  
  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Agent header with v6 status */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <AgentPresenceBadge 
            agent={{
              avatar: agent.avatar ?? undefined,
              name: agent.name,
              role: agent.role,
              statusIndicator: isRunning 
                ? hasActiveTools ? "acting" : "thinking" 
                : "idle",
              currentTask: thinking?.currentStep,
            }}
          />
          
          <div className="flex items-center gap-2">
            {/* v6: Thread indicator */}
            {thread && (
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                <History className="w-3 h-3 mr-1" />
                {thread.title ?? `Thread ${thread.id.slice(0, 8)}`}
              </Button>
            )}
            
            {isRunning && (
              <Button variant="ghost" size="sm" onClick={stop}>
                <Square className="w-4 h-4 mr-1" />
                Stop
              </Button>
            )}
          </div>
        </div>
        
        {/* v6: Step progress indicator */}
        {isRunning && totalSteps > 0 && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="h-1" />
          </div>
        )}
      </div>
      
      {/* Messages area */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="p-4 space-y-4">
          {/* Welcome message if no messages */}
          {messages.length === 0 && !isRunning && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 mx-auto mb-4 flex items-center justify-center">
                {agent.avatar ? (
                  <img src={agent.avatar} alt="" className="w-10 h-10 rounded-full" />
                ) : (
                  <Bot className="w-8 h-8 text-purple-500" />
                )}
              </div>
              <h3 className="font-semibold text-lg">{agent.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                {agent.description ?? `I'm your ${agent.role}. How can I help you today?`}
              </p>
              
              {/* Quick action suggestions */}
              {quickActions.length > 0 && (
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {quickActions.slice(0, 4).map((action, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={action.execute}
                      className="text-xs"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Message list */}
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  "flex gap-3",
                  message.role === "user" && "flex-row-reverse"
                )}
              >
                {/* Avatar */}
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                  message.role === "user" 
                    ? "bg-purple-500/20" 
                    : "bg-gradient-to-br from-teal-500/20 to-purple-500/20"
                )}>
                  {message.role === "user" ? (
                    <User className="w-4 h-4 text-purple-400" />
                  ) : (
                    agent.avatar ? (
                      <img src={agent.avatar} alt="" className="w-6 h-6 rounded" />
                    ) : (
                      <Bot className="w-4 h-4 text-teal-400" />
                    )
                  )}
                </div>
                
                {/* Message content */}
                <div className={cn(
                  "flex-1 max-w-[80%]",
                  message.role === "user" && "text-right"
                )}>
                  <div className={cn(
                    "inline-block p-3 rounded-xl",
                    message.role === "user"
                      ? "bg-purple-500/10"
                      : "bg-muted/50"
                  )}>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  </div>
                  
                  {/* v6: Tool invocations with streaming output */}
                  {message.role === "assistant" && message.toolInvocations && (
                    <div className="mt-2 space-y-2">
                      {message.toolInvocations.map((invocation: any) => (
                        <AgentActionCard
                          key={invocation.toolCallId}
                          action={{
                            id: invocation.toolCallId,
                            type: "tool_call",
                            agent: {
                              avatar: agent.avatar ?? undefined,
                              name: agent.name,
                              role: agent.role,
                              statusIndicator: "idle",
                            },
                            timestamp: new Date(),
                            title: invocation.toolName,
                            description: `Called ${invocation.toolName}`,
                            toolName: invocation.toolName,
                            toolInput: invocation.args,
                            toolOutput: invocation.result,
                            // v6: Streaming tool output
                            streamingOutput: streamingToolOutput?.toolId === invocation.toolCallId
                              ? streamingToolOutput.output
                              : undefined,
                            status: invocation.result 
                              ? "complete" 
                              : streamingToolOutput?.toolId === invocation.toolCallId
                                ? "running"
                                : "pending",
                            canUndo: false,
                            canRetry: false,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* v6: Streaming content indicator */}
          {streamingContent && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-teal-400" />
              </div>
              <div className="flex-1">
                <div className="inline-block p-3 rounded-xl bg-muted/50">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{streamingContent}</ReactMarkdown>
                    <span className="inline-block w-2 h-4 bg-purple-500 animate-pulse ml-1" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* v6: Enhanced thinking indicator with active tools */}
          {thinking && !streamingContent && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-teal-400" />
              </div>
              <div className="flex-1">
                <AgentThinkingPanel 
                  thinking={{
                    stage: thinking.stage as "planning" | "researching" | "analyzing" | "synthesizing" | "verifying",
                    currentStep: thinking.currentStep,
                    stepsCompleted: currentStep,
                    totalSteps: Math.max(1, totalSteps),
                    toolsUsed: thinking.activeTools ?? [],
                  }}
                  expanded={true}
                />
              </div>
            </motion.div>
          )}
          
          {/* v6: Error with retry option */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-500"
            >
              <span className="text-sm">{error.message}</span>
              <Button variant="ghost" size="sm" onClick={retry}>
                <RotateCcw className="w-3 h-3 mr-1" />
                Retry
              </Button>
            </motion.div>
          )}
        </div>
      </ScrollArea>
      
      {/* Input area */}
      <div className="p-4 border-t border-border">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${agent.name}...`}
            className="min-h-[44px] max-h-[200px] resize-none"
            rows={1}
            disabled={isRunning}
          />
          <Button type="submit" disabled={!input.trim() || isRunning}>
            {isRunning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
        
        {/* Quick actions below input */}
        {messages.length > 0 && quickActions.length > 0 && (
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {quickActions.slice(0, 3).map((action, i) => (
              <Button
                key={i}
                variant="ghost"
                size="sm"
                onClick={action.execute}
                className="text-xs shrink-0"
                disabled={isRunning}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

### v6 Multi-Agent Streaming

AI SDK v6 provides native multi-agent support with streaming:

```typescript
// app/api/agents/team/route.ts
import { agent, tool } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

export async function POST(req: Request) {
  const { messages, teamId, workspaceId, task } = await req.json();
  
  // Get team configuration
  const team = await getTeam(teamId);
  const specialists = team.agents.filter(a => a.id !== team.orchestratorAgentId);
  
  // v6: Create sub-agents for team members
  const subAgents = Object.fromEntries(
    specialists.map(specialist => [
      specialist.id,
      agent({
        model: anthropic(specialist.model ?? "claude-sonnet-4-20250514"),
        system: specialist.systemPromptTemplate,
        tools: getToolsForAgent(specialist),
        context: { workspaceId, agentId: specialist.id },
      }),
    ])
  );
  
  // v6: Create orchestrator with delegation tools
  const orchestratorAgent = agent({
    model: anthropic("claude-sonnet-4-20250514"),
    system: `You are an orchestrator coordinating a team of specialists.
    
Available team members:
${specialists.map(s => `- ${s.name} (${s.role}): ${s.description}`).join('\n')}

Analyze user requests and delegate to appropriate specialists.
Synthesize results into coherent responses.`,
    
    tools: Object.fromEntries(
      specialists.map(specialist => [
        `delegateTo${specialist.name.replace(/\s/g, '')}`,
        tool({
          description: `Delegate to ${specialist.name} (${specialist.role})`,
          parameters: z.object({
            task: z.string(),
            context: z.string().optional(),
          }),
          // v6: Streaming delegation with sub-agent execution
          execute: async function* ({ task, context }) {
            yield { status: `Delegating to ${specialist.name}...` };
            
            const subAgent = subAgents[specialist.id];
            const result = await subAgent.run({
              messages: [{ 
                role: "user", 
                content: `${task}${context ? `\n\nContext: ${context}` : ""}` 
              }],
            });
            
            // v6: Stream sub-agent results
            for await (const chunk of result.stream) {
              yield { 
                status: `${specialist.name} responding...`,
                chunk,
              };
            }
            
            return {
              agent: specialist.name,
              result: result.text,
            };
          },
        }),
      ])
    ),
    
    maxSteps: 20, // Higher for multi-agent coordination
    
    // v6: Track delegation chain
    onToolCall: ({ tool, args }) => {
      console.log(`[Orchestrator] Delegating: ${tool}`, args);
    },
  });
  
  // v6: Run orchestrator with team context
  const result = await orchestratorAgent.run({
    messages: [
      ...messages,
      { role: "user", content: task },
    ],
  });
  
  return result.toAgentStream();
}
```

### v6 Parallel Agent Execution

For tasks requiring multiple agents simultaneously:

```typescript
// lib/ai/agents/parallel-execution.ts
import { agent } from "ai";

export async function executeAgentsInParallel(
  agents: Agent[],
  task: string,
  context: Record<string, unknown>
) {
  // v6: Create agent instances
  const agentInstances = agents.map(a => createAgentInstance(a, context));
  
  // v6: Execute all agents in parallel
  const results = await Promise.all(
    agentInstances.map(async (agentInstance, i) => {
      const result = await agentInstance.run({
        messages: [{ role: "user", content: task }],
      });
      
      return {
        agentId: agents[i].id,
        agentName: agents[i].name,
        response: result.text,
        toolCalls: result.toolCalls,
        tokensUsed: result.usage,
      };
    })
  );
  
  return results;
}

// v6: Consensus voting with parallel agents
export async function executeWithConsensus(
  agents: Agent[],
  task: string,
  options: { 
    consensusMode: "majority" | "unanimous" | "weighted";
    weights?: Record<string, number>;
  }
) {
  const results = await executeAgentsInParallel(agents, task, {});
  
  // Aggregate results based on consensus mode
  switch (options.consensusMode) {
    case "majority":
      return getMajorityResult(results);
    case "unanimous":
      return getUnanimousResult(results);
    case "weighted":
      return getWeightedResult(results, options.weights ?? {});
  }
}
```

### v6 Agent Middleware

Intercept and modify agent behavior:

```typescript
// lib/ai/middleware/logging-middleware.ts
import { defineMiddleware } from "ai";

// v6: Middleware for agent observability
export const loggingMiddleware = defineMiddleware({
  name: "logging",
  
  // Intercept before agent runs
  beforeRun: async ({ messages, context }) => {
    console.log(`[Agent] Starting run with ${messages.length} messages`);
    return { messages, context };
  },
  
  // Intercept tool calls
  beforeToolCall: async ({ tool, args, context }) => {
    console.log(`[Agent] Tool call: ${tool}`, args);
    await logToolCall(context.agentId, tool, args);
    return { tool, args };
  },
  
  // Intercept after tool execution
  afterToolCall: async ({ tool, args, result, duration }) => {
    console.log(`[Agent] Tool result (${duration}ms):`, result);
    return result;
  },
  
  // Intercept after run completes
  afterRun: async ({ result, duration, tokensUsed }) => {
    console.log(`[Agent] Run complete: ${duration}ms, ${tokensUsed} tokens`);
    await logAgentRun(result, duration, tokensUsed);
    return result;
  },
});

// v6: Apply middleware to agents
export function createAgentWithLogging(config: AgentConfig) {
  return agent({
    ...config,
    middleware: [loggingMiddleware],
  });
}
```

---

## Agent Experience Architecture

### Agent Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                      Agent Lifecycle                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. CREATION                                                     │
│     └─> AgentBuilder UI → agents table                          │
│                                                                  │
│  2. CONFIGURATION                                                │
│     └─> Model, Tools, Persona, Memory settings                  │
│                                                                  │
│  3. ACTIVATION                                                   │
│     └─> Agent joins workspace, loads context                    │
│                                                                  │
│  4. CONVERSATION                                                 │
│     └─> User interacts via AgentChat                            │
│     └─> Messages stored in agentConversations/agentMessages     │
│                                                                  │
│  5. EXECUTION                                                    │
│     └─> Agent performs tasks with tools                         │
│     └─> Actions logged to agentActions                          │
│                                                                  │
│  6. MEMORY                                                       │
│     └─> Important facts → agentMemories                         │
│     └─> Conversation context preserved                          │
│                                                                  │
│  7. DELEGATION (if multi-agent)                                  │
│     └─> Agent hands off to another agent                        │
│     └─> Context transferred, conversation continues             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Agent Types (Persona Templates)

Pre-built agent templates users can instantiate:

```typescript
const agentTemplates: AgentTemplate[] = [
  {
    id: "research-agent",
    name: "Research Agent",
    role: "User Researcher",
    avatar: "🔍",
    description: "Analyzes transcripts, extracts insights, identifies patterns in user feedback",
    defaultModel: "claude-sonnet-4-20250514",
    defaultProvider: "anthropic",
    enabledTools: ["searchKnowledge", "extractInsights", "createDocument"],
    systemPromptTemplate: `You are a meticulous user researcher. Your job is to:
- Extract verbatim quotes and insights from user feedback
- Identify patterns and themes across multiple signals
- Prioritize problems by severity and frequency
- Connect feedback to existing initiatives

Always cite your sources with exact quotes.`,
    suggestedTeams: ["discovery-team"],
  },
  {
    id: "prd-writer",
    name: "PRD Writer",
    role: "Product Manager",
    avatar: "📝",
    description: "Creates comprehensive PRDs from research and requirements",
    defaultModel: "claude-sonnet-4-20250514",
    defaultProvider: "anthropic",
    enabledTools: ["getProjectContext", "createDocument", "searchKnowledge"],
    systemPromptTemplate: `You are an experienced product manager who writes clear, actionable PRDs.

Structure every PRD with:
1. Problem Statement (with user quotes)
2. Target Personas
3. Success Metrics
4. User Journey
5. MVP Scope
6. Out of Scope
7. Open Questions

Be specific. Avoid vague requirements.`,
    suggestedTeams: ["discovery-team", "documentation-team"],
  },
  {
    id: "prototype-agent",
    name: "Prototype Agent",
    role: "Design Engineer",
    avatar: "🎨",
    description: "Builds functional prototypes from PRDs and design briefs",
    defaultModel: "claude-sonnet-4-20250514",
    defaultProvider: "anthropic",
    enabledTools: ["getProjectContext", "createPrototype", "writeCode"],
    systemPromptTemplate: `You are a design engineer who builds functional prototypes.

When building prototypes:
- Use React + TypeScript + Tailwind CSS
- Follow existing design system patterns
- Create Storybook stories for all components
- Focus on the core user flow first
- Make it interactive and clickable`,
    suggestedTeams: ["build-team"],
  },
  {
    id: "reviewer-agent",
    name: "Reviewer Agent",
    role: "Quality Reviewer",
    avatar: "✅",
    description: "Reviews documents and prototypes for completeness and quality",
    defaultModel: "claude-sonnet-4-20250514",
    defaultProvider: "anthropic",
    enabledTools: ["getProjectContext", "createDocument", "searchKnowledge"],
    systemPromptTemplate: `You are a thorough reviewer who ensures quality and completeness.

When reviewing:
- Check alignment with product vision
- Identify gaps or missing information
- Suggest specific improvements
- Validate against personas
- Score on a 1-10 scale with reasoning`,
    suggestedTeams: ["review-team"],
  },
];
```

### Team Configurations

Pre-built team workflows:

```typescript
const teamTemplates: TeamTemplate[] = [
  {
    id: "discovery-team",
    name: "Discovery Team",
    description: "End-to-end discovery workflow from research to validated PRD",
    consensusMode: "sequential",
    workflow: [
      { agentTemplate: "research-agent", step: 1, handoffCondition: "insights_extracted" },
      { agentTemplate: "prd-writer", step: 2, handoffCondition: "prd_drafted" },
      { agentTemplate: "reviewer-agent", step: 3, handoffCondition: "review_complete" },
    ],
  },
  {
    id: "validation-team",
    name: "Validation Team",
    description: "Multi-persona jury evaluation",
    consensusMode: "parallel",
    workflow: [
      // All personas evaluate in parallel
      { agentTemplate: "reviewer-agent", personaOverride: "maya-solo-pm" },
      { agentTemplate: "reviewer-agent", personaOverride: "raj-eng-lead" },
      { agentTemplate: "reviewer-agent", personaOverride: "alex-founder" },
    ],
    aggregation: "majority-vote",
  },
];
```

---

## UI Component Specifications

### 1. Agent Dashboard

Main view for managing agents:

```tsx
// app/(dashboard)/workspace/[id]/agents/page.tsx

export default function AgentsPage() {
  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agents</h1>
          <p className="text-muted-foreground">
            Your AI team members
          </p>
        </div>
        <Button onClick={() => setShowCreateAgent(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Agent
        </Button>
      </div>
      
      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
        
        {/* Template suggestions */}
        {agents.length < 3 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-full p-6">
              <Sparkles className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground text-center">
                Add agents from templates
              </p>
              <Button variant="link" size="sm">
                Browse templates
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Teams section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Teams</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      </div>
      
      {/* Agent Builder Dialog */}
      <AgentBuilderDialog 
        open={showCreateAgent} 
        onOpenChange={setShowCreateAgent}
      />
    </div>
  );
}
```

### 2. Agent Builder Dialog

Full agent configuration UI:

```tsx
// components/agents/AgentBuilderDialog.tsx

export function AgentBuilderDialog({ open, onOpenChange, template }: Props) {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<AgentConfig>(
    template ? templateToConfig(template) : defaultConfig
  );
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {template ? `Create ${template.name}` : "Create Agent"}
          </DialogTitle>
          <DialogDescription>
            Step {step} of 4
          </DialogDescription>
        </DialogHeader>
        
        {/* Step indicators */}
        <div className="flex gap-2 mb-4">
          {["Identity", "Model", "Tools", "Behavior"].map((label, i) => (
            <div
              key={label}
              className={cn(
                "flex-1 h-1 rounded-full",
                i + 1 <= step ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
        
        {/* Step content */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex gap-4">
              {/* Avatar picker */}
              <div className="shrink-0">
                <Label>Avatar</Label>
                <AvatarPicker
                  value={config.avatar}
                  onChange={(avatar) => setConfig({ ...config, avatar })}
                />
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={config.name}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    placeholder="Research Assistant"
                  />
                </div>
                
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={config.role}
                    onChange={(e) => setConfig({ ...config, role: e.target.value })}
                    placeholder="User Researcher"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={config.description}
                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                placeholder="What does this agent do?"
                rows={2}
              />
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label>Provider</Label>
              <Select
                value={config.provider}
                onValueChange={(provider) => setConfig({ ...config, provider })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="anthropic">
                    <div className="flex items-center gap-2">
                      <img src="/icons/anthropic.svg" className="w-4 h-4" />
                      Anthropic (Claude)
                    </div>
                  </SelectItem>
                  <SelectItem value="openai">
                    <div className="flex items-center gap-2">
                      <img src="/icons/openai.svg" className="w-4 h-4" />
                      OpenAI (GPT-4)
                    </div>
                  </SelectItem>
                  <SelectItem value="google">
                    <div className="flex items-center gap-2">
                      <img src="/icons/google.svg" className="w-4 h-4" />
                      Google (Gemini)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Model</Label>
              <Select
                value={config.model}
                onValueChange={(model) => setConfig({ ...config, model })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {modelsForProvider[config.provider].map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{model.name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {model.tier}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Temperature: {config.temperature}</Label>
              <Slider
                value={[config.temperature]}
                onValueChange={([temperature]) => setConfig({ ...config, temperature })}
                min={0}
                max={1}
                step={0.1}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Lower = more focused, Higher = more creative
              </p>
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <Label>Enabled Tools</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Select which tools this agent can use
              </p>
              <div className="grid grid-cols-2 gap-2">
                {availableTools.map((tool) => (
                  <div
                    key={tool.id}
                    className={cn(
                      "flex items-start gap-2 p-3 rounded-lg border cursor-pointer transition-colors",
                      config.enabledTools.includes(tool.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => toggleTool(tool.id)}
                  >
                    <Checkbox checked={config.enabledTools.includes(tool.id)} />
                    <div>
                      <p className="text-sm font-medium">{tool.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label>Can Delegate To</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Allow this agent to hand off tasks to other agents
              </p>
              <MultiSelect
                options={otherAgents.map((a) => ({ value: a.id, label: a.name }))}
                value={config.canDelegateTo}
                onChange={(value) => setConfig({ ...config, canDelegateTo: value })}
              />
            </div>
          </div>
        )}
        
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <Label>System Prompt</Label>
              <Textarea
                value={config.systemPrompt}
                onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
                rows={8}
                className="font-mono text-sm"
                placeholder="You are a helpful assistant..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                This defines the agent's personality and behavior
              </p>
            </div>
            
            <div>
              <Label>Memory Type</Label>
              <Select
                value={config.memoryType}
                onValueChange={(memoryType) => setConfig({ ...config, memoryType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (stateless)</SelectItem>
                  <SelectItem value="conversation">Conversation History</SelectItem>
                  <SelectItem value="semantic">Semantic Memory (Vector)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        <DialogFooter>
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {step < 4 ? (
            <Button onClick={() => setStep(step + 1)}>
              Next
            </Button>
          ) : (
            <Button onClick={handleCreate}>
              Create Agent
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### 3. Full-Screen Agent Chat View

Dedicated page for focused agent interaction:

```tsx
// app/(dashboard)/workspace/[id]/chat/[agentId]/page.tsx

export default function AgentChatPage({ params }: Props) {
  const { agentId, id: workspaceId } = params;
  const agent = useAgent(agentId);
  const { projectId } = useSearchParams();
  
  if (!agent) return <AgentNotFound />;
  
  return (
    <div className="h-screen flex">
      {/* Sidebar with agent info and history */}
      <aside className="w-80 border-r border-border flex flex-col">
        {/* Agent profile */}
        <div className="p-4 border-b border-border">
          <AgentPresenceBadge agent={agent} size="lg" />
          <p className="text-sm text-muted-foreground mt-2">
            {agent.description}
          </p>
          
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" className="flex-1">
              <Settings className="w-4 h-4 mr-1" />
              Configure
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <History className="w-4 h-4 mr-1" />
              History
            </Button>
          </div>
        </div>
        
        {/* Recent conversations */}
        <div className="flex-1 overflow-auto">
          <div className="p-4">
            <h3 className="text-sm font-medium mb-2">Recent Conversations</h3>
            <div className="space-y-2">
              {conversations.map((conv) => (
                <ConversationItem key={conv.id} conversation={conv} />
              ))}
            </div>
          </div>
        </div>
        
        {/* Context selector */}
        <div className="p-4 border-t border-border">
          <Label className="text-xs">Context</Label>
          <ProjectSelector
            value={projectId}
            onChange={setProjectId}
            placeholder="All workspace"
          />
        </div>
      </aside>
      
      {/* Main chat area */}
      <main className="flex-1 flex flex-col">
        <AgentChat
          agent={agent}
          workspaceId={workspaceId}
          projectId={projectId}
          className="flex-1"
        />
      </main>
      
      {/* Right panel for context/artifacts */}
      <aside className="w-80 border-l border-border">
        <Tabs defaultValue="context">
          <TabsList className="w-full">
            <TabsTrigger value="context" className="flex-1">Context</TabsTrigger>
            <TabsTrigger value="artifacts" className="flex-1">Artifacts</TabsTrigger>
            <TabsTrigger value="memory" className="flex-1">Memory</TabsTrigger>
          </TabsList>
          
          <TabsContent value="context">
            <AgentContextPanel agent={agent} projectId={projectId} />
          </TabsContent>
          
          <TabsContent value="artifacts">
            <AgentArtifactsPanel agent={agent} />
          </TabsContent>
          
          <TabsContent value="memory">
            <AgentMemoryPanel agent={agent} />
          </TabsContent>
        </Tabs>
      </aside>
    </div>
  );
}
```

### 4. Floating Agent Widget

Always-available agent access:

```tsx
// components/agents/FloatingAgentWidget.tsx

export function FloatingAgentWidget({ workspaceId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const agents = useWorkspaceAgents(workspaceId);
  
  return (
    <>
      {/* Floating button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageSquare className="w-6 h-6" />
          )}
        </Button>
      </motion.div>
      
      {/* Agent picker / chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-[400px] h-[600px] bg-background border border-border rounded-xl shadow-2xl overflow-hidden z-50"
          >
            {activeAgent ? (
              <>
                {/* Chat header with back button */}
                <div className="flex items-center gap-2 p-3 border-b border-border">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setActiveAgent(null)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <AgentPresenceBadge agent={activeAgent} size="sm" />
                </div>
                
                {/* Chat */}
                <AgentChat
                  agent={activeAgent}
                  workspaceId={workspaceId}
                  className="h-[calc(100%-56px)]"
                />
              </>
            ) : (
              <>
                {/* Agent selector */}
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold">Talk to an agent</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose an agent to start a conversation
                  </p>
                </div>
                
                <ScrollArea className="h-[calc(100%-80px)]">
                  <div className="p-4 space-y-2">
                    {agents.map((agent) => (
                      <button
                        key={agent.id}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                        onClick={() => setActiveAgent(agent)}
                      >
                        <AgentPresenceBadge agent={agent} size="sm" />
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {agent.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

---

## Database Schema Changes

See the [previous architecture document](./multi-agent-team-architecture.md) for full schema details. Key additions:

```sql
-- Agents table
CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  workspace_id TEXT REFERENCES workspaces(id),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  persona TEXT,
  avatar TEXT,
  model TEXT DEFAULT 'claude-sonnet-4-20250514',
  provider TEXT DEFAULT 'anthropic',
  temperature REAL DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 4096,
  system_prompt_template TEXT,
  enabled_tools JSONB DEFAULT '[]',
  can_delegate_to JSONB DEFAULT '[]',
  memory_type TEXT DEFAULT 'conversation',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Agent conversations
CREATE TABLE agent_conversations (
  id TEXT PRIMARY KEY,
  workspace_id TEXT REFERENCES workspaces(id),
  project_id TEXT REFERENCES projects(id),
  agent_ids JSONB NOT NULL,
  title TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Agent messages
CREATE TABLE agent_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT REFERENCES agent_conversations(id),
  role TEXT NOT NULL, -- 'user' | 'assistant' | 'system' | 'tool'
  agent_id TEXT REFERENCES agents(id),
  content TEXT NOT NULL,
  tool_invocations JSONB,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL
);

-- Agent memories (semantic)
CREATE TABLE agent_memories (
  id TEXT PRIMARY KEY,
  agent_id TEXT REFERENCES agents(id),
  workspace_id TEXT REFERENCES workspaces(id),
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  embedding vector(1536),
  importance REAL DEFAULT 0.5,
  created_at TIMESTAMP NOT NULL
);

-- Agent teams
CREATE TABLE agent_teams (
  id TEXT PRIMARY KEY,
  workspace_id TEXT REFERENCES workspaces(id),
  name TEXT NOT NULL,
  orchestrator_agent_id TEXT REFERENCES agents(id),
  consensus_mode TEXT DEFAULT 'orchestrator',
  created_at TIMESTAMP NOT NULL
);
```

---

## Implementation Phases

### Phase 1: AI SDK v6 Foundation (Week 1-2)

1. Install AI SDK v6: `npm install ai@6 @ai-sdk/anthropic @ai-sdk/openai @ai-sdk/google`
2. Create provider abstraction layer with v6 patterns
3. Create first `agent()` definition (PM Agent)
4. Implement `/api/chat` with `toAgentStream()`
5. Create `useAgentChat` hook wrapping v6 `useAgent`
6. Add basic tool definitions with streaming

### Phase 2: Agent Entity & Database (Week 3-4)

1. Create agents schema and migrations
2. Build Agent CRUD API (`/api/agents`)
3. Create `AgentBuilderDialog` with 4-step wizard
4. Create `AgentCard` components
5. Add agent templates (Research, PM, Prototype, Reviewer)
6. Implement agent enable/disable toggle

### Phase 3: A2UI Components (Week 5-6)

1. Create `AgentPresenceBadge` with status indicators
2. Create `AgentThinkingPanel` with v6 step tracking
3. Create `AgentActionCard` with streaming tool output
4. Create full `AgentChat` component with v6 integration
5. Add progress indicators for multi-step execution
6. Implement error handling with retry support

### Phase 4: Threads & Memory (Week 7-8)

1. Create `agent_conversations` and `agent_messages` schema
2. Implement v6 thread management API
3. Create `useWorkspaceThreads` hook
4. Add conversation history sidebar
5. Implement semantic memory with pgvector
6. Create `AgentMemoryPanel` UI

### Phase 5: Multi-Agent Orchestration (Week 9-10)

1. Create team schema (`agent_teams`, `agent_team_members`)
2. Build `createOrchestratorAgent` with delegation tools
3. Implement parallel agent execution
4. Create `AgentTeamPanel` UI showing agent collaboration
5. Add consensus/voting mechanisms
6. Implement v6 middleware for logging/observability

### Phase 6: Polish & Advanced Features (Week 11-12)

1. `FloatingAgentWidget` for always-available access
2. Full-screen chat view with context panels
3. Agent marketplace with templates
4. Performance optimization (caching, connection pooling)
5. Comprehensive documentation
6. End-to-end testing for agent workflows

---

## File Structure

```
orchestrator/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts          # Streaming chat endpoint
│   │   └── agents/
│   │       ├── route.ts          # Agent CRUD
│   │       ├── [id]/
│   │       │   └── route.ts      # Single agent operations
│   │       └── team/
│   │           └── route.ts      # Multi-agent orchestration
│   └── (dashboard)/
│       └── workspace/
│           └── [id]/
│               ├── agents/
│               │   └── page.tsx  # Agent dashboard
│               └── chat/
│                   └── [agentId]/
│                       └── page.tsx # Full-screen chat
├── components/
│   └── agents/
│       ├── AgentPresenceBadge.tsx
│       ├── AgentThinkingPanel.tsx
│       ├── AgentActionCard.tsx
│       ├── AgentChat.tsx
│       ├── AgentCard.tsx
│       ├── AgentBuilderDialog.tsx
│       ├── AgentTeamPanel.tsx
│       ├── FloatingAgentWidget.tsx
│       └── index.ts
├── hooks/
│   ├── useAgentChat.ts
│   ├── useAgent.ts
│   └── useWorkspaceAgents.ts
└── lib/
    └── ai/
        ├── providers.ts          # Provider abstraction
        └── tools.ts              # Tool definitions
```

---

## Summary

This specification outlines a complete conversion from single-agent to multi-agent including:

- **Google A2UI patterns**: Agent presence, transparency, control, collaboration
- **Vercel AI SDK v6**: 
  - `agent()` function for declarative agent definition
  - `useAgent` hook for React integration
  - `toAgentStream()` for streaming responses
  - Streaming tool execution with generators
  - Built-in thread/conversation management
  - Multi-agent orchestration with delegation
  - Middleware support for observability
- **Full UI components**: Agent builder, chat, teams, floating widget
- **Database schema**: Agents, conversations, memories, teams
- **12-week implementation plan**

### v6 Key Benefits Over v5

| Feature | v5 | v6 |
|---------|----|----|
| Agent Definition | Manual with `streamText` | Declarative `agent()` |
| React Hooks | `useChat` (chat-focused) | `useAgent` (agent-focused) |
| Tool Streaming | Post-execution only | Generator-based live streaming |
| Threads | Manual implementation | Built-in thread management |
| Multi-Agent | Custom orchestration | Native delegation support |
| Observability | Custom callbacks | Middleware pattern |
| Context Sharing | Manual prop drilling | Automatic context injection |

The result is a first-class multi-agent experience where users can create, configure, and collaborate with specialized AI agents that work together as a team, powered by Vercel AI SDK v6's native agent primitives.
