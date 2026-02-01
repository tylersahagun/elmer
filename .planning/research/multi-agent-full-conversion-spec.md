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
| AI SDK | `@anthropic-ai/sdk` (direct) | `ai` (Vercel AI SDK v5) |
| Chat UI | Custom `ChatSidebar` | A2UI-pattern `AgentChat` |
| Streaming | None | `useChat` + Server-Sent Events |
| Multi-Provider | Claude only | Claude, GPT-4, Gemini |
| Tool Execution | Custom `executeTool` | AI SDK `tools` with streaming |
| Agent Memory | Basic `memoryEntries` | Semantic vector + conversation |

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

## Vercel AI SDK Integration

### Installation

```bash
cd orchestrator
npm install ai @ai-sdk/anthropic @ai-sdk/openai
```

### Core Concepts

The Vercel AI SDK v5 provides:

1. **Unified Provider Interface** - Same API for Claude, GPT-4, Gemini
2. **Streaming First** - `streamText`, `streamObject` for real-time responses
3. **Tool Execution** - Built-in tool calling with streaming
4. **React Hooks** - `useChat`, `useCompletion`, `useObject`
5. **Multi-Step Agents** - `maxSteps` for autonomous tool loops

### Provider Setup

```typescript
// lib/ai/providers.ts
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";

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
  google: "gemini-1.5-pro",
};
```

### Streaming Chat API

Replace the current `/api/chat/route.ts` with streaming:

```typescript
// app/api/chat/route.ts
import { streamText, convertToCoreMessages, tool } from "ai";
import { z } from "zod";
import { getModel } from "@/lib/ai/providers";
import { getWorkspaceContext, getProjectContext } from "@/lib/context/resolve";

export async function POST(req: Request) {
  const { messages, workspaceId, projectId, agentConfig } = await req.json();

  // Get agent configuration (defaults if not specified)
  const provider = agentConfig?.provider ?? "anthropic";
  const modelId = agentConfig?.model ?? "claude-sonnet-4-20250514";
  const temperature = agentConfig?.temperature ?? 0.7;
  
  // Build context
  const workspaceContext = await getWorkspaceContext(workspaceId);
  const projectContext = projectId ? await getProjectContext(projectId) : "";
  
  // Define tools available to the agent
  const tools = {
    getProjectStatus: tool({
      description: "Get the current status of a project",
      parameters: z.object({
        projectId: z.string().describe("The project ID to check"),
      }),
      execute: async ({ projectId }) => {
        const project = await getProject(projectId);
        return {
          name: project?.name,
          stage: project?.stage,
          status: project?.status,
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
    
    delegateToAgent: tool({
      description: "Delegate a task to another specialized agent",
      parameters: z.object({
        agentId: z.string().describe("The ID of the agent to delegate to"),
        task: z.string().describe("Description of the task to delegate"),
        context: z.string().optional().describe("Additional context for the agent"),
      }),
      execute: async ({ agentId, task, context }) => {
        // Create a job for the delegated agent
        const job = await createAgentJob(agentId, { task, context });
        return { 
          delegated: true, 
          jobId: job.id,
          message: `Task delegated to agent. Job ID: ${job.id}`,
        };
      },
    }),
    
    searchKnowledge: tool({
      description: "Search the workspace knowledge base",
      parameters: z.object({
        query: z.string().describe("Search query"),
        limit: z.number().optional().default(5),
      }),
      execute: async ({ query, limit }) => {
        const results = await searchKnowledgeBase(workspaceId, query, limit);
        return results;
      },
    }),
  };

  // Build system prompt with agent persona
  const systemPrompt = agentConfig?.systemPrompt ?? `You are a helpful PM assistant.

## Workspace Context
${workspaceContext}

${projectContext ? `## Project Context\n${projectContext}` : ""}

Be concise and actionable. Use markdown for formatting.`;

  // Stream the response
  const result = streamText({
    model: getModel(provider, modelId),
    system: systemPrompt,
    messages: convertToCoreMessages(messages),
    tools,
    temperature,
    maxSteps: 5, // Allow up to 5 tool calls in a single turn
    
    // Callbacks for logging/tracking
    onStepFinish: ({ stepType, toolCalls, toolResults }) => {
      if (stepType === "tool-result") {
        console.log("Tool calls:", toolCalls);
        console.log("Tool results:", toolResults);
      }
    },
  });

  return result.toDataStreamResponse();
}
```

### React Hook Integration

Create a custom hook that wraps `useChat` with agent awareness:

