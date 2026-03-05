/**
 * Codebase tool executors — GitHub API for file read/write/search.
 * Replaces shell commands (ls, rg, git) with GitHub API equivalents.
 *
 * Auth priority:
 *   1. GitHub App installation token (GITHUB_APP_ID + key + installation ID)
 *   2. Workspace-level githubToken override (for migration / per-workspace overrides)
 *   3. GITHUB_TOKEN env var (PAT — local dev fallback only)
 */

import type { ActionCtx } from "../_generated/server";
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { getGitHubHeaders as appGetGitHubHeaders } from "./githubAuth";

interface OctokitFileContent {
  type: string;
  name: string;
  path: string;
  content?: string;
  encoding?: string;
  sha?: string;
}

async function getGitHubHeaders(
  ctx: ActionCtx,
  workspaceId: Id<"workspaces">,
): Promise<Record<string, string>> {
  // Check for a workspace-level token override (useful during migration)
  const workspace = await ctx.runQuery(api.workspaces.get, { workspaceId });
  const settings = workspace?.settings as Record<string, unknown> | undefined;
  const overrideToken = settings?.githubToken as string | undefined;

  // Delegate to github-auth: App token if configured, PAT fallback otherwise
  return appGetGitHubHeaders(overrideToken);
}

function getRepoCoords(workspace: {
  githubRepo?: string | null;
}): { owner: string; repo: string } {
  const repoStr = workspace.githubRepo;
  if (!repoStr) throw new Error("Workspace GitHub repo not configured");
  const [owner, repo] = repoStr.split("/");
  if (!owner || !repo) throw new Error(`Invalid repo format: ${repoStr}`);
  return { owner, repo };
}

async function readGitHubFile(
  headers: Record<string, string>,
  owner: string,
  repo: string,
  path: string,
  ref = "main",
): Promise<string> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GitHub read error ${res.status}: ${path}`);
  const data = (await res.json()) as OctokitFileContent;
  if (!data.content) throw new Error(`File has no content: ${path}`);
  return atob(data.content.replace(/\n/g, ""));
}

async function writeGitHubFile(
  headers: Record<string, string>,
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  branch = "main",
): Promise<{ sha: string; url: string }> {
  // Get current file SHA if it exists (needed for updates)
  let sha: string | undefined;
  try {
    const existingRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      { headers },
    );
    if (existingRes.ok) {
      const existing = (await existingRes.json()) as OctokitFileContent;
      sha = existing.sha;
    }
  } catch {
    // File doesn't exist yet — that's fine
  }

  const body: Record<string, unknown> = {
    message,
    content: btoa(unescape(encodeURIComponent(content))),
    branch,
  };
  if (sha) body.sha = sha;

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub write error ${res.status}: ${text}`);
  }
  const data = (await res.json()) as { commit: { sha: string; html_url: string } };
  return { sha: data.commit.sha, url: data.commit.html_url };
}

export function buildCodebaseTools(
  ctx: ActionCtx,
  workspaceId: Id<"workspaces">,
) {
  return {
    read_file: {
      description: "Read a file from the connected GitHub repository",
      inputSchema: {
        type: "object" as const,
        properties: {
          path: { type: "string", description: "Repo-relative path" },
          repo: {
            type: "string",
            description: "owner/repo — defaults to workspace repo",
          },
          ref: { type: "string", description: "Branch or commit SHA (default: main)" },
        },
        required: ["path"],
      },
      execute: async (args: Record<string, unknown>) => {
        try {
          const headers = await getGitHubHeaders(ctx, workspaceId);
          let owner: string, repo: string;
          if (args.repo) {
            [owner, repo] = (args.repo as string).split("/");
          } else {
            const workspace = await ctx.runQuery(api.workspaces.get, { workspaceId });
            ({ owner, repo } = getRepoCoords(workspace!));
          }
          const content = await readGitHubFile(
            headers, owner, repo,
            args.path as string,
            (args.ref as string) ?? "main",
          );
          return { content, path: args.path };
        } catch (e) {
          return { error: e instanceof Error ? e.message : String(e) };
        }
      },
    },

    write_file: {
      description: "Commit a file to the connected GitHub repository",
      inputSchema: {
        type: "object" as const,
        properties: {
          path: { type: "string" },
          content: { type: "string" },
          message: { type: "string", description: "Commit message" },
          repo: { type: "string", description: "owner/repo — defaults to workspace repo" },
          branch: { type: "string", description: "Target branch (default: main)" },
        },
        required: ["path", "content", "message"],
      },
      execute: async (args: Record<string, unknown>) => {
        try {
          const headers = await getGitHubHeaders(ctx, workspaceId);
          let owner: string, repo: string;
          if (args.repo) {
            [owner, repo] = (args.repo as string).split("/");
          } else {
            const workspace = await ctx.runQuery(api.workspaces.get, { workspaceId });
            ({ owner, repo } = getRepoCoords(workspace!));
          }
          const result = await writeGitHubFile(
            headers, owner, repo,
            args.path as string,
            args.content as string,
            args.message as string,
            (args.branch as string) ?? "main",
          );
          return { ...result, path: args.path };
        } catch (e) {
          return { error: e instanceof Error ? e.message : String(e) };
        }
      },
    },

    list_directory: {
      description: "List files in a directory of the GitHub repository",
      inputSchema: {
        type: "object" as const,
        properties: {
          path: { type: "string", description: "Directory path" },
          repo: { type: "string", description: "owner/repo — defaults to workspace repo" },
        },
        required: ["path"],
      },
      execute: async (args: Record<string, unknown>) => {
        try {
          const headers = await getGitHubHeaders(ctx, workspaceId);
          let owner: string, repo: string;
          if (args.repo) {
            [owner, repo] = (args.repo as string).split("/");
          } else {
            const workspace = await ctx.runQuery(api.workspaces.get, { workspaceId });
            ({ owner, repo } = getRepoCoords(workspace!));
          }
          const res = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/${args.path}`,
            { headers },
          );
          if (!res.ok) return { error: `GitHub list error ${res.status}` };
          const items = (await res.json()) as OctokitFileContent[];
          return { files: items.map((f) => ({ name: f.name, path: f.path, type: f.type })) };
        } catch (e) {
          return { error: e instanceof Error ? e.message : String(e) };
        }
      },
    },

    search_code: {
      description: "Search code in a GitHub repository (like rg/grep)",
      inputSchema: {
        type: "object" as const,
        properties: {
          query: { type: "string", description: "Search query" },
          repo: { type: "string", description: "owner/repo to search in" },
          path: { type: "string", description: "Limit to this path prefix" },
        },
        required: ["query"],
      },
      execute: async (args: Record<string, unknown>) => {
        try {
          const headers = await getGitHubHeaders(ctx, workspaceId);
          let repoStr = args.repo as string | undefined;
          if (!repoStr) {
            const workspace = await ctx.runQuery(api.workspaces.get, { workspaceId });
            repoStr = workspace?.githubRepo ?? undefined;
          }

          let q = `${args.query} repo:${repoStr}`;
          if (args.path) q += ` path:${args.path}`;

          const res = await fetch(
            `https://api.github.com/search/code?q=${encodeURIComponent(q)}&per_page=10`,
            { headers },
          );
          if (!res.ok) return { error: `GitHub search error ${res.status}` };
          const data = await res.json() as { items: Array<{ path: string; html_url: string }> };
          return { results: data.items.map((i) => ({ path: i.path, url: i.html_url })) };
        } catch (e) {
          return { error: e instanceof Error ? e.message : String(e) };
        }
      },
    },
  };
}
