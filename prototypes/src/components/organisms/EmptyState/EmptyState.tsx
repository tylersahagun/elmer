import * as React from 'react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Icon or illustration */
  icon?: React.ReactNode;
  /** Main heading */
  title: string;
  /** Description text */
  description?: string;
  /** Primary action button */
  action?: React.ReactNode;
  /** Secondary action */
  secondaryAction?: React.ReactNode;
  /** Size variant */
  size?: 'sm' | 'default' | 'lg';
}

const defaultIcons = {
  document: (
    <svg className="w-full h-full text-slate-300" fill="none" viewBox="0 0 64 64" stroke="currentColor">
      <rect x="12" y="8" width="40" height="48" rx="4" strokeWidth="2" />
      <line x1="20" y1="20" x2="44" y2="20" strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="28" x2="44" y2="28" strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="36" x2="36" y2="36" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  search: (
    <svg className="w-full h-full text-slate-300" fill="none" viewBox="0 0 64 64" stroke="currentColor">
      <circle cx="28" cy="28" r="16" strokeWidth="2" />
      <line x1="40" y1="40" x2="52" y2="52" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  folder: (
    <svg className="w-full h-full text-slate-300" fill="none" viewBox="0 0 64 64" stroke="currentColor">
      <path d="M8 16v32a4 4 0 004 4h40a4 4 0 004-4V24a4 4 0 00-4-4H32l-4-4H12a4 4 0 00-4 4z" strokeWidth="2" />
    </svg>
  ),
};

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      icon,
      title,
      description,
      action,
      secondaryAction,
      size = 'default',
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: {
        wrapper: 'py-8 px-4',
        icon: 'w-12 h-12 mb-3',
        title: 'text-base',
        description: 'text-sm',
      },
      default: {
        wrapper: 'py-16 px-6',
        icon: 'w-16 h-16 mb-4',
        title: 'text-lg',
        description: 'text-sm',
      },
      lg: {
        wrapper: 'py-24 px-8',
        icon: 'w-24 h-24 mb-6',
        title: 'text-xl',
        description: 'text-base',
      },
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center',
          sizeClasses[size].wrapper,
          className
        )}
        {...props}
      >
        {icon && (
          <div className={cn(sizeClasses[size].icon)}>
            {icon}
          </div>
        )}
        <h3
          className={cn(
            'font-semibold text-slate-900 dark:text-white',
            sizeClasses[size].title
          )}
        >
          {title}
        </h3>
        {description && (
          <p
            className={cn(
              'text-slate-500 dark:text-slate-400 mt-1 max-w-sm',
              sizeClasses[size].description
            )}
          >
            {description}
          </p>
        )}
        {(action || secondaryAction) && (
          <div className="flex items-center gap-3 mt-6">
            {action}
            {secondaryAction}
          </div>
        )}
      </div>
    );
  }
);
EmptyState.displayName = 'EmptyState';

// Pre-made empty states
const NoResults: React.FC<Omit<EmptyStateProps, 'title'> & { title?: string }> = ({
  title = 'No results found',
  description = 'Try adjusting your search or filters',
  ...props
}) => (
  <EmptyState
    icon={defaultIcons.search}
    title={title}
    description={description}
    {...props}
  />
);

const NoDocuments: React.FC<Omit<EmptyStateProps, 'title'> & { title?: string }> = ({
  title = 'No documents yet',
  description = 'Create your first document to get started',
  ...props
}) => (
  <EmptyState
    icon={defaultIcons.document}
    title={title}
    description={description}
    {...props}
  />
);

const NoProjects: React.FC<Omit<EmptyStateProps, 'title'> & { title?: string }> = ({
  title = 'No projects yet',
  description = 'Create your first project to start organizing your work',
  ...props
}) => (
  <EmptyState
    icon={defaultIcons.folder}
    title={title}
    description={description}
    {...props}
  />
);

export { EmptyState, NoResults, NoDocuments, NoProjects };
