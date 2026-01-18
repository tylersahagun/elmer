import type { Meta, StoryObj } from '@storybook/react';
import { Separator } from './Separator';

const meta: Meta<typeof Separator> = {
  title: 'Atoms/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Separator component for dividing content sections.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-64">
      <p className="text-sm text-slate-600 mb-4">Section one content goes here.</p>
      <Separator />
      <p className="text-sm text-slate-600 mt-4">Section two content goes here.</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex items-center gap-4 h-8">
      <span className="text-sm">Item 1</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Item 2</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Item 3</span>
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="w-64">
      <p className="text-sm text-slate-600 mb-4">Sign in with email</p>
      <Separator label="OR" />
      <p className="text-sm text-slate-600 mt-4">Continue with social</p>
    </div>
  ),
};

export const InForm: Story = {
  render: () => (
    <div className="w-80 p-6 bg-white rounded-xl border border-slate-200 space-y-4">
      <div>
        <h3 className="font-semibold text-slate-900">Personal Information</h3>
        <p className="text-sm text-slate-500">Your basic info</p>
      </div>
      <div className="space-y-2">
        <input
          placeholder="Full name"
          className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"
        />
        <input
          placeholder="Email"
          className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"
        />
      </div>
      
      <Separator />
      
      <div>
        <h3 className="font-semibold text-slate-900">Preferences</h3>
        <p className="text-sm text-slate-500">Customize your experience</p>
      </div>
      <div className="space-y-2">
        <select className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm">
          <option>English</option>
          <option>Spanish</option>
        </select>
      </div>
    </div>
  ),
};

export const InNavigation: Story = {
  render: () => (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
      <button className="text-sm text-slate-700 hover:text-teal-600">Dashboard</button>
      <Separator orientation="vertical" className="h-4" />
      <button className="text-sm text-slate-700 hover:text-teal-600">Projects</button>
      <Separator orientation="vertical" className="h-4" />
      <button className="text-sm text-slate-700 hover:text-teal-600">Settings</button>
    </div>
  ),
};

export const AuthDivider: Story = {
  render: () => (
    <div className="w-80 p-6 bg-white rounded-xl border border-slate-200 space-y-4">
      <button className="w-full h-10 bg-gradient-to-r from-teal-500 to-purple-500 text-white rounded-lg text-sm font-medium">
        Continue with Email
      </button>
      
      <Separator label="or continue with" />
      
      <div className="grid grid-cols-2 gap-3">
        <button className="h-10 border border-slate-200 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-slate-50">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          GitHub
        </button>
        <button className="h-10 border border-slate-200 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-slate-50">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>
      </div>
    </div>
  ),
};
