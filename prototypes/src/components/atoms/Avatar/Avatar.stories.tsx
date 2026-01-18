import type { Meta, StoryObj } from '@storybook/react';
import { Avatar, AvatarGroup } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Atoms/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Avatar component for user profile images with fallback initials and status indicators.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'default', 'lg', 'xl', '2xl'],
    },
    status: {
      control: 'select',
      options: [undefined, 'online', 'offline', 'away', 'busy'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// BASIC
// ============================================

export const WithImage: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    alt: 'John Doe',
  },
};

export const WithFallback: Story = {
  args: {
    fallback: 'John Doe',
  },
};

export const NoImageNoFallback: Story = {
  args: {},
};

// ============================================
// SIZES
// ============================================

export const ExtraSmall: Story = {
  args: {
    size: 'xs',
    fallback: 'JD',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    fallback: 'JD',
  },
};

export const Default: Story = {
  args: {
    size: 'default',
    fallback: 'JD',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    fallback: 'JD',
  },
};

export const ExtraLarge: Story = {
  args: {
    size: 'xl',
    fallback: 'JD',
  },
};

export const XXLarge: Story = {
  args: {
    size: '2xl',
    fallback: 'JD',
  },
};

// ============================================
// STATUS INDICATORS
// ============================================

export const Online: Story = {
  args: {
    fallback: 'JD',
    status: 'online',
  },
};

export const Offline: Story = {
  args: {
    fallback: 'JD',
    status: 'offline',
  },
};

export const Away: Story = {
  args: {
    fallback: 'JD',
    status: 'away',
  },
};

export const Busy: Story = {
  args: {
    fallback: 'JD',
    status: 'busy',
  },
};

// ============================================
// SHOWCASE
// ============================================

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-end gap-3">
      <Avatar size="xs" fallback="JD" />
      <Avatar size="sm" fallback="JD" />
      <Avatar size="default" fallback="JD" />
      <Avatar size="lg" fallback="JD" />
      <Avatar size="xl" fallback="JD" />
      <Avatar size="2xl" fallback="JD" />
    </div>
  ),
};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar fallback="JD" status="online" />
      <Avatar fallback="JD" status="away" />
      <Avatar fallback="JD" status="busy" />
      <Avatar fallback="JD" status="offline" />
    </div>
  ),
};

export const WithImages: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar
        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
        alt="User 1"
        status="online"
      />
      <Avatar
        src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
        alt="User 2"
        status="away"
      />
      <Avatar
        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
        alt="User 3"
        status="busy"
      />
    </div>
  ),
};

// ============================================
// AVATAR GROUP
// ============================================

export const Group: Story = {
  render: () => (
    <AvatarGroup max={4}>
      <Avatar
        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
        alt="User 1"
      />
      <Avatar
        src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
        alt="User 2"
      />
      <Avatar fallback="JD" />
      <Avatar fallback="AB" />
      <Avatar fallback="CD" />
      <Avatar fallback="EF" />
    </AvatarGroup>
  ),
};

export const GroupSmall: Story = {
  render: () => (
    <AvatarGroup max={3} size="sm">
      <Avatar fallback="JD" />
      <Avatar fallback="AB" />
      <Avatar fallback="CD" />
      <Avatar fallback="EF" />
      <Avatar fallback="GH" />
    </AvatarGroup>
  ),
};

export const GroupLarge: Story = {
  render: () => (
    <AvatarGroup max={5} size="lg">
      <Avatar
        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
        alt="User 1"
      />
      <Avatar
        src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
        alt="User 2"
      />
      <Avatar
        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
        alt="User 3"
      />
    </AvatarGroup>
  ),
};

export const TeamMembers: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <AvatarGroup max={4} size="sm">
          <Avatar fallback="TS" status="online" />
          <Avatar fallback="JD" status="online" />
          <Avatar fallback="AB" status="away" />
          <Avatar fallback="CD" />
          <Avatar fallback="EF" />
        </AvatarGroup>
        <span className="text-sm text-slate-600 dark:text-slate-400">5 team members</span>
      </div>
    </div>
  ),
};
