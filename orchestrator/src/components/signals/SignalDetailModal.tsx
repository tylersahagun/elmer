"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation as useTanstackMutation, useQueryClient } from "@tanstack/react-query";
import { useMutation as useConvexMutation, useQuery as useConvexQuery } from "convex/react";
import { LinkedTag } from "./LinkedTag";
import { ProjectLinkCombobox } from "./ProjectLinkCombobox";
import { PersonaLinkCombobox } from "./PersonaLinkCombobox";
import {
  Loader2,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Archive,
  Play,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/store";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

// Signal type matching API response
interface Signal {
  id: string;
  workspaceId: string;
  verbatim: string;
  interpretation?: string | null;
  status: "new" | "reviewed" | "linked" | "archived";
  source: string;
  sourceRef?: string | null;
  sourceMetadata?: Record<string, unknown> | null;
  severity?: string | null;
  frequency?: string | null;
  userSegment?: string | null;
  createdAt: string;
  updatedAt: string;
  processedAt?: string | null;
}

interface SignalDetailModalProps {
  signal: Signal | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onDelete: () => void;
}

// Types for linked data
interface LinkedProject {
  id: string;
  name: string;
  linkedAt: string;
  linkReason?: string;
}

interface LinkedPersona {
  personaId: string;
  linkedAt: string;
}

interface PersonaArchetype {
  id?: string;
  archetype_id: string;
  name: string;
}

// Agent definition type
interface AgentDefinition {
  id: string;
  name: string;
  type: "agents_md" | "skill" | "command" | "subagent" | "rule";
  description?: string | null;
}

// Status color mapping
const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  reviewed: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  linked: "bg-green-500/20 text-green-300 border-green-500/30",
  archived: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

// Source color mapping
const SOURCE_COLORS: Record<string, string> = {
  paste: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  webhook: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  upload: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  video: "bg-red-500/20 text-red-300 border-red-500/30",
  slack: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  pylon: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  email: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  interview: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  other: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

// Severity color mapping
const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-500/20 text-red-300 border-red-500/30",
  high: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  medium: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  low: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "reviewed", label: "Reviewed" },
  { value: "linked", label: "Linked" },
  { value: "archived", label: "Archived" },
];

