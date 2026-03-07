"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/glass";
import { SimpleNavbar } from "@/components/chrome/Navbar";

export default function SearchPage() {
  const [workspaceId, setWorkspaceId] = useState("");
  const [query, setQuery] = useState("");

  const { data, refetch } = useQuery({
    queryKey: ["search", workspaceId, query],
    queryFn: async () => {
      const res = await fetch(
        `/api/search?workspaceId=${workspaceId}&q=${encodeURIComponent(query)}`,
      );
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    enabled: false,
  });

  return (
    <div className="min-h-screen">
      <SimpleNavbar path="~/search" />
      <main className="p-8 space-y-6">
        <GlassPanel className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Input
              placeholder="Workspace ID"
              value={workspaceId}
              onChange={(e) => setWorkspaceId(e.target.value)}
              className="max-w-xs"
            />
            <Input
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button onClick={() => refetch()}>Search</Button>
          </div>
          <div className="space-y-4">
            {data?.results?.length ? (
              <div>
                <h3 className="text-sm font-medium mb-2">Runtime Memory Results</h3>
                <div className="space-y-2">
                  {data.results.map(
                    (result: {
                      id: string;
                      title: string;
                      entityType: string;
                      promotionState: string;
                      provenance: { source: string };
                      snippet: string;
                    }) => (
                      <div
                        key={result.id}
                        className="rounded-lg border border-border p-3 text-sm"
                      >
                        <div className="font-medium">
                          {result.title} · {result.entityType}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {result.promotionState} · {result.provenance.source}
                        </div>
                        <div className="text-muted-foreground mt-1 line-clamp-3">
                          {result.snippet}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            ) : null}
            {!data?.results?.length && data?.documents?.length ? (
              <div>
                <h3 className="text-sm font-medium mb-2">Documents</h3>
                <div className="space-y-2">
                  {data.documents.map(
                    (doc: { id: string; title: string; type: string }) => (
                      <div
                        key={doc.id}
                        className="text-sm text-muted-foreground"
                      >
                        {doc.title} · {doc.type}
                      </div>
                    ),
                  )}
                </div>
              </div>
            ) : null}
            {data?.memory?.length ? (
              <div>
                <h3 className="text-sm font-medium mb-2">Memory</h3>
                <div className="space-y-2">
                  {data.memory.map((m: { id: string; content: string }) => (
                    <div
                      key={m.id}
                      className="text-sm text-muted-foreground line-clamp-2"
                    >
                      {m.content}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </GlassPanel>
      </main>
    </div>
  );
}
