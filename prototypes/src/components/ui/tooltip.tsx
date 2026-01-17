import * as React from 'react';
import { cn } from '@/lib/utils';

interface TooltipContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null);

interface TooltipProviderProps {
  children: React.ReactNode;
  delayDuration?: number;
}

function TooltipProvider({ children }: TooltipProviderProps) {
  return <>{children}</>;
}

interface TooltipProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function Tooltip({ children, open: controlledOpen, onOpenChange }: TooltipProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = controlledOpen ?? uncontrolledOpen;

  const setOpen = (value: boolean) => {
    setUncontrolledOpen(value);
    onOpenChange?.(value);
  };

  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </TooltipContext.Provider>
  );
}

interface TooltipTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

function TooltipTrigger({ children, asChild }: TooltipTriggerProps) {
  const ctx = React.useContext(TooltipContext);
  if (!ctx) throw new Error('TooltipTrigger must be used within Tooltip');

  const child = asChild && React.isValidElement(children) ? children : <span>{children}</span>;

  return React.cloneElement(child as React.ReactElement, {
    onMouseEnter: () => ctx.setOpen(true),
    onMouseLeave: () => ctx.setOpen(false),
    onFocus: () => ctx.setOpen(true),
    onBlur: () => ctx.setOpen(false),
  });
}

interface TooltipContentProps {
  children: React.ReactNode;
  className?: string;
  sideOffset?: number;
}

function TooltipContent({ children, className }: TooltipContentProps) {
  const ctx = React.useContext(TooltipContext);
  if (!ctx) throw new Error('TooltipContent must be used within Tooltip');

  if (!ctx.open) return null;

  return (
    <div
      className={cn(
        'absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2',
        'overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md',
        'animate-in fade-in-0 zoom-in-95',
        className
      )}
    >
      {children}
    </div>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };

