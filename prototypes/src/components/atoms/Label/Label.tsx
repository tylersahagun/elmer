import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      variant: {
        default: 'text-slate-700 dark:text-slate-300',
        muted: 'text-slate-500 dark:text-slate-400',
        error: 'text-red-600 dark:text-red-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {
  /** Show required asterisk */
  required?: boolean;
  /** Optional label */
  optional?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, variant, required, optional, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(labelVariants({ variant, className }))}
        {...props}
      >
        {children}
        {required && <span className="text-red-500 ml-0.5">*</span>}
        {optional && (
          <span className="text-slate-400 dark:text-slate-500 ml-1 font-normal">
            (optional)
          </span>
        )}
      </label>
    );
  }
);
Label.displayName = 'Label';

export { Label, labelVariants };
