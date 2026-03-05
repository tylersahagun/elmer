import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

type PageConfig = {
  id: string;
  folder?: string;
};

type DatabaseConfig = {
  id: string;
  folder?: string;
};

type Config = {
  pages: PageConfig[];
  databases: DatabaseConfig[];
};

type RegistryItem = {
  filePath: string;
  lastSyncedAt: string;
  notionLastEditedTime?: string;
};

type Registry = {
  items: Record<string, RegistryItem>;
};

type NotionRichText = {
  plain_text?: string;
};

const NOTION_VERSION = "2022-06-28";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const defaultSyncRoot = path.resolve(scriptDir, "../../..", "NotionSync");
const syncRoot = process.env.NOTION_SYNC_ROOT
  ? path.resolve(process.env.NOTION_SYNC_ROOT)
  : defaultSyncRoot;
const registryPath = path.join(syncRoot, ".sync", "index.json");
const configPath = path.resolve(scriptDir, "..", "config.json");

const notionToken = process.env.NOTION_TOKEN;
if (!notionToken) {
  throw new Error("Missing NOTION_TOKEN environment variable.");
}

const args = new Set(process.argv.slice(2));
const runPull = args.has("--pull");
const runPush = args.has("--push");
const runSync = args.has("--sync") || (!runPull && !runPush);
const pagesOnly = args.has("--pages-only");
const databasesOnly = args.has("--databases-only");

if (pagesOnly && databasesOnly) {
  throw new Error("Use only one of --pages-only or --databases-only.");
}

const toIso = (value: Date | number | string) => {
  const date = typeof value === "string" ? new Date(value) : new Date(value);
  return date.toISOString();
};

const toDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return null;
  return date;
};

const richTextToPlain = (richText?: NotionRichText[]) =>
  (richText ?? []).map((item) => item.plain_text ?? "").join("");

const sanitizeFilename = (title: string) => {
  const ascii = title
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "");
  const cleaned = ascii
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
  return cleaned.length > 0 ? cleaned.replace(/\s+/g, "-") : "untitled";
};

const notionIdSuffix = (id: string) =>
  id.replace(/-/g, "").slice(-8) || "unknown";

const ensureDir = async (dirPath: string) => {
  await fs.mkdir(dirPath, { recursive: true });
};

const loadConfig = async (): Promise<Config> => {
  const raw = await fs.readFile(configPath, "utf-8");
  return JSON.parse(raw) as Config;
};

const loadRegistry = async (): Promise<Registry> => {
  try {
    const raw = await fs.readFile(registryPath, "utf-8");
    if (!raw.trim()) {
      return { items: {} };
    }
    return JSON.parse(raw) as Registry;
  } catch {
    return { items: {} };
  }
};

const saveRegistry = async (registry: Registry) => {
  await ensureDir(path.dirname(registryPath));
  await fs.writeFile(registryPath, JSON.stringify(registry, null, 2));
};

const yamlEscape = (value: string) => {
  const needsQuotes = /[:#\n\r\t]/.test(value) || value.trim() !== value;
  if (!needsQuotes) return value;
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
};

const formatFrontmatter = (data: Record<string, string | undefined>) => {
  const orderedKeys = [
    "notion_id",
    "notion_url",
    "notion_last_edited_time",
    "sync_last_synced_at",
    "source",
    "database_id",
  ];
  const lines = orderedKeys
    .map((key) => {
      const value = data[key];
      if (!value) return null;
      return `${key}: ${yamlEscape(value)}`;
    })
    .filter(Boolean) as string[];

  if (lines.length === 0) return "";
  return `---\n${lines.join("\n")}\n---\n\n`;
};

const parseFrontmatter = (content: string) => {
  if (!content.startsWith("---\n")) {
    return { data: {}, body: content };
  }
  const endIndex = content.indexOf("\n---", 4);
  if (endIndex === -1) {
    return { data: {}, body: content };
  }
  const frontmatterRaw = content.slice(4, endIndex).trim();
  const body = content.slice(endIndex + 4).replace(/^\s+/, "");
  const data: Record<string, string> = {};
  for (const line of frontmatterRaw.split("\n")) {
    const [key, ...rest] = line.split(":");
    if (!key || rest.length === 0) continue;
    const value = rest.join(":").trim();
    data[key.trim()] = value.replace(/^"|"$/g, "");
  }
  return { data, body };
};

const notionFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(`https://api.notion.com/v1${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${notionToken}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Notion API error ${response.status}: ${message}`);
  }

  return (await response.json()) as T;
};

