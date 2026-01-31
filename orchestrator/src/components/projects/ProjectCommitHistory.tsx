"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { GitCommit, ExternalLink, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Commit {
  id: string;
  commitSha: string;
  commitUrl: string;
  message: string;
  documentType: string | null;
  filesChanged: string[];
  triggeredBy: string | null;
  createdAt: string;
  stageRun?: {
    id: string;
    stage: string;
    status: string;
  } | null;
}

interface CommitHistoryResponse {
  commits: Commit[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

interface ProjectCommitHistoryProps {
  projectId: string;
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  prd: "PRD",
  design_brief: "Design Brief",
  engineering_spec: "Engineering Spec",
  gtm_brief: "GTM Brief",
  research: "Research",
  prototype_notes: "Prototype Notes",
  state: "State",
};

export function ProjectCommitHistory({ projectId }: ProjectCommitHistoryProps) {
  const { data, isLoading, error } = useQuery<CommitHistoryResponse>({
    queryKey: ["project-commits", projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/commits`);
      if (!response.ok) throw new Error("Failed to fetch commits");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCommit className="h-5 w-5" />
            Commit History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCommit className="h-5 w-5" />
            Commit History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Failed to load commit history
          </p>
        </CardContent>
      </Card>
    );
  }

  const commits = data?.commits || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCommit className="h-5 w-5" />
          Commit History
        </CardTitle>
        <CardDescription>
          {data?.pagination.total || 0} Elmer-generated commit{data?.pagination.total === 1 ? "" : "s"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {commits.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No commits yet. Documents will appear here when committed to GitHub.
          </p>
        ) : (
          <div className="space-y-4">
            {commits.map((commit) => (
              <div
                key={commit.id}
                className="flex items-start justify-between rounded-lg border p-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-muted-foreground">
                      {commit.commitSha.slice(0, 7)}
                    </code>
                    {commit.documentType && (
                      <Badge variant="secondary" className="text-xs">
                        <FileText className="mr-1 h-3 w-3" />
                        {DOCUMENT_TYPE_LABELS[commit.documentType] || commit.documentType}
                      </Badge>
                    )}
                    {commit.stageRun && (
                      <Badge variant="outline" className="text-xs">
                        {commit.stageRun.stage}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium">
                    {commit.message.split("\n")[0]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(commit.createdAt), { addSuffix: true })}
                    {commit.triggeredBy && ` \u2022 ${commit.triggeredBy}`}
                  </p>
                  {commit.filesChanged.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {commit.filesChanged.length} file{commit.filesChanged.length === 1 ? "" : "s"} changed
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="shrink-0"
                >
                  <a
                    href={commit.commitUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">View on GitHub</span>
                  </a>
                </Button>
              </div>
            ))}

            {data?.pagination.hasMore && (
              <p className="text-center text-xs text-muted-foreground">
                Showing {commits.length} of {data.pagination.total} commits
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
