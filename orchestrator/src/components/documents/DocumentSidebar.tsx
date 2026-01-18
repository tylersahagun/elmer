"use client";

import * as React from "react";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Palette,
  Code,
  Megaphone,
  FlaskConical,
  Users,
  Sparkles,
  Plus,
} from "lucide-react";
import type { DocumentType } from "@/lib/db/schema";

// Document type metadata
const DOCUMENT_TYPES: Record<
  DocumentType,
  {
    label: string;
    icon: React.ElementType;
    color: string;
    description: string;
  }
> = {
  research: {
    label: "Research",
    icon: FlaskConical,
    color: "text-teal-500 dark:text-teal-400",
    description: "User research and insights",
  },
  prd: {
    label: "PRD",
    icon: FileText,
    color: "text-purple-500 dark:text-purple-400",
    description: "Product Requirements Document",
  },
  design_brief: {
    label: "Design Brief",
    icon: Palette,
    color: "text-blue-500 dark:text-blue-400",
    description: "Design specifications and guidelines",
  },
  engineering_spec: {
    label: "Engineering Spec",
    icon: Code,
    color: "text-green-500 dark:text-green-400",
    description: "Technical implementation details",
  },
  gtm_brief: {
    label: "GTM Brief",
    icon: Megaphone,
    color: "text-orange-500 dark:text-orange-400",
    description: "Go-to-market strategy",
  },
  prototype_notes: {
    label: "Prototype Notes",
    icon: Sparkles,
    color: "text-pink-500 dark:text-pink-400",
    description: "Prototype specifications",
  },
  jury_report: {
    label: "Jury Report",
    icon: Users,
    color: "text-amber-500 dark:text-amber-400",
    description: "Evaluation results",
  },
};

interface Document {
  id: string;
  type: DocumentType;
  title: string;
  content: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    generatedBy?: "user" | "ai";
    model?: string;
    reviewStatus?: "draft" | "reviewed" | "approved";
  };
}

interface DocumentSidebarProps {
  documents: Document[];
  selectedId?: string;
  onSelect: (doc: Document) => void;
  onUpload?: () => void;
  className?: string;
  defaultOpen?: boolean;
}

export function DocumentSidebar({
  documents,
  selectedId,
  onSelect,
  onUpload,
  className,
  defaultOpen = true,
}: DocumentSidebarProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const { width, isResizing, handleResizeStart } = useResizablePanel({
    minWidth: 200,
    maxWidth: 500,
    defaultWidth: 280,
    storageKey: "document-sidebar-width",
    direction: "right",
  });

  // Group documents by type
  const grouped = documents.reduce(
    (acc, doc) => {
      if (!acc[doc.type]) acc[doc.type] = [];
      acc[doc.type].push(doc);
      return acc;
    },
    {} as Record<DocumentType, Document[]>
  );

  // Order of document types
  const typeOrder: DocumentType[] = [
    "research",
    "prd",
    "design_brief",
    "engineering_spec",
    "gtm_brief",
    "prototype_notes",
    "jury_report",
  ];

  // Get types that have documents
  const typesWithDocs = typeOrder.filter((type) => grouped[type]?.length > 0);

  const handleExpand = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleCollapse = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <div className={cn("relative flex h-full", className)}>
      {/* Collapsed state - vertical sidebar with traffic light */}
      {!isOpen && (
        <div className="flex-shrink-0 h-full flex flex-col items-center py-3 px-2 bg-card rounded-2xl border border-border dark:border-[rgba(255,255,255,0.14)]">
          <TrafficLights
            size={10}
            interactive
            onClose={() => {}} // Aesthetic only
            onMinimize={() => {}} // Already minimized
            onMaximize={handleExpand}
          />
          <div className="w-px flex-1 bg-border dark:bg-[rgba(255,255,255,0.14)] my-3" />
          <span className="text-xs text-muted-foreground [writing-mode:vertical-lr] rotate-180 font-mono">
            Documents
          </span>
        </div>
      )}

      {/* Expanded state */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width }}
          exit={{ opacity: 0, width: 0 }}
          transition={isResizing ? { duration: 0 } : { duration: 0.25, ease: "easeInOut" }}
          className="h-full relative rounded-2xl border border-border dark:border-[rgba(255,255,255,0.14)] overflow-hidden"
        >
          <div 
            className="h-full flex flex-col bg-card"
            style={{ width }}
          >
            {/* Header with traffic lights */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border dark:border-[rgba(255,255,255,0.14)] bg-muted/30">
              <div className="flex items-center gap-3">
                <TrafficLights
                  size={10}
                  interactive
                  onClose={() => {}} // Aesthetic only
                  onMinimize={handleCollapse}
                  onMaximize={() => {}} // Already maximized
                />
                <span className="font-mono text-sm text-muted-foreground">Documents</span>
              </div>
              {onUpload && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onUpload}
                  className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Document List */}
            <div className="flex-1 overflow-y-auto px-1 py-2">
              {documents.length === 0 ? (
                <div className="p-4 text-center">
                  <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No documents yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1 font-mono">
                    // Move project to PRD stage to generate
                  </p>
                </div>
              ) : (
                <Files
                  className="bg-transparent"
                  defaultOpen={typesWithDocs}
                >
                  {typeOrder.map((type) => {
                    const docs = grouped[type];
                    if (!docs || docs.length === 0) return null;

                    const typeInfo = DOCUMENT_TYPES[type];
                    const Icon = typeInfo.icon;

                    return (
                      <FolderItem key={type} value={type}>
                        <FolderTrigger
                          className={cn("font-medium hover:bg-accent rounded-md transition-colors", typeInfo.color)}
                        >
                          {typeInfo.label}
                        </FolderTrigger>
                        <FolderContent>
                          {docs.map((doc) => (
                            <div
                              key={doc.id}
                              onClick={() => onSelect(doc)}
                              className={cn(
                                "cursor-pointer rounded-md transition-all hover:bg-accent",
                                selectedId === doc.id && "bg-accent"
                              )}
                            >
                              <FileItem icon={Icon}>
                                <div className="flex items-center justify-between w-full gap-2">
                                  <span className="truncate text-foreground">
                                    {doc.title}
                                  </span>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {doc.metadata?.generatedBy === "ai" && (
                                      <Sparkles className="w-3 h-3 text-purple-500 dark:text-purple-400" />
                                    )}
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] px-1 border-border dark:border-[rgba(255,255,255,0.14)] text-muted-foreground"
                                    >
                                      v{doc.version}
                                    </Badge>
                                  </div>
                                </div>
                              </FileItem>
                            </div>
                          ))}
                        </FolderContent>
                      </FolderItem>
                    );
                  })}
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

export { DOCUMENT_TYPES };
export type { Document };
