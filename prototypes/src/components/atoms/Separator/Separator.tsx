import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Direction of the separator */
  orientation?: 'horizontal' | 'vertical';
  /** Include decorative elements */
  decorative?: boolean;
  /** Label to show in the middle */
  label?: string;
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = 'horizontal', decorative = true, label, ...props }, ref) => {
    if (label) {
      return (
        <div
          ref={ref}
          className={cn(
            'flex items-center gap-4',
            orientation === 'vertical' && 'flex-col h-full',
            className
          )}
          role={decorative ? 'none' : 'separator'}
          aria-orientation={orientation}
          {...props}
        >
          <div
            className={cn(
              'flex-1 bg-slate-200 dark:bg-slate-700',
              orientation === 'horizontal' ? 'h-px' : 'w-px'
            )}
          />
          <span className="text-xs text-slate-400 dark:text-slate-500 px-2">
            {label}
          </span>
          <div
            className={cn(
              'flex-1 bg-slate-200 dark:bg-slate-700',
              orientation === 'horizontal' ? 'h-px' : 'w-px'
            )}
          />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'shrink-0 bg-slate-200 dark:bg-slate-700',
          orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
          className
        )}
        role={decorative ? 'none' : 'separator'}
        aria-orientation={orientation}
        {...props}
      />
    );
  }
);
Separator.displayName = 'Separator';

export { Separator };
