/**
 * CRM Activity Run Detail
 * 
 * Side panel showing detailed information about a workflow run.
 * Per design brief: "Full context: Meeting that triggered, HubSpot record updated, Fields changed"
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { formattedDate, formattedTime } from '@/lib/utils';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';

import type { FieldUpdate, WorkflowRun, WorkflowRunStatus } from './types';
import { getConfidenceColor, getStatusColor } from './mocks/mockData';

interface CRMActivityRunDetailProps {
  run: WorkflowRun | null;
  open: boolean;
  onClose: () => void;
  onRerun?: (run: WorkflowRun) => void;
}

const StatusIcon = ({ status }: { status: WorkflowRunStatus }) => {
  switch (status) {
    case 'success':
      return <CheckCircle2 className="size-5 text-green-600" />;
    case 'failed':
      return <AlertCircle className="size-5 text-rose-600" />;
    case 'pending':
      return <Clock className="size-5 text-yellow-600" />;
    case 'running':
      return <Loader2 className="size-5 text-blue-600 animate-spin" />;
    default:
      return null;
  }
};

function FieldUpdateCard({ update }: { update: FieldUpdate }) {
  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">{update.fieldLabel}</span>
        <Badge 
          variant="outline" 
          colorVariant={getConfidenceColor(update.confidenceLevel)}
          className="text-xs"
        >
          {update.confidence}% confidence
        </Badge>
      </div>
      
      <div className="flex items-center gap-2 text-sm">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground mb-0.5">Previous</div>
          <div className={`truncate ${!update.previousValue ? 'text-muted-foreground italic' : ''}`}>
            {update.previousValue || 'Empty'}
          </div>
        </div>
        
        <ArrowRight className="size-4 text-muted-foreground shrink-0" />
        
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground mb-0.5">New</div>
          <div className="truncate font-medium text-green-700">
            {update.newValue}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CRMActivityRunDetail({ run, open, onClose, onRerun }: CRMActivityRunDetailProps) {
  if (!run) return null;

  const duration = run.finishedAt
    ? Math.round((new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime()) / 1000)
    : null;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:max-w-lg lg:max-w-xl overflow-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-2">
            <StatusIcon status={run.status} />
            <SheetTitle className="text-lg">{run.workflowName}</SheetTitle>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" colorVariant={getStatusColor(run.status)}>
              {run.status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {formattedDate(run.startedAt)} at {formattedTime(run.startedAt)}
            </span>
            {duration !== null && (
              <span className="text-sm text-muted-foreground">
                • {duration}s
              </span>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Error Message */}
          {run.status === 'failed' && run.errorMessage && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="size-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-rose-900">{run.errorMessage}</div>
                  {run.errorDetails && (
                    <div className="text-sm text-rose-700 mt-1">{run.errorDetails}</div>
                  )}
                </div>
              </div>
              {onRerun && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => onRerun(run)}
                >
                  <RefreshCw className="size-4 mr-1" />
                  Retry
                </Button>
              )}
            </div>
          )}

          {/* CRM Record */}
          <div>
            <h3 className="text-sm font-medium mb-2">CRM Record</h3>
            <div className="border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{run.crmRecord.name}</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {run.crmRecord.type}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(run.crmRecord.crmUrl, '_blank')}
                >
                  <ExternalLink className="size-4 mr-1" />
                  Open in HubSpot
                </Button>
              </div>
            </div>
          </div>

          {/* Meeting Context */}
          {run.meetingTitle && (
            <div>
              <h3 className="text-sm font-medium mb-2">Source Meeting</h3>
              <div className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{run.meetingTitle}</div>
                  {run.chatUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={run.chatUrl}>
                        <MessageSquare className="size-4 mr-1" />
                        View Chat
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Field Updates */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">
                Field Updates ({run.fieldUpdates.length})
              </h3>
              {run.fieldUpdates.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  Avg confidence: {Math.round(
                    run.fieldUpdates.reduce((sum, u) => sum + u.confidence, 0) / run.fieldUpdates.length
                  )}%
                </div>
              )}
            </div>

            {run.fieldUpdates.length > 0 ? (
              <div className="space-y-2">
                {run.fieldUpdates.map((update, idx) => (
                  <FieldUpdateCard key={idx} update={update} />
                ))}
              </div>
            ) : run.status === 'pending' ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <Clock className="size-8 text-yellow-600 mx-auto mb-2" />
                <div className="font-medium text-yellow-900">Awaiting Review</div>
                <p className="text-sm text-yellow-700 mt-1">
                  This run requires your approval before field updates are applied.
                </p>
                <div className="flex justify-center gap-2 mt-3">
                  <Button variant="outline" size="sm">Reject</Button>
                  <Button size="sm">Approve</Button>
                </div>
              </div>
            ) : run.status === 'running' ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <Loader2 className="size-8 text-blue-600 mx-auto mb-2 animate-spin" />
                <div className="font-medium text-blue-900">Processing...</div>
                <p className="text-sm text-blue-700 mt-1">
                  The workflow is currently analyzing the meeting and updating fields.
                </p>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No field updates for this run.
              </div>
            )}
          </div>

          {/* Run Metadata */}
          <Separator />
          
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Run ID</span>
              <span className="font-mono">{run.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Workflow ID</span>
              <span className="font-mono">{run.workflowId}</span>
            </div>
            <div className="flex justify-between">
              <span>Triggered by</span>
              <span className="capitalize">{run.triggeredBy}</span>
            </div>
            <div className="flex justify-between">
              <span>CRM Provider</span>
              <span className="capitalize">{run.crmProvider}</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