const fetchPage = (pageId: string) =>
  notionFetch<Record<string, any>>(`/pages/${pageId}`);

const fetchDatabase = (databaseId: string) =>
  notionFetch<Record<string, any>>(`/databases/${databaseId}`);

const queryDatabase = async (databaseId: string) => {
  let hasMore = true;
  let startCursor: string | undefined;
  const results: Record<string, any>[] = [];
  while (hasMore) {
    const payload: Record<string, any> = {
      page_size: 100,
    };
    if (startCursor) {
      payload.start_cursor = startCursor;
    }
    const response = await notionFetch<{
      results: Record<string, any>[];
      has_more: boolean;
      next_cursor?: string;
    }>(`/databases/${databaseId}/query`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    results.push(...response.results);
    hasMore = response.has_more;
    startCursor = response.next_cursor ?? undefined;
  }
  return results;
};

const listBlockChildren = async (blockId: string) => {
  let hasMore = true;
  let startCursor: string | undefined;
  const results: Record<string, any>[] = [];
  while (hasMore) {
    const params = new URLSearchParams({ page_size: "100" });
    if (startCursor) {
      params.set("start_cursor", startCursor);
    }
    const response = await notionFetch<{
      results: Record<string, any>[];
      has_more: boolean;
      next_cursor?: string;
    }>(`/blocks/${blockId}/children?${params.toString()}`);
    results.push(...response.results);
    hasMore = response.has_more;
    startCursor = response.next_cursor ?? undefined;
  }
  return results;
};

const archiveBlock = async (blockId: string) => {
  await notionFetch(`/blocks/${blockId}`, {
    method: "PATCH",
    body: JSON.stringify({ archived: true }),
  });
};

const appendBlockChildren = async (blockId: string, children: any[]) => {
  await notionFetch(`/blocks/${blockId}/children`, {
    method: "PATCH",
    body: JSON.stringify({ children }),
  });
};

const replacePageContent = async (pageId: string, blocks: any[]) => {
  const existing = await listBlockChildren(pageId);
  for (const block of existing) {
    await archiveBlock(block.id);
  }
  for (let i = 0; i < blocks.length; i += 100) {
    await appendBlockChildren(pageId, blocks.slice(i, i + 100));
  }
};

const extractTitle = (page: Record<string, any>) => {
  const properties = page.properties ?? {};
  for (const prop of Object.values(properties)) {
    if (prop && prop.type === "title") {
      return richTextToPlain(prop.title);
    }
  }
  return "Untitled";
};

const blocksToMarkdown = (blocks: Record<string, any>[]) => {
  const lines: string[] = [];
  for (const block of blocks) {
    const type = block.type;
    const value = block[type];
    if (!value) continue;
    const text = richTextToPlain(value.rich_text);
    switch (type) {
      case "paragraph":
        lines.push(text);
        break;
      case "heading_1":
        lines.push(`# ${text}`);
        break;
      case "heading_2":
        lines.push(`## ${text}`);
        break;
      case "heading_3":
        lines.push(`### ${text}`);
        break;
      case "bulleted_list_item":
        lines.push(`- ${text}`);
        break;
      case "numbered_list_item":
        lines.push(`1. ${text}`);
        break;
      case "to_do":
        lines.push(`- [${value.checked ? "x" : " "}] ${text}`);
        break;
      case "quote":
        lines.push(`> ${text}`);
        break;
      case "code":
        lines.push(
          `\`\`\`${value.language ?? ""}\n${value.rich_text
            .map((item: NotionRichText) => item.plain_text ?? "")
            .join("")}\n\`\`\``
        );
        break;
      case "divider":
        lines.push("---");
        break;
      case "callout":
        lines.push(`> ${text}`);
        break;
      case "image": {
        const url =
          value.type === "external" ? value.external.url : value.file.url;
        lines.push(`![image](${url})`);
        break;
      }
      default:
        if (text) {
          lines.push(text);
        }
    }
    lines.push("");
  }
  return lines.join("\n").trim() + "\n";
};

const markdownToBlocks = (content: string) => {
  const paragraphs = content
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);

  const blocks: any[] = [];
  for (const paragraph of paragraphs) {
    if (paragraph.startsWith("# ")) {
      blocks.push({
        type: "heading_1",
        heading_1: { rich_text: [{ type: "text", text: { content: paragraph.slice(2) } }] },
      });
      continue;
    }
    if (paragraph.startsWith("## ")) {
      blocks.push({
        type: "heading_2",
        heading_2: { rich_text: [{ type: "text", text: { content: paragraph.slice(3) } }] },
      });
      continue;
    }
    if (paragraph.startsWith("### ")) {
      blocks.push({
        type: "heading_3",
        heading_3: { rich_text: [{ type: "text", text: { content: paragraph.slice(4) } }] },
      });
      continue;
    }
    blocks.push({
      type: "paragraph",
      paragraph: {
        rich_text: [{ type: "text", text: { content: paragraph } }],
      },
    });
  }

  if (blocks.length === 0) {
    blocks.push({
      type: "paragraph",
      paragraph: { rich_text: [] },
    });
  }

  return blocks;
};

