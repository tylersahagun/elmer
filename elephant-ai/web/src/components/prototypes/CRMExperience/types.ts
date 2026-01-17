/**
 * Types for CRM Experience E2E Prototype
 * 
 * Based on PRD priorities:
 * 1. Workflow Visibility - See what each workflow did
 * 2. Manual Enrollment/Test - Test without triggering other workflows
 * 3. AI Context - Workflow builder knows CRM requirements
 * 4. Property Creation - Create/repurpose HubSpot properties
 */

export type CRMProvider = 'hubspot' | 'salesforce';

export type CRMRecordType = 'deal' | 'contact' | 'company' | 'meeting';

export type WorkflowRunStatus = 'success' | 'failed' | 'pending' | 'running';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface CRMRecord {
  id: string;
  type: CRMRecordType;
  name: string;
  crmUrl: string;
  lastModified: string;
}

export interface FieldUpdate {
  fieldName: string;
  fieldLabel: string;
  previousValue: string | null;
  newValue: string;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  source: 'ai' | 'workflow' | 'user';
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  workflowName: string;
  status: WorkflowRunStatus;
  startedAt: string;
  finishedAt: string | null;
  triggeredBy: 'meeting' | 'manual' | 'schedule';
  
  // CRM-specific
  crmProvider: CRMProvider;
  crmRecord: CRMRecord;
  fieldUpdates: FieldUpdate[];
  
  // Links
  meetingId?: string;
  meetingTitle?: string;
  chatUrl?: string;
  
  // Error info
  errorMessage?: string;
  errorDetails?: string;
}

export interface WorkflowActivityStats {
  totalRuns: number;
  successRate: number;
  failedCount: number;
  pendingApprovals: number;
  lastRunAt: string | null;
}

export interface WorkflowSummary {
  id: string;
  name: string;
  isActive: boolean;
  stats: WorkflowActivityStats;
  lastStatus: WorkflowRunStatus;
}

// Manual Enrollment Types
export interface ManualEnrollmentRequest {
  workflowId: string;
  recordId: string;
  recordType: CRMRecordType;
  isDryRun: boolean;
}

export interface ManualEnrollmentResult {
  success: boolean;
  isDryRun: boolean;
  record: CRMRecord;
  fieldUpdates: FieldUpdate[];
  duration: number;
  errorMessage?: string;
}

// Filter Types
export interface ActivityFilters {
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  status: WorkflowRunStatus | 'all';
  workflowId: string | 'all';
  recordType: CRMRecordType | 'all';
  confidenceLevel: ConfidenceLevel | 'all';
  searchQuery: string;
}

// Health Status for Dashboard
export type HealthStatus = 'healthy' | 'warning' | 'error';

export interface DashboardHealth {
  overall: HealthStatus;
  message: string;
  details: {
    activeWorkflows: number;
    recentFailures: number;
    pendingApprovals: number;
    avgConfidence: number;
  };
}
