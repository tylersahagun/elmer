"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";
import ReactMarkdown from "react-markdown";
import {
  X,
  Loader2,
  FileText,
  MessageSquare,
  Bot,
  Play,
  User,
  Sparkles,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

interface DocumentArtifactPanelProps {
  documentId: string;
  workspaceId: string;
  onClose: () => void;
}

type ArtifactTab = "view" | "discuss" | "run";

interface StreamingMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function DocumentArtifactPanel({
  documentId,
  workspaceId,
  onClose,
}: DocumentArtifactPanelProps) {
  const { isAuthenticated } = useConvexAuth();
  const { getToken } = useAuth();

  const [activeTab, setActiveTab] = useState<ArtifactTab>("view");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("idle");
  const [editContent, setEditContent] = useState<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Discuss tab state
  const [discussThreadId, setDiscussThreadId] = useState<Id<"chatThreads"> | null>(null);
  const [discussMessages, setDiscussMessages] = useState<StreamingMessage[]>([]);
  const [discussInput, setDiscussInput] = useState("");
  const [isDiscussStreaming, setIsDiscussStreaming] = useState(false);
  const discussEndRef = useRef<HTMLDivElement>(null);

  const docId = documentId as Id<"documents">;
  const wsId = workspaceId as Id<"workspaces">;

  const document = useQuery(api.documents.get, isAuthenticated ? { documentId: docId } : "skip");
  const updateDocument = useMutation(api.documents.update);
  const createThread = useMutation(api.chat.createThread);

  const agentDefs = useQuery(
    api.agentDefinitions.list,
    isAuthenticated && activeTab === "run" ? { workspaceId: wsId } : "skip",
  );
  const createJob = useMutation(api.jobs.createAndSchedule);

  // Initialize edit content from loaded document
  useEffect(() => {
    if (document && editContent === null) {
      setEditContent(document.content ?? "");
    }
  }, [document, editContent]);

  // Auto-scroll discuss messages
  useEffect(() => {
    discussEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [discussMessages]);

  // Debounced save on content change
  const handleContentChange = useCallback(
    (newContent: string) => {
      setEditContent(newContent);
      setSaveStatus("saving");
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        try {
          await updateDocument({ documentId: docId, content: newContent });
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        } catch {
          setSaveStatus("idle");
        }
      }, 1000);
    },
    [docId, updateDocument],
  );

  // Create discuss thread when Discuss tab is opened
  const handleDiscussTabOpen = useCallback(async () => {
    if (discussThreadId) return;
    if (!document) return;

    const threadId = await createThread({
      workspaceId: wsId,
      userId: "system",
      title: `Discuss: ${document.title ?? "Document"}`,
      contextEntityType: "document",
      contextEntityId: documentId,
    });
    setDiscussThreadId(threadId);
  }, [discussThreadId, document, createThread, wsId, documentId]);

  const handleTabChange = useCallback(
    (tab: ArtifactTab) => {
      setActiveTab(tab);
      if (tab === "discuss") {
        void handleDiscussTabOpen();
      }
    },
    [handleDiscussTabOpen],
  );

  // Send message in discuss thread
  const handleDiscussSend = useCallback(async () => {
    if (!discussInput.trim() || isDiscussStreaming || !discussThreadId || !document) return;

    const content = discussInput.trim();
    setDiscussInput("");

    const optimistic: StreamingMessage = {
      id: `opt-${Date.now()}`,
      role: "user",
      content,
    };
    const streaming: StreamingMessage = {
      id: `stream-${Date.now()}`,
      role: "assistant",
      content: "",
      isStreaming: true,
    };
    setDiscussMessages((prev) => [...prev, optimistic, streaming]);
    setIsDiscussStreaming(true);

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
          threadId: discussThreadId,
          content,
          workspaceId,
          mentions: [{ entityType: "document", entityId: documentId }],
        }),
      });

      if (!res.ok || !res.body) throw new Error(`Stream error: ${res.status}`);

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
              setDiscussMessages((prev) =>
                prev.map((m) => (m.isStreaming ? { ...m, content: accumulated } : m)),
              );
            }
          } catch {
            // ignore non-JSON lines
          }
        }
      }
    } catch (err) {
      setDiscussMessages((prev) =>
        prev.map((m) =>
          m.isStreaming
            ? {
                ...m,
                content: err instanceof Error ? `Error: ${err.message}` : "An error occurred",
                isStreaming: false,
              }
            : m,
        ),
      );
    } finally {
      setIsDiscussStreaming(false);
      setDiscussMessages((prev) =>
        prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m)),
      );
    }
  }, [discussInput, isDiscussStreaming, discussThreadId, document, getToken, workspaceId, documentId]);

  const handleRunAgent = useCallback(
    async (agentDefId: Id<"agentDefinitions">) => {
      await createJob({
        workspaceId: wsId,
        type: "execute_agent_definition",
        input: { agentDefinitionId: agentDefId, documentId },
        agentDefinitionId: agentDefId,
      });
    },
    [createJob, wsId, documentId],
  );

  const matchingAgents = agentDefs?.filter((a) => {
    const required = (a as { requiredArtifacts?: string[] }).requiredArtifacts;
    if (!required || required.length === 0) return false;
    return document ? required.includes(document.type) : false;
  });

  const tabs: { key: ArtifactTab; label: string; icon: React.ElementType }[] = [
    { key: "view", label: "View/Edit", icon: FileText },
    { key: "discuss", label: "Discuss", icon: MessageSquare },
    { key: "run", label: "Run Agent", icon: Bot },
  ];

  return (
    <div
      className={cn(
        "fixed top-0 h-full z-30 flex flex-col",
        "bg-slate-950 border-l border-white/10",
        "transition-transform duration-300 ease-in-out",
        "animate-in slide-in-from-right-5",
      )}
      style={{ right: 0, width: 500 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-md bg-blue-500/20 flex items-center justify-center shrink-0">
            <FileText className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {document?.title ?? "Loading…"}
            </p>
            {document && (
              <p className="text-[10px] text-muted-foreground capitalize">
                {document.type.replace(/_/g, " ")}
              </p>
            )}
          </div>
        </div>

        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onClose}>
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-white/10 shrink-0 bg-white/5">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors",
              activeTab === key
                ? "bg-white/10 text-white"
                : "text-muted-foreground hover:text-white hover:bg-white/5",
            )}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}

        {activeTab === "view" && saveStatus !== "idle" && (
          <span className="ml-auto text-[10px] text-muted-foreground flex items-center gap-1">
            {saveStatus === "saving" ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Check className="w-3 h-3 text-green-400" />
                <span className="text-green-400">Saved</span>
              </>
            )}
          </span>
        )}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {/* View/Edit Tab */}
        {activeTab === "view" && (
          <div className="h-full overflow-y-auto p-4">
            {!document ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : editContent !== null ? (
              <RichTextEditor
                content={editContent}
                onChange={handleContentChange}
                placeholder="Document content…"
                editable={true}
              />
            ) : null}
          </div>
        )}

        {/* Discuss Tab */}
        {activeTab === "discuss" && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {discussMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4 gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Ask about this document</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your questions are grounded in the document content
                    </p>
                  </div>
                </div>
              ) : (
                discussMessages.map((msg) => (
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
                        msg.role === "user" ? "bg-purple-500/20" : "bg-teal-500/20",
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
              <div ref={discussEndRef} />
            </div>

            <div className="shrink-0 p-3 border-t border-white/10">
              <div className="flex gap-2 items-end">
                <textarea
                  value={discussInput}
                  onChange={(e) => setDiscussInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleDiscussSend();
                    }
                  }}
                  placeholder="Ask about this document…"
                  disabled={isDiscussStreaming || !isAuthenticated}
                  rows={1}
                  className="flex-1 resize-none bg-white/5 border border-white/10 rounded-md px-3 py-2 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-teal-500/50 disabled:opacity-50 max-h-32 overflow-y-auto"
                  style={{ minHeight: "2.25rem" }}
                />
                <Button
                  size="sm"
                  onClick={() => void handleDiscussSend()}
                  disabled={!discussInput.trim() || isDiscussStreaming || !isAuthenticated}
                  className="h-9 px-3 bg-teal-600 hover:bg-teal-500 text-white shrink-0"
                >
                  {isDiscussStreaming ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Run Agent Tab */}
        {activeTab === "run" && (
          <div className="h-full overflow-y-auto p-4">
            {agentDefs === undefined ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : !matchingAgents || matchingAgents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-3 px-4">
                <Bot className="w-10 h-10 text-muted-foreground/30" />
                <div>
                  <p className="text-sm text-muted-foreground">No agents for this document type</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Agents with{" "}
                    <code className="text-[10px] bg-white/10 px-1 rounded">
                      {document?.type ?? "this type"}
                    </code>{" "}
                    in requiredArtifacts will appear here
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground mb-4">
                  {matchingAgents.length} agent{matchingAgents.length !== 1 ? "s" : ""} available
                  for this document type
                </p>
                {matchingAgents.map((agent) => (
                  <AgentRunCard
                    key={agent._id}
                    agent={agent as { _id: Id<"agentDefinitions">; name: string; description?: string | null; type: string }}
                    onRun={() => void handleRunAgent(agent._id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AgentRunCard({
  agent,
  onRun,
}: {
  agent: { _id: Id<"agentDefinitions">; name: string; description?: string | null; type: string };
  onRun: () => void;
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [ran, setRan] = useState(false);

  const handleClick = async () => {
    setIsRunning(true);
    try {
      onRun();
      setRan(true);
      setTimeout(() => setRan(false), 3000);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex items-start justify-between gap-3 p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/8 transition-colors">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <Bot className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <p className="text-xs font-medium text-white truncate">{agent.name}</p>
          <span className="text-[10px] text-muted-foreground bg-white/10 px-1.5 py-0.5 rounded shrink-0">
            {agent.type}
          </span>
        </div>
        {agent.description && (
          <p className="text-[11px] text-muted-foreground line-clamp-2">{agent.description}</p>
        )}
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => void handleClick()}
        disabled={isRunning}
        className={cn(
          "shrink-0 h-7 px-2 text-xs gap-1",
          ran && "border-green-500/50 text-green-400",
        )}
      >
        {isRunning ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : ran ? (
          <Check className="w-3 h-3" />
        ) : (
          <Play className="w-3 h-3" />
        )}
        {ran ? "Started" : "Run"}
      </Button>
    </div>
  );
}
