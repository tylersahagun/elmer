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
} from "lucide-react";
import { v4 as uuid } from "uuid";

type InputType = "text" | "audio" | "video" | "link" | "transcript";

const inputTypes: { type: InputType; icon: React.ElementType; label: string }[] = [
  { type: "text", icon: FileText, label: "Text" },
  { type: "audio", icon: Mic, label: "Audio" },
  { type: "video", icon: Video, label: "Video" },
  { type: "link", icon: Link2, label: "Link" },
  { type: "transcript", icon: Upload, label: "Transcript" },
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
    }

    if (["transcript", "audio", "video"].includes(inputType) && uploadedFile) {
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
                      {inputTypes.map(({ type, icon: Icon, label }) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setInputType(type)}
                          className={`
                            flex flex-col items-center gap-1 p-3 rounded-xl
                            border transition-all duration-200
                            ${inputType === type 
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

                  {inputType === "transcript" && (
                    <div className="space-y-2">
                      <Label>Upload Transcript</Label>
                      <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center hover:border-purple-300 dark:hover:border-purple-500 transition-colors cursor-pointer block">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-slate-500 dark:text-slate-400" />
                        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                          {uploadedFile ? uploadedFile.name : "Drop a file or click to upload"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          .txt, .md, .json supported
                        </p>
                        <input
                          type="file"
                          accept=".txt,.md,.json,text/plain,application/json"
                          className="hidden"
                          onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>
                  )}

                  {inputType === "link" && (
                    <div className="space-y-2">
                      <Label htmlFor="link">Video/Recording Link</Label>
                      <Input
                        id="link"
                        placeholder="https://..."
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        className="glass-card border-white/20"
                      />
                      <p className="text-xs text-muted-foreground">
                        Supports Loom, YouTube, Google Drive, etc.
                      </p>
                    </div>
                  )}

                  {inputType === "audio" && (
                    <div className="space-y-2">
                      <Label>Record Audio</Label>
                      <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center hover:border-purple-300 dark:hover:border-purple-500 transition-colors block cursor-pointer">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                          <Mic className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <Button type="button" variant="outline" className="glass-card">
                          {uploadedFile ? uploadedFile.name : "Upload Audio"}
                        </Button>
                        <input
                          type="file"
                          accept="audio/*"
                          className="hidden"
                          onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>
                  )}

                  {inputType === "video" && (
                    <div className="space-y-2">
                      <Label>Upload Video</Label>
                      <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center hover:border-purple-300 dark:hover:border-purple-500 transition-colors cursor-pointer block">
                        <Video className="w-8 h-8 mx-auto mb-2 text-slate-500 dark:text-slate-400" />
                        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                          {uploadedFile ? uploadedFile.name : "Drop a video or click to upload"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          .mp4, .mov, .webm supported
                        </p>
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                        />
                      </label>
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
