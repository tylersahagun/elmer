export interface ParsedEdge {
  relationType: string;
  targetName: string;
}

function stripWrapping(value: string): string {
  return value
    .trim()
    .replace(/^["'`]|["'`]$/g, "")
    .trim();
}

function parseBracketArray(value: string): string[] {
  return value
    .slice(1, -1)
    .split(",")
    .map((entry) => stripWrapping(entry))
    .filter(Boolean);
}

export function parseFrontmatter(content: string): {
  meta: Record<string, unknown>;
  body: string;
} {
  const normalized = content.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };

  const meta: Record<string, unknown> = {};
  for (const line of match[1].split("\n")) {
    const [key, ...rest] = line.split(":");
    if (!key || !rest.length) continue;
    const raw = rest.join(":").trim();
    if (!raw.length) continue;

    if (raw.startsWith("[") && raw.endsWith("]")) {
      meta[key.trim()] = parseBracketArray(raw);
      continue;
    }

    meta[key.trim()] = stripWrapping(raw);
  }

  return { meta, body: match[2].trim() };
}

function readString(
  meta: Record<string, unknown>,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const value = meta[key];
    if (typeof value === "string" && value.trim().length) {
      return value.trim();
    }
  }
  return undefined;
}

function readStringArray(
  meta: Record<string, unknown>,
  keys: string[],
): string[] | undefined {
  for (const key of keys) {
    const value = meta[key];
    if (Array.isArray(value)) {
      const normalized = value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean);
      if (normalized.length) return normalized;
    }
    if (typeof value === "string") {
      const normalized = value
        .split(",")
        .map((entry) => stripWrapping(entry))
        .filter(Boolean);
      if (normalized.length) return normalized;
    }
  }
  return undefined;
}

export function buildDefinitionMetadata(
  meta: Record<string, unknown>,
  filePath: string,
  githubSha: string,
): Record<string, unknown> {
  return {
    filePath,
    githubSha,
    model: readString(meta, ["model"]),
    sourcePlugin: readString(meta, ["sourcePlugin", "source_plugin"]),
    sourceAsset: readString(meta, ["sourceAsset", "source_asset"]),
    delegationPattern: readString(meta, [
      "delegationPattern",
      "delegation_pattern",
    ]),
    importStrategy: readString(meta, ["importStrategy", "import_strategy"]),
    phase: readString(meta, ["phase"]),
    executionMode: readString(meta, ["executionMode", "execution_mode"]),
    requiredArtifacts: readStringArray(meta, [
      "requiredArtifacts",
      "required_artifacts",
    ]),
    producedArtifacts: readStringArray(meta, [
      "producedArtifacts",
      "produced_artifacts",
      "produces",
    ]),
  };
}

function parseArrowTargets(rawTargets: string): string[] {
  return rawTargets
    .split(",")
    .map((target) =>
      stripWrapping(
        target
          .replace(/^\s*-\s*/, "")
          .replace(/\.$/, "")
          .trim(),
      ),
    )
    .filter(Boolean);
}

/**
 * Extract graph relationships from agent/command/skill markdown content.
 * Supports both legacy prose patterns and explicit relation syntax:
 *   - reads_context -> a, b
 *   - uses_skill -> foo
 *   - produces -> x, y
 */
export function parseGraphEdges(
  content: string,
  meta: Record<string, unknown>,
): ParsedEdge[] {
  const edges: ParsedEdge[] = [];
  const seen = new Set<string>();

  const add = (relationType: string, targetName: string) => {
    const normalizedTarget = targetName.trim();
    if (!normalizedTarget.length) return;
    const key = `${relationType}:${normalizedTarget}`;
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({ relationType, targetName: normalizedTarget });
  };

  // Explicit relation syntax.
  for (const match of content.matchAll(
    /(?:^|\n)\s*[-*]?\s*(reads_context|uses_skill|produces|delegates_to|triggers)\s*->\s*([^\n]+)/gi,
  )) {
    const relationType = match[1].toLowerCase();
    const targets = parseArrowTargets(match[2]);
    for (const target of targets) add(relationType, target);
  }

  // delegates_to — legacy patterns.
  for (const pattern of [
    /[Dd]elegates?\s+to[:\s]+[`"]?([a-z][a-z0-9-]+)[`"]?/g,
    /\*\*[Dd]elegates?\s+to[:\s]*\*\*\s+[`"]?([a-z][a-z0-9-]+)[`"]?/g,
    /Subagent[:\s]+[`"]?([a-z][a-z0-9-]+)[`"]?/g,
  ]) {
    for (const match of content.matchAll(pattern)) {
      add("delegates_to", match[1]);
    }
  }

  // uses_skill — legacy patterns.
  for (const pattern of [
    /[Uu]ses?\s+skill[:\s]+[`"]?([a-z][a-z0-9-]+)[`"]?/g,
    /[Ss]kill[:\s]+[`"]?([a-z][a-z0-9-]+)[`"]?/g,
  ]) {
    for (const match of content.matchAll(pattern)) {
      add("uses_skill", match[1]);
    }
  }

  // reads_context paths.
  for (const match of content.matchAll(
    /@(?:elmer-docs|pm-workspace-docs)\/company-context\/([^\s\)]+)/g,
  )) {
    add("reads_context", match[1]);
  }
  for (const match of content.matchAll(
    /`(?:elmer-docs|pm-workspace-docs)\/company-context\/([^\s`]+)`/g,
  )) {
    add("reads_context", match[1]);
  }

  // produces from frontmatter metadata.
  const produced = readStringArray(meta, [
    "producedArtifacts",
    "produced_artifacts",
    "produces",
  ]);
  if (produced) {
    for (const artifact of produced) add("produces", artifact);
  }

  const humanGate = readString(meta, ["humanGate", "human_gate"]);
  if (humanGate) add("human_gate", humanGate);

  for (const match of content.matchAll(/[Ii]nvoke for\s+`?\/([a-z][a-z0-9-]+)`?/g)) {
    add("triggers", match[1]);
  }

  return edges;
}

export function relationTargetEntityType(relationType: string): string {
  switch (relationType) {
    case "delegates_to":
      return "subagent";
    case "uses_skill":
      return "skill";
    case "triggers":
      return "command";
    default:
      return "context";
  }
}
