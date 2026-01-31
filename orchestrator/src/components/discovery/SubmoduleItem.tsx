"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  GitBranch,
  Check,
  AlertCircle,
  Lock,
  FolderOpen,
  Loader2,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DiscoveredSubmodule } from "@/lib/discovery/types";

interface SubmoduleItemProps {
  submodule: DiscoveredSubmodule;
  isScanning?: boolean;
  onRequestAuth?: (submodule: DiscoveredSubmodule) => void;
  onRetry?: (submodule: DiscoveredSubmodule) => void;
}

/**
 * Extract the organization/owner from a GitHub URL
 */
function extractOrgFromUrl(url: string): string | null {
  // Handle various GitHub URL formats:
  // - https://github.com/org/repo.git
  // - git@github.com:org/repo.git
  // - https://github.com/org/repo
  const httpsMatch = url.match(/github\.com\/([^/]+)\/[^/]+/);
  const sshMatch = url.match(/github\.com:([^/]+)\/[^/]+/);

  return httpsMatch?.[1] || sshMatch?.[1] || null;
}

/**
 * Get status badge info for a submodule
 */
function getStatusBadge(
  submodule: DiscoveredSubmodule,
  isScanning: boolean,
): {
  icon: React.ElementType;
  label: string;
  className: string;
} {
  if (isScanning) {
    return {
      icon: Loader2,
      label: "Scanning...",
      className: "bg-blue-500/20 text-blue-400",
    };
  }

  if (submodule.requiresAuth && !submodule.scanned) {
    return {
      icon: Lock,
      label: "Auth required",
      className: "bg-amber-500/20 text-amber-400",
    };
  }

  if (submodule.scanError) {
    return {
      icon: AlertCircle,
      label: "Error",
      className: "bg-red-500/20 text-red-400",
    };
  }

  if (submodule.scanned) {
    return {
      icon: Check,
      label: "Scanned",
      className: "bg-green-500/20 text-green-400",
    };
  }

  return {
    icon: GitBranch,
    label: "Detected",
    className: "bg-gray-500/20 text-gray-400",
  };
}

export function SubmoduleItem({
  submodule,
  isScanning = false,
  onRequestAuth,
  onRetry,
}: SubmoduleItemProps) {
  const statusBadge = getStatusBadge(submodule, isScanning);
  const StatusIcon = statusBadge.icon;
  const org = extractOrgFromUrl(submodule.url);
  const showAuthActions =
    submodule.requiresAuth && !submodule.scanned && !isScanning;

  const handleGrantAccess = () => {
    // Open GitHub's application authorization settings
    // Users can grant access to additional organizations there
    window.open(
      "https://github.com/settings/connections/applications",
      "_blank",
      "noopener,noreferrer",
    );
    onRequestAuth?.(submodule);
  };

  const handleRetry = () => {
    onRetry?.(submodule);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 rounded-lg border border-white/10 bg-white/5"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Icon and info */}
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center flex-shrink-0">
            <GitBranch className="w-4 h-4 text-orange-400" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm truncate">
                {submodule.name}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full",
                  statusBadge.className,
                )}
              >
                <StatusIcon
                  className={cn("w-3 h-3", isScanning && "animate-spin")}
                />
                {statusBadge.label}
              </span>
            </div>

            <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">
              {submodule.path}
            </p>

            {/* Show prototype path if found */}
            {submodule.prototypePath && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <FolderOpen className="w-3 h-3 text-purple-400" />
                <span className="text-xs text-purple-300">
                  Prototypes:{" "}
                  <span className="font-mono">{submodule.prototypePath}</span>
                </span>
              </div>
            )}

            {/* Show error if present */}
            {submodule.scanError && (
              <p className="text-xs text-red-400 mt-1.5">
                {submodule.scanError}
              </p>
            )}

            {/* Auth actions for submodules that need authentication */}
            {showAuthActions && (
              <div className="flex items-center gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGrantAccess}
                  className="h-7 text-xs bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 text-amber-300"
                >
                  <ExternalLink className="w-3 h-3 mr-1.5" />
                  Grant access to {org || "org"}
                </Button>
                {onRetry && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRetry}
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <RefreshCw className="w-3 h-3 mr-1.5" />
                    Retry
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Branch info if available */}
        {submodule.branch && (
          <span className="text-[10px] text-muted-foreground flex-shrink-0">
            {submodule.branch}
          </span>
        )}
      </div>
    </motion.div>
  );
}
