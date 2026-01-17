/**
 * CRM Experience End-to-End Prototype
 * 
 * Provides workflow visibility and testing capabilities for CRM automation.
 * 
 * Based on PRD priorities (James's Stack):
 * 1. Workflow Visibility - See what each workflow did
 * 2. Manual Enrollment/Test - Test without triggering other workflows
 * 3. AI Context - Workflow builder knows CRM requirements (future)
 * 4. Property Creation - Create/repurpose HubSpot properties (future)
 * 
 * V2 Iteration (2026-01-16): Added skeptic-focused features
 * - ROI Metrics: Show proof of value
 * - Rollback Preview: Safety net for changes
 * - Pilot Mode: Gradual rollout controls
 * 
 * @see elmer-docs/initiatives/crm-exp-ete/prd.md
 * @see elmer-docs/initiatives/crm-exp-ete/placement-research.md
 */

// Main Components
export { CRMActivityDashboard } from './CRMActivityDashboard';
export { CRMActivityTable } from './CRMActivityTable';
export { CRMActivityFilters } from './CRMActivityFilters';
export { CRMActivityRunDetail } from './CRMActivityRunDetail';
export { ManualEnrollmentPanel } from './ManualEnrollmentPanel';

// V2: Skeptic-focused Components
export { ROIMetrics, type ROIMetricsData } from './ROIMetrics';
export { RollbackPreview, RollbackSafetyBanner } from './RollbackPreview';
export { PilotModeControls, PilotModeBadge, type PilotModeConfig, type PilotModeStats } from './PilotModeControls';

// Types
export type {
  CRMProvider,
  CRMRecord,
  CRMRecordType,
  ActivityFilters,
  ConfidenceLevel,
  DashboardHealth,
  FieldUpdate,
  HealthStatus,
  ManualEnrollmentRequest,
  ManualEnrollmentResult,
  WorkflowActivityStats,
  WorkflowRun,
  WorkflowRunStatus,
  WorkflowSummary,
} from './types';

// Mock Data (for stories and testing)
export {
  getConfidenceColor,
  getRunById,
  getRunsByStatus,
  getRunsByWorkflow,
  getStatusColor,
  mockDashboardHealth,
  mockRecords,
  mockWorkflowRuns,
  mockWorkflowSummaries,
  // V2: Skeptic-focused mock data
  mockROIMetrics,
  mockPilotModeConfig,
  mockPilotModeStats,
  mockPilotModeFullRollout,
  mockPilotModeFullRolloutStats,
  mockPilotModeBuildingConfidence,
} from './mocks/mockData';
