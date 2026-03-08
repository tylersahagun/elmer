"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Check,
  ChevronsUpDown,
  Clock,
  FolderTree,
  GitBranch,
  Loader2,
  Lock,
  Settings2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import type { GitHubRepo as StoredGitHubRepo } from "@/lib/stores/onboarding-store";
import {
  getLifecycleTemplate,
  inferGuidedSetupDefaults,
  LIFECYCLE_TEMPLATES,
  type GuidedSetupDetection,
  type LifecycleTemplateId,
} from "@/lib/onboarding/guided-setup";

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

interface RepoDetailsResponse {
  detectedPaths: GuidedSetupDetection[];
}

interface GuidedSetupStepProps {
  initialRepo: StoredGitHubRepo | null;
  initialBranch?: string | null;
  initialContextPaths: string[];
  initialPrototypesPath?: string | null;
  initialAutomationMode?: "manual" | "auto_to_stage" | "auto_all";
  initialAutomationStopStage?: string | null;
  onComplete: (data: {
    repo: GitHubRepo;
    branch: string;
    contextPaths: string[];
    prototypesPath: string;
    automationMode: "manual" | "auto_to_stage" | "auto_all";
    automationStopStage: string | null;
    lifecycleTemplateId: LifecycleTemplateId;
  }) => void | Promise<void>;
  onUseTemplate: () => void;
}

function normalizePath(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
}

function hasCustomPaths(
  initialContextPaths: string[],
  initialPrototypesPath?: string | null,
) {
  const normalizedContextPaths = initialContextPaths
    .map((value) => normalizePath(value))
    .filter(Boolean);
  const normalizedPrototypesPath = normalizePath(initialPrototypesPath ?? "");

  const hasCustomContextPaths =
    normalizedContextPaths.length > 0 &&
    !(
      normalizedContextPaths.length === 1 &&
      normalizedContextPaths[0] === "elmer-docs/"
    );
  const hasCustomPrototypesPath =
    normalizedPrototypesPath.length > 0 &&
    normalizedPrototypesPath !== "prototypes/";

  return hasCustomContextPaths || hasCustomPrototypesPath;
}

function mapStoredRepo(repo: StoredGitHubRepo | null): GitHubRepo | null {
  if (!repo) return null;
  return {
    id: repo.id,
    name: repo.name,
    fullName: repo.fullName,
    description: repo.description,
    private: repo.private,
    url: repo.htmlUrl,
    cloneUrl: "",
    defaultBranch: repo.defaultBranch,
    pushedAt: null,
    owner: {
      login: repo.owner,
      avatarUrl: "",
    },
  };
}