const getFilePathForItem = (
  notionId: string,
  title: string,
  folder: string,
  registry: Registry
) => {
  const existing = registry.items[notionId];
  if (existing?.filePath) return existing.filePath;
  const filename = `${sanitizeFilename(title)}-${notionIdSuffix(notionId)}.md`;
  return path.join(syncRoot, folder, filename);
};

const upsertRegistry = (
  registry: Registry,
  notionId: string,
  filePath: string,
  notionLastEditedTime: string
) => {
  registry.items[notionId] = {
    filePath,
    lastSyncedAt: toIso(new Date()),
    notionLastEditedTime,
  };
};

const writeMarkdownFile = async (
  filePath: string,
  frontmatter: Record<string, string | undefined>,
  content: string
) => {
  await ensureDir(path.dirname(filePath));
  const fullContent = `${formatFrontmatter(frontmatter)}${content.trim()}\n`;
  await fs.writeFile(filePath, fullContent);
};

const syncFromNotionPage = async (
  page: Record<string, any>,
  folder: string,
  registry: Registry,
  source: "page" | "database",
  databaseId?: string
) => {
  const title = extractTitle(page);
  const filePath = getFilePathForItem(page.id, title, folder, registry);
  const blocks = await listBlockChildren(page.id);
  const content = blocksToMarkdown(blocks);
  const frontmatter = {
    notion_id: page.id,
    notion_url: page.url,
    notion_last_edited_time: page.last_edited_time,
    sync_last_synced_at: toIso(new Date()),
    source,
    database_id: databaseId,
  };
  await writeMarkdownFile(filePath, frontmatter, content);
  upsertRegistry(registry, page.id, filePath, page.last_edited_time);
};

const syncToNotionFromFile = async (
  filePath: string,
  registry: Registry,
  page?: Record<string, any>
) => {
  const raw = await fs.readFile(filePath, "utf-8");
  const { data, body } = parseFrontmatter(raw);
  const notionId = data.notion_id;
  if (!notionId) return null;

  const currentPage = page ?? (await fetchPage(notionId));
  const blocks = markdownToBlocks(body);
  await replacePageContent(notionId, blocks);

  const refreshed = await fetchPage(notionId);
  const frontmatter = {
    notion_id: refreshed.id,
    notion_url: refreshed.url,
    notion_last_edited_time: refreshed.last_edited_time,
    sync_last_synced_at: toIso(new Date()),
    source: data.source ?? "page",
    database_id: data.database_id,
  };

  await writeMarkdownFile(filePath, frontmatter, body);
  upsertRegistry(registry, notionId, filePath, refreshed.last_edited_time);
  return refreshed;
};

const getFileMtime = async (filePath: string) => {
  try {
    const stats = await fs.stat(filePath);
    return stats.mtime;
  } catch {
    return null;
  }
};

const chooseSyncDirection = (
  fileMtime: Date | null,
  notionLastEdited: Date | null,
  lastSyncedAt: Date | null
) => {
  if (!fileMtime && notionLastEdited) return "pull";
  if (fileMtime && !notionLastEdited) return "push";

  if (!fileMtime || !notionLastEdited) return "skip";

  const fileChanged = !lastSyncedAt || fileMtime > lastSyncedAt;
  const notionChanged = !lastSyncedAt || notionLastEdited > lastSyncedAt;

  if (fileChanged && notionChanged) {
    return fileMtime >= notionLastEdited ? "push" : "pull";
  }
  if (fileChanged) return "push";
  if (notionChanged) return "pull";
  return "skip";
};