```typescript
// hooks/useAgentChat.ts
"use client";

import { useChat, type Message } from "ai/react";
import { useState, useCallback, useMemo } from "react";
import type { Agent } from "@/lib/db/schema";

interface AgentChatOptions {
  agent: Agent;
  workspaceId: string;
  projectId?: string;
  onToolCall?: (toolCall: ToolCall) => void;
  onAgentThinking?: (thinking: AgentThinkingState) => void;
  onDelegation?: (delegation: AgentDelegation) => void;
}

interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
  result?: unknown;
  status: "pending" | "running" | "complete" | "failed";
}

interface AgentThinkingState {
  stage: string;
  currentStep: string;
  reasoning?: string;
}

interface AgentDelegation {
  fromAgentId: string;
  toAgentId: string;
  task: string;
  jobId: string;
}

export function useAgentChat({
  agent,
  workspaceId,
  projectId,
  onToolCall,
  onAgentThinking,
  onDelegation,
}: AgentChatOptions) {
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
  const [thinking, setThinking] = useState<AgentThinkingState | null>(null);
  
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
    stop,
    append,
    setMessages,
  } = useChat({
    api: "/api/chat",
    body: {
      workspaceId,
      projectId,
      agentConfig: {
        provider: agent.provider,
        model: agent.model,
        temperature: agent.temperature,
        systemPrompt: agent.systemPromptTemplate,
      },
    },
    
    // Handle streaming events
    onResponse: (response) => {
      // Agent started responding
      setThinking({
        stage: "generating",
        currentStep: "Generating response...",
      });
    },
    
    onToolCall: ({ toolCall }) => {
      // Track tool calls for transparency
      const newToolCall: ToolCall = {
        id: toolCall.toolCallId,
        name: toolCall.toolName,
        args: toolCall.args as Record<string, unknown>,
        status: "running",
      };
      
      setToolCalls((prev) => [...prev, newToolCall]);
      onToolCall?.(newToolCall);
      
      // Update thinking state
      setThinking({
        stage: "acting",
        currentStep: `Executing ${toolCall.toolName}...`,
        reasoning: `Using ${toolCall.toolName} to ${getToolDescription(toolCall.toolName)}`,
      });
      
      // Check for delegation
      if (toolCall.toolName === "delegateToAgent") {
        const args = toolCall.args as { agentId: string; task: string };
        // We'll get the jobId from the result
      }
    },
    
    onFinish: (message) => {
      setThinking(null);
      
      // Update tool call statuses
      setToolCalls((prev) =>
        prev.map((tc) => ({
          ...tc,
          status: tc.status === "running" ? "complete" : tc.status,
        }))
      );
    },
    
    onError: (error) => {
      setThinking(null);
      console.error("Chat error:", error);
    },
  });
  
  // Enhanced submit that clears tool calls
  const submitMessage = useCallback(
    (e?: React.FormEvent) => {
      setToolCalls([]);
      handleSubmit(e);
    },
    [handleSubmit]
  );
  
  // Quick actions for common tasks
  const quickActions = useMemo(() => {
    return agent.enabledTools?.map((tool) => ({
      label: getToolLabel(tool),
      description: getToolDescription(tool),
      execute: () => {
        append({
          role: "user",
          content: getToolPrompt(tool),
        });
      },
    })) ?? [];
  }, [agent.enabledTools, append]);
  
  return {
    messages,
    input,
    handleInputChange,
    handleSubmit: submitMessage,
    isLoading,
    error,
    reload,
    stop,
    append,
    setMessages,
    
    // Agent-specific state
    agent,
    toolCalls,
    thinking,
    quickActions,
    
    // Computed state
    isThinking: thinking !== null,
    hasActiveToolCalls: toolCalls.some((tc) => tc.status === "running"),
  };
}
```

### Agent Chat Component

Full A2UI-pattern chat component:

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
import { 
  Send, 
  Loader2, 
  Square, 
  Sparkles,
  Bot,
  User,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Agent } from "@/lib/db/schema";
import ReactMarkdown from "react-markdown";

interface AgentChatProps {
  agent: Agent;
  workspaceId: string;
  projectId?: string;
  className?: string;
}

