/**
 * Trust Indicators for Rep Workspace
 * 
 * Addresses jury feedback:
 * - "Understanding what gets synced" (35 mentions - top friction)
 * - "Show me exactly what it's doing" (skeptic feedback)
 * - "Need transparency into AI decisions"
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  InfoIcon,
  RefreshCwIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  ClockIcon,
  DatabaseIcon,
  CalendarIcon,
  BotIcon,
  LinkIcon,
  ExternalLinkIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type SyncStatus = 'live' | 'synced' | 'syncing' | 'error' | 'stale';

interface SyncStatusBadgeProps {
  status: SyncStatus;
  lastSync?: string;
  className?: string;
}

export function SyncStatusBadge({ status, lastSync, className }: SyncStatusBadgeProps) {
  const statusConfig = {
    live: {
      icon: CheckCircle2Icon,
      label: 'Live',
      color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
    },
    synced: {
      icon: CheckCircle2Icon,
      label: lastSync ? `Synced ${lastSync}` : 'Synced',
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      dot: 'bg-blue-500',
    },
    syncing: {
      icon: RefreshCwIcon,
      label: 'Syncing...',
      color: 'bg-amber-100 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
    },
    error: {
      icon: AlertCircleIcon,
      label: 'Error',
      color: 'bg-red-100 text-red-700 border-red-200',
      dot: 'bg-red-500',
    },
    stale: {
      icon: ClockIcon,
      label: 'Stale',
      color: 'bg-slate-100 text-slate-600 border-slate-200',
      dot: 'bg-slate-400',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1.5 text-[10px] font-medium h-5 px-2',
        config.color,
        className
      )}
    >
      <span className={cn('size-1.5 rounded-full animate-pulse', config.dot)} />
      {status === 'syncing' && <Icon className="size-3 animate-spin" />}
      {config.label}
    </Badge>
  );
}

interface DataSourceInfo {
  name: string;
  icon: React.ElementType;
  description: string;
  lastUpdated: string;
  recordCount?: number;
  link?: string;
}

interface DataProvenancePopoverProps {
  sources: DataSourceInfo[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function DataProvenancePopover({
  sources,
  onRefresh,
  isRefreshing,
}: DataProvenancePopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="p-1 rounded hover:bg-slate-100 transition-colors">
          <InfoIcon className="size-4 text-slate-400 hover:text-slate-600" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="end">
        <div className="p-3 border-b border-slate-100">
          <h4 className="font-semibold text-sm text-slate-900">Data Sources</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Where this information comes from
          </p>
        </div>
        <div className="p-2">
          {sources.map((source, index) => {
            const Icon = source.icon;
            return (
              <div
                key={index}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50"
              >
                <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Icon className="size-4 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900">
                      {source.name}
                    </span>
                    {source.link && (
                      <a
                        href={source.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-700"
                      >
                        <ExternalLinkIcon className="size-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {source.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-400">
                      Updated: {source.lastUpdated}
                    </span>
                    {source.recordCount && (
                      <span className="text-[10px] text-slate-400">
                        • {source.recordCount} records
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="p-2 border-t border-slate-100">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCwIcon
              className={cn('size-3 mr-1.5', isRefreshing && 'animate-spin')}
            />
            {isRefreshing ? 'Refreshing...' : 'Refresh now'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface GlobalStatusBarProps {
  status: 'all-connected' | 'partial' | 'error';
  lastSync: string;
  onViewLogs?: () => void;
}

export function GlobalStatusBar({ status, lastSync, onViewLogs }: GlobalStatusBarProps) {
  const statusConfig = {
    'all-connected': {
      dot: 'bg-emerald-500',
      text: 'All systems connected',
      textColor: 'text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-100',
    },
    partial: {
      dot: 'bg-amber-500',
      text: 'Some integrations need attention',
      textColor: 'text-amber-700',
      bg: 'bg-amber-50 border-amber-100',
    },
    error: {
      dot: 'bg-red-500',
      text: 'Connection issues detected',
      textColor: 'text-red-700',
      bg: 'bg-red-50 border-red-100',
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-2 text-xs border rounded-lg',
        config.bg
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn('size-2 rounded-full', config.dot)} />
        <span className={config.textColor}>{config.text}</span>
        <span className="text-slate-400">•</span>
        <span className="text-slate-500">Last sync: {lastSync}</span>
      </div>
      <button
        onClick={onViewLogs}
        className="text-slate-500 hover:text-slate-700 flex items-center gap-1"
      >
        View logs
        <ExternalLinkIcon className="size-3" />
      </button>
    </div>
  );
}

// Pre-configured data sources for each widget
export const ACTION_ITEMS_SOURCES: DataSourceInfo[] = [
  {
    name: 'AI Extraction',
    icon: BotIcon,
    description: 'Tasks extracted from recorded meetings',
    lastUpdated: 'Just now',
  },
  {
    name: 'Calendar',
    icon: CalendarIcon,
    description: 'Meeting context and participants',
    lastUpdated: '2 min ago',
    recordCount: 12,
  },
];

export const MEETINGS_SOURCES: DataSourceInfo[] = [
  {
    name: 'Calendar Integration',
    icon: CalendarIcon,
    description: 'Synced from your connected calendar',
    lastUpdated: '< 1 min ago',
    recordCount: 47,
  },
  {
    name: 'Recording Service',
    icon: LinkIcon,
    description: 'Audio/video from AskElephant recorder',
    lastUpdated: 'Real-time',
  },
];

export const ACCOUNTS_SOURCES: DataSourceInfo[] = [
  {
    name: 'Salesforce CRM',
    icon: DatabaseIcon,
    description: 'Accounts, deals, and activity',
    lastUpdated: '5 min ago',
    recordCount: 156,
    link: 'https://salesforce.com',
  },
];

export const AGENT_ACTIVITY_SOURCES: DataSourceInfo[] = [
  {
    name: 'Automation Logs',
    icon: BotIcon,
    description: 'All AI agent actions are logged here',
    lastUpdated: 'Real-time',
  },
  {
    name: 'CRM Sync',
    icon: DatabaseIcon,
    description: 'Changes pushed to Salesforce',
    lastUpdated: '3 min ago',
  },
];
