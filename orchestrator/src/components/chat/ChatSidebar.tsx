"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/glass";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useKanbanStore, useUIStore } from "@/lib/store";
import { springPresets, staggerContainer, staggerItem } from "@/lib/animations";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Sparkles,
  Loader2,
  User,
  Bot,
  X,
  Terminal,
  FileText,
  Layers,
  Users,
  BarChart3,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
  jobId?: string; // If this message created a job
  jobStatus?: "pending" | "running" | "completed" | "failed";
}

// Slash commands definition
const SLASH_COMMANDS = [
  {
    command: "/pm",
    label: "Generate PRD",
    icon: FileText,
    description: "Generate a PRD for a project",
    jobType: "generate_prd",
    requiresProject: true,
  },
  {
    command: "/proto",
    label: "Build Prototype",
    icon: Layers,
    description: "Build a Storybook prototype",
    jobType: "build_prototype",
    requiresProject: true,
  },
  {
    command: "/validate",
    label: "Run Validation",
    icon: Users,
    description: "Run jury evaluation",
    jobType: "run_jury_evaluation",
    requiresProject: true,
  },
  {
    command: "/status",
    label: "Project Status",
    icon: BarChart3,
    description: "Get project status overview",
    jobType: null,
    requiresProject: false,
  },
  {
    command: "/score",
    label: "Score Alignment",
    icon: CheckCircle,
    description: "Score stage alignment",
    jobType: "score_stage_alignment",
    requiresProject: true,
  },
];

const QUICK_ACTIONS = [
  { label: "Project status", prompt: "/status" },
  { label: "Next steps", prompt: "What should I focus on next?" },
  { label: "Run PRD", prompt: "/pm" },
  { label: "Build prototype", prompt: "/proto" },
];

