import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '../../atoms/Label';
import { Input, InputProps } from '../../atoms/Input';

export interface FormFieldProps extends InputProps {
  /** Field label */
  label?: string;
  /** Helper text shown below input */
  helperText?: string;
  /** Error message (overrides helperText) */
  error?: string;
  /** Mark field as required */
  required?: boolean;
  /** Mark field as optional */
  optional?: boolean;
  /** Field ID (auto-generated if not provided) */
  id?: string;
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, helperText, error, required, optional, id: providedId, className, ...inputProps }, ref) => {
    const generatedId = React.useId();
    const id = providedId || generatedId;

    return (
      <div className={cn('space-y-1.5', className)}>
        {label && (
          <Label
            htmlFor={id}
            required={required}
            optional={optional}
            variant={error ? 'error' : 'default'}
          >
            {label}
          </Label>
        )}
        <Input
          ref={ref}
          id={id}
          variant={error ? 'error' : inputProps.variant}
          aria-describedby={error || helperText ? `${id}-helper` : undefined}
          aria-invalid={!!error}
          {...inputProps}
        />
        {(error || helperText) && (
          <p
            id={`${id}-helper`}
            className={cn(
              'text-xs',
              error ? 'text-red-500' : 'text-slate-500'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);
FormField.displayName = 'FormField';

export { FormField };
