"use client";

import { useState } from "react";
import { Check, X, Edit2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ProjectLinkCombobox } from "./ProjectLinkCombobox";

interface SuggestionCardProps {
  suggestion: {
    signalId: string;
    verbatim: string;
    source: string;
    projectId: string;
    projectName: string;
    confidence: number;
    reason?: string;
  };
  workspaceId: string;
  onAccept: (signalId: string, projectId: string) => void;
  onReject: (signalId: string) => void;
  isAccepting?: boolean;
  isRejecting?: boolean;
}

const SOURCE_COLORS: Record<string, string> = {
  paste: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  webhook: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  interview: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  slack: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  pylon: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  video: "bg-red-500/20 text-red-300 border-red-500/30",
  email: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  other: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

export function SuggestionCard({
  suggestion,
  workspaceId,
  onAccept,
  onReject,
  isAccepting = false,
  isRejecting = false,
}: SuggestionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(suggestion.projectId);

  const confidenceColor =
    suggestion.confidence >= 0.8
      ? "text-green-400"
      : suggestion.confidence >= 0.6
        ? "text-amber-400"
        : "text-slate-400";

  const handleAccept = () => {
    onAccept(suggestion.signalId, selectedProjectId);
  };

  const handleConfirmEdit = () => {
    onAccept(suggestion.signalId, selectedProjectId);
    setIsEditing(false);
  };

  const isPending = isAccepting || isRejecting;

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
      <div className="flex-1 min-w-0">
        {/* Verbatim */}
        <p className="text-sm line-clamp-2 mb-2">{suggestion.verbatim}</p>

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge
            className={cn(
              "text-[10px]",
              SOURCE_COLORS[suggestion.source] || SOURCE_COLORS.other
            )}
          >
            {suggestion.source}
          </Badge>

          {isEditing ? (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Link to:</span>
              <ProjectLinkCombobox
                workspaceId={workspaceId}
                onSelect={(id) => setSelectedProjectId(id || suggestion.projectId)}
              />
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-green-400 hover:text-green-300"
                onClick={handleConfirmEdit}
                disabled={isPending}
              >
                {isAccepting ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setIsEditing(false);
                  setSelectedProjectId(suggestion.projectId);
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <span className="text-muted-foreground">Suggested:</span>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                {suggestion.projectName}
              </Badge>
              <span className={confidenceColor}>
                {Math.round(suggestion.confidence * 100)}% confident
              </span>
            </>
          )}
        </div>

        {/* Reason if available */}
        {suggestion.reason && !isEditing && (
          <p className="text-[10px] text-muted-foreground mt-1 italic">
            {suggestion.reason}
          </p>
        )}
      </div>

      {/* Actions */}
      {!isEditing && (
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-green-400 hover:text-green-300 hover:bg-green-500/10"
            onClick={handleAccept}
            disabled={isPending}
            title="Accept suggestion"
          >
            {isAccepting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={() => setIsEditing(true)}
            disabled={isPending}
            title="Edit suggestion"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
            onClick={() => onReject(suggestion.signalId)}
            disabled={isPending}
            title="Dismiss suggestion"
          >
            {isRejecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
