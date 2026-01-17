/**
 * Mock data for CRM Experience E2E Prototype
 * 
 * Realistic scenarios based on James's feedback:
 * - "I don't know if it just failed or never hit triggers"
 * - "Every piece of data we push should be good enough to send to a board"
 */

import type {
  CRMRecord,
  ConfidenceLevel,
  DashboardHealth,
  FieldUpdate,
  WorkflowRun,
  WorkflowRunStatus,
  WorkflowSummary,
} from '../types';

// Helper to generate relative timestamps
const hoursAgo = (hours: number): string => {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
};

const minutesAgo = (minutes: number): string => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - minutes);
  return date.toISOString();
};

// Mock CRM Records
export const mockRecords: CRMRecord[] = [
  {
    id: 'deal-001',
    type: 'deal',
    name: 'Acme Corp - Enterprise License',
    crmUrl: 'https://app.hubspot.com/contacts/12345/deal/deal-001',
    lastModified: hoursAgo(2),
  },
  {
    id: 'deal-002',
    type: 'deal',
    name: 'TechStart Inc - Pilot Program',
    crmUrl: 'https://app.hubspot.com/contacts/12345/deal/deal-002',
    lastModified: hoursAgo(5),
  },
  {
    id: 'deal-003',
    type: 'deal',
    name: 'Global Systems - Q1 Renewal',
    crmUrl: 'https://app.hubspot.com/contacts/12345/deal/deal-003',
    lastModified: hoursAgo(8),
  },
  {
    id: 'contact-001',
    type: 'contact',
    name: 'Sarah Chen (VP Sales)',
    crmUrl: 'https://app.hubspot.com/contacts/12345/contact/contact-001',
    lastModified: hoursAgo(3),
  },
  {
    id: 'company-001',
    type: 'company',
    name: 'Acme Corporation',
    crmUrl: 'https://app.hubspot.com/contacts/12345/company/company-001',
    lastModified: hoursAgo(6),
  },
];

// Mock Field Updates
const createFieldUpdate = (
  fieldName: string,
  fieldLabel: string,
  previousValue: string | null,
  newValue: string,
  confidence: number
): FieldUpdate => ({
  fieldName,
  fieldLabel,
  previousValue,
  newValue,
  confidence,
  confidenceLevel: confidence >= 80 ? 'high' : confidence >= 50 ? 'medium' : 'low',
  source: 'ai',
});

