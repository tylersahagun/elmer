"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard, GlassPanel } from "@/components/glass";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useKanbanStore, useUIStore } from "@/lib/store";
import { springPresets, staggerContainer, staggerItem } from "@/lib/animations";
import {
  MessageSquare,
  Sparkles,
  Send,
  Loader2,
  User,
  Bot,
  X,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const QUICK_ACTIONS = [
  { label: "Project status", prompt: "What's the status of my active projects?" },
  { label: "Next steps", prompt: "What should I focus on next?" },
  { label: "Blocked items", prompt: "Are there any blocked or stalled projects?" },
  { label: "Create issue", prompt: "Help me create a new issue from recent feedback" },
];

export function ChatSidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const workspace = useKanbanStore((s) => s.workspace);
  const projects = useKanbanStore((s) => s.projects);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Hi! I'm your PM assistant. I can help you with project status, suggest next steps, or create issues from feedback. What would you like to know?",
      timestamp: new Date(),
      suggestions: QUICK_ACTIONS.map((a) => a.label),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
    setIsLoading(true);

    try {
      // Call chat API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          workspaceId: workspace?.id,
          context: {
            projects: projects.map((p) => ({
              name: p.name,
              stage: p.stage,
              status: p.status,
            })),
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

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!sidebarOpen) return null;

  return (
    <motion.aside
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 380, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={springPresets.snappy}
      className="border-l border-white/10 bg-white/5 backdrop-blur-xl flex flex-col h-[calc(100vh-80px)]"
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

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="glass-card p-2 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your projects..."
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
  );
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
