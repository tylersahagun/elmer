/**
 * Mock Sidebar for Context Prototypes
 * 
 * Simplified version of the app sidebar for prototype context.
 * Shows navigation structure without requiring real data.
 */

import { cn } from '@/lib/utils';
import {
  BookOpenIcon,
  CalendarIcon,
  CheckSquare2Icon,
  GitBranchIcon,
  MessageCircleIcon,
  SearchIcon,
  Settings,
  User,
  Building2,
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ElementType;
  isActive?: boolean;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: 'Search', icon: SearchIcon },
  { label: 'My meetings', icon: CalendarIcon },
  { label: 'Action items', icon: CheckSquare2Icon },
  { label: 'Customers', icon: Building2 },
  { label: 'Chats', icon: MessageCircleIcon },
  { label: 'Knowledge base', icon: BookOpenIcon },
  { label: 'Automations', icon: GitBranchIcon, isActive: true },
];

const bottomItems: NavItem[] = [
  { label: 'Settings', icon: Settings },
  { label: 'Account', icon: User },
];

export function MockSidebar({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div
      className={cn(
        'flex flex-col h-full bg-sidebar border-r transition-all duration-200',
        collapsed ? 'w-14' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b">
        <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">AE</span>
        </div>
        {!collapsed && <span className="font-semibold">AskElephant</span>}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors',
              item.isActive
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <item.icon className="size-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
            {!collapsed && item.badge && (
              <span className="ml-auto bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t space-y-1">
        {bottomItems.map((item) => (
          <button
            key={item.label}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <item.icon className="size-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
