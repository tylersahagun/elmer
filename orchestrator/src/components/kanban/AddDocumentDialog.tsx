"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Loader2, Plus } from "lucide-react";
import type { DocumentType } from "@/lib/db/schema";

// Simple select component fallback if shadcn Select isn't available
const SelectFallback = ({ 
  value, 
  onValueChange, 
  children 
}: { 
  value: string; 
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}) => (
  <select 
    value={value} 
    onChange={(e) => onValueChange(e.target.value)}
    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {children}
  </select>
);

const documentTypes: { value: DocumentType; label: string; description: string }[] = [
  { value: "research", label: "Research", description: "User research, interviews, transcripts" },
  { value: "prd", label: "PRD", description: "Product Requirements Document" },
  { value: "design_brief", label: "Design Brief", description: "Design specifications and guidelines" },
  { value: "engineering_spec", label: "Engineering Spec", description: "Technical implementation details" },
  { value: "gtm_brief", label: "GTM Brief", description: "Go-to-market strategy and plans" },
  { value: "prototype_notes", label: "Prototype Notes", description: "Notes about prototypes and iterations" },
  { value: "jury_report", label: "Jury Report", description: "User validation and feedback reports" },
];

interface AddDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onDocumentAdded: () => void;
}

export function AddDocumentDialog({
  open,
  onOpenChange,
  projectId,
  onDocumentAdded,
}: AddDocumentDialogProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<DocumentType>("research");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setType("research");
    setContent("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          type,
          title: title.trim(),
          content: content.trim(),
          metadata: {
            generatedBy: "user",
            reviewStatus: "draft",
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create document");
      }

      resetForm();
      onOpenChange(false);
      onDocumentAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create document");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col !p-0 !gap-0">
        {/* Fixed Header */}
        <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-500" />
            Add Document
          </DialogTitle>
          <DialogDescription>
            Add a document manually to this project. You can paste research notes, transcripts, or any other content.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="doc-title">Title</Label>
                <Input
                  id="doc-title"
                  placeholder="e.g., User Interview - Jan 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="doc-type">Document Type</Label>
                <SelectFallback value={type} onValueChange={(v) => setType(v as DocumentType)}>
                  {documentTypes.map((dt) => (
                    <option key={dt.value} value={dt.value}>
                      {dt.label} - {dt.description}
                    </option>
                  ))}
                </SelectFallback>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="doc-content">Content</Label>
                <Textarea
                  id="doc-content"
                  placeholder="Paste your content here... (Markdown supported)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={isSubmitting}
                  className="min-h-[200px] max-h-[300px] resize-none font-mono text-sm overflow-y-auto"
                />
                <p className="text-xs text-muted-foreground">
                  Tip: You can paste transcripts, meeting notes, research findings, or any relevant documentation.
                </p>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive mt-4">{error}</p>
            )}
          </div>

          {/* Fixed Footer */}
          <DialogFooter className="flex-shrink-0 p-6 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Document
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
