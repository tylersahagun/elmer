"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard, GlassPanel } from "@/components/glass";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { springPresets, staggerContainer, staggerItem } from "@/lib/animations";
import {
  TrendingUp,
  TrendingDown,
  Users,
  MousePointer,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  BarChart3,
  Activity,
  Target,
  Zap,
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  color: string;
}

function MetricCard({ title, value, change, changeLabel, icon: Icon, color }: MetricCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <GlassCard className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs ${
            isPositive ? "text-green-400" : isNegative ? "text-red-400" : "text-muted-foreground"
          }`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : isNegative ? <TrendingDown className="w-3 h-3" /> : null}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-xs text-muted-foreground">{title}</div>
      {changeLabel && (
        <div className="text-[10px] text-muted-foreground mt-1">{changeLabel}</div>
      )}
    </GlassCard>
  );
}

interface ReleaseStageProps {
  stage: "alpha" | "beta" | "ga";
  metrics: {
    users: number;
    engagement: number;
    errors: number;
    satisfaction: number;
  };
  thresholds: {
    users: number;
    engagement: number;
    errors: number;
    satisfaction: number;
  };
}

function ReleaseStageCard({ stage, metrics, thresholds }: ReleaseStageProps) {
  const stageConfig = {
    alpha: { label: "Alpha", color: "bg-cyan-500", description: "Internal testing" },
    beta: { label: "Beta", color: "bg-indigo-500", description: "Limited users" },
    ga: { label: "GA", color: "bg-emerald-500", description: "General availability" },
  };

  const config = stageConfig[stage];

  const checkThreshold = (value: number, threshold: number, inverse = false) => {
    if (inverse) return value <= threshold;
    return value >= threshold;
  };

  const metricsStatus = {
    users: checkThreshold(metrics.users, thresholds.users),
    engagement: checkThreshold(metrics.engagement, thresholds.engagement),
    errors: checkThreshold(metrics.errors, thresholds.errors, true),
    satisfaction: checkThreshold(metrics.satisfaction, thresholds.satisfaction),
  };

  const allPassing = Object.values(metricsStatus).every(Boolean);

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${config.color}`} />
          <div>
            <h3 className="font-semibold">{config.label}</h3>
            <p className="text-xs text-muted-foreground">{config.description}</p>
          </div>
        </div>
        <Badge variant={allPassing ? "default" : "secondary"} className={allPassing ? "bg-green-500/20 text-green-400" : ""}>
          {allPassing ? "Ready to advance" : "In progress"}
        </Badge>
      </div>

      <div className="space-y-3">
        <MetricRow
          label="Active Users"
          value={metrics.users}
          threshold={thresholds.users}
          passing={metricsStatus.users}
          format={(v) => v.toLocaleString()}
        />
        <MetricRow
          label="Engagement Rate"
          value={metrics.engagement}
          threshold={thresholds.engagement}
          passing={metricsStatus.engagement}
          format={(v) => `${v}%`}
        />
        <MetricRow
          label="Error Rate"
          value={metrics.errors}
          threshold={thresholds.errors}
          passing={metricsStatus.errors}
          format={(v) => `${v}%`}
          inverse
        />
        <MetricRow
          label="User Satisfaction"
          value={metrics.satisfaction}
          threshold={thresholds.satisfaction}
          passing={metricsStatus.satisfaction}
          format={(v) => `${v}/5`}
        />
      </div>

      {allPassing && stage !== "ga" && (
        <Button className="w-full mt-4 gap-2" size="sm">
          <ArrowUpRight className="w-4 h-4" />
          Advance to {stage === "alpha" ? "Beta" : "GA"}
        </Button>
      )}
    </GlassCard>
  );
}

function MetricRow({
  label,
  value,
  threshold,
  passing,
  format,
  inverse = false,
}: {
  label: string;
  value: number;
  threshold: number;
  passing: boolean;
  format: (v: number) => string;
  inverse?: boolean;
}) {
  const progress = inverse
    ? Math.max(0, Math.min(100, ((threshold - value) / threshold) * 100 + 100))
    : Math.min(100, (value / threshold) * 100);

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <span className="font-medium">{format(value)}</span>
          <span className="text-xs text-muted-foreground">/ {format(threshold)}</span>
          {passing ? (
            <CheckCircle className="w-3.5 h-3.5 text-green-400" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          )}
        </div>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={springPresets.gentle}
          className={`h-full rounded-full ${passing ? "bg-green-500" : "bg-amber-500"}`}
        />
      </div>
    </div>
  );
}

interface MetricsDashboardProps {
  projectName: string;
}

