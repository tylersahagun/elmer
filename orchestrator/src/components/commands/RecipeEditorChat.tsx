"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Window } from "@/components/chrome/Window";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Send,
  Loader2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface RecipeUpdate {
  stage: string;
  changes: Record<string, unknown>;
  description: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  updates?: RecipeUpdate[];
  applied?: boolean;
  timestamp: Date;
}

interface RecipeEditorChatProps {
  workspaceId: string;
  isOpen: boolean;
  onToggle: () => void;
}

export function RecipeEditorChat({
  workspaceId,
  isOpen,
  onToggle,
}: RecipeEditorChatProps) {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pendingUpdates, setPendingUpdates] = useState<RecipeUpdate[] | null>(
    null,
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async ({
      message,
      apply,
    }: {
      message: string;
      apply: boolean;
    }) => {
      const res = await fetch("/api/stage-recipes/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          message,
          apply,
        }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: (data, variables) => {
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: data.message,
        updates: data.updates,
        applied: data.applied,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // If there are updates and not applied, set as pending
      if (data.updates && data.updates.length > 0 && !variables.apply) {
        setPendingUpdates(data.updates);
      } else {
        setPendingUpdates(null);
      }

      // Refresh recipes if applied
      if (data.applied) {
        queryClient.invalidateQueries({
          queryKey: ["stage-recipes", workspaceId],
        });
      }
    },
  });

  // Apply pending updates
  const applyMutation = useMutation({
    mutationFn: async () => {
      // Re-send the last user message with apply=true
      const lastUserMessage = [...messages]
        .reverse()
        .find((m) => m.role === "user");
      if (!lastUserMessage) throw new Error("No message to apply");

      const res = await fetch("/api/stage-recipes/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          message: lastUserMessage.content,
          apply: true,
        }),
      });
      if (!res.ok) throw new Error("Failed to apply changes");
      return res.json();
    },
    onSuccess: () => {
      setPendingUpdates(null);
      queryClient.invalidateQueries({
        queryKey: ["stage-recipes", workspaceId],
      });

      // Add confirmation message
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: "Changes applied successfully!",
          applied: true,
          timestamp: new Date(),
        },
      ]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setPendingUpdates(null);

    chatMutation.mutate({ message: input.trim(), apply: false });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <motion.div
      initial={false}
      animate={{ height: isOpen ? "auto" : "48px" }}
      className="fixed bottom-4 right-4 w-[400px] max-w-[calc(100vw-2rem)] z-50"
    >
      <Window title="recipe-editor --chat" className="h-full">
        {/* Header / Toggle */}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between text-left -mt-2 -mx-1 px-1 py-2 hover:bg-muted/50 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Recipe Editor</p>
              <p className="text-[10px] text-muted-foreground font-mono">
                {"// Edit automation with natural language"}
              </p>
            </div>
          </div>
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {/* Chat Content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-3 pt-3 border-t border-border"
            >
              {/* Messages */}
              <ScrollArea className="h-[300px] pr-2" ref={scrollRef}>
                <div className="space-y-3">
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <Sparkles className="w-8 h-8 mx-auto mb-2 text-purple-400/50" />
                      <p className="text-sm text-muted-foreground">
                        Ask me to modify your stage recipes
                      </p>
                      <div className="mt-3 space-y-1">
                        <p className="text-[10px] text-muted-foreground/70 font-mono">
                          &quot;Make PRD stage fully automatic&quot;
                        </p>
                        <p className="text-[10px] text-muted-foreground/70 font-mono">
                          &quot;Add a jury gate to prototype stage&quot;
                        </p>
                        <p className="text-[10px] text-muted-foreground/70 font-mono">
                          &quot;What&apos;s the current automation setup?&quot;
                        </p>
                      </div>
                    </div>
                  )}

                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.role === "user" ? "justify-end" : "justify-start",
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                          msg.role === "user"
                            ? "bg-purple-500/20 text-purple-100"
                            : "bg-muted/50",
                        )}
                      >
                        {msg.role === "assistant" ? (
                          <div className="prose prose-sm prose-invert max-w-none">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p>{msg.content}</p>
                        )}

                        {/* Show updates summary */}
                        {msg.updates && msg.updates.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-border/50 space-y-1">
                            {msg.updates.map((update, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  {update.stage}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground">
                                  {update.description}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Applied indicator */}
                        {msg.applied && (
                          <div className="mt-2 flex items-center gap-1 text-[10px] text-green-400">
                            <Check className="w-3 h-3" />
                            Changes applied
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {chatMutation.isPending && (
                    <div className="flex justify-start">
                      <div className="bg-muted/50 rounded-lg px-3 py-2">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Pending Updates Actions */}
              <AnimatePresence>
                {pendingUpdates && pendingUpdates.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                      <p className="text-xs font-medium text-amber-300">
                        {pendingUpdates.length} change
                        {pendingUpdates.length > 1 ? "s" : ""} ready to apply
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => applyMutation.mutate()}
                        disabled={applyMutation.isPending}
                        className="gap-1.5 text-xs"
                      >
                        {applyMutation.isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                        Apply Changes
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPendingUpdates(null)}
                        className="text-xs"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input */}
              <form onSubmit={handleSubmit} className="mt-3">
                <div className="flex gap-2">
                  <Textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe recipe changes..."
                    rows={1}
                    className="resize-none min-h-[36px] text-sm"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!input.trim() || chatMutation.isPending}
                    className="shrink-0 h-9 w-9"
                  >
                    {chatMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </Window>
    </motion.div>
  );
}
