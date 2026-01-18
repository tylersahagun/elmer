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
