"use client";

import { MoreHorizontal, Eye, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface SignalRowProps {
  signal: {
    id: string;
    verbatim: string;
    interpretation?: string | null;
    status: "new" | "reviewed" | "linked" | "archived";
    source: string;
    severity?: string | null;
    createdAt: string;
    linkedProjects?: Array<{ id: string; name: string }>;
    linkedPersonas?: Array<{ personaId: string }>;
  };
  onView: (signal: SignalRowProps["signal"]) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  reviewed: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  linked: "bg-green-500/20 text-green-300 border-green-500/30",
  archived: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

const SOURCE_COLORS: Record<string, string> = {
  paste: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  webhook: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  upload: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  video: "bg-red-500/20 text-red-300 border-red-500/30",
  slack: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  pylon: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  email: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  interview: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  other: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-500/20 text-red-300 border-red-500/30",
  high: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  low: "bg-green-500/20 text-green-300 border-green-500/30",
};

const PROJECT_BADGE_COLOR = "bg-blue-500/20 text-blue-300 border-blue-500/30";
const PERSONA_BADGE_COLOR = "bg-violet-500/20 text-violet-300 border-violet-500/30";

interface AssociationBadgeProps<T> {
  items: T[];
  variant: "project" | "persona";
  getLabel: (item: T) => string;
  getId: (item: T) => string;
  onNavigate?: (id: string) => void;
}

function AssociationBadge<T>({
  items,
  variant,
  getLabel,
  getId,
  onNavigate,
}: AssociationBadgeProps<T>) {
  if (!items || items.length === 0) {
    return <span className="text-muted-foreground text-xs">-</span>;
  }

  const first = items[0];
  const remaining = items.length - 1;
  const colorClass = variant === "project" ? PROJECT_BADGE_COLOR : PERSONA_BADGE_COLOR;

  return (
    <div className="flex items-center gap-1">
      <Badge
        className={cn("text-[10px] cursor-pointer hover:opacity-80", colorClass)}
        onClick={(e) => {
          e.stopPropagation();
          if (onNavigate) {
            onNavigate(getId(first));
          }
        }}
      >
        {truncateText(getLabel(first), 15)}
      </Badge>
      {remaining > 0 && (
        <span className="text-[10px] text-muted-foreground">+{remaining}</span>
      )}
    </div>
  );
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

export function SignalRow({ signal, onView, onDelete, isSelected, onToggleSelect }: SignalRowProps) {
  const statusColor = STATUS_COLORS[signal.status] || STATUS_COLORS.new;
  const sourceColor = SOURCE_COLORS[signal.source] || SOURCE_COLORS.other;
  const severityColor = signal.severity
    ? SEVERITY_COLORS[signal.severity] || SEVERITY_COLORS.medium
    : null;

  const formattedDate = new Date(signal.createdAt).toLocaleDateString();

  return (
    <tr className="border-b border-border hover:bg-muted/30 transition-colors">
      {/* Checkbox */}
      {onToggleSelect && (
        <td className="py-3 px-2 w-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(signal.id)}
            onClick={(e) => e.stopPropagation()}
          />
        </td>
      )}

      {/* Verbatim */}
      <td className="py-3 px-4">
        <p className="text-sm max-w-xs truncate" title={signal.verbatim}>
          {truncateText(signal.verbatim, 100)}
        </p>
      </td>

      {/* Status */}
      <td className="py-3 px-4">
        <Badge className={cn("text-[10px] capitalize", statusColor)}>
          {signal.status}
        </Badge>
      </td>

      {/* Source */}
      <td className="py-3 px-4">
        <Badge className={cn("text-[10px] capitalize", sourceColor)}>
          {signal.source}
        </Badge>
      </td>

      {/* Projects */}
      <td className="py-3 px-4">
        <AssociationBadge
          items={signal.linkedProjects || []}
          variant="project"
          getLabel={(p) => p.name}
          getId={(p) => p.id}
          onNavigate={(projectId) => {
            window.open(`/projects/${projectId}`, "_blank");
          }}
        />
      </td>

      {/* Personas */}
      <td className="py-3 px-4">
        <AssociationBadge
          items={signal.linkedPersonas || []}
          variant="persona"
          getLabel={(p) => p.personaId}
          getId={(p) => p.personaId}
        />
      </td>

      {/* Severity */}
      <td className="py-3 px-4">
        {signal.severity ? (
          <Badge className={cn("text-[10px] capitalize", severityColor)}>
            {signal.severity}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )}
      </td>

      {/* Created */}
      <td className="py-3 px-4">
        <span className="text-sm text-muted-foreground">{formattedDate}</span>
      </td>

      {/* Actions */}
      <td className="py-3 px-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(signal)}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(signal.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}
