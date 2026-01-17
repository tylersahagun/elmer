import type { ActionItem, RecentMeeting, Account, AgentActivity } from './types';

export const mockActionItems: ActionItem[] = [
  {
    id: 'ai-1',
    title: 'Send pricing proposal to Sarah',
    meetingTitle: 'Acme Corp - Discovery Call',
    meetingId: 'eng-1',
    dueDate: '2026-01-17',
    status: 'pending',
    priority: 'high',
  },
  {
    id: 'ai-2',
    title: 'Schedule technical deep-dive with engineering',
    meetingTitle: 'Widget Inc - Product Demo',
    meetingId: 'eng-2',
    status: 'pending',
    priority: 'medium',
  },
  {
    id: 'ai-3',
    title: 'Follow up on contract redlines',
    meetingTitle: 'TechStart - Negotiation',
    meetingId: 'eng-3',
    dueDate: '2026-01-18',
    status: 'in_progress',
    priority: 'high',
  },
];

export const mockRecentMeetings: RecentMeeting[] = [
  {
    id: 'eng-1',
    title: 'Acme Corp - Discovery Call',
    date: '2026-01-16T14:00:00Z',
    company: 'Acme Corp',
    participants: ['Sarah Chen', 'Mike Rodriguez'],
    keyInsight: 'Budget approved for Q1, decision by end of month',
    hasRecording: true,
  },
  {
    id: 'eng-2',
    title: 'Widget Inc - Product Demo',
    date: '2026-01-16T10:00:00Z',
    company: 'Widget Inc',
    participants: ['James Wilson', 'Emily Davis'],
    keyInsight: 'Strong interest in automation features',
    hasRecording: true,
  },
  {
    id: 'eng-3',
    title: 'TechStart - Negotiation',
    date: '2026-01-15T15:30:00Z',
    company: 'TechStart',
    participants: ['Alex Johnson'],
    keyInsight: 'Legal reviewing contract, expect response Friday',
    hasRecording: true,
  },
  {
    id: 'eng-4',
    title: 'DataFlow - QBR Prep',
    date: '2026-01-15T09:00:00Z',
    company: 'DataFlow Systems',
    participants: ['Lisa Park', 'Chris Brown', 'David Kim'],
    hasRecording: false,
  },
];

export const mockAccounts: Account[] = [
  {
    id: 'acc-1',
    name: 'Acme Corp',
    meetingCount: 12,
    dealValue: 85000,
    dealStage: 'Negotiation',
    lastMeeting: '2026-01-16',
    healthScore: 'healthy',
  },
  {
    id: 'acc-2',
    name: 'Widget Inc',
    meetingCount: 8,
    dealValue: 42000,
    dealStage: 'Demo',
    lastMeeting: '2026-01-16',
    healthScore: 'healthy',
  },
  {
    id: 'acc-3',
    name: 'TechStart',
    meetingCount: 5,
    dealValue: 125000,
    dealStage: 'Contract',
    lastMeeting: '2026-01-15',
    healthScore: 'at_risk',
  },
  {
    id: 'acc-4',
    name: 'DataFlow Systems',
    meetingCount: 15,
    dealValue: 200000,
    dealStage: 'Renewal',
    lastMeeting: '2026-01-15',
    healthScore: 'critical',
  },
];

export const mockAgentActivity: AgentActivity[] = [
  {
    id: 'act-1',
    action: 'Updated deal stage',
    target: 'Acme Corp',
    timestamp: '2026-01-16T14:35:00Z',
    status: 'completed',
    details: 'Discovery → Negotiation',
  },
  {
    id: 'act-2',
    action: 'Added next step',
    target: 'Acme Corp',
    timestamp: '2026-01-16T14:36:00Z',
    status: 'completed',
    details: 'Send pricing proposal',
  },
  {
    id: 'act-3',
    action: 'Update probability',
    target: 'TechStart',
    timestamp: '2026-01-16T12:00:00Z',
    status: 'pending',
    details: '60% → 75%',
  },
  {
    id: 'act-4',
    action: 'Log meeting notes',
    target: 'Widget Inc',
    timestamp: '2026-01-16T10:45:00Z',
    status: 'completed',
  },
];
