import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { SwarmReport } from "./types";

function toDateStamp(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

async function resolveSwarmRoot() {
  const workspaceRoot = path.resolve(process.cwd(), "..");
  const preferred = path.join(workspaceRoot, "pm-workspace-docs", "status", "swarm");
  try {
    await mkdir(preferred, { recursive: true });
    return preferred;
  } catch {
    const fallback = path.join(workspaceRoot, "elmer-docs", "status", "swarm");
    await mkdir(fallback, { recursive: true });
    return fallback;
  }
}

export function formatSwarmMarkdown(report: SwarmReport) {
  const lines: string[] = [
    `# Elmer Swarm Artifact`,
    ``,
    `**Workspace:** ${report.workspaceName}`,
    `**Preset:** ${report.preset}`,
    `**Generated:** ${report.generatedAt}`,
    `**Release target:** ${report.releaseTarget}`,
    `**Primary tracker:** ${report.sourceOfTruth}`,
    ``,
    `## Objective`,
    ``,
    report.objective,
    ``,
    `## Control Room Note`,
    ``,
    `- Update Linear first when issue state, sequencing, blockers, or merge readiness changes.`,
    `- This artifact is a derived swarm snapshot and does not replace Linear issue state.`,
    ``,
    `## Backlog`,
    ``,
    ...(report.backlog.length > 0
      ? report.backlog.map((item) => `- ${item}`)
      : ["- No backlog items captured."]),
    ``,
    `## Lane Summary`,
    ``,
    `| Lane | Status | Owner | Linked issues | Next action | Blockers |`,
    `| --- | --- | --- | --- | --- | --- |`,
    ...report.lanes.map(
      (lane) =>
        `| ${lane.name} | ${lane.status} | ${lane.owner} | ${lane.linkedIssues.join(", ") || "None"} | ${lane.nextAction || "None"} | ${lane.blockers.join(", ") || "None"} |`,
    ),
    ``,
    `## Lane Detail`,
    ``,
    ...report.lanes.flatMap((lane) => [
      `### ${lane.name}`,
      ``,
      `- Status: ${lane.status}`,
      `- Owner: ${lane.owner}`,
      `- Focus: ${lane.focus}`,
      `- Linked issues: ${lane.linkedIssues.join(", ") || "None"}`,
      `- Dependencies: ${lane.dependencies.join(" | ") || "None"}`,
      `- Exit criteria: ${lane.exitCriteria.join(" | ") || "None"}`,
      `- Evidence: ${lane.evidence.join(" | ") || "None"}`,
      `- Next action: ${lane.nextAction || "None"}`,
      `- Handoff request: ${lane.handoffRequest || "None"}`,
      `- Blockers: ${lane.blockers.join(" | ") || "None"}`,
      `- Lane jobs: ${lane.jobs.map((job) => `${job.label} (${job.status})`).join(", ") || "None"}`,
      ``,
    ]),
    `## Blockers`,
    ``,
    ...(report.blockers.length > 0
      ? report.blockers.map((blocker) => `- ${blocker}`)
      : ["- No blockers captured."]),
    ``,
    `## Validation Checks`,
    ``,
    ...(report.validationChecks.length > 0
      ? report.validationChecks.map(
          (check) =>
            `- ${check.label}${check.evidence ? ` — ${check.evidence}` : ""}`,
        )
      : ["- No validation checks captured."]),
  ];

  return lines.join("\n");
}

export async function writeSwarmReport(report: SwarmReport) {
  const root = await resolveSwarmRoot();
  const filename = `${report.preset}-swarm-${toDateStamp()}.md`;
  const filePath = path.join(root, filename);
  await writeFile(filePath, formatSwarmMarkdown(report), "utf8");
  return { filePath };
}
