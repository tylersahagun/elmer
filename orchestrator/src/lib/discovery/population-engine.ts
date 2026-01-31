/**
 * Population Engine Module
 *
 * Orchestrates the import of discovered items into the database.
 * Takes discovery results and user selections, then creates/updates:
 * - Projects (from initiatives)
 * - Column configs (dynamic columns)
 * - Knowledge base entries
 * - Agent definitions
 *
 * Per POPUL-06: Re-running should update existing records (via deterministic IDs).
 */

import { Octokit } from "@octokit/rest";
import {
  upsertProject,
  createColumnConfig,
  getColumnConfigs,
  updateWorkspace,
  getWorkspace,
  createDocument,
  createPrototype,
  updatePrototype,
} from "@/lib/db/queries";
import { syncAgentArchitecture } from "@/lib/agents/sync";
import { syncKnowledgeBase } from "@/lib/knowledgebase/sync";
import { syncSignals } from "@/lib/signals/sync";
import { buildChromaticStorybookUrl } from "@/lib/chromatic";
import type {
  ProjectStage,
  DocumentType,
  PrototypeType,
} from "@/lib/db/schema";
import type {
  DiscoveryResult,
  DiscoveredInitiative,
  DiscoveredPrototype,
  DiscoveredContextPath,
  DiscoveredAgent,
  ImportSelection,
  ImportResult,
} from "./types";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Options for the population engine.
 */
export interface PopulationOptions {
  workspaceId: string;
  discoveryResult: DiscoveryResult;
  selection: ImportSelection;
  octokit: Octokit;
}

/**
 * Internal tracking for the population process.
 */
interface PopulationProgress {
  projectsCreated: number;
  projectsUpdated: number;
  columnsCreated: string[];
  knowledgeSynced: number;
  personasSynced: number;
  signalsSynced: number;
  agentsImported: number;
  documentsImported: number;
  prototypesImported: number;
  errors: string[];
}

/**
 * Document file patterns to look for in initiative folders.
 * Maps filename patterns to document types.
 */