export function ChatSidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const openJobLogsDrawer = useUIStore((s) => s.openJobLogsDrawer);
  const activeProjectId = useKanbanStore((s) => s.activeProjectId);
  const workspace = useKanbanStore((s) => s.workspace);
  const projects = useKanbanStore((s) => s.projects);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Hi! I'm your PM assistant. I can help with project status, run commands, or answer questions.\n\n**Slash commands:**\n• `/pm` - Generate PRD\n• `/proto` - Build prototype\n• `/validate` - Run jury evaluation\n• `/status` - Project overview\n\nType `/` to see all commands.",
      timestamp: new Date(),
      suggestions: QUICK_ACTIONS.map((a) => a.label),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCommandPicker, setShowCommandPicker] = useState(false);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get active project
  const activeProject = useMemo(() => 
    projects.find(p => p.id === activeProjectId),
    [projects, activeProjectId]
  );

  // Filter commands based on input
  const filteredCommands = useMemo(() => {
    if (!input.startsWith("/")) return [];
    const query = input.slice(1).toLowerCase();
    return SLASH_COMMANDS.filter(cmd => 
      cmd.command.slice(1).startsWith(query) || 
      cmd.label.toLowerCase().includes(query)
    );
  }, [input]);

  // Show command picker when typing /
  useEffect(() => {
    setShowCommandPicker(input.startsWith("/") && filteredCommands.length > 0);
    setSelectedCommandIndex(0);
  }, [input, filteredCommands.length]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Parse slash command from input
  const parseSlashCommand = useCallback((text: string): { command: typeof SLASH_COMMANDS[0] | null; projectName: string | null } => {
    const parts = text.trim().split(/\s+/);
    const commandText = parts[0]?.toLowerCase();
    const command = SLASH_COMMANDS.find(c => c.command === commandText);
    const projectName = parts.slice(1).join(" ") || null;
    return { command: command || null, projectName };
  }, []);

  // Create job for a command
  const createJob = useCallback(async (jobType: string, projectId: string, projectName: string) => {
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          workspaceId: workspace?.id,
          type: jobType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create job");
      }

      const job = await response.json();
      
      // Open job logs drawer
      openJobLogsDrawer(job.id, projectName);
      
      return job;
    } catch (error) {
      throw error;
    }
  }, [workspace?.id, openJobLogsDrawer]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setShowCommandPicker(false);
    setIsLoading(true);

    try {
      // Check if it's a slash command
      const { command, projectName } = parseSlashCommand(userMessage.content);

      if (command) {
        // Handle /status command locally
        if (command.command === "/status") {
          const statusResponse = generateStatusResponse(projects);
          const assistantMessage: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: statusResponse,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
          setIsLoading(false);
          return;
        }

        // For job commands, we need a project
        if (command.jobType && command.requiresProject) {
          // Try to find project by name or use active project
          let targetProject = activeProject;
          
          if (projectName) {
            const matchedProject = projects.find(p => 
              p.name.toLowerCase().includes(projectName.toLowerCase())
            );
            if (matchedProject) {
              targetProject = matchedProject;
            }
          }

          if (!targetProject) {
            const assistantMessage: Message = {
              id: crypto.randomUUID(),
              role: "assistant",
              content: `❌ No project selected. Please select a project first or specify a project name:\n\n\`${command.command} [project name]\`\n\nActive projects:\n${projects.map(p => `• ${p.name}`).join("\n")}`,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
            setIsLoading(false);
            return;
          }

          // Create the job
          try {
            const job = await createJob(command.jobType, targetProject.id, targetProject.name);
            
            const assistantMessage: Message = {
              id: crypto.randomUUID(),
              role: "assistant",
              content: `✅ Started **${command.label}** for **${targetProject.name}**\n\nJob ID: \`${job.id}\`\n\nClick the notification to view progress.`,
              timestamp: new Date(),
              jobId: job.id,
              jobStatus: "running",
            };
            setMessages((prev) => [...prev, assistantMessage]);
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : "Unknown error";
            const assistantMessage: Message = {
              id: crypto.randomUUID(),
              role: "assistant",
              content: `❌ Failed to start job: ${errorMsg}`,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
          }
          
          setIsLoading(false);
          return;
        }
      }

      // Regular chat message - call API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          workspaceId: workspace?.id,
          activeProjectId: activeProject?.id,
          context: {
            projects: projects.map((p) => ({
              id: p.id,
              name: p.name,
              stage: p.stage,
              status: p.status,
            })),
            activeProject: activeProject ? {
              id: activeProject.id,
              name: activeProject.name,
              stage: activeProject.stage,
              status: activeProject.status,
            } : null,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
          suggestions: data.suggestions,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Fallback response
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: generateLocalResponse(userMessage.content, projects),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch {
      // Fallback response on error
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: generateLocalResponse(userMessage.content, projects),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCommand = (command: typeof SLASH_COMMANDS[0]) => {
    setInput(command.command + " ");
    setShowCommandPicker(false);
    inputRef.current?.focus();
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    if (prompt.startsWith("/")) {
      // If it's a slash command, show picker
      setShowCommandPicker(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showCommandPicker) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedCommandIndex(i => Math.min(i + 1, filteredCommands.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedCommandIndex(i => Math.max(i - 1, 0));
      } else if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedCommandIndex]) {
          handleSelectCommand(filteredCommands[selectedCommandIndex]);
        }
      } else if (e.key === "Escape") {
        setShowCommandPicker(false);
      }
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!sidebarOpen) return null;

  return (
    <>
      {/* Mobile overlay backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={toggleSidebar}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
      />
      
      <motion.aside
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={springPresets.snappy}
        className="fixed right-0 top-0 h-full w-full sm:w-[380px] lg:relative lg:w-[380px] border-l border-white/10 bg-white/95 dark:bg-slate-900/95 lg:bg-white/5 backdrop-blur-xl flex flex-col z-50 lg:z-auto lg:h-[calc(100vh-80px)]"
      >
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">AI Assistant</h2>
            <p className="text-xs text-muted-foreground">Ask about your projects</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-4"
        >
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                variants={staggerItem}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    message.role === "user"
                      ? "bg-purple-500/20"
                      : "bg-gradient-to-br from-teal-500/20 to-purple-500/20"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="w-4 h-4 text-purple-400" />
                  ) : (
                    <Bot className="w-4 h-4 text-teal-400" />
                  )}
                </div>

                {/* Message Content */}
                <div className={`flex-1 ${message.role === "user" ? "text-right" : ""}`}>
                  <GlassCard
                    className={`p-3 inline-block max-w-[280px] ${
                      message.role === "user" ? "bg-purple-500/10" : ""
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </GlassCard>

                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => handleQuickAction(
                            QUICK_ACTIONS.find((a) => a.label === suggestion)?.prompt || suggestion
                          )}
                          className="text-xs px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  <p className="text-[10px] text-muted-foreground mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500/20 to-purple-500/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-teal-400" />
              </div>
              <GlassCard className="p-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </motion.div>
      </ScrollArea>

      {/* Quick Actions */}
      <div className="px-4 py-2 border-t border-white/10">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {QUICK_ACTIONS.map((action, i) => (
            <button
              key={i}
              onClick={() => handleQuickAction(action.prompt)}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input with Command Picker */}
      <div className="p-4 border-t border-white/10 relative">
        {/* Command Picker */}
        <AnimatePresence>
          {showCommandPicker && filteredCommands.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-4 right-4 mb-2 p-2 rounded-lg bg-slate-900/95 border border-white/10 backdrop-blur-xl shadow-xl"
            >
              <p className="text-[10px] text-muted-foreground px-2 pb-2 border-b border-white/10 mb-2">
                Commands
              </p>
              <div className="space-y-1">
                {filteredCommands.map((cmd, index) => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.command}
                      onClick={() => handleSelectCommand(cmd)}
                      className={cn(
                        "w-full flex items-center gap-3 p-2 rounded-md transition-colors text-left",
                        index === selectedCommandIndex
                          ? "bg-purple-500/20 text-purple-300"
                          : "hover:bg-white/5"
                      )}
                    >
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono">{cmd.command}</code>
                          <span className="text-xs text-muted-foreground">
                            {cmd.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {cmd.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Project Indicator */}
        {activeProject && (
          <div className="mb-2 px-1">
            <p className="text-[10px] text-muted-foreground">
              Active: <span className="text-purple-400">{activeProject.name}</span>
            </p>
          </div>
        )}

        <div className="glass-card p-2 flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={activeProject ? `Ask about ${activeProject.name} or type /...` : "Type / for commands..."}
            className="flex-1 bg-transparent border-none outline-none text-sm px-2"
            disabled={isLoading}
          />
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="gap-1"
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : input.startsWith("/") ? (
              <>
                <Terminal className="w-3 h-3" />
                Run
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3" />
                Send
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.aside>
    </>
  );
}

// Generate status response for /status command
function generateStatusResponse(projects: { name: string; stage: string; status: string }[]): string {
  const activeProjects = projects.filter(p => p.status === "active");
  const pausedProjects = projects.filter(p => p.status === "paused");
  
  if (projects.length === 0) {
    return "📊 **Workspace Status**\n\nNo projects yet. Create your first project to get started!";
  }

  // Group by stage
  const byStage: Record<string, string[]> = {};
  activeProjects.forEach(p => {
    if (!byStage[p.stage]) byStage[p.stage] = [];
    byStage[p.stage].push(p.name);
  });

  let response = `📊 **Workspace Status**\n\n`;
  response += `**Active Projects:** ${activeProjects.length}\n`;
  
  if (activeProjects.length > 0) {
    response += `\n**By Stage:**\n`;
    Object.entries(byStage).forEach(([stage, names]) => {
      const emoji = stage === "inbox" ? "📥" : 
                   stage === "prd" ? "📝" :
                   stage === "design" ? "🎨" :
                   stage === "prototype" ? "🔧" :
                   stage === "validate" ? "✅" : "📦";
      response += `${emoji} **${stage.charAt(0).toUpperCase() + stage.slice(1)}**: ${names.join(", ")}\n`;
    });
  }

  if (pausedProjects.length > 0) {
    response += `\n**Paused:** ${pausedProjects.map(p => p.name).join(", ")}\n`;
  }

  // Suggestions based on current state
  response += `\n---\n`;
  const inPrd = byStage["prd"] || [];
  const inPrototype = byStage["prototype"] || [];
  const inValidate = byStage["validate"] || [];

  if (inValidate.length > 0) {
    response += `💡 **Tip:** ${inValidate[0]} is ready for validation review.`;
  } else if (inPrototype.length > 0) {
    response += `💡 **Tip:** Run \`/validate ${inPrototype[0]}\` to start validation.`;
  } else if (inPrd.length > 0) {
    response += `💡 **Tip:** Run \`/proto ${inPrd[0]}\` to build a prototype.`;
  }

  return response;
}

// Local response generator (fallback when API is unavailable)
function generateLocalResponse(query: string, projects: { name: string; stage: string; status: string }[]): string {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes("status") || lowerQuery.includes("active")) {
    const activeProjects = projects.filter((p) => p.status === "active");
    if (activeProjects.length === 0) {
      return "You don't have any active projects right now. Would you like to create a new one?";
    }

    const byStage: Record<string, string[]> = {};
    activeProjects.forEach((p) => {
      if (!byStage[p.stage]) byStage[p.stage] = [];
      byStage[p.stage].push(p.name);
    });

    let response = `You have ${activeProjects.length} active project${activeProjects.length > 1 ? "s" : ""}:\n\n`;
    Object.entries(byStage).forEach(([stage, names]) => {
      response += `**${stage.charAt(0).toUpperCase() + stage.slice(1)}**: ${names.join(", ")}\n`;
    });

    return response;
  }

  if (lowerQuery.includes("next") || lowerQuery.includes("focus")) {
    const inPrd = projects.filter((p) => p.stage === "prd");
    const inPrototype = projects.filter((p) => p.stage === "prototype");
    const inValidate = projects.filter((p) => p.stage === "validate");

    if (inValidate.length > 0) {
      return `I'd suggest reviewing the validation results for **${inValidate[0].name}**. Once validated, you can move it to the tickets stage.`;
    }
    if (inPrototype.length > 0) {
      return `**${inPrototype[0].name}** is in the prototype stage. Consider running a jury evaluation to validate the design.`;
    }
    if (inPrd.length > 0) {
      return `**${inPrd[0].name}** has a PRD ready. The next step would be to build a prototype.`;
    }

    return "All your projects seem to be progressing well! Consider starting a new initiative or reviewing metrics for released features.";
  }

  if (lowerQuery.includes("blocked") || lowerQuery.includes("stalled")) {
    const stalled = projects.filter((p) => {
      // Projects that have been in the same stage for a while would be considered stalled
      return p.status === "paused";
    });

    if (stalled.length > 0) {
      return `Found ${stalled.length} paused project${stalled.length > 1 ? "s" : ""}: ${stalled.map((p) => p.name).join(", ")}. Would you like me to help unblock any of these?`;
    }

    return "No blocked or stalled projects found. Everything seems to be moving along!";
  }

  if (lowerQuery.includes("create") || lowerQuery.includes("issue") || lowerQuery.includes("feedback")) {
    return "To create an issue from feedback, you can:\n\n1. Click **New Project** and paste the feedback\n2. Or share the feedback here and I'll help structure it into an actionable item\n\nWhat feedback would you like to turn into an issue?";
  }

  return "I can help you with:\n\n• **Project status** - Overview of active projects\n• **Next steps** - Suggestions for what to focus on\n• **Blocked items** - Find stalled projects\n• **Create issues** - Turn feedback into actionable items\n\nWhat would you like to know?";
}
