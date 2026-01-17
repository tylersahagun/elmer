"use client";

import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard, GlassPanel } from "@/components/glass";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { springPresets } from "@/lib/animations";
import { cn } from "@/lib/utils";
import {
  FileText,
  Palette,
  Code,
  Megaphone,
  FlaskConical,
  Users,
  Edit3,
  Eye,
  Save,
  X,
  Copy,
  Check,
  Clock,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import type { DocumentType } from "@/lib/db/schema";

// Document type metadata
const DOCUMENT_TYPES: Record<DocumentType, { 
  label: string; 
  icon: React.ElementType; 
  color: string;
  description: string;
}> = {
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

interface DocumentViewerProps {
  document: Document;
  onSave?: (content: string) => Promise<void>;
  onRegenerate?: () => Promise<void>;
  className?: string;
  readOnly?: boolean;
}

export function DocumentViewer({
  document,
  onSave,
  onRegenerate,
  className,
  readOnly = false,
}: DocumentViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(document.content);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const typeInfo = DOCUMENT_TYPES[document.type];
  const Icon = typeInfo.icon;

  const handleSave = useCallback(async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave(editContent);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  }, [editContent, onSave]);

  const handleCancel = useCallback(() => {
    setEditContent(document.content);
    setIsEditing(false);
  }, [document.content]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(document.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [document.content]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springPresets.gentle}
      className={cn("flex flex-col h-full", className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            "bg-gradient-to-br from-white/10 to-white/5"
          )}>
            <Icon className={cn("w-5 h-5", typeInfo.color)} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{document.title}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{typeInfo.description}</span>
              <span>•</span>
              <span>v{document.version}</span>
              {document.metadata?.generatedBy === "ai" && (
                <>
                  <span>•</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    <Sparkles className="w-2.5 h-2.5 mr-1" />
                    AI Generated
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status badge */}
          {document.metadata?.reviewStatus && (
            <Badge 
              variant="outline"
              className={cn(
                "capitalize",
                document.metadata.reviewStatus === "approved" && "border-green-500/50 text-green-400",
                document.metadata.reviewStatus === "reviewed" && "border-blue-500/50 text-blue-400",
                document.metadata.reviewStatus === "draft" && "border-amber-500/50 text-amber-400"
              )}
            >
              {document.metadata.reviewStatus}
            </Badge>
          )}

          {/* Actions */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="h-8 w-8"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>

          {onRegenerate && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRegenerate}
              className="h-8 w-8"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}

          {!readOnly && onSave && (
            <Button
              variant={isEditing ? "default" : "outline"}
              size="sm"
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={isSaving}
              className="gap-1.5"
            >
              {isEditing ? (
                <>
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? "Saving..." : "Save"}
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </>
              )}
            </Button>
          )}

          {isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4"
            >
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[500px] font-mono text-sm bg-black/20 border-white/10"
                placeholder="Enter markdown content..."
              />
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6"
            >
              <article className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Custom heading styles
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-bold mb-4 pb-2 border-b border-white/10">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl font-semibold mt-8 mb-3 text-purple-300">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-medium mt-6 mb-2 text-blue-300">
                        {children}
                      </h3>
                    ),
                    // Custom list styles
                    ul: ({ children }) => (
                      <ul className="my-4 space-y-2 list-none">
                        {children}
                      </ul>
                    ),
                    li: ({ children }) => (
                      <li className="flex gap-2">
                        <span className="text-purple-400 mt-1.5">•</span>
                        <span>{children}</span>
                      </li>
                    ),
                    // Custom blockquote
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-purple-500/50 pl-4 my-4 italic text-muted-foreground bg-purple-500/5 py-2 rounded-r">
                        {children}
                      </blockquote>
                    ),
                    // Custom code blocks
                    code: ({ className, children, ...props }) => {
                      const isInline = !className;
                      if (isInline) {
                        return (
                          <code className="px-1.5 py-0.5 rounded bg-white/10 text-pink-300 text-sm font-mono" {...props}>
                            {children}
                          </code>
                        );
                      }
                      return (
                        <code className={cn("block p-4 rounded-lg bg-black/30 overflow-x-auto", className)} {...props}>
                          {children}
                        </code>
                      );
                    },
                    // Custom table
                    table: ({ children }) => (
                      <div className="my-4 overflow-x-auto">
                        <table className="w-full border-collapse">
                          {children}
                        </table>
                      </div>
                    ),
                    th: ({ children }) => (
                      <th className="border border-white/10 px-4 py-2 bg-white/5 text-left font-medium">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="border border-white/10 px-4 py-2">
                        {children}
                      </td>
                    ),
                    // Custom links
                    a: ({ href, children }) => (
                      <a 
                        href={href}
                        className="text-purple-400 hover:text-purple-300 underline underline-offset-2"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    ),
                    // Custom hr
                    hr: () => (
                      <hr className="my-8 border-white/10" />
                    ),
                  }}
                >
                  {document.content}
                </ReactMarkdown>
              </article>
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Updated {new Date(document.updatedAt).toLocaleDateString()}
          </span>
          {document.metadata?.model && (
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              {document.metadata.model}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {isEditing ? (
            <span className="text-amber-400">Editing mode</span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Eye className="w-3 h-3" />
              Preview mode
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// DOCUMENT LIST COMPONENT
// ============================================

interface DocumentListProps {
  documents: Document[];
  selectedId?: string;
  onSelect: (doc: Document) => void;
  className?: string;
}

export function DocumentList({
  documents,
  selectedId,
  onSelect,
  className,
}: DocumentListProps) {
  // Group documents by type
  const grouped = documents.reduce((acc, doc) => {
    if (!acc[doc.type]) acc[doc.type] = [];
    acc[doc.type].push(doc);
    return acc;
  }, {} as Record<DocumentType, Document[]>);

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

  return (
    <div className={cn("space-y-4", className)}>
      {typeOrder.map((type) => {
        const docs = grouped[type];
        if (!docs || docs.length === 0) return null;

        const typeInfo = DOCUMENT_TYPES[type];
        const Icon = typeInfo.icon;

        return (
          <div key={type}>
            <div className="flex items-center gap-2 mb-2 px-2">
              <Icon className={cn("w-4 h-4", typeInfo.color)} />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {typeInfo.label}
              </span>
            </div>
            <div className="space-y-1">
              {docs.map((doc) => (
                <motion.button
                  key={doc.id}
                  onClick={() => onSelect(doc)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-all",
                    "hover:bg-white/10",
                    selectedId === doc.id
                      ? "bg-white/15 ring-1 ring-white/20"
                      : "bg-white/5"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm truncate">
                      {doc.title}
                    </span>
                    <Badge variant="outline" className="text-[10px] ml-2">
                      v{doc.version}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>
                      {new Date(doc.updatedAt).toLocaleDateString()}
                    </span>
                    {doc.metadata?.generatedBy === "ai" && (
                      <Sparkles className="w-3 h-3 text-purple-400" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        );
      })}

      {documents.length === 0 && (
        <GlassCard className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">No documents yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Move the project to PRD stage to generate documents
          </p>
        </GlassCard>
      )}
    </div>
  );
}

// ============================================
// DOCUMENT PANEL (Combined List + Viewer)
// ============================================

interface DocumentPanelProps {
  documents: Document[];
  onSave?: (docId: string, content: string) => Promise<void>;
  onRegenerate?: (docId: string) => Promise<void>;
  className?: string;
}

export function DocumentPanel({
  documents,
  onSave,
  onRegenerate,
  className,
}: DocumentPanelProps) {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(
    documents.length > 0 ? documents[0] : null
  );

  const handleSave = useCallback(async (content: string) => {
    if (!selectedDoc || !onSave) return;
    await onSave(selectedDoc.id, content);
  }, [selectedDoc, onSave]);

  const handleRegenerate = useCallback(async () => {
    if (!selectedDoc || !onRegenerate) return;
    await onRegenerate(selectedDoc.id);
  }, [selectedDoc, onRegenerate]);

  return (
    <div className={cn("flex h-full", className)}>
      {/* Document List Sidebar */}
      <div className="w-64 border-r border-white/10 p-4 overflow-y-auto">
        <h4 className="text-sm font-medium mb-4">Documents</h4>
        <DocumentList
          documents={documents}
          selectedId={selectedDoc?.id}
          onSelect={setSelectedDoc}
        />
      </div>

      {/* Document Viewer */}
      <div className="flex-1">
        {selectedDoc ? (
          <DocumentViewer
            document={selectedDoc}
            onSave={onSave ? handleSave : undefined}
            onRegenerate={onRegenerate ? handleRegenerate : undefined}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <GlassCard className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">Select a document to view</p>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}
