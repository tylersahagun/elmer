"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { usePathname, useParams } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import ReactMarkdown from "react-markdown";
import {
  Sparkles,
  X,
  Plus,
  Loader2,
  User,
  Bot,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ElmerPanelProps {
  workspaceId: string;
}

interface StreamingMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

interface Mention {
  entityType: string;
  entityId: string;
  label: string;
}

export function ElmerPanel({ workspaceId }: ElmerPanelProps) {
  const { isAuthenticated } = useConvexAuth();
  const { getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const pathname = usePathname();
  const params = useParams();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "hub">("chat");
  const [activeThreadId, setActiveThreadId] =
    useState<Id<"chatThreads"> | null>(null);
  const [panelWidth, setPanelWidth] = useState(380);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessages, setStreamingMessages] = useState<
    StreamingMessage[]
  >([]);
  const [mentionSearch, setMentionSearch] = useState<string | null>(null);
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [mentionDropdownIndex, setMentionDropdownIndex] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);

  const userId = clerkUser?.id ?? "";

  // Extract page context from URL params
  const pageContext = {
    pathname: pathname ?? undefined,
    projectId:
      (params?.id as string | undefined) ??
      (params?.projectId as string | undefined) ??
      undefined,
    documentId: (params?.docId as string | undefined) ?? undefined,
  };

  const threads = useQuery(
    api.chat.listThreads,
    isAuthenticated && userId && workspaceId
      ? { workspaceId: workspaceId as Id<"workspaces">, userId }
      : "skip",
  );

  const messages = useQuery(
    api.chat.listMessages,
    isAuthenticated && activeThreadId ? { threadId: activeThreadId } : "skip",
  );

  const mentionResults = useQuery(
    api.chat.searchMentionables,
    mentionSearch !== null && isAuthenticated && workspaceId
      ? { workspaceId: workspaceId as Id<"workspaces">, query: mentionSearch }
      : "skip",
  );

  const createThread = useMutation(api.chat.createThread);

  // Sync messages from Convex into local streaming state
  useEffect(() => {
    if (!messages) return;
    setStreamingMessages(
      messages.map((m) => ({
        id: m._id,
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    );
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [streamingMessages]);

  // Reset mention dropdown index when results change
  useEffect(() => {
    setMentionDropdownIndex(0);
  }, [mentionResults]);

  // Cmd+L / Ctrl+L shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "l") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Drag-to-resize
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartWidth.current = panelRef.current?.offsetWidth ?? 380;
    e.preventDefault();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = dragStartX.current - e.clientX;
      const newWidth = Math.min(
        640,
        Math.max(280, dragStartWidth.current + delta),
      );
      setPanelWidth(newWidth);
    };
    const handleMouseUp = () => {
      isDragging.current = false;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const getOrCreateThread = useCallback(async () => {
    if (activeThreadId) return activeThreadId;
    const newId = await createThread({
      workspaceId: workspaceId as Id<"workspaces">,
      userId,
      title: "New conversation",
    });
    setActiveThreadId(newId);
    return newId;
  }, [activeThreadId, createThread, workspaceId, userId]);

  // Handle @mention detection in textarea
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setInputValue(value);

      // Detect @mention — find the last word starting with @ up to the cursor
      const cursorPos = e.target.selectionStart ?? value.length;
      const textBeforeCursor = value.slice(0, cursorPos);
      const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
      if (mentionMatch) {
        setMentionSearch(mentionMatch[1]);
      } else {
        setMentionSearch(null);
      }
    },
    [],
  );

  const insertMention = useCallback(
    (item: { id: string; label: string; type: string }) => {
      const cursorPos = textareaRef.current?.selectionStart ?? inputValue.length;
      const textBeforeCursor = inputValue.slice(0, cursorPos);
      const textAfterCursor = inputValue.slice(cursorPos);

      // Replace the @word fragment with @[Label]
      const replaced = textBeforeCursor.replace(/@(\w*)$/, `@[${item.label}]`);
      const newValue = replaced + textAfterCursor;

      setInputValue(newValue);
      setMentions((prev) => [
        ...prev,
        { entityType: item.type, entityId: item.id, label: item.label },
      ]);
      setMentionSearch(null);

      // Restore focus to textarea
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const newPos = replaced.length;
          textareaRef.current.setSelectionRange(newPos, newPos);
        }
      }, 0);
    },
    [inputValue],
  );

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isStreaming) return;
    const content = inputValue.trim();
    const currentMentions = mentions.map(({ entityType, entityId }) => ({
      entityType,
      entityId,
    }));
    setInputValue("");
    setMentions([]);
    setMentionSearch(null);

    const threadId = await getOrCreateThread();

    const optimisticUserMsg: StreamingMessage = {
      id: `optimistic-${Date.now()}`,
      role: "user",
      content,
    };
    const streamingAssistantMsg: StreamingMessage = {
      id: `streaming-${Date.now()}`,
      role: "assistant",
      content: "",
      isStreaming: true,
    };

    setStreamingMessages((prev) => [
      ...prev,
      optimisticUserMsg,
      streamingAssistantMsg,
    ]);
    setIsStreaming(true);

    try {
      const token = await getToken({ template: "convex" });

      const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL ?? "";
      const siteUrl = convexUrl.replace(".convex.cloud", ".convex.site");

      const res = await fetch(`${siteUrl}/api/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          threadId,
          content,
          workspaceId,
          pageContext,
          mentions: currentMentions,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Stream error: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (!data || data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data) as {
              type: string;
              delta?: { type: string; text?: string };
            };
            if (
              parsed.type === "content_block_delta" &&
              parsed.delta?.type === "text_delta" &&
              parsed.delta.text
            ) {
              accumulated += parsed.delta.text;
              setStreamingMessages((prev) =>
                prev.map((m) =>
                  m.isStreaming ? { ...m, content: accumulated } : m,
                ),
              );
            }
          } catch {
            // ignore non-JSON lines
          }
        }
      }
    } catch (err) {
      setStreamingMessages((prev) =>
        prev.map((m) =>
          m.isStreaming
            ? {
                ...m,
                content:
                  err instanceof Error
                    ? `Error: ${err.message}`
                    : "An error occurred",
                isStreaming: false,
              }
            : m,
        ),
      );
    } finally {
      setIsStreaming(false);
      setStreamingMessages((prev) =>
        prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m)),
      );
    }
  }, [inputValue, isStreaming, mentions, getOrCreateThread, getToken, workspaceId, pageContext]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Handle mention dropdown navigation
      if (mentionSearch !== null && mentionResults && mentionResults.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setMentionDropdownIndex((i) =>
            Math.min(i + 1, mentionResults.length - 1),
          );
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setMentionDropdownIndex((i) => Math.max(i - 1, 0));
          return;
        }
        if (e.key === "Enter" || e.key === "Tab") {
          e.preventDefault();
          const selected = mentionResults[mentionDropdownIndex];
          if (selected) {
            insertMention({ id: selected.id, label: selected.label, type: selected.type });
          }
          return;
        }
        if (e.key === "Escape") {
          e.preventDefault();
          setMentionSearch(null);
          return;
        }
      }

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void handleSend();
      }
    },
    [handleSend, mentionSearch, mentionResults, mentionDropdownIndex, insertMention],
  );

  const handleNewThread = useCallback(async () => {
    const newId = await createThread({
      workspaceId: workspaceId as Id<"workspaces">,
      userId,
      title: "New conversation",
    });
    setActiveThreadId(newId);
    setStreamingMessages([]);
    setMentions([]);
  }, [createThread, workspaceId, userId]);

  const formatRelativeTime = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "fixed right-0 top-1/2 -translate-y-1/2 z-50",
          "w-8 h-14 flex items-center justify-center",
          "bg-slate-900 dark:bg-slate-800 border border-white/10",
          "rounded-l-lg shadow-lg hover:bg-slate-800 dark:hover:bg-slate-700",
          "transition-all duration-200",
          isOpen && "opacity-0 pointer-events-none",
        )}
        title="Open Elmer (Cmd+L)"
      >
        <Sparkles className="w-4 h-4 text-purple-400" />
      </button>

      {/* Panel */}
      <div
        ref={panelRef}
        style={{ width: isOpen ? panelWidth : 0 }}
        className={cn(
          "fixed right-0 top-0 h-full z-40 flex",
          "transition-[width] duration-300 ease-in-out overflow-hidden",
          "border-l border-white/10 bg-slate-950 dark:bg-slate-950",
        )}
      >
        {/* Drag handle */}
        <div
          onMouseDown={handleDragStart}
          className="w-1 h-full cursor-col-resize bg-transparent hover:bg-purple-500/30 transition-colors shrink-0 group"
        >
          <div className="w-px h-full mx-auto bg-white/10 group-hover:bg-purple-500/50 transition-colors" />
        </div>

        {/* Panel content */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-purple-500/20 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <span className="font-semibold text-sm text-white">Elmer</span>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-white/5 rounded-md p-0.5">
              <button
                onClick={() => setActiveTab("chat")}
                className={cn(
                  "px-3 py-1 text-xs rounded-sm transition-colors",
                  activeTab === "chat"
                    ? "bg-white/10 text-white"
                    : "text-muted-foreground hover:text-white",
                )}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveTab("hub")}
                className={cn(
                  "px-3 py-1 text-xs rounded-sm transition-colors",
                  activeTab === "hub"
                    ? "bg-white/10 text-white"
                    : "text-muted-foreground hover:text-white",
                )}
              >
                Agent Hub
              </button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Tab content */}
          {activeTab === "hub" ? (
            <div className="flex items-center justify-center flex-1 text-muted-foreground text-sm">
              Agent Hub coming soon
            </div>
          ) : (
            <div className="flex flex-1 overflow-hidden">
              {/* Thread list */}
              <div className="w-44 shrink-0 flex flex-col border-r border-white/10 overflow-hidden">
                <div className="p-2 shrink-0">
                  <button
                    onClick={() => void handleNewThread()}
                    className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs text-muted-foreground hover:text-white hover:bg-white/5 rounded-md transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    New thread
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {threads === undefined ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : threads.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground px-3 py-2">
                      No threads yet
                    </p>
                  ) : (
                    threads.map((thread) => (
                      <button
                        key={thread._id}
                        onClick={() => {
                          setActiveThreadId(thread._id);
                          setStreamingMessages([]);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 transition-colors",
                          activeThreadId === thread._id
                            ? "bg-purple-500/10 text-white"
                            : "text-muted-foreground hover:text-white hover:bg-white/5",
                        )}
                      >
                        <p className="text-[11px] font-medium truncate">
                          {thread.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                          {formatRelativeTime(thread.lastMessageAt)}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Message area */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {!activeThreadId ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          Start a conversation
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Ask anything about your PM work
                        </p>
                      </div>
                    </div>
                  ) : streamingMessages.length === 0 && messages !== undefined ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                      <p className="text-xs text-muted-foreground">
                        No messages yet. Send one below.
                      </p>
                    </div>
                  ) : (
                    streamingMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex gap-2",
                          msg.role === "user" ? "flex-row-reverse" : "",
                        )}
                      >
                        <div
                          className={cn(
                            "w-6 h-6 rounded-md shrink-0 flex items-center justify-center",
                            msg.role === "user"
                              ? "bg-purple-500/20"
                              : "bg-teal-500/20",
                          )}
                        >
                          {msg.role === "user" ? (
                            <User className="w-3 h-3 text-purple-400" />
                          ) : (
                            <Bot className="w-3 h-3 text-teal-400" />
                          )}
                        </div>
                        <div
                          className={cn(
                            "max-w-[calc(100%-2.5rem)] rounded-lg px-3 py-2 text-xs",
                            msg.role === "user"
                              ? "bg-purple-500/15 text-white"
                              : "bg-white/5 text-slate-200",
                          )}
                        >
                          {msg.role === "assistant" ? (
                            msg.isStreaming && msg.content === "" ? (
                              <span className="flex items-center gap-1.5 text-muted-foreground">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Thinking…
                              </span>
                            ) : (
                              <div className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                              </div>
                            )
                          ) : (
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="shrink-0 p-3 border-t border-white/10">
                  {/* @mention chips */}
                  {mentions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {mentions.map((m, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px]"
                        >
                          @{m.label}
                          <button
                            onClick={() =>
                              setMentions((prev) => prev.filter((_, j) => j !== i))
                            }
                            className="hover:text-white transition-colors"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* @mention dropdown */}
                  {mentionSearch !== null &&
                    mentionResults &&
                    mentionResults.length > 0 && (
                      <div className="mb-2 rounded-md border border-white/10 bg-slate-900 overflow-hidden shadow-lg">
                        {mentionResults.map((item, i) => (
                          <button
                            key={item.id}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              insertMention({ id: item.id, label: item.label, type: item.type });
                            }}
                            className={cn(
                              "w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 transition-colors",
                              i === mentionDropdownIndex
                                ? "bg-purple-500/20 text-white"
                                : "text-slate-300 hover:bg-white/5",
                            )}
                          >
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wide w-12 shrink-0">
                              {item.type}
                            </span>
                            <span className="truncate">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    )}

                  <div className="flex gap-2 items-end">
                    <textarea
                      ref={textareaRef}
                      value={inputValue}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask Elmer anything… (@ to mention, Enter to send)"
                      disabled={isStreaming || !isAuthenticated}
                      rows={1}
                      className="flex-1 resize-none bg-white/5 border border-white/10 rounded-md px-3 py-2 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-purple-500/50 disabled:opacity-50 max-h-32 overflow-y-auto"
                      style={{ minHeight: "2.25rem" }}
                    />
                    <Button
                      size="sm"
                      onClick={() => void handleSend()}
                      disabled={!inputValue.trim() || isStreaming || !isAuthenticated}
                      className="h-9 px-3 bg-purple-600 hover:bg-purple-500 text-white shrink-0"
                    >
                      {isStreaming ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground/50 mt-1.5">
                    @ to mention · Shift+Enter for newline · Cmd+L to toggle
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
