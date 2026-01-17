/**
 * CRM Activity Filters
 * 
 * Filter controls for the Activity Dashboard.
 * Per design brief: Filter by workflow, date range, success/failure
 */

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SearchInput } from '@/components/ui/search-input';
import { ChevronDown, Filter, X } from 'lucide-react';

import type { ActivityFilters, CRMRecordType, WorkflowRunStatus, WorkflowSummary } from './types';

interface CRMActivityFiltersProps {
  filters: ActivityFilters;
  onFiltersChange: (filters: ActivityFilters) => void;
  workflows: WorkflowSummary[];
}

const statusOptions: { value: WorkflowRunStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'success', label: 'Success' },
  { value: 'failed', label: 'Failed' },
  { value: 'pending', label: 'Pending approval' },
  { value: 'running', label: 'Running' },
];

const recordTypeOptions: { value: CRMRecordType | 'all'; label: string }[] = [
  { value: 'all', label: 'All record types' },
  { value: 'deal', label: 'Deals' },
  { value: 'contact', label: 'Contacts' },
  { value: 'company', label: 'Companies' },
  { value: 'meeting', label: 'Meetings' },
];

export function CRMActivityFilters({ filters, onFiltersChange, workflows }: CRMActivityFiltersProps) {
  const updateFilter = <K extends keyof ActivityFilters>(key: K, value: ActivityFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters =
    filters.status !== 'all' ||
    filters.workflowId !== 'all' ||
    filters.recordType !== 'all' ||
    filters.searchQuery !== '';

  const clearFilters = () => {
    onFiltersChange({
      dateRange: { start: null, end: null },
      status: 'all',
      workflowId: 'all',
      recordType: 'all',
      confidenceLevel: 'all',
      searchQuery: '',
    });
  };

  const selectedStatus = statusOptions.find((opt) => opt.value === filters.status);
  const selectedRecordType = recordTypeOptions.find((opt) => opt.value === filters.recordType);
  const selectedWorkflow = filters.workflowId === 'all' 
    ? { name: 'All workflows' } 
    : workflows.find((w) => w.id === filters.workflowId);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <SearchInput
        value={filters.searchQuery}
        onChange={(value) => updateFilter('searchQuery', value)}
        placeholder="Search activity..."
        className="w-[200px]"
      />

      {/* Status Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <Filter className="size-3.5" />
            {selectedStatus?.label}
            <ChevronDown className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {statusOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => updateFilter('status', option.value)}
              className={filters.status === option.value ? 'bg-accent' : ''}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Workflow Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1 max-w-[200px]">
            <span className="truncate">{selectedWorkflow?.name || 'All workflows'}</span>
            <ChevronDown className="size-3.5 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-[300px] overflow-auto">
          <DropdownMenuItem
            onClick={() => updateFilter('workflowId', 'all')}
            className={filters.workflowId === 'all' ? 'bg-accent' : ''}
          >
            All workflows
          </DropdownMenuItem>
          {workflows.map((workflow) => (
            <DropdownMenuItem
              key={workflow.id}
              onClick={() => updateFilter('workflowId', workflow.id)}
              className={filters.workflowId === workflow.id ? 'bg-accent' : ''}
            >
              {workflow.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Record Type Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            {selectedRecordType?.label}
            <ChevronDown className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {recordTypeOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => updateFilter('recordType', option.value)}
              className={filters.recordType === option.value ? 'bg-accent' : ''}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
          <X className="size-3.5" />
          Clear filters
        </Button>
      )}
    </div>
  );
}
