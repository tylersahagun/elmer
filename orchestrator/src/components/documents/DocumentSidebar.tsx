"use client";

import * as React from "react";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResizeHandle } from "@/components/ui/resize-handle";
import { useResizablePanel } from "@/hooks/use-resizable-panel";
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
  PanelLeftClose,
  PanelLeft,
  Upload,
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
    color: "text-teal-400",
    description: "User research and insights",
  },
  prd: {
    label: "PRD",
    icon: FileText,
    color: "text-purple-400",
    description: "Product Requirements Document",
  },
  design_brief: {
    label: "Design Brief",
    icon: Palette,
    color: "text-blue-400",
    description: "Design specifications and guidelines",
  },
  engineering_spec: {
    label: "Engineering Spec",
    icon: Code,
    color: "text-green-400",
    description: "Technical implementation details",
  },
  gtm_brief: {
    label: "GTM Brief",
    icon: Megaphone,
    color: "text-orange-400",
    description: "Go-to-market strategy",
  },
  prototype_notes: {
    label: "Prototype Notes",
    icon: Sparkles,
    color: "text-pink-400",
    description: "Prototype specifications",
  },
  jury_report: {
    label: "Jury Report",
    icon: Users,
    color: "text-amber-400",
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

  const toggleSidebar = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <div className={cn("relative flex h-full", className)}>
      {/* Collapsed state - always visible when sidebar is closed */}
      {!isOpen && (
        <div className="flex-shrink-0 h-full flex flex-col items-center py-4 px-2 bg-black/20 border-r border-white/10">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
          >
            <PanelLeft className="w-4 h-4" />
          </Button>
          <div className="w-px h-8 bg-white/10 mt-2" />
          <span className="text-xs text-white/50 [writing-mode:vertical-lr] rotate-180 mt-3">
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
          className="h-full relative border-r border-white/10"
        >
          <div 
            className="h-full flex flex-col bg-black/20"
            style={{ width }}
          >
              {/* Header */}
              <div className="flex items-center justify-between px-3 py-3 border-b border-white/10">
                <h3 className="text-sm font-medium text-white">Documents</h3>
                <div className="flex items-center gap-1">
                  {onUpload && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onUpload}
                      className="h-7 w-7 text-white/70 hover:text-white hover:bg-white/10"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="h-7 w-7 text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <PanelLeftClose className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Document List */}
              <div className="flex-1 overflow-y-auto px-1 py-2">
                {documents.length === 0 ? (
                  <div className="p-4 text-center">
                    <FileText className="w-10 h-10 mx-auto mb-3 text-white/30" />
                    <p className="text-sm text-white/50">No documents yet</p>
                    <p className="text-xs text-white/30 mt-1">
                      Move the project to PRD stage to generate documents
                    </p>
                    {onUpload && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onUpload}
                        className="mt-4 gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload Document
                      </Button>
                    )}
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
                            className={cn("font-medium", typeInfo.color)}
                          >
                            {typeInfo.label}
                          </FolderTrigger>
                          <FolderContent>
                            {docs.map((doc) => (
                              <div
                                key={doc.id}
                                onClick={() => onSelect(doc)}
                                className={cn(
                                  "cursor-pointer rounded-md transition-all",
                                  selectedId === doc.id &&
                                    "ring-1 ring-purple-500/50 bg-purple-500/10"
                                )}
                              >
                                <FileItem icon={Icon}>
                                  <div className="flex items-center justify-between w-full gap-2">
                                    <span className="truncate text-white/80">
                                      {doc.title}
                                    </span>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      {doc.metadata?.generatedBy === "ai" && (
                                        <Sparkles className="w-3 h-3 text-purple-400" />
                                      )}
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] px-1 border-white/20 text-white/60"
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

              {/* Footer with upload button */}
              {documents.length > 0 && onUpload && (
                <div className="p-3 border-t border-white/10">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onUpload}
                    className="w-full gap-2 bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload Document
                  </Button>
                </div>
              )}
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
