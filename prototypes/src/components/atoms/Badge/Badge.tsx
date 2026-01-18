import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
        primary: 'bg-gradient-to-r from-teal-500 to-purple-500 text-white',
        secondary: 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
        success: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400',
        warning: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400',
        error: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400',
        info: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400',
        outline: 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300',
        // Elmer theme variants
        forest: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
        midnight: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-400',
        aurora: 'bg-gradient-to-r from-teal-500/20 via-purple-500/20 to-pink-500/20 text-purple-700 dark:text-purple-400',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        default: 'text-xs px-2.5 py-1',
        lg: 'text-sm px-3 py-1.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Optional dot indicator */
  dot?: boolean;
  /** Dot color - uses variant color by default */
  dotColor?: string;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, dot, dotColor, children, ...props }, ref) => {
    const dotColorMap: Record<string, string> = {
      default: 'bg-slate-500',
      primary: 'bg-white',
      secondary: 'bg-slate-500',
      success: 'bg-emerald-500',
      warning: 'bg-amber-500',
      error: 'bg-red-500',
      info: 'bg-blue-500',
      outline: 'bg-slate-400',
      forest: 'bg-emerald-500',
      midnight: 'bg-indigo-500',
      aurora: 'bg-purple-500',
    };

    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}
      >
        {dot && (
          <span
            className={cn('w-1.5 h-1.5 rounded-full', dotColor || dotColorMap[variant || 'default'])}
          />
        )}
        {children}
      </span>
    );
  }
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
