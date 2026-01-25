import { Octokit } from "@octokit/rest";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { accounts } from "@/lib/db/schema";

export async function getGitHubToken(userId: string): Promise<string | null> {
  const account = await db.query.accounts.findFirst({
    where: and(eq(accounts.userId, userId), eq(accounts.provider, "github")),
  });

  return account?.access_token ?? null;
}

export async function getGitHubClient(userId: string): Promise<Octokit | null> {
  const token = await getGitHubToken(userId);
  if (!token) {
    return null;
  }
  return new Octokit({ auth: token });
}
