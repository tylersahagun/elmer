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
// Removed GlassPanel import - using solid backgrounds now
import {
  Files,
  FolderItem,
  FolderTrigger,
  FolderContent,
  FileItem,
} from "@/components/animate-ui/components/radix/files";
import { TrafficLights } from "@/components/chrome/TrafficLights";
import {
  FileText,
  FolderGit2,
  BookOpen,
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
  Users,
  Target,
  Shield,
  Map,
  Sparkles,
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

// Special folder icons for knowledge base categories
const FOLDER_ICONS: Record<string, React.ElementType> = {
  personas: Users,
  "company-context": Target,
  guardrails: Shield,
  roadmap: Map,
  hypotheses: Sparkles,
};

function getFileIcon(filename: string): React.ElementType {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return FILE_ICONS[ext] || FILE_ICONS.default;
}

function getFolderIcon(folderName: string): React.ElementType | null {
  return FOLDER_ICONS[folderName.toLowerCase()] || null;
}

function isEditableFile(filename: string): boolean {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return ["md", "txt", "json"].includes(ext);
}

export interface KnowledgeBaseFile {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: KnowledgeBaseFile[];
  content?: string;
  category?: string;
  lastModified?: string;
}

interface KnowledgeBaseFilesViewProps {
  workspaceId: string;
  files: KnowledgeBaseFile[];
  title?: string;
  description?: string;
  onFileSelect?: (file: KnowledgeBaseFile) => void;
  onFileSave?: (path: string, content: string) => Promise<void>;
  onFileCreate?: (path: string, content: string) => Promise<void>;
  onRefresh?: () => void;
  isLoading?: boolean;
  className?: string;
  showHeader?: boolean;
  headerIcon?: React.ElementType;
}

export function KnowledgeBaseFilesView({
  workspaceId,
  files,
  title = "Knowledge Base",
  description = "Manage your workspace knowledge files",
  onFileSelect,
  onFileSave,
  onFileCreate,
  onRefresh,
  isLoading = false,
  className,
  showHeader = true,
  headerIcon: HeaderIcon = BookOpen,
}: KnowledgeBaseFilesViewProps) {
  const [selectedFile, setSelectedFile] = useState<KnowledgeBaseFile | null>(
    null,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  // Default to collapsed on mobile screens (< 1024px)
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth >= 1024;
  });

  const { width, isResizing, handleResizeStart } = useResizablePanel({
    minWidth: 200,
    maxWidth: 500,
    defaultWidth: 280,
    storageKey: `knowledge-base-sidebar-width-${workspaceId}`,
    direction: "right",
  });

  // Get all folder paths for default open state
  const allFolderPaths = useMemo(() => {
    const paths: string[] = [];
    const traverse = (nodes: KnowledgeBaseFile[]) => {
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
    (file: KnowledgeBaseFile) => {
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

  const renderFileTree = (nodes: KnowledgeBaseFile[], depth = 0) => {
    return nodes.map((node) => {
      if (node.type === "directory") {
        const FolderIcon = getFolderIcon(node.name);
        return (
          <FolderItem key={node.path} value={node.path}>
            <FolderTrigger className="text-slate-800 dark:text-slate-100 font-medium">
              <span className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                {FolderIcon && (
                  <FolderIcon className="w-3.5 h-3.5 text-muted-foreground" />
                )}
                <span className="text-slate-800 dark:text-slate-100">
                  {node.name}
                </span>
              </span>
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
        <FileItem
          key={node.path}
          icon={Icon}
          className={cn(
            "cursor-pointer text-foreground rounded-md transition-colors",
            "hover:bg-accent/50",
            isSelected && "bg-accent text-accent-foreground",
          )}
          onClick={() => handleFileClick(node)}
        >
          <span className="truncate text-slate-700 dark:text-slate-200">
            {node.name}
          </span>
        </FileItem>
      );
    });
  };

  return (
    <div className={cn("relative flex gap-4 h-full", className)}>
      {/* Sidebar - conditional render based on open state */}
      {isSidebarOpen ? (
        <motion.div
          key="expanded-sidebar"
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width }}
          exit={{ opacity: 0, width: 0 }}
          transition={
            isResizing ? { duration: 0 } : { duration: 0.25, ease: "easeInOut" }
          }
          className="h-full relative rounded-2xl border border-border dark:border-[rgba(255,255,255,0.14)] overflow-hidden"
        >
          <div className="h-full flex flex-col bg-card" style={{ width }}>
            {/* Sidebar Header with Traffic Lights */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border dark:border-[rgba(255,255,255,0.14)] bg-muted/30">
              <div className="flex items-center gap-3">
                <TrafficLights
                  size={10}
                  interactive
                  onClose={() => {}} // Aesthetic only
                  onMinimize={() => setIsSidebarOpen(false)}
                  onMaximize={() => {}} // Already maximized
                />
                <div className="flex items-center gap-2">
                  <HeaderIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="font-mono text-sm text-muted-foreground">
                    {title}
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

            {description && (
              <p className="text-xs text-muted-foreground font-mono px-3 py-2 border-b border-border dark:border-[rgba(255,255,255,0.14)]">
                {description}
              </p>
            )}

            {/* File Tree */}
            <div className="flex-1 overflow-y-auto px-1 py-2 min-h-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-500 dark:text-slate-400" />
                </div>
              ) : files.length === 0 ? (
                <div className="p-4 text-center">
                  <FolderGit2 className="w-10 h-10 mx-auto mb-3 text-slate-400 dark:text-slate-500" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    No files yet
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    Create a file to get started
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
        /* Collapsed Sidebar Toggle - matches DocumentSidebar pattern */
        <div className="flex-shrink-0 h-full flex flex-col items-center py-3 px-2 bg-card rounded-2xl border border-border dark:border-[rgba(255,255,255,0.14)]">
          <TrafficLights
            size={10}
            interactive
            showOnly="maximize"
            onMaximize={() => setIsSidebarOpen(true)}
          />
          <span className="text-xs text-muted-foreground [writing-mode:vertical-lr] rotate-180 font-mono mt-3">
            {title}
          </span>
          <div className="flex-1" />
        </div>
      )}

      {/* Main Content - Window-like viewer */}
      <div className="flex-1 flex flex-col min-w-0 rounded-2xl border border-border dark:border-[rgba(255,255,255,0.14)] bg-card overflow-hidden">
        {/* Top bar with traffic lights */}
        <div className="flex items-center gap-3 h-12 px-4 border-b border-border dark:border-[rgba(255,255,255,0.14)] bg-muted/30 flex-shrink-0">
          <TrafficLights size={10} />
          {/* File path */}
          {selectedFile && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {React.createElement(getFileIcon(selectedFile.name), {
                className: "w-4 h-4 text-muted-foreground shrink-0",
              })}
              <span className="text-sm font-mono text-foreground truncate">
                {selectedFile.path}
              </span>
              {selectedFile.category && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 border-border text-muted-foreground font-mono"
                >
                  {selectedFile.category}
                </Badge>
              )}
            </div>
          )}

          {/* Edit controls */}
          {selectedFile && isEditableFile(selectedFile.name) && onFileSave && (
            <div className="flex items-center gap-2 ml-auto">
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
                    className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="gap-1.5 bg-slate-200/50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 hover:bg-slate-300/80 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-y-auto scroll-smooth min-h-0">
          {selectedFile ? (
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="editor"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="h-full p-6"
                >
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-full min-h-[calc(100vh-250px)] font-mono text-sm bg-white dark:bg-slate-900/50 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
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
                  className="p-8 max-w-4xl mx-auto"
                >
                  {selectedFile.name.endsWith(".md") ? (
                    <article className="max-w-none text-slate-800 dark:text-slate-100">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => (
                            <h1 className="text-3xl font-bold mb-6 pb-3 border-b border-slate-300 dark:border-slate-600/50 text-slate-900 dark:text-white">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-2xl font-semibold mt-8 mb-4 text-purple-700 dark:text-purple-300">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-xl font-medium mt-6 mb-3 text-slate-800 dark:text-slate-100">
                              {children}
                            </h3>
                          ),
                          h4: ({ children }) => (
                            <h4 className="text-lg font-medium mt-5 mb-2 text-slate-700 dark:text-slate-200">
                              {children}
                            </h4>
                          ),
                          p: ({ children }) => (
                            <p className="text-slate-700 dark:text-slate-200 leading-relaxed mb-4">
                              {children}
                            </p>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc list-outside ml-6 space-y-2 my-4 text-slate-700 dark:text-slate-200">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal list-outside ml-6 space-y-2 my-4 text-slate-700 dark:text-slate-200">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="text-slate-700 dark:text-slate-200">
                              {children}
                            </li>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-purple-500/50 pl-4 my-6 italic text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/30 py-3 pr-4 rounded-r-lg">
                              {children}
                            </blockquote>
                          ),
                          code: ({ className, children }) => {
                            const isInline = !className;
                            return isInline ? (
                              <code className="bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded text-sm font-mono">
                                {children}
                              </code>
                            ) : (
                              <pre className="bg-slate-100 dark:bg-slate-900/80 p-4 rounded-lg text-sm overflow-x-auto my-4 border border-slate-300 dark:border-slate-700/50">
                                <code className="text-slate-800 dark:text-slate-200 font-mono">
                                  {children}
                                </code>
                              </pre>
                            );
                          },
                          pre: ({ children }) => <>{children}</>,
                          a: ({ href, children }) => (
                            <a
                              href={href}
                              className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 underline underline-offset-2"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {children}
                            </a>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-slate-900 dark:text-white">
                              {children}
                            </strong>
                          ),
                          em: ({ children }) => (
                            <em className="italic text-slate-600 dark:text-slate-300">
                              {children}
                            </em>
                          ),
                          hr: () => (
                            <hr className="my-8 border-slate-300 dark:border-slate-600/50" />
                          ),
                          table: ({ children }) => (
                            <div className="overflow-x-auto my-6">
                              <table className="min-w-full border border-slate-300 dark:border-slate-700/50 rounded-lg overflow-hidden">
                                {children}
                              </table>
                            </div>
                          ),
                          thead: ({ children }) => (
                            <thead className="bg-slate-100 dark:bg-slate-800/80">
                              {children}
                            </thead>
                          ),
                          th: ({ children }) => (
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-300 dark:border-slate-700/50">
                              {children}
                            </th>
                          ),
                          td: ({ children }) => (
                            <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700/30">
                              {children}
                            </td>
                          ),
                        }}
                      >
                        {selectedFile.content || ""}
                      </ReactMarkdown>
                    </article>
                  ) : selectedFile.name.endsWith(".json") ? (
                    <pre className="text-sm font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap bg-slate-100 dark:bg-slate-900/60 p-6 rounded-lg overflow-x-auto border border-slate-300 dark:border-slate-700/50">
                      {selectedFile.content || ""}
                    </pre>
                  ) : (
                    <pre className="text-sm font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                      {selectedFile.content || ""}
                    </pre>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8">
                <FileText className="w-16 h-16 mx-auto mb-6 text-slate-400 dark:text-slate-500" />
                <h3 className="text-xl font-medium text-slate-700 dark:text-slate-200 mb-2">
                  Select a file to view
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                  Choose a file from the sidebar to view or edit its contents.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedFile && (
          <div className="p-3 border-t border-border dark:border-[rgba(255,255,255,0.14)] bg-muted/30 flex items-center justify-between text-xs text-muted-foreground font-mono flex-shrink-0">
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
            {selectedFile.lastModified && (
              <span>
                Last modified:{" "}
                {new Date(selectedFile.lastModified).toLocaleDateString()}
              </span>
            )}
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
              className="bg-card border border-border dark:border-[rgba(255,255,255,0.14)] rounded-2xl shadow-[0_1px_0_rgba(0,0,0,0.03)] dark:shadow-[0_1px_0_rgba(0,0,0,0.4)] p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Create New File
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-600 dark:text-slate-300 mb-2 block">
                    File Name
                  </label>
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="e.g., new-persona.md"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    autoFocus
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Use .md for markdown files
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsCreating(false);
                      setNewFileName("");
                    }}
                    className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
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
