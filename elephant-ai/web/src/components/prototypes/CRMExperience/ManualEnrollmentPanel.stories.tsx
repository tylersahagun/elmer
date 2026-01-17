/**
 * Manual Enrollment Panel Stories
 * 
 * Standalone stories for the test workflow panel.
 * For integrated context views, see CRMExperience.context.stories.tsx
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ManualEnrollmentPanel } from './ManualEnrollmentPanel';

const meta: Meta<typeof ManualEnrollmentPanel> = {
  title: 'Prototypes/CRMExperience/ManualEnrollmentPanel',
  component: ManualEnrollmentPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## Manual Enrollment Panel

Side panel for testing workflows on specific records. This is **Priority #2** in James's Stack.

### Key Features:
- Search and select HubSpot records
- Dry run mode (preview without changes)
- Execute mode (actually update, but isolated)
- Shows field-by-field confidence scores
- Does NOT trigger other HubSpot workflows

### Problem It Solves:
> "Part of the reason I haven't built a close won workflow is because to test something, 
> I have to mark a stage as close won. So I'm triggering 40 other things."

### Integration Location:
"Test" button in workflow detail page header → Opens this panel
        `,
      },
    },
  },
  tags: ['autodocs'],
  args: {
    workflowId: 'wf-discovery-notes',
    workflowName: 'Discovery Call Notes',
    open: true,
    onClose: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Panel in initial state - select a record
 */
export const SelectRecord: Story = {};

/**
 * Panel for a different workflow
 */
export const CloseWonWorkflow: Story = {
  args: {
    workflowId: 'wf-close-analytics',
    workflowName: 'Close Won/Loss Analytics',
  },
};

/**
 * Contact enrichment workflow
 */
export const ContactEnrichment: Story = {
  args: {
    workflowId: 'wf-contact-enrichment',
    workflowName: 'Contact Enrichment',
  },
};
