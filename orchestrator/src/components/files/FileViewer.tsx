"use client";

import * as React from "react";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  File,
  FileCode,
  FileJson,
  Image,
  Edit3,
  Eye,
  Save,
  X,
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

interface FileViewerProps {
  file: FileNode | null;
  onSave?: (path: string, content: string) => Promise<void>;
  className?: string;
}

export function FileViewer({
  file,
  onSave,
  className,
}: FileViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Reset editing state when file changes
  React.useEffect(() => {
    setEditContent(file?.content || "");
    setIsEditing(false);
  }, [file]);

  const handleSave = useCallback(async () => {
    if (!file || !onSave) return;
    setIsSaving(true);
    try {
      await onSave(file.path, editContent);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  }, [file, editContent, onSave]);

  const handleCancel = useCallback(() => {
    setEditContent(file?.content || "");
    setIsEditing(false);
  }, [file]);

  if (!file) {
    return (
      <div className={cn("flex items-center justify-center h-full", className)}>
        <div className="text-center p-8">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground font-mono text-sm">Select a file to view</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* File Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-[rgba(255,255,255,0.14)] bg-muted/30">
        <div className="flex items-center gap-2 min-w-0">
          {React.createElement(getFileIcon(file.name), {
            className: "w-4 h-4 text-muted-foreground shrink-0",
          })}
          <span className="text-sm font-mono text-foreground truncate">
            {file.path}
          </span>
          {file.gitStatus && (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] px-1.5 font-mono",
                file.gitStatus === "untracked" &&
                  "border-green-500/50 text-green-600 dark:text-green-400",
                file.gitStatus === "modified" &&
                  "border-amber-500/50 text-amber-600 dark:text-amber-400",
                file.gitStatus === "deleted" &&
                  "border-red-500/50 text-red-600 dark:text-red-400"
              )}
            >
              {file.gitStatus === "untracked" ? "U" : file.gitStatus === "modified" ? "M" : "D"}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isEditableFile(file.name) && onSave && (
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
              {file.name.endsWith(".md") ? (
                <article className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {file.content || ""}
                  </ReactMarkdown>
                </article>
              ) : (
                <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">
                  {file.content || ""}
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
            <span className="text-amber-600 dark:text-amber-400">Editing mode</span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Eye className="w-3 h-3" />
              {isEditableFile(file.name)
                ? "Preview mode"
                : "View only"}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}

export type { FileNode };
