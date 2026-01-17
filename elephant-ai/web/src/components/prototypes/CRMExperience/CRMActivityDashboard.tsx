/**
 * CRM Activity Dashboard
 * 
 * Main dashboard showing workflow execution visibility across all CRM automations.
 * 
 * Per PRD Priority #1: "I would love to be able to see what deals it's run on 
 * versus hasn't run on. Wait five minutes, I don't know if it just failed or 
 * never hit triggers."
 * 
 * Per design brief: Dashboard with health status, stats cards, activity timeline
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  GitBranch,
  RefreshCw,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import type { ActivityFilters, DashboardHealth, WorkflowRun, WorkflowSummary } from './types';
import { CRMActivityFilters } from './CRMActivityFilters';
import { CRMActivityTable } from './CRMActivityTable';
import {
  mockDashboardHealth,
  mockPilotModeConfig,
  mockPilotModeStats,
  mockROIMetrics,
  mockWorkflowRuns,
  mockWorkflowSummaries,
} from './mocks/mockData';
import { PilotModeControls, type PilotModeConfig, type PilotModeStats } from './PilotModeControls';
import { ROIMetrics, type ROIMetricsData } from './ROIMetrics';
import { RollbackSafetyBanner } from './RollbackPreview';

interface CRMActivityDashboardProps {
  /** Override mock data for stories */
  runs?: WorkflowRun[];
  workflows?: WorkflowSummary[];
  health?: DashboardHealth;
  /** V2: ROI metrics for skeptic conversion */
  roiMetrics?: ROIMetricsData;
  /** V2: Pilot mode config for gradual rollout */
  pilotConfig?: PilotModeConfig;
  pilotStats?: PilotModeStats;
  /** V2: Show safety features prominently */
  showSafetyFeatures?: boolean;
}

function HealthBanner({ health }: { health: DashboardHealth }) {
  const bgColor = {
    healthy: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    error: 'bg-rose-50 border-rose-200',
  }[health.overall];

  const textColor = {
    healthy: 'text-green-800',
    warning: 'text-yellow-800',
    error: 'text-rose-800',
  }[health.overall];

  const Icon = {
    healthy: CheckCircle,
    warning: AlertTriangle,
    error: XCircle,
  }[health.overall];

  return (
    <div className={`border rounded-lg p-4 ${bgColor}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className={`size-5 ${textColor}`} />
          <div>
            <div className={`font-medium ${textColor}`}>
              {health.overall === 'healthy' ? 'All systems operational' : health.message}
            </div>
            <div className="text-sm text-muted-foreground mt-0.5">
              {health.details.activeWorkflows} active workflows • 
              {health.details.pendingApprovals > 0 && ` ${health.details.pendingApprovals} pending approvals •`}
              {' '}{health.details.avgConfidence}% avg confidence
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <RefreshCw className="size-4 mr-1" />
          Refresh
        </Button>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  variant = 'default',
}: { 
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: { value: number; positive: boolean };
  variant?: 'default' | 'success' | 'warning' | 'error';
}) {
  const iconColors = {
    default: 'text-muted-foreground',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-rose-600',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`size-4 ${iconColors[variant]}`} />
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold">{value}</div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          {trend && (
            <Badge 
              variant="outline" 
              colorVariant={trend.positive ? 'green' : 'rose'}
              className="text-xs"
            >
              <TrendingUp className={`size-3 mr-1 ${!trend.positive && 'rotate-180'}`} />
              {trend.value}%
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function CRMActivityDashboard({ 
  runs = mockWorkflowRuns,
  workflows = mockWorkflowSummaries,
  health = mockDashboardHealth,
  roiMetrics = mockROIMetrics,
  pilotConfig: initialPilotConfig = mockPilotModeConfig,
  pilotStats = mockPilotModeStats,
  showSafetyFeatures = true,
}: CRMActivityDashboardProps) {
  const [pilotConfig, setPilotConfig] = useState<PilotModeConfig>(initialPilotConfig);
  const [filters, setFilters] = useState<ActivityFilters>({
    dateRange: { start: null, end: null },
    status: 'all',
    workflowId: 'all',
    recordType: 'all',
    confidenceLevel: 'all',
    searchQuery: '',
  });

  // Calculate stats
  const stats = useMemo(() => {
    const totalRuns = runs.length;
    const successRuns = runs.filter((r) => r.status === 'success').length;
    const failedRuns = runs.filter((r) => r.status === 'failed').length;
    const pendingRuns = runs.filter((r) => r.status === 'pending').length;
    const runningRuns = runs.filter((r) => r.status === 'running').length;

    return {
      total: totalRuns,
      successRate: totalRuns > 0 ? Math.round((successRuns / totalRuns) * 100) : 0,
      failed: failedRuns,
      pending: pendingRuns,
      running: runningRuns,
    };
  }, [runs]);

  // Apply filters
  const filteredRuns = useMemo(() => {
    return runs.filter((run) => {
      if (filters.status !== 'all' && run.status !== filters.status) return false;
      if (filters.workflowId !== 'all' && run.workflowId !== filters.workflowId) return false;
      if (filters.recordType !== 'all' && run.crmRecord.type !== filters.recordType) return false;
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const searchable = [
          run.workflowName,
          run.crmRecord.name,
          run.meetingTitle || '',
          run.status,
        ].join(' ').toLowerCase();
        if (!searchable.includes(query)) return false;
      }
      return true;
    });
  }, [runs, filters]);

  return (
    <div className="space-y-6">
      {/* V2: Safety Banner - Addresses "What happens when it goes wrong?" */}
      {showSafetyFeatures && <RollbackSafetyBanner />}

      {/* V2: Pilot Mode Banner - Addresses "Too much automation too fast" */}
      {pilotConfig.mode !== 'off' && (
        <PilotModeControls
          config={pilotConfig}
          stats={pilotStats}
          onChange={setPilotConfig}
          variant="banner"
        />
      )}

      {/* Health Banner */}
      <HealthBanner health={health} />

      {/* V2: Combined Stats + ROI Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Runs Today"
          value={stats.total}
          subtitle="Last 24 hours"
          icon={GitBranch}
        />
        <StatCard
          title="Success Rate"
          value={`${stats.successRate}%`}
          subtitle={`${runs.filter((r) => r.status === 'success').length} successful`}
          icon={CheckCircle}
          variant="success"
          trend={{ value: 3, positive: true }}
        />
        <StatCard
          title="Failed"
          value={stats.failed}
          subtitle="Needs attention"
          icon={XCircle}
          variant={stats.failed > 0 ? 'error' : 'default'}
        />
        <StatCard
          title="Pending Approval"
          value={stats.pending}
          subtitle="Human-in-the-loop"
          icon={Clock}
          variant={stats.pending > 0 ? 'warning' : 'default'}
        />
        {/* V2: ROI Compact - Addresses "Show me the ROI" */}
        <ROIMetrics data={roiMetrics} variant="compact" />
      </div>

      {/* Filters */}
      <CRMActivityFilters
        filters={filters}
        onFiltersChange={setFilters}
        workflows={workflows}
      />

      {/* Activity Table */}
      <CRMActivityTable runs={filteredRuns} />
    </div>
  );
}
