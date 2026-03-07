"use client";

import type { InitiativeStatusSnapshot } from "@/lib/status/types";

const ARTIFACT_COLUMNS = [
  { key: "research", label: "Research" },
  { key: "prd", label: "PRD" },
  { key: "design_brief", label: "Design" },
  { key: "engineering_spec", label: "Eng" },
  { key: "prototype_notes", label: "Prototype" },
  { key: "jury_report", label: "Jury" },
  { key: "metrics", label: "Metrics" },
] as const;

function formatArtifactState(value: string) {
  switch (value) {
    case "complete":
      return "✅";
    case "missing":
      return "❌";
    default:
      return "—";
  }
}

interface ArtifactGapMatrixProps {
  initiatives: InitiativeStatusSnapshot[];
}

export function ArtifactGapMatrix({ initiatives }: ArtifactGapMatrixProps) {
  return (
    <div className="rounded-lg border overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Initiative</th>
            <th className="px-4 py-3 text-left font-medium">Stage</th>
            {ARTIFACT_COLUMNS.map((column) => (
              <th key={column.key} className="px-4 py-3 text-left font-medium">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {initiatives.map((initiative) => (
            <tr key={initiative.id} className="border-b last:border-b-0">
              <td className="px-4 py-3 font-medium">{initiative.name}</td>
              <td className="px-4 py-3 capitalize">{initiative.stage}</td>
              {ARTIFACT_COLUMNS.map((column) => (
                <td key={column.key} className="px-4 py-3">
                  {formatArtifactState(initiative.artifacts[column.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
