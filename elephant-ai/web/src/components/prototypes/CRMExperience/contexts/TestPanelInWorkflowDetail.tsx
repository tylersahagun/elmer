/**
 * Test Panel in Workflow Detail Context
 * 
 * Shows how the Manual Enrollment Panel integrates into the 
 * workflow detail page as a side panel.
 * 
 * Integration Type: Side panel triggered by "Test" button in header
 * Navigation Entry: Button in workflow detail page header
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Beaker,
  ChevronDown,
  Clock,
  GitBranch,
  MoreHorizontal,
  Play,
  Power,
  Settings,
} from 'lucide-react';
import { useState } from 'react';

import { ManualEnrollmentPanel } from '../ManualEnrollmentPanel';
import { MockSidebar } from './MockSidebar';

// Simplified workflow canvas mock
function MockWorkflowCanvas() {
  return (
    <div className="flex-1 bg-muted/30 rounded-lg border-2 border-dashed relative">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            {/* Trigger Node */}
            <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4 w-48">
              <div className="flex items-center gap-2 mb-2">
                <Play className="size-4 text-blue-600" />
                <span className="font-medium text-sm">Trigger</span>
              </div>
              <div className="text-xs text-muted-foreground">When meeting ends</div>
            </div>

            <div className="w-8 h-0.5 bg-gray-300" />

            {/* Action Node */}
            <div className="bg-green-100 border-2 border-green-300 rounded-lg p-4 w-48">
              <div className="flex items-center gap-2 mb-2">
                <GitBranch className="size-4 text-green-600" />
                <span className="font-medium text-sm">HubSpot Agent</span>
              </div>
              <div className="text-xs text-muted-foreground">Update deal properties</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Workflow canvas (simplified for prototype)
          </p>
        </div>
      </div>
    </div>
  );
}

interface TestPanelInWorkflowDetailProps {
  workflowName?: string;
  showTestPanel?: boolean;
}

export function TestPanelInWorkflowDetail({
  workflowName = 'Discovery Call Notes',
  showTestPanel = false,
}: TestPanelInWorkflowDetailProps) {
  const [testPanelOpen, setTestPanelOpen] = useState(showTestPanel);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <MockSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Workflow Header */}
        <div className="shrink-0 px-6 py-4 border-b bg-background">
          {/* Back & Title Row */}
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold">{workflowName}</h1>
                <Badge variant="outline" colorVariant="green">Active</Badge>
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                <Clock className="size-3" />
                Last run: 15 minutes ago
              </div>
            </div>
          </div>

          {/* Actions Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Test Button - NEW */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setTestPanelOpen(true)}
                className="gap-1"
              >
                <Beaker className="size-4" />
                Test
              </Button>
              
              <Button variant="outline" size="sm" className="gap-1">
                <Clock className="size-4" />
                History
              </Button>
              
              <Button variant="outline" size="sm" className="gap-1">
                <Settings className="size-4" />
                Settings
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Power className="size-4" />
                Deactivate
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                Run now
                <ChevronDown className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Workflow Canvas */}
        <div className="flex-1 p-6 overflow-auto">
          <MockWorkflowCanvas />
        </div>
      </div>

      {/* Test Panel */}
      <ManualEnrollmentPanel
        workflowId="wf-discovery-notes"
        workflowName={workflowName}
        open={testPanelOpen}
        onClose={() => setTestPanelOpen(false)}
      />
    </div>
  );
}
