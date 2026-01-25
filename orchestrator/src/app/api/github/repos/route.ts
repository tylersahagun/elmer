/**
 * GitHub Repos API
 * 
 * Lists repositories accessible to the authenticated user via their GitHub OAuth connection.
 */

import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { auth } from "@/auth";
import { getGitHubToken } from "@/lib/github/auth";

interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  private: boolean;
  url: string;
  cloneUrl: string;
  defaultBranch: string;
  pushedAt: string | null;
  owner: {
    login: string;
    avatarUrl: string;
  };
}

import { Octokit } from "@octokit/rest";

/**
 * GET /api/github/repos
 * 
 * Query parameters:
 * - search: Filter repos by name (optional)
 * - sort: Sort by "updated", "pushed", "full_name" (default: "pushed")
 * - per_page: Number of results (default: 30, max: 100)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const token = await getGitHubToken(session.user.id);
    
    if (!token) {
      return NextResponse.json(
        { 
          error: "GitHub not connected",
          message: "Please connect your GitHub account to access repositories",
          connectUrl: "/api/auth/signin/github"
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const sort = (searchParams.get("sort") || "pushed") as "updated" | "pushed" | "full_name";
    const perPage = Math.min(parseInt(searchParams.get("per_page") || "30"), 100);

    const octokit = new Octokit({ auth: token });

    // List repositories for the authenticated user
    const { data: repos } = await octokit.repos.listForAuthenticatedUser({
      sort: sort === "full_name" ? "full_name" : sort,
      direction: sort === "full_name" ? "asc" : "desc",
      per_page: perPage,
      affiliation: "owner,collaborator,organization_member",
    });

    // Filter by search term if provided
    let filteredRepos = repos;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredRepos = repos.filter(
        (repo) =>
          repo.name.toLowerCase().includes(searchLower) ||
          repo.full_name.toLowerCase().includes(searchLower) ||
          repo.description?.toLowerCase().includes(searchLower)
      );
    }

    // Map to simpler structure
    const result: GitHubRepo[] = filteredRepos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      private: repo.private,
      url: repo.html_url,
      cloneUrl: repo.clone_url,
      defaultBranch: repo.default_branch,
      pushedAt: repo.pushed_at,
      owner: {
        login: repo.owner?.login || "",
        avatarUrl: repo.owner?.avatar_url || "",
      },
    }));

    return NextResponse.json({
      repos: result,
      total: result.length,
      connected: true,
    });
  } catch (error) {
    console.error("GitHub repos error:", error);
    
    // Check for token expiration or invalid token
    if (error instanceof Error && error.message.includes("Bad credentials")) {
      return NextResponse.json(
        { 
          error: "GitHub token expired",
          message: "Please reconnect your GitHub account",
          connectUrl: "/api/auth/signin/github"
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch repos" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/github/repos/[owner]/[repo]
 * Get details about a specific repository
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const token = await getGitHubToken(session.user.id);
    
    if (!token) {
      return NextResponse.json(
        { error: "GitHub not connected" },
        { status: 403 }
      );
    }

    const { owner, repo } = await request.json();

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Owner and repo are required" },
        { status: 400 }
      );
    }

    const octokit = new Octokit({ auth: token });

    // Get repo details
    const { data: repoData } = await octokit.repos.get({
      owner,
      repo,
    });

    // Try to get repository contents to detect context paths
    let detectedPaths: { type: string; path: string }[] = [];
    try {
      const { data: contents } = await octokit.repos.getContent({
        owner,
        repo,
        path: "",
      });

      if (Array.isArray(contents)) {
        // Look for common context paths
        const contextDirs = ["elmer-docs", "docs", "documentation", ".planning"];
        const prototypesDirs = ["prototypes", "src/components/prototypes", "packages/prototypes"];
        
        for (const item of contents) {
          if (item.type === "dir") {
            if (contextDirs.includes(item.name.toLowerCase())) {
              detectedPaths.push({ type: "context", path: `${item.name}/` });
            }
            if (prototypesDirs.some((p) => p.startsWith(item.name))) {
              detectedPaths.push({ type: "prototypes", path: `${item.name}/` });
            }
          }
        }

        // Also check src/ for prototypes
        if (contents.some((c) => c.name === "src" && c.type === "dir")) {
          try {
            const { data: srcContents } = await octokit.repos.getContent({
              owner,
              repo,
              path: "src",
            });
            if (Array.isArray(srcContents)) {
              if (srcContents.some((c) => c.name === "components")) {
                const { data: componentsContents } = await octokit.repos.getContent({
                  owner,
                  repo,
                  path: "src/components",
                });
                if (Array.isArray(componentsContents) && componentsContents.some((c) => c.name === "prototypes")) {
                  detectedPaths.push({ type: "prototypes", path: "src/components/prototypes/" });
                }
              }
            }
          } catch {
            // Ignore errors when checking nested paths
          }
        }
      }
    } catch {
      // Ignore errors when detecting paths
    }

    return NextResponse.json({
      repo: {
        id: repoData.id,
        name: repoData.name,
        fullName: repoData.full_name,
        description: repoData.description,
        private: repoData.private,
        url: repoData.html_url,
        cloneUrl: repoData.clone_url,
        sshUrl: repoData.ssh_url,
        defaultBranch: repoData.default_branch,
        owner: {
          login: repoData.owner?.login || "",
          avatarUrl: repoData.owner?.avatar_url || "",
        },
      },
      detectedPaths,
    });
  } catch (error) {
    console.error("GitHub repo details error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch repo" },
      { status: 500 }
    );
  }
}
