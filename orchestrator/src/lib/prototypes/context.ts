import { readdir } from "node:fs/promises";
import path from "node:path";

export async function getRepoComponentList(repoRoot: string) {
  const componentsDir = path.join(repoRoot, "src", "components");
  try {
    const entries = await readdir(componentsDir, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }
}