export function SignalDetailModal({
  signal,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}: SignalDetailModalProps) {
  const queryClient = useQueryClient();
  const convexSignal = useConvexQuery(
    api.signals.get,
    signal?.id ? { signalId: signal.id as Id<"signals"> } : "skip",
  );
  const liveSignal =
    signal && convexSignal
      ? {
          ...signal,
          verbatim: convexSignal.verbatim,
          interpretation: convexSignal.interpretation ?? null,
          source: convexSignal.source,
          severity: convexSignal.severity ?? null,
          status:
            convexSignal.status === "pending"
              ? "new"
              : (convexSignal.status as Signal["status"]),
        }
      : signal;

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editedVerbatim, setEditedVerbatim] = useState("");
  const [editedInterpretation, setEditedInterpretation] = useState("");
  const [editedStatus, setEditedStatus] = useState<string>("new");
  const [showMetadata, setShowMetadata] = useState(false);

  // Sync edited values when signal changes or edit mode is entered
  useEffect(() => {
    if (liveSignal && isEditing) {
      queueMicrotask(() => {
        setEditedVerbatim(liveSignal.verbatim);
        setEditedInterpretation(liveSignal.interpretation || "");
        setEditedStatus(liveSignal.status);
      });
    }
  }, [liveSignal, isEditing]);

  // Reset edit mode when modal closes
  useEffect(() => {
    if (!isOpen) {
      queueMicrotask(() => {
        setIsEditing(false);
        setShowMetadata(false);
      });
    }
  }, [isOpen]);

  // Update mutation
  const updateSignal = useConvexMutation(api.signals.update);
  const [isUpdatingSignal, setIsUpdatingSignal] = useState(false);

  // Delete mutation
  const removeSignal = useConvexMutation(api.signals.remove);
  const [isDeletingSignal, setIsDeletingSignal] = useState(false);
  const deleteMutation = useTanstackMutation({
    mutationFn: async () => {
      if (!liveSignal) throw new Error("No signal to delete");
      setIsDeletingSignal(true);
      try {
        await removeSignal({ signalId: liveSignal.id as Id<"signals"> });
        return { success: true };
      } finally {
        setIsDeletingSignal(false);
      }
    },
    onSuccess: () => {
      onDelete();
      onClose();
    },
  });

  // Fetch linked projects and personas
  const { data: linkedData, refetch: refetchLinks } = useQuery({
    queryKey: ["signal-links", liveSignal?.id],
    queryFn: async () => {
      if (!liveSignal) return { projects: [], personas: [] };

      const [projectsRes, personasRes] = await Promise.all([
        fetch(`/api/signals/${liveSignal.id}/projects`),
        fetch(`/api/signals/${liveSignal.id}/personas`),
      ]);

      const projects = projectsRes.ok
        ? ((await projectsRes.json()).projects as LinkedProject[])
        : [];
      const personas = personasRes.ok
        ? ((await personasRes.json()).personas as LinkedPersona[])
        : [];

      return { projects, personas };
    },
    enabled: !!liveSignal && isOpen,
  });

  // Fetch persona names for display
  const { data: personasData } = useQuery({
    queryKey: ["personas"],
    queryFn: async () => {
      const res = await fetch("/api/personas");
      if (!res.ok) return { personas: [] };
      return res.json() as Promise<{ personas: PersonaArchetype[] }>;
    },
  });

  // Map persona IDs to names
  const personaNameMap = new Map(
    (personasData?.personas || []).flatMap((p) => {
      const entries: Array<[string, string]> = [[p.archetype_id, p.name]];
      if (p.id) entries.push([p.id, p.name]);
      return entries;
    }),
  );

  // Get the job logs drawer opener from store
  const openJobLogsDrawer = useUIStore((state) => state.openJobLogsDrawer);

  // Fetch available agents for this workspace
  const { data: agentsData } = useQuery({
    queryKey: ["agents", liveSignal?.workspaceId],
    queryFn: async () => {
      if (!liveSignal?.workspaceId) return { agents: [] };
      const res = await fetch(`/api/agents?workspaceId=${liveSignal.workspaceId}`);
      if (!res.ok) return { agents: [] };
      return res.json() as Promise<{ agents: AgentDefinition[] }>;
    },
    enabled: !!liveSignal?.workspaceId && isOpen,
  });

  // Filter to executable agent types (commands and skills)
  const executableAgents = (agentsData?.agents || []).filter(
    (agent) => agent.type === "command" || agent.type === "skill",
  );

  // Execute agent mutation
  const executeAgentMutation = useTanstackMutation({
    mutationFn: async (agentDefinitionId: string) => {
      if (!liveSignal) throw new Error("No signal selected");
      const res = await fetch("/api/agents/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: liveSignal.workspaceId,
          agentDefinitionId,
          signalId: liveSignal.id,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to execute agent");
      }
      return res.json();
    },
    onSuccess: (data) => {
      // Open job logs drawer to show execution progress
      const jobId = data.id || data.jobId;
      if (jobId) {
        openJobLogsDrawer(jobId, liveSignal?.verbatim.slice(0, 50) || "Signal");
      }
    },
  });

  // Link/unlink project mutations
  const linkProjectMutation = useTanstackMutation({
    mutationFn: async (projectId: string) => {
      const res = await fetch(`/api/signals/${liveSignal!.id}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      if (!res.ok) throw new Error("Failed to link project");
      return res.json();
    },
    onSuccess: () => {
      refetchLinks();
      queryClient.invalidateQueries({ queryKey: ["signals"] });
    },
  });

  const unlinkProjectMutation = useTanstackMutation({
    mutationFn: async (projectId: string) => {
      const res = await fetch(`/api/signals/${liveSignal!.id}/projects`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      if (!res.ok) throw new Error("Failed to unlink project");
      return res.json();
    },
    onSuccess: () => {
      refetchLinks();
      queryClient.invalidateQueries({ queryKey: ["signals"] });
    },
  });

  // Link/unlink persona mutations
  const linkPersonaMutation = useTanstackMutation({
    mutationFn: async (personaId: string) => {
      const res = await fetch(`/api/signals/${liveSignal!.id}/personas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personaId }),
      });
      if (!res.ok) throw new Error("Failed to link persona");
      return res.json();
    },
    onSuccess: () => {
      refetchLinks();
      queryClient.invalidateQueries({ queryKey: ["signals"] });
    },
  });

  const unlinkPersonaMutation = useTanstackMutation({
    mutationFn: async (personaId: string) => {
      const res = await fetch(`/api/signals/${liveSignal!.id}/personas`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personaId }),
      });
      if (!res.ok) throw new Error("Failed to unlink persona");
      return res.json();
    },
    onSuccess: () => {
      refetchLinks();
      queryClient.invalidateQueries({ queryKey: ["signals"] });
    },
  });

  const handleSave = () => {
    if (!liveSignal) return;
    setIsUpdatingSignal(true);
    void updateSignal({
      signalId: liveSignal.id as Id<"signals">,
      verbatim: editedVerbatim,
      interpretation: editedInterpretation || undefined,
      status: editedStatus === "new" ? "pending" : editedStatus,
      severity: liveSignal.severity ?? undefined,
    })
      .then(() => {
        setIsEditing(false);
        onUpdate();
      })
      .finally(() => setIsUpdatingSignal(false));
  };

  const handleQuickStatusChange = (newStatus: string) => {
    if (!liveSignal) return;
    setIsUpdatingSignal(true);
    void updateSignal({
      signalId: liveSignal.id as Id<"signals">,
      status: newStatus === "new" ? "pending" : newStatus,
      severity: liveSignal.severity ?? undefined,
    }).finally(() => setIsUpdatingSignal(false));
  };

  const handleStartEdit = () => {
    if (liveSignal) {
      setEditedVerbatim(liveSignal.verbatim);
      setEditedInterpretation(liveSignal.interpretation || "");
      setEditedStatus(liveSignal.status);
      setIsEditing(true);
    }
  };

  if (!liveSignal) return null;

  return (
    <Dialog
      open={isOpen && !!liveSignal}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Signal Details
            <Badge className={cn("text-xs", STATUS_COLORS[liveSignal.status])}>
              {liveSignal.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {isEditing ? (
          // Edit mode
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-verbatim">Feedback</Label>
              <Textarea
                id="edit-verbatim"
                value={editedVerbatim}
                onChange={(e) => setEditedVerbatim(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-interpretation">Interpretation</Label>
              <Textarea
                id="edit-interpretation"
                value={editedInterpretation}
                onChange={(e) => setEditedInterpretation(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={editedStatus} onValueChange={setEditedStatus}>
                <SelectTrigger id="edit-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          // View mode
          <div className="space-y-4 py-4">
            {/* Verbatim content */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Feedback</Label>
              <div className="p-3 bg-muted/50 rounded-lg text-sm whitespace-pre-wrap">
                {liveSignal.verbatim}
              </div>
            </div>

            {/* Interpretation (if present) */}
            {liveSignal.interpretation && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Interpretation
                </Label>
                <div className="p-3 bg-muted/30 rounded-lg text-sm whitespace-pre-wrap">
                  {liveSignal.interpretation}
                </div>
              </div>
            )}

            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                className={cn(
                  "text-xs",
                  SOURCE_COLORS[liveSignal.source] || SOURCE_COLORS.other,
                )}
              >
                {liveSignal.source}
              </Badge>
              {liveSignal.severity && (
                <Badge
                  className={cn(
                    "text-xs",
                    SEVERITY_COLORS[liveSignal.severity] || SEVERITY_COLORS.low,
                  )}
                >
                  {liveSignal.severity}
                </Badge>
              )}
              {liveSignal.frequency && (
                <Badge className="text-xs bg-slate-500/20 text-slate-300 border-slate-500/30">
                  {liveSignal.frequency}
                </Badge>
              )}
              {liveSignal.userSegment && (
                <Badge className="text-xs bg-slate-500/20 text-slate-300 border-slate-500/30">
                  {liveSignal.userSegment}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                Created {new Date(liveSignal.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Quick status actions */}
            {liveSignal.status !== "archived" && (
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Quick actions:
                </span>
                {liveSignal.status === "new" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickStatusChange("reviewed")}
                    disabled={isUpdatingSignal}
                    className="h-7 text-xs gap-1"
                  >
                    <CheckCircle className="w-3 h-3" />
                    Mark Reviewed
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickStatusChange("archived")}
                  disabled={isUpdatingSignal}
                  className="h-7 text-xs gap-1"
                >
                  <Archive className="w-3 h-3" />
                  Archive
                </Button>
                {executableAgents.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        disabled={executeAgentMutation.isPending}
                      >
                        {executeAgentMutation.isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                        Run Agent
                        <ChevronDown className="w-3 h-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {executableAgents.map((agent) => (
                        <DropdownMenuItem
                          key={agent.id}
                          onClick={() => executeAgentMutation.mutate(agent.id)}
                        >
                          <span className="capitalize text-xs text-muted-foreground mr-2">
                            [{agent.type}]
                          </span>
                          {agent.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )}

            {/* Linked Projects */}
            <div className="space-y-2 pt-2 border-t border-border">
              <Label className="text-xs text-muted-foreground">
                Linked Projects
              </Label>
              <div className="flex flex-wrap items-center gap-2">
                {(linkedData?.projects || []).map((project) => (
                  <LinkedTag
                    key={project.id}
                    label={project.name}
                    variant="project"
                    onRemove={() => unlinkProjectMutation.mutate(project.id)}
                    isLoading={unlinkProjectMutation.isPending}
                  />
                ))}
                <ProjectLinkCombobox
                  workspaceId={liveSignal.workspaceId}
                  excludeProjectIds={(linkedData?.projects || []).map(
                    (p) => p.id,
                  )}
                  onSelect={(projectId) =>
                    linkProjectMutation.mutate(projectId)
                  }
                  isLoading={linkProjectMutation.isPending}
                />
              </div>
            </div>

            {/* Linked Personas */}
            <div className="space-y-2 pt-2 border-t border-border">
              <Label className="text-xs text-muted-foreground">
                Linked Personas
              </Label>
              <div className="flex flex-wrap items-center gap-2">
                {(linkedData?.personas || []).map((persona) => (
                  <LinkedTag
                    key={persona.personaId}
                    label={
                      personaNameMap.get(persona.personaId) || persona.personaId
                    }
                    variant="persona"
                    onRemove={() =>
                      unlinkPersonaMutation.mutate(persona.personaId)
                    }
                    isLoading={unlinkPersonaMutation.isPending}
                  />
                ))}
                <PersonaLinkCombobox
                  excludePersonaIds={(linkedData?.personas || []).map(
                    (p) => p.personaId,
                  )}
                  onSelect={(personaId) =>
                    linkPersonaMutation.mutate(personaId)
                  }
                  isLoading={linkPersonaMutation.isPending}
                />
              </div>
            </div>

            {/* Collapsible technical details */}
            <div className="pt-2 border-t border-border">
              <button
                onClick={() => setShowMetadata(!showMetadata)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {showMetadata ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
                Technical Details
              </button>

              {showMetadata && (
                <div className="mt-3 space-y-2 text-xs">
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <span className="text-muted-foreground">Signal ID:</span>
                    <span className="font-mono">{liveSignal.id}</span>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <span className="text-muted-foreground">Workspace ID:</span>
                    <span className="font-mono">{liveSignal.workspaceId}</span>
                  </div>
                  {liveSignal.sourceRef && (
                    <div className="grid grid-cols-[120px_1fr] gap-2">
                      <span className="text-muted-foreground">Source Ref:</span>
                      <span className="font-mono break-all">
                        {liveSignal.sourceRef}
                      </span>
                    </div>
                  )}
                  {liveSignal.sourceMetadata &&
                    Object.keys(liveSignal.sourceMetadata).length > 0 && (
                      <div className="grid grid-cols-[120px_1fr] gap-2">
                        <span className="text-muted-foreground">
                          Source Metadata:
                        </span>
                        <pre className="font-mono text-[10px] bg-muted/50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(liveSignal.sourceMetadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <span className="text-muted-foreground">Created At:</span>
                    <span>{new Date(liveSignal.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <span className="text-muted-foreground">Updated At:</span>
                    <span>{new Date(liveSignal.updatedAt).toLocaleString()}</span>
                  </div>
                  {liveSignal.processedAt && (
                    <div className="grid grid-cols-[120px_1fr] gap-2">
                      <span className="text-muted-foreground">
                        Processed At:
                      </span>
                      <span>
                        {new Date(liveSignal.processedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isUpdatingSignal || !editedVerbatim.trim()}
              >
                {isUpdatingSignal && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="text-red-500 hover:text-red-400"
                onClick={() => deleteMutation.mutate()}
                disabled={isDeletingSignal || deleteMutation.isPending}
              >
                {(isDeletingSignal || deleteMutation.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Delete
              </Button>
              <Button variant="outline" onClick={handleStartEdit}>
                Edit
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type { Signal };
