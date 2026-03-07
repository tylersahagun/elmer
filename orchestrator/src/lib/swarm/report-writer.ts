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
    `# Workspace Swarm Status`,
    ``,
    `**Workspace:** ${report.workspaceName}`,
    `**Preset:** ${report.preset}`,
    `**Generated:** ${report.generatedAt}`,
    ``,
    `## Objective`,
    ``,
    report.objective,
    ``,
    `## Backlog`,
    ``,
    ...(report.backlog.length > 0
      ? report.backlog.map((item) => `- ${item}`)
      : ["- No backlog items captured."]),
    ``,
    `## Lane Ownership`,
    ``,
    `| Lane | Owner | Focus | Blockers |`,
    `| --- | --- | --- | --- |`,
    ...report.lanes.map(
      (lane) =>
        `| ${lane.name} | ${lane.owner} | ${lane.focus} | ${lane.blockers.join(", ") || "None"} |`,
    ),
    ``,
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
