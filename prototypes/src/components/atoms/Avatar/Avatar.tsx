import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-xs',
        sm: 'h-8 w-8 text-sm',
        default: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
        xl: 'h-16 w-16 text-lg',
        '2xl': 'h-24 w-24 text-2xl',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  /** Image source */
  src?: string;
  /** Alt text for image */
  alt?: string;
  /** Fallback text (initials) when no image */
  fallback?: string;
  /** Online status indicator */
  status?: 'online' | 'offline' | 'away' | 'busy';
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, src, alt, fallback, status, ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false);

    const statusColors = {
      online: 'bg-emerald-500',
      offline: 'bg-slate-400',
      away: 'bg-amber-500',
      busy: 'bg-red-500',
    };

    const statusSizes = {
      xs: 'h-1.5 w-1.5 border',
      sm: 'h-2 w-2 border',
      default: 'h-2.5 w-2.5 border-2',
      lg: 'h-3 w-3 border-2',
      xl: 'h-3.5 w-3.5 border-2',
      '2xl': 'h-4 w-4 border-2',
    };

    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    return (
      <div
        ref={ref}
        className={cn('relative inline-block', className)}
        {...props}
      >
        <div className={cn(avatarVariants({ size }))}>
          {src && !imageError ? (
            <img
              src={src}
              alt={alt || 'Avatar'}
              className="h-full w-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-teal-500 to-purple-500 font-medium text-white">
              {fallback ? getInitials(fallback) : '?'}
            </div>
          )}
        </div>
        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0 rounded-full border-white dark:border-slate-900',
              statusColors[status],
              statusSizes[size || 'default']
            )}
          />
        )}
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';

// Avatar Group Component
export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Maximum avatars to show before +N */
  max?: number;
  /** Size of avatars */
  size?: VariantProps<typeof avatarVariants>['size'];
  children: React.ReactNode;
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, max = 4, size = 'default', children, ...props }, ref) => {
    const childArray = React.Children.toArray(children);
    const visibleAvatars = max ? childArray.slice(0, max) : childArray;
    const remainingCount = max ? Math.max(childArray.length - max, 0) : 0;

    return (
      <div
        ref={ref}
        className={cn('flex -space-x-2', className)}
        {...props}
      >
        {visibleAvatars.map((child, index) =>
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<AvatarProps>, {
                key: index,
                size,
                className: cn(
                  'ring-2 ring-white dark:ring-slate-900',
                  (child as React.ReactElement<AvatarProps>).props.className
                ),
              })
            : child
        )}
        {remainingCount > 0 && (
          <div
            className={cn(
              avatarVariants({ size }),
              'flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium ring-2 ring-white dark:ring-slate-900'
            )}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    );
  }
);
AvatarGroup.displayName = 'AvatarGroup';

export { Avatar, AvatarGroup, avatarVariants };
