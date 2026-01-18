"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassPanel } from "@/components/glass";

const TYPES = [
  { id: "company_context", label: "Company Context" },
  { id: "strategic_guardrails", label: "Guardrails" },
  { id: "personas", label: "Personas" },
  { id: "roadmap", label: "Roadmap" },
  { id: "rules", label: "Rules" },
];

export default function KnowledgebasePage() {
  const [activeType, setActiveType] = useState("company_context");
  const [workspaceId, setWorkspaceId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { data: workspaces } = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const res = await fetch("/api/workspaces");
      if (!res.ok) throw new Error("Failed to fetch workspaces");
      return res.json();
    },
  });

  useEffect(() => {
    if (!workspaceId && Array.isArray(workspaces) && workspaces.length > 0) {
      setWorkspaceId(workspaces[0].id);
    }
  }, [workspaceId, workspaces]);

  const { data, refetch } = useQuery({
    queryKey: ["knowledgebase", activeType, workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null;
      const res = await fetch(`/api/knowledgebase/${activeType}?workspaceId=${workspaceId}`);
      if (!res.ok) throw new Error("Failed to fetch knowledgebase");
      return res.json();
    },
    enabled: !!workspaceId,
  });

  useEffect(() => {
    if (!data) return;
    setTitle(TYPES.find((t) => t.id === activeType)?.label || "Knowledgebase");
    setContent(data.content || "");
  }, [activeType, data]);

  const handleLoad = async () => {
    const result = await refetch();
    if (result.data) {
      setTitle(TYPES.find((t) => t.id === activeType)?.label || "Knowledgebase");
      setContent(result.data.content || "");
    }
  };

  const handleSave = async () => {
    if (!workspaceId) return;
    await fetch(`/api/knowledgebase/${activeType}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId, title, content }),
    });
  };

  return (
    <div className="p-8 space-y-6">
      <GlassPanel className="p-6 space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="grid gap-2">
            <Label htmlFor="workspaceId">Workspace</Label>
            <div className="flex items-center gap-2">
              <select
                id="workspaceId"
                value={workspaceId}
                onChange={(e) => setWorkspaceId(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs"
              >
                <option value="" disabled>
                  Select workspace
                </option>
                {(workspaces || []).map((workspace: { id: string; name: string }) => (
                  <option key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </option>
                ))}
              </select>
              <Button variant="outline" onClick={handleLoad} disabled={!workspaceId}>
                Load
              </Button>
            </div>
          </div>
          {data?.filePath && (
            <div className="text-xs text-muted-foreground">
              <div>File: {data.filePath}</div>
              {data.entry?.updatedAt && (
                <div>
                  Last saved: {new Date(data.entry.updatedAt).toLocaleString()}
                </div>
              )}
            </div>
          )}
        </div>
        <Tabs value={activeType} onValueChange={setActiveType}>
          <TabsList className="glass-card border-white/20">
            {TYPES.map((type) => (
              <TabsTrigger key={type.id} value={type.id}>
                {type.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {TYPES.map((type) => (
            <TabsContent key={type.id} value={type.id} className="mt-4 space-y-3">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              <Textarea
                className="min-h-[300px] font-mono text-sm"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <Button onClick={handleSave}>Save</Button>
            </TabsContent>
          ))}
        </Tabs>
      </GlassPanel>
    </div>
  );
}
