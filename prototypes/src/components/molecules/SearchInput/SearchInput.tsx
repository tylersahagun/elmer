import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input, InputProps } from '../../atoms/Input';
import { Spinner } from '../../atoms/Spinner';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7 12A5 5 0 107 2a5 5 0 000 10zM14 14l-3.5-3.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const ClearIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4 4l6 6M10 4l-6 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'rightIcon'> {
  /** Loading state */
  loading?: boolean;
  /** Callback when clear button is clicked */
  onClear?: () => void;
  /** Show clear button when there's value */
  clearable?: boolean;
  /** Keyboard shortcut hint (e.g., "⌘K") */
  shortcut?: string;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, loading, onClear, clearable = true, shortcut, value, ...props }, ref) => {
    const hasValue = value !== undefined ? !!value : false;

    const rightElement = (
      <div className="flex items-center gap-1">
        {loading && <Spinner size="xs" variant="default" />}
        {!loading && hasValue && clearable && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Clear search"
          >
            <ClearIcon />
          </button>
        )}
        {!loading && !hasValue && shortcut && (
          <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-mono text-slate-500">
            {shortcut}
          </kbd>
        )}
      </div>
    );

    return (
      <div className={cn('relative', className)}>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <SearchIcon />
        </div>
        <input
          ref={ref}
          type="search"
          value={value}
          className={cn(
            'flex w-full rounded-lg border bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm',
            'text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500',
            'transition-all duration-200',
            'focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
            'border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20',
            'h-10 pl-10 pr-10 text-sm'
          )}
          {...props}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          {rightElement}
        </div>
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';

export { SearchInput };
