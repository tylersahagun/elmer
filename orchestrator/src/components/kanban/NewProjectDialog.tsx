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
import { useUIStore, useKanbanStore, type ProjectCard } from "@/lib/store";
import { popInVariants } from "@/lib/animations";
import { 
  Sparkles, 
  FileText, 
  Mic, 
  Video, 
  Link2,
  Upload,
  Loader2,
  Globe,
  CheckCircle2,
} from "lucide-react";
import { v4 as uuid } from "uuid";

type InputType = "text" | "audio" | "video" | "link" | "files";

const inputTypes: { type: InputType; icon: React.ElementType; label: string; comingSoon?: boolean }[] = [
  { type: "text", icon: FileText, label: "Text" },
  { type: "files", icon: Upload, label: "Files" },
  { type: "link", icon: Link2, label: "Link" },
  { type: "audio", icon: Mic, label: "Audio", comingSoon: true },
  { type: "video", icon: Video, label: "Video", comingSoon: true },
];

export function NewProjectDialog() {
  const isOpen = useUIStore((s) => s.newProjectModalOpen);
  const closeModal = useUIStore((s) => s.closeNewProjectModal);
  const addProject = useKanbanStore((s) => s.addProject);
  const workspace = useKanbanStore((s) => s.workspace);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !workspace) return;

    setIsSubmitting(true);

    try {
      // Create project via API
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.id,
          name: name.trim(),
          description: description.trim() || undefined,
        }),
      });

      if (response.ok) {
        const project = await response.json();
        addProject({
          id: project.id,
          name: project.name,
          description: project.description,
          stage: project.stage,
          status: project.status,
          priority: project.priority || 0,
          createdAt: new Date(project.createdAt),
          updatedAt: new Date(project.updatedAt),
        });

        // Persist initial context as memory + optional research document
        await handleContextSubmit(project.id);
        
        // Reset form
        setName("");
        setDescription("");
        setInputType("text");
        setContextText("");
        setLinkUrl("");
        setUploadedFile(null);
        setScrapedData(null);
        closeModal();
      }
    } catch (error) {
      console.error("Failed to create project:", error);
      // For now, create locally as fallback
      const newProject: ProjectCard = {
        id: uuid(),
        name: name.trim(),
        description: description.trim() || undefined,
        stage: "inbox",
        status: "active",
        priority: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addProject(newProject);
      await handleContextSubmit(newProject.id);
      setName("");
      setDescription("");
      setInputType("text");
      setContextText("");
      setLinkUrl("");
      setUploadedFile(null);
      setScrapedData(null);
      closeModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContextSubmit = async (projectId: string) => {
    if (!workspace) return;

    const createMemory = async (content: string, metadata?: Record<string, unknown>) => {
      await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.id,
          projectId,
          type: "context",
          content,
          metadata,
        }),
      });
    };

    const createResearchDoc = async (title: string, content: string) => {
      await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          type: "research",
          title,
          content,
          metadata: {
            generatedBy: "user",
            reviewStatus: "draft",
          },
        }),
      });
    };

    if (inputType === "text" && contextText.trim()) {
      await createMemory(contextText.trim(), { source: "text" });
      await createResearchDoc("Initial Context", contextText.trim());
    }

    if (inputType === "link" && linkUrl.trim()) {
      await createMemory(`Link: ${linkUrl.trim()}`, { source: "link", url: linkUrl.trim() });
      // If we have scraped content, also create a research doc
      if (scrapedData?.content) {
        await createResearchDoc(
          scrapedData.title || `Content from ${new URL(linkUrl).hostname}`,
          `Source: ${linkUrl}\n\n${scrapedData.description ? `> ${scrapedData.description}\n\n` : ""}${scrapedData.content}`
        );
      }
    }

    if (["files"].includes(inputType) && uploadedFile) {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("workspaceId", workspace.id);
      formData.append("projectId", projectId);
      const uploadRes = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });
      if (uploadRes.ok) {
        const uploadMeta = await uploadRes.json();
        await createMemory(`Uploaded file: ${uploadMeta.path}`, {
          source: inputType,
          fileName: uploadMeta.fileName,
          path: uploadMeta.path,
          mimeType: uploadMeta.type,
          size: uploadMeta.size,
        });
      }

      // If it's a text-based file, also create a research doc from contents
      if (uploadedFile.type.startsWith("text/") || /\.(txt|md|json)$/i.test(uploadedFile.name)) {
        const content = await uploadedFile.text();
        if (content.trim()) {
          await createResearchDoc(`Transcript - ${uploadedFile.name}`, content.trim());
        }
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
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
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  New Project
                </DialogTitle>
                <DialogDescription>
                  Start a new initiative. Add context via text, audio, video, or transcript.
                </DialogDescription>
              </DialogHeader>

              {/* Scrollable Content */}
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 space-y-6 min-h-0">
                  {/* Project Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., CRM Agent Configuration"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="glass-card border-white/20"
                      autoFocus
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the project..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="glass-card border-white/20 min-h-[80px] max-h-[120px] overflow-y-auto resize-none"
                    />
                  </div>

                  {/* Input Type Selection */}
                  <div className="space-y-2">
                    <Label>Add Initial Context</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {inputTypes.map(({ type, icon: Icon, label, comingSoon }) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => !comingSoon && setInputType(type)}
                          disabled={comingSoon}
                          className={`
                            flex flex-col items-center gap-1 p-3 rounded-xl
                            border transition-all duration-200 relative
                            ${comingSoon 
                              ? "border-slate-200/50 bg-slate-100/50 text-slate-400 cursor-not-allowed dark:border-slate-700/50 dark:bg-slate-800/30 dark:text-slate-500"
                              : inputType === type 
                                ? "border-purple-500 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200 dark:border-purple-400" 
                                : "border-slate-200 bg-white/50 hover:bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:text-slate-400"
                            }
                          `}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs font-medium">{label}</span>
                          {comingSoon && (
                            <span className="absolute -top-1 -right-1 px-1 py-0.5 text-[8px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 rounded">
                              Soon
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Context Input Area */}
                  {inputType === "text" && (
                    <div className="space-y-2">
                      <Label htmlFor="context">Initial Context</Label>
                      <Textarea
                        id="context"
                        placeholder="Paste meeting notes, user feedback, or initial thoughts..."
                        value={contextText}
                        onChange={(e) => setContextText(e.target.value)}
                        className="glass-card border-white/20 min-h-[120px] max-h-[200px] overflow-y-auto resize-none"
                      />
                    </div>
                  )}

                  {inputType === "files" && (
                    <div className="space-y-2">
                      <Label>Upload Files</Label>
                      <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center hover:border-purple-300 dark:hover:border-purple-500 transition-colors cursor-pointer block">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-slate-500 dark:text-slate-400" />
                        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                          {uploadedFile ? uploadedFile.name : "Drop a file or click to upload"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          .txt, .md, .json, .pdf supported
                        </p>
                        <input
                          type="file"
                          accept=".txt,.md,.json,.pdf,text/plain,application/json,application/pdf"
                          className="hidden"
                          onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
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
                          onClick={async () => {
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
                              }
                            } catch (err) {
                              console.error("Scrape failed:", err);
                            } finally {
                              setIsScraping(false);
                            }
                          }}
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
                        Paste any URL to extract content. Works with articles, docs, and web pages.
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
                                {scrapedData.content.length.toLocaleString()} characters extracted
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {inputType === "audio" && (
                    <div className="space-y-2">
                      <Label>Audio Recording</Label>
                      <div className="border-2 border-dashed border-slate-200/50 dark:border-slate-700/50 rounded-xl p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <Mic className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">
                          Coming Soon
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          Record audio directly or upload audio files for transcription.
                        </p>
                      </div>
                    </div>
                  )}

                  {inputType === "video" && (
                    <div className="space-y-2">
                      <Label>Video Upload</Label>
                      <div className="border-2 border-dashed border-slate-200/50 dark:border-slate-700/50 rounded-xl p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <Video className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">
                          Coming Soon
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          Upload video recordings for automatic transcription and analysis.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Fixed Footer */}
                <DialogFooter className="flex-shrink-0 p-6 pt-3 pb-3 border-t border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={closeModal}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={!name.trim() || isSubmitting}
                    className="gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Create Project
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
