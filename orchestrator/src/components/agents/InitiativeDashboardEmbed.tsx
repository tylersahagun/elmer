"use client";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface Props {
  projectId: string;
  className?: string;
}

const STAGE_ORDER = ["inbox", "discovery", "define", "build", "validate", "launch"];
const DOC_TYPES = ["research", "prd", "design_brief", "engineering_spec", "prototype_notes", "jury_report"];

export function InitiativeDashboardEmbed({ projectId, className }: Props) {
  const project = useQuery(api.projects.get, { projectId: projectId as Id<"projects"> });
  const docs = useQuery(api.documents.byProject, { projectId: projectId as Id<"projects"> });

  if (!project) return null;

  const meta = project.metadata as Record<string, unknown> | undefined;
  const tldr = meta?.tldr as string | undefined;
  const currentIdx = STAGE_ORDER.indexOf(project.stage);
  const docTypes = (docs ?? []).map((d: { type: string }) => d.type);

  return (
    <div className={cn("rounded-2xl border border-border bg-card/30 p-4 space-y-3", className)}>
      {/* Stage progress bar */}
      <div className="space-y-1.5">
        <div className="flex gap-1">
          {STAGE_ORDER.map((s, i) => (
            <div
              key={s}
              title={s}
              className="flex-1 h-1.5 rounded-full"
              style={{
                background:
                  i < currentIdx
                    ? "hsl(var(--primary))"
                    : i === currentIdx
                      ? "#10b981"
                      : "rgba(255,255,255,0.08)",
              }}
            />
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground font-mono">
          {project.stage} ({currentIdx + 1}/{STAGE_ORDER.length})
        </p>
      </div>

      {/* TL;DR */}
      {tldr && (
        <p className="text-xs text-muted-foreground italic leading-relaxed border-l-2 border-primary/50 pl-3">
          {tldr}
        </p>
      )}

      {/* Artifact checklist */}
      <div className="grid grid-cols-3 gap-1">
        {DOC_TYPES.map((type) => (
          <div key={type} className="flex items-center gap-1.5 text-[10px]">
            <span>{docTypes.includes(type) ? "✅" : "⬜"}</span>
            <span className={docTypes.includes(type) ? "text-foreground" : "text-muted-foreground"}>
              {type.replace(/_/g, " ")}
            </span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground">
        {docTypes.length}/{DOC_TYPES.length} artifacts complete
      </p>
    </div>
  );
}
