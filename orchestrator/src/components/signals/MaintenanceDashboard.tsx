"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Copy, TrendingUp, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MaintenanceDashboardProps {
  workspaceId: string;
  className?: string;
}

export function MaintenanceDashboard({
  workspaceId,
  className,
}: MaintenanceDashboardProps) {
  // Fetch orphan count
  const { data: orphanData, isLoading: isLoadingOrphans } = useQuery({
    queryKey: ["orphan-signals", workspaceId],
    queryFn: async () => {
      const res = await fetch(
        `/api/signals/orphans?workspaceId=${workspaceId}&limit=1`
      );
      if (!res.ok) throw new Error("Failed to fetch orphans");
      return res.json() as Promise<{ total: number; oldestDays: number }>;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch duplicate count
  const { data: duplicateData, isLoading: isLoadingDuplicates } = useQuery({
    queryKey: ["duplicate-signals", workspaceId],
    queryFn: async () => {
      const res = await fetch(
        `/api/signals/duplicates?workspaceId=${workspaceId}&limit=1`
      );
      if (!res.ok) throw new Error("Failed to fetch duplicates");
      return res.json() as Promise<{ total: number }>;
    },
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = isLoadingOrphans || isLoadingDuplicates;

  const metrics = [
    {
      label: "Orphan Signals",
      value: orphanData?.total ?? 0,
      icon: AlertTriangle,
      iconColor: "text-amber-500",
      action: "Review",
      actionUrl: `/workspace/${workspaceId}/signals?status=new&orphans=true`,
      description: orphanData?.oldestDays
        ? `Oldest: ${orphanData.oldestDays} days`
        : "No orphans",
    },
    {
      label: "Duplicate Pairs",
      value: duplicateData?.total ?? 0,
      icon: Copy,
      iconColor: "text-blue-500",
      action: "Merge",
      actionUrl: `/workspace/${workspaceId}/signals?view=duplicates`,
      description: "Potential duplicates",
    },
  ];

  return (
    <Card className={cn("bg-white/5 border-white/10", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <TrendingUp className="h-5 w-5" />
          Signal Health
        </CardTitle>
        <CardDescription className="text-white/60">
          Maintenance metrics for your signal library
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-white/50" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-lg bg-white/5 p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <metric.icon className={cn("h-4 w-4", metric.iconColor)} />
                    <span className="text-sm text-white/70">{metric.label}</span>
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {metric.value}
                  </span>
                </div>
                <p className="text-xs text-white/50">{metric.description}</p>
                {metric.value > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-white/70 hover:text-white hover:bg-white/10"
                    onClick={() => {
                      window.location.href = metric.actionUrl;
                    }}
                  >
                    {metric.action}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
