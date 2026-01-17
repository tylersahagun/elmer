/**
 * V2 Iteration Stories: Skeptic-focused Features
 * 
 * These stories demonstrate the features added to address jury feedback:
 * - 25% skeptic pass rate -> need proof of ROI
 * - "What happens when it goes wrong?" -> rollback preview
 * - "Too much automation too fast" -> pilot mode
 */

import type { Meta, StoryObj } from '@storybook/react';

import { mockPilotModeBuildingConfidence, mockPilotModeConfig, mockPilotModeStats, mockROIMetrics, mockWorkflowRuns } from './mocks/mockData';
import { PilotModeControls } from './PilotModeControls';
import { ROIMetrics } from './ROIMetrics';
import { RollbackPreview, RollbackSafetyBanner } from './RollbackPreview';

// ================================
// ROI Metrics Stories
// ================================

const ROIMeta: Meta<typeof ROIMetrics> = {
  title: 'Prototypes/CRMExperience/V2-SkepticFeatures/ROIMetrics',
  component: ROIMetrics,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Addresses:** "Show me the ROI, show me it works" (skeptic feedback)

Shows quantified time savings to build trust with skeptical users who need 
proof before committing. Displays hours saved, efficiency gains, and breakdown 
by workflow.
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
};

export default ROIMeta;

type ROIStory = StoryObj<typeof ROIMetrics>;

export const FullView: ROIStory = {
  args: {
    data: mockROIMetrics,
    variant: 'full',
  },
};

export const CompactView: ROIStory = {
  args: {
    data: mockROIMetrics,
    variant: 'compact',
  },
};

export const HighSavings: ROIStory = {
  args: {
    data: {
      ...mockROIMetrics,
      hoursSaved: 42,
      totalUpdates: 315,
      vsLastPeriod: 67,
    },
    variant: 'full',
  },
};

// ================================
// Rollback Preview Stories
// ================================

const RollbackMeta: Meta<typeof RollbackPreview> = {
  title: 'Prototypes/CRMExperience/V2-SkepticFeatures/RollbackPreview',
  component: RollbackPreview,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Addresses:** "What happens when it goes wrong?" (skeptic feedback)

Shows users what a rollback would look like before they execute, 
providing a safety net that builds confidence. Clear indication 
that changes are reversible.
        `,
      },
    },
  },
};

// We need a separate export for this
export const RollbackButton: StoryObj<typeof RollbackPreview> = {
  render: () => (
    <RollbackPreview
      run={mockWorkflowRuns[0]}
      onRollback={async (id) => {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log(`Rolled back run ${id}`);
      }}
    />
  ),
};

export const SafetyBanner: StoryObj<typeof RollbackSafetyBanner> = {
  render: () => (
    <div className="w-[600px]">
      <RollbackSafetyBanner />
    </div>
  ),
};

// ================================
// Pilot Mode Stories
// ================================

const PilotMeta: Meta<typeof PilotModeControls> = {
  title: 'Prototypes/CRMExperience/V2-SkepticFeatures/PilotMode',
  component: PilotModeControls,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Addresses:** "Too much automation too fast" (skeptic feedback)

Enables gradual rollout: start with small percentage of records, 
expand as confidence builds. Helps skeptics feel in control.
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
};

export const FullControls: StoryObj<typeof PilotModeControls> = {
  args: {
    config: mockPilotModeConfig,
    stats: mockPilotModeStats,
    onChange: (config) => console.log('Config changed:', config),
    variant: 'full',
  },
};

export const BannerVariant: StoryObj<typeof PilotModeControls> = {
  args: {
    config: mockPilotModeConfig,
    stats: mockPilotModeStats,
    onChange: (config) => console.log('Config changed:', config),
    variant: 'banner',
  },
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
};

export const ReadyToExpand: StoryObj<typeof PilotModeControls> = {
  args: {
    config: mockPilotModeConfig,
    stats: {
      ...mockPilotModeStats,
      successRate: 98,
      avgConfidence: 92,
    },
    onChange: (config) => console.log('Config changed:', config),
    onExpandToFull: () => console.log('Expanding to full rollout!'),
    variant: 'full',
  },
};

export const BuildingConfidence: StoryObj<typeof PilotModeControls> = {
  args: {
    config: { ...mockPilotModeConfig, percentage: 10 },
    stats: mockPilotModeBuildingConfidence,
    onChange: (config) => console.log('Config changed:', config),
    variant: 'full',
  },
};
