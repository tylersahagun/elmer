import * as React from 'react';
import { cn } from '@/lib/utils';

// Navbar
export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  /** Logo element */
  logo?: React.ReactNode;
  /** Whether navbar is sticky */
  sticky?: boolean;
  /** Glass morphism effect */
  glass?: boolean;
}

const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
  ({ className, logo, sticky, glass, children, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        className={cn(
          'w-full px-4 py-3 flex items-center justify-between',
          sticky && 'sticky top-0 z-40',
          glass
            ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/20 dark:border-slate-700/50'
            : 'bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800',
          className
        )}
        {...props}
      >
        {logo && <div className="flex-shrink-0">{logo}</div>}
        {children}
      </nav>
    );
  }
);
Navbar.displayName = 'Navbar';

// Sidebar
export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  /** Collapsed state */
  collapsed?: boolean;
  /** Width when expanded */
  width?: string;
}

const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  ({ className, collapsed, width = '240px', children, ...props }, ref) => {
    return (
      <aside
        ref={ref}
        style={{ width: collapsed ? '64px' : width }}
        className={cn(
          'h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-200 overflow-hidden',
          className
        )}
        {...props}
      >
        {children}
      </aside>
    );
  }
);
Sidebar.displayName = 'Sidebar';

// Nav Group
export interface NavGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Group label */
  label?: string;
}

const NavGroup = React.forwardRef<HTMLDivElement, NavGroupProps>(
  ({ className, label, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('py-2', className)} {...props}>
        {label && (
          <div className="px-3 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {label}
          </div>
        )}
        {children}
      </div>
    );
  }
);
NavGroup.displayName = 'NavGroup';

// Nav Item
export interface NavItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon element */
  icon?: React.ReactNode;
  /** Badge/count */
  badge?: React.ReactNode;
  /** Active state */
  active?: boolean;
  /** Collapsed mode (icon only) */
  collapsed?: boolean;
}

const NavItem = React.forwardRef<HTMLButtonElement, NavItemProps>(
  ({ className, icon, badge, active, collapsed, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
          active
            ? 'bg-gradient-to-r from-teal-500/10 to-purple-500/10 text-teal-600 dark:text-teal-400'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white',
          collapsed && 'justify-center px-2',
          className
        )}
        {...props}
      >
        {icon && (
          <span className={cn('flex-shrink-0', active && 'text-teal-500')}>
            {icon}
          </span>
        )}
        {!collapsed && <span className="flex-1 text-left">{children}</span>}
        {!collapsed && badge && <span>{badge}</span>}
      </button>
    );
  }
);
NavItem.displayName = 'NavItem';

// Breadcrumb
export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  /** Separator character */
  separator?: React.ReactNode;
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, separator = '/', children, ...props }, ref) => {
    const items = React.Children.toArray(children);

    return (
      <nav ref={ref} aria-label="Breadcrumb" className={cn('flex items-center', className)} {...props}>
        <ol className="flex items-center gap-2">
          {items.map((child, index) => (
            <li key={index} className="flex items-center gap-2">
              {child}
              {index < items.length - 1 && (
                <span className="text-slate-400 dark:text-slate-500 text-sm">{separator}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
  }
);
Breadcrumb.displayName = 'Breadcrumb';

// Breadcrumb Item
export interface BreadcrumbItemProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Whether this is the current/last item */
  current?: boolean;
  /** href for link */
  href?: string;
}

const BreadcrumbItem = React.forwardRef<HTMLSpanElement, BreadcrumbItemProps>(
  ({ className, current, href, children, ...props }, ref) => {
    const Comp = href && !current ? 'a' : 'span';

    return (
      <Comp
        ref={ref as any}
        href={href}
        aria-current={current ? 'page' : undefined}
        className={cn(
          'text-sm',
          current
            ? 'text-slate-900 dark:text-white font-medium'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
          !current && href && 'cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
BreadcrumbItem.displayName = 'BreadcrumbItem';

export { Navbar, Sidebar, NavGroup, NavItem, Breadcrumb, BreadcrumbItem };
