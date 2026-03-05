#!/usr/bin/env node
/**
 * Seed Convex with pm-workspace-docs from local disk.
 *
 * Usage:
 *   node scripts/seed-pm-workspace.mjs <workspaceId>
 *
 * Example:
 *   node scripts/seed-pm-workspace.mjs mn7e43jc0m7bc5jn708d3ye4e182a7me
 */

import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, basename, dirname } from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "../..");
const PM_DOCS = join(REPO_ROOT, "pm-workspace-docs");
const WORKSPACE_ID = process.argv[2];

if (!WORKSPACE_ID) {
  console.error("Usage: node scripts/seed-pm-workspace.mjs <workspaceId>");
  process.exit(1);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function readFileSafe(path) {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return null;
  }
}

function listFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .map((name) => join(dir, name))
    .filter((p) => statSync(p).isFile());
}

function listDirs(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .map((name) => join(dir, name))
    .filter((p) => statSync(p).isDirectory());
}

// Truncate content to avoid hitting Convex arg size limits (~8MB total)
function truncate(content, maxChars = 50_000) {
  if (!content || content.length <= maxChars) return content;
  return content.slice(0, maxChars) + "\n\n[... truncated for seed ...]";
}

function convexRun(fn, args) {
  const identity = JSON.stringify({
    name: "Tyler Sahagun",
    email: "tyler@askelephant.ai",
    emailVerified: true,
  });
  const argsJson = JSON.stringify(args);
  const cmd = `npx convex run ${fn} --identity '${identity}' '${argsJson.replace(/'/g, "'\\''")}'`;
  try {
    const output = execSync(cmd, {
      cwd: join(__dirname, ".."),
      encoding: "utf8",
      timeout: 120_000,
    });
    return JSON.parse(output.trim());
  } catch (e) {
    console.error(`  ✗ ${fn} failed:`, e.message?.slice(0, 200));
    return null;
  }
}

// ── Collect data ──────────────────────────────────────────────────────────────

const CONTEXT_FILE_TYPES = {
  "product-vision.md": "company_context",
  "strategic-guardrails.md": "strategic_guardrails",
  "personas.md": "personas",
  "org-chart.md": "org_chart",
  "tyler-context.md": "team_context",
  "tech-stack.md": "tech_stack",
  "integrations.md": "integrations",
};

const INITIATIVE_DOC_FILES = {
  "prd.md": "prd",
  "research.md": "research",
  "design-brief.md": "design_brief",
  "engineering-spec.md": "engineering_spec",
  "gtm-brief.md": "gtm_brief",
  "prototype-notes.md": "prototype_notes",
  "decisions.md": "decisions",
  "competitive-landscape.md": "competitive_landscape",
  "visual-directions.md": "visual_directions",
  "METRICS.md": "metrics",
};

const BATCH_SIZE = 20; // items per Convex call

// ── 1. Company context ────────────────────────────────────────────────────────

console.log("\n📂 Collecting company-context/...");
const kbEntries = [];

const contextDir = join(PM_DOCS, "company-context");
for (const filePath of listFiles(contextDir)) {
  const name = basename(filePath);
  const type = CONTEXT_FILE_TYPES[name];
  if (!type) continue;
  const content = readFileSafe(filePath);
  if (!content) continue;
  kbEntries.push({
    type,
    title: name.replace(/\.md$/, "").replace(/-/g, " "),
    content: truncate(content),
    filePath: `pm-workspace-docs/company-context/${name}`,
  });
  console.log(`  + ${type} (${Math.round(content.length / 1024)}KB)`);
}

// ── 2. Initiatives ────────────────────────────────────────────────────────────

console.log("\n📂 Collecting initiatives/active/...");
const projectsData = [];
const documentsData = [];

const activeDir = join(PM_DOCS, "initiatives", "active");
for (const initiativeDir of listDirs(activeDir)) {
  const slug = basename(initiativeDir);
  if (slug.startsWith("_") || slug === "Untitled") continue;

  let meta = {};
  const metaRaw = readFileSafe(join(initiativeDir, "_meta.json"));
  if (metaRaw) {
    try { meta = JSON.parse(metaRaw); } catch { /* ignore */ }
  }

  const name = (meta.name) || slug.replace(/-/g, " ");
    // Convex rejects field names starting with '$' — strip them from metadata
    const cleanMeta = Object.fromEntries(
      Object.entries(meta).filter(([k]) => !k.startsWith("$")),
    );

    projectsData.push({
      slug,
      name,
      stage: meta.phase || "inbox",
      priority: meta.priority || "P2",
      status: meta.status || "on_track",
      description: meta.owner_note || undefined,
      metadata: cleanMeta,
    });

  // Collect documents for this initiative
  for (const filePath of listFiles(initiativeDir)) {
    const fname = basename(filePath);
    const docType = INITIATIVE_DOC_FILES[fname];
    if (!docType) continue;
    const content = readFileSafe(filePath);
    if (!content || content.trim().length < 20) continue;
    documentsData.push({
      projectSlug: slug,
      type: docType,
      title: `${fname.replace(/\.md$/, "")} — ${name}`,
      content: truncate(content),
    });
  }

  console.log(`  + ${slug} (${documentsData.filter((d) => d.projectSlug === slug).length} docs)`);
}