export function MetricsDashboard({ projectName }: MetricsDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data - would come from PostHog API
  const overviewMetrics = {
    totalUsers: 1234,
    activeUsers: 892,
    engagement: 73,
    avgSessionTime: "4m 32s",
    errorRate: 0.8,
    satisfaction: 4.2,
  };

  const releaseMetrics = {
    alpha: {
      metrics: { users: 50, engagement: 65, errors: 2.1, satisfaction: 3.8 },
      thresholds: { users: 25, engagement: 50, errors: 5, satisfaction: 3.5 },
    },
    beta: {
      metrics: { users: 180, engagement: 58, errors: 1.2, satisfaction: 4.0 },
      thresholds: { users: 100, engagement: 60, errors: 2, satisfaction: 4.0 },
    },
    ga: {
      metrics: { users: 892, engagement: 73, errors: 0.8, satisfaction: 4.2 },
      thresholds: { users: 500, engagement: 70, errors: 1, satisfaction: 4.0 },
    },
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{projectName} Metrics</h2>
          <p className="text-sm text-muted-foreground">PostHog analytics and release tracking</p>
        </div>
        <Button variant="outline" className="gap-2 glass-card border-white/20">
          <Activity className="w-4 h-4" />
          Open PostHog
        </Button>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="glass-card border-white/20">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="release">Release Stages</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            <motion.div variants={staggerItem}>
              <MetricCard
                title="Total Users"
                value={overviewMetrics.totalUsers.toLocaleString()}
                change={12}
                changeLabel="vs last month"
                icon={Users}
                color="bg-purple-500"
              />
            </motion.div>
            <motion.div variants={staggerItem}>
              <MetricCard
                title="Active Users"
                value={overviewMetrics.activeUsers.toLocaleString()}
                change={8}
                changeLabel="vs last week"
                icon={Activity}
                color="bg-teal-500"
              />
            </motion.div>
            <motion.div variants={staggerItem}>
              <MetricCard
                title="Engagement"
                value={`${overviewMetrics.engagement}%`}
                change={5}
                changeLabel="vs last week"
                icon={MousePointer}
                color="bg-pink-500"
              />
            </motion.div>
            <motion.div variants={staggerItem}>
              <MetricCard
                title="Avg Session"
                value={overviewMetrics.avgSessionTime}
                change={15}
                changeLabel="vs last week"
                icon={Clock}
                color="bg-amber-500"
              />
            </motion.div>
            <motion.div variants={staggerItem}>
              <MetricCard
                title="Error Rate"
                value={`${overviewMetrics.errorRate}%`}
                change={-23}
                changeLabel="vs last week"
                icon={AlertTriangle}
                color="bg-red-500"
              />
            </motion.div>
            <motion.div variants={staggerItem}>
              <MetricCard
                title="Satisfaction"
                value={`${overviewMetrics.satisfaction}/5`}
                change={3}
                changeLabel="vs last month"
                icon={Target}
                color="bg-green-500"
              />
            </motion.div>
          </motion.div>

          {/* Chart placeholder */}
          <motion.div variants={staggerItem} className="mt-6">
            <GlassPanel className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Usage Over Time</h3>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">7D</Button>
                  <Button variant="ghost" size="sm">30D</Button>
                  <Button variant="ghost" size="sm">90D</Button>
                </div>
              </div>
              <div className="h-64 flex items-center justify-center border border-dashed border-white/20 rounded-xl">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Chart visualization</p>
                  <p className="text-xs">Connect PostHog to see real data</p>
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        </TabsContent>

        <TabsContent value="release" className="mt-6">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <motion.div variants={staggerItem}>
              <ReleaseStageCard stage="alpha" {...releaseMetrics.alpha} />
            </motion.div>
            <motion.div variants={staggerItem}>
              <ReleaseStageCard stage="beta" {...releaseMetrics.beta} />
            </motion.div>
            <motion.div variants={staggerItem}>
              <ReleaseStageCard stage="ga" {...releaseMetrics.ga} />
            </motion.div>
          </motion.div>

          <motion.div variants={staggerItem} className="mt-6">
            <GlassPanel className="p-6">
              <h3 className="font-semibold mb-4">Automatic Stage Advancement</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configure thresholds for automatic promotion between release stages.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="font-medium text-sm">Alpha → Beta</span>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• 25+ active users</li>
                    <li>• 50%+ engagement rate</li>
                    <li>• &lt;5% error rate</li>
                    <li>• 3.5+ satisfaction score</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-green-400" />
                    <span className="font-medium text-sm">Beta → GA</span>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• 100+ active users</li>
                    <li>• 60%+ engagement rate</li>
                    <li>• &lt;2% error rate</li>
                    <li>• 4.0+ satisfaction score</li>
                  </ul>
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          <GlassPanel className="p-6">
            <h3 className="font-semibold mb-4">Tracked Events</h3>
            <div className="space-y-3">
              {[
                { name: "feature_viewed", count: 2341, change: 12 },
                { name: "feature_clicked", count: 1892, change: 8 },
                { name: "feature_completed", count: 1456, change: 15 },
                { name: "feature_error", count: 23, change: -45 },
                { name: "feedback_submitted", count: 89, change: 34 },
              ].map((event) => (
                <div
                  key={event.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-400" />
                    <code className="text-sm">{event.name}</code>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{event.count.toLocaleString()}</span>
                    <span className={`text-xs flex items-center gap-1 ${
                      event.change > 0 ? "text-green-400" : "text-red-400"
                    }`}>
                      {event.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(event.change)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
