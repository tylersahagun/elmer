"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Skill {
  id: string;
  name: string;
  description: string | null;
  source: "local" | "skillsmp";
  version: string | null;
  tags: string[] | null;
  trustLevel?: string | null;
}

interface SkillsManagerCardProps {
  workspaceId: string;
}

export function SkillsManagerCard({ workspaceId }: SkillsManagerCardProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [promptTemplate, setPromptTemplate] = useState("");
  const [tags, setTags] = useState("");

  const { data, isLoading } = useQuery<{ skills: Skill[] }>({
    queryKey: ["skills", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/skills?workspaceId=${workspaceId}`);
      if (!res.ok) throw new Error("Failed to load skills");
      return res.json();
    },
    enabled: !!workspaceId,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          workspaceId,
          name: name.trim(),
          description: description.trim() || undefined,
          promptTemplate: promptTemplate.trim() || undefined,
          tags: tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create skill");
      }
    },
    onSuccess: () => {
      toast.success("Skill created");
      setName("");
      setDescription("");
      setPromptTemplate("");
      setTags("");
      queryClient.invalidateQueries({ queryKey: ["skills", workspaceId] });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to create skill",
      );
    },
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync", workspaceId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to sync skills");
      }
    },
    onSuccess: () => {
      toast.success("Skills synced");
      queryClient.invalidateQueries({ queryKey: ["skills", workspaceId] });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to sync skills",
      );
    },
  });

  const skills = useMemo(() => data?.skills ?? [], [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Skills Catalog
        </CardTitle>
        <CardDescription>
          Create or sync skills used by commands and automation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 rounded-lg border p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="skill-name">Skill name</Label>
              <Input
                id="skill-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Summarize transcript"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skill-tags">Tags (comma separated)</Label>
              <Input
                id="skill-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="research, summary"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="skill-description">Description</Label>
            <Input
              id="skill-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description for the catalog"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="skill-prompt">Prompt template</Label>
            <Textarea
              id="skill-prompt"
              value={promptTemplate}
              onChange={(e) => setPromptTemplate(e.target.value)}
              placeholder="System prompt used for this skill"
              rows={4}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!name.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Create Skill"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
            >
              {syncMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Sync Local Skills"
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Registered skills</p>
            {isLoading && (
              <span className="text-xs text-muted-foreground">Loading…</span>
            )}
          </div>
          <div className="space-y-2">
            {skills.length === 0 && !isLoading && (
              <p className="text-sm text-muted-foreground">No skills found.</p>
            )}
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">{skill.name}</p>
                  {skill.description && (
                    <p className="text-xs text-muted-foreground">
                      {skill.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{skill.source}</Badge>
                  {skill.version && (
                    <Badge variant="outline">v{skill.version}</Badge>
                  )}
                  {skill.tags?.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                  {skill.tags && skill.tags.length > 2 && (
                    <Badge variant="outline">+{skill.tags.length - 2}</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