const syncPage = async (
  page: Record<string, any>,
  folder: string,
  registry: Registry,
  source: "page" | "database",
  databaseId?: string
) => {
  const title = extractTitle(page);
  const filePath = getFilePathForItem(page.id, title, folder, registry);
  const rawExists = await getFileMtime(filePath);
  if (!rawExists) {
    await syncFromNotionPage(page, folder, registry, source, databaseId);
    return;
  }

  const raw = await fs.readFile(filePath, "utf-8");
  const { data } = parseFrontmatter(raw);
  const lastSyncedAt = toDate(data.sync_last_synced_at);
  const fileMtime = rawExists;
  const notionLastEdited = toDate(page.last_edited_time);

  const direction = chooseSyncDirection(fileMtime, notionLastEdited, lastSyncedAt);
  if (direction === "pull") {
    await syncFromNotionPage(page, folder, registry, source, databaseId);
  } else if (direction === "push") {
    await syncToNotionFromFile(filePath, registry, page);
  }
};

const walkMarkdownFiles = async (dirPath: string): Promise<string[]> => {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const results: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === ".sync") continue;
      results.push(...(await walkMarkdownFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(fullPath);
    }
  }
  return results;
};

const runPullPages = async (config: Config, registry: Registry) => {
  for (const pageConfig of config.pages) {
    const page = await fetchPage(pageConfig.id);
    const folder = pageConfig.folder ?? "Pages";
    await syncFromNotionPage(page, folder, registry, "page");
  }
};

const runPullDatabases = async (config: Config, registry: Registry) => {
  for (const databaseConfig of config.databases) {
    const pages = await queryDatabase(databaseConfig.id);
    const folder = databaseConfig.folder ?? "Databases";
    for (const page of pages) {
      await syncFromNotionPage(
        page,
        folder,
        registry,
        "database",
        databaseConfig.id
      );
    }
  }
};

const runPushOnly = async (registry: Registry) => {
  await ensureDir(syncRoot);
  const files = await walkMarkdownFiles(syncRoot);
  for (const filePath of files) {
    await syncToNotionFromFile(filePath, registry);
  }
};

const runFullSync = async (config: Config, registry: Registry) => {
  const handledNotionIds = new Set<string>();

  for (const pageConfig of config.pages) {
    const page = await fetchPage(pageConfig.id);
    const folder = pageConfig.folder ?? "Pages";
    await syncPage(page, folder, registry, "page");
    handledNotionIds.add(page.id);
  }

  for (const databaseConfig of config.databases) {
    const pages = await queryDatabase(databaseConfig.id);
    const folder = databaseConfig.folder ?? "Databases";
    for (const page of pages) {
      await syncPage(page, folder, registry, "database", databaseConfig.id);
      handledNotionIds.add(page.id);
    }
  }

  await ensureDir(syncRoot);
  const files = await walkMarkdownFiles(syncRoot);
  for (const filePath of files) {
    const raw = await fs.readFile(filePath, "utf-8");
    const { data } = parseFrontmatter(raw);
    if (!data.notion_id || handledNotionIds.has(data.notion_id)) {
      continue;
    }
    await syncToNotionFromFile(filePath, registry);
  }
};

const runPagesOnlySync = async (config: Config, registry: Registry) => {
  for (const pageConfig of config.pages) {
    const page = await fetchPage(pageConfig.id);
    const folder = pageConfig.folder ?? "Pages";
    await syncPage(page, folder, registry, "page");
  }
};

const runDatabasesOnlySync = async (config: Config, registry: Registry) => {
  for (const databaseConfig of config.databases) {
    const pages = await queryDatabase(databaseConfig.id);
    const folder = databaseConfig.folder ?? "Databases";
    for (const page of pages) {
      await syncPage(page, folder, registry, "database", databaseConfig.id);
    }
  }
};

const main = async () => {
  const config = await loadConfig();
  const registry = await loadRegistry();

  if (runPull) {
    if (pagesOnly) {
      await runPullPages(config, registry);
    } else if (databasesOnly) {
      await runPullDatabases(config, registry);
    } else {
      await runPullPages(config, registry);
      await runPullDatabases(config, registry);
    }
  } else if (runPush) {
    await runPushOnly(registry);
  } else if (runSync) {
    if (pagesOnly) {
      await runPagesOnlySync(config, registry);
    } else if (databasesOnly) {
      await runDatabasesOnlySync(config, registry);
    } else {
      await runFullSync(config, registry);
    }
  }

  await saveRegistry(registry);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
