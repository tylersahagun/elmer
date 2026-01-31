"use client";

import * as React from "react";
import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ResizeHandle } from "@/components/ui/resize-handle";
import { useResizablePanel } from "@/hooks/use-resizable-panel";
import { TrafficLights } from "@/components/chrome/TrafficLights";
import {
  Files,
  FolderItem,
  FolderTrigger,
  FolderContent,
  FileItem,
} from "@/components/animate-ui/components/radix/files";
import {
  FileText,
  FolderGit2,
  GitBranch,
  File,
  FileCode,
  FileJson,
  Image,
  Plus,
  RefreshCw,
  Loader2,
} from "lucide-react";

// File type to icon mapping
const FILE_ICONS: Record<string, React.ElementType> = {
  md: FileText,
  txt: FileText,
  json: FileJson,
  ts: FileCode,
  tsx: FileCode,
  js: FileCode,
  jsx: FileCode,
  css: FileCode,
  html: FileCode,
  png: Image,
  jpg: Image,
  jpeg: Image,
  svg: Image,
  gif: Image,
  default: File,
};

function getFileIcon(filename: string): React.ElementType {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return FILE_ICONS[ext] || FILE_ICONS.default;
}

interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
  content?: string;
  gitStatus?: "untracked" | "modified" | "deleted";
}

interface FilesSidebarProps {
  projectId: string;
  branchName?: string;
  files: FileNode[];
  selectedPath?: string;
  onFileSelect: (file: FileNode) => void;
  onFileCreate?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  className?: string;
  defaultOpen?: boolean;
}

export function FilesSidebar({
  projectId,
  branchName,
  files,
  selectedPath,
  onFileSelect,
  onFileCreate,
  onRefresh,
  isLoading = false,
  className,
  defaultOpen = true,
}: FilesSidebarProps) {
  // Default to collapsed on mobile screens (< 1024px)
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === "undefined") return defaultOpen;
    return window.innerWidth >= 1024 ? defaultOpen : false;
  });

  const { width, isResizing, handleResizeStart } = useResizablePanel({
    minWidth: 200,
    maxWidth: 500,
    defaultWidth: 280,
    storageKey: `project-files-sidebar-${projectId}`,
    direction: "right",
  });

  // Get all folder paths for default open state
  const allFolderPaths = useMemo(() => {
    const paths: string[] = [];
    const traverse = (nodes: FileNode[]) => {
      nodes.forEach((node) => {
        if (node.type === "directory") {
          paths.push(node.path);
          if (node.children) traverse(node.children);
        }
      });
    };
    traverse(files);
    return paths;
  }, [files]);

  const handleFileClick = useCallback(
    (file: FileNode) => {
      if (file.type === "file") {
        onFileSelect(file);
      }
    },
    [onFileSelect],
  );

  const handleExpand = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleCollapse = useCallback(() => {
    setIsOpen(false);
  }, []);

  const renderFileTree = (nodes: FileNode[]) => {
    return nodes.map((node) => {
      if (node.type === "directory") {
        return (
          <FolderItem key={node.path} value={node.path}>
            <FolderTrigger
              gitStatus={node.gitStatus}
              className="hover:bg-accent rounded-md transition-colors"
            >
              {node.name}
            </FolderTrigger>
            <FolderContent>
              {node.children && renderFileTree(node.children)}
            </FolderContent>
          </FolderItem>
        );
      }

      const Icon = getFileIcon(node.name);
      const isSelected = selectedPath === node.path;

      return (
        <div
          key={node.path}
          onClick={() => handleFileClick(node)}
          className={cn(
            "cursor-pointer rounded-md transition-all hover:bg-accent",
            isSelected && "bg-accent",
          )}
        >
          <FileItem icon={Icon} gitStatus={node.gitStatus}>
            <span className="truncate text-foreground">{node.name}</span>
          </FileItem>
        </div>
      );
    });
  };

  return (
    <div className={cn("relative flex h-full", className)}>
      {/* Collapsed state - green button only */}
      {!isOpen && (
        <div className="flex-shrink-0 h-full flex flex-col items-center py-3 px-2 bg-card rounded-2xl border border-border dark:border-[rgba(255,255,255,0.14)]">
          <TrafficLights
            size={10}
            interactive
            showOnly="maximize"
            onMaximize={handleExpand}
          />
          <span className="text-xs text-muted-foreground [writing-mode:vertical-lr] rotate-180 font-mono mt-3">
            Files
          </span>
          <div className="flex-1" />
        </div>
      )}

      {/* Expanded state */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width }}
          exit={{ opacity: 0, width: 0 }}
          transition={
            isResizing ? { duration: 0 } : { duration: 0.25, ease: "easeInOut" }
          }
          className="h-full relative rounded-2xl border border-border dark:border-[rgba(255,255,255,0.14)] overflow-hidden"
        >
          <div className="h-full flex flex-col bg-card" style={{ width }}>
            {/* Header with traffic lights */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border dark:border-[rgba(255,255,255,0.14)] bg-muted/30">
              <div className="flex items-center gap-3">
                <TrafficLights
                  size={10}
                  interactive
                  onClose={() => {}}
                  onMinimize={handleCollapse}
                  onMaximize={() => {}}
                />
                <div className="flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-muted-foreground" />
                  <span className="font-mono text-sm text-muted-foreground">
                    Files
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                {onFileCreate && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onFileCreate}
                    className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                )}
                {onRefresh && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    <RefreshCw
                      className={cn("w-4 h-4", isLoading && "animate-spin")}
                    />
                  </Button>
                )}
              </div>
            </div>

            {/* Branch Info */}
            {branchName && (
              <div className="px-3 py-2 border-b border-border dark:border-[rgba(255,255,255,0.14)] bg-muted/20">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                  <GitBranch className="w-3.5 h-3.5" />
                  <span className="truncate">{branchName}</span>
                </div>
              </div>
            )}

            {/* File Tree */}
            <div className="flex-1 overflow-y-auto px-1 py-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : files.length === 0 ? (
                <div className="p-4 text-center">
                  <FolderGit2 className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No files yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1 font-mono">
                    {"// Create a file to get started"}
                  </p>
                </div>
              ) : (
                <Files className="bg-transparent" defaultOpen={allFolderPaths}>
                  {renderFileTree(files)}
                </Files>
              )}
            </div>
          </div>

          {/* Resize Handle */}
          <ResizeHandle
            onMouseDown={handleResizeStart}
            isResizing={isResizing}
            direction="horizontal"
            className="right-0"
          />
        </motion.div>
      )}
    </div>
  );
}

export type { FileNode };
