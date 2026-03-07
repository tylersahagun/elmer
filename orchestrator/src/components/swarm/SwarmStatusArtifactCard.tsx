"use client";

import type { SwarmReport } from "@/lib/swarm/types";

interface SwarmStatusArtifactCardProps {
  report: SwarmReport;
}

export function SwarmStatusArtifactCard({ report }: SwarmStatusArtifactCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-medium mb-2">Swarm artifact preview</h3>
      <p className="text-sm text-muted-foreground mb-3">{report.objective}</p>
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium">Release target:</span> {report.releaseTarget}
        </div>
        <div>
          <span className="font-medium">Primary tracker:</span> {report.sourceOfTruth}
        </div>
        <div>
          <span className="font-medium">Preset:</span> {report.preset}
        </div>
        <div>
          <span className="font-medium">Backlog items:</span> {report.backlog.length}
        </div>
        <div>
          <span className="font-medium">Lanes:</span> {report.lanes.length}
        </div>
        <div>
          <span className="font-medium">Lane jobs:</span>{" "}
          {report.lanes.reduce((count, lane) => count + lane.jobs.length, 0)}
        </div>
        <div>
          <span className="font-medium">Validation checks:</span>{" "}
          {report.validationChecks.length}
        </div>
        <div>
          <span className="font-medium">Linked Linear issues:</span>{" "}
          {report.lanes.reduce((count, lane) => count + lane.linkedIssues.length, 0)}
        </div>
      </div>
    </div>
  );
}
