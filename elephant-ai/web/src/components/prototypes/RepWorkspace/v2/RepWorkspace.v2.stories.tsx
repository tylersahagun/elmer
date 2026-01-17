/**
 * Rep Workspace V2 Stories
 * 
 * Post-jury iteration addressing:
 * - Skeptic pass rate: 5% → target 30%+
 * - Overall pass rate: 45% → target 60%+
 * 
 * Key changes:
 * - Added onboarding flow (addresses "learning curve" concern)
 * - Added trust indicators (addresses "understanding what gets synced" friction)
 * - Added data provenance popover (addresses transparency concerns)
 * - Added global status bar (addresses "show me it works" skeptic feedback)
 */

import type { Meta, StoryObj } from '@storybook/react';
import { RepWorkspaceDashboardV2 } from './RepWorkspaceDashboardV2';
import { OnboardingExperience, OnboardingWelcome, OnboardingTourStep, OnboardingComplete } from './OnboardingExperience';
import { BrowserRouter } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useState } from 'react';

// Decorator to wrap all stories with required providers
const withProviders = (Story: React.ComponentType) => (
  <BrowserRouter>
    <TooltipProvider>
      <Story />
    </TooltipProvider>
  </BrowserRouter>
);

const meta = {
  title: 'Prototypes/RepWorkspace/V2_TrustIteration',
  decorators: [withProviders],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## Rep Workspace V2 - Trust & Onboarding Iteration

**Jury Results (V1):** 45% combined pass rate (28% approve, 17% conditional, 55% reject)

### Key Issues Addressed

| Issue | V1 Problem | V2 Solution |
|-------|------------|-------------|
| Skeptic pass rate | 5% | Onboarding + transparency |
| "What gets synced?" | 35 friction mentions | Data provenance popover |
| "Learning curve" | 15 mentions | Guided onboarding tour |
| "Show me it works" | Skeptic feedback | Trust indicators + status bar |

### New Components
- \`OnboardingExperience\` - First-time user flow
- \`SyncStatusBadge\` - Widget-level status
- \`DataProvenancePopover\` - Shows data sources
- \`GlobalStatusBar\` - System health at a glance
        `,
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// DASHBOARD STORIES (V2)
// ============================================

export const V2_Default: Story = {
  name: '1. Dashboard - Default State',
  render: () => (
    <div className="h-screen">
      <RepWorkspaceDashboardV2
        userName="Tyler"
        globalSyncStatus="all-connected"
        lastGlobalSync="2 min ago"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'V2 dashboard with trust indicators on every widget. Notice the sync status badges and info icons.',
      },
    },
  },
};

export const V2_WithSyncIssues: Story = {
  name: '2. Dashboard - Sync Issues',
  render: () => (
    <div className="h-screen">
      <RepWorkspaceDashboardV2
        userName="Tyler"
        globalSyncStatus="partial"
        lastGlobalSync="15 min ago"
        widgetSyncStatuses={{
          actionItems: 'live',
          meetings: 'synced',
          accounts: 'error',
          agentActivity: 'syncing',
        }}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Shows how the dashboard handles sync issues transparently - critical for building trust.',
      },
    },
  },
};

export const V2_StaleData: Story = {
  name: '3. Dashboard - Stale Data Warning',
  render: () => (
    <div className="h-screen">
      <RepWorkspaceDashboardV2
        userName="Tyler"
        globalSyncStatus="partial"
        lastGlobalSync="45 min ago"
        widgetSyncStatuses={{
          actionItems: 'stale',
          meetings: 'stale',
          accounts: 'stale',
          agentActivity: 'stale',
        }}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'When data becomes stale, users see clear indicators encouraging a refresh.',
      },
    },
  },
};

// ============================================
// ONBOARDING STORIES
// ============================================

export const V2_OnboardingWelcome: Story = {
  name: '4. Onboarding - Welcome Screen',
  render: () => (
    <div className="h-screen bg-slate-100">
      <OnboardingWelcome
        userName="Tyler"
        onStartTour={() => console.log('Start tour')}
        onSkip={() => console.log('Skip')}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'First screen users see. Clear value proposition: not a summary tool, but a command center.',
      },
    },
  },
};

export const V2_OnboardingTour: Story = {
  name: '5. Onboarding - Feature Tour',
  render: () => {
    const steps = [
      {
        id: 'action-items',
        title: 'Action Items',
        description: 'Tasks automatically extracted from your recorded meetings. Never forget a follow-up.',
        icon: () => <span>✓</span>,
        highlight: 'top-left',
      },
    ];
    return (
      <div className="h-screen bg-slate-100">
        <OnboardingTourStep
          step={steps[0]}
          currentIndex={0}
          totalSteps={4}
          onNext={() => console.log('Next')}
          onSkip={() => console.log('Skip')}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Each widget gets a spotlight moment with explanation. Addresses "learning curve" concern.',
      },
    },
  },
};

