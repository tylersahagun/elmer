"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { signIn } from "next-auth/react";
import {
  Check,
  ChevronsUpDown,
  Github,
  Link2,
  Loader2,
  RefreshCw,
  Search,
  Unlink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

interface GitHubStatus {
  connected: boolean;
  user?: {
    login: string;
    name: string | null;
    avatarUrl: string;
    profileUrl: string;
  };
  connectUrl?: string;
  expired?: boolean;
  message?: string;
}

interface DetectedPath {
  type: "context" | "prototypes";
  path: string;
}

interface GithubRepoSelectorProps {
  value: string;
  onChange: (value: string, repoDetails?: GitHubRepo) => void;
  onBranchChange?: (branch: string) => void;
  onPathsDetected?: (paths: DetectedPath[]) => void;
  onRepoResolved?: (repo: GitHubRepo) => void;
  placeholder?: string;
  className?: string;
}

export function GithubRepoSelector({
  value,
  onChange,
  onBranchChange,
  onPathsDetected,
  onRepoResolved,
  placeholder = "Select a repository or enter path",
  className,
}: GithubRepoSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [isDetectingPaths, setIsDetectingPaths] = useState(false);
  const lastResolvedRepoId = useRef<number | null>(null);
  const lastDetectedRepoId = useRef<number | null>(null);

  // Check GitHub connection status
  const {
    data: status,
    isLoading: isLoadingStatus,
    refetch: refetchStatus,
  } = useQuery<GitHubStatus>({
    queryKey: ["github-status"],
    queryFn: async () => {
      const res = await fetch("/api/github/status");
      if (!res.ok) throw new Error("Failed to check GitHub status");
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch repos when connected
  const {
    data: reposData,
    isLoading: isLoadingRepos,
    refetch: refetchRepos,
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
    enabled: status?.connected === true,
    staleTime: 60 * 1000, // 1 minute
  });

  // Find selected repo in list
  const selectedRepo = reposData?.repos.find(
    (repo) =>
      repo.fullName === value ||
      repo.name === value ||
      `product-repos/${repo.name}` === value,
  );

  const detectRepoPaths = async (repo: GitHubRepo) => {
    if (!onPathsDetected) return;
    setIsDetectingPaths(true);
    try {
      const res = await fetch("/api/github/repos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner: repo.owner.login,
          repo: repo.name,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.detectedPaths && data.detectedPaths.length > 0) {
          onPathsDetected(data.detectedPaths);
        }
      }
    } catch (error) {
      console.error("Failed to detect paths:", error);
    } finally {
      setIsDetectingPaths(false);
    }
  };

  useEffect(() => {
    if (!selectedRepo) return;
    if (lastResolvedRepoId.current === selectedRepo.id) return;
    lastResolvedRepoId.current = selectedRepo.id;
    onRepoResolved?.(selectedRepo);
  }, [selectedRepo, onRepoResolved]);

  useEffect(() => {
    if (!selectedRepo || !onPathsDetected) return;
    if (lastDetectedRepoId.current === selectedRepo.id) return;
    lastDetectedRepoId.current = selectedRepo.id;
    detectRepoPaths(selectedRepo);
  }, [selectedRepo, onPathsDetected]);

  // Connect to GitHub - link account while staying logged in
  const handleConnect = () => {
    signIn("github", {
      callbackUrl: window.location.href,
      redirect: true,
    });
  };

  // Handle repo selection
  const handleSelectRepo = async (repo: GitHubRepo) => {
    // Set the path to product-repos/[repo-name]
    const repoPath = `product-repos/${repo.name}`;
    onChange(repoPath, repo);

    // Also update the branch if callback provided
    if (onBranchChange) {
      onBranchChange(repo.defaultBranch);
    }

    setOpen(false);

    // Fetch repo details to detect paths
    if (onPathsDetected) {
      await detectRepoPaths(repo);
    }
  };

  // Loading state
  if (isLoadingStatus) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted/50">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Checking GitHub connection...
          </span>
        </div>
      </div>
    );
  }

  // Not connected state
  if (!status?.connected) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleConnect}
            className="gap-2"
          >
            <Github className="w-4 h-4" />
            Connect GitHub
          </Button>
          <span className="text-sm text-muted-foreground">
            to browse your repositories
          </span>
        </div>

        {status?.expired && (
          <p className="text-sm text-amber-500">{status.message}</p>
        )}

        {/* Manual input fallback */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            Or enter path manually:
          </Label>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="product-repos/my-repo"
          />
        </div>
      </div>
    );
  }

  // Connected state with repo selector
  return (
    <div className={cn("space-y-3", className)}>
      {/* Connected user info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Github className="w-4 h-4" />
          <span>Connected as</span>
          <a
            href={status.user?.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:underline"
          >
            @{status.user?.login}
          </a>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => refetchRepos()}
                className="h-7 px-2"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh repositories</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Repo selector or manual input */}
      {showManualInput ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="product-repos/my-repo"
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowManualInput(false)}
              className="shrink-0"
            >
              Browse
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between font-normal"
              >
                {selectedRepo ? (
                  <span className="flex items-center gap-2">
                    {selectedRepo.private && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1 py-0"
                      >
                        Private
                      </Badge>
                    )}
                    {selectedRepo.fullName}
                  </span>
                ) : value ? (
                  <span className="flex items-center gap-2">
                    <Link2 className="w-3 h-3" />
                    {value}
                  </span>
                ) : (
                  <span className="text-muted-foreground">{placeholder}</span>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Search repositories..."
                  value={search}
                  onValueChange={setSearch}
                />
                <CommandList>
                  {isLoadingRepos ? (
                    <div className="py-6 text-center">
                      <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                      <span className="text-sm text-muted-foreground">
                        Loading repos...
                      </span>
                    </div>
                  ) : (
                    <>
                      <CommandEmpty>No repositories found.</CommandEmpty>
                      <CommandGroup heading="Your Repositories">
                        {reposData?.repos.map((repo) => (
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
                                  {repo.name}
                                </span>
                                {repo.private && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] px-1 py-0"
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
                              <p className="text-[10px] text-muted-foreground">
                                {repo.owner.login} • {repo.defaultBranch}
                              </p>
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

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {reposData?.total
                ? `${reposData.total} repositories`
                : "Select a repository"}
            </span>
            <button
              type="button"
              onClick={() => setShowManualInput(true)}
              className="hover:text-foreground transition-colors"
            >
              Enter path manually
            </button>
          </div>
        </div>
      )}

      {/* Show resolved path when repo selected */}
      {value && (
        <p className="text-xs text-muted-foreground">
          Path: <code className="bg-muted px-1 rounded">{value}</code>
        </p>
      )}

      {/* Detecting paths indicator */}
      {isDetectingPaths && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Detecting context and prototype paths...</span>
        </div>
      )}
    </div>
  );
}

/**
 * Simple badge to show GitHub connection status
 */
export function GithubConnectionBadge({ className }: { className?: string }) {
  const { data: status, isLoading } = useQuery<GitHubStatus>({
    queryKey: ["github-status"],
    queryFn: async () => {
      const res = await fetch("/api/github/status");
      if (!res.ok) throw new Error("Failed to check GitHub status");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return null;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div
        className={cn(
          "w-2 h-2 rounded-full",
          status?.connected ? "bg-green-400" : "bg-gray-400",
        )}
      />
      <span className="text-xs text-muted-foreground">
        {status?.connected ? `@${status.user?.login}` : "Not connected"}
      </span>
    </div>
  );
}
