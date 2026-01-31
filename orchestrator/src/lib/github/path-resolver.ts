/**
 * GitHub Path Resolver
 *
 * Computes correct file paths for documents and prototypes
 * in GitHub repositories following established conventions.
 */

import type { DocumentPathOptions, PrototypePathOptions } from "./types";

/**
 * Map document types to their canonical filenames.
 */
const DOCUMENT_FILENAME_MAP: Record<string, string> = {
  prd: "prd.md",
  design_brief: "design-brief.md",
  engineering_spec: "engineering-spec.md",
  gtm_brief: "gtm-brief.md",
  research: "research.md",
  prototype_notes: "prototype-notes.md",
  state: "state.md",
  jury_report: "jury-report.md",
};

/**
 * Slugifies a project name for use in file paths.
 * Converts to lowercase, replaces spaces with hyphens, removes special characters.
 *
 * @example slugifyProjectName("Feature Alpha") -> "feature-alpha"
 * @example slugifyProjectName("My Test Project!") -> "my-test-project"
 */
export function slugifyProjectName(projectName: string): string {
  return projectName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/**
 * Converts a project name to PascalCase for component naming.
 *
 * @example toPascalCase("feature alpha") -> "FeatureAlpha"
 * @example toPascalCase("my-test-project") -> "MyTestProject"
 */
export function toPascalCase(projectName: string): string {
  return projectName
    .split(/[\s-_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

/**
 * Normalizes a base path by removing leading and trailing slashes.
 *
 * @example normalizePath("/initiatives/") -> "initiatives"
 * @example normalizePath("docs") -> "docs"
 */
export function normalizePath(path: string): string {
  return path.replace(/^\/+/, "").replace(/\/+$/, "");
}

/**
 * Resolves the path for a document in the repository.
 *
 * Convention: {basePath}/{project-slug}/{document-type}.md
 * Default: initiatives/{project-slug}/{document-type}.md
 *
 * @example
 * resolveDocumentPath({ projectName: "Feature Alpha", documentType: "prd" })
 * -> "initiatives/feature-alpha/prd.md"
 *
 * @example
 * resolveDocumentPath({
 *   projectName: "Feature Alpha",
 *   documentType: "design_brief",
 *   basePath: "docs/projects"
 * })
 * -> "docs/projects/feature-alpha/design-brief.md"
 */
export function resolveDocumentPath(options: DocumentPathOptions): string {
  const { projectName, documentType, basePath = "initiatives" } = options;

  const slug = slugifyProjectName(projectName);

  // Get filename from map or generate from document type
  const fileName =
    DOCUMENT_FILENAME_MAP[documentType] ||
    `${documentType.replace(/_/g, "-")}.md`;

  const normalizedBase = normalizePath(basePath);

  return `${normalizedBase}/${slug}/${fileName}`;
}

/**
 * Resolves the path for a prototype in the repository.
 *
 * Supports submodule paths: {submodulePath}/src/components/prototypes/{ComponentName}/
 * Default: src/components/prototypes/{ComponentName}/
 *
 * @example
 * resolvePrototypePath({ projectName: "Feature Alpha" })
 * -> "src/components/prototypes/FeatureAlpha"
 *
 * @example
 * resolvePrototypePath({
 *   projectName: "My Test",
 *   submodulePath: "elephant-ai/web",
 *   componentSuffix: "Prototype"
 * })
 * -> "elephant-ai/web/src/components/prototypes/MyTestPrototype"
 */
export function resolvePrototypePath(options: PrototypePathOptions): string {
  const { projectName, submodulePath, componentSuffix = "" } = options;

  // PascalCase component name
  const componentName = toPascalCase(projectName) + componentSuffix;

  const basePath = submodulePath
    ? `${normalizePath(submodulePath)}/src/components/prototypes`
    : "src/components/prototypes";

  return `${basePath}/${componentName}`;
}

/**
 * Get the parent initiative directory for a project.
 *
 * @example
 * getProjectBasePath("Feature Alpha")
 * -> "initiatives/feature-alpha"
 *
 * @example
 * getProjectBasePath("Feature Alpha", "docs/projects")
 * -> "docs/projects/feature-alpha"
 */
export function getProjectBasePath(
  projectName: string,
  basePath = "initiatives"
): string {
  const slug = slugifyProjectName(projectName);
  return `${normalizePath(basePath)}/${slug}`;
}

/**
 * Resolves the full path for a document file within a project directory.
 * This is a convenience function that combines project base path with document filename.
 *
 * @example
 * resolveFullDocumentPath("Feature Alpha", "prd")
 * -> "initiatives/feature-alpha/prd.md"
 */
export function resolveFullDocumentPath(
  projectName: string,
  documentType: string,
  basePath = "initiatives"
): string {
  return resolveDocumentPath({ projectName, documentType, basePath });
}

/**
 * Parses a prototype path to extract submodule information.
 *
 * Examples:
 * - "src/components/prototypes" -> { submodulePath: null, localPath: "src/components/prototypes" }
 * - "elephant-ai/web/src/components/prototypes" -> { submodulePath: "elephant-ai/web", localPath: "src/components/prototypes" }
 */
export function parsePrototypePath(prototypesPath: string): {
  submodulePath: string | null;
  localPath: string;
} {
  // Normalize the path
  const normalized = prototypesPath.replace(/^\/+|\/+$/g, "");

  // Common patterns for local prototype paths
  const localPatterns = [
    /^src\/components\/prototypes$/,
    /^src\/prototypes$/,
    /^prototypes$/,
    /^components\/prototypes$/,
  ];

  // Check if path starts with a common local pattern
  if (localPatterns.some((p) => p.test(normalized))) {
    return { submodulePath: null, localPath: normalized };
  }

  // Check for submodule pattern: {org/repo}/path or {folder}/path
  // Heuristic: if path has more than 2 directories before "src" or "prototypes", it's likely a submodule
  const parts = normalized.split("/");

  // Look for "src" in the path as a marker
  const srcIndex = parts.indexOf("src");
  if (srcIndex > 0) {
    // Everything before "src" is the submodule path
    const submodulePath = parts.slice(0, srcIndex).join("/");
    const localPath = parts.slice(srcIndex).join("/");
    return { submodulePath, localPath };
  }

  // Look for "prototypes" or "components" as markers
  const prototypeIndex = parts.findIndex(
    (p) => p === "prototypes" || p === "components"
  );
  if (prototypeIndex > 1) {
    // Likely a submodule path
    const submodulePath = parts.slice(0, prototypeIndex - 1).join("/");
    const localPath = parts.slice(prototypeIndex - 1).join("/");
    return { submodulePath, localPath };
  }

  // Default: treat entire path as local
  return { submodulePath: null, localPath: normalized };
}

/**
 * Resolves the full path for prototype files using workspace settings.
 *
 * @param options.projectName - The project name (for component naming)
 * @param options.prototypesPath - From workspace.settings.prototypesPath
 * @param options.fileName - Optional specific file name (default: creates directory path)
 */
export function resolvePrototypeFilePath(options: {
  projectName: string;
  prototypesPath?: string;
  fileName?: string;
}): string {
  const { projectName, prototypesPath, fileName } = options;

  // PascalCase component name
  const componentName = toPascalCase(projectName);

  // Use provided prototypes path or default
  const basePath = prototypesPath
    ? prototypesPath.replace(/^\/+|\/+$/g, "")
    : "src/components/prototypes";

  if (fileName) {
    return `${basePath}/${componentName}/${fileName}`;
  }

  return `${basePath}/${componentName}`;
}
