"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SignalFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  source: string;
  onSourceChange: (value: string) => void;
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
}

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "new", label: "New" },
  { value: "reviewed", label: "Reviewed" },
  { value: "linked", label: "Linked" },
  { value: "archived", label: "Archived" },
];

const SOURCE_OPTIONS = [
  { value: "", label: "All Sources" },
  { value: "paste", label: "Paste" },
  { value: "webhook", label: "Webhook" },
  { value: "upload", label: "Upload" },
  { value: "video", label: "Video" },
  { value: "slack", label: "Slack" },
  { value: "pylon", label: "Pylon" },
  { value: "email", label: "Email" },
  { value: "interview", label: "Interview" },
  { value: "other", label: "Other" },
];

export function SignalFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  source,
  onSourceChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
}: SignalFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 items-end">
      {/* Search input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search signals..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-muted/50"
        />
      </div>

      {/* Status filter */}
      <div className="w-[140px]">
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="bg-muted/50">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value || "all"}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Source filter */}
      <div className="w-[140px]">
        <Select value={source} onValueChange={onSourceChange}>
          <SelectTrigger className="bg-muted/50">
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent>
            {SOURCE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value || "all"}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date range */}
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <label className="text-xs text-muted-foreground mb-1">From</label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="w-[140px] bg-muted/50"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-muted-foreground mb-1">To</label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="w-[140px] bg-muted/50"
          />
        </div>
      </div>
    </div>
  );
}
