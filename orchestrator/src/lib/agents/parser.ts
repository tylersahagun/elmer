export interface ParsedAgentArchitecture {
  agents: AgentDefinition[];
  skills: SkillDefinition[];
  commands: CommandDefinition[];
  subagents: SubagentDefinition[];
  rules: RuleDefinition[];
  knowledgePaths: string[];
  personaPaths: string[];
}

export interface AgentDefinition {
  name: string;
  description?: string;
  content: string;
}

export interface SkillDefinition {
  name: string;
  description?: string;
  triggers: string[];
  workflow: string[];
  templates: string[];
  outputPaths: string[];
  content: string;
  sourceFile: string;
}

export interface CommandDefinition {
  name: string;
  description: string;
  usage?: string;
  delegatesTo?: { type: "subagent" | "skill" | "direct"; name?: string };
  steps: string[];
  prerequisites?: string[];
  sourceFile: string;
}

export interface SubagentDefinition {
  name: string;
  description?: string;
  model: "inherit" | "fast";
  readonly: boolean;
  contextFiles: string[];
  outputPaths: string[];
  content: string;
  sourceFile: string;
}

export interface RuleDefinition {
  description?: string;
  globs?: string[];
  alwaysApply?: boolean;
  content: string;
  sourceFile: string;
}

function extractFrontmatter(content: string): { frontmatter: Record<string, string>; body: string } {
  if (!content.startsWith("---")) {
    return { frontmatter: {}, body: content };
  }

  const endIndex = content.indexOf("\n---", 3);
  if (endIndex === -1) {
    return { frontmatter: {}, body: content };
  }

  const raw = content.slice(3, endIndex).trim();
  const body = content.slice(endIndex + 4).trim();
  const frontmatter: Record<string, string> = {};

  for (const line of raw.split("\n")) {
    const [key, ...rest] = line.split(":");
    if (!key) continue;
    frontmatter[key.trim()] = rest.join(":").trim();
  }

  return { frontmatter, body };
}

function extractSection(content: string, heading: string): string {
  const regex = new RegExp(`^##\\s+${heading}\\s*$`, "im");
  const match = content.match(regex);
  if (!match || match.index === undefined) return "";
  const start = match.index + match[0].length;
  const rest = content.slice(start);
  const nextHeading = rest.search(/^##\s+/m);
  const section = nextHeading === -1 ? rest : rest.slice(0, nextHeading);
  return section.trim();
}

function extractBullets(section: string): string[] {
  return section
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.replace(/^- /, "").trim());
}

function extractCodeBlocks(content: string): string[] {
  const blocks: string[] = [];
  const regex = /```[\s\S]*?```/g;
  const matches = content.match(regex) || [];
  for (const block of matches) {
    blocks.push(block);
  }
  return blocks;
}

function extractPathReferences(content: string): string[] {
  const paths = new Set<string>();
  const regex = /`([^`]+\/[^`]+)`/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    paths.add(match[1]);
  }
  return Array.from(paths);
}

function extractContextFiles(content: string): string[] {
  const matches = content.match(/@[\w\-./]+/g) || [];
  return Array.from(new Set(matches));
}

export function parseSkill(content: string, sourceFile: string): SkillDefinition {
  const { frontmatter, body } = extractFrontmatter(content);
  const triggers = extractBullets(extractSection(body, "When to Use"));
  const workflow = extractBullets(extractSection(body, "Workflow"));
  const templates = extractCodeBlocks(body);
  const outputPaths = extractPathReferences(body);

  return {
    name: frontmatter.name || sourceFile,
    description: frontmatter.description,
    triggers,
    workflow,
    templates,
    outputPaths,
    content: content.trim(),
    sourceFile,
  };
}

export function parseSubagent(content: string, sourceFile: string): SubagentDefinition {
  const { frontmatter, body } = extractFrontmatter(content);
  const contextFiles = extractContextFiles(body);
  const outputPaths = extractPathReferences(body);

  return {
    name: frontmatter.name || sourceFile,
    description: frontmatter.description,
    model: (frontmatter.model as "inherit" | "fast") || "inherit",
    readonly: frontmatter.readonly === "true",
    contextFiles,
    outputPaths,
    content: content.trim(),
    sourceFile,
  };
}

export function parseCommand(content: string, sourceFile: string): CommandDefinition {
  const lines = content.split("\n").map((line) => line.trim());
  const title = lines.find((line) => line.startsWith("# "));
  const name = title ? title.replace(/^#\s*/, "").trim() : sourceFile;

  const delegatesMatch = content.match(/\*\*Delegates to\*\*:\s+([^\n]+)/i);
  const usesMatch = content.match(/\*\*Uses\*\*:\s+([^\n]+)/i);

  let delegatesTo: CommandDefinition["delegatesTo"];
  if (delegatesMatch) {
    delegatesTo = { type: "subagent", name: delegatesMatch[1].trim() };
  } else if (usesMatch) {
    delegatesTo = { type: "skill", name: usesMatch[1].trim() };
  } else {
    delegatesTo = { type: "direct" };
  }

  const description =
    lines.find((line) => line && !line.startsWith("#")) || "";

  const usageSection = extractSection(content, "Usage");
  const usageLine = usageSection.split("\n").find((line) => line.includes("`"));

  const behaviorSection = extractSection(content, "Behavior");
  const steps = extractBullets(behaviorSection);

  const prerequisitesSection = extractSection(content, "Prerequisites");
  const prerequisites = prerequisitesSection ? extractBullets(prerequisitesSection) : undefined;

  return {
    name,
    description,
    usage: usageLine?.replace(/`/g, "").trim(),
    delegatesTo,
    steps,
    prerequisites,
    sourceFile,
  };
}

export function parseRule(content: string, sourceFile: string): RuleDefinition {
  const { frontmatter } = extractFrontmatter(content);
  const globs = frontmatter.globs ? frontmatter.globs.replace(/[[\]]/g, "").split(",").map((g) => g.trim()).filter(Boolean) : undefined;
  return {
    description: frontmatter.description,
    globs,
    alwaysApply: frontmatter.alwaysApply === "true",
    content: content.trim(),
    sourceFile,
  };
}
