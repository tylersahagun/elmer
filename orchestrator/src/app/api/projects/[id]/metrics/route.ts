import { NextRequest, NextResponse, after } from "next/server";
import { auth } from "@/auth";
import {
  getProject,
  getDocumentByType,
  createDocument,
  updateProjectMetadata,
  updateProjectStage,
} from "@/lib/db/queries";
import { commitToGitHub } from "@/lib/github/writeback-service";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import { validateStageTransition } from "@/lib/rules/engine";
import { logProjectStageChanged } from "@/lib/activity";
import { triggerColumnAutomation } from "@/lib/automation/column-automation";
import type {
  ReleaseMetricsThreshold,
  ReleaseMetricsValues,
  ProjectStage,
} from "@/lib/db/schema";

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
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const project = await getProject(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await requireWorkspaceAccess(project.workspaceId, "member");

    const prd = await getDocumentByType(id, "prd");
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
      sourcePath: project.metadata?.sourcePath || null,
      contextPath: project.workspace?.settings?.contextPaths?.[0] || null,
    });

    const document = await createDocument({
      projectId: id,
      type: "metrics",
      title: "Metrics",
      content: metricsContent,
      filePath: project.workspace?.githubRepo
        ? `${project.workspace.githubRepo}:${metricsPath}`
        : metricsPath,
      metadata: { generatedBy: "ai" },
    });

    if (project.workspace?.githubRepo) {
      const [owner, repo] = project.workspace.githubRepo.split("/");
      if (owner && repo) {
        await commitToGitHub(
          {
            workspaceId: project.workspaceId,
            projectId: project.id,
            projectName: project.name,
            owner,
            repo,
            branch: project.workspace.settings?.baseBranch || "main",
          },
          [{ path: metricsPath, content: metricsContent }],
          {
            projectId: project.id,
            projectName: project.name,
            documentType: "metrics",
            triggeredBy: "metrics-generator",
          },
          session.user.id,
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
    const project = await getProject(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

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

    const mergedReleaseMetrics = {
      ...(project.metadata?.releaseMetrics || {}),
      ...(thresholds ? { thresholds } : {}),
      ...(current ? { current } : {}),
      ...(autoAdvance !== undefined ? { autoAdvance } : {}),
      lastEvaluatedAt: new Date().toISOString(),
    };

    const updatedMetadata = {
      ...(project.metadata || {}),
      releaseMetrics: mergedReleaseMetrics,
    };

    const updated = await updateProjectMetadata(id, updatedMetadata);

    let stageAdvanced: ProjectStage | null = null;
    if (mergedReleaseMetrics.autoAdvance) {
      const currentStage = project.stage as ProjectStage;
      const targetStage =
        currentStage === "alpha"
          ? "beta"
          : currentStage === "beta"
            ? "ga"
            : null;
      const threshold =
        currentStage === "alpha"
          ? mergedReleaseMetrics.thresholds?.alpha
          : currentStage === "beta"
            ? mergedReleaseMetrics.thresholds?.beta
            : undefined;

      if (
        targetStage &&
        meetsThreshold(mergedReleaseMetrics.current, threshold)
      ) {
        const validation = await validateStageTransition(id, targetStage);
        if (validation.allowed) {
          const previousStage = project.stage;
          const updatedStageProject = await updateProjectStage(
            id,
            targetStage,
            "automation:metrics",
          );
          stageAdvanced = updatedStageProject.stage as ProjectStage;
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
      project: updated,
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
