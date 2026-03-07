import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { WorkspaceStatusReport } from "./types";

function toDateStamp(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

async function resolveStatusRoot() {
  const workspaceRoot = path.resolve(process.cwd(), "..");
  const preferred = path.join(workspaceRoot, "pm-workspace-docs", "status");
  try {
    await mkdir(preferred, { recursive: true });
    return preferred;
  } catch {
    const fallback = path.join(workspaceRoot, "elmer-docs", "status");
    await mkdir(fallback, { recursive: true });
    return fallback;
  }
}

function formatArtifactCell(value: string) {
  switch (value) {
    case "complete":
      return "✅";
    case "missing":
      return "❌";
    default:
      return "—";
  }
}

export function formatWorkspaceStatusMarkdown(report: WorkspaceStatusReport) {
  const lines: string[] = [
    `# Workspace Status Report`,
    ``,
    `**Workspace:** ${report.workspaceName}`,
    `**Generated:** ${report.generatedAt}`,
    `**Health Score:** ${report.healthScore}/100`,
    ``,
    `## Executive Summary`,
    ``,
    `- Total projects: ${report.summary.totalProjects}`,
    `- Ready to advance: ${report.summary.readyToAdvance}`,
    `- Needs attention: ${report.summary.needsAttention}`,
    `- Stale projects: ${report.summary.staleProjects}`,
    ``,
    `## Measurement Coverage`,
    ``,
    `- Instrumented: ${report.measurementCoverage.instrumented}`,
    `- Partial: ${report.measurementCoverage.partial}`,
    `- Missing: ${report.measurementCoverage.missing}`,
    ``,
    `## Attention Required`,
    ``,
  ];

  if (report.attentionRequired.length === 0) {
    lines.push(`- No initiatives require immediate attention.`, ``);
  } else {
    report.attentionRequired.forEach((initiative) => {
      lines.push(
        `- **${initiative.name}** (${initiative.stage}) — ${
          initiative.blockers[0] ||
          (initiative.stale
            ? `stale for ${initiative.daysSinceUpdate} days`
            : initiative.readinessLabel)
        }`,
      );
    });
    lines.push("");
  }

  lines.push(`## Prioritized Action Queue`, ``);
  if (report.actionQueue.length === 0) {
    lines.push(`- No actions queued.`, ``);
  } else {
    report.actionQueue.forEach((action, index) => {
      lines.push(
        `${index + 1}. **${action.projectName}** — ${action.reason} → \`${action.command}\``,
      );
    });
    lines.push("");
  }

  lines.push(
    `## Artifact Gap Matrix`,
    ``,
    `| Initiative | Stage | Research | PRD | Design | Eng | Prototype | Jury | Metrics |`,
    `| --- | --- | --- | --- | --- | --- | --- | --- | --- |`,
  );

  report.initiatives.forEach((initiative) => {
    lines.push(
      `| ${initiative.name} | ${initiative.stage} | ${formatArtifactCell(initiative.artifacts.research)} | ${formatArtifactCell(initiative.artifacts.prd)} | ${formatArtifactCell(initiative.artifacts.design_brief)} | ${formatArtifactCell(initiative.artifacts.engineering_spec)} | ${formatArtifactCell(initiative.artifacts.prototype_notes)} | ${formatArtifactCell(initiative.artifacts.jury_report)} | ${formatArtifactCell(initiative.artifacts.metrics)} |`,
    );
  });

  lines.push("", `## Ready to Advance`, ``);
  if (report.readyToAdvance.length === 0) {
    lines.push(`- No projects currently meet graduation criteria.`, ``);
  } else {
    report.readyToAdvance.forEach((initiative) => {
      lines.push(
        `- **${initiative.name}** — ${initiative.stage} → next step \`${initiative.nextSuggestedCommand}\``,
      );
    });
    lines.push("");
  }

  lines.push(`## All Initiatives`, ``);
  report.initiatives.forEach((initiative) => {
    lines.push(
      `### ${initiative.name}`,
      `- Stage: ${initiative.stage}`,
      `- Status: ${initiative.status}`,
      `- Readiness: ${Math.round(initiative.readinessScore * 100)}% (${initiative.readinessLabel})`,
      `- Measurement: ${initiative.measurementReadiness}`,
      `- Days since update: ${initiative.daysSinceUpdate}`,
      `- Next command: \`${initiative.nextSuggestedCommand}\``,
      initiative.blockers.length > 0
        ? `- Blockers: ${initiative.blockers.join("; ")}`
        : `- Blockers: none`,
      ``,
    );
  });

  return lines.join("\n");
}

export async function writeWorkspaceStatusSnapshot(report: WorkspaceStatusReport) {
  const statusRoot = await resolveStatusRoot();
  const dateStamp = toDateStamp();
  const markdownPath = path.join(statusRoot, `status-all-${dateStamp}.md`);
  const jsonPath = path.join(statusRoot, `status-all-${dateStamp}.json`);
  const historyPath = path.join(statusRoot, "history.json");

  await writeFile(markdownPath, formatWorkspaceStatusMarkdown(report), "utf8");
  await writeFile(jsonPath, JSON.stringify(report, null, 2), "utf8");

  let history: Array<{
    date: string;
    healthScore: number;
    totalProjects: number;
    readyToAdvance: number;
    needsAttention: number;
  }> = [];
  try {
    const existing = await readFile(historyPath, "utf8");
    const parsed = JSON.parse(existing) as { snapshots?: typeof history };
    history = parsed.snapshots ?? [];
  } catch {
    history = [];
  }

  const snapshot = {
    date: report.generatedAt,
    healthScore: report.healthScore,
    totalProjects: report.summary.totalProjects,
    readyToAdvance: report.summary.readyToAdvance,
    needsAttention: report.summary.needsAttention,
  };
  const nextHistory = [
    snapshot,
    ...history.filter((entry) => entry.date !== snapshot.date),
  ].slice(0, 30);

  await writeFile(
    historyPath,
    JSON.stringify({ snapshots: nextHistory }, null, 2),
    "utf8",
  );

  return {
    markdownPath,
    jsonPath,
    historyPath,
  };
}
