"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard, GlassPanel } from "@/components/glass";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { staggerContainer, staggerItem } from "@/lib/animations";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  FileText,
  Layers,
  MessageSquare,
  Target,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  color: string;
}

interface MetricsThreshold {
  users: number;
  engagement: number;
  errors: number;
  satisfaction: number;
}

interface MetricsValues {
  users: number;
  engagement: number;
  errors: number;
  satisfaction: number;
}

function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  color,
}: MetricCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <GlassCard className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs ${
              isPositive
                ? "text-green-400"
                : isNegative
                  ? "text-red-400"
                  : "text-muted-foreground"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : isNegative ? (
              <TrendingDown className="w-3 h-3" />
            ) : null}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-heading mb-1">{value}</div>
      <div className="text-xs text-muted-foreground">{title}</div>
      {changeLabel && (
        <div className="text-[10px] text-muted-foreground mt-1">
          {changeLabel}
        </div>
      )}
    </GlassCard>
  );
}

interface MetricsDashboardProps {
  projectName: string;
  activity?: {
    documents: number;
    prototypes: number;
    signals?: number;
  };
  posthogConnected?: boolean;
  projectId: string;
  projectStage: "alpha" | "beta" | "ga" | string;
  releaseMetrics?: {
    thresholds?: {
      alpha?: MetricsThreshold;
      beta?: MetricsThreshold;
      ga?: MetricsThreshold;
    };
    current?: MetricsValues;
    autoAdvance?: boolean;
  };
}

