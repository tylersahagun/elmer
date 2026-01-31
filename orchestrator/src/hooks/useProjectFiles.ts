"use client";

import { useQuery } from "@tanstack/react-query";
import type { FileNode } from "@/components/files";

interface GitHubTreeItem {
  name: string;
  path: string;
  type: "file" | "dir";
  size?: number;
  sha: string;
  url?: string;
  downloadUrl?: string;
}

interface GitHubTreeResponse {
  type: "dir";
  path: string;
  items: GitHubTreeItem[];
}

interface UseProjectFilesOptions {
  owner: string | null;
  repo: string | null;
  path: string | null;
  ref?: string | null;
  enabled?: boolean;
}

/**
 * Recursively fetch directory contents from GitHub and build a FileNode tree.
 */
async function fetchDirectoryTree(
  owner: string,
  repo: string,
  path: string,
  ref?: string,
  depth: number = 0,
  maxDepth: number = 3,
): Promise<FileNode[]> {
  // Prevent infinite recursion
  if (depth > maxDepth) {
    return [];
  }

  const params = new URLSearchParams({
    owner,
    repo,
    path,
    ...(ref && { ref }),
  });

  const response = await fetch(`/api/github/tree?${params}`);

  if (!response.ok) {
    if (response.status === 404) {
      // Path doesn't exist - return empty array
      return [];
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Failed to fetch tree: ${response.status}`,
    );
  }

  const data: GitHubTreeResponse = await response.json();

  if (data.type !== "dir" || !data.items) {
    return [];
  }

  // Process items in parallel with limited concurrency
  const nodes: FileNode[] = [];

  for (const item of data.items) {
    const node: FileNode = {
      name: item.name,
      path: item.path,
      type: item.type === "dir" ? "directory" : "file",
    };

    // Recursively fetch children for directories (but limit depth)
    if (item.type === "dir" && depth < maxDepth) {
      try {
        node.children = await fetchDirectoryTree(
          owner,
          repo,
          item.path,
          ref,
          depth + 1,
          maxDepth,
        );
      } catch {
        // If we can't fetch a subdirectory, just show it as empty
        node.children = [];
      }
    }

    nodes.push(node);
  }

  // Sort: directories first, then alphabetically
  return nodes.sort((a, b) => {
    if (a.type === "directory" && b.type !== "directory") return -1;
    if (a.type !== "directory" && b.type === "directory") return 1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Fetch file content from GitHub.
 */
export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string,
  ref?: string,
): Promise<string | null> {
  const params = new URLSearchParams({
    owner,
    repo,
    ...(ref && { ref }),
  });

  const response = await fetch(`/api/github/contents/${path}?${params}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Failed to fetch content: ${response.status}`,
    );
  }

  const data = await response.json();
  return data.content ?? null;
}

/**
 * Hook to fetch project files from GitHub.
 *
 * @param options - Configuration for fetching files
 * @returns Query result with file tree
 */
export function useProjectFiles(options: UseProjectFilesOptions) {
  const { owner, repo, path, ref, enabled = true } = options;

  return useQuery({
    queryKey: ["project-files", owner, repo, path, ref],
    queryFn: async () => {
      if (!owner || !repo || !path) {
        return [];
      }
      return fetchDirectoryTree(owner, repo, path, ref ?? undefined);
    },
    enabled: enabled && !!owner && !!repo && !!path,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (renamed from cacheTime in v5)
  });
}

/**
 * Hook to fetch a single file's content from GitHub.
 */
export function useFileContent(options: {
  owner: string | null;
  repo: string | null;
  path: string | null;
  ref?: string | null;
  enabled?: boolean;
}) {
  const { owner, repo, path, ref, enabled = true } = options;

  return useQuery({
    queryKey: ["file-content", owner, repo, path, ref],
    queryFn: async () => {
      if (!owner || !repo || !path) {
        return null;
      }
      return fetchFileContent(owner, repo, path, ref ?? undefined);
    },
    enabled: enabled && !!owner && !!repo && !!path,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
