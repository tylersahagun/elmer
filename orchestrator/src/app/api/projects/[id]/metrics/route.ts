import { NextRequest, NextResponse, after } from "next/server";
import { auth as clerkAuth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { getConvexProjectWithDocuments } from "@/lib/convex/server";
import { commitToGitHub } from "@/lib/github/writeback-service";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import { validateStageTransition } from "@/lib/rules/engine";
import { logProjectStageChanged } from "@/lib/activity";
import { triggerColumnAutomation } from "@/lib/automation/column-automation";

type ReleaseMetricsThreshold = {
  users: number;
  engagement: number;
  errors: number;
  satisfaction: number;
};
type ReleaseMetricsValues = {
  users: number;
  engagement: number;
  errors: number;
  satisfaction: number;
};
type ProjectStage = string;

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}

const DEFAULT_THRESHOLDS: Record<string, ReleaseMetricsThreshold> = {
  alpha: { users: 25, engagement: 50, errors: 5, satisfaction: 3.5 },
  beta: { users: 100, engagement: 60, errors: 2, satisfaction: 4.0 },
  ga: { users: 500, engagement: 70, errors: 1, satisfaction: 4.0 },
};

function meetsThreshold(
  current: ReleaseMetricsValues | undefined,
  threshold: ReleaseMetricsThreshold | undefined,
) {
  if (!current || !threshold) return false;
  return (
    current.users >= threshold.users &&
    current.engagement >= threshold.engagement &&
    current.errors <= threshold.errors &&
    current.satisfaction >= threshold.satisfaction
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractSection(content: string, title: string): string {
  const pattern = new RegExp(`^##\\s+${title}\\s*$`, "m");
  const match = content.match(pattern);
  if (!match || match.index === undefined) return "";
  const start = match.index + match[0].length;
  const rest = content.slice(start);
  const next = rest.search(/^##\s+/m);
  return (next >= 0 ? rest.slice(0, next) : rest).trim();
}

function normalizeBulletLines(section: string): string[] {
  return section
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-*•]\s+/, ""))
    .filter(Boolean);
}

function buildMetricsContent(params: {
  projectName: string;
  successMetrics: string[];
  outcomeChain: string;
}): string {
  const { projectName, successMetrics, outcomeChain } = params;
  const metricsBlock =
    successMetrics.length > 0
      ? successMetrics.map((metric) => `- ${metric}`).join("\n")
      : "- Add success metrics from the PRD\n- Define measurable outcomes";

  const outcomeBlock = outcomeChain
    ? outcomeChain
    : "_Add an outcome chain from the PRD_";

  return `# ${projectName} Metrics

## Outcome Chain
${outcomeBlock}

## Success Metrics
${metricsBlock}

## Release Gates

### Alpha → Beta
- Active users ≥ ${DEFAULT_THRESHOLDS.alpha.users}
- Engagement rate ≥ ${DEFAULT_THRESHOLDS.alpha.engagement}%
- Error rate ≤ ${DEFAULT_THRESHOLDS.alpha.errors}%
- Satisfaction ≥ ${DEFAULT_THRESHOLDS.alpha.satisfaction}/5

### Beta → GA
- Active users ≥ ${DEFAULT_THRESHOLDS.beta.users}
- Engagement rate ≥ ${DEFAULT_THRESHOLDS.beta.engagement}%
- Error rate ≤ ${DEFAULT_THRESHOLDS.beta.errors}%
- Satisfaction ≥ ${DEFAULT_THRESHOLDS.beta.satisfaction}/5

## Instrumentation (PostHog)
- feature_viewed
- feature_clicked
- feature_completed
- feature_error
- feedback_submitted
`;
}

