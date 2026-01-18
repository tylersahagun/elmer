import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Button variants using elmer's design system
 * - Aurora gradient for primary actions
 * - Forest/Midnight color schemes for variants
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // Primary - Aurora gradient (cyan → indigo → violet)
        primary: 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]',
        // Secondary - Subtle with border
        secondary: 'bg-white/10 backdrop-blur-sm border border-white/20 text-slate-700 dark:text-white hover:bg-white/20 hover:border-white/30',
        // Destructive - Red for dangerous actions
        destructive: 'bg-red-500 text-white shadow-md hover:bg-red-600 hover:shadow-lg',
        // Outline - Border only
        outline: 'border-2 border-slate-200 dark:border-slate-700 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200',
        // Ghost - Minimal, no background
        ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300',
        // Link - Text only
        link: 'text-teal-600 dark:text-teal-400 underline-offset-4 hover:underline p-0 h-auto',
        // Forest - Green theme
        forest: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]',
        // Midnight - Blue/Indigo theme
        midnight: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]',
      },
      size: {
        xs: 'h-7 px-2 text-xs rounded-md',
        sm: 'h-8 px-3 text-sm',
        default: 'h-10 px-4',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10 p-0',
        'icon-sm': 'h-8 w-8 p-0',
        'icon-lg': 'h-12 w-12 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Loading state - shows spinner and disables button */
  loading?: boolean;
  /** Icon to show before text */
  leftIcon?: React.ReactNode;
  /** Icon to show after text */
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