// Mock Workflow Runs - Realistic scenarios
export const mockWorkflowRuns: WorkflowRun[] = [
  {
    id: 'run-001',
    workflowId: 'wf-discovery-notes',
    workflowName: 'Discovery Call Notes',
    status: 'success',
    startedAt: minutesAgo(15),
    finishedAt: minutesAgo(14),
    triggeredBy: 'meeting',
    crmProvider: 'hubspot',
    crmRecord: mockRecords[0],
    fieldUpdates: [
      createFieldUpdate('deal_stage', 'Deal Stage', 'Qualification', 'Discovery', 92),
      createFieldUpdate('next_steps', 'Next Steps', null, 'Schedule technical deep-dive with engineering team', 88),
      createFieldUpdate('pain_points', 'Pain Points', null, 'Manual CRM updates taking 2+ hours daily', 95),
      createFieldUpdate('budget_range', 'Budget Range', null, '$50k-100k annually', 72),
    ],
    meetingId: 'mtg-001',
    meetingTitle: 'Acme Corp - Initial Discovery',
    chatUrl: '/workspaces/ws-001/chats/chat-001',
  },
  {
    id: 'run-002',
    workflowId: 'wf-close-analytics',
    workflowName: 'Close Won/Loss Analytics',
    status: 'failed',
    startedAt: minutesAgo(45),
    finishedAt: minutesAgo(44),
    triggeredBy: 'meeting',
    crmProvider: 'hubspot',
    crmRecord: mockRecords[1],
    fieldUpdates: [],
    meetingId: 'mtg-002',
    meetingTitle: 'TechStart - Contract Review',
    errorMessage: 'HubSpot API rate limit exceeded',
    errorDetails: 'Request failed after 3 retries. HubSpot returned 429 Too Many Requests.',
  },
  {
    id: 'run-003',
    workflowId: 'wf-discovery-notes',
    workflowName: 'Discovery Call Notes',
    status: 'success',
    startedAt: hoursAgo(2),
    finishedAt: hoursAgo(2),
    triggeredBy: 'meeting',
    crmProvider: 'hubspot',
    crmRecord: mockRecords[2],
    fieldUpdates: [
      createFieldUpdate('deal_stage', 'Deal Stage', 'Proposal', 'Negotiation', 89),
      createFieldUpdate('close_probability', 'Close Probability', '60%', '75%', 82),
      createFieldUpdate('stakeholders', 'Key Stakeholders', 'John (CRO)', 'John (CRO), Maria (CFO), Dev Team Lead', 91),
    ],
    meetingId: 'mtg-003',
    meetingTitle: 'Global Systems - Renewal Discussion',
    chatUrl: '/workspaces/ws-001/chats/chat-003',
  },
  {
    id: 'run-004',
    workflowId: 'wf-contact-enrichment',
    workflowName: 'Contact Enrichment',
    status: 'pending',
    startedAt: minutesAgo(5),
    finishedAt: null,
    triggeredBy: 'meeting',
    crmProvider: 'hubspot',
    crmRecord: mockRecords[3],
    fieldUpdates: [
      createFieldUpdate('job_title', 'Job Title', 'VP', 'VP of Sales Operations', 45),
      createFieldUpdate('linkedin_url', 'LinkedIn URL', null, 'https://linkedin.com/in/sarahchen', 38),
    ],
    meetingId: 'mtg-004',
    meetingTitle: 'Sarah Chen - Intro Call',
  },
  {
    id: 'run-005',
    workflowId: 'wf-discovery-notes',
    workflowName: 'Discovery Call Notes',
    status: 'success',
    startedAt: hoursAgo(4),
    finishedAt: hoursAgo(4),
    triggeredBy: 'meeting',
    crmProvider: 'hubspot',
    crmRecord: mockRecords[4],
    fieldUpdates: [
      createFieldUpdate('industry', 'Industry', 'Technology', 'Enterprise Software', 96),
      createFieldUpdate('company_size', 'Company Size', '100-500', '500-1000', 78),
    ],
    meetingId: 'mtg-005',
    meetingTitle: 'Acme - Company Overview',
    chatUrl: '/workspaces/ws-001/chats/chat-005',
  },
  {
    id: 'run-006',
    workflowId: 'wf-close-analytics',
    workflowName: 'Close Won/Loss Analytics',
    status: 'running',
    startedAt: minutesAgo(1),
    finishedAt: null,
    triggeredBy: 'manual',
    crmProvider: 'hubspot',
    crmRecord: mockRecords[0],
    fieldUpdates: [],
    meetingId: 'mtg-006',
    meetingTitle: 'Acme - Final Review',
  },
];

// Mock Workflow Summaries
export const mockWorkflowSummaries: WorkflowSummary[] = [
  {
    id: 'wf-discovery-notes',
    name: 'Discovery Call Notes',
    isActive: true,
    stats: {
      totalRuns: 156,
      successRate: 94.2,
      failedCount: 9,
      pendingApprovals: 3,
      lastRunAt: minutesAgo(15),
    },
    lastStatus: 'success',
  },
  {
    id: 'wf-close-analytics',
    name: 'Close Won/Loss Analytics',
    isActive: true,
    stats: {
      totalRuns: 42,
      successRate: 78.5,
      failedCount: 9,
      pendingApprovals: 0,
      lastRunAt: minutesAgo(1),
    },
    lastStatus: 'running',
  },
  {
    id: 'wf-contact-enrichment',
    name: 'Contact Enrichment',
    isActive: true,
    stats: {
      totalRuns: 89,
      successRate: 91.0,
      failedCount: 8,
      pendingApprovals: 1,
      lastRunAt: minutesAgo(5),
    },
    lastStatus: 'pending',
  },
  {
    id: 'wf-meeting-disposition',
    name: 'Meeting Disposition',
    isActive: false,
    stats: {
      totalRuns: 23,
      successRate: 100,
      failedCount: 0,
      pendingApprovals: 0,
      lastRunAt: hoursAgo(48),
    },
    lastStatus: 'success',
  },
];

