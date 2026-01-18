import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SearchInput } from './SearchInput';

const meta: Meta<typeof SearchInput> = {
  title: 'Molecules/SearchInput',
  component: SearchInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Search input with loading state, clear button, and keyboard shortcut hint.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Search...',
  },
};

export const WithShortcut: Story = {
  args: {
    placeholder: 'Search...',
    shortcut: '⌘K',
  },
};

export const Loading: Story = {
  args: {
    placeholder: 'Searching...',
    loading: true,
  },
};

const ControlledTemplate = () => {
  const [value, setValue] = useState('');
  
  return (
    <SearchInput
      placeholder="Search..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onClear={() => setValue('')}
      className="w-64"
    />
  );
};

export const Controlled: Story = {
  render: () => <ControlledTemplate />,
};

const WithValueTemplate = () => {
  const [value, setValue] = useState('user onboarding');
  
  return (
    <SearchInput
      placeholder="Search..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onClear={() => setValue('')}
      className="w-64"
    />
  );
};

export const WithValue: Story = {
  render: () => <WithValueTemplate />,
};

export const InHeader: Story = {
  render: () => (
    <div className="w-full max-w-2xl p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-purple-500" />
        <span className="font-semibold text-slate-900">elmer</span>
      </div>
      <SearchInput 
        placeholder="Search projects, documents..."
        shortcut="⌘K"
        className="flex-1"
      />
      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-slate-100 rounded-lg">
          <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
      </div>
    </div>
  ),
};

const SearchWithResultsTemplate = () => {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (e.target.value) {
      setLoading(true);
      setTimeout(() => setLoading(false), 500);
    }
  };
  
  const mockResults = [
    { title: 'User Onboarding', type: 'Project' },
    { title: 'Dashboard Redesign', type: 'Project' },
    { title: 'Onboarding PRD', type: 'Document' },
  ].filter(r => r.title.toLowerCase().includes(value.toLowerCase()));
  
  return (
    <div className="w-80">
      <SearchInput
        placeholder="Search..."
        value={value}
        onChange={handleChange}
        onClear={() => setValue('')}
        loading={loading}
        shortcut="⌘K"
      />
      {value && !loading && (
        <div className="mt-2 p-2 bg-white rounded-lg border border-slate-200 shadow-lg">
          {mockResults.length > 0 ? (
            <ul className="space-y-1">
              {mockResults.map((result, i) => (
                <li key={i} className="px-3 py-2 rounded-md hover:bg-slate-50 cursor-pointer">
                  <div className="font-medium text-sm text-slate-900">{result.title}</div>
                  <div className="text-xs text-slate-500">{result.type}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-3 py-4 text-center text-sm text-slate-500">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const WithResults: Story = {
  render: () => <SearchWithResultsTemplate />,
};
