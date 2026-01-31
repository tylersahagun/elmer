"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Loader2, X, FolderKanban, Radio, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type ContextType = "none" | "project" | "signal";

interface Project {
  id: string;
  name: string;
  stage: string;
}

interface Signal {
  id: string;
  verbatim: string;
  source: string;
  status: string;
}

interface ContextSelectorProps {
  workspaceId: string;
  contextType: ContextType;
  selectedId: string | null;
  onSelect: (type: ContextType, id: string | null) => void;
}

const CONTEXT_TYPES: Array<{ type: ContextType; label: string; icon: React.ElementType }> = [
  { type: "none", label: "No Context", icon: Circle },
  { type: "project", label: "Project", icon: FolderKanban },
  { type: "signal", label: "Signal", icon: Radio },
];

async function fetchProjects(workspaceId: string): Promise<Project[]> {
  const response = await fetch(`/api/projects?workspaceId=${workspaceId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }
  return response.json();
}

async function fetchSignals(workspaceId: string): Promise<{ signals: Signal[] }> {
  const response = await fetch(`/api/signals?workspaceId=${workspaceId}&pageSize=100`);
  if (!response.ok) {
    throw new Error("Failed to fetch signals");
  }
  return response.json();
}

export function ContextSelector({
  workspaceId,
  contextType,
  selectedId,
  onSelect,
}: ContextSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Fetch projects when project context is selected
  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["projects", workspaceId],
    queryFn: () => fetchProjects(workspaceId),
    enabled: contextType === "project",
  });

  // Fetch signals when signal context is selected
  const { data: signalsData, isLoading: isLoadingSignals } = useQuery({
    queryKey: ["signals", workspaceId],
    queryFn: () => fetchSignals(workspaceId),
    enabled: contextType === "signal",
  });

  const signals = signalsData?.signals || [];

  // Find selected item name
  const getSelectedName = (): string | null => {
    if (contextType === "project" && selectedId && projects) {
      const project = projects.find((p) => p.id === selectedId);
      return project?.name || null;
    }
    if (contextType === "signal" && selectedId && signals) {
      const signal = signals.find((s) => s.id === selectedId);
      return signal ? signal.verbatim.slice(0, 50) + (signal.verbatim.length > 50 ? "..." : "") : null;
    }
    return null;
  };

  const handleTypeChange = (type: ContextType) => {
    // Clear selection when changing context type
    onSelect(type, null);
  };

  const handleItemSelect = (id: string) => {
    onSelect(contextType, id);
    setOpen(false);
    setSearch("");
  };

  const handleClearSelection = () => {
    onSelect(contextType, null);
  };

  const isLoading = contextType === "project" ? isLoadingProjects : isLoadingSignals;
  const selectedName = getSelectedName();

  return (
    <div className="space-y-3">
      {/* Context type selector tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
        {CONTEXT_TYPES.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            onClick={() => handleTypeChange(type)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              contextType === type
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Item selector (only shown for project/signal) */}
      {contextType !== "none" && (
        <div className="space-y-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between font-normal"
              >
                {selectedName ? (
                  <span className="truncate">{selectedName}</span>
                ) : (
                  <span className="text-muted-foreground">
                    Select a {contextType}...
                  </span>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command>
                <CommandInput
                  placeholder={`Search ${contextType}s...`}
                  value={search}
                  onValueChange={setSearch}
                />
                <CommandList>
                  {isLoading ? (
                    <div className="py-6 text-center">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                      <span className="text-sm text-muted-foreground">
                        Loading {contextType}s...
                      </span>
                    </div>
                  ) : contextType === "project" ? (
                    <>
                      <CommandEmpty>No projects found.</CommandEmpty>
                      <CommandGroup heading="Projects">
                        {projects?.map((project) => (
                          <CommandItem
                            key={project.id}
                            value={project.name}
                            onSelect={() => handleItemSelect(project.id)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedId === project.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="truncate font-medium">{project.name}</div>
                              <div className="text-xs text-muted-foreground capitalize">
                                {project.stage}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </>
                  ) : (
                    <>
                      <CommandEmpty>No signals found.</CommandEmpty>
                      <CommandGroup heading="Signals">
                        {signals?.map((signal) => (
                          <CommandItem
                            key={signal.id}
                            value={signal.verbatim}
                            onSelect={() => handleItemSelect(signal.id)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedId === signal.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="truncate text-sm">
                                {signal.verbatim.slice(0, 60)}
                                {signal.verbatim.length > 60 ? "..." : ""}
                              </div>
                              <div className="text-xs text-muted-foreground capitalize">
                                {signal.source} - {signal.status}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Selected item display with clear button */}
          {selectedName && (
            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30 border">
              <div className="flex-1 min-w-0">
                <span className="text-xs text-muted-foreground capitalize">{contextType}:</span>
                <div className="text-sm font-medium truncate">{selectedName}</div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                className="h-7 w-7 p-0 flex-shrink-0"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear selection</span>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Info message for no context */}
      {contextType === "none" && (
        <p className="text-sm text-muted-foreground">
          Agent will execute without specific context.
        </p>
      )}
    </div>
  );
}
