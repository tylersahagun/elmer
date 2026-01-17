/**
 * Mock Sidebar Component
 *
 * Simulates the AskElephant navigation sidebar for context prototype views.
 * This shows how Rep Workspace would appear as a navigation item.
 */

import { cn } from '@/lib/utils';
import {
  HomeIcon,
  SearchIcon,
  CalendarIcon,
  CheckSquare2Icon,
  BookUserIcon,
  MessageCircleIcon,
  GitBranchIcon,
  SettingsIcon,
  ChevronLeftIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  isNew?: boolean;
  badge?: string;
}

const navItems: NavItem[] = [
  { id: 'workspace', label: 'My Workspace', icon: HomeIcon, isNew: true },
  { id: 'search', label: 'Search', icon: SearchIcon },
  { id: 'meetings', label: 'My meetings', icon: CalendarIcon },
  { id: 'action-items', label: 'Action items', icon: CheckSquare2Icon, badge: '3' },
  { id: 'customers', label: 'Customers', icon: BookUserIcon },
  { id: 'chats', label: 'Chats', icon: MessageCircleIcon },
  { id: 'automations', label: 'Automations', icon: GitBranchIcon },
];

interface MockSidebarProps {
  activeItem?: string;
  collapsed?: boolean;
  onItemClick?: (itemId: string) => void;
  onToggleCollapse?: () => void;
  className?: string;
}

export function MockSidebar({
  activeItem = 'workspace',
  collapsed = false,
  onItemClick,
  onToggleCollapse,
  className,
}: MockSidebarProps) {
  return (
    <TooltipProvider>
      <aside
        className={cn(
          'flex flex-col h-full bg-white border-r border-slate-200 transition-all duration-200',
          collapsed ? 'w-16' : 'w-56',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-slate-100">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                <span className="text-white text-sm font-bold">🐘</span>
              </div>
              <span className="font-semibold text-slate-800">AskElephant</span>
            </div>
          )}
          {collapsed && (
            <div className="size-8 mx-auto rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">🐘</span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-2 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = activeItem === item.id;
            const Icon = item.icon;

            const button = (
              <button
                key={item.id}
                onClick={() => onItemClick?.(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  collapsed && 'justify-center px-2'
                )}
              >
                <Icon className={cn('size-5 shrink-0', isActive && 'text-indigo-600')} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {item.isNew && (
                      <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-emerald-100 text-emerald-700">
                        NEW
                      </span>
                    )}
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-amber-100 text-amber-700">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent side="right" className="flex items-center gap-2">
                    {item.label}
                    {item.isNew && (
                      <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-emerald-100 text-emerald-700">
                        NEW
                      </span>
                    )}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return button;
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-100 p-2">
          <button
            onClick={() => onItemClick?.('settings')}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors',
              collapsed && 'justify-center px-2'
            )}
          >
            <SettingsIcon className="size-5 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </button>

          {/* Collapse Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className={cn('w-full mt-1', collapsed ? 'px-2' : 'justify-start')}
          >
            <ChevronLeftIcon
              className={cn('size-4 transition-transform', collapsed && 'rotate-180')}
            />
            {!collapsed && <span className="ml-2 text-xs">Collapse</span>}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
