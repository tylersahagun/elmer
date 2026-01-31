"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Folder, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface PathBrowserProps {
  owner?: string;
  repo?: string;
  ref?: string;
  value?: string;
  onSelect: (path: string) => void;
  label?: string;
  className?: string;
}

interface TreeResponse {
  type: "dir" | "file";
  path: string;
  items?: Array<{
    name: string;
    path: string;
    type: "file" | "dir" | "symlink" | "submodule";
    size?: number;
  }>;
}

export function PathBrowser({
  owner,
  repo,
  ref,
  value,
  onSelect,
  label = "Browse",
  className,
}: PathBrowserProps) {
  const [open, setOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  const normalizePath = (path: string) =>
    path.replace(/^\/+/, "").replace(/^\.\//, "").replace(/\/+$/, "");

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setCurrentPath(normalizePath(value || ""));
    }
  };

  const { data, isLoading } = useQuery<TreeResponse>({
    queryKey: ["github-tree", owner, repo, normalizePath(currentPath), ref],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("owner", owner || "");
      params.set("repo", repo || "");
      const resolvedPath = normalizePath(currentPath);
      if (resolvedPath) params.set("path", resolvedPath);
      if (ref) params.set("ref", ref);

      const res = await fetch(`/api/github/tree?${params}`);
      if (!res.ok) {
        throw new Error("Failed to fetch tree");
      }
      return res.json();
    },
    enabled: !!owner && !!repo,
  });

  const items = useMemo(() => {
    const list = data?.items || [];
    const dirs = list.filter((item) => item.type === "dir");
    return dirs.sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  const canGoUp = currentPath.includes("/");

  const handleGoUp = () => {
    if (!canGoUp) {
      setCurrentPath("");
      return;
    }
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    setCurrentPath(parts.join("/"));
  };

  const handleSelectCurrent = () => {
    const normalized = currentPath ? `${normalizePath(currentPath)}/` : "";
    onSelect(normalized);
    setOpen(false);
  };

  return (
    <div className={cn("inline-flex", className)}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" disabled={!owner || !repo}>
            {label}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-muted-foreground truncate">
              {currentPath || "/"}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleGoUp}
              disabled={!currentPath}
              className="h-7 w-7"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          <div className="max-h-56 overflow-auto space-y-1">
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading folders...
              </div>
            )}
            {!isLoading && items.length === 0 && (
              <div className="text-xs text-muted-foreground">
                No folders found
              </div>
            )}
            {!isLoading &&
              items.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => setCurrentPath(item.path)}
                >
                  <Folder className="h-4 w-4" />
                  <span className="truncate">{item.name}</span>
                </Button>
              ))}
          </div>

          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={handleSelectCurrent}
          >
            Use this folder
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