// Mock Dashboard Health
export const mockDashboardHealth: DashboardHealth = {
  overall: 'warning',
  message: '1 workflow has recent failures',
  details: {
    activeWorkflows: 3,
    recentFailures: 2,
    pendingApprovals: 4,
    avgConfidence: 82,
  },
};

// Utility functions for mock data
export const getRunsByStatus = (status: WorkflowRunStatus): WorkflowRun[] =>
  mockWorkflowRuns.filter((run) => run.status === status);

export const getRunsByWorkflow = (workflowId: string): WorkflowRun[] =>
  mockWorkflowRuns.filter((run) => run.workflowId === workflowId);

export const getRunById = (runId: string): WorkflowRun | undefined =>
  mockWorkflowRuns.find((run) => run.id === runId);

export const getConfidenceColor = (level: ConfidenceLevel): string => {
  switch (level) {
    case 'high':
      return 'green';
    case 'medium':
      return 'yellow';
    case 'low':
      return 'rose';
    default:
      return 'stone';
  }
};

export const getStatusColor = (status: WorkflowRunStatus): string => {
  switch (status) {
    case 'success':
      return 'green';
    case 'failed':
      return 'rose';
    case 'running':
      return 'blue';
    case 'pending':
      return 'yellow';
    default:
      return 'stone';
  }
};

// ========================================
// V2 ITERATION: Skeptic-focused additions
// ========================================

import type { ROIMetricsData } from '../ROIMetrics';
import type { PilotModeConfig, PilotModeStats } from '../PilotModeControls';

/**
 * Mock ROI Metrics
 * Addresses skeptic concern: "Show me the ROI, show me it works"
 */
export const mockROIMetrics: ROIMetricsData = {
  hoursSaved: 12.5,
  period: 'This Week',
  manualTimePerUpdate: 8, // 8 minutes manual
  automatedTimePerUpdate: 0.5, // 30 seconds automated
  totalUpdates: 94,
  vsLastPeriod: 23, // 23% more than last week
  breakdown: [
    { workflowName: 'Discovery Call Notes', runsCompleted: 45, timeSavedMinutes: 337 },
    { workflowName: 'Contact Enrichment', runsCompleted: 32, timeSavedMinutes: 240 },
    { workflowName: 'Close Won/Loss Analytics', runsCompleted: 17, timeSavedMinutes: 127 },
  ],
};

/**
 * Mock Pilot Mode Config
 * Addresses skeptic concern: "Too much automation too fast"
 */
export const mockPilotModeConfig: PilotModeConfig = {
  mode: 'percentage',
  percentage: 25,
  excludeNewRecords: true,
};

export const mockPilotModeStats: PilotModeStats = {
  totalEligible: 450,
  inPilot: 112,
  successRate: 96.4,
  avgConfidence: 84,
};

// Full rollout pilot config (for comparison)
export const mockPilotModeFullRollout: PilotModeConfig = {
  mode: 'off',
  percentage: 100,
  excludeNewRecords: false,
};

export const mockPilotModeFullRolloutStats: PilotModeStats = {
  totalEligible: 450,
  inPilot: 450,
  successRate: 94.2,
  avgConfidence: 82,
};

// Building confidence scenario (lower metrics)
export const mockPilotModeBuildingConfidence: PilotModeStats = {
  totalEligible: 450,
  inPilot: 45,
  successRate: 78,
  avgConfidence: 68,
};
