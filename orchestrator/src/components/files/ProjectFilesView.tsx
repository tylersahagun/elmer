"use client";

import * as React from "react";
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  Edit3,
  Eye,
  Save,
  X,
  Plus,
  RefreshCw,
  Loader2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

function isEditableFile(filename: string): boolean {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return ["md", "txt", "json"].includes(ext);
}

interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
  content?: string;
  gitStatus?: "untracked" | "modified" | "deleted";
}

interface ProjectFilesViewProps {
  projectId: string;
  branchName?: string;
  files: FileNode[];
  onFileSelect?: (file: FileNode) => void;
  onFileSave?: (path: string, content: string) => Promise<void>;
  onFileCreate?: (path: string, content: string) => Promise<void>;
  onRefresh?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function ProjectFilesView({
  projectId,
  branchName,
  files,
  onFileSelect,
  onFileSave,
  onFileCreate,
  onRefresh,
  isLoading = false,
  className,
}: ProjectFilesViewProps) {
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
        setSelectedFile(file);
        setEditContent(file.content || "");
        setIsEditing(false);
        onFileSelect?.(file);
      }
    },
    [onFileSelect],
  );

  const handleSave = useCallback(async () => {
    if (!selectedFile || !onFileSave) return;
    setIsSaving(true);
    try {
      await onFileSave(selectedFile.path, editContent);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  }, [selectedFile, editContent, onFileSave]);

  const handleCancel = useCallback(() => {
    setEditContent(selectedFile?.content || "");
    setIsEditing(false);
  }, [selectedFile]);

  const handleCreateFile = useCallback(async () => {
    if (!newFileName.trim() || !onFileCreate) return;
    setIsSaving(true);
    try {
      await onFileCreate(newFileName.trim(), "");
      setIsCreating(false);
      setNewFileName("");
    } finally {
      setIsSaving(false);
    }
  }, [newFileName, onFileCreate]);

  const renderFileTree = (nodes: FileNode[], depth = 0) => {
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
              {node.children && renderFileTree(node.children, depth + 1)}
            </FolderContent>
          </FolderItem>
        );
      }

      const Icon = getFileIcon(node.name);
      const isSelected = selectedFile?.path === node.path;

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
    <div className={cn("flex h-full", className)}>
      {/* File Tree Sidebar */}
      {isSidebarOpen ? (
        <motion.div
          initial={false}
          animate={{ width, opacity: 1 }}
          transition={
            isResizing ? { duration: 0 } : { duration: 0.2, ease: "easeInOut" }
          }
          className="flex-shrink-0 border-r border-border dark:border-[rgba(255,255,255,0.14)] relative"
          style={{ width }}
        >
          <div className="flex flex-col bg-card h-full">
            {/* Header with traffic lights */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border dark:border-[rgba(255,255,255,0.14)] bg-muted/30">
              <div className="flex items-center gap-3">
                <TrafficLights
                  size={10}
                  interactive
                  onClose={() => {}}
                  onMinimize={() => setIsSidebarOpen(false)}
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
                    onClick={() => setIsCreating(true)}
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
      ) : (
        /* Collapsed Sidebar Toggle - green button only */
        <div className="flex-shrink-0 h-full flex flex-col items-center py-3 px-2 bg-card rounded-2xl border border-border dark:border-[rgba(255,255,255,0.14)]">
          <TrafficLights
            size={10}
            interactive
            showOnly="maximize"
            onMaximize={() => setIsSidebarOpen(true)}
          />
          <span className="text-xs text-muted-foreground [writing-mode:vertical-lr] rotate-180 font-mono mt-3">
            Files
          </span>
          <div className="flex-1" />
        </div>
      )}

      {/* File Viewer/Editor */}
      <div className="flex-1 flex flex-col bg-card min-w-0">
        {selectedFile ? (
          <>
            {/* File Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-[rgba(255,255,255,0.14)] bg-muted/30">
              <div className="flex items-center gap-2 min-w-0">
                {React.createElement(getFileIcon(selectedFile.name), {
                  className: "w-4 h-4 text-muted-foreground shrink-0",
                })}
                <span className="text-sm font-mono text-foreground truncate">
                  {selectedFile.path}
                </span>
                {selectedFile.gitStatus && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] px-1.5 font-mono",
                      selectedFile.gitStatus === "untracked" &&
                        "border-green-500/50 text-green-600 dark:text-green-400",
                      selectedFile.gitStatus === "modified" &&
                        "border-amber-500/50 text-amber-600 dark:text-amber-400",
                      selectedFile.gitStatus === "deleted" &&
                        "border-red-500/50 text-red-600 dark:text-red-400",
                    )}
                  >
                    {selectedFile.gitStatus === "untracked"
                      ? "U"
                      : selectedFile.gitStatus === "modified"
                        ? "M"
                        : "D"}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isEditableFile(selectedFile.name) && onFileSave && (
                  <>
                    {isEditing ? (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleSave}
                          disabled={isSaving}
                          className="gap-1.5"
                        >
                          <Save className="w-3.5 h-3.5" />
                          {isSaving ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancel}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* File Content */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div
                    key="editor"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="h-full p-4"
                  >
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full h-full min-h-[400px] font-mono text-sm resize-none"
                      placeholder="Enter content..."
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="p-6"
                  >
                    {selectedFile.name.endsWith(".md") ? (
                      <article className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {selectedFile.content || ""}
                        </ReactMarkdown>
                      </article>
                    ) : (
                      <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">
                        {selectedFile.content || ""}
                      </pre>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-border dark:border-[rgba(255,255,255,0.14)] flex items-center justify-between text-xs text-muted-foreground font-mono bg-muted/30">
              <span className="flex items-center gap-1.5">
                {isEditing ? (
                  <span className="text-amber-600 dark:text-amber-400">
                    Editing mode
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3 h-3" />
                    {isEditableFile(selectedFile.name)
                      ? "Preview mode"
                      : "View only"}
                  </span>
                )}
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground font-mono text-sm">
                Select a file to view
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Create File Dialog */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-black/50 backdrop-blur-sm"
            onClick={() => setIsCreating(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border dark:border-[rgba(255,255,255,0.14)] rounded-2xl shadow-lg p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Create New File
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    File Name
                  </label>
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="e.g., notes.md"
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    {"// Use .md for markdown files"}
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsCreating(false);
                      setNewFileName("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateFile}
                    disabled={!newFileName.trim() || isSaving}
                    className="gap-2"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Create
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export type { FileNode };
