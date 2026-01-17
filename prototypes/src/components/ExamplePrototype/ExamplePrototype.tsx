import * as React from 'react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export interface ExamplePrototypeProps {
  title: string;
  description?: string;
  variant?: 'default' | 'minimal' | 'detailed';
  isLoading?: boolean;
  onAction?: () => void;
  className?: string;
}

/**
 * Example prototype component demonstrating the expected structure.
 *
 * When building prototypes:
 * - Create multiple variants (options A, B, C)
 * - Include all AI states (loading, error, empty, low-confidence)
 * - Follow the design principles from prototype-builder.mdc
 */
export function ExamplePrototype({
  title,
  description,
  variant = 'default',
  isLoading = false,
  onAction,
  className,
}: ExamplePrototypeProps) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-6 shadow-sm',
        variant === 'minimal' && 'p-4',
        variant === 'detailed' && 'p-8',
        className
      )}
    >
      {isLoading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-3/4 rounded bg-muted" />
          <div className="h-4 w-1/2 rounded bg-muted" />
        </div>
      ) : (
        <>
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && (
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          )}
          {variant === 'detailed' && (
            <div className="mt-4 rounded bg-muted/50 p-3 text-sm">
              <p className="font-medium">Details</p>
              <p className="text-muted-foreground">
                This variant shows additional context and information.
              </p>
            </div>
          )}
          {onAction && (
            <Button
              onClick={onAction}
              className="mt-4"
              size={variant === 'minimal' ? 'sm' : 'default'}
            >
              Take Action
            </Button>
          )}
        </>
      )}
    </div>
  );
}
