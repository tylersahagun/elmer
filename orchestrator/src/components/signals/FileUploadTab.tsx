"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { FileDropZone } from "./FileDropZone";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";

interface FileUploadTabProps {
  workspaceId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function FileUploadTab({
  workspaceId,
  onSuccess,
  onClose,
}: FileUploadTabProps) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [interpretation, setInterpretation] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("No file selected");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("workspaceId", workspaceId);
      if (interpretation.trim()) {
        formData.append("interpretation", interpretation.trim());
      }

      const res = await fetch("/api/signals/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Upload failed");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signals", workspaceId] });
      setFile(null);
      setInterpretation("");
      setUploadError(null);
      onSuccess();
      onClose();
    },
    onError: (error: Error) => {
      setUploadError(error.message);
    },
  });

  const handleUpload = () => {
    setUploadError(null);
    uploadMutation.mutate();
  };

  const handleFileSelect = (f: File) => {
    setFile(f);
    setUploadError(null);
  };

  const handleFileClear = () => {
    setFile(null);
    setUploadError(null);
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>File</Label>
        <FileDropZone
          file={file}
          onFileSelect={handleFileSelect}
          onFileClear={handleFileClear}
          error={uploadError || undefined}
          disabled={uploadMutation.isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="upload-interpretation">Interpretation (optional)</Label>
        <Textarea
          id="upload-interpretation"
          placeholder="What does this document tell us?"
          value={interpretation}
          onChange={(e) => setInterpretation(e.target.value)}
          rows={2}
          disabled={uploadMutation.isPending}
          className="resize-none"
        />
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={onClose}
          disabled={uploadMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          disabled={!file || uploadMutation.isPending}
        >
          {uploadMutation.isPending && (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          )}
          Upload & Create Signal
        </Button>
      </DialogFooter>
    </div>
  );
}