// ── 3. Feature guides ─────────────────────────────────────────────────────────

console.log("\n📂 Collecting feature-guides/...");
const featureGuideDir = join(PM_DOCS, "feature-guides");
for (const filePath of listFiles(featureGuideDir)) {
  if (!filePath.endsWith(".md")) continue;
  const content = readFileSafe(filePath);
  if (!content) continue;
  const title = basename(filePath).replace(/\.md$/, "").replace(/-/g, " ");
  kbEntries.push({
    type: "feature_guide",
    title,
    content: truncate(content),
    filePath: `pm-workspace-docs/feature-guides/${basename(filePath)}`,
  });
  console.log(`  + feature_guide: ${title}`);
}

// ── 4. Hypotheses — one entry per hypothesis file ─────────────────────────────

console.log("\n📂 Collecting hypotheses/active/...");
const hypothesisDir = join(PM_DOCS, "hypotheses", "active");
let hypothesisCount = 0;
for (const filePath of listFiles(hypothesisDir)) {
  if (!filePath.endsWith(".md") || basename(filePath).startsWith("_")) continue;
  const content = readFileSafe(filePath);
  if (!content) continue;
  const slug = basename(filePath).replace(/\.md$/, "");
  const title = slug.replace(/-/g, " ");
  kbEntries.push({
    type: "hypothesis",
    title,
    content: truncate(content),
    filePath: `pm-workspace-docs/hypotheses/active/${basename(filePath)}`,
  });
  hypothesisCount++;
}
if (hypothesisCount > 0) {
  console.log(`  + hypothesis: ${hypothesisCount} individual entries`);
}

// ── 5. Roadmap ────────────────────────────────────────────────────────────────

console.log("\n📂 Collecting roadmap/...");
const roadmapJson = readFileSafe(join(PM_DOCS, "roadmap", "roadmap.json"));
if (roadmapJson) {
  kbEntries.push({
    type: "roadmap",
    title: "Product Roadmap",
    content: truncate(roadmapJson, 100_000),
    filePath: "pm-workspace-docs/roadmap/roadmap.json",
  });
  console.log(`  + roadmap.json (${Math.round(roadmapJson.length / 1024)}KB)`);
}

// ── Push to Convex in batches ─────────────────────────────────────────────────

console.log(`\n🚀 Pushing to Convex workspace: ${WORKSPACE_ID}`);
console.log(`   ${kbEntries.length} KB entries`);
console.log(`   ${projectsData.length} projects`);
console.log(`   ${documentsData.length} documents`);

// Push KB entries in batches
let totalKb = 0, totalProjects = 0, totalDocs = 0;

for (let i = 0; i < kbEntries.length; i += BATCH_SIZE) {
  const batch = kbEntries.slice(i, i + BATCH_SIZE);
  process.stdout.write(`  KB batch ${Math.ceil(i / BATCH_SIZE) + 1}/${Math.ceil(kbEntries.length / BATCH_SIZE)}... `);
  const result = convexRun("seedHelpers:batchImport", {
    workspaceId: WORKSPACE_ID,
    knowledgebaseEntries: batch,
    projects: [],
    documents: [],
  });
  if (result) { totalKb += result.kb || 0; console.log(`✓ (${result.kb} synced)`); }
  else console.log("✗");
}

// Push projects in batches
for (let i = 0; i < projectsData.length; i += BATCH_SIZE) {
  const batch = projectsData.slice(i, i + BATCH_SIZE);
  process.stdout.write(`  Projects batch ${Math.ceil(i / BATCH_SIZE) + 1}/${Math.ceil(projectsData.length / BATCH_SIZE)}... `);
  const result = convexRun("seedHelpers:batchImport", {
    workspaceId: WORKSPACE_ID,
    knowledgebaseEntries: [],
    projects: batch,
    documents: [],
  });
  if (result) { totalProjects += result.projects || 0; console.log(`✓ (${result.projects} new)`); }
  else console.log("✗");
}

// Push documents in batches (smaller batches due to content size)
const DOC_BATCH_SIZE = 5;
for (let i = 0; i < documentsData.length; i += DOC_BATCH_SIZE) {
  const batch = documentsData.slice(i, i + DOC_BATCH_SIZE);
  process.stdout.write(`  Docs batch ${Math.ceil(i / DOC_BATCH_SIZE) + 1}/${Math.ceil(documentsData.length / DOC_BATCH_SIZE)}... `);
  const result = convexRun("seedHelpers:batchImport", {
    workspaceId: WORKSPACE_ID,
    knowledgebaseEntries: [],
    projects: [],
    documents: batch,
  });
  if (result) { totalDocs += result.documents || 0; process.stdout.write(`✓ (${result.documents})\n`); }
  else process.stdout.write("✗\n");
}

console.log(`\n✅ Seed complete!`);
console.log(`   KB entries: ${totalKb}`);
console.log(`   Projects created: ${totalProjects}`);
console.log(`   Documents synced: ${totalDocs}`);
