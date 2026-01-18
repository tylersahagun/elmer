import path from "node:path";
import { readFile, mkdir, writeFile } from "node:fs/promises";

const defaultMap: Record<string, string> = {
  company_context: "company-context/product-vision.md",
  strategic_guardrails: "company-context/strategic-guardrails.md",
  personas: "company-context/personas.md",
  roadmap: "roadmap/roadmap.md",
  rules: "company-context/workspace-rules.md",
};

export function resolveKnowledgePath(contextRoot: string, type: string, filePath?: string) {
  const relative = filePath || defaultMap[type] || `knowledge/${type}.md`;
  return path.isAbsolute(relative) ? relative : path.join(contextRoot, relative);
}

export async function readKnowledgeFile(filePath: string) {
  try {
    return await readFile(filePath, "utf8");
  } catch {
    return "";
  }
}

export async function writeKnowledgeFile(filePath: string, content: string) {
  const dir = path.dirname(filePath);
  await mkdir(dir, { recursive: true });
  await writeFile(filePath, content, "utf8");
}
