import { Octokit } from "@octokit/rest";
import { clerkClient } from "@clerk/nextjs/server";

export async function getGitHubToken(clerkUserId: string): Promise<string | null> {
  try {
    const client = await clerkClient();
    const response = await client.users.getUserOauthAccessToken(clerkUserId, "oauth_github");
    return response.data?.[0]?.token ?? null;
  } catch {
    return null;
  }
}

export async function getGitHubClient(clerkUserId: string): Promise<Octokit | null> {
  const token = await getGitHubToken(clerkUserId);
  if (!token) {
    return null;
  }
  return new Octokit({ auth: token });
}
