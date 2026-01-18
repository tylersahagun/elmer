"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DocumentViewer } from "@/components/documents";
import { MetricsDashboard } from "@/components/metrics";
import { Badge } from "@/components/ui/badge";
import { GlassPanel } from "@/components/glass";
import { FileText, Layers, BarChart3, Clock, Users } from "lucide-react";

interface ProjectDetailPageProps {
  projectId: string;
}

export function ProjectDetailPage({ projectId }: ProjectDetailPageProps) {
  const [activeTab, setActiveTab] = useState("documents");
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error("Failed to load project");
      return res.json();
    },
  });

  const selectedDoc = project?.documents?.find((d: { id: string }) => d.id === selectedDocId)
    || project?.documents?.[0];

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!project) {
    return <div className="p-8">Project not found.</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          {project.description && <p className="text-sm text-muted-foreground">{project.description}</p>}
        </div>
        <Button variant="outline">Back to Workspace</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="glass-card border-white/20">
          <TabsTrigger value="documents" className="gap-1.5">
            <FileText className="w-4 h-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="prototypes" className="gap-1.5">
            <Layers className="w-4 h-4" />
            Prototypes
          </TabsTrigger>
          <TabsTrigger value="metrics" className="gap-1.5">
            <BarChart3 className="w-4 h-4" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            <Clock className="w-4 h-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="validation" className="gap-1.5">
            <Users className="w-4 h-4" />
            Validation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
            <GlassPanel className="p-4">
              <h3 className="text-sm font-medium mb-3">Documents</h3>
              <div className="space-y-2">
                {project.documents?.map((doc: { id: string; title: string; type: string }) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className="w-full text-left text-sm p-2 rounded-md hover:bg-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <span>{doc.title}</span>
                      <Badge variant="outline" className="text-[10px]">{doc.type}</Badge>
                    </div>
                  </button>
                ))}
              </div>
            </GlassPanel>
            <GlassPanel className="p-0 overflow-hidden">
              {selectedDoc ? (
                <DocumentViewer
                  document={{
                    ...selectedDoc,
                    createdAt: new Date(selectedDoc.createdAt),
                    updatedAt: new Date(selectedDoc.updatedAt),
                  }}
                />
              ) : (
                <div className="p-6 text-muted-foreground">No documents yet.</div>
              )}
            </GlassPanel>
          </div>
        </TabsContent>

        <TabsContent value="prototypes" className="mt-6">
          <GlassPanel className="p-4 space-y-3">
            {project.prototypes?.map((proto: { id: string; name: string; type: string; status: string }) => (
              <div key={proto.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{proto.name}</p>
                  <p className="text-xs text-muted-foreground">{proto.type}</p>
                </div>
                <Badge variant="outline">{proto.status}</Badge>
              </div>
            ))}
          </GlassPanel>
        </TabsContent>

        <TabsContent value="metrics" className="mt-6">
          <MetricsDashboard projectName={project.name} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <GlassPanel className="p-4 space-y-2">
            {project.stages?.map((s: { id: string; stage: string; enteredAt: string }) => (
              <div key={s.id} className="text-sm text-muted-foreground">
                {s.stage} · {new Date(s.enteredAt).toLocaleString()}
              </div>
            ))}
          </GlassPanel>
        </TabsContent>

        <TabsContent value="validation" className="mt-6">
          <GlassPanel className="p-4 space-y-3">
            {project.juryEvaluations?.map((j: { id: string; phase: string; verdict: string }) => (
              <div key={j.id} className="flex items-center justify-between text-sm">
                <span>{j.phase}</span>
                <Badge variant="outline">{j.verdict}</Badge>
              </div>
            ))}
          </GlassPanel>
        </TabsContent>
      </Tabs>
    </div>
  );
}