export const V2_OnboardingComplete: Story = {
  name: '6. Onboarding - Setup Complete',
  render: () => (
    <div className="h-screen bg-slate-100">
      <OnboardingComplete
        connectedSources={{
          calendar: true,
          crm: true,
          crmName: 'Salesforce',
          meetingCount: 12,
          accountCount: 47,
        }}
        onGetStarted={() => console.log('Get started')}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Confirmation of connected integrations. Shows concrete numbers to build confidence.',
      },
    },
  },
};

export const V2_OnboardingFull: Story = {
  name: '7. Onboarding - Full Flow',
  render: () => {
    const [showOnboarding, setShowOnboarding] = useState(true);
    return (
      <div className="h-screen">
        <RepWorkspaceDashboardV2 userName="Tyler" />
        {showOnboarding && (
          <OnboardingExperience
            userName="Tyler"
            connectedSources={{
              calendar: true,
              crm: true,
              crmName: 'Salesforce',
              meetingCount: 12,
              accountCount: 47,
            }}
            onComplete={() => setShowOnboarding(false)}
            onSkip={() => setShowOnboarding(false)}
          />
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Complete onboarding flow over the dashboard. Click through to see full experience.',
      },
    },
  },
};

// ============================================
// TRUST BUILDING STORIES
// ============================================

export const V2_DataProvenanceDemo: Story = {
  name: '8. Trust - Data Provenance (Click Info Icon)',
  render: () => (
    <div className="h-screen">
      <RepWorkspaceDashboardV2
        userName="Tyler"
        globalSyncStatus="all-connected"
        lastGlobalSync="Just now"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '**Click the ℹ️ icon on any widget** to see where the data comes from. Critical for skeptics who want to understand what\'s happening.',
      },
    },
  },
};

export const V2_SkepticValueProp: Story = {
  name: '9. Trust - Value Proposition for Skeptics',
  render: () => (
    <div className="h-screen bg-gradient-to-b from-slate-50 to-white p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h2 className="text-2xl font-bold text-slate-900">What Skeptics Told Us</h2>
        
        <div className="space-y-4">
          <blockquote className="border-l-4 border-red-300 pl-4 italic text-slate-600">
            "I'm not opposed to AI, I'm opposed to hype. Show me the ROI, show me it works, then we can talk."
          </blockquote>
          
          <blockquote className="border-l-4 border-red-300 pl-4 italic text-slate-600">
            "My team has tool fatigue. Unless this is absolutely seamless, they won't use it."
          </blockquote>
        </div>

        <h3 className="text-lg font-semibold text-slate-800 pt-4">How V2 Addresses This</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <h4 className="font-medium text-emerald-800">✅ Show, Don't Tell</h4>
            <p className="text-sm text-emerald-700 mt-1">
              Every widget shows exactly where data comes from
            </p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <h4 className="font-medium text-emerald-800">✅ Real-time Feedback</h4>
            <p className="text-sm text-emerald-700 mt-1">
              Sync status visible at all times
            </p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <h4 className="font-medium text-emerald-800">✅ Gentle Onboarding</h4>
            <p className="text-sm text-emerald-700 mt-1">
              Optional tour, can skip anytime
            </p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <h4 className="font-medium text-emerald-800">✅ Transparent AI</h4>
            <p className="text-sm text-emerald-700 mt-1">
              Agent activity shows exactly what AI did
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Design rationale for V2 changes based on skeptic feedback.',
      },
    },
  },
};

// ============================================
// COMPARISON STORY
// ============================================

export const V2_BeforeAfter: Story = {
  name: '10. Comparison - V1 vs V2',
  render: () => (
    <div className="h-screen bg-slate-100 p-6 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
          V1 → V2 Improvements
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* V1 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">V1</span>
              <span className="text-sm text-slate-500">45% pass rate</span>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-red-500">✗</span>
                <span>No onboarding - users dropped in cold</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">✗</span>
                <span>No data source visibility</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">✗</span>
                <span>No sync status indicators</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">✗</span>
                <span>5% skeptic approval</span>
              </li>
            </ul>
          </div>
          
          {/* V2 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-emerald-200 ring-2 ring-emerald-100">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">V2</span>
              <span className="text-sm text-slate-500">Target: 60%+ pass rate</span>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500">✓</span>
                <span>Guided onboarding with skip option</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500">✓</span>
                <span>Data provenance on every widget</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500">✓</span>
                <span>Real-time sync status visible</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500">✓</span>
                <span>Trust-building transparency</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Ready for re-validation → <code className="bg-slate-100 px-2 py-1 rounded">/validate rep-workspace</code>
          </p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Side-by-side comparison of V1 issues and V2 solutions.',
      },
    },
  },
};
