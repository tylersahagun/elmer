"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Window } from "@/components/chrome/Window";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useKanbanStore, useUIStore } from "@/lib/store";
import {
  Inbox,
  FileText,
  MessageSquare,
  AlertCircle,
  Users,
  Clock,
  ArrowRight,
  Plus,
  Trash2,
  CheckCircle,
  X,
  Upload,
  ExternalLink,
  Loader2,
  ChevronRight,
  Sparkles,
  User,
  FolderKanban,
  Wand2,
} from "lucide-react";
import { InboxItemInsights } from "./InboxItemInsights";

// Type icons
const TYPE_ICONS: Record<string, React.ElementType> = {
  transcript: MessageSquare,
  document: FileText,
  signal: AlertCircle,
  feedback: Users,
};

// Type colors
const TYPE_COLORS: Record<string, string> = {
  transcript: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  document: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  signal: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  feedback: "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

// Status colors
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-slate-500/20 text-slate-300",
  processing: "bg-purple-500/20 text-purple-300",
  assigned: "bg-green-500/20 text-green-300",
  dismissed: "bg-red-500/20 text-red-300",
};

interface PersonaArchetype {
  archetype_id: string;
  name: string;
  description: string;
  role: {
    title: string;
  };
}

interface InboxItem {
  id: string;
  workspaceId: string;
  type: "transcript" | "document" | "signal" | "feedback";
  source: string;
  sourceRef?: string;
  title: string;
  rawContent: string;
  processedContent?: string;
  status: "pending" | "processing" | "assigned" | "dismissed";
  assignedProjectId?: string;
  assignedPersonaId?: string;
  assignedAction?: string;
  aiSummary?: string;
  extractedProblems?: Array<{
    problem: string;
    quote?: string;
    persona?: string;
    severity?: string;
  }>;
  hypothesisMatches?: Array<{
    hypothesisName: string;
    similarity: number;
    matchType: string;
  }>;
  metadata?: {
    sourceUrl?: string;
    sourceName?: string;
    participants?: string[];
    duration?: number;
    tags?: string[];
    suggestedProjectName?: string;
    suggestedPersonaId?: string;
    suggestedPersonaName?: string;
    extractedInsights?: string[];
  };
  createdAt: string;
  processedAt?: string;
  assignedProject?: {
    id: string;
    name: string;
    stage: string;
  };
}

interface InboxPanelProps {
  workspaceId: string;
  className?: string;
}

