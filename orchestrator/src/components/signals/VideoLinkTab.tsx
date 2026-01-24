"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Link, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";

interface VideoLinkTabProps {
  workspaceId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function VideoLinkTab({
  workspaceId,
  onSuccess,
  onClose,
}: VideoLinkTabProps) {
  const queryClient = useQueryClient();
  const [videoUrl, setVideoUrl] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Basic URL validation (client-side hint only - server does real validation)
  const isValidUrl =
    videoUrl.includes("youtube") ||
    videoUrl.includes("youtu.be") ||
    videoUrl.includes("loom.com");

  const fetchMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/signals/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl,
          workspaceId,
          interpretation: interpretation.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch captions");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signals", workspaceId] });
      setVideoUrl("");
      setInterpretation("");
      setError(null);
      onSuccess();
      onClose();
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleSubmit = () => {
    setError(null);
    fetchMutation.mutate();
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="video-url">Video URL</Label>
        <div className="relative">
          <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="video-url"
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={videoUrl}
            onChange={(e) => {
              setVideoUrl(e.target.value);
              setError(null);
            }}
            disabled={fetchMutation.isPending}
            className="pl-10"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Paste a YouTube video link. We&apos;ll fetch the existing captions.
        </p>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="video-interpretation">Interpretation (optional)</Label>
        <Textarea
          id="video-interpretation"
          placeholder="What does this video feedback tell us?"
          value={interpretation}
          onChange={(e) => setInterpretation(e.target.value)}
          rows={2}
          disabled={fetchMutation.isPending}
          className="resize-none"
        />
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={onClose}
          disabled={fetchMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!videoUrl.trim() || !isValidUrl || fetchMutation.isPending}
        >
          {fetchMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Video className="w-4 h-4 mr-2" />
          )}
          Fetch Captions
        </Button>
      </DialogFooter>
    </div>
  );
}
