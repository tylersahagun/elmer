"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Signal {
  id: string;
  verbatim: string;
  source: string;
  status: string;
  severity?: string | null;
  createdAt: string;
  linkedProjects?: Array<{ id: string; name: string }>;
}

interface SignalPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  workspaceId: string;
}

const SOURCE_COLORS: Record<string, string> = {
  paste: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  webhook: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  interview: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  email: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  other: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

export function SignalPickerModal({
  isOpen,
  onClose,
  projectId,
  projectName,
  workspaceId,
}: SignalPickerModalProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Reset selection when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      queueMicrotask(() => {
        setSelected([]);
        setSearch("");
      });
    }
  }, [isOpen]);

  // Fetch signals (unlinked to this project)
  const { data: signalsData, isLoading: signalsLoading } = useQuery({
    queryKey: ["signals", workspaceId, { forPicker: true }],
    queryFn: async () => {
      const res = await fetch(
        `/api/signals?workspaceId=${workspaceId}&pageSize=100`,
      );
      if (!res.ok) throw new Error("Failed to load signals");
      return res.json();
    },
    enabled: isOpen,
  });

  // Filter out already-linked signals and apply search
  const signals: Signal[] = (signalsData?.signals || []).filter((s: Signal) => {
    // Exclude if already linked to this project
    const isLinked = s.linkedProjects?.some((p) => p.id === projectId);
    if (isLinked) return false;

    // Apply search filter
    if (search) {
      return s.verbatim.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  // Bulk link mutation
  const linkMutation = useMutation({
    mutationFn: async (signalIds: string[]) => {
      // Link each signal sequentially
      for (const signalId of signalIds) {
        const res = await fetch(`/api/signals/${signalId}/projects`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId }),
        });
        if (!res.ok) {
          throw new Error(`Failed to link signal ${signalId}`);
        }
      }
      return { linked: signalIds.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project-signals", projectId],
      });
      queryClient.invalidateQueries({ queryKey: ["signals"] });
      onClose();
    },
  });

  const toggleSelection = (signalId: string) => {
    setSelected((prev) =>
      prev.includes(signalId)
        ? prev.filter((id) => id !== signalId)
        : [...prev, signalId],
    );
  };

  const handleLinkSelected = () => {
    if (selected.length > 0) {
      linkMutation.mutate(selected);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Link Signals to {projectName}</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search signals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Signal List */}
        <ScrollArea className="flex-1 max-h-[400px] border border-border rounded-lg">
          {signalsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : signals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {search
                ? "No matching signals found"
                : "No unlinked signals available"}
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {signals.map((signal) => (
                <label
                  key={signal.id}
                  className={cn(
                    "flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                    selected.includes(signal.id)
                      ? "bg-primary/10"
                      : "hover:bg-muted/30",
                  )}
                >
                  <Checkbox
                    checked={selected.includes(signal.id)}
                    onCheckedChange={() => toggleSelection(signal.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm line-clamp-2">{signal.verbatim}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        className={cn(
                          "text-[10px]",
                          SOURCE_COLORS[signal.source] || SOURCE_COLORS.other,
                        )}
                      >
                        {signal.source}
                      </Badge>
                      {signal.severity && (
                        <Badge className="text-[10px] bg-amber-500/20 text-amber-300 border-amber-500/30">
                          {signal.severity}
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(signal.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleLinkSelected}
            disabled={selected.length === 0 || linkMutation.isPending}
          >
            {linkMutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Link {selected.length} Signal{selected.length !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
