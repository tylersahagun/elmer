import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'rounded-xl transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800',
        elevated: 'bg-white dark:bg-slate-900 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50',
        glass: 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50',
        ghost: 'bg-slate-50 dark:bg-slate-800/50',
        gradient: 'bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700',
        aurora: 'bg-white dark:bg-slate-900 border border-transparent bg-clip-padding [background-image:linear-gradient(white,white),linear-gradient(to_right,#4fd1c5,#9f7aea,#ed64a6)] [background-origin:border-box] [background-clip:padding-box,border-box]',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
      },
      interactive: {
        true: 'cursor-pointer hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'default',
      interactive: false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, interactive, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, interactive, className }))}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

// Card Header
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col space-y-1.5', className)}
        {...props}
      />
    );
  }
);
CardHeader.displayName = 'CardHeader';

// Card Title
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn('font-semibold text-lg text-slate-900 dark:text-white leading-tight', className)}
        {...props}
      />
    );
  }
);
CardTitle.displayName = 'CardTitle';

// Card Description
export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('text-sm text-slate-500 dark:text-slate-400', className)}
        {...props}
      />
    );
  }
);
CardDescription.displayName = 'CardDescription';

// Card Content
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('', className)} {...props} />;
  }
);
CardContent.displayName = 'CardContent';

// Card Footer
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center pt-4', className)}
        {...props}
      />
    );
  }
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants };
