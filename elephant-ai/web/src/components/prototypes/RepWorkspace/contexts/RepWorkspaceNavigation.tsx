/**
 * Rep Workspace Navigation Context
 *
 * Shows how the Rep Workspace navigation item appears in the sidebar,
 * demonstrating the discovery path for users.
 */

import { cn } from '@/lib/utils';
import { MockSidebar } from './MockSidebar';

interface RepWorkspaceNavigationProps {
  /** Which view to show */
  variant: 'expanded' | 'collapsed' | 'comparison';
  /** Whether to highlight the workspace item */
  highlightWorkspace?: boolean;
}

export function RepWorkspaceNavigation({
  variant = 'expanded',
  highlightWorkspace = true,
}: RepWorkspaceNavigationProps) {
  if (variant === 'comparison') {
    return (
      <div className="flex gap-12 p-8 bg-slate-100 min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
            Expanded
          </h3>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[400px]">
            <MockSidebar
              activeItem={highlightWorkspace ? 'workspace' : 'meetings'}
              collapsed={false}
            />
          </div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
            Collapsed
          </h3>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[400px]">
            <MockSidebar
              activeItem={highlightWorkspace ? 'workspace' : 'meetings'}
              collapsed={true}
            />
          </div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
            Other Page Selected
          </h3>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[400px]">
            <MockSidebar activeItem="meetings" collapsed={false} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-100 min-h-[500px] flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[400px]">
        <MockSidebar
          activeItem={highlightWorkspace ? 'workspace' : 'meetings'}
          collapsed={variant === 'collapsed'}
        />
      </div>
    </div>
  );
}
