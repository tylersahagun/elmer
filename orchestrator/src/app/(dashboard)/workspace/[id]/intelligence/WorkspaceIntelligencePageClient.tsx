"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, BookOpen, BrainCircuit, GitBranch, Radio, Sparkles, Users } from "lucide-react";
import { SimpleNavbar } from "@/components/chrome/Navbar";
import { Window } from "@/components/chrome/Window";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WorkspaceIntelligencePageClientProps {
  workspaceId: string;
}

type IntelligenceSummary = {
  projects: number;
  personas: number;
  knowledge: number;
  runtimeItems: number;
  signals: number;
};

type IntelligenceFeedItem = {
  id: string;
  kind: "project" | "signal" | "knowledge" | "persona" | "memory";
  title: string;
  preview: string;
  href: string;
  projectId?: string;
  projectName?: string;
};

type IntelligenceNode = {
  id: string;
  label: string;
  type: "workspace" | "project" | "signal" | "knowledge" | "persona" | "memory";
  projectId?: string;
};

type IntelligenceEdge = {
  source: string;
  target: string;
  label: string;
};

type IntelligencePayload = {
  workspace: { id: string; name: string };
  summary: IntelligenceSummary;
  degraded: {
    personas: boolean;
    knowledge: boolean;
    runtimeItems: boolean;
  };
  feed: IntelligenceFeedItem[];
  graph: {
    nodes: IntelligenceNode[];
    edges: IntelligenceEdge[];
  };
};

type SignalPayload = {
  signals: Array<{
    id: string;
    verbatim: string;
    interpretation?: string | null;
    assignedProjectId?: string | null;
  }>;
  total: number;
};

function groupNodes(nodes: IntelligenceNode[]) {
  return {
    projects: nodes.filter((node) => node.type === "project"),
    signals: nodes.filter((node) => node.type === "signal"),
    knowledge: nodes.filter((node) => node.type === "knowledge"),
    personas: nodes.filter((node) => node.type === "persona"),
    memory: nodes.filter((node) => node.type === "memory"),
  };
}

function typeLabel(kind: IntelligenceFeedItem["kind"]) {
  switch (kind) {
    case "project":
      return "Project";
    case "signal":
      return "Signal";
    case "knowledge":
      return "Knowledge";
    case "persona":
      return "Persona";
    case "memory":
      return "Memory";
  }
}

function summaryIcon(label: keyof IntelligenceSummary) {
  switch (label) {
    case "projects":
      return GitBranch;
    case "personas":
      return Users;
    case "knowledge":
      return BookOpen;
    case "signals":
      return Radio;
    case "runtimeItems":
      return BrainCircuit;
  }
}

