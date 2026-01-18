import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Molecules/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Tabs component for organizing content into switchable panels.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-96">
      <TabsList>
        <TabsTrigger value="tab1">Overview</TabsTrigger>
        <TabsTrigger value="tab2">Details</TabsTrigger>
        <TabsTrigger value="tab3">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <div className="p-4 bg-slate-50 rounded-lg">
          <h3 className="font-semibold text-slate-900">Overview</h3>
          <p className="text-sm text-slate-600 mt-2">
            This is the overview content. It shows a summary of the main information.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="tab2">
        <div className="p-4 bg-slate-50 rounded-lg">
          <h3 className="font-semibold text-slate-900">Details</h3>
          <p className="text-sm text-slate-600 mt-2">
            This is the details content with more specific information.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="tab3">
        <div className="p-4 bg-slate-50 rounded-lg">
          <h3 className="font-semibold text-slate-900">Settings</h3>
          <p className="text-sm text-slate-600 mt-2">
            Configure your preferences here.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

export const ProjectTabs: Story = {
  render: () => (
    <div className="w-[500px] p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">User Onboarding</h2>
      <Tabs defaultValue="prd">
        <TabsList>
          <TabsTrigger value="prd">PRD</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="research">Research</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
        </TabsList>
        <TabsContent value="prd">
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-lg">
              <h4 className="font-medium text-slate-900 text-sm">Problem Statement</h4>
              <p className="text-xs text-slate-600 mt-1">
                Users struggle to understand the value proposition during first-time use.
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <h4 className="font-medium text-slate-900 text-sm">Success Metrics</h4>
              <ul className="text-xs text-slate-600 mt-1 space-y-1">
                <li>• Activation rate: 50% → 70%</li>
                <li>• Time to first value: 5min → 2min</li>
              </ul>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="design">
          <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg text-center">
            <div className="text-4xl mb-2">🎨</div>
            <p className="text-sm text-slate-600">Design files and prototypes</p>
          </div>
        </TabsContent>
        <TabsContent value="research">
          <div className="space-y-2">
            <div className="p-3 bg-emerald-50 rounded-lg border-l-4 border-emerald-500">
              <p className="text-xs text-slate-700">"I didn't know where to start"</p>
              <p className="text-[10px] text-slate-500 mt-1">— User Interview, Jan 15</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border-l-4 border-amber-500">
              <p className="text-xs text-slate-700">"The empty state was confusing"</p>
              <p className="text-[10px] text-slate-500 mt-1">— User Interview, Jan 12</p>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="status">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-700">Phase</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Design</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-700">Progress</span>
              <span className="text-sm font-medium text-slate-900">65%</span>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  ),
};

export const SettingsTabs: Story = {
  render: () => (
    <div className="w-[600px] p-6 bg-white rounded-xl border border-slate-200">
      <Tabs defaultValue="general">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Workspace Name</label>
              <input 
                defaultValue="elmer Workspace"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea 
                defaultValue="Product management workspace for the elmer team."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none"
              />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="notifications">
          <div className="space-y-3">
            {['Email notifications', 'Push notifications', 'Weekly digest'].map((item) => (
              <div key={item} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-700">{item}</span>
                <button className="w-10 h-6 bg-gradient-to-r from-teal-500 to-purple-500 rounded-full relative">
                  <span className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow" />
                </button>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="appearance">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Theme</label>
              <div className="flex gap-3">
                {['Light', 'Dark', 'System'].map((theme) => (
                  <button
                    key={theme}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium border',
                      theme === 'Light' 
                        ? 'bg-slate-900 text-white border-slate-900' 
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    )}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="integrations">
          <div className="grid grid-cols-2 gap-3">
            {['GitHub', 'Linear', 'Slack', 'Notion'].map((integration) => (
              <div key={integration} className="p-4 bg-slate-50 rounded-lg flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{integration}</span>
                <button className="text-xs text-teal-600 font-medium">Connect</button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  ),
};

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');
