"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StatusSummary } from "@/lib/status/types";

interface StatusOverviewProps {
  summary: StatusSummary;
  healthScore: number;
}

const metrics = (
  summary: StatusSummary,
  healthScore: number,
) => [
  { label: "Health score", value: `${healthScore}/100` },
  { label: "Total projects", value: summary.totalProjects },
  { label: "Ready to advance", value: summary.readyToAdvance },
  { label: "Needs attention", value: summary.needsAttention },
  { label: "Stale", value: summary.staleProjects },
];

export function StatusOverview({ summary, healthScore }: StatusOverviewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-5">
      {metrics(summary, healthScore).map((metric) => (
        <Card key={metric.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {metric.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{metric.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
