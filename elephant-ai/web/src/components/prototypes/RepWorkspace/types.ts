// Rep Workspace Types

export interface ActionItem {
  id: string;
  title: string;
  meetingTitle: string;
  meetingId: string;
  dueDate?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority?: 'high' | 'medium' | 'low';
}

export interface RecentMeeting {
  id: string;
  title: string;
  date: string;
  company?: string;
  participants: string[];
  keyInsight?: string;
  hasRecording: boolean;
}

export interface Account {
  id: string;
  name: string;
  meetingCount: number;
  dealValue?: number;
  dealStage?: string;
  lastMeeting?: string;
  healthScore?: 'healthy' | 'at_risk' | 'critical';
}

export interface AgentActivity {
  id: string;
  action: string;
  target: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  details?: string;
}

export interface RepWorkspaceData {
  actionItems: ActionItem[];
  recentMeetings: RecentMeeting[];
  accounts: Account[];
  agentActivity: AgentActivity[];
}
