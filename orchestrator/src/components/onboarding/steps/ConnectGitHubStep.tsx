"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  Github,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

interface PermissionsResponse {
  valid: boolean;
  scopes: string[];
  missing: string[];
  message?: string;
}

interface ConnectGitHubStepProps {
  onComplete: () => void;
  /** Callback to notify parent of ready state changes */
  onReadyChange?: (isReady: boolean) => void;
}

type ConnectionState =
  | "loading"
  | "not-connected"
  | "connected-checking-permissions"
  | "insufficient-permissions"
  | "ready";

/**
 * ConnectGitHubStep - First step of onboarding wizard
 *
 * Handles GitHub OAuth connection and permission validation.
 * Users must have sufficient scopes (repo, read:user) to proceed.
 */
export function ConnectGitHubStep({ onComplete, onReadyChange }: ConnectGitHubStepProps) {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("loading");

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
    staleTime: 30 * 1000, // 30 seconds
  });

  // Check GitHub permissions (only when connected)
  const {
    data: permissions,
    isLoading: isLoadingPermissions,
    refetch: refetchPermissions,
  } = useQuery<PermissionsResponse>({
    queryKey: ["github-permissions"],
    queryFn: async () => {
      const res = await fetch("/api/github/permissions");
      if (!res.ok) throw new Error("Failed to check permissions");
      return res.json();
    },
    enabled: status?.connected === true,
    staleTime: 30 * 1000,
  });

  // Update connection state based on status and permissions
  useEffect(() => {
    if (isLoadingStatus) {
      setConnectionState("loading");
      return;
    }

    if (!status?.connected) {
      setConnectionState("not-connected");
      return;
    }

    if (isLoadingPermissions) {
      setConnectionState("connected-checking-permissions");
      return;
    }

    if (permissions && !permissions.valid) {
      setConnectionState("insufficient-permissions");
      return;
    }

    if (permissions?.valid) {
      setConnectionState("ready");
    }
  }, [status, permissions, isLoadingStatus, isLoadingPermissions]);

  // Notify parent of ready state changes
  useEffect(() => {
    onReadyChange?.(connectionState === "ready");
  }, [connectionState, onReadyChange]);

  // Connect to GitHub via OAuth
  const startGithubOAuth = async () => {
    const csrfResponse = await fetch("/api/auth/csrf");
    if (!csrfResponse.ok) {
      throw new Error("Failed to initialize GitHub auth");
    }
    const csrfData = await csrfResponse.json();

    const signInResponse = await fetch("/api/auth/signin/github", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Auth-Return-Redirect": "1",
      },
      body: new URLSearchParams({
        csrfToken: csrfData.csrfToken ?? "",
        callbackUrl: window.location.href,
      }),
    });

    if (!signInResponse.ok) {
      throw new Error("Failed to start GitHub OAuth flow");
    }

    const data = await signInResponse.json();
    if (data?.url) {
      window.location.href = data.url;
    } else {
      throw new Error("Missing GitHub OAuth redirect");
    }
  };

  const handleConnect = async () => {
    await startGithubOAuth();
  };

  // Re-authenticate with additional permissions
  const handleReauth = async () => {
    // Force re-authentication to get additional scopes
    await startGithubOAuth();
  };

  // Refresh status after potential OAuth callback
  const handleRefresh = async () => {
    await refetchStatus();
    if (status?.connected) {
      await refetchPermissions();
    }
  };

  // Loading state
  if (connectionState === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Checking GitHub connection...
        </p>
      </div>
    );
  }

  // Not connected state
  if (connectionState === "not-connected") {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="p-4 rounded-full bg-muted">
            <Github className="w-12 h-12" />
          </div>
          <h3 className="text-lg font-semibold">Connect Your GitHub Account</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Connect your GitHub account to import your existing workspace
            structure. We&apos;ll read your repository to discover projects,
            requirements, and knowledge.
          </p>
        </div>

        <Button onClick={handleConnect} size="lg" className="gap-2">
          <Github className="w-5 h-5" />
          Connect GitHub
        </Button>

        {status?.expired && (
          <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg max-w-md">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-sm text-destructive">Connection Expired</p>
              <p className="text-sm text-muted-foreground">
                {status.message || "Your GitHub connection has expired. Please reconnect."}
              </p>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Status
        </Button>
      </div>
    );
  }

  // Checking permissions state
  if (connectionState === "connected-checking-permissions") {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <img
              src={status?.user?.avatarUrl}
              alt={status?.user?.login}
              className="w-16 h-16 rounded-full border-2 border-border"
            />
            <div className="absolute -bottom-1 -right-1 p-1 bg-background rounded-full border border-border">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          </div>
          <div className="text-center">
            <p className="font-medium">@{status?.user?.login}</p>
            <p className="text-sm text-muted-foreground">
              Checking permissions...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Insufficient permissions state
  if (connectionState === "insufficient-permissions") {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <img
              src={status?.user?.avatarUrl}
              alt={status?.user?.login}
              className="w-16 h-16 rounded-full border-2 border-amber-500"
            />
            <div className="absolute -bottom-1 -right-1 p-1 bg-amber-100 dark:bg-amber-900 rounded-full">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="text-center">
            <p className="font-medium">@{status?.user?.login}</p>
            <Badge variant="secondary" className="mt-1">
              Connected
            </Badge>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg max-w-md">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="font-medium text-sm">Additional Permissions Required</p>
            <p className="text-sm text-muted-foreground">
              {permissions?.message ||
                "We need additional permissions to access your repositories."}
            </p>
            {permissions?.missing && permissions.missing.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Missing scopes:{" "}
                <code className="bg-muted px-1 rounded">
                  {permissions.missing.join(", ")}
                </code>
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleReauth} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Re-authenticate
          </Button>
          <Button variant="outline" onClick={handleRefresh}>
            Check Again
          </Button>
        </div>
      </div>
    );
  }

  // Ready state (connected with valid permissions)
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <img
            src={status?.user?.avatarUrl}
            alt={status?.user?.login}
            className="w-16 h-16 rounded-full border-2 border-green-500"
          />
          <div className="absolute -bottom-1 -right-1 p-1 bg-green-100 dark:bg-green-900 rounded-full">
            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="text-center">
          <p className="font-medium">@{status?.user?.login}</p>
          <Badge
            variant="secondary"
            className={cn(
              "mt-1 bg-green-100 dark:bg-green-900",
              "text-green-700 dark:text-green-300"
            )}
          >
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        </div>
      </div>

      <p className="text-sm text-muted-foreground text-center max-w-md">
        GitHub connected successfully! We can now access your repositories
        to discover your workspace structure.
      </p>

      <p className="text-sm text-muted-foreground">
        Click Continue to select your repository.
      </p>
    </div>
  );
}
