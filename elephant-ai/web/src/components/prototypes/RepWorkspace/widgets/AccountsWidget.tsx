import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BuildingIcon,
  ArrowRightIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  AlertCircleIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Account } from '../types';

interface AccountsWidgetProps {
  accounts: Account[];
  onAccountClick?: (account: Account) => void;
  onViewAll?: () => void;
  className?: string;
}

export function AccountsWidget({
  accounts,
  onAccountClick,
  onViewAll,
  className,
}: AccountsWidgetProps) {
  const sortedAccounts = [...accounts].sort((a, b) => {
    const healthOrder = { critical: 0, at_risk: 1, healthy: 2 };
    return (
      (healthOrder[a.healthScore || 'healthy'] ?? 2) -
      (healthOrder[b.healthScore || 'healthy'] ?? 2)
    );
  });
  const displayAccounts = sortedAccounts.slice(0, 4);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  const getHealthIcon = (health?: Account['healthScore']) => {
    switch (health) {
      case 'critical':
        return <AlertCircleIcon className="size-4 text-red-500" />;
      case 'at_risk':
        return <AlertTriangleIcon className="size-4 text-amber-500" />;
      default:
        return <TrendingUpIcon className="size-4 text-emerald-500" />;
    }
  };

  const getHealthBadge = (health?: Account['healthScore']) => {
    switch (health) {
      case 'critical':
        return (
          <Badge variant="destructive" className="h-5 text-[10px] px-1.5">
            Critical
          </Badge>
        );
      case 'at_risk':
        return (
          <Badge
            variant="outline"
            className="h-5 text-[10px] px-1.5 border-amber-300 text-amber-700 bg-amber-50"
          >
            At Risk
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className={cn('h-full flex flex-col', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <BuildingIcon className="size-5 text-violet-600" />
          <CardTitle className="text-base font-semibold">My Accounts</CardTitle>
        </div>
        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll} className="h-7 text-xs">
            View all
            <ArrowRightIcon className="ml-1 size-3" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        {displayAccounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <BuildingIcon className="size-10 text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-foreground">No accounts yet</p>
            <p className="text-xs text-muted-foreground">
              Accounts will appear as you have meetings
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {displayAccounts.map((account) => (
              <button
                key={account.id}
                onClick={() => onAccountClick?.(account)}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/50 transition-colors text-left group"
              >
                <div className="size-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-white">
                    {account.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary">
                      {account.name}
                    </p>
                    {getHealthIcon(account.healthScore)}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">
                      {account.meetingCount} meetings
                    </span>
                    {account.dealValue && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs font-medium text-foreground">
                          {formatCurrency(account.dealValue)}
                        </span>
                      </>
                    )}
                    {account.dealStage && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {account.dealStage}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {getHealthBadge(account.healthScore)}
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
