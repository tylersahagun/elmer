/**
 * Rep Workspace In Page Context
 *
 * Shows the Rep Workspace dashboard as it would appear integrated
 * into the AskElephant app with full navigation sidebar and
 * optional global chat panel.
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { RepWorkspaceDashboard } from '../RepWorkspaceDashboard';
import { MockSidebar } from './MockSidebar';
import { MockGlobalChat } from './MockGlobalChat';

interface RepWorkspaceInPageProps {
  /** Whether to show the global chat panel */
  showChat?: boolean;
  /** Initial sidebar collapsed state */
  sidebarCollapsed?: boolean;
  /** User's display name */
  userName?: string;
}

export function RepWorkspaceInPage({
  showChat = false,
  sidebarCollapsed = false,
  userName = 'Tyler',
}: RepWorkspaceInPageProps) {
  const [activeNav, setActiveNav] = useState('workspace');
  const [collapsed, setCollapsed] = useState(sidebarCollapsed);
  const [chatOpen, setChatOpen] = useState(showChat);

  const handleNavClick = (itemId: string) => {
    setActiveNav(itemId);
    // In real app, this would navigate to the route
    console.log('Navigate to:', itemId);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50">
      {/* Sidebar */}
      <MockSidebar
        activeItem={activeNav}
        collapsed={collapsed}
        onItemClick={handleNavClick}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-hidden">
        <RepWorkspaceDashboard
          userName={userName}
          onOpenChat={() => setChatOpen(true)}
          onViewAllActionItems={() => handleNavClick('action-items')}
          onViewAllMeetings={() => handleNavClick('meetings')}
          onViewAllAccounts={() => handleNavClick('customers')}
        />
      </main>

      {/* Global Chat Panel */}
      {chatOpen && <MockGlobalChat open={chatOpen} onClose={() => setChatOpen(false)} />}
    </div>
  );
}
