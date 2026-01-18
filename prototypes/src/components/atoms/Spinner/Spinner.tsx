import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const spinnerVariants = cva('animate-spin', {
  variants: {
    size: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      default: 'h-5 w-5',
      lg: 'h-6 w-6',
      xl: 'h-8 w-8',
    },
    variant: {
      default: 'text-slate-600 dark:text-slate-400',
      primary: 'text-teal-500',
      white: 'text-white',
      forest: 'text-emerald-500',
      midnight: 'text-indigo-500',
    },
  },
  defaultVariants: {
    size: 'default',
    variant: 'default',
  },
});

export interface SpinnerProps
  extends React.SVGAttributes<SVGSVGElement>,
    VariantProps<typeof spinnerVariants> {
  /** Accessible label */
  label?: string;
}

const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, size, variant, label = 'Loading', ...props }, ref) => {
    return (
      <svg
        ref={ref}
        className={cn(spinnerVariants({ size, variant, className }))}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        role="status"
        aria-label={label}
        {...props}
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
    );
  }
);
Spinner.displayName = 'Spinner';

// Loading overlay component
export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether loading is active */
  loading?: boolean;
  /** Spinner size */
  size?: VariantProps<typeof spinnerVariants>['size'];
  /** Loading text */
  text?: string;
  /** Blur the background */
  blur?: boolean;
}

const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ className, loading = true, size = 'lg', text, blur = true, children, ...props }, ref) => {
    if (!loading) return <>{children}</>;

    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        {children}
        <div
          className={cn(
            'absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/80 dark:bg-slate-900/80',
            blur && 'backdrop-blur-sm'
          )}
        >
          <Spinner size={size} variant="primary" />
          {text && (
            <span className="text-sm text-slate-600 dark:text-slate-400">{text}</span>
          )}
        </div>
      </div>
    );
  }
);
LoadingOverlay.displayName = 'LoadingOverlay';

export { Spinner, LoadingOverlay, spinnerVariants };
