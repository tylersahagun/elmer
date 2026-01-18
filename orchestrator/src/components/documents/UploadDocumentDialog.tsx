"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { popInVariants } from "@/lib/animations";
import {
  FileText,
  Upload,
  Loader2,
  Link2,
  Globe,
  CheckCircle2,
  Palette,
  Code,
  Megaphone,
  FlaskConical,
  Users,
  Sparkles,
} from "lucide-react";
import type { DocumentType } from "@/lib/db/schema";

type InputType = "text" | "files" | "link";

const inputTypes: {
  type: InputType;
  icon: React.ElementType;
  label: string;
}[] = [
  { type: "text", icon: FileText, label: "Text" },
  { type: "files", icon: Upload, label: "Files" },
  { type: "link", icon: Link2, label: "Link" },
];

const documentTypes: {
  type: DocumentType;
  label: string;
  icon: React.ElementType;
}[] = [
  { type: "research", label: "Research", icon: FlaskConical },
  { type: "prd", label: "PRD", icon: FileText },
  { type: "design_brief", label: "Design Brief", icon: Palette },
  { type: "engineering_spec", label: "Engineering Spec", icon: Code },
  { type: "gtm_brief", label: "GTM Brief", icon: Megaphone },
  { type: "prototype_notes", label: "Prototype Notes", icon: Sparkles },
  { type: "jury_report", label: "Jury Report", icon: Users },
];

interface UploadDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  workspaceId: string;
  onSuccess?: () => void;
}

