/**
 * Activity Dashboard in Automations Page Context
 * 
 * Shows how the CRM Activity Dashboard integrates as a new tab
 * within the existing Automations page layout.
 * 
 * Integration Type: New "Activity" tab alongside Workflows, Prompts, Signals, Tags
 * Navigation Entry: Tab in page header
 */

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, ChevronDown, GitBranch, Plus, Search, Tags, Zap } from 'lucide-react';
import { useState } from 'react';

import { CRMActivityDashboard } from '../CRMActivityDashboard';
import { MockSidebar } from './MockSidebar';

// Mock workflows for the workflows tab
const mockWorkflowsList = [
  { id: 'wf-1', name: 'Discovery Call Notes', status: 'active', lastRun: '15m ago' },
  { id: 'wf-2', name: 'Close Won/Loss Analytics', status: 'active', lastRun: '1h ago' },
  { id: 'wf-3', name: 'Contact Enrichment', status: 'active', lastRun: '2h ago' },
  { id: 'wf-4', name: 'Meeting Disposition', status: 'paused', lastRun: '2d ago' },
];

function MockWorkflowsTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg bg-background"
            placeholder="Search workflows..."
          />
        </div>
      </div>
      <div className="border rounded-lg divide-y">
        {mockWorkflowsList.map((wf) => (
          <div
            key={wf.id}
            className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-muted p-2">
                <GitBranch className="size-4" />
              </div>
              <div>
                <div className="font-medium">{wf.name}</div>
                <div className="text-sm text-muted-foreground">Last run: {wf.lastRun}</div>
              </div>
            </div>
            <div
              className={`text-xs px-2 py-1 rounded ${
                wf.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {wf.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockEmptyTab({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        {name === 'Prompts' && <Zap className="size-8 text-muted-foreground" />}
        {name === 'Signals' && <Activity className="size-8 text-muted-foreground" />}
        {name === 'Tags' && <Tags className="size-8 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-medium mb-1">{name}</h3>
      <p className="text-muted-foreground text-sm max-w-sm">
        This tab contains {name.toLowerCase()} management. For this prototype, we're focusing on the
        Activity tab.
      </p>
    </div>
  );
}

interface ActivityInAutomationsPageProps {
  defaultTab?: 'workflows' | 'prompts' | 'signals' | 'tags' | 'activity';
}

export function ActivityInAutomationsPage({
  defaultTab = 'activity',
}: ActivityInAutomationsPageProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <MockSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Page Header */}
        <div className="shrink-0 px-6 pt-6 pb-4 border-b bg-background">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Automations</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Plus className="size-4 mr-1" />
                New workflow
                <ChevronDown className="size-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList>
              <TabsTrigger value="workflows">Workflows</TabsTrigger>
              <TabsTrigger value="prompts">Prompts</TabsTrigger>
              <TabsTrigger value="signals">Signals</TabsTrigger>
              <TabsTrigger value="tags">Tags</TabsTrigger>
              <TabsTrigger value="activity" className="relative">
                Activity
                {/* Badge for pending approvals */}
                <span className="ml-1.5 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  4
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          <Tabs value={activeTab}>
            <TabsContent value="workflows" className="mt-0">
              <MockWorkflowsTab />
            </TabsContent>
            <TabsContent value="prompts" className="mt-0">
              <MockEmptyTab name="Prompts" />
            </TabsContent>
            <TabsContent value="signals" className="mt-0">
              <MockEmptyTab name="Signals" />
            </TabsContent>
            <TabsContent value="tags" className="mt-0">
              <MockEmptyTab name="Tags" />
            </TabsContent>
            <TabsContent value="activity" className="mt-0">
              <CRMActivityDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
