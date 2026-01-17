/**
 * Linear → Notion Sync Script
 *
 * This script syncs Linear project metrics into Notion.
 * Deploy via Pipedream, Vercel Cron, or run manually.
 *
 * Environment Variables Required:
 * - LINEAR_API_KEY: Linear personal API key
 * - NOTION_API_KEY: Notion internal integration token
 */

import { LinearClient } from "@linear/sdk";
import { Client as NotionClient } from "@notionhq/client";

// Configuration
const NOTION_PROJECTS_DATABASE_ID = "2c0f79b2-c8ac-805c-981b-000b9873980f";

interface NotionProject {
  pageId: string;
  title: string;
  linearLink: string | null;
}

interface LinearProjectMetrics {
  totalIssues: number;
  doneIssues: number;
  percentComplete: number;
  blockers: string[];
  inProgress: string[];
}

/**
 * Extract Linear project ID from URL
 * URL format: https://linear.app/askelephant/project/[slug]-[id]
 */
function extractLinearProjectId(url: string): string | null {
  const match = url.match(/\/project\/[\w-]+-([a-f0-9]+)$/);
  return match ? match[1] : null;
}

/**
 * Query Notion for all projects with Linear links
 */
async function getNotionProjectsWithLinearLinks(
  notion: NotionClient
): Promise<NotionProject[]> {
  const projects: NotionProject[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.databases.query({
      database_id: NOTION_PROJECTS_DATABASE_ID,
      filter: {
        property: "Linear Link",
        url: {
          is_not_empty: true,
        },
      },
      start_cursor: cursor,
    });

    for (const page of response.results) {
      if ("properties" in page) {
        const properties = page.properties as Record<string, any>;
        const title =
          properties["Project name"]?.title?.[0]?.plain_text ?? "Untitled";
        const linearLink = properties["Linear Link"]?.url ?? null;

        projects.push({
          pageId: page.id,
          title,
          linearLink,
        });
      }
    }

    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return projects;
}

/**
 * Fetch Linear project metrics
 */
async function getLinearProjectMetrics(
  linear: LinearClient,
  projectId: string
): Promise<LinearProjectMetrics | null> {
  try {
    // Get project by ID
    const project = await linear.project(projectId);
    if (!project) return null;

    // Get all issues for this project
    const issuesConnection = await project.issues({
      first: 200, // Adjust if projects have more issues
    });
    const issues = issuesConnection.nodes;

    // Get workflow states to categorize issues
    const statePromises = issues.map((issue) => issue.state);
    const states = await Promise.all(statePromises);

    let doneCount = 0;
    const blockers: string[] = [];
    const inProgress: string[] = [];

    for (let i = 0; i < issues.length; i++) {
      const issue = issues[i];
      const state = states[i];

      if (!state) continue;

      // Count completed issues
      if (state.type === "completed" || state.type === "canceled") {
        doneCount++;
      }

      // Track in-progress issues
      if (state.type === "started") {
        const assignee = await issue.assignee;
        const assigneeName = assignee?.name ?? "Unassigned";
        inProgress.push(
          `${issue.identifier}: ${issue.title} (@${assigneeName})`
        );
      }

      // Track blocked issues (priority 0 = urgent, or has "blocked" label)
      if (
        issue.priority === 0 ||
        state.name.toLowerCase().includes("blocked")
      ) {
        blockers.push(`${issue.identifier}: ${issue.title}`);
      }
    }

    const totalIssues = issues.length;
    const percentComplete =
      totalIssues > 0 ? Math.round((doneCount / totalIssues) * 100) : 0;

    return {
      totalIssues,
      doneIssues: doneCount,
      percentComplete,
      blockers,
      inProgress,
    };
  } catch (error) {
    console.error(`Error fetching Linear project ${projectId}:`, error);
    return null;
  }
}

/**
 * Update Notion project with Linear metrics
 */
async function updateNotionProject(
  notion: NotionClient,
  pageId: string,
  metrics: LinearProjectMetrics
): Promise<void> {
  await notion.pages.update({
    page_id: pageId,
    properties: {
      "Linear Issues Count": {
        number: metrics.totalIssues,
      },
      "Linear % Complete": {
        number: metrics.percentComplete / 100, // Notion expects decimal for percent
      },
      "Linear Blockers": {
        rich_text: [
          {
            text: {
              content: metrics.blockers.slice(0, 5).join("\n") || "None",
            },
          },
        ],
      },
      "Linear In Progress": {
        rich_text: [
          {
            text: {
              content: metrics.inProgress.slice(0, 10).join("\n") || "None",
            },
          },
        ],
      },
    },
  });
}

/**
 * Main sync function
 */
export async function syncLinearToNotion(): Promise<{
  synced: number;
  failed: number;
  projects: string[];
}> {
  const linear = new LinearClient({
    apiKey: process.env.LINEAR_API_KEY!,
  });

  const notion = new NotionClient({
    auth: process.env.NOTION_API_KEY!,
  });

  console.log("🔄 Starting Linear → Notion sync...");

  // Get all Notion projects with Linear links
  const notionProjects = await getNotionProjectsWithLinearLinks(notion);
  console.log(
    `📋 Found ${notionProjects.length} Notion projects with Linear links`
  );

  let synced = 0;
  let failed = 0;
  const syncedProjects: string[] = [];

  for (const project of notionProjects) {
    if (!project.linearLink) continue;

    const linearProjectId = extractLinearProjectId(project.linearLink);
    if (!linearProjectId) {
      console.warn(
        `⚠️ Could not extract Linear ID from: ${project.linearLink}`
      );
      failed++;
      continue;
    }

    console.log(`🔍 Processing: ${project.title} (Linear: ${linearProjectId})`);

    // Fetch Linear metrics
    const metrics = await getLinearProjectMetrics(linear, linearProjectId);
    if (!metrics) {
      console.warn(`⚠️ Could not fetch Linear metrics for: ${project.title}`);
      failed++;
      continue;
    }

    // Update Notion
    try {
      await updateNotionProject(notion, project.pageId, metrics);
      console.log(
        `✅ Updated: ${project.title} (${metrics.totalIssues} issues, ${metrics.percentComplete}% complete)`
      );
      synced++;
      syncedProjects.push(project.title);
    } catch (error) {
      console.error(`❌ Failed to update Notion for: ${project.title}`, error);
      failed++;
    }

    // Rate limiting - Linear allows 1500 requests/hour
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  console.log(`\n📊 Sync complete: ${synced} synced, ${failed} failed`);

  return { synced, failed, projects: syncedProjects };
}

// Run if executed directly
if (require.main === module) {
  syncLinearToNotion()
    .then((result) => {
      console.log("\n✨ Final result:", JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}