export function MetricsDashboard({
  projectName,
  activity,
  posthogConnected = false,
  projectId,
  projectStage,
  releaseMetrics,
}: MetricsDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const thresholds = useMemo(
    () => ({
      alpha: releaseMetrics?.thresholds?.alpha ?? {
        users: 25,
        engagement: 50,
        errors: 5,
        satisfaction: 3.5,
      },
      beta: releaseMetrics?.thresholds?.beta ?? {
        users: 100,
        engagement: 60,
        errors: 2,
        satisfaction: 4,
      },
      ga: releaseMetrics?.thresholds?.ga ?? {
        users: 500,
        engagement: 70,
        errors: 1,
        satisfaction: 4,
      },
    }),
    [releaseMetrics],
  );

  const [currentMetrics, setCurrentMetrics] = useState<MetricsValues>(
    releaseMetrics?.current ?? {
      users: 0,
      engagement: 0,
      errors: 0,
      satisfaction: 0,
    },
  );
  const [autoAdvance, setAutoAdvance] = useState(
    releaseMetrics?.autoAdvance ?? false,
  );

  const [thresholdState, setThresholdState] =
    useState<Record<"alpha" | "beta" | "ga", MetricsThreshold>>(thresholds);

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/metrics`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thresholds: thresholdState,
          current: currentMetrics,
          autoAdvance,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save metrics config");
      }
      toast.success("Metrics configuration saved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save metrics",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateMetricsDoc = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/metrics`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to generate METRICS.md");
      }
      toast.success("Generated METRICS.md");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate metrics",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const evaluateGate = (stage: "alpha" | "beta") => {
    const threshold = thresholdState[stage];
    return (
      currentMetrics.users >= threshold.users &&
      currentMetrics.engagement >= threshold.engagement &&
      currentMetrics.errors <= threshold.errors &&
      currentMetrics.satisfaction >= threshold.satisfaction
    );
  };

  const handleAdvanceStage = async (targetStage: "beta" | "ga") => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: targetStage }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to advance stage");
      }
      toast.success(`Advanced to ${targetStage.toUpperCase()}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to advance stage",
      );
    }
  };

  const activityMetrics = [
    {
      title: "Documents",
      value: activity?.documents ?? 0,
      icon: FileText,
      color: "bg-purple-500",
    },
    {
      title: "Prototypes",
      value: activity?.prototypes ?? 0,
      icon: Layers,
      color: "bg-pink-500",
    },
    {
      title: "Signals",
      value: activity?.signals ?? 0,
      icon: MessageSquare,
      color: "bg-teal-500",
    },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={staggerItem}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-xl font-semibold">{projectName} Metrics</h2>
          <p className="text-sm text-muted-foreground">
            PostHog analytics and release tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2 glass-card border-white/20"
            onClick={handleGenerateMetricsDoc}
            disabled={isGenerating}
          >
            <Activity className="w-4 h-4" />
            {isGenerating ? "Generating..." : "Generate METRICS.md"}
          </Button>
          <Button
            variant="outline"
            className="gap-2 glass-card border-white/20"
            disabled={!posthogConnected}
          >
            <Activity className="w-4 h-4" />
            Open PostHog
          </Button>
        </div>
      </motion.div>

      {/* Project activity */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-2 md:grid-cols-3 gap-4"
      >
        {activityMetrics.map((metric) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            color={metric.color}
          />
        ))}
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="glass-card border-white/20">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="release">Release Stages</TabsTrigger>
          <TabsTrigger value="config">Config</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <GlassPanel className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Usage Over Time</h3>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  7D
                </Button>
                <Button variant="ghost" size="sm">
                  30D
                </Button>
                <Button variant="ghost" size="sm">
                  90D
                </Button>
              </div>
            </div>
            <div className="h-64 flex items-center justify-center border border-dashed border-white/20 rounded-xl">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {posthogConnected
                    ? "No PostHog data available yet"
                    : "Connect PostHog to see metrics"}
                </p>
                <p className="text-xs">Metrics will appear once data flows</p>
              </div>
            </div>
          </GlassPanel>
        </TabsContent>

        <TabsContent value="release" className="mt-6">
          <GlassPanel className="p-6">
            <h3 className="font-semibold mb-4">Release Stage Readiness</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {posthogConnected
                ? "Stage thresholds will appear once metrics are configured."
                : "Connect PostHog to enable release gating."}
            </p>
            <div className="h-40 flex items-center justify-center border border-dashed border-white/20 rounded-xl">
              <div className="text-center text-muted-foreground">
                <Zap className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Release gating not configured</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {projectStage === "alpha" && evaluateGate("alpha") && (
                <Button onClick={() => handleAdvanceStage("beta")}>
                  Advance to Beta
                </Button>
              )}
              {projectStage === "beta" && evaluateGate("beta") && (
                <Button onClick={() => handleAdvanceStage("ga")}>
                  Advance to GA
                </Button>
              )}
            </div>
          </GlassPanel>
        </TabsContent>

        <TabsContent value="config" className="mt-6">
          <GlassPanel className="p-6 space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold">Current Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(
                  ["users", "engagement", "errors", "satisfaction"] as const
                ).map((key) => (
                  <div key={key} className="space-y-1">
                    <label className="text-xs text-muted-foreground capitalize">
                      {key}
                    </label>
                    <Input
                      type="number"
                      value={currentMetrics[key]}
                      onChange={(e) =>
                        setCurrentMetrics((prev) => ({
                          ...prev,
                          [key]: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Thresholds</h3>
              {(["alpha", "beta", "ga"] as const).map((stage) => (
                <div key={stage} className="space-y-2">
                  <p className="text-xs font-medium uppercase text-muted-foreground">
                    {stage}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(
                      ["users", "engagement", "errors", "satisfaction"] as const
                    ).map((key) => (
                      <div key={key} className="space-y-1">
                        <label className="text-xs text-muted-foreground capitalize">
                          {key}
                        </label>
                        <Input
                          type="number"
                          value={thresholdState[stage][key]}
                          onChange={(e) =>
                            setThresholdState((prev) => ({
                              ...prev,
                              [stage]: {
                                ...prev[stage],
                                [key]: Number(e.target.value),
                              },
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={handleSaveConfig} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Metrics Config"}
              </Button>
              <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                <span>Auto-advance stages</span>
                <Switch
                  checked={autoAdvance}
                  onCheckedChange={setAutoAdvance}
                />
              </div>
            </div>
          </GlassPanel>
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          <GlassPanel className="p-6">
            <h3 className="font-semibold mb-4">Tracked Events</h3>
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                PostHog surface map (stubbed)
              </p>
              <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
                {[
                  "Dashboards",
                  "Insights",
                  "Funnels",
                  "Paths",
                  "Retention",
                  "Cohorts",
                  "Feature Flags",
                  "Experiments",
                  "Session Replay",
                  "Surveys",
                  "Notebooks",
                  "Alerts",
                  "Data Management",
                ].map((label) => (
                  <div
                    key={label}
                    className="border border-dashed border-white/20 rounded-lg px-2 py-1"
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
            <div className="h-48 flex items-center justify-center border border-dashed border-white/20 rounded-xl">
              <div className="text-center text-muted-foreground">
                <Target className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No events configured yet</p>
                <p className="text-xs">Define events after PostHog connects</p>
              </div>
            </div>
          </GlassPanel>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