const DOCUMENT_FILE_PATTERNS: Array<{
  pattern: RegExp;
  type: DocumentType;
  title: string;
}> = [
  {
    pattern: /^prd\.md$/i,
    type: "prd",
    title: "Product Requirements Document",
  },
  { pattern: /^research\.md$/i, type: "research", title: "Research Notes" },
  {
    pattern: /^design[-_]?brief\.md$/i,
    type: "design_brief",
    title: "Design Brief",
  },
  {
    pattern: /^engineering[-_]?spec\.md$/i,
    type: "engineering_spec",
    title: "Engineering Specification",
  },
  {
    pattern: /^gtm[-_]?brief\.md$/i,
    type: "gtm_brief",
    title: "Go-to-Market Brief",
  },
  { pattern: /^metrics\.md$/i, type: "metrics", title: "Metrics" },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if a column already exists for a stage.
 */
function columnExists(
  columns: Array<{ stage: string }>,
  stage: string,
): boolean {
  return columns.some((col) => col.stage === stage);
}

/**
 * Generate a display name from a stage identifier.
 */
function generateDisplayName(stage: string): string {
  // Convert kebab-case or snake_case to Title Case
  return stage
    .replace(/[-_]/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Get next order number for new column.
 */
function getNextColumnOrder(columns: Array<{ order: number }>): number {
  if (columns.length === 0) return 0;
  return Math.max(...columns.map((c) => c.order)) + 1;
}

// =============================================================================
// MAIN POPULATION ENGINE
// =============================================================================

/**
 * Run the population engine to import discovered items.
 *
 * This function orchestrates the entire import process:
 * 1. Create dynamic columns if needed
 * 2. Upsert projects for selected initiatives
 * 3. Sync knowledge base
 * 4. Import agent definitions
 *
 * @param options - Population options including discovery results and selections
 * @returns ImportResult with counts and any errors
 */
export async function runPopulationEngine(
  options: PopulationOptions,
): Promise<ImportResult> {
  const { workspaceId, discoveryResult, selection, octokit } = options;

  // Initialize progress tracking
  const progress: PopulationProgress = {
    projectsCreated: 0,
    projectsUpdated: 0,
    columnsCreated: [],
    knowledgeSynced: 0,
    personasSynced: 0,
    signalsSynced: 0,
    agentsImported: 0,
    documentsImported: 0,
    prototypesImported: 0,
    errors: [],
  };

  try {
    // Get existing columns
    const existingColumns = await getColumnConfigs(workspaceId);

    // Step 1: Create dynamic columns if enabled
    if (selection.createDynamicColumns) {
      await createDynamicColumns({
        workspaceId,
        initiatives: discoveryResult.initiatives,
        selectedIds: selection.initiatives,
        existingColumns,
        progress,
      });
    }

    // Refresh columns after potential creation
    const columns = await getColumnConfigs(workspaceId);

    // Step 2: Upsert projects for selected initiatives
    await upsertProjects({
      workspaceId,
      initiatives: discoveryResult.initiatives,
      selectedIds: selection.initiatives,
      columns,
      branch: discoveryResult.branch,
      progress,
    });

    // Step 2.5: Import existing documents from GitHub (if available)
    await importProjectDocuments({
      discoveryResult,
      initiatives: discoveryResult.initiatives,
      selectedIds: selection.initiatives,
      octokit,
      progress,
    });

    // Step 2.6: Create prototype records for discovered prototypes
    await createPrototypesForProjects({
      discoveryResult,
      initiatives: discoveryResult.initiatives,
      selectedIds: selection.initiatives,
      progress,
    });

    // Step 3: Update workspace context paths
    if (selection.contextPaths.length > 0) {
      await updateWorkspaceContextPaths({
        workspaceId,
        contextPaths: discoveryResult.contextPaths,
        selectedPaths: selection.contextPaths,
        progress,
      });
    }

    // Step 4: Sync knowledge base
    await syncKnowledge({
      workspaceId,
      discoveryResult,
      selection,
      octokit,
      progress,
    });

    // Step 4.5: Sync signals from discovered signals paths
    await syncSignalsFromDiscovery({
      workspaceId,
      discoveryResult,
      selection,
      progress,
    });

    // Step 5: Import agent definitions
    if (selection.agents.length > 0) {
      await importAgents({
        workspaceId,
        discoveryResult,
        selection,
        octokit,
        progress,
      });
    }

    return {
      success: progress.errors.length === 0,
      projectsCreated: progress.projectsCreated,
      projectsUpdated: progress.projectsUpdated,
      columnsCreated: progress.columnsCreated,
      knowledgeSynced: progress.knowledgeSynced,
      personasSynced: progress.personasSynced,
      signalsSynced: progress.signalsSynced,
      agentsImported: progress.agentsImported,
      documentsImported: progress.documentsImported,
      prototypesImported: progress.prototypesImported,
      errors: progress.errors,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    progress.errors.push(`Population engine failed: ${message}`);
    return {
      success: false,
      projectsCreated: progress.projectsCreated,
      projectsUpdated: progress.projectsUpdated,
      columnsCreated: progress.columnsCreated,
      knowledgeSynced: progress.knowledgeSynced,
      personasSynced: progress.personasSynced,
      signalsSynced: progress.signalsSynced,
      agentsImported: progress.agentsImported,
      documentsImported: progress.documentsImported,
      prototypesImported: progress.prototypesImported,
      errors: progress.errors,
    };
  }
}

// =============================================================================
// STEP IMPLEMENTATIONS
// =============================================================================

/**
 * Create dynamic columns for unknown statuses.
 */
async function createDynamicColumns(params: {
  workspaceId: string;
  initiatives: DiscoveredInitiative[];
  selectedIds: string[];
  existingColumns: Array<{ stage: string; order: number }>;
  progress: PopulationProgress;
}): Promise<void> {
  const { workspaceId, initiatives, selectedIds, existingColumns, progress } =
    params;

  // Get all unique mapped columns for selected initiatives
  const selectedInitiatives = initiatives.filter((i) =>
    selectedIds.includes(i.id),
  );
  const uniqueColumns = new Set(selectedInitiatives.map((i) => i.mappedColumn));

  // Find columns that don't exist yet
  const missingColumns = Array.from(uniqueColumns).filter(
    (col) => !columnExists(existingColumns, col),
  );

  // Create missing columns
  let nextOrder = getNextColumnOrder(existingColumns);
  for (const columnStage of missingColumns) {
    try {
      await createColumnConfig({
        workspaceId,
        stage: columnStage as ProjectStage,
        displayName: generateDisplayName(columnStage),
        order: nextOrder++,
        color: "slate", // Default color for dynamic columns
        enabled: true,
      });
      progress.columnsCreated.push(columnStage);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      progress.errors.push(
        `Failed to create column ${columnStage}: ${message}`,
      );
    }
  }
}

/**
 * Upsert projects for selected initiatives.
 */
async function upsertProjects(params: {
  workspaceId: string;
  initiatives: DiscoveredInitiative[];
  selectedIds: string[];
  columns: Array<{ stage: string }>;
  branch: string;
  progress: PopulationProgress;
}): Promise<void> {
  const { workspaceId, initiatives, selectedIds, columns, branch, progress } =
    params;

  // Get selected initiatives
  const selectedInitiatives = initiatives.filter((i) =>
    selectedIds.includes(i.id),
  );

  for (const initiative of selectedInitiatives) {
    try {
      // Determine the target stage (column)
      let targetStage: ProjectStage = "inbox";

      // Check if the mapped column exists
      if (columnExists(columns, initiative.mappedColumn)) {
        targetStage = initiative.mappedColumn as ProjectStage;
      } else {
        // Fall back to inbox if column doesn't exist
        targetStage = "inbox";
      }

      // Build metadata from initiative
      const metadata = {
        sourcePath: initiative.sourcePath,
        sourceFolder: initiative.sourceFolder,
        originalStatus: initiative.status,
        statusConfidence: initiative.statusConfidence,
        isStatusAmbiguous: initiative.isStatusAmbiguous,
        tags: initiative.tags,
        gitBranch: branch, // Store the git branch for Chromatic URL construction
        importedAt: new Date().toISOString(),
        ...(initiative.rawMeta || {}),
      };

      // Upsert the project
      const result = await upsertProject({
        id: initiative.id,
        workspaceId,
        name: initiative.name,
        description: initiative.description,
        stage: targetStage,
        metadata,
      });

      if (result.action === "created") {
        progress.projectsCreated++;
      } else {
        progress.projectsUpdated++;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      progress.errors.push(
        `Failed to upsert project ${initiative.name}: ${message}`,
      );
    }
  }
}

/**
 * Import existing documents from GitHub for selected initiatives.
 * Looks for known document files (prd.md, research.md, etc.) in initiative folders.
 */
async function importProjectDocuments(params: {
  discoveryResult: DiscoveryResult;
  initiatives: DiscoveredInitiative[];
  selectedIds: string[];
  octokit: Octokit;
  progress: PopulationProgress;
}): Promise<void> {
  const { discoveryResult, initiatives, selectedIds, octokit, progress } =
    params;
  const { repoOwner, repoName, branch } = discoveryResult;

  // Get selected initiatives
  const selectedInitiatives = initiatives.filter((i) =>
    selectedIds.includes(i.id),
  );

  for (const initiative of selectedInitiatives) {
    try {
      // List files in the initiative folder
      const { data: folderContents } = await octokit.repos.getContent({
        owner: repoOwner,
        repo: repoName,
        path: initiative.sourcePath,
        ref: branch,
      });

      if (!Array.isArray(folderContents)) {
        continue; // Not a directory
      }

      // Look for known document files
      for (const file of folderContents) {
        if (file.type !== "file") continue;

        // Check if this file matches any document pattern
        for (const { pattern, type, title } of DOCUMENT_FILE_PATTERNS) {
          if (pattern.test(file.name)) {
            try {
              // Fetch file content
              const { data: fileData } = await octokit.repos.getContent({
                owner: repoOwner,
                repo: repoName,
                path: file.path,
                ref: branch,
              });

              if (Array.isArray(fileData) || fileData.type !== "file") {
                continue;
              }

              // Decode content
              const content =
                fileData.content && fileData.encoding === "base64"
                  ? Buffer.from(fileData.content, "base64").toString("utf-8")
                  : null;

              if (!content) continue;

              // Create the document
              await createDocument({
                projectId: initiative.id,
                type,
                title,
                content,
                filePath: `${repoOwner}/${repoName}:${file.path}`,
                metadata: {
                  importedFrom: "github",
                  sha: fileData.sha,
                  importedAt: new Date().toISOString(),
                },
              });

              progress.documentsImported++;
            } catch (docError) {
              // Log but don't fail the entire import for a single document
              console.warn(
                `[PopulationEngine] Failed to import document ${file.path}:`,
                docError instanceof Error ? docError.message : "Unknown error",
              );
            }
            break; // Found a match, don't check other patterns
          }
        }
      }
    } catch (error) {
      // Log but don't fail - the folder might not be accessible or might be empty
      const message = error instanceof Error ? error.message : "Unknown error";
      console.warn(
        `[PopulationEngine] Failed to scan initiative folder ${initiative.sourcePath}: ${message}`,
      );
    }
  }

  if (progress.documentsImported > 0) {
    console.log(
      `[PopulationEngine] Imported ${progress.documentsImported} documents from GitHub`,
    );
  }
}

/**
 * Update workspace with selected context paths.
 */
async function updateWorkspaceContextPaths(params: {
  workspaceId: string;
  contextPaths: DiscoveredContextPath[];
  selectedPaths: string[];
  progress: PopulationProgress;
}): Promise<void> {
  const { workspaceId, contextPaths, selectedPaths, progress } = params;

  try {
    // Get current workspace settings
    const workspace = await getWorkspace(workspaceId);
    if (!workspace) {
      progress.errors.push("Workspace not found when updating context paths");
      return;
    }

    // Filter to selected paths
    const selectedContextPaths = contextPaths
      .filter((cp) => selectedPaths.includes(cp.path))
      .map((cp) => cp.path);

    // Find knowledge, personas, and signals paths
    const knowledgePaths = contextPaths
      .filter(
        (cp) =>
          selectedPaths.includes(cp.path) &&
          (cp.type === "knowledge" || cp.type === "personas"),
      )
      .map((cp) => cp.path);

    // Update workspace settings with context paths
    const currentSettings = workspace.settings || {};
    await updateWorkspace(workspaceId, {
      settings: {
        ...currentSettings,
        contextPaths:
          knowledgePaths.length > 0
            ? knowledgePaths
            : currentSettings.contextPaths,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    progress.errors.push(`Failed to update context paths: ${message}`);
  }
}

/**
 * Sync knowledge base from discovered context paths.
 */
async function syncKnowledge(params: {
  workspaceId: string;
  discoveryResult: DiscoveryResult;
  selection: ImportSelection;
  octokit: Octokit;
  progress: PopulationProgress;
}): Promise<void> {
  const { workspaceId, discoveryResult, selection, octokit, progress } = params;

  // Filter selected context paths to knowledge type
  const knowledgePaths = discoveryResult.contextPaths
    .filter(
      (cp) =>
        selection.contextPaths.includes(cp.path) && cp.type === "knowledge",
    )
    .map((cp) => cp.path);

  const personaPaths = discoveryResult.contextPaths
    .filter(
      (cp) =>
        selection.contextPaths.includes(cp.path) && cp.type === "personas",
    )
    .map((cp) => cp.path);

  if (knowledgePaths.length === 0 && personaPaths.length === 0) {
    return;
  }

  try {
    const result = await syncKnowledgeBase(workspaceId, {
      octokit,
      repoOwner: discoveryResult.repoOwner,
      repoName: discoveryResult.repoName,
      repoRef: discoveryResult.branch,
      contextPaths: [...knowledgePaths, ...personaPaths],
      syncFullFolders: true, // Import all files in folders, not just single files
    });

    progress.knowledgeSynced = result.synced;
    if (result.errors.length > 0) {
      progress.errors.push(...result.errors);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    progress.errors.push(`Failed to sync knowledge base: ${message}`);
  }
}

/**
 * Sync signals from discovered signal paths.
 */
async function syncSignalsFromDiscovery(params: {
  workspaceId: string;
  discoveryResult: DiscoveryResult;
  selection: ImportSelection;
  progress: PopulationProgress;
}): Promise<void> {
  const { workspaceId, discoveryResult, selection, progress } = params;

  // Filter selected context paths to signals type
  const signalPaths = discoveryResult.contextPaths
    .filter(
      (cp) => selection.contextPaths.includes(cp.path) && cp.type === "signals",
    )
    .map((cp) => cp.path);

  if (signalPaths.length === 0) {
    // No signals paths selected, nothing to do
    return;
  }

  console.log(`[PopulationEngine] Syncing signals from paths:`, signalPaths);

  try {
    const result = await syncSignals(workspaceId, {
      signalsPaths: signalPaths,
      skipProcessing: true, // Skip AI processing during import for performance
    });

    progress.signalsSynced = result.synced;
    if (result.errors.length > 0) {
      // Only log errors, don't fail the import
      console.warn(`[PopulationEngine] Signal sync warnings:`, result.errors);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[PopulationEngine] Failed to sync signals:`, message);
    // Don't fail the entire import for signal sync failures
  }
}

/**
 * Import agent definitions from discovered agents.
 */
async function importAgents(params: {
  workspaceId: string;
  discoveryResult: DiscoveryResult;
  selection: ImportSelection;
  octokit: Octokit;
  progress: PopulationProgress;
}): Promise<void> {
  const { workspaceId, discoveryResult, selection, octokit, progress } = params;

  // Determine which agent types to import based on selected paths
  const selectedAgents = discoveryResult.agents.filter((a) =>
    selection.agents.includes(a.path),
  );

  if (selectedAgents.length === 0) {
    return;
  }

  // Build selection object for agent sync
  const agentSelection = {
    agentsMd: selectedAgents.some((a) => a.type === "agents_md"),
    skills: selectedAgents.some((a) => a.type === "skill"),
    commands: selectedAgents.some((a) => a.type === "command"),
    subagents: selectedAgents.some((a) => a.type === "subagent"),
    rules: selectedAgents.some((a) => a.type === "rule"),
    knowledge: false, // Handled separately by syncKnowledge
    personas: false, // Handled separately by syncKnowledge
  };

  // Log import details for debugging and tracking
  const selectedTypes = Object.entries(agentSelection)
    .filter(([, enabled]) => enabled)
    .map(([type]) => type);
  console.log(`[PopulationEngine] Importing ${selectedAgents.length} agents:`, {
    types: selectedTypes,
    paths: selectedAgents.map((a) => a.path),
  });

  try {
    const result = await syncAgentArchitecture({
      workspaceId,
      owner: discoveryResult.repoOwner,
      repo: discoveryResult.repoName,
      ref: discoveryResult.branch,
      selection: agentSelection,
      octokit,
    });

    progress.agentsImported = result.count;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    progress.errors.push(`Failed to import agents: ${message}`);
  }
}

/**
 * Create prototype records for discovered prototypes in initiatives.
 * Links prototypes to projects with Chromatic URLs based on git branch.
 */
async function createPrototypesForProjects(params: {
  discoveryResult: DiscoveryResult;
  initiatives: DiscoveredInitiative[];
  selectedIds: string[];
  progress: PopulationProgress;
}): Promise<void> {
  const { discoveryResult, initiatives, selectedIds, progress } = params;
  const { branch } = discoveryResult;

  // Get selected initiatives that have prototypes
  const initiativesWithPrototypes = initiatives.filter(
    (i) =>
      selectedIds.includes(i.id) && i.prototypes && i.prototypes.length > 0,
  );

  if (initiativesWithPrototypes.length === 0) {
    return;
  }

  console.log(
    `[PopulationEngine] Creating prototype records for ${initiativesWithPrototypes.length} initiatives`,
  );

  for (const initiative of initiativesWithPrototypes) {
    for (const discoveredPrototype of initiative.prototypes) {
      try {
        // Determine prototype type based on path/name
        const prototypeType: PrototypeType = discoveredPrototype.path.includes(
          "context",
        )
          ? "context"
          : "standalone";

        // Create the prototype record
        const prototype = await createPrototype({
          projectId: initiative.id,
          type: prototypeType,
          name: discoveredPrototype.name,
          storybookPath: discoveredPrototype.storybookPath || undefined,
        });

        if (prototype) {
          // Determine the branch to use for Chromatic URL
          const prototypeBranch = discoveredPrototype.branch || branch;

          // Build Chromatic URLs
          const chromaticStorybookUrl =
            buildChromaticStorybookUrl(prototypeBranch);

          // Update prototype with Chromatic URLs and metadata
          await updatePrototype(prototype.id, {
            status: "ready",
            chromaticStorybookUrl,
            metadata: {
              stories: discoveredPrototype.stories,
              version: discoveredPrototype.version,
              branch: prototypeBranch,
              importedFrom: "discovery",
              importedAt: new Date().toISOString(),
              sourcePath: discoveredPrototype.path,
            },
          });

          progress.prototypesImported++;
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        console.warn(
          `[PopulationEngine] Failed to create prototype ${discoveredPrototype.name} for ${initiative.name}:`,
          message,
        );
        // Don't fail the entire import for a single prototype
      }
    }
  }

  if (progress.prototypesImported > 0) {
    console.log(
      `[PopulationEngine] Created ${progress.prototypesImported} prototype records`,
    );
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

// Types are exported via their interface/type definitions above
export type { PopulationProgress };
