"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { cn } from "@/lib/utils";
import {
  Plus,
  GripVertical,
  Trash2,
  Bot,
  Sparkles,
  Terminal,
  Users,
  ScrollText,
  FileText,
  Check,
  ChevronsUpDown,
  Loader2,
  XCircle,
} from "lucide-react";
import type { AgentDefinitionType } from "@/lib/db/schema";

// Type badge colors matching AgentsList pattern
const TYPE_BADGES: Record<AgentDefinitionType, { bg: string; text: string; icon: typeof Bot }> = {
  agents_md: { bg: "bg-purple-500/20", text: "text-purple-400", icon: FileText },
  skill: { bg: "bg-blue-500/20", text: "text-blue-400", icon: Sparkles },
  command: { bg: "bg-green-500/20", text: "text-green-400", icon: Terminal },
  subagent: { bg: "bg-orange-500/20", text: "text-orange-400", icon: Users },
  rule: { bg: "bg-slate-500/20", text: "text-slate-400", icon: ScrollText },
};

export interface AgentTrigger {
  agentDefinitionId: string;
  priority: number;
  enabled: boolean;
}

interface AgentDefinition {
  id: string;
  name: string;
  type: AgentDefinitionType;
  description: string | null;
  enabled: boolean | null;
}

interface AutomationRuleEditorProps {
  workspaceId: string;
  columnId: string;
  columnName: string;
  agentTriggers: AgentTrigger[] | null;
  onChange: (triggers: AgentTrigger[]) => void;
}

interface SortableTriggerItemProps {
  trigger: AgentTrigger;
  agent: AgentDefinition | undefined;
  onToggleEnabled: () => void;
  onRemove: () => void;
}

function SortableTriggerItem({
  trigger,
  agent,
  onToggleEnabled,
  onRemove,
}: SortableTriggerItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: trigger.agentDefinitionId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const agentType = agent?.type || "skill";
  const typeConfig = TYPE_BADGES[agentType];
  const TypeIcon = typeConfig?.icon || Bot;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border bg-card",
        isDragging && "opacity-50 shadow-lg",
        !trigger.enabled && "opacity-60"
      )}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Agent info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn("gap-1 text-xs", typeConfig?.bg, typeConfig?.text)}
          >
            <TypeIcon className="w-3 h-3" />
            {agentType}
          </Badge>
          <span className="font-medium text-sm truncate">
            {agent?.name || trigger.agentDefinitionId}
          </span>
        </div>
        {agent?.description && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {agent.description}
          </p>
        )}
      </div>

      {/* Priority indicator */}
      <span className="text-xs text-muted-foreground px-2">
        #{trigger.priority}
      </span>

      {/* Enable toggle */}
      <Switch
        checked={trigger.enabled}
        onCheckedChange={onToggleEnabled}
        className="data-[state=checked]:bg-primary"
      />

      {/* Remove button */}
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={onRemove}
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

async function fetchAgents(workspaceId: string): Promise<AgentDefinition[]> {
  const response = await fetch(`/api/agents?workspaceId=${workspaceId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch agents");
  }
  const data = await response.json();
  return data.agents;
}

export function AutomationRuleEditor({
  workspaceId,
  columnId,
  columnName,
  agentTriggers,
  onChange,
}: AutomationRuleEditorProps) {
  const [open, setOpen] = useState(false);
  const triggers = agentTriggers || [];

  const { data: agents, isLoading, error } = useQuery({
    queryKey: ["agents", workspaceId],
    queryFn: () => fetchAgents(workspaceId),
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get agents that aren't already triggers
  const availableAgents = useMemo(() => {
    if (!agents) return [];
    const triggerIds = new Set(triggers.map((t) => t.agentDefinitionId));
    return agents.filter((agent) => !triggerIds.has(agent.id) && agent.enabled !== false);
  }, [agents, triggers]);

  // Map agent ID to agent definition
  const agentMap = useMemo(() => {
    if (!agents) return new Map<string, AgentDefinition>();
    return new Map(agents.map((a) => [a.id, a]));
  }, [agents]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = triggers.findIndex(
        (t) => t.agentDefinitionId === active.id
      );
      const newIndex = triggers.findIndex(
        (t) => t.agentDefinitionId === over.id
      );
      const reordered = arrayMove(triggers, oldIndex, newIndex);
      // Update priorities based on new order
      const updated = reordered.map((t, idx) => ({
        ...t,
        priority: idx + 1,
      }));
      onChange(updated);
    }
  };

  const handleAddAgent = (agentId: string) => {
    const newTrigger: AgentTrigger = {
      agentDefinitionId: agentId,
      priority: triggers.length + 1,
      enabled: true,
    };
    onChange([...triggers, newTrigger]);
    setOpen(false);
  };

  const handleRemoveTrigger = (agentId: string) => {
    const filtered = triggers.filter((t) => t.agentDefinitionId !== agentId);
    // Re-index priorities
    const updated = filtered.map((t, idx) => ({
      ...t,
      priority: idx + 1,
    }));
    onChange(updated);
  };

  const handleToggleEnabled = (agentId: string) => {
    const updated = triggers.map((t) =>
      t.agentDefinitionId === agentId ? { ...t, enabled: !t.enabled } : t
    );
    onChange(updated);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-4">
      {/* Column header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{columnName}</span>
          {triggers.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {triggers.length} {triggers.length === 1 ? "trigger" : "triggers"}
            </Badge>
          )}
        </div>
        {triggers.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-muted-foreground hover:text-destructive h-8"
          >
            <XCircle className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-sm text-destructive p-3 bg-destructive/10 rounded-lg">
          Failed to load agents. Please try again.
        </div>
      )}

      {/* Trigger list */}
      {!isLoading && !error && (
        <>
          {triggers.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={triggers.map((t) => t.agentDefinitionId)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {triggers.map((trigger) => (
                    <SortableTriggerItem
                      key={trigger.agentDefinitionId}
                      trigger={trigger}
                      agent={agentMap.get(trigger.agentDefinitionId)}
                      onToggleEnabled={() =>
                        handleToggleEnabled(trigger.agentDefinitionId)
                      }
                      onRemove={() =>
                        handleRemoveTrigger(trigger.agentDefinitionId)
                      }
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="text-center py-6 text-sm text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
              No automation triggers configured.
              <br />
              Add an agent to run when projects enter this column.
            </div>
          )}

          {/* Add agent button */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-2"
                disabled={availableAgents.length === 0}
              >
                <Plus className="w-4 h-4" />
                Add Agent
                {availableAgents.length === 0 && triggers.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    (all agents assigned)
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <Command>
                <CommandInput placeholder="Search agents..." />
                <CommandList>
                  <CommandEmpty>No agents found.</CommandEmpty>
                  <CommandGroup>
                    {availableAgents.map((agent) => {
                      const typeConfig = TYPE_BADGES[agent.type];
                      const TypeIcon = typeConfig?.icon || Bot;
                      return (
                        <CommandItem
                          key={agent.id}
                          value={agent.name}
                          onSelect={() => handleAddAgent(agent.id)}
                          className="flex items-center gap-2"
                        >
                          <Badge
                            variant="outline"
                            className={cn(
                              "gap-1 text-xs",
                              typeConfig?.bg,
                              typeConfig?.text
                            )}
                          >
                            <TypeIcon className="w-3 h-3" />
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <span className="truncate">{agent.name}</span>
                            {agent.description && (
                              <p className="text-xs text-muted-foreground truncate">
                                {agent.description}
                              </p>
                            )}
                          </div>
                          <Check className="w-4 h-4 opacity-0" />
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </>
      )}
    </div>
  );
}
