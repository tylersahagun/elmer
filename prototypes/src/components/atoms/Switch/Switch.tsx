import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  /** Controlled checked state */
  checked?: boolean;
  /** Default checked state for uncontrolled usage */
  defaultChecked?: boolean;
  /** Callback when checked state changes */
  onCheckedChange?: (checked: boolean) => void;
  /** Size variant */
  size?: 'sm' | 'default' | 'lg';
  /** Color variant */
  variant?: 'default' | 'forest' | 'midnight';
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      className,
      checked: controlledChecked,
      defaultChecked = false,
      onCheckedChange,
      size = 'default',
      variant = 'default',
      disabled,
      ...props
    },
    ref
  ) => {
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
    const isControlled = controlledChecked !== undefined;
    const checked = isControlled ? controlledChecked : internalChecked;

    const handleClick = () => {
      if (disabled) return;
      const newChecked = !checked;
      if (!isControlled) {
        setInternalChecked(newChecked);
      }
      onCheckedChange?.(newChecked);
    };

    const sizeClasses = {
      sm: 'h-5 w-9',
      default: 'h-6 w-11',
      lg: 'h-7 w-14',
    };

    const thumbSizes = {
      sm: 'h-4 w-4',
      default: 'h-5 w-5',
      lg: 'h-6 w-6',
    };

    const thumbTranslate = {
      sm: checked ? 'translate-x-4' : 'translate-x-0.5',
      default: checked ? 'translate-x-5' : 'translate-x-0.5',
      lg: checked ? 'translate-x-7' : 'translate-x-0.5',
    };

    const activeColors = {
      default: 'bg-gradient-to-r from-teal-500 to-purple-500',
      forest: 'bg-gradient-to-r from-emerald-500 to-teal-500',
      midnight: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    };

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          'inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-50',
          sizeClasses[size],
          checked ? activeColors[variant] : 'bg-slate-200 dark:bg-slate-700',
          className
        )}
        {...props}
      >
        <span
          className={cn(
            'pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform duration-200',
            thumbSizes[size],
            thumbTranslate[size]
          )}
        />
      </button>
    );
  }
);
Switch.displayName = 'Switch';

export { Switch };
