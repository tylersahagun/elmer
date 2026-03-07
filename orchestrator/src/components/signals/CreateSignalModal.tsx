"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploadTab } from "./FileUploadTab";
import { VideoLinkTab } from "./VideoLinkTab";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface CreateSignalModalProps {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Sources appropriate for manual entry (not automated ingestion sources)
const MANUAL_SOURCES = [
  { value: "paste", label: "Manual Entry" },
  { value: "interview", label: "Interview" },
  { value: "email", label: "Email" },
  { value: "other", label: "Other" },
];

export function CreateSignalModal({
  workspaceId,
  isOpen,
  onClose,
  onSuccess,
}: CreateSignalModalProps) {
  // Tab state
  const [activeTab, setActiveTab] = useState("paste");

  // Paste form state (existing)
  const [verbatim, setVerbatim] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [source, setSource] = useState("paste");
  const [keepOpen, setKeepOpen] = useState(false);

  // Create mutation (for paste tab - existing)
  const createSignal = useMutation(api.signals.create);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!verbatim.trim()) return;
    setKeepOpen(false);
    setIsCreating(true);
    try {
      await createSignal({
        workspaceId: workspaceId as Id<"workspaces">,
        verbatim,
        interpretation: interpretation || undefined,
        source,
      });
      if (keepOpen) {
        setVerbatim("");
        setInterpretation("");
        setSource("paste");
      } else {
        onSuccess();
        onClose();
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateAndAddAnother = async () => {
    if (!verbatim.trim()) return;
    setKeepOpen(true);
    setIsCreating(true);
    try {
      await createSignal({
        workspaceId: workspaceId as Id<"workspaces">,
        verbatim,
        interpretation: interpretation || undefined,
        source,
      });
      setVerbatim("");
      setInterpretation("");
      setSource("paste");
      onSuccess();
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    // Reset all state when closing
    setActiveTab("paste");
    setVerbatim("");
    setInterpretation("");
    setSource("paste");
    setKeepOpen(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Signal</DialogTitle>
          <DialogDescription>
            Add user feedback by pasting text, uploading a file, or fetching video captions.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="paste">Paste Text</TabsTrigger>
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger value="video">Video Link</TabsTrigger>
          </TabsList>

          <TabsContent value="paste" className="mt-4">
            <div className="space-y-4">
              {/* Verbatim textarea (required) */}
              <div className="space-y-2">
                <Label htmlFor="verbatim">Feedback (required)</Label>
                <Textarea
                  id="verbatim"
                  placeholder="Paste or type the user feedback verbatim..."
                  value={verbatim}
                  onChange={(e) => setVerbatim(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Interpretation textarea (optional) */}
              <div className="space-y-2">
                <Label htmlFor="interpretation">Interpretation (optional)</Label>
                <Textarea
                  id="interpretation"
                  placeholder="What does this feedback really mean?"
                  value={interpretation}
                  onChange={(e) => setInterpretation(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
              </div>

              {/* Source select */}
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger id="source" className="w-full">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {MANUAL_SOURCES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="mt-6 gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={handleCreateAndAddAnother}
                disabled={!verbatim.trim() || isCreating}
              >
                {isCreating && keepOpen ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Create & Add Another
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!verbatim.trim() || isCreating}
              >
                {isCreating && !keepOpen ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Create Signal
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <FileUploadTab
              workspaceId={workspaceId}
              onSuccess={onSuccess}
              onClose={handleClose}
            />
          </TabsContent>

          <TabsContent value="video" className="mt-4">
            <VideoLinkTab
              workspaceId={workspaceId}
              onSuccess={onSuccess}
              onClose={handleClose}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
