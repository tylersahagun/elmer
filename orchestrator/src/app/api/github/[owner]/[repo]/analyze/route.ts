import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { auth } from "@/auth";
import { getGitHubClient } from "@/lib/github/auth";

type RouteContext = {
  params: Promise<{ owner: string; repo: string }>;
};

type RepoEntry = {
  name: string;
  path: string;
  type: "file" | "dir" | "symlink" | "submodule";
};

async function listDir(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string,
  ref?: string,
): Promise<RepoEntry[]> {
  const { data } = await octokit.repos.getContent({ owner, repo, path, ref });
  if (!Array.isArray(data)) {
    return [];
  }
  return data.map((item) => ({
    name: item.name,
    path: item.path,
    type: item.type as RepoEntry["type"],
  }));
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { owner: ownerParam, repo: repoParam } = await params;
    const body = await request.json().catch(() => ({}));
    const url = new URL(request.url);
    const owner =
      ownerParam || body?.owner || url.searchParams.get("owner") || "";
    const repo = repoParam || body?.repo || url.searchParams.get("repo") || "";
    const ref = body?.ref as string | undefined;

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Owner and repo are required" },
        { status: 400 },
      );
    }

    const octokit = await getGitHubClient(session.user.id);
    if (!octokit) {
      return NextResponse.json(
        {
          error: "GitHub not connected",
          connectUrl: "/api/auth/signin/github",
        },
        { status: 403 },
      );
    }

    let rootEntries: RepoEntry[] = [];
    try {
      rootEntries = await listDir(octokit, owner, repo, "", ref);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to read repository root";
      return NextResponse.json({ error: message }, { status: 500 });
    }
    const rootNames = new Set(rootEntries.map((item) => item.name));

    const hasAgentsMd = rootNames.has("AGENTS.md");
    const hasCursorDir = rootEntries.some(
      (item) => item.name === ".cursor" && item.type === "dir",
    );

    let cursorEntries: RepoEntry[] = [];
    if (hasCursorDir) {
      try {
        cursorEntries = await listDir(octokit, owner, repo, ".cursor", ref);
      } catch (error) {
        cursorEntries = [];
      }
    }
    const cursorNames = new Set(cursorEntries.map((item) => item.name));

    const knowledgeCandidates = [
      "pm-workspace-docs",
      "elmer-docs",
      "docs",
      "documentation",
      ".planning",
    ];
    const knowledgePaths = rootEntries
      .filter(
        (item) =>
          item.type === "dir" && knowledgeCandidates.includes(item.name),
      )
      .map((item) => `${item.name}/`);

    const personaPaths: string[] = [];
    for (const knowledgePath of knowledgePaths) {
      try {
        const entries = await listDir(
          octokit,
          owner,
          repo,
          knowledgePath.replace(/\/$/, ""),
          ref,
        );
        if (
          entries.some(
            (entry) => entry.name === "personas" && entry.type === "dir",
          )
        ) {
          personaPaths.push(`${knowledgePath}personas/`);
        }
      } catch (error) {
        continue;
      }
    }

    return NextResponse.json({
      hasAgentsMd,
      cursor: {
        present: hasCursorDir,
        hasSkills: cursorNames.has("skills"),
        hasCommands: cursorNames.has("commands"),
        hasAgents: cursorNames.has("agents"),
        hasRules: cursorNames.has("rules"),
      },
      knowledgePaths,
      personaPaths,
    });
  } catch (error) {
    console.error("GitHub analyze error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to analyze repo",
      },
      { status: 500 },
    );
  }
}
