/**
 * Pilot Mode Controls Component
 * 
 * Addresses skeptic concern: "Too much automation too fast"
 * 
 * Enables gradual rollout:
 * - Start with small % of records
 * - Expand as confidence builds
 * - Clear visibility into pilot vs full rollout
 */

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  AlertTriangle, 
  CheckCircle, 
  FlaskConical, 
  HelpCircle, 
  Rocket, 
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useState } from 'react';

export type PilotMode = 'off' | 'percentage' | 'list' | 'criteria';

export interface PilotModeConfig {
  mode: PilotMode;
  percentage: number;
  criteria?: string;
  recordList?: string[];
  excludeNewRecords: boolean;
}

export interface PilotModeStats {
  totalEligible: number;
  inPilot: number;
  successRate: number;
  avgConfidence: number;
}

interface PilotModeControlsProps {
  config: PilotModeConfig;
  stats: PilotModeStats;
  onChange: (config: PilotModeConfig) => void;
  onExpandToFull?: () => void;
  variant?: 'full' | 'banner';
}

export function PilotModeControls({
  config,
  stats,
  onChange,
  onExpandToFull,
  variant = 'full',
}: PilotModeControlsProps) {
  const pilotActive = config.mode !== 'off';
  const pilotPercentage = pilotActive ? Math.round((stats.inPilot / stats.totalEligible) * 100) : 100;
  const readyToExpand = stats.successRate >= 95 && stats.avgConfidence >= 80;

  // Banner variant - compact display
  if (variant === 'banner') {
    if (!pilotActive) return null;
    
    return (
      <Alert className="border-amber-200 bg-amber-50">
        <FlaskConical className="size-4 text-amber-600" />
        <AlertTitle className="text-amber-800 flex items-center gap-2">
          Pilot Mode Active
          <Badge variant="outline" colorVariant="yellow" className="font-normal">
            {pilotPercentage}% of records
          </Badge>
        </AlertTitle>
        <AlertDescription className="text-amber-700">
          Running on {stats.inPilot} of {stats.totalEligible} eligible records.
          {readyToExpand && (
            <Button 
              variant="link" 
              className="text-amber-700 underline p-0 h-auto ml-1"
              onClick={onExpandToFull}
            >
              Ready to expand →
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Full variant - configuration panel
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="size-5 text-amber-500" />
              Pilot Mode
            </CardTitle>
            <CardDescription>
              Start small, expand with confidence
            </CardDescription>
          </div>
          <Switch
            checked={pilotActive}
            onCheckedChange={(checked) => 
              onChange({ ...config, mode: checked ? 'percentage' : 'off' })
            }
          />
        </div>
      </CardHeader>
      {pilotActive && (
        <CardContent className="space-y-6">
          {/* Mode Selection */}
          <div className="space-y-3">
            <Label>Pilot Strategy</Label>
            <RadioGroup
              value={config.mode}
              onValueChange={(mode) => onChange({ ...config, mode: mode as PilotMode })}
              className="grid grid-cols-1 gap-2"
            >
              <div className="flex items-center space-x-2 border rounded-md p-3">
                <RadioGroupItem value="percentage" id="percentage" />
                <Label htmlFor="percentage" className="flex-1 cursor-pointer">
                  <div className="font-medium">Percentage of records</div>
                  <div className="text-sm text-muted-foreground">Run on X% of eligible records</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-md p-3">
                <RadioGroupItem value="criteria" id="criteria" />
                <Label htmlFor="criteria" className="flex-1 cursor-pointer">
                  <div className="font-medium">By criteria</div>
                  <div className="text-sm text-muted-foreground">Only records matching specific rules</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Percentage Slider */}
          {config.mode === 'percentage' && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Coverage: {config.percentage}%</Label>
                <span className="text-sm text-muted-foreground">
                  ~{Math.round(stats.totalEligible * (config.percentage / 100))} records
                </span>
              </div>
              <Slider
                value={[config.percentage]}
                onValueChange={([value]) => onChange({ ...config, percentage: value })}
                min={5}
                max={100}
                step={5}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Conservative (5%)</span>
                <span>Full (100%)</span>
              </div>
            </div>
          )}

          {/* Safety Option */}
          <div className="flex items-center justify-between border rounded-md p-3">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-muted-foreground" />
              <div>
                <div className="font-medium text-sm">Exclude new records</div>
                <div className="text-xs text-muted-foreground">
                  Only run on records created before pilot started
                </div>
              </div>
            </div>
            <Switch
              checked={config.excludeNewRecords}
              onCheckedChange={(checked) => 
                onChange({ ...config, excludeNewRecords: checked })
              }
            />
          </div>

          {/* Stats & Progress */}
          <div className="border rounded-md p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Pilot Progress</span>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="size-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  We recommend expanding to full rollout when success rate is {'>'}95%
                  and average confidence is {'>'}80%.
                </TooltipContent>
              </Tooltip>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold">{stats.successRate}%</div>
                <div className="text-xs text-muted-foreground">Success rate</div>
                <Progress value={stats.successRate} className="h-1 mt-1" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.avgConfidence}%</div>
                <div className="text-xs text-muted-foreground">Avg confidence</div>
                <Progress value={stats.avgConfidence} className="h-1 mt-1" />
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Users className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {stats.inPilot} of {stats.totalEligible} records in pilot
              </span>
            </div>
          </div>

          {/* Expand CTA */}
          {readyToExpand && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="size-4 text-green-600" />
              <AlertTitle className="text-green-800">Ready to expand</AlertTitle>
              <AlertDescription className="text-green-700">
                <p className="mb-2">
                  Your pilot has a {stats.successRate}% success rate with {stats.avgConfidence}% average confidence.
                </p>
                <Button 
                  onClick={onExpandToFull}
                  className="gap-1"
                  size="sm"
                >
                  <Rocket className="size-4" />
                  Expand to Full Rollout
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {!readyToExpand && config.percentage < 100 && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="size-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Building confidence</AlertTitle>
              <AlertDescription className="text-amber-700">
                Keep monitoring pilot results. We&apos;ll suggest expanding when 
                success rate reaches 95% and confidence reaches 80%.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      )}
    </Card>
  );
}

/**
 * Pilot Mode Badge - Shows in workflow list to indicate pilot status
 */
export function PilotModeBadge({ percentage }: { percentage: number }) {
  return (
    <Badge variant="outline" colorVariant="yellow" className="gap-1">
      <FlaskConical className="size-3" />
      {percentage}% Pilot
    </Badge>
  );
}
