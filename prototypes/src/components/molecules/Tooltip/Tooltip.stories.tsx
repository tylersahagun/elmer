import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from './Tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'Molecules/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Tooltip component for displaying additional information on hover.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    side: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
    },
    delay: {
      control: 'number',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    content: 'This is a tooltip',
    children: (
      <button className="px-4 py-2 bg-slate-100 rounded-lg text-sm">
        Hover me
      </button>
    ),
  },
};

export const Top: Story = {
  args: {
    content: 'Tooltip on top',
    side: 'top',
    children: (
      <button className="px-4 py-2 bg-slate-100 rounded-lg text-sm">
        Top
      </button>
    ),
  },
};

export const Right: Story = {
  args: {
    content: 'Tooltip on right',
    side: 'right',
    children: (
      <button className="px-4 py-2 bg-slate-100 rounded-lg text-sm">
        Right
      </button>
    ),
  },
};

export const Bottom: Story = {
  args: {
    content: 'Tooltip on bottom',
    side: 'bottom',
    children: (
      <button className="px-4 py-2 bg-slate-100 rounded-lg text-sm">
        Bottom
      </button>
    ),
  },
};

export const Left: Story = {
  args: {
    content: 'Tooltip on left',
    side: 'left',
    children: (
      <button className="px-4 py-2 bg-slate-100 rounded-lg text-sm">
        Left
      </button>
    ),
  },
};

export const WithIcon: Story = {
  render: () => (
    <Tooltip content="Edit this item">
      <button className="p-2 hover:bg-slate-100 rounded-lg">
        <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
    </Tooltip>
  ),
};

export const AllPositions: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-16 p-8">
      <Tooltip content="I'm on top" side="top">
        <button className="px-4 py-2 bg-slate-100 rounded-lg text-sm">Top</button>
      </Tooltip>
      <div className="flex gap-32">
        <Tooltip content="I'm on the left" side="left">
          <button className="px-4 py-2 bg-slate-100 rounded-lg text-sm">Left</button>
        </Tooltip>
        <Tooltip content="I'm on the right" side="right">
          <button className="px-4 py-2 bg-slate-100 rounded-lg text-sm">Right</button>
        </Tooltip>
      </div>
      <Tooltip content="I'm on bottom" side="bottom">
        <button className="px-4 py-2 bg-slate-100 rounded-lg text-sm">Bottom</button>
      </Tooltip>
    </div>
  ),
};

export const Toolbar: Story = {
  render: () => (
    <div className="flex items-center gap-1 p-2 bg-white rounded-xl border border-slate-200 shadow-sm">
      <Tooltip content="Add new item">
        <button className="p-2 hover:bg-slate-100 rounded-lg">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </Tooltip>
      <Tooltip content="Edit">
        <button className="p-2 hover:bg-slate-100 rounded-lg">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </Tooltip>
      <Tooltip content="Delete">
        <button className="p-2 hover:bg-slate-100 rounded-lg text-red-500">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </Tooltip>
    </div>
  ),
};
