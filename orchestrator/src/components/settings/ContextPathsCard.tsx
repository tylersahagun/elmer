"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  FolderOpen, 
  ArrowUp, 
  ArrowDown, 
  Plus, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  XCircle 
} from "lucide-react";

interface ContextPathsCardProps {
  contextPaths: string[];
  setContextPaths: React.Dispatch<React.SetStateAction<string[]>>;
  resolvedContextPath?: string | null;
  workspaceId?: string;
}

export function ContextPathsCard({
  contextPaths,
  setContextPaths,
  resolvedContextPath,
  workspaceId,
}: ContextPathsCardProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    message: string;
    synced?: number;
    skipped?: number;
  } | null>(null);

  const updateContextPath = (index: number, value: string) => {
    setContextPaths((prev) => prev.map((item, idx) => (idx === index ? value : item)));
  };

  const addContextPath = () => {
    setContextPaths((prev) => [...prev, ""]);
  };

  const removeContextPath = (index: number) => {
    setContextPaths((prev) => prev.filter((_, idx) => idx !== index));
  };

  const moveContextPath = (from: number, to: number) => {
    setContextPaths((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const handleSyncKnowledgeBase = async () => {
    if (!workspaceId) return;
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/syncKnowledge`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setSyncResult({
          success: true,
          message: data.message || "Knowledge base synced successfully",
          synced: data.synced,
          skipped: data.skipped,
        });
      } else {
        setSyncResult({
          success: false,
          message: data.error || "Failed to sync knowledge base",
        });
      }
    } catch (error) {
      setSyncResult({
        success: false,
        message: error instanceof Error ? error.message : "Sync failed",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Context Paths
            </CardTitle>
            <CardDescription>
              The first path is used as the default knowledge base root.
            </CardDescription>
          </div>
          {workspaceId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleSyncKnowledgeBase}
              disabled={isSyncing}
            >
              <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
              {isSyncing ? "Syncing..." : "Sync Knowledge Base"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {syncResult && (
          <div
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg text-xs",
              syncResult.success
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-red-500/10 text-red-600 dark:text-red-400"
            )}
          >
            {syncResult.success ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            <span>{syncResult.message}</span>
            {syncResult.synced !== undefined && (
              <span className="text-muted-foreground">
                ({syncResult.synced} synced, {syncResult.skipped} skipped)
              </span>
            )}
          </div>
        )}

        {resolvedContextPath && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <FolderOpen className="w-3 h-3" />
            <span>Primary context path: </span>
            <span className="font-mono truncate" title={resolvedContextPath}>
              {resolvedContextPath}
            </span>
          </div>
        )}

        <div className="space-y-2">
          {contextPaths.map((path, idx) => (
            <div key={`context-path-${idx}`} className="flex items-center gap-2">
              <Input
                placeholder="elmer-docs/"
                value={path}
                onChange={(e) => updateContextPath(idx, e.target.value)}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => moveContextPath(idx, idx - 1)}
                disabled={idx === 0}
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => moveContextPath(idx, idx + 1)}
                disabled={idx === contextPaths.length - 1}
              >
                <ArrowDown className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => removeContextPath(idx)}
                disabled={contextPaths.length === 1}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={addContextPath}
          >
            <Plus className="w-4 h-4" />
            Add Context Path
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