export function UploadDocumentDialog({
  isOpen,
  onClose,
  projectId,
  workspaceId,
  onSuccess,
}: UploadDocumentDialogProps) {
  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState<DocumentType>("research");
  const [inputType, setInputType] = useState<InputType>("text");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contextText, setContextText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedData, setScrapedData] = useState<{
    title: string;
    description: string;
    content: string;
  } | null>(null);

  const resetForm = () => {
    setTitle("");
    setDocType("research");
    setInputType("text");
    setContextText("");
    setLinkUrl("");
    setUploadedFile(null);
    setScrapedData(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);

    try {
      let content = "";

      if (inputType === "text") {
        content = contextText.trim();
      } else if (inputType === "link" && scrapedData) {
        content = `Source: ${linkUrl}\n\n${scrapedData.description ? `> ${scrapedData.description}\n\n` : ""}${scrapedData.content}`;
      } else if (inputType === "files" && uploadedFile) {
        // For text-based files, read content
        if (
          uploadedFile.type.startsWith("text/") ||
          /\.(txt|md|json)$/i.test(uploadedFile.name)
        ) {
          content = await uploadedFile.text();
        } else {
          // For other files, upload and reference
          const formData = new FormData();
          formData.append("file", uploadedFile);
          formData.append("workspaceId", workspaceId);
          formData.append("projectId", projectId);

          const uploadRes = await fetch("/api/uploads", {
            method: "POST",
            body: formData,
          });

          if (uploadRes.ok) {
            const uploadMeta = await uploadRes.json();
            content = `Uploaded file: ${uploadMeta.path}\n\nFile: ${uploadMeta.fileName}\nType: ${uploadMeta.type}\nSize: ${uploadMeta.size} bytes`;
          }
        }
      }

      // Create document
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          type: docType,
          title: title.trim(),
          content,
          metadata: {
            generatedBy: "user",
            reviewStatus: "draft",
          },
        }),
      });

      if (response.ok) {
        resetForm();
        onClose();
        onSuccess?.();
      }
    } catch (error) {
      console.error("Failed to create document:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScrape = async () => {
    if (!linkUrl.trim()) return;
    setIsScraping(true);
    setScrapedData(null);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: linkUrl.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setScrapedData({
          title: data.title,
          description: data.description,
          content: data.content,
        });
        // Auto-fill title if empty
        if (!title.trim() && data.title) {
          setTitle(data.title);
        }
      }
    } catch (err) {
      console.error("Scrape failed:", err);
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="glass-panel border-white/20 max-w-lg !p-0 !gap-0">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={popInVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col max-h-[calc(100vh-6rem)]"
            >
              {/* Fixed Header */}
              <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Upload className="w-5 h-5 text-purple-400" />
                  Upload Document
                </DialogTitle>
                <DialogDescription>
                  Add a new document to this project via text, file upload, or
                  web link.
                </DialogDescription>
              </DialogHeader>

              {/* Scrollable Content */}
              <form
                onSubmit={handleSubmit}
                className="flex flex-col flex-1 min-h-0 overflow-hidden"
              >
                <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 space-y-6 min-h-0">
                  {/* Document Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Document Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., User Interview - Jan 2026"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="glass-card border-white/20"
                      autoFocus
                    />
                  </div>

                  {/* Document Type */}
                  <div className="space-y-2">
                    <Label htmlFor="docType">Document Type</Label>
                    <Select
                      value={docType}
                      onValueChange={(v) => setDocType(v as DocumentType)}
                    >
                      <SelectTrigger className="glass-card border-white/20">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes.map(({ type, label, icon: Icon }) => (
                          <SelectItem key={type} value={type}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Input Type Selection */}
                  <div className="space-y-2">
                    <Label>Content Source</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {inputTypes.map(({ type, icon: Icon, label }) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setInputType(type)}
                          className={`
                            flex flex-col items-center gap-1 p-3 rounded-xl
                            border transition-all duration-200 relative
                            ${
                              inputType === type
                                ? "border-purple-500 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200 dark:border-purple-400"
                                : "border-slate-200 bg-white/50 hover:bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:text-slate-400"
                            }
                          `}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs font-medium">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Context Input Area */}
                  {inputType === "text" && (
                    <div className="space-y-2">
                      <Label htmlFor="context">Content</Label>
                      <Textarea
                        id="context"
                        placeholder="Paste document content, notes, or markdown..."
                        value={contextText}
                        onChange={(e) => setContextText(e.target.value)}
                        className="glass-card border-white/20 min-h-[160px] max-h-[280px] overflow-y-auto resize-none"
                      />
                    </div>
                  )}

                  {inputType === "files" && (
                    <div className="space-y-2">
                      <Label>Upload File</Label>
                      <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center hover:border-purple-300 dark:hover:border-purple-500 transition-colors cursor-pointer block">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-slate-500 dark:text-slate-400" />
                        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                          {uploadedFile
                            ? uploadedFile.name
                            : "Drop a file or click to upload"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          .txt, .md, .json, .pdf supported
                        </p>
                        <input
                          type="file"
                          accept=".txt,.md,.json,.pdf,text/plain,application/json,application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setUploadedFile(file);
                            // Auto-fill title from filename
                            if (file && !title.trim()) {
                              setTitle(
                                file.name.replace(/\.[^/.]+$/, "").replace(/-/g, " ")
                              );
                            }
                          }}
                        />
                      </label>
                    </div>
                  )}

                  {inputType === "link" && (
                    <div className="space-y-3">
                      <Label htmlFor="link">Web Link</Label>
                      <div className="flex gap-2">
                        <Input
                          id="link"
                          placeholder="https://..."
                          value={linkUrl}
                          onChange={(e) => {
                            setLinkUrl(e.target.value);
                            setScrapedData(null);
                          }}
                          className="glass-card border-white/20 flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleScrape}
                          disabled={!linkUrl.trim() || isScraping}
                          className="gap-2 shrink-0"
                        >
                          {isScraping ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Globe className="w-4 h-4" />
                          )}
                          {isScraping ? "Fetching..." : "Extract"}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Paste any URL to extract content. Works with articles,
                        docs, and web pages.
                      </p>

                      {/* Scraped content preview */}
                      {scrapedData && (
                        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/30">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200 truncate">
                                {scrapedData.title}
                              </p>
                              {scrapedData.description && (
                                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1 line-clamp-2">
                                  {scrapedData.description}
                                </p>
                              )}
                              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                                {scrapedData.content.length.toLocaleString()}{" "}
                                characters extracted
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Fixed Footer */}
                <DialogFooter className="flex-shrink-0 p-6 pt-3 pb-3 border-t border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      resetForm();
                      onClose();
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!title.trim() || isSubmitting}
                    className="gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Add Document
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
