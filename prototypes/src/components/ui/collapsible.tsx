import * as React from 'react';
import { cn } from '@/lib/utils';

interface CollapsibleContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null);

interface CollapsibleProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

function Collapsible({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
  className,
}: CollapsibleProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isOpen = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;

  const setOpen = (value: boolean) => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(value);
    }
    onOpenChange?.(value);
  };

  return (
    <CollapsibleContext.Provider value={{ open: isOpen, setOpen }}>
      <div className={cn('', className)}>{children}</div>
    </CollapsibleContext.Provider>
  );
}

interface CollapsibleTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

function CollapsibleTrigger({ children, asChild, className }: CollapsibleTriggerProps) {
  const ctx = React.useContext(CollapsibleContext);
  if (!ctx) throw new Error('CollapsibleTrigger must be used within Collapsible');

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement, {
      onClick: () => ctx.setOpen(!ctx.open),
    });
  }

  return (
    <button
      type="button"
      onClick={() => ctx.setOpen(!ctx.open)}
      className={cn('', className)}
    >
      {children}
    </button>
  );
}

interface CollapsibleContentProps {
  children: React.ReactNode;
  className?: string;
  forceMount?: boolean;
}

function CollapsibleContent({ children, className, forceMount }: CollapsibleContentProps) {
  const ctx = React.useContext(CollapsibleContext);
  if (!ctx) throw new Error('CollapsibleContent must be used within Collapsible');

  if (!forceMount && !ctx.open) return null;

  return (
    <div
      className={cn(
        'overflow-hidden',
        ctx.open ? 'animate-in fade-in-0' : 'hidden',
        className
      )}
    >
      {children}
    </div>
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };

