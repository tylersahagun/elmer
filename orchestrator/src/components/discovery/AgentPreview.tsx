"use client";

import { useMemo, useState } from "react";
import { Bot, ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AgentItem } from "./AgentItem";
import type { DiscoveredAgent } from "@/lib/discovery/types";

interface AgentPreviewProps {
  agents: DiscoveredAgent[];
  selectedPaths: Set<string>;
  onToggleAgent: (path: string) => void;
  showCheckboxes?: boolean;
}

// Ordered list of agent types for display grouping
const TYPE_ORDER: Array<{ type: DiscoveredAgent['type']; label: string; labelSingular: string }> = [
  { type: 'agents_md', label: 'AGENTS.md', labelSingular: 'AGENTS.md' },
  { type: 'skill', label: 'Skills', labelSingular: 'Skill' },
  { type: 'command', label: 'Commands', labelSingular: 'Command' },
  { type: 'subagent', label: 'Subagents', labelSingular: 'Subagent' },
  { type: 'rule', label: 'Rules', labelSingular: 'Rule' },
];

export function AgentPreview({
  agents,
  selectedPaths,
  onToggleAgent,
  showCheckboxes = true
}: AgentPreviewProps) {
  // Track which sections are expanded (all expanded by default)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(TYPE_ORDER.map(t => t.type))
  );

  // Group agents by type
  const groupedAgents = useMemo(() => {
    const groups = new Map<DiscoveredAgent['type'], DiscoveredAgent[]>();

    // Initialize all groups to preserve order
    TYPE_ORDER.forEach(({ type }) => {
      groups.set(type, []);
    });

    // Group agents
    agents.forEach((agent) => {
      const group = groups.get(agent.type);
      if (group) {
        group.push(agent);
      }
    });

    // Filter out empty groups and return as ordered array
    return TYPE_ORDER
      .map(({ type, label, labelSingular }) => ({
        type,
        label,
        labelSingular,
        agents: groups.get(type) || []
      }))
      .filter(group => group.agents.length > 0);
  }, [agents]);

  const toggleSection = (type: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  // Empty state
  if (agents.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-muted/30 border">
        <div className="flex items-center gap-2 mb-2">
          <Bot className="h-5 w-5 text-muted-foreground" />
          <h4 className="font-medium">Agent Architecture</h4>
        </div>
        <p className="text-sm text-muted-foreground">
          No agent architecture detected in this repository.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Looking for .cursor/ directories with commands, skills, rules, and AGENTS.md files.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg bg-muted/30 border">
      {/* Header with count */}
      <div className="flex items-center gap-2 mb-4">
        <Bot className="h-5 w-5 text-muted-foreground" />
        <h4 className="font-medium">Agent Architecture</h4>
        <Badge variant="secondary" className="text-xs">
          {agents.length} {agents.length === 1 ? 'item' : 'items'}
        </Badge>
      </div>

      {/* Grouped sections */}
      <div className="space-y-4">
        {groupedAgents.map(({ type, label, labelSingular, agents: groupAgents }) => {
          const isExpanded = expandedSections.has(type);
          const count = groupAgents.length;
          const displayLabel = count === 1 ? labelSingular : label;

          return (
            <div key={type} className="border rounded-lg bg-card">
              {/* Section header (clickable to expand/collapse) */}
              <button
                onClick={() => toggleSection(type)}
                className="w-full flex items-center gap-2 p-3 text-left hover:bg-accent/50 transition-colors rounded-lg"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
                <span className="font-medium text-sm">{displayLabel}</span>
                <Badge variant="outline" className="text-xs ml-auto">
                  {count}
                </Badge>
              </button>

              {/* Section content (collapsible) */}
              {isExpanded && (
                <div className="px-3 pb-3 space-y-2">
                  {groupAgents.map((agent) => (
                    <AgentItem
                      key={agent.path}
                      agent={agent}
                      isSelected={selectedPaths.has(agent.path)}
                      onToggle={onToggleAgent}
                      showCheckbox={showCheckboxes}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
