import { mcpGet, mcpPost, type ConvexJob } from "../convex-client.js";

export async function listJobs(status?: string): Promise<string> {
  const jobs = await mcpGet("/jobs", status ? { status } : undefined) as ConvexJob[];
  if (!jobs?.length) return `No jobs found${status ? ` with status "${status}"` : ""}.`;

  const lines: string[] = [`# Jobs (${jobs.length})\n`];
  const byStatus: Record<string, ConvexJob[]> = {};
  for (const j of jobs) {
    byStatus[j.status] = byStatus[j.status] ?? [];
    byStatus[j.status].push(j);
  }

  const order = ["running", "waiting_input", "pending", "completed", "failed", "cancelled"];
  for (const s of order) {
    const js = byStatus[s];
    if (!js?.length) continue;
    lines.push(`## ${s.toUpperCase()} (${js.length})`);
    for (const j of js.slice(0, 10)) {
      lines.push(`- **${j.type}** — ID: \`${j._id}\``);
      if (j.errorMessage) lines.push(`  Error: ${j.errorMessage.slice(0, 80)}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

export async function getJob(jobId: string): Promise<string> {
  const { job, logs } = await mcpGet("/jobs", { id: jobId }) as {
    job: ConvexJob;
    logs: Array<{ level: string; message: string; stepKey?: string }>;
  };
  if (!job) return `Job not found: ${jobId}`;

  const lines: string[] = [
    `# Job: ${job.type}`,
    `**Status:** ${job.status}  **ID:** \`${job._id}\``,
    job.errorMessage ? `\n⚠️ **Error:** ${job.errorMessage}` : "",
  ].filter(Boolean);

  if (logs?.length) {
    lines.push(`\n## Recent Logs`);
    for (const l of logs.slice(-10)) {
      lines.push(`\`[${l.level}]\`${l.stepKey ? ` [${l.stepKey}]` : ""} ${l.message}`);
    }
  }

  if (job.status === "waiting_input") {
    lines.push("\n⏸ **Waiting for input.** Use `elmer_get_pending_questions` to answer.");
  }

  if (job.output && typeof job.output === "object") {
    const content = (job.output as Record<string, unknown>).content;
    if (content && typeof content === "string") {
      lines.push(`\n## Output\n${content.slice(0, 500)}${content.length > 500 ? "\n…" : ""}`);
    }
  }

  return lines.join("\n");
}

export async function getJobLogs(jobId: string): Promise<string> {
  const { logs } = await mcpGet("/jobs", { id: jobId }) as {
    logs: Array<{ level: string; message: string; stepKey?: string }>;
  };
  if (!logs?.length) return `No logs for job \`${jobId}\`.`;
  return [
    `# Logs for job \`${jobId}\``,
    ...logs.map((l) => `\`[${l.level}]\`${l.stepKey ? ` [${l.stepKey}]` : ""} ${l.message}`),
  ].join("\n");
}

export async function getPendingQuestions(): Promise<string> {
  const questions = await mcpGet("/questions") as Array<{
    _id: string;
    jobId: string;
    questionType: string;
    questionText: string;
    choices?: string[] | null;
    _creationTime: number;
  }>;

  if (!questions?.length) return "✅ No pending questions. All agents running freely.";

  const lines: string[] = [`# Pending Questions (${questions.length})\n`];
  for (const q of questions) {
    const ago = Math.round((Date.now() - q._creationTime) / 60000);
    lines.push(`## ${ago}m ago`);
    lines.push(`**Job:** \`${q.jobId}\`  **Question ID:** \`${q._id}\``);
    lines.push(`\n${q.questionText}`);
    if (q.choices?.length) {
      lines.push(`\n**Choices:** ${q.choices.map((c) => `[${c}]`).join("  ")}`);
    }
    lines.push(`\nAnswer: \`elmer_respond_to_question\` with question_id=\`${q._id}\``);
    lines.push("");
  }
  return lines.join("\n");
}

export async function respondToQuestion(questionId: string, response: string): Promise<string> {
  await mcpPost("/questions/answer", { questionId, response });
  return `✅ Answer submitted for \`${questionId}\`. Agent will resume automatically.`;
}
