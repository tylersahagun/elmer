/**
 * ROI Metrics Component
 * 
 * Addresses skeptic concern: "Show me the ROI, show me it works"
 * 
 * Displays quantified value to build trust:
 * - Time saved per workflow
 * - Hours saved this week/month
 * - Manual vs automated comparison
 */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Clock, HelpCircle, TrendingUp, Zap } from 'lucide-react';

export interface ROIMetricsData {
  /** Hours saved this period */
  hoursSaved: number;
  /** Period label (e.g., "This Week", "This Month") */
  period: string;
  /** Estimated manual time per update in minutes */
  manualTimePerUpdate: number;
  /** Actual automated time per update in minutes */
  automatedTimePerUpdate: number;
  /** Total updates automated */
  totalUpdates: number;
  /** Comparison to previous period */
  vsLastPeriod: number;
  /** Calculation breakdown */
  breakdown: {
    workflowName: string;
    runsCompleted: number;
    timeSavedMinutes: number;
  }[];
}

interface ROIMetricsProps {
  data: ROIMetricsData;
  variant?: 'full' | 'compact';
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function ROIMetrics({ data, variant = 'full' }: ROIMetricsProps) {
  const efficiencyGain = Math.round(
    ((data.manualTimePerUpdate - data.automatedTimePerUpdate) / data.manualTimePerUpdate) * 100
  );

  if (variant === 'compact') {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-green-100 flex items-center justify-center">
                <Clock className="size-5 text-green-700" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-800">{data.hoursSaved}h</div>
                <div className="text-sm text-green-600">saved {data.period.toLowerCase()}</div>
              </div>
            </div>
            <Badge colorVariant="green" variant="outline" className="text-sm">
              <TrendingUp className="size-3 mr-1" />
              {efficiencyGain}% faster
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="size-5 text-yellow-500" />
              Time Saved
            </CardTitle>
            <CardDescription>Automated vs manual CRM updates</CardDescription>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground">
                <HelpCircle className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>
                Based on {data.totalUpdates} automated updates × estimated {data.manualTimePerUpdate} min 
                manual time per update. Actual automated processing takes ~{data.automatedTimePerUpdate} min.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hero stat */}
        <div className="flex items-end gap-4">
          <div>
            <div className="text-4xl font-bold text-green-600">{data.hoursSaved}h</div>
            <div className="text-sm text-muted-foreground">{data.period}</div>
          </div>
          {data.vsLastPeriod !== 0 && (
            <Badge 
              colorVariant={data.vsLastPeriod > 0 ? 'green' : 'rose'} 
              variant="outline"
            >
              <TrendingUp className={`size-3 mr-1 ${data.vsLastPeriod < 0 && 'rotate-180'}`} />
              {Math.abs(data.vsLastPeriod)}% vs last {data.period.toLowerCase().replace('this ', '')}
            </Badge>
          )}
        </div>

        {/* Efficiency comparison */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Manual time per update</span>
            <span className="font-medium">{formatTime(data.manualTimePerUpdate)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Automated time</span>
            <span className="font-medium text-green-600">{formatTime(data.automatedTimePerUpdate)}</span>
          </div>
          <Progress 
            value={100 - (data.automatedTimePerUpdate / data.manualTimePerUpdate) * 100} 
            className="h-2"
          />
          <div className="text-xs text-green-600 text-right">{efficiencyGain}% efficiency gain</div>
        </div>

        {/* Breakdown by workflow */}
        {data.breakdown.length > 0 && (
          <div className="border-t pt-3">
            <div className="text-sm font-medium mb-2">By Workflow</div>
            <div className="space-y-2">
              {data.breakdown.slice(0, 3).map((item) => (
                <div key={item.workflowName} className="flex justify-between text-sm">
                  <span className="text-muted-foreground truncate max-w-[60%]">
                    {item.workflowName}
                  </span>
                  <span>
                    {item.runsCompleted} runs • <span className="text-green-600">{formatTime(item.timeSavedMinutes)}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
