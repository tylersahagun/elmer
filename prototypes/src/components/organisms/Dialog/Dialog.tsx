import * as React from 'react';
import { cn } from '@/lib/utils';

// Context
interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | undefined>(undefined);

const useDialog = () => {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error('Dialog components must be used within a Dialog component');
  }
  return context;
};

// Dialog Root
export interface DialogProps {
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ open: controlledOpen, onOpenChange, children }) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [isControlled, onOpenChange]
  );

  return (
    <DialogContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
};

// Dialog Trigger
export interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ children, asChild, ...props }, ref) => {
    const { onOpenChange } = useDialog();

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        onClick: () => onOpenChange(true),
      });
    }

    return (
      <button ref={ref} onClick={() => onOpenChange(true)} {...props}>
        {children}
      </button>
    );
  }
);
DialogTrigger.displayName = 'DialogTrigger';

// Dialog Portal & Overlay
interface DialogOverlayProps extends React.HTMLAttributes<HTMLDivElement> {}

const DialogOverlay = React.forwardRef<HTMLDivElement, DialogOverlayProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          className
        )}
        {...props}
      />
    );
  }
);
DialogOverlay.displayName = 'DialogOverlay';

// Dialog Content
export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Size variant */
  size?: 'sm' | 'default' | 'lg' | 'xl' | 'full';
}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, size = 'default', children, ...props }, ref) => {
    const { open, onOpenChange } = useDialog();

    // Close on escape
    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onOpenChange(false);
      };
      if (open) {
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
      }
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }, [open, onOpenChange]);

    if (!open) return null;

    const sizeClasses = {
      sm: 'max-w-sm',
      default: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
      full: 'max-w-[90vw]',
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <DialogOverlay onClick={() => onOpenChange(false)} />
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          data-state={open ? 'open' : 'closed'}
          className={cn(
            'relative z-50 w-full bg-white dark:bg-slate-900 rounded-xl shadow-2xl',
            'animate-in fade-in-0 zoom-in-95 duration-200',
            sizeClasses[size],
            className
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  }
);
DialogContent.displayName = 'DialogContent';

// Dialog Header
const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn('flex flex-col space-y-1.5 p-6 pb-0', className)}
    {...props}
  />
);
DialogHeader.displayName = 'DialogHeader';

// Dialog Title
const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn('text-lg font-semibold text-slate-900 dark:text-white', className)}
      {...props}
    />
  )
);
DialogTitle.displayName = 'DialogTitle';

// Dialog Description
const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-slate-500 dark:text-slate-400', className)}
      {...props}
    />
  )
);
DialogDescription.displayName = 'DialogDescription';

// Dialog Body
const DialogBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div className={cn('p-6', className)} {...props} />
);
DialogBody.displayName = 'DialogBody';

// Dialog Footer
const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn('flex items-center justify-end gap-3 p-6 pt-0', className)}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

// Dialog Close
const DialogClose = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    const { onOpenChange } = useDialog();
    return (
      <button
        ref={ref}
        onClick={() => onOpenChange(false)}
        className={cn(
          'absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
          className
        )}
        {...props}
      >
        {children || (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </button>
    );
  }
);
DialogClose.displayName = 'DialogClose';

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
};
