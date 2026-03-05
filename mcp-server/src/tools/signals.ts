import { mcpGet, mcpPost, WORKSPACE_ID, type ConvexSignal } from "../convex-client.js";

export async function listSignals(status?: string): Promise<string> {
  const signals = await mcpGet("/signals", status ? { status } : undefined) as ConvexSignal[];
  if (!signals?.length) return "No signals found.";

  const lines: string[] = [`# Signals (${signals.length})\n`];
  for (const s of signals.slice(0, 30)) {
    const severity = s.severity ? ` [${s.severity}]` : "";
    const verbatim = s.verbatim.slice(0, 100) + (s.verbatim.length > 100 ? "…" : "");
    lines.push(`- **${s.source}**${severity} — ${verbatim}`);
    lines.push(`  ID: \`${s._id}\`  Status: ${s.status}`);
  }
  if (signals.length > 30) lines.push(`\n*…and ${signals.length - 30} more*`);
  return lines.join("\n");
}

export async function getSignal(signalId: string): Promise<string> {
  // Use listSignals and filter — no dedicated single-signal endpoint yet
  const signals = await mcpGet("/signals") as ConvexSignal[];
  const signal = signals?.find((s) => s._id === signalId);
  if (!signal) return `Signal not found: ${signalId}`;

  return [
    `# Signal`,
    `**Source:** ${signal.source}  **Status:** ${signal.status}  **Severity:** ${signal.severity ?? "unset"}`,
    `\n> ${signal.verbatim}`,
    signal.interpretation ? `\n**Interpretation:** ${signal.interpretation}` : "",
    `\n**ID:** \`${signalId}\``,
  ].filter(Boolean).join("\n");
}

export async function ingestSignal(
  verbatim: string,
  source: string,
  severity?: string,
  projectId?: string,
): Promise<string> {
  const result = await mcpPost("/signals", { verbatim, source, severity }) as { id: string };

  if (projectId) {
    // Link will be done via the signal's auto-processing pipeline
  }

  return [
    `✅ Signal ingested. It will be auto-processed and classified shortly.`,
    `\nID: \`${result.id}\``,
    `\nSource: ${source}`,
    verbatim.length > 80 ? `\nContent: "${verbatim.slice(0, 80)}…"` : `\nContent: "${verbatim}"`,
  ].join("\n");
}

export async function linkSignal(signalId: string, projectId: string, confidence?: number): Promise<string> {
  return `To link signal \`${signalId}\` to project \`${projectId}\`, use the Elmer UI or run \`elmer_run_agent\` with the signals-processor agent.`;
}

interface SynthesizeResult {
  signals: ConvexSignal[];
  unlinked: ConvexSignal[];
  total: number;
  unlinkedCount: number;
}

export async function synthesizeSignals(): Promise<string> {
  const data = await mcpPost("/signals/synthesize", {}) as SynthesizeResult;

  const { signals, unlinked, total, unlinkedCount } = data;

  if (!signals?.length) {
    return "No signals found. Ingest signals first with `elmer_ingest_signal`.";
  }

  // Simple keyword clustering on verbatim text
  const stopWords = new Set(["the", "a", "an", "is", "it", "to", "for", "we", "i", "in", "of", "and", "that", "this", "on", "at", "be", "with", "are", "was", "were", "have", "has"]);

  const wordFreq: Record<string, { count: number; signals: string[] }> = {};
  for (const s of unlinked) {
    const words = s.verbatim.toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !stopWords.has(w));

    for (const word of words) {
      wordFreq[word] = wordFreq[word] ?? { count: 0, signals: [] };
      wordFreq[word].count++;
      if (!wordFreq[word].signals.includes(s._id)) {
        wordFreq[word].signals.push(s._id);
      }
    }
  }

  // Find top clusters (words that appear in 2+ signals)
  const clusters = Object.entries(wordFreq)
    .filter(([, v]) => v.count >= 2)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8);

  const lines: string[] = [
    `# Signal Map`,
    `**${total} total signals** · **${unlinkedCount} unlinked** · ${total - unlinkedCount} linked to projects\n`,
  ];

  if (clusters.length > 0) {
    lines.push(`## Theme Clusters (unlinked signals)\n`);
    for (const [word, data] of clusters) {
      const matchingSignals = unlinked
        .filter((s) => data.signals.includes(s._id))
        .slice(0, 3);
      lines.push(`### "${word}" (${data.count} signals)`);
      for (const s of matchingSignals) {
        lines.push(`- ${s.verbatim.slice(0, 80)}${s.verbatim.length > 80 ? "…" : ""}`);
        lines.push(`  ID: \`${s._id}\`  Source: ${s.source}`);
      }
      lines.push(`\n*Link these to a project: \`elmer_link_signal <id> <project_id>\`*\n`);
    }
  } else if (unlinked.length > 0) {
    lines.push(`## Unlinked Signals (${unlinked.length})\n`);
    for (const s of unlinked.slice(0, 10)) {
      lines.push(`- **${s.source}** — ${s.verbatim.slice(0, 90)}${s.verbatim.length > 90 ? "…" : ""}`);
      lines.push(`  ID: \`${s._id}\``);
    }
  } else {
    lines.push("✅ All signals are linked to projects.");
  }

  return lines.join("\n");
}
