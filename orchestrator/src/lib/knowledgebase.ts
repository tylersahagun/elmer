import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { KnowledgebaseType } from "@/lib/db/schema";

const DEFAULT_TYPE_FILES: Record<KnowledgebaseType, string> = {
  company_context: "company-context/product-vision.md",
  strategic_guardrails: "company-context/strategic-guardrails.md",
  personas: "company-context/personas.md",
  roadmap: "roadmap/roadmap.md",
  rules: ".cursor/rules/command-router.mdc",
};

function getRepoRoot() {
  return path.resolve(process.cwd(), "..");
}

function resolveWithinRepo(targetPath: string) {
  const repoRoot = getRepoRoot();
  const resolved = path.resolve(repoRoot, targetPath);
  if (!resolved.startsWith(repoRoot)) {
    throw new Error("Resolved path is outside of workspace root");
  }
  return resolved;
}

export function resolveKnowledgePath(
  contextRoot: string,
  type: KnowledgebaseType,
  filePath?: string
) {
  const repoRoot = getRepoRoot();
  const normalizedRoot = contextRoot?.trim() || "elmer-docs/";
  const contextAbsolute = path.isAbsolute(normalizedRoot)
    ? normalizedRoot
    : path.join(repoRoot, normalizedRoot);

  const target = filePath?.trim() || DEFAULT_TYPE_FILES[type];
  if (!target) {
    throw new Error(`Unknown knowledgebase type: ${type}`);
  }

  const resolved = path.isAbsolute(target)
    ? target
    : target.startsWith(".cursor/")
      ? path.join(repoRoot, target)
      : path.join(contextAbsolute, target);

  return resolveWithinRepo(path.relative(repoRoot, resolved));
}

export async function readKnowledgeFile(filePath: string) {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return "";
    }
    throw error;
  }
}

export async function writeKnowledgeFile(filePath: string, content: string) {
  const dir = path.dirname(filePath);
  await mkdir(dir, { recursive: true });
  await writeFile(filePath, content, "utf8");
}
