import * as React from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectOption {
  label: string;
  value: string;
}

interface MultiSelectProps {
  groups: Record<string, SelectOption[]>;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  multiple?: boolean;
  variant?: 'default' | 'inverted';
  className?: string;
}

function MultiSelect({
  groups,
  value: controlledValue,
  defaultValue = [],
  onValueChange,
  placeholder = 'Select...',
  multiple = true,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [uncontrolledValue, setUncontrolledValue] = React.useState<string[]>(defaultValue);

  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;

  const handleValueChange = (newValue: string[]) => {
    if (controlledValue === undefined) {
      setUncontrolledValue(newValue);
    }
    onValueChange?.(newValue);
  };

  const allOptions = Object.values(groups).flat();

  const toggleOption = (optionValue: string) => {
    if (multiple) {
      if (value.includes(optionValue)) {
        handleValueChange(value.filter((v) => v !== optionValue));
      } else {
        handleValueChange([...value, optionValue]);
      }
    } else {
      handleValueChange([optionValue]);
      setOpen(false);
    }
  };

  const removeOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    handleValueChange(value.filter((v) => v !== optionValue));
  };

  const selectedLabels = value
    .map((v) => allOptions.find((opt) => opt.value === v)?.label)
    .filter(Boolean);

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm',
          'ring-offset-background placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50'
        )}
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {selectedLabels.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : multiple ? (
            selectedLabels.slice(0, 3).map((label, i) => (
              <span
                key={value[i]}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-secondary rounded-md"
              >
                {label}
                <button
                  type="button"
                  onClick={(e) => removeOption(value[i], e)}
                  className="hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          ) : (
            <span>{selectedLabels[0]}</span>
          )}
          {multiple && selectedLabels.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{selectedLabels.length - 3} more
            </span>
          )}
        </div>
        <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={cn(
              'absolute z-50 top-full left-0 mt-1 w-full',
              'max-h-60 overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md'
            )}
          >
            {Object.entries(groups).map(([groupName, options]) => (
              <div key={groupName}>
                {Object.keys(groups).length > 1 && (
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    {groupName}
                  </div>
                )}
                {options.map((option) => {
                  const isSelected = value.includes(option.value);
                  return (
                    <div
                      key={option.value}
                      onClick={() => toggleOption(option.value)}
                      className={cn(
                        'relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm',
                        'hover:bg-accent hover:text-accent-foreground',
                        isSelected && 'bg-accent/50'
                      )}
                    >
                      {isSelected && (
                        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                      {option.label}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export { MultiSelect };