function resolveMetricsPath(params: {
  projectName: string;
  sourcePath?: string | null;
  contextPath?: string | null;
}): string {
  if (params.sourcePath) {
    return `${params.sourcePath.replace(/\/$/, "")}/METRICS.md`;
  }
  const base = params.contextPath
    ? params.contextPath.replace(/\/$/, "")
    : "elmer-docs";
  return `${base}/initiatives/${slugify(params.projectName)}/METRICS.md`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { userId } = await clerkAuth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const projectData = await getConvexProjectWithDocuments(id);
    if (!projectData) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const project = projectData.project as {
      _id: string;
      workspaceId: string;
      name: string;
      stage: string;
      metadata?: Record<string, unknown> | null;
    };
    const workspaceData = projectData as {
      workspace?: {
        githubRepo?: string | null;
        settings?: { baseBranch?: string; contextPaths?: string[] } | null;
      };
    };

    await requireWorkspaceAccess(project.workspaceId, "member");

    const client = getConvexClient();
    const prd = (await client.query(api.documents.getByType, {
      projectId: id as Id<"projects">,
      type: "prd",
    })) as { content: string } | null;

    const prdContent = prd?.content ?? "";
    const outcomeChain = extractSection(prdContent, "Outcome Chain");
    const successSection = extractSection(prdContent, "Success Metrics");
    const successMetrics = normalizeBulletLines(successSection);

    const metricsContent = buildMetricsContent({
      projectName: project.name,
      successMetrics,
      outcomeChain,
    });

    const metricsPath = resolveMetricsPath({
      projectName: project.name,
      sourcePath: (project.metadata?.sourcePath as string | null) || null,
      contextPath: workspaceData.workspace?.settings?.contextPaths?.[0] || null,
    });

    const documentId = await client.mutation(api.documents.create, {
      workspaceId: project.workspaceId as Id<"workspaces">,
      projectId: id as Id<"projects">,
      type: "metrics",
      title: "Metrics",
      content: metricsContent,
      generatedByAgent: "metrics-generator",
    });

    const document = { id: documentId, projectId: id, type: "metrics", title: "Metrics" };

    if (workspaceData.workspace?.githubRepo) {
      const [owner, repo] = workspaceData.workspace.githubRepo.split("/");
      if (owner && repo) {
        await commitToGitHub(
          {
            workspaceId: project.workspaceId,
            projectId: project._id,
            projectName: project.name,
            owner,
            repo,
            branch: workspaceData.workspace.settings?.baseBranch || "main",
          },
          [{ path: metricsPath, content: metricsContent }],
          {
            projectId: project._id,
            projectName: project.name,
            documentType: "metrics",
            triggeredBy: "metrics-generator",
          },
          userId,
          "add",
        );
      }
    }

    return NextResponse.json({ success: true, document });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to generate metrics:", error);
    return NextResponse.json(
      { error: "Failed to generate metrics" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const projectData = await getConvexProjectWithDocuments(id);
    if (!projectData) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const project = projectData.project as {
      _id: string;
      workspaceId: string;
      name: string;
      stage: string;
      metadata?: Record<string, unknown> | null;
    };

    const membership = await requireWorkspaceAccess(
      project.workspaceId,
      "member",
    );

    const body = await request.json();
    const thresholds = body?.thresholds as
      | Record<string, ReleaseMetricsThreshold>
      | undefined;
    const current = body?.current as ReleaseMetricsValues | undefined;
    const autoAdvance =
      typeof body?.autoAdvance === "boolean" ? body.autoAdvance : undefined;

    const existingMetrics = (project.metadata?.releaseMetrics as Record<string, unknown>) || {};
    const mergedReleaseMetrics = {
      ...existingMetrics,
      ...(thresholds ? { thresholds } : {}),
      ...(current ? { current } : {}),
      ...(autoAdvance !== undefined ? { autoAdvance } : {}),
      lastEvaluatedAt: new Date().toISOString(),
    };

    const updatedMetadata = {
      ...(project.metadata || {}),
      releaseMetrics: mergedReleaseMetrics,
    };

    const client = getConvexClient();
    await client.mutation(api.projects.update, {
      projectId: id as Id<"projects">,
      metadata: updatedMetadata,
    });

    let stageAdvanced: ProjectStage | null = null;
    if (mergedReleaseMetrics.autoAdvance) {
      const currentStage = project.stage as ProjectStage;
      const targetStage =
        currentStage === "alpha"
          ? "beta"
          : currentStage === "beta"
            ? "ga"
            : null;
      const thresholdsMap = mergedReleaseMetrics.thresholds as Record<string, ReleaseMetricsThreshold> | undefined;
      const threshold =
        currentStage === "alpha"
          ? thresholdsMap?.alpha
          : currentStage === "beta"
            ? thresholdsMap?.beta
            : undefined;
      const currentMetrics = mergedReleaseMetrics.current as ReleaseMetricsValues | undefined;

      if (
        targetStage &&
        meetsThreshold(currentMetrics, threshold)
      ) {
        const validation = await validateStageTransition(id, targetStage);
        if (validation.allowed) {
          const previousStage = project.stage;
          await client.mutation(api.projects.update, {
            projectId: id as Id<"projects">,
            stage: targetStage,
          });
          stageAdvanced = targetStage;
          await logProjectStageChanged(
            project.workspaceId,
            membership.userId,
            id,
            project.name,
            previousStage,
            targetStage,
          );
          after(async () => {
            try {
              const automationTriggeredBy = `automation:metrics`;
              await triggerColumnAutomation(
                project.workspaceId,
                id,
                targetStage,
                automationTriggeredBy,
              );
            } catch (automationError) {
              console.error(
                "[MetricsAutoAdvance] Failed to trigger column automation",
                automationError,
              );
            }
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      project: { ...project, metadata: updatedMetadata },
      stageAdvanced,
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to update metrics config:", error);
    return NextResponse.json(
      { error: "Failed to update metrics configuration" },
      { status: 500 },
    );
  }
}
