import { exec as execCallback } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execCallback);
const repoLocks = new Map<string, Promise<void>>();

async function withRepoLock<T>(repoRoot: string, fn: () => Promise<T>): Promise<T> {
  const previous = repoLocks.get(repoRoot) || Promise.resolve();
  let release: () => void;
  const next = new Promise<void>((resolve) => {
    release = resolve;
  });
  repoLocks.set(repoRoot, previous.then(() => next));
  await previous;
  try {
    return await fn();
  } finally {
    release!();
    if (repoLocks.get(repoRoot) === next) {
      repoLocks.delete(repoRoot);
    }
  }
}

const sanitizeBranchPart = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function branchExists(repoRoot: string, branch: string) {
  const local = await exec(`git branch --list ${branch}`, { cwd: repoRoot });
  if (local.stdout.trim()) return true;
  const remote = await exec(`git ls-remote --heads origin ${branch}`, { cwd: repoRoot });
  return remote.stdout.trim().length > 0;
}

async function ensureBaseBranch(repoRoot: string, baseBranch: string) {
  await exec(`git fetch origin ${baseBranch}`, { cwd: repoRoot });
  await exec(`git checkout ${baseBranch}`, { cwd: repoRoot });
  await exec(`git pull origin ${baseBranch}`, { cwd: repoRoot });
}

export async function createFeatureBranch(options: {
  repoRoot: string;
  baseBranch: string;
  preferredBranch: string;
}) {
  return withRepoLock(options.repoRoot, async () => {
    const { repoRoot, baseBranch, preferredBranch } = options;
    await ensureBaseBranch(repoRoot, baseBranch);

    let branch = preferredBranch;
    if (await branchExists(repoRoot, branch)) {
      let counter = 2;
      while (await branchExists(repoRoot, `${branch}-${counter}`)) {
        counter += 1;
      }
      branch = `${branch}-${counter}`;
    }

    await exec(`git checkout -b ${branch}`, { cwd: repoRoot });
    await exec(`git push -u origin ${branch}`, { cwd: repoRoot });
    return branch;
  });
}

export function buildFeatureBranchName(projectName: string) {
  const slug = sanitizeBranchPart(projectName);
  if (!slug) return "feature/project";
  return `feature/${slug}`;
}

export async function commitAndPushChanges(options: {
  repoRoot: string;
  branch: string;
  message: string;
}) {
  return withRepoLock(options.repoRoot, async () => {
    const { repoRoot, branch, message } = options;
    const status = await exec("git status --porcelain", { cwd: repoRoot });
    if (!status.stdout.trim()) return { committed: false };

    await exec(`git checkout ${branch}`, { cwd: repoRoot });
    await exec("git add -A", { cwd: repoRoot });
    await exec(`git commit -m "${message.replace(/"/g, '\\"')}"`, { cwd: repoRoot });
    await exec(`git push origin ${branch}`, { cwd: repoRoot });
    return { committed: true };
  });
}

// ============================================
// GSD-INSPIRED ATOMIC TASK COMMITS
// ============================================

export interface AtomicCommitOptions {
  repoRoot: string;
  branch: string;
  taskName: string;
  stage: string;
  projectName: string;
  filesChanged?: string[];
}

export interface AtomicCommitResult {
  committed: boolean;
  commitHash?: string;
  message: string;
}

/**
 * Commit a single task completion with a conventional commit message.
 * Used for GSD-style atomic commits after each task verification passes.
 * 
 * Commit format: feat(<stage>): <taskName> - <projectName>
 * Example: feat(prd): Generate PRD - User Onboarding
 */
export async function commitTask(options: AtomicCommitOptions): Promise<AtomicCommitResult> {
  const { repoRoot, branch, taskName, stage, projectName, filesChanged } = options;
  
  // Build conventional commit message
  const scope = sanitizeBranchPart(stage);
  const sanitizedTask = taskName.replace(/"/g, "'");
  const sanitizedProject = projectName.replace(/"/g, "'");
  const message = `feat(${scope}): ${sanitizedTask} - ${sanitizedProject}`;
  
  // Build commit body with files changed (if provided)
  const body = filesChanged?.length
    ? `\n\nFiles changed:\n${filesChanged.map((f) => `- ${f}`).join("\n")}`
    : "";
  
  return withRepoLock(repoRoot, async () => {
    try {
      // Check if there are any changes
      const status = await exec("git status --porcelain", { cwd: repoRoot });
      if (!status.stdout.trim()) {
        return { committed: false, message };
      }
      
      // Ensure we're on the correct branch
      await exec(`git checkout ${branch}`, { cwd: repoRoot });
      
      // Stage files
      if (filesChanged?.length) {
        // Stage only specific files if provided
        for (const file of filesChanged) {
          try {
            await exec(`git add "${file}"`, { cwd: repoRoot });
          } catch {
            // File might not exist or be untracked, continue
          }
        }
      } else {
        // Stage all changes
        await exec("git add -A", { cwd: repoRoot });
      }
      
      // Check if anything is staged
      const stagedStatus = await exec("git diff --cached --name-only", { cwd: repoRoot });
      if (!stagedStatus.stdout.trim()) {
        return { committed: false, message };
      }
      
      // Commit with message and optional body
      const fullMessage = `${message}${body}`.replace(/"/g, '\\"');
      await exec(`git commit -m "${fullMessage}"`, { cwd: repoRoot });
      
      // Get the commit hash
      const hashResult = await exec("git rev-parse --short HEAD", { cwd: repoRoot });
      const commitHash = hashResult.stdout.trim();
      
      // Push to remote
      await exec(`git push origin ${branch}`, { cwd: repoRoot });
      
      return { committed: true, commitHash, message };
    } catch (error) {
      // If commit fails, try to get error message
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Atomic commit failed:", errorMessage);
      return { committed: false, message };
    }
  });
}

/**
 * Check if there are uncommitted changes in the repo
 */
export async function hasUncommittedChanges(repoRoot: string): Promise<boolean> {
  try {
    const status = await exec("git status --porcelain", { cwd: repoRoot });
    return status.stdout.trim().length > 0;
  } catch {
    return false;
  }
}

/**
 * Get the current branch name
 */
export async function getCurrentBranch(repoRoot: string): Promise<string | null> {
  try {
    const result = await exec("git rev-parse --abbrev-ref HEAD", { cwd: repoRoot });
    return result.stdout.trim();
  } catch {
    return null;
  }
}
