"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Check,
  ChevronsUpDown,
  Clock,
  Loader2,
  Lock,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { BranchSelector } from "@/components/settings/BranchSelector";

interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  private: boolean;
  url: string;
  cloneUrl: string;
  defaultBranch: string;
  pushedAt: string | null;
  owner: {
    login: string;
    avatarUrl: string;
  };
}

interface RateLimitResponse {
  limit: number;
  remaining: number;
  reset: string;
  resetSeconds: number;
  sufficient: boolean;
  message?: string;
}

interface SelectRepoStepProps {
  onComplete: (repo: GitHubRepo, branch: string) => void;
  onUseTemplate: () => void;
}

/**
 * SelectRepoStep - Repository and branch selection step
 *
 * Allows users to search/filter repositories, select one,
 * choose a branch, and validates rate limits before proceeding.
 */
export function SelectRepoStep({
  onComplete,
  onUseTemplate,
}: SelectRepoStepProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>("");

  // Fetch repositories
  const {
    data: reposData,
    isLoading: isLoadingRepos,
    isError: isReposError,
  } = useQuery<{
    repos: GitHubRepo[];
    total: number;
    connected: boolean;
  }>({
    queryKey: ["github-repos", search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("per_page", "50");
      params.set("sort", "pushed");

      const res = await fetch(`/api/github/repos?${params}`);
      if (!res.ok) throw new Error("Failed to fetch repos");
      return res.json();
    },
    staleTime: 60 * 1000, // 1 minute
  });

  // Check rate limits
  const { data: rateLimit, isLoading: isLoadingRateLimit } =
    useQuery<RateLimitResponse>({
      queryKey: ["github-rate-limit"],
      queryFn: async () => {
        const res = await fetch("/api/github/rate-limit");
        if (!res.ok) throw new Error("Failed to check rate limit");
        return res.json();
      },
      staleTime: 30 * 1000, // 30 seconds
      refetchInterval: 60 * 1000, // Refetch every minute
    });

  const repos = reposData?.repos ?? [];

  // Sort repos: Recently pushed first
  const sortedRepos = [...repos].sort((a, b) => {
    if (!a.pushedAt) return 1;
    if (!b.pushedAt) return -1;
    return new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime();
  });

  // Get recently used repos (pushed within last 7 days)
  const recentlyUsed = sortedRepos
    .filter((repo) => {
      if (!repo.pushedAt) return false;
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return new Date(repo.pushedAt).getTime() > sevenDaysAgo;
    })
    .slice(0, 5);

  const otherRepos = sortedRepos.filter(
    (repo) => !recentlyUsed.some((r) => r.id === repo.id),
  );

  // Set default branch when repo is selected
  useEffect(() => {
    if (selectedRepo && !selectedBranch) {
      setSelectedBranch(selectedRepo.defaultBranch);
    }
  }, [selectedRepo, selectedBranch]);

  // Handle repo selection
  const handleSelectRepo = (repo: GitHubRepo) => {
    setSelectedRepo(repo);
    setSelectedBranch(repo.defaultBranch); // Auto-select default branch
    setOpen(false);
  };

  // Handle continue
  const handleContinue = () => {
    if (selectedRepo && selectedBranch) {
      onComplete(selectedRepo, selectedBranch);
    }
  };

  // Can continue if repo and branch selected
  const canContinue = selectedRepo !== null && selectedBranch !== "";

  // Format time since last push
  const formatTimeSince = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    const now = Date.now();
    const diff = now - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  return (
    <div className="flex flex-col space-y-6 py-4">
      {/* Repository Selection */}
      <div className="space-y-3">
        <Label>Repository</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between font-normal h-auto min-h-10 py-2"
            >
              {selectedRepo ? (
                <div className="flex items-center gap-2 text-left">
                  {selectedRepo.private && (
                    <Lock className="w-3 h-3 text-muted-foreground shrink-0" />
                  )}
                  <div className="min-w-0">
                    <span className="font-medium">{selectedRepo.fullName}</span>
                    {selectedRepo.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {selectedRepo.description}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <span className="text-muted-foreground">
                  Select a repository...
                </span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[450px] p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Search repositories..."
                value={search}
                onValueChange={setSearch}
              />
              <CommandList className="max-h-[350px]">
                {isLoadingRepos ? (
                  <div className="py-6 text-center">
                    <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                    <span className="text-sm text-muted-foreground">
                      Loading repositories...
                    </span>
                  </div>
                ) : isReposError ? (
                  <div className="py-6 text-center">
                    <AlertCircle className="w-4 h-4 mx-auto mb-2 text-destructive" />
                    <span className="text-sm text-muted-foreground">
                      Failed to load repositories
                    </span>
                  </div>
                ) : (
                  <>
                    <CommandEmpty>No repositories found.</CommandEmpty>

                    {/* Recently Used Section */}
                    {recentlyUsed.length > 0 && !search && (
                      <CommandGroup heading="Recently Updated">
                        {recentlyUsed.map((repo) => (
                          <CommandItem
                            key={repo.id}
                            value={repo.fullName}
                            onSelect={() => handleSelectRepo(repo)}
                            className="flex items-start gap-2 py-2"
                          >
                            <Check
                              className={cn(
                                "mt-0.5 h-4 w-4 shrink-0",
                                selectedRepo?.id === repo.id
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium truncate">
                                  {repo.fullName}
                                </span>
                                {repo.private && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] px-1 py-0 shrink-0"
                                  >
                                    Private
                                  </Badge>
                                )}
                              </div>
                              {repo.description && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {repo.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                                <Clock className="w-3 h-3" />
                                {formatTimeSince(repo.pushedAt)}
                                <span className="opacity-50">|</span>
                                {repo.defaultBranch}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    {/* All Repositories Section */}
                    <CommandGroup
                      heading={
                        recentlyUsed.length > 0 && !search
                          ? "All Repositories"
                          : "Your Repositories"
                      }
                    >
                      {(search ? sortedRepos : otherRepos).map((repo) => (
                        <CommandItem
                          key={repo.id}
                          value={repo.fullName}
                          onSelect={() => handleSelectRepo(repo)}
                          className="flex items-start gap-2 py-2"
                        >
                          <Check
                            className={cn(
                              "mt-0.5 h-4 w-4 shrink-0",
                              selectedRepo?.id === repo.id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">
                                {repo.fullName}
                              </span>
                              {repo.private && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-1 py-0 shrink-0"
                                >
                                  Private
                                </Badge>
                              )}
                            </div>
                            {repo.description && (
                              <p className="text-xs text-muted-foreground truncate">
                                {repo.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                              <Clock className="w-3 h-3" />
                              {formatTimeSince(repo.pushedAt)}
                              <span className="opacity-50">|</span>
                              {repo.defaultBranch}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <p className="text-xs text-muted-foreground">
          {reposData?.total
            ? `${reposData.total} repositories available`
            : "Select the repository containing your workspace"}
        </p>
      </div>

      {/* Branch Selection (shown after repo selected) */}
      {selectedRepo && (
        <div className="space-y-3">
          <Label>Branch</Label>
          <BranchSelector
            owner={selectedRepo.owner.login}
            repo={selectedRepo.name}
            value={selectedBranch}
            onChange={setSelectedBranch}
          />
          <p className="text-xs text-muted-foreground">
            Default branch: {selectedRepo.defaultBranch}
          </p>
        </div>
      )}

      {/* Rate Limit Indicator */}
      <div className="flex flex-col gap-3 pt-4 border-t sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-muted-foreground">
          {isLoadingRateLimit ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Checking API status...
            </span>
          ) : rateLimit ? (
            <span
              className={cn(
                "flex items-center gap-2",
                !rateLimit.sufficient && "text-amber-600 dark:text-amber-400",
              )}
            >
              {!rateLimit.sufficient && <AlertCircle className="w-3 h-3" />}
              {rateLimit.sufficient
                ? `${rateLimit.remaining} API calls remaining`
                : rateLimit.message}
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            variant="outline"
            onClick={onUseTemplate}
            className="gap-2"
            type="button"
          >
            Use Elmer Template
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!canContinue}
            className="gap-2"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
