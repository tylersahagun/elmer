import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative w-full rounded-xl p-4 flex gap-3',
  {
    variants: {
      variant: {
        default: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100',
        info: 'bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-100 border border-blue-200 dark:border-blue-800',
        success: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-100 border border-emerald-200 dark:border-emerald-800',
        warning: 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-100 border border-amber-200 dark:border-amber-800',
        error: 'bg-red-50 dark:bg-red-950/50 text-red-900 dark:text-red-100 border border-red-200 dark:border-red-800',
        aurora: 'bg-gradient-to-r from-teal-50 via-purple-50 to-pink-50 dark:from-teal-950/50 dark:via-purple-950/50 dark:to-pink-950/50 border border-purple-200 dark:border-purple-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const iconMap = {
  default: null,
  info: (
    <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  success: (
    <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  aurora: (
    <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  /** Alert title */
  title?: string;
  /** Custom icon (overrides default) */
  icon?: React.ReactNode;
  /** Hide default icon */
  hideIcon?: boolean;
  /** Dismissible callback */
  onDismiss?: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', title, icon, hideIcon, onDismiss, children, ...props }, ref) => {
    const defaultIcon = iconMap[variant || 'default'];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant, className }))}
        {...props}
      >
        {!hideIcon && (icon || defaultIcon) && (
          <div className="flex-shrink-0">{icon || defaultIcon}</div>
        )}
        <div className="flex-1">
          {title && (
            <h5 className="font-medium text-sm mb-1">{title}</h5>
          )}
          <div className="text-sm opacity-90">{children}</div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Dismiss"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);
Alert.displayName = 'Alert';

export { Alert, alertVariants };
