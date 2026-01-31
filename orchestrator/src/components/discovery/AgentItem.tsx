"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { FileCode, Bot, Zap, ScrollText, BookOpen } from "lucide-react";
import type { DiscoveredAgent } from "@/lib/discovery/types";

interface AgentItemProps {
  agent: DiscoveredAgent;
  isSelected: boolean;
  onToggle: (path: string) => void;
  showCheckbox?: boolean;
}

// Icon mapping by agent type
const TYPE_ICONS: Record<DiscoveredAgent['type'], React.ElementType> = {
  agents_md: BookOpen,
  skill: Zap,
  command: FileCode,
  subagent: Bot,
  rule: ScrollText,
};

// Badge styling by agent type
const TYPE_BADGES: Record<DiscoveredAgent['type'], { label: string; className: string }> = {
  agents_md: {
    label: 'AGENTS.md',
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 border-purple-200 dark:border-purple-800'
  },
  skill: {
    label: 'Skill',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 border-blue-200 dark:border-blue-800'
  },
  command: {
    label: 'Command',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 border-green-200 dark:border-green-800'
  },
  subagent: {
    label: 'Subagent',
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200 border-orange-200 dark:border-orange-800'
  },
  rule: {
    label: 'Rule',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-200 border-gray-200 dark:border-gray-700'
  },
};

export function AgentItem({
  agent,
  isSelected,
  onToggle,
  showCheckbox = true
}: AgentItemProps) {
  const { type, name, path, description } = agent;
  const Icon = TYPE_ICONS[type];
  const badge = TYPE_BADGES[type];

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
      {/* Checkbox for selection */}
      {showCheckbox && (
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggle(path)}
          className="mt-0.5"
        />
      )}

      {/* Type icon */}
      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Agent name */}
          <span className="font-medium truncate">{name}</span>

          {/* Type badge */}
          <Badge
            variant="outline"
            className={`text-xs ${badge.className}`}
          >
            {badge.label}
          </Badge>
        </div>

        {/* Source path */}
        <div className="text-sm text-muted-foreground truncate mt-0.5">
          {path}
        </div>

        {/* Description (if available) */}
        {description && (
          <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {description}
          </div>
        )}
      </div>
    </div>
  );
}
