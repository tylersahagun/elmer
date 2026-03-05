import { mcpGet, mcpPost } from "../convex-client.js";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ConvexVariant {
  _id: string;
  _creationTime: number;
  projectId: string;
  title: string;
  platform: string;
  outputType: string;
  status: string;
  url?: string | null;
  chromaticUrl?: string | null;
  slackMessageTs?: string | null;
  parentVariantId?: string | null;
  iterationCount?: number | null;
  promotedToStorybook?: boolean | null;
}

interface ConvexSignalFeedback {
  _id: string;
  verbatim: string;
  interpretation?: string | null;
  severity?: string | null;
  source: string;
  status: string;
}

// ── Tool implementations ──────────────────────────────────────────────────────

export async function listPrototypeVariants(projectId: string): Promise<string> {
  const variants = await mcpGet("/prototypes", { projectId }) as ConvexVariant[];
  if (!variants?.length) {
    return `No prototype variants found for project \`${projectId}\`.\n\nCreate one by running \`elmer_run_agent\` with the prototype-builder agent, or register an existing Chromatic URL via the Elmer UI.`;
  }

  const lines: string[] = [`# Prototype Variants (${variants.length})\n`];
  for (const v of variants) {
    const iterLabel = (v.iterationCount ?? 0) > 0 ? ` · v${v.iterationCount}` : "";
    const parentLabel = v.parentVariantId ? ` (iterated from \`${v.parentVariantId}\`)` : "";
    const urlLine = v.chromaticUrl ?? v.url;
    lines.push(`## ${v.title}${iterLabel}`);
    lines.push(`**Status:** ${v.status}  **Platform:** ${v.platform}${parentLabel}`);
    lines.push(`**ID:** \`${v._id}\``);
    if (urlLine) lines.push(`**URL:** ${urlLine}`);
    if (v.slackMessageTs) lines.push(`**Slack Thread:** \`${v.slackMessageTs}\` ← replies available`);
    lines.push("");
  }

  lines.push(`\n*To get feedback for a variant: \`elmer_get_prototype_feedback { variant_id: "<id>" }\`*`);
  return lines.join("\n");
}

export async function postPrototype(variantId: string): Promise<string> {
  const variant = await mcpGet("/prototypes", { variantId }) as ConvexVariant | null;
  if (!variant) return `Variant not found: \`${variantId}\``;

  if (!variant.chromaticUrl && !variant.url) {
    return [
      `❌ Variant \`${variantId}\` has no URL to share.`,
      `Set \`chromaticUrl\` or \`url\` on the variant in the Elmer UI first.`,
    ].join("\n");
  }

  await mcpPost("/prototypes/post-to-slack", { variantId });

  return [
    `✅ Posting **${variant.title}** to the project's linked Slack channel...`,
    ``,
    `The message will appear shortly. Once customers reply, ingest their feedback with:`,
    `\`elmer_get_prototype_feedback { variant_id: "${variantId}" }\``,
    ``,
    `ID: \`${variantId}\``,
    variant.chromaticUrl ? `Chromatic URL: ${variant.chromaticUrl}` : `URL: ${variant.url}`,
  ].join("\n");
}

export async function getPrototypeFeedback(variantId: string): Promise<string> {
  const [variant, feedback] = await Promise.all([
    mcpGet("/prototypes", { variantId }) as Promise<ConvexVariant | null>,
    mcpGet("/prototypes/feedback", { variantId }) as Promise<ConvexSignalFeedback[]>,
  ]);

  if (!variant) return `Variant not found: \`${variantId}\``;

  const lines: string[] = [
    `# Feedback — ${variant.title}`,
    `**Variant:** \`${variantId}\`  **Iteration:** ${variant.iterationCount ?? 0}`,
    variant.slackMessageTs
      ? `**Slack Thread:** \`${variant.slackMessageTs}\` (replies ingested as signals)`
      : `**Slack Thread:** Not yet posted`,
    ``,
  ];

  if (!feedback?.length) {
    lines.push(`*No feedback signals ingested yet.*`);
    if (variant.slackMessageTs) {
      lines.push(`\nThe prototype has been posted to Slack but no replies have been ingested yet.`);
      lines.push(`Run \`elmer_ingest_signal\` or wait for auto-ingestion from the Slack webhook.`);
    } else {
      lines.push(`\nPost the prototype to Slack first: \`elmer_post_prototype { variant_id: "${variantId}" }\``);
    }
  } else {
    lines.push(`## ${feedback.length} Signal${feedback.length === 1 ? "" : "s"} Received\n`);
    for (const s of feedback) {
      const sev = s.severity ? ` [${s.severity}]` : "";
      lines.push(`- ${s.verbatim.slice(0, 150)}${s.verbatim.length > 150 ? "…" : ""}${sev}`);
      lines.push(`  ID: \`${s._id}\`  Source: ${s.source}`);
    }
    lines.push(``);
    lines.push(`*Ready to iterate? Run \`elmer_iterate_prototype { variant_id: "${variantId}" }\`*`);
  }

  return lines.join("\n");
}

export async function iteratePrototype(
  variantId: string,
  instructions?: string,
): Promise<string> {
  const variant = await mcpGet("/prototypes", { variantId }) as ConvexVariant | null;
  if (!variant) return `Variant not found: \`${variantId}\``;

  const feedback = await mcpGet("/prototypes/feedback", { variantId }) as ConvexSignalFeedback[];

  if (!feedback?.length && !instructions) {
    return [
      `❌ No feedback signals found for **${variant.title}**.`,
      ``,
      `Either:`,
      `1. Ingest feedback first: post to Slack with \`elmer_post_prototype\`, then wait for replies`,
      `2. Provide explicit \`instructions\` to iterate without feedback`,
    ].join("\n");
  }

  const feedbackSummary = feedback?.length
    ? `\n\n**Feedback signals:** ${feedback.length}`
    : "\n\n**No feedback — iterating from instructions only.**";

  await mcpPost("/prototypes/iterate", { variantId, instructions });

  const nextIteration = (variant.iterationCount ?? 0) + 1;
  return [
    `✅ Iteration v${nextIteration} queued for **${variant.title}**.`,
    feedbackSummary,
    instructions ? `\n**Instructions:** ${instructions}` : "",
    ``,
    `Elmer will:`,
    `1. Synthesize feedback against the project's research doc`,
    `2. Generate a builder brief with the 3 most important changes`,
    `3. Queue a prototype-builder job`,
    `4. Store the synthesis as a project memory entry`,
    ``,
    `Track progress with \`elmer_list_jobs { status: "running" }\``,
    ``,
    `Parent variant: \`${variantId}\``,
  ].filter((l) => l !== "").join("\n");
}