export function GuidedSetupStep({
  initialRepo,
  initialBranch,
  initialContextPaths,
  initialPrototypesPath,
  initialAutomationMode,
  initialAutomationStopStage,
  onComplete,
  onUseTemplate,
}: GuidedSetupStepProps) {
  const initialPathsAreCustomized = useMemo(
    () => hasCustomPaths(initialContextPaths, initialPrototypesPath),
    [initialContextPaths, initialPrototypesPath],
  );
  const initialDefaults = useMemo(
    () =>
      inferGuidedSetupDefaults({
        existingContextPaths: initialContextPaths,
        existingPrototypesPath: initialPrototypesPath,
        automationMode: initialAutomationMode,
        automationStopStage: initialAutomationStopStage,
      }),
    [
      initialAutomationMode,
      initialAutomationStopStage,
      initialContextPaths,
      initialPrototypesPath,
    ],
  );

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(() =>
    mapStoredRepo(initialRepo),
  );
  const [selectedBranch, setSelectedBranch] = useState<string>(
    initialBranch || initialRepo?.defaultBranch || "",
  );
  const [contextPathsText, setContextPathsText] = useState(
    initialDefaults.contextPaths.join(", "),
  );
  const [prototypesPath, setPrototypesPath] = useState(
    initialDefaults.prototypesPath,
  );
  const [lifecycleTemplateId, setLifecycleTemplateId] =
    useState<LifecycleTemplateId>(initialDefaults.lifecycleTemplateId);
  const [showAdvancedPaths, setShowAdvancedPaths] = useState(
    initialPathsAreCustomized,
  );
  const [didCustomizePaths, setDidCustomizePaths] = useState(
    initialPathsAreCustomized,
  );
  const [didChooseLifecycleTemplate, setDidChooseLifecycleTemplate] = useState(
    Boolean(initialAutomationMode),
  );
  const [isContinuing, setIsContinuing] = useState(false);

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
    staleTime: 60 * 1000,
  });

  const { data: rateLimit, isLoading: isLoadingRateLimit } =
    useQuery<RateLimitResponse>({
      queryKey: ["github-rate-limit"],
      queryFn: async () => {
        const res = await fetch("/api/github/rate-limit");
        if (!res.ok) throw new Error("Failed to check rate limit");
        return res.json();
      },
      staleTime: 30 * 1000,
      refetchInterval: 60 * 1000,
    });

  const { data: repoDetails, isLoading: isLoadingRepoDetails } =
    useQuery<RepoDetailsResponse>({
      queryKey: ["github-repo-details", selectedRepo?.owner.login, selectedRepo?.name],
      queryFn: async () => {
        const res = await fetch("/api/github/repos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            owner: selectedRepo?.owner.login,
            repo: selectedRepo?.name,
          }),
        });
        if (!res.ok) throw new Error("Failed to inspect repository");
        return res.json();
      },
      enabled: Boolean(selectedRepo?.owner.login && selectedRepo?.name),
      staleTime: 60 * 1000,
    });

  const repos = reposData?.repos ?? [];
  const sortedRepos = [...repos].sort((a, b) => {
    if (!a.pushedAt) return 1;
    if (!b.pushedAt) return -1;
    return new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime();
  });

  const recentlyUsed = sortedRepos
    .filter((repo) => {
      if (!repo.pushedAt) return false;
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return new Date(repo.pushedAt).getTime() > sevenDaysAgo;
    })
    .slice(0, 5);
  const otherRepos = sortedRepos.filter(
    (repo) => !recentlyUsed.some((recent) => recent.id === repo.id),
  );

  const suggestedDefaults = useMemo(
    () =>
      inferGuidedSetupDefaults({
        detectedPaths: repoDetails?.detectedPaths,
        existingContextPaths: [],
        existingPrototypesPath: null,
      }),
    [repoDetails?.detectedPaths],
  );

  useEffect(() => {
    if (!selectedRepo) return;
    if (!selectedBranch) {
      setSelectedBranch(selectedRepo.defaultBranch);
    }
  }, [selectedBranch, selectedRepo]);

  useEffect(() => {
    if (!selectedRepo) return;
    if (!didCustomizePaths) {
      setContextPathsText(suggestedDefaults.contextPaths.join(", "));
      setPrototypesPath(suggestedDefaults.prototypesPath);
    }
    if (!didChooseLifecycleTemplate) {
      setLifecycleTemplateId(suggestedDefaults.lifecycleTemplateId);
    }
  }, [
    didChooseLifecycleTemplate,
    didCustomizePaths,
    selectedRepo,
    suggestedDefaults.contextPaths,
    suggestedDefaults.lifecycleTemplateId,
    suggestedDefaults.prototypesPath,
  ]);

  const resolvedContextPaths = useMemo(() => {
    const normalized = contextPathsText
      .split(",")
      .map((value) => normalizePath(value))
      .filter(Boolean);
    return normalized.length > 0 ? normalized : suggestedDefaults.contextPaths;
  }, [contextPathsText, suggestedDefaults.contextPaths]);

  const resolvedPrototypesPath =
    normalizePath(prototypesPath) || suggestedDefaults.prototypesPath;
  const lifecycleTemplate = getLifecycleTemplate(lifecycleTemplateId);
  const canContinue =
    selectedRepo !== null &&
    selectedBranch.trim().length > 0 &&
    resolvedContextPaths.length > 0 &&
    resolvedPrototypesPath.length > 0 &&
    !isContinuing;

  const handleSelectRepo = (repo: GitHubRepo) => {
    setSelectedRepo(repo);
    setSelectedBranch(repo.defaultBranch);
    setDidCustomizePaths(false);
    setOpen(false);
  };

  const handleContinue = async () => {
    if (!selectedRepo || !canContinue) return;

    setIsContinuing(true);
    try {
      await onComplete({
        repo: selectedRepo,
        branch: selectedBranch,
        contextPaths: resolvedContextPaths,
        prototypesPath: resolvedPrototypesPath,
        automationMode: lifecycleTemplate.automationMode,
        automationStopStage: lifecycleTemplate.automationStopStage,
        lifecycleTemplateId,
      });
    } finally {
      setIsContinuing(false);
    }
  };

  const formatTimeSince = (dateStr: string | null) => {
    if (!dateStr) return "Recently updated";
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
    <div className="space-y-6 py-4">
      <div className="space-y-3">
        <Label>Repository</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="h-auto min-h-10 w-full justify-between py-2 font-normal"
            >
              {selectedRepo ? (
                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    {selectedRepo.private && (
                      <Lock className="h-3 w-3 shrink-0 text-muted-foreground" />
                    )}
                    <span className="truncate font-medium">
                      {selectedRepo.fullName}
                    </span>
                  </div>
                  {selectedRepo.description && (
                    <p className="truncate text-xs text-muted-foreground">
                      {selectedRepo.description}
                    </p>
                  )}
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
                    <Loader2 className="mx-auto mb-2 h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      Loading repositories...
                    </span>
                  </div>
                ) : isReposError ? (
                  <div className="py-6 text-center">
                    <AlertCircle className="mx-auto mb-2 h-4 w-4 text-destructive" />
                    <span className="text-sm text-muted-foreground">
                      Failed to load repositories
                    </span>
                  </div>
                ) : (
                  <>
                    <CommandEmpty>No repositories found.</CommandEmpty>

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
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="truncate font-medium">
                                  {repo.fullName}
                                </span>
                                {repo.private && (
                                  <Badge
                                    variant="secondary"
                                    className="shrink-0 px-1 py-0 text-[10px]"
                                  >
                                    Private
                                  </Badge>
                                )}
                              </div>
                              {repo.description && (
                                <p className="truncate text-xs text-muted-foreground">
                                  {repo.description}
                                </p>
                              )}
                              <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {formatTimeSince(repo.pushedAt)}
                                <span className="opacity-50">|</span>
                                {repo.defaultBranch}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

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
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate font-medium">
                                {repo.fullName}
                              </span>
                              {repo.private && (
                                <Badge
                                  variant="secondary"
                                  className="shrink-0 px-1 py-0 text-[10px]"
                                >
                                  Private
                                </Badge>
                              )}
                            </div>
                            {repo.description && (
                              <p className="truncate text-xs text-muted-foreground">
                                {repo.description}
                              </p>
                            )}
                            <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                              <Clock className="h-3 w-3" />
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
            : "Choose the repository Elmer should use as its workspace source."}
        </p>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FolderTree className="h-4 w-4" />
            Guided setup defaults
          </CardTitle>
          <CardDescription>
            Elmer inspects the repository and suggests where docs live, where
            prototypes should be written, and how much lifecycle automation to
            enable by default.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {!selectedRepo ? (
            <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
              Pick a repository first. Elmer will infer your likely docs and
              prototype roots automatically.
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border bg-muted/20 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <FolderTree className="h-4 w-4 text-muted-foreground" />
                    Context roots
                  </div>
                  {isLoadingRepoDetails ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Inspecting repository structure...
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {suggestedDefaults.contextPaths.map((path) => (
                        <Badge key={path} variant="secondary" className="font-mono">
                          {path}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="mt-3 text-xs text-muted-foreground">
                    {suggestedDefaults.detectedContextPaths.length > 0
                      ? "Detected from common docs, planning, and workspace folders."
                      : "No obvious docs root found. Using the standard Elmer default."}
                  </p>
                </div>

                <div className="rounded-lg border bg-muted/20 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <GitBranch className="h-4 w-4 text-muted-foreground" />
                    Prototype output
                  </div>
                  {isLoadingRepoDetails ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Checking prototype destinations...
                    </div>
                  ) : (
                    <Badge variant="secondary" className="font-mono">
                      {suggestedDefaults.prototypesPath}
                    </Badge>
                  )}
                  <p className="mt-3 text-xs text-muted-foreground">
                    {suggestedDefaults.detectedPrototypesPath
                      ? "Detected from an existing prototype folder in the repository."
                      : "Falling back to the standard prototypes/ destination."}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Lifecycle template</p>
                  <Badge variant="outline">Recommended defaults</Badge>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {LIFECYCLE_TEMPLATES.map((template) => {
                    const isSelected = lifecycleTemplateId === template.id;
                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => {
                          setLifecycleTemplateId(template.id);
                          setDidChooseLifecycleTemplate(true);
                        }}
                        className={cn(
                          "rounded-xl border p-4 text-left transition-colors",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/40 hover:bg-muted/30",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">{template.title}</span>
                          {template.badge && (
                            <Badge
                              variant={template.id === "assisted" ? "default" : "secondary"}
                            >
                              {template.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {template.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {lifecycleTemplateId === "assisted"
                    ? "Assisted uses auto progression through early stages, then pauses at prototype for review."
                    : lifecycleTemplateId === "autopilot"
                      ? "Autopilot uses full auto progression until a stage rule or human gate stops it."
                      : "Manual keeps automation off so the team advances work explicitly."}
                </p>
              </div>
            </>
          )}

          <div className="rounded-lg border border-dashed p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Settings2 className="h-4 w-4 text-muted-foreground" />
                  Manual overrides
                </div>
                <p className="text-sm text-muted-foreground">
                  Most teams can keep the inferred defaults. Open this only if
                  your repo uses unusual paths.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAdvancedPaths((current) => !current)}
              >
                {showAdvancedPaths ? "Hide path overrides" : "Adjust paths"}
              </Button>
            </div>

            {showAdvancedPaths && (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="guided-context-paths">Context paths</Label>
                  <Input
                    id="guided-context-paths"
                    value={contextPathsText}
                    onChange={(event) => {
                      setDidCustomizePaths(true);
                      setContextPathsText(event.target.value);
                    }}
                    placeholder="elmer-docs/, pm-workspace-docs/"
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated repo paths for docs, personas, signals, and
                    initiatives.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guided-prototypes-path">
                    Prototype output path
                  </Label>
                  <Input
                    id="guided-prototypes-path"
                    value={prototypesPath}
                    onChange={(event) => {
                      setDidCustomizePaths(true);
                      setPrototypesPath(event.target.value);
                    }}
                    placeholder="prototypes/ or src/components/prototypes/"
                  />
                  <p className="text-xs text-muted-foreground">
                    Where generated prototype assets should be written.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="border-t pt-4">
        <div className="mb-3 text-xs text-muted-foreground">
          {isLoadingRateLimit ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Checking API status...
            </span>
          ) : rateLimit ? (
            <span
              className={cn(
                "flex items-center gap-2",
                !rateLimit.sufficient && "text-amber-600 dark:text-amber-400",
              )}
            >
              {!rateLimit.sufficient && <AlertCircle className="h-3 w-3" />}
              {rateLimit.sufficient
                ? `${rateLimit.remaining} API calls remaining`
                : rateLimit.message}
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Button
            variant="outline"
            onClick={onUseTemplate}
            className="gap-2"
            type="button"
          >
            Use Elmer Template
          </Button>
          <Button onClick={handleContinue} disabled={!canContinue} className="gap-2">
            {isContinuing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving setup...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
