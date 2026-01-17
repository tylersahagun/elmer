/**
 * Rollback Preview Component
 * 
 * Addresses skeptic concern: "What happens when it goes wrong?"
 * 
 * Shows users:
 * - What a rollback would look like before they execute
 * - Clear indication that changes are reversible
 * - One-click rollback with preview
 */

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ArrowLeft, CheckCircle, History, RefreshCcw, Shield, Undo2 } from 'lucide-react';
import { useState } from 'react';

import type { FieldUpdate, WorkflowRun } from './types';

interface RollbackPreviewProps {
  run: WorkflowRun;
  onRollback?: (runId: string) => Promise<void>;
}

function RollbackDiff({ update }: { update: FieldUpdate }) {
  return (
    <div className="border rounded-md p-3 bg-muted/30">
      <div className="font-medium text-sm mb-2">{update.fieldLabel}</div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Currently</div>
          <div className="p-2 bg-rose-50 text-rose-700 rounded border border-rose-200 line-through">
            {update.newValue || '(empty)'}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">After Rollback</div>
          <div className="p-2 bg-green-50 text-green-700 rounded border border-green-200">
            {update.previousValue || '(empty)'}
          </div>
        </div>
      </div>
    </div>
  );
}

export function RollbackPreview({ run, onRollback }: RollbackPreviewProps) {
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [rollbackComplete, setRollbackComplete] = useState(false);

  const handleRollback = async () => {
    if (!onRollback) return;
    setIsRollingBack(true);
    try {
      await onRollback(run.id);
      setRollbackComplete(true);
    } finally {
      setIsRollingBack(false);
    }
  };

  const canRollback = run.fieldUpdates.length > 0 && run.status === 'success';

  if (rollbackComplete) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="size-4 text-green-600" />
        <AlertTitle className="text-green-800">Rollback Complete</AlertTitle>
        <AlertDescription className="text-green-700">
          {run.fieldUpdates.length} field(s) on {run.crmRecord.name} have been reverted to their previous values.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={!canRollback}
          className="gap-1"
        >
          <Undo2 className="size-4" />
          Rollback
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="size-5" />
            Rollback Preview
          </DialogTitle>
          <DialogDescription>
            Preview what will change if you rollback this workflow run on{' '}
            <strong>{run.crmRecord.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        {/* Safety Banner */}
        <Alert className="border-blue-200 bg-blue-50">
          <Shield className="size-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Safe to Undo</AlertTitle>
          <AlertDescription className="text-blue-700">
            This rollback only affects AskElephant changes. Other HubSpot workflows won&apos;t be triggered.
          </AlertDescription>
        </Alert>

        {/* Field Changes Preview */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          <div className="text-sm font-medium">Changes to revert:</div>
          {run.fieldUpdates.map((update, idx) => (
            <RollbackDiff key={idx} update={update} />
          ))}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mr-auto">
            <RefreshCcw className="size-4" />
            Rollback window: 7 days
          </div>
          <Button variant="outline" className="gap-1">
            <ArrowLeft className="size-4" />
            Cancel
          </Button>
          <Button 
            onClick={handleRollback}
            disabled={isRollingBack}
            className="gap-1"
          >
            {isRollingBack ? (
              <>
                <RefreshCcw className="size-4 animate-spin" />
                Rolling back...
              </>
            ) : (
              <>
                <Undo2 className="size-4" />
                Confirm Rollback
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Rollback Safety Banner - Shows prominently that changes are reversible
 */
export function RollbackSafetyBanner() {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="py-4">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <Shield className="size-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-blue-900">Changes are reversible</div>
            <div className="text-sm text-blue-700">
              Every CRM update includes a 7-day rollback window. Preview what you&apos;re reverting before you commit.
            </div>
          </div>
          <Badge variant="outline" colorVariant="blue" className="shrink-0">
            7-day window
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
