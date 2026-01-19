"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrafficLights } from "@/components/chrome/TrafficLights";
import { useUIStore, useKanbanStore, type ProjectCard } from "@/lib/store";
import { cn } from "@/lib/utils";
import { 
  FileText, 
  Mic, 
  Video, 
  Link2,
  Upload,
  Loader2,
  Globe,
  CheckCircle2,
  Plus,
  FolderPlus,
} from "lucide-react";
import { v4 as uuid } from "uuid";

type InputType = "text" | "audio" | "video" | "link" | "files";

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

  const resetForm = () => {
    setName("");
    setDescription("");
    setInputType("text");
    setContextText("");
    setLinkUrl("");
    setUploadedFile(null);
    setScrapedData(null);
  };

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
        
        resetForm();
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
      resetForm();
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
      <DialogContent 
        showCloseButton={false}
        className="rounded-2xl border border-border dark:border-[rgba(255,255,255,0.14)] bg-card dark:bg-card shadow-[0_1px_0_rgba(0,0,0,0.03)] dark:shadow-[0_1px_0_rgba(0,0,0,0.4)] max-w-[90vw] w-[900px] !p-0 !gap-0 h-[85vh] overflow-hidden"
      >
        <div className="flex flex-col h-full">
          {/* Header - macOS window style */}
          <DialogHeader className="flex-shrink-0 h-10 px-4 border-b border-border dark:border-[rgba(255,255,255,0.14)] bg-muted/50 dark:bg-muted/20 flex flex-row items-center rounded-t-2xl">
            <TrafficLights 
              className="mr-3" 
              size={10} 
              interactive 
              onClose={closeModal}
            />
            <div className="flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-muted-foreground" />
              <DialogTitle className="text-sm font-mono text-muted-foreground">
                new-project
              </DialogTitle>
            </div>
            <DialogDescription className="sr-only">
              Create a new project with initial context
            </DialogDescription>
          </DialogHeader>

          {/* Content */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <Tabs 
              value={inputType} 
              onValueChange={(v) => setInputType(v as InputType)} 
              className="flex-1 flex flex-col min-h-0 overflow-hidden"
            >
              <div className="shrink-0 px-6 pt-4">
                <TabsList className="bg-muted/50 border border-border dark:border-[rgba(255,255,255,0.14)] rounded-xl grid w-full grid-cols-5">
                  <TabsTrigger value="text" className="gap-1.5 text-xs">
                    <FileText className="w-3.5 h-3.5" />
                    Text
                  </TabsTrigger>
                  <TabsTrigger value="files" className="gap-1.5 text-xs">
                    <Upload className="w-3.5 h-3.5" />
                    Files
                  </TabsTrigger>
                  <TabsTrigger value="link" className="gap-1.5 text-xs">
                    <Link2 className="w-3.5 h-3.5" />
                    Link
                  </TabsTrigger>
                  <TabsTrigger value="audio" disabled className="gap-1.5 text-xs opacity-50">
                    <Mic className="w-3.5 h-3.5" />
                    Audio
                  </TabsTrigger>
                  <TabsTrigger value="video" disabled className="gap-1.5 text-xs opacity-50">
                    <Video className="w-3.5 h-3.5" />
                    Video
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4">
                {/* Project Details - Always visible */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-muted/30 border border-border dark:border-[rgba(255,255,255,0.08)]">
                    <Label htmlFor="name" className="text-xs text-muted-foreground mb-2 block">
                      Project Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g., CRM Agent Configuration"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30 border border-border dark:border-[rgba(255,255,255,0.08)]">
                    <Label htmlFor="description" className="text-xs text-muted-foreground mb-2 block">
                      Description (optional)
                    </Label>
                    <Input
                      id="description"
                      placeholder="Brief description..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>

                {/* Context Input - Tab specific */}
                <TabsContent value="text" className="mt-0">
                  <div className="p-4 rounded-xl bg-muted/30 border border-border dark:border-[rgba(255,255,255,0.08)]">
                    <Label htmlFor="context" className="text-xs text-muted-foreground mb-2 block">
                      Initial Context
                    </Label>
                    <Textarea
                      id="context"
                      placeholder="Paste meeting notes, user feedback, research findings, or initial thoughts..."
                      value={contextText}
                      onChange={(e) => setContextText(e.target.value)}
                      className="min-h-[200px] resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      This will be saved as initial research for your project.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="files" className="mt-0">
                  <div className="p-4 rounded-xl bg-muted/30 border border-border dark:border-[rgba(255,255,255,0.08)]">
                    <Label className="text-xs text-muted-foreground mb-2 block">
                      Upload Files
                    </Label>
                    <label className={cn(
                      "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer block transition-all",
                      "border-border dark:border-[rgba(255,255,255,0.14)]",
                      "hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-900/10",
                      uploadedFile && "border-emerald-400 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10"
                    )}>
                      {uploadedFile ? (
                        <>
                          <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-emerald-500" />
                          <p className="text-sm font-medium">{uploadedFile.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {(uploadedFile.size / 1024).toFixed(1)} KB • Click to change
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                          <p className="text-sm font-medium">
                            Drop a file or click to upload
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            .txt, .md, .json, .pdf supported
                          </p>
                        </>
                      )}
                      <input
                        type="file"
                        accept=".txt,.md,.json,.pdf,text/plain,application/json,application/pdf"
                        className="hidden"
                        onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                </TabsContent>

                <TabsContent value="link" className="mt-0">
                  <div className="p-4 rounded-xl bg-muted/30 border border-border dark:border-[rgba(255,255,255,0.08)] space-y-4">
                    <div>
                      <Label htmlFor="link" className="text-xs text-muted-foreground mb-2 block">
                        Web Link
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="link"
                          placeholder="https://..."
                          value={linkUrl}
                          onChange={(e) => {
                            setLinkUrl(e.target.value);
                            setScrapedData(null);
                          }}
                          className="flex-1"
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
                      <p className="text-xs text-muted-foreground mt-2">
                        Paste any URL to extract content. Works with articles, docs, and web pages.
                      </p>
                    </div>
                    
                    {/* Scraped content preview */}
                    {scrapedData && (
                      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/30">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-emerald-800 dark:text-emerald-200">
                              {scrapedData.title}
                            </p>
                            {scrapedData.description && (
                              <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1 line-clamp-2">
                                {scrapedData.description}
                              </p>
                            )}
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                              {scrapedData.content.length.toLocaleString()} characters extracted
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="audio" className="mt-0">
                  <div className="p-4 rounded-xl bg-muted/30 border border-border dark:border-[rgba(255,255,255,0.08)]">
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                        <Mic className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="font-medium text-muted-foreground mb-1">
                        Coming Soon
                      </p>
                      <p className="text-sm text-muted-foreground/70">
                        Record audio directly or upload audio files for transcription.
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="video" className="mt-0">
                  <div className="p-4 rounded-xl bg-muted/30 border border-border dark:border-[rgba(255,255,255,0.08)]">
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                        <Video className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="font-medium text-muted-foreground mb-1">
                        Coming Soon
                      </p>
                      <p className="text-sm text-muted-foreground/70">
                        Upload video recordings for automatic transcription and analysis.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>

            {/* Footer */}
            <div className="shrink-0 p-4 sm:p-6 pt-4 border-t border-border dark:border-[rgba(255,255,255,0.14)] bg-muted/30">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Projects start in Inbox and move through stages as you work.
                </p>
                <div className="flex items-center gap-2 ml-auto">
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
                        <Plus className="w-4 h-4" />
                        Create Project
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