export function WorkspaceIntelligencePageClient({
  workspaceId,
}: WorkspaceIntelligencePageClientProps) {
  const [view, setView] = useState<"graph" | "feed">("graph");
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");

  const {
    data,
    error,
    isError,
    isLoading,
    refetch,
  } = useQuery<IntelligencePayload>({
    queryKey: ["workspace-intelligence", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/intelligence`);
      if (!res.ok) throw new Error("Failed to load workspace intelligence");
      return res.json();
    },
    enabled: !!workspaceId,
  });

  const { data: signalData } = useQuery<SignalPayload>({
    queryKey: ["workspace-intelligence-signals", workspaceId],
    queryFn: async () => {
      const res = await fetch(
        `/api/signals?workspaceId=${workspaceId}&page=1&pageSize=12`,
      );
      if (!res.ok) {
        return { signals: [], total: 0 };
      }
      return res.json();
    },
    enabled: !!workspaceId,
  });

  const projectOptions = useMemo(() => {
    return (
      data?.graph.nodes.filter((node) => node.type === "project") ?? []
    ).map((node) => ({ id: node.id, label: node.label }));
  }, [data?.graph.nodes]);

  const combinedFeed = useMemo(() => {
    const signalFeed: IntelligenceFeedItem[] =
      signalData?.signals.map((signal) => ({
        id: signal.id,
        kind: "signal",
        title: signal.interpretation || "Captured signal",
        preview: signal.verbatim,
        href: `/workspace/${workspaceId}/signals?id=${signal.id}`,
        projectId: signal.assignedProjectId ?? undefined,
      })) ?? [];

    return [...(data?.feed ?? []), ...signalFeed];
  }, [data?.feed, signalData?.signals, workspaceId]);

  const filteredFeed = useMemo(() => {
    return combinedFeed.filter((item) => {
      const matchesKind = kindFilter === "all" || item.kind === kindFilter;
      const matchesProject =
        projectFilter === "all" || item.projectId === projectFilter;
      const matchesQuery =
        !query ||
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.preview.toLowerCase().includes(query.toLowerCase());
      return matchesKind && matchesProject && matchesQuery;
    });
  }, [combinedFeed, kindFilter, projectFilter, query]);

  const groupedGraph = useMemo(
    () => groupNodes(data?.graph.nodes ?? []),
    [data?.graph.nodes],
  );

  return (
    <div className="min-h-screen">
      <SimpleNavbar path={`~/workspace/${workspaceId}/intelligence`} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
        {isLoading ? (
          <Window title="workspace-intelligence">
            <div className="py-16 text-center text-sm text-muted-foreground">
              Loading workspace intelligence...
            </div>
          </Window>
        ) : isError ? (
          <Window title="workspace-intelligence:error">
            <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
              <div className="space-y-2">
                <h2 className="text-lg font-medium">Workspace intelligence unavailable</h2>
                <p className="text-sm text-muted-foreground">
                  {error instanceof Error
                    ? error.message
                    : "Failed to load the workspace intelligence surface."}
                </p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Retry
                </Button>
              </div>
            </div>
          </Window>
        ) : !data ? null : (
          <>
            <Window title="workspace-intelligence">
              <div className="space-y-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-mono text-muted-foreground">
                      Workspace intelligence
                    </p>
                    <h1 className="text-2xl font-heading">{data.workspace.name}</h1>
                    <p className="max-w-3xl text-sm text-muted-foreground">
                      One surface for signals, knowledge, personas, projects, and runtime context.
                      Treat Personas, Knowledge Base, and Signals as editors and lenses, not the only
                      way to understand the workspace.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/workspace/${workspaceId}/signals`}>Open signals</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/workspace/${workspaceId}/knowledgebase`}>Open knowledge base</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/workspace/${workspaceId}/personas`}>Open personas</Link>
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  {(
                    Object.entries(data.summary) as Array<
                      [keyof IntelligenceSummary, number]
                    >
                  ).map(([label, value]) => {
                    const Icon = summaryIcon(label);
                    return (
                      <div
                        key={label}
                        className="rounded-xl border border-border bg-card/40 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[11px] font-mono text-muted-foreground">
                            {label}
                          </p>
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="mt-3 text-2xl font-heading">{value}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-3 xl:flex-row">
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search intelligence..."
                    className="xl:max-w-sm"
                  />
                  <select
                    value={kindFilter}
                    onChange={(event) => setKindFilter(event.target.value)}
                    className="rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option value="all">All types</option>
                    <option value="project">Projects</option>
                    <option value="signal">Signals</option>
                    <option value="knowledge">Knowledge</option>
                    <option value="persona">Personas</option>
                    <option value="memory">Memory</option>
                  </select>
                  <select
                    value={projectFilter}
                    onChange={(event) => setProjectFilter(event.target.value)}
                    className="rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option value="all">All projects</option>
                    {projectOptions.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2 xl:ml-auto">
                    <Button
                      variant={view === "graph" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setView("graph")}
                    >
                      Graph view
                    </Button>
                    <Button
                      variant={view === "feed" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setView("feed")}
                    >
                      Feed view
                    </Button>
                  </div>
                </div>
              </div>
            </Window>

            {view === "graph" ? (
              <div className="grid gap-6 xl:grid-cols-[260px_1fr]">
                <Window title="workspace-hub">
                  <div className="space-y-4 text-sm">
                    <div className="rounded-xl border border-border bg-card/40 p-4">
                      <p className="text-[11px] font-mono text-muted-foreground">Hub</p>
                      <p className="mt-2 text-lg font-medium">{data.workspace.name}</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        The workspace is the anchor. Projects, signals, personas, docs, and runtime
                        context should all be reachable from here.
                      </p>
                    </div>
                    <div className="rounded-xl border border-border bg-card/40 p-4">
                      <p className="text-[11px] font-mono text-muted-foreground">Route discipline</p>
                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <li>1. Use this page to triage and discover relationships.</li>
                        <li>2. Use Personas, Knowledge Base, and Signals to edit source material.</li>
                        <li>3. Use the project cockpit to act on the selected evidence.</li>
                      </ul>
                    </div>
                  </div>
                </Window>

                <Window title="relationship-map">
                  <div className="grid gap-4 xl:grid-cols-2">
                    <div className="space-y-4">
                      <div className="rounded-xl border border-border bg-card/30 p-4">
                        <p className="text-[11px] font-mono text-muted-foreground">Projects</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {groupedGraph.projects.length > 0 ? (
                            groupedGraph.projects.map((node) => (
                              <Badge key={node.id} variant="secondary">
                                {node.label}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              No projects yet.
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="rounded-xl border border-border bg-card/30 p-4">
                        <p className="text-[11px] font-mono text-muted-foreground">Signals & memory</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {[...groupedGraph.signals, ...groupedGraph.memory]
                            .filter((node) =>
                              projectFilter === "all" ? true : node.projectId === projectFilter,
                            )
                            .slice(0, 18)
                            .map((node) => (
                              <Badge key={node.id} variant="outline">
                                {node.label}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="rounded-xl border border-border bg-card/30 p-4">
                        <p className="text-[11px] font-mono text-muted-foreground">Knowledge & hypotheses</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {groupedGraph.knowledge.slice(0, 18).map((node) => (
                            <Badge key={node.id} variant="outline">
                              {node.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-xl border border-border bg-card/30 p-4">
                        <p className="text-[11px] font-mono text-muted-foreground">Personas</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {groupedGraph.personas.slice(0, 12).map((node) => (
                            <Badge key={node.id} variant="secondary">
                              {node.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        This is a first-cut relationship map. Use it to move from workspace-level
                        evidence into the right project cockpit without bouncing across isolated admin
                        pages.
                      </p>
                    </div>
                  </div>
                </Window>
              </div>
            ) : (
              <Window title="workspace-feed">
                <div className="space-y-3">
                  {filteredFeed.length === 0 ? (
                    <div className="rounded-xl border p-6 text-sm text-muted-foreground">
                      No intelligence items matched the current filters.
                    </div>
                  ) : (
                    filteredFeed.map((item) => (
                      <Link
                        key={`${item.kind}-${item.id}`}
                        href={item.href}
                        className="block rounded-xl border border-border bg-card/30 p-4 transition-colors hover:bg-card/60"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">{typeLabel(item.kind)}</Badge>
                          {item.projectName ? (
                            <Badge variant="secondary">{item.projectName}</Badge>
                          ) : null}
                        </div>
                        <h3 className="mt-3 text-base font-medium">{item.title}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {item.preview}
                        </p>
                      </Link>
                    ))
                  )}
                </div>
              </Window>
            )}
          </>
        )}
      </main>
    </div>
  );
}