export function InboxPanel({ workspaceId, className }: InboxPanelProps) {
  const queryClient = useQueryClient();
  const projects = useKanbanStore((s) => s.projects);
  const openJobLogsDrawer = useUIStore((s) => s.openJobLogsDrawer);
  
  const [selectedItem, setSelectedItem] = useState<InboxItem | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadType, setUploadType] = useState<"transcript" | "document">("transcript");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadContent, setUploadContent] = useState("");
  const [assigningTo, setAssigningTo] = useState<string | null>(null);
  const [assignMode, setAssignMode] = useState<"project" | "persona">("project");

  // Fetch inbox items
  const { data: items, isLoading } = useQuery<InboxItem[]>({
    queryKey: ["inbox", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/inbox?workspaceId=${workspaceId}`);
      if (!res.ok) throw new Error("Failed to load inbox");
      return res.json();
    },
  });

  // Fetch personas
  const { data: personasData } = useQuery<{ personas: PersonaArchetype[] }>({
    queryKey: ["personas"],
    queryFn: async () => {
      const res = await fetch("/api/personas");
      if (!res.ok) throw new Error("Failed to load personas");
      return res.json();
    },
  });
  
  const personas = personasData?.personas || [];

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: { type: string; title: string; content: string }) => {
      const res = await fetch("/api/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          ...data,
        }),
      });
      if (!res.ok) throw new Error("Failed to upload");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox", workspaceId] });
      setShowUploadForm(false);
      setUploadTitle("");
      setUploadContent("");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; status?: string; assignedProjectId?: string; assignedPersonaId?: string; assignedAction?: string }) => {
      const res = await fetch("/api/inbox", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox", workspaceId] });
      setAssigningTo(null);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/inbox?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox", workspaceId] });
      setSelectedItem(null);
    },
  });

  // Create job from item
  const processItemMutation = useMutation({
    mutationFn: async (data: { itemId: string; projectId: string; action: string }) => {
      // Create job for the project
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          projectId: data.projectId,
          type: data.action === "research" ? "analyze_transcript" : "analyze_transcript",
          input: {
            inboxItemId: data.itemId,
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to create job");
      
      // Update inbox item
      await updateMutation.mutateAsync({
        id: data.itemId,
        status: "assigned",
        assignedProjectId: data.projectId,
        assignedAction: data.action,
      });
      
      return res.json();
    },
    onSuccess: (job) => {
      const project = projects.find(p => p.id === job.projectId);
      openJobLogsDrawer(job.id, project?.name);
    },
  });

  // Smart AI processing mutation
  const smartProcessMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch(`/api/inbox/${itemId}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to process item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox", workspaceId] });
    },
  });

  const handleUpload = () => {
    if (!uploadTitle.trim() || !uploadContent.trim()) return;
    uploadMutation.mutate({
      type: uploadType,
      title: uploadTitle,
      content: uploadContent,
    });
  };

  const handleAssignProject = (itemId: string, projectId: string) => {
    processItemMutation.mutate({
      itemId,
      projectId,
      action: "research",
    });
  };

  const handleAssignPersona = (itemId: string, personaId: string) => {
    updateMutation.mutate({
      id: itemId,
      status: "assigned",
      assignedPersonaId: personaId,
      assignedAction: "persona_feedback",
    });
  };

  const handleDismiss = (itemId: string) => {
    updateMutation.mutate({ id: itemId, status: "dismissed" });
  };

  const pendingItems = items?.filter(i => i.status === "pending") || [];
  const processedItems = items?.filter(i => i.status !== "pending") || [];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with upload button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
            <Inbox className="w-5 h-5 text-purple-400" />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold">Inbox</h2>
            <p className="text-xs text-muted-foreground">
              {pendingItems.length} pending • {processedItems.length} processed
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowUploadForm(true)}
          className="gap-1.5 self-start sm:self-auto"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload
        </Button>
      </div>

      {/* Upload Form */}
      <AnimatePresence>
        {showUploadForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Window title="upload --new">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant={uploadType === "transcript" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUploadType("transcript")}
                    className="gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Transcript
                  </Button>
                  <Button
                    variant={uploadType === "document" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUploadType("document")}
                    className="gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Document
                  </Button>
                </div>
                
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Title (e.g., 'Customer Interview - Jan 15')"
                  className="w-full bg-muted/50 rounded-lg px-3 py-2 text-sm border border-border"
                />
                
                <Textarea
                  value={uploadContent}
                  onChange={(e) => setUploadContent(e.target.value)}
                  placeholder="Paste transcript or document content..."
                  rows={8}
                  className="resize-none"
                />
                
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUploadForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleUpload}
                    disabled={uploadMutation.isPending || !uploadTitle.trim() || !uploadContent.trim()}
                    className="gap-1.5"
                  >
                    {uploadMutation.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    Add to Inbox
                  </Button>
                </div>
              </div>
            </Window>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && pendingItems.length === 0 && !showUploadForm && (
        <Window title="ls ./inbox">
          <div className="py-12 text-center">
            <Inbox className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium mb-2">Inbox Empty</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
              Upload transcripts, documents, or connect webhooks to receive content automatically.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUploadForm(true)}
              className="gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Content
            </Button>
          </div>
        </Window>
      )}

      {/* Pending Items */}
      {!isLoading && pendingItems.length > 0 && (
        <Window title="ls ./inbox --pending">
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-2">
              {pendingItems.map((item) => (
                <InboxItemCard
                  key={item.id}
                  item={item}
                  isSelected={selectedItem?.id === item.id}
                  onSelect={() => setSelectedItem(item)}
                  onAssignProject={(projectId) => handleAssignProject(item.id, projectId)}
                  onAssignPersona={(personaId) => handleAssignPersona(item.id, personaId)}
                  onSmartProcess={() => smartProcessMutation.mutate(item.id)}
                  onDismiss={() => handleDismiss(item.id)}
                  projects={projects}
                  personas={personas}
                  isAssigning={processItemMutation.isPending || updateMutation.isPending}
                  isProcessing={smartProcessMutation.isPending && smartProcessMutation.variables === item.id}
                  assigningTo={assigningTo}
                  setAssigningTo={setAssigningTo}
                  assignMode={assignMode}
                  setAssignMode={setAssignMode}
                />
              ))}
            </div>
          </ScrollArea>
        </Window>
      )}

      {/* Processed Items (collapsed) */}
      {!isLoading && processedItems.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 py-2">
            <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform" />
            Processed ({processedItems.length})
          </summary>
          <div className="mt-2">
            <Window title="ls ./inbox --processed">
              <ScrollArea className="max-h-[200px]">
                <div className="space-y-2">
                  {processedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 opacity-60"
                    >
                      {(() => {
                        const Icon = TYPE_ICONS[item.type] || FileText;
                        return <Icon className="w-4 h-4 text-muted-foreground" />;
                      })()}
                      <span className="text-sm truncate flex-1">{item.title}</span>
                      <Badge className={cn("text-[10px]", STATUS_COLORS[item.status])}>
                        {item.status}
                      </Badge>
                      {item.assignedProject && (
                        <span className="text-[10px] text-muted-foreground">
                          → {item.assignedProject.name}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Window>
          </div>
        </details>
      )}

      {/* Selected Item Preview */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Window title={`cat ${selectedItem.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{selectedItem.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={cn("text-[10px]", TYPE_COLORS[selectedItem.type])}>
                        {selectedItem.type}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {selectedItem.source}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(selectedItem.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedItem(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Content Preview */}
                <ScrollArea className="max-h-[200px]">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedItem.rawContent.slice(0, 1000)}
                    {selectedItem.rawContent.length > 1000 && "..."}
                  </p>
                </ScrollArea>
                
                {/* Metadata */}
                {selectedItem.metadata && (
                  <div className="pt-2 border-t border-border">
                    {selectedItem.metadata.participants && (
                      <p className="text-xs text-muted-foreground">
                        <Users className="w-3 h-3 inline mr-1" />
                        {selectedItem.metadata.participants.join(", ")}
                      </p>
                    )}
                    {selectedItem.metadata.duration && (
                      <p className="text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {Math.round(selectedItem.metadata.duration / 60)} min
                      </p>
                    )}
                    {selectedItem.metadata.sourceUrl && (
                      <a
                        href={selectedItem.metadata.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 mt-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View source
                      </a>
                    )}
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(selectedItem.id)}
                    disabled={deleteMutation.isPending}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Delete
                  </Button>
                </div>
              </div>
            </Window>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Individual inbox item card
function InboxItemCard({
  item,
  isSelected,
  onSelect,
  onAssignProject,
  onAssignPersona,
  onSmartProcess,
  onDismiss,
  projects,
  personas,
  isAssigning,
  isProcessing,
  assigningTo,
  setAssigningTo,
  assignMode,
  setAssignMode,
}: {
  item: InboxItem;
  isSelected: boolean;
  onSelect: () => void;
  onAssignProject: (projectId: string) => void;
  onAssignPersona: (personaId: string) => void;
  onSmartProcess: () => void;
  onDismiss: () => void;
  projects: { id: string; name: string; stage: string }[];
  personas: PersonaArchetype[];
  isAssigning: boolean;
  isProcessing: boolean;
  assigningTo: string | null;
  setAssigningTo: (id: string | null) => void;
  assignMode: "project" | "persona";
  setAssignMode: (mode: "project" | "persona") => void;
}) {
  const Icon = TYPE_ICONS[item.type] || FileText;
  const showAssignMenu = assigningTo === item.id;
  const hasInsights = item.aiSummary || (item.extractedProblems && item.extractedProblems.length > 0);

  return (
    <motion.div
      layout
      className={cn(
        "p-3 rounded-lg border transition-colors",
        isSelected
          ? "bg-purple-500/10 border-purple-500/30"
          : "bg-muted/30 border-transparent hover:border-border"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
            TYPE_COLORS[item.type]?.split(" ")[0] || "bg-slate-500/20"
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <button
            onClick={onSelect}
            className="text-left w-full"
          >
            <p className="text-sm font-medium truncate">{item.title}</p>
            <p className="text-xs text-muted-foreground truncate">
              {item.aiSummary || item.rawContent.slice(0, 100)}...
            </p>
          </button>
          
          <div className="flex items-center gap-2 mt-2">
            <Badge className={cn("text-[10px]", TYPE_COLORS[item.type])}>
              {item.type}
            </Badge>
            {hasInsights && (
              <Badge className="text-[10px] bg-purple-500/20 text-purple-300 border-purple-500/30">
                <Sparkles className="w-2.5 h-2.5 mr-1" />
                Processed
              </Badge>
            )}
            <span className="text-[10px] text-muted-foreground">
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-1">
          {!hasInsights && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-purple-400 hover:text-purple-300"
              onClick={onSmartProcess}
              disabled={isProcessing}
              title="Smart Process with AI"
            >
              {isProcessing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Wand2 className="w-3.5 h-3.5" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setAssigningTo(showAssignMenu ? null : item.id)}
            title="Assign"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-red-400"
            onClick={onDismiss}
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* AI Insights */}
      {hasInsights && isSelected && (
        <div className="mt-3 pt-3 border-t border-border">
          <InboxItemInsights
            aiSummary={item.aiSummary}
            extractedProblems={item.extractedProblems}
            hypothesisMatches={item.hypothesisMatches}
            extractedInsights={item.metadata?.extractedInsights}
            suggestedProjectName={item.metadata?.suggestedProjectName}
            suggestedPersonaName={item.metadata?.suggestedPersonaName}
          />
        </div>
      )}
      
      {/* Assign Menu */}
      <AnimatePresence>
        {showAssignMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-border"
          >
            {/* Mode Toggle */}
            <div className="flex items-center gap-2 mb-3">
              <Button
                variant={assignMode === "project" ? "default" : "outline"}
                size="sm"
                onClick={() => setAssignMode("project")}
                className="text-xs h-6 gap-1"
              >
                <FolderKanban className="w-3 h-3" />
                Project
              </Button>
              <Button
                variant={assignMode === "persona" ? "default" : "outline"}
                size="sm"
                onClick={() => setAssignMode("persona")}
                className="text-xs h-6 gap-1"
              >
                <User className="w-3 h-3" />
                Persona
              </Button>
            </div>

            {/* Project Assignment */}
            {assignMode === "project" && (
              <>
                <p className="text-xs text-muted-foreground mb-2">Assign to project:</p>
                <div className="flex flex-wrap gap-2">
                  {projects.slice(0, 5).map((project) => (
                    <Button
                      key={project.id}
                      variant="outline"
                      size="sm"
                      onClick={() => onAssignProject(project.id)}
                      disabled={isAssigning}
                      className="text-xs h-7 max-w-[150px] sm:max-w-none"
                    >
                      {isAssigning ? (
                        <Loader2 className="w-3 h-3 animate-spin mr-1 flex-shrink-0" />
                      ) : (
                        <Sparkles className="w-3 h-3 mr-1 flex-shrink-0" />
                      )}
                      <span className="truncate">{project.name}</span>
                    </Button>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAssigningTo(null)}
                    className="text-xs h-7"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}

            {/* Persona Assignment */}
            {assignMode === "persona" && (
              <>
                <p className="text-xs text-muted-foreground mb-2">Add as feedback for persona:</p>
                <div className="flex flex-wrap gap-2">
                  {personas.map((persona) => (
                    <Button
                      key={persona.archetype_id}
                      variant="outline"
                      size="sm"
                      onClick={() => onAssignPersona(persona.archetype_id)}
                      disabled={isAssigning}
                      className="text-xs h-7 max-w-[150px] sm:max-w-none"
                    >
                      {isAssigning ? (
                        <Loader2 className="w-3 h-3 animate-spin mr-1 flex-shrink-0" />
                      ) : (
                        <User className="w-3 h-3 mr-1 flex-shrink-0" />
                      )}
                      <span className="truncate">{persona.name}</span>
                    </Button>
                  ))}
                  {personas.length === 0 && (
                    <p className="text-xs text-muted-foreground">No personas found</p>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAssigningTo(null)}
                    className="text-xs h-7"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
