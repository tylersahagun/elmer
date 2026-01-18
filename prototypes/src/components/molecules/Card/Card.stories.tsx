import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Molecules/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Versatile card component with multiple variants for content containers.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'glass', 'ghost', 'gradient', 'aurora'],
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'default', 'lg'],
    },
    interactive: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// VARIANTS
// ============================================

export const Default: Story = {
  args: {
    variant: 'default',
    children: (
      <>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description goes here</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm text-slate-600">This is the card content area.</p>
        </CardContent>
      </>
    ),
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: (
      <>
        <CardHeader>
          <CardTitle>Elevated Card</CardTitle>
          <CardDescription>With shadow elevation</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm text-slate-600">This card has a shadow for depth.</p>
        </CardContent>
      </>
    ),
  },
};

export const Glass: Story = {
  render: () => (
    <div 
      className="p-8 rounded-xl"
      style={{
        background: 'linear-gradient(135deg, #4fd1c5 0%, #9f7aea 50%, #ed64a6 100%)',
      }}
    >
      <Card variant="glass" className="w-80">
        <CardHeader>
          <CardTitle>Glass Card</CardTitle>
          <CardDescription>With blur effect</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm text-slate-600">Glassmorphism style for modern UIs.</p>
        </CardContent>
      </Card>
    </div>
  ),
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: (
      <>
        <CardHeader>
          <CardTitle>Ghost Card</CardTitle>
          <CardDescription>Subtle background</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm text-slate-600">Minimal appearance for secondary content.</p>
        </CardContent>
      </>
    ),
  },
};

export const Gradient: Story = {
  args: {
    variant: 'gradient',
    children: (
      <>
        <CardHeader>
          <CardTitle>Gradient Card</CardTitle>
          <CardDescription>Subtle gradient background</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm text-slate-600">Adds visual interest with gradients.</p>
        </CardContent>
      </>
    ),
  },
};

export const Aurora: Story = {
  args: {
    variant: 'aurora',
    children: (
      <>
        <CardHeader>
          <CardTitle>Aurora Card</CardTitle>
          <CardDescription>elmer gradient border</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm text-slate-600">Features the signature aurora gradient border.</p>
        </CardContent>
      </>
    ),
  },
};

// ============================================
// INTERACTIVE
// ============================================

export const Interactive: Story = {
  args: {
    variant: 'default',
    interactive: true,
    children: (
      <>
        <CardHeader>
          <CardTitle>Interactive Card</CardTitle>
          <CardDescription>Click me!</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm text-slate-600">Hover and click effects.</p>
        </CardContent>
      </>
    ),
  },
};

// ============================================
// USE CASES
// ============================================

export const ProjectCard: Story = {
  render: () => (
    <Card variant="default" interactive className="w-80">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>User Onboarding</CardTitle>
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">Active</span>
        </div>
        <CardDescription>Improving new user experience</CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-500 to-purple-500 border-2 border-white" />
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 border-2 border-white" />
          </div>
          <span className="text-xs text-slate-500">2 members</span>
        </div>
        <div className="flex gap-2">
          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">Research</span>
          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">Design</span>
        </div>
      </CardContent>
      <CardFooter className="border-t border-slate-100 pt-4 mt-4">
        <span className="text-xs text-slate-400">Updated 2h ago</span>
      </CardFooter>
    </Card>
  ),
};

export const MetricCard: Story = {
  render: () => (
    <Card variant="gradient" className="w-64">
      <CardHeader>
        <CardDescription>Active Users</CardDescription>
        <div className="flex items-baseline gap-2">
          <CardTitle className="text-3xl">12,847</CardTitle>
          <span className="text-sm text-emerald-600">+12.5%</span>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-16 flex items-end gap-1">
          {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-teal-500 to-purple-500 rounded-t opacity-70"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  ),
};

export const FeatureCard: Story = {
  render: () => (
    <Card variant="elevated" className="w-80">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-purple-500 flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <CardHeader className="space-y-2">
        <CardTitle>Lightning Fast</CardTitle>
        <CardDescription>
          Experience blazing fast performance with our optimized infrastructure.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
          Learn more →
        </button>
      </CardFooter>
    </Card>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <Card variant="default" className="w-48">
        <CardHeader>
          <CardTitle className="text-base">Default</CardTitle>
        </CardHeader>
      </Card>
      <Card variant="elevated" className="w-48">
        <CardHeader>
          <CardTitle className="text-base">Elevated</CardTitle>
        </CardHeader>
      </Card>
      <Card variant="ghost" className="w-48">
        <CardHeader>
          <CardTitle className="text-base">Ghost</CardTitle>
        </CardHeader>
      </Card>
      <Card variant="gradient" className="w-48">
        <CardHeader>
          <CardTitle className="text-base">Gradient</CardTitle>
        </CardHeader>
      </Card>
      <Card variant="aurora" className="w-48">
        <CardHeader>
          <CardTitle className="text-base">Aurora</CardTitle>
        </CardHeader>
      </Card>
    </div>
  ),
};
