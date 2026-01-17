/**
 * CRM Activity Table
 * 
 * Shows workflow runs with CRM record links and field updates.
 * Per PRD: "List of all records a workflow ran on with timestamps"
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formattedDate, formattedTime } from '@/lib/utils';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Loader2, 
  ChevronRight,
  Building2,
  User,
  Briefcase,
  Calendar,
} from 'lucide-react';
import { useState } from 'react';

import type { CRMRecordType, WorkflowRun, WorkflowRunStatus } from './types';
import { getConfidenceColor, getStatusColor } from './mocks/mockData';
import { CRMActivityRunDetail } from './CRMActivityRunDetail';

interface CRMActivityTableProps {
  runs: WorkflowRun[];
  onRunSelect?: (run: WorkflowRun) => void;
}

const StatusIcon = ({ status }: { status: WorkflowRunStatus }) => {
  switch (status) {
    case 'success':
      return <CheckCircle2 className="size-4 text-green-600" />;
    case 'failed':
      return <AlertCircle className="size-4 text-rose-600" />;
    case 'pending':
      return <Clock className="size-4 text-yellow-600" />;
    case 'running':
      return <Loader2 className="size-4 text-blue-600 animate-spin" />;
    default:
      return null;
  }
};

const RecordTypeIcon = ({ type }: { type: CRMRecordType }) => {
  switch (type) {
    case 'deal':
      return <Briefcase className="size-4 text-muted-foreground" />;
    case 'contact':
      return <User className="size-4 text-muted-foreground" />;
    case 'company':
      return <Building2 className="size-4 text-muted-foreground" />;
    case 'meeting':
      return <Calendar className="size-4 text-muted-foreground" />;
    default:
      return null;
  }
};

export function CRMActivityTable({ runs, onRunSelect }: CRMActivityTableProps) {
  const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleRowClick = (run: WorkflowRun) => {
    if (onRunSelect) {
      onRunSelect(run);
    } else {
      setSelectedRun(run);
      setDetailOpen(true);
    }
  };

  if (runs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Clock className="size-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-1">No activity yet</h3>
        <p className="text-muted-foreground text-sm max-w-sm">
          Workflow runs will appear here when your CRM agents process meetings.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg divide-y">
        {runs.map((run) => (
          <div
            key={run.id}
            className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => handleRowClick(run)}
          >
            {/* Status */}
            <div className="flex items-center gap-2 shrink-0">
              <StatusIcon status={run.status} />
              <Badge variant="outline" colorVariant={getStatusColor(run.status)}>
                {run.status}
              </Badge>
            </div>

            {/* Workflow & Record Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium truncate">{run.workflowName}</span>
                <span className="text-muted-foreground">→</span>
                <div className="flex items-center gap-1.5 min-w-0">
                  <RecordTypeIcon type={run.crmRecord.type} />
                  <span className="truncate text-sm">{run.crmRecord.name}</span>
                </div>
              </div>
              
              {/* Meeting context */}
              {run.meetingTitle && (
                <div className="text-sm text-muted-foreground truncate">
                  From: {run.meetingTitle}
                </div>
              )}
              
              {/* Error message */}
              {run.status === 'failed' && run.errorMessage && (
                <div className="text-sm text-rose-600 truncate mt-1">
                  {run.errorMessage}
                </div>
              )}
            </div>

            {/* Field Updates Summary */}
            <div className="shrink-0 text-right">
              {run.fieldUpdates.length > 0 ? (
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-medium">
                    {run.fieldUpdates.length} field{run.fieldUpdates.length !== 1 ? 's' : ''} updated
                  </span>
                  <div className="flex items-center gap-1">
                    {run.fieldUpdates.slice(0, 3).map((update, idx) => (
                      <Badge 
                        key={idx} 
                        variant="outline" 
                        colorVariant={getConfidenceColor(update.confidenceLevel)}
                        className="text-xs"
                      >
                        {update.confidence}%
                      </Badge>
                    ))}
                    {run.fieldUpdates.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{run.fieldUpdates.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              ) : run.status === 'pending' ? (
                <Badge variant="outline" colorVariant="yellow">
                  Needs review
                </Badge>
              ) : null}
            </div>

            {/* Timestamp & Actions */}
            <div className="shrink-0 flex items-center gap-2">
              <div className="text-right text-sm text-muted-foreground">
                <div>{formattedDate(run.startedAt)}</div>
                <div>{formattedTime(run.startedAt)}</div>
              </div>
              
              {/* External Links */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(run.crmRecord.crmUrl, '_blank');
                  }}
                  title="Open in HubSpot"
                >
                  <ExternalLink className="size-4" />
                </Button>
              </div>
              
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>

      {/* Detail Panel */}
      <CRMActivityRunDetail
        run={selectedRun}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedRun(null);
        }}
      />
    </>
  );
}
