"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, GitBranch, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { SubmoduleItem } from "./SubmoduleItem";
import type { DiscoveredSubmodule } from "@/lib/discovery/types";

interface SubmodulePreviewProps {
  submodules: DiscoveredSubmodule[];
  scanningSubmodulePaths?: Set<string>; // Paths currently being scanned
  className?: string;
  onRequestAuth?: (submodule: DiscoveredSubmodule) => void;
  onRetry?: (submodule: DiscoveredSubmodule) => void;
}

export function SubmodulePreview({
  submodules,
  scanningSubmodulePaths = new Set(),
  className,
  onRequestAuth,
  onRetry,
}: SubmodulePreviewProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (submodules.length === 0) {
    return null;
  }

  // Calculate stats
  const scannedCount = submodules.filter((s) => s.scanned).length;
  const authRequiredCount = submodules.filter(
    (s) => s.requiresAuth && !s.scanned,
  ).length;
  const errorCount = submodules.filter((s) => s.scanError).length;
  const prototypesFound = submodules.filter((s) => s.prototypePath).length;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
          <GitBranch className="w-4 h-4 text-orange-400" />
          <span className="font-medium text-sm">Git Submodules</span>
          <span className="text-xs text-muted-foreground">
            ({submodules.length})
          </span>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-2 text-[10px]">
          {scannedCount > 0 && (
            <span className="text-green-400">{scannedCount} scanned</span>
          )}
          {authRequiredCount > 0 && (
            <span className="text-amber-400">
              {authRequiredCount} need auth
            </span>
          )}
          {errorCount > 0 && (
            <span className="text-red-400">{errorCount} errors</span>
          )}
        </div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 pl-6"
          >
            {/* Info message about prototypes */}
            {prototypesFound > 0 && (
              <div className="flex items-start gap-2 p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <Info className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-purple-200">
                  Found {prototypesFound} prototype folder
                  {prototypesFound === 1 ? "" : "s"} in submodules. These paths
                  will be configured for prototype generation.
                </p>
              </div>
            )}

            {/* Auth required info */}
            {authRequiredCount > 0 && (
              <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-200">
                  {authRequiredCount} submodule
                  {authRequiredCount === 1 ? "" : "s"} from different
                  organizations
                  {authRequiredCount === 1 ? " requires" : " require"} separate
                  authentication. You can configure access after setup.
                </p>
              </div>
            )}

            {/* Submodule list */}
            {submodules.map((submodule) => (
              <SubmoduleItem
                key={submodule.path}
                submodule={submodule}
                isScanning={scanningSubmodulePaths.has(submodule.path)}
                onRequestAuth={onRequestAuth}
                onRetry={onRetry}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