export function AgentChat({ agent, workspaceId, projectId, className }: AgentChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    thinking,
    toolCalls,
    quickActions,
    isThinking,
  } = useAgentChat({
    agent,
    workspaceId,
    projectId,
  });
  
  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);
  
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
      {/* Agent header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <AgentPresenceBadge 
          agent={{
            avatar: agent.avatar ?? undefined,
            name: agent.name,
            role: agent.role,
            statusIndicator: isThinking ? "thinking" : isLoading ? "acting" : "idle",
            currentTask: thinking?.currentStep,
          }}
        />
        
        {isLoading && (
          <Button variant="ghost" size="sm" onClick={stop}>
            <Square className="w-4 h-4 mr-1" />
            Stop
          </Button>
        )}
      </div>
      
      {/* Messages area */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="p-4 space-y-4">
          {/* Welcome message if no messages */}
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 mx-auto mb-4 flex items-center justify-center">
                <Bot className="w-8 h-8 text-purple-500" />
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
                      ? "bg-purple-500/10 text-right"
                      : "bg-muted/50"
                  )}>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  </div>
                  
                  {/* Tool call attachments for assistant messages */}
                  {message.role === "assistant" && message.toolInvocations && (
                    <div className="mt-2 space-y-2">
                      {message.toolInvocations.map((invocation) => (
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
                            toolInput: invocation.args as Record<string, unknown>,
                            toolOutput: invocation.result,
                            status: invocation.result ? "complete" : "running",
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
          
          {/* Thinking indicator */}
          {thinking && (
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
                    stage: "analyzing" as const,
                    currentStep: thinking.currentStep,
                    stepsCompleted: toolCalls.filter(tc => tc.status === "complete").length,
                    totalSteps: Math.max(1, toolCalls.length),
                    reasoning: thinking.reasoning,
                    toolsUsed: toolCalls.map(tc => ({
                      name: tc.name,
                      status: tc.status,
                      input: tc.args,
                      output: tc.result,
                    })),
                  }}
                />
              </div>
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
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${agent.name}...`}
            className="min-h-[44px] max-h-[200px] resize-none"
            rows={1}
          />
          <Button type="submit" disabled={!input.trim() || isLoading}>
            {isLoading ? (
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
                disabled={isLoading}
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

### Multi-Agent Streaming

For multi-agent workflows with streaming:

```typescript
// app/api/agents/team/route.ts
import { streamText, convertToCoreMessages } from "ai";
import { getModel } from "@/lib/ai/providers";

export async function POST(req: Request) {
  const { messages, teamId, workspaceId, task } = await req.json();
  
  // Get team configuration
  const team = await getTeam(teamId);
  const orchestrator = team.agents.find(a => a.id === team.orchestratorAgentId);
  
  // Create orchestrator tools that can delegate to team members
  const delegationTools = Object.fromEntries(
    team.agents
      .filter(a => a.id !== orchestrator?.id)
      .map(agent => [
        `delegateTo${agent.name.replace(/\s/g, '')}`,
        tool({
          description: `Delegate a task to ${agent.name} (${agent.role}). ${agent.description}`,
          parameters: z.object({
            task: z.string().describe("The task to delegate"),
            context: z.string().optional().describe("Additional context"),
          }),
          execute: async ({ task, context }) => {
            // Execute the agent and return result
            const result = await executeAgent(agent, task, context);
            return result;
          },
        }),
      ])
  );
  
  // Orchestrator decides how to handle the task
  const result = streamText({
    model: getModel(orchestrator!.provider, orchestrator!.model),
    system: orchestrator!.systemPromptTemplate,
    messages: convertToCoreMessages([
      ...messages,
      {
        role: "user",
        content: `Task: ${task}\n\nYou have a team of agents available. Decide how to handle this task - you can do it yourself or delegate to team members.`,
      },
    ]),
    tools: delegationTools,
    maxSteps: 10, // Allow multiple delegation rounds
  });
  
  return result.toDataStreamResponse();
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

### Phase 1: Foundation (Week 1-2)

1. Install Vercel AI SDK: `npm install ai @ai-sdk/anthropic @ai-sdk/openai`
2. Create provider abstraction layer
3. Migrate `/api/chat` to streaming with `streamText`
4. Update `ChatSidebar` to use `useChat` hook
5. Add basic tool support

### Phase 2: Agent Entity (Week 3-4)

1. Create agents schema and migrations
2. Build Agent CRUD API
3. Create `AgentBuilderDialog` UI
4. Create `AgentCard` components
5. Add agent templates

### Phase 3: A2UI Components (Week 5-6)

1. Create `AgentPresenceBadge`
2. Create `AgentThinkingPanel`
3. Create `AgentActionCard`
4. Create full `AgentChat` component
5. Add streaming indicators

### Phase 4: Conversations & Memory (Week 7-8)

1. Create conversation/message schema
2. Build conversation persistence
3. Add conversation history UI
4. Implement semantic memory with pgvector
5. Add memory management UI

### Phase 5: Multi-Agent (Week 9-10)

1. Create team schema
2. Build orchestration API
3. Implement delegation tools
4. Create `AgentTeamPanel` UI
5. Add team configuration

### Phase 6: Polish (Week 11-12)

1. `FloatingAgentWidget`
2. Full-screen chat view
3. Agent marketplace/templates
4. Performance optimization
5. Documentation

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
- **Vercel AI SDK v5**: Streaming, multi-provider, tool execution
- **Full UI components**: Agent builder, chat, teams, floating widget
- **Database schema**: Agents, conversations, memories, teams
- **12-week implementation plan**

The result is a first-class multi-agent experience where users can create, configure, and collaborate with specialized AI agents that work together as a team.
