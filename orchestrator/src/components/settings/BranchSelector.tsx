"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface BranchSelectorProps {
  owner?: string;
  repo?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

interface BranchResponse {
  defaultBranch: string;
  branches: Array<{
    name: string;
    commitSha: string;
    protected: boolean;
  }>;
}

export function BranchSelector({
  owner,
  repo,
  value,
  onChange,
  className,
}: BranchSelectorProps) {
  const [open, setOpen] = useState(false);

  const { data, isLoading, isError } = useQuery<BranchResponse>({
    queryKey: ["github-branches", owner, repo],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("owner", owner || "");
      params.set("repo", repo || "");
      const res = await fetch(`/api/github/branches?${params}`);
      if (!res.ok) {
        throw new Error("Failed to fetch branches");
      }
      return res.json();
    },
    enabled: !!owner && !!repo,
    staleTime: 60 * 1000,
  });

  const branches = data?.branches ?? [];
  const selected = branches.find((branch) => branch.name === value);

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between"
            disabled={!owner || !repo || isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading branches...
              </span>
            ) : selected ? (
              selected.name
            ) : (
              value || "Select a branch"
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search branches..." />
            <CommandList>
              <CommandEmpty>
                {isError ? "Failed to load branches" : "No branches found"}
              </CommandEmpty>
              <CommandGroup>
                {branches.map((branch) => (
                  <CommandItem
                    key={branch.name}
                    value={branch.name}
                    onSelect={() => {
                      onChange(branch.name);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === branch.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {branch.name}
                    {branch.name === data?.defaultBranch && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (default)
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
