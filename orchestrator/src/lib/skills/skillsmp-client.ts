/**
 * SkillsMP API Client
 * 
 * Client for the SkillsMP skills marketplace API.
 * Supports keyword search, AI semantic search, and skill fetching.
 * 
 * API Documentation: https://skillsmp.com/docs/api
 */

const SKILLSMP_API_BASE = "https://skillsmp.com/api/v1";

// ============================================
// TYPES
// ============================================

export interface SkillsMPSkill {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  stars: number;
  downloads: number;
  tags: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
  url: string;
  repository?: string;
  promptTemplate?: string;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
}

export interface SearchResult {
  data: SkillsMPSkill[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface SearchParams {
  q: string;
  page?: number;
  limit?: number;
  sortBy?: "stars" | "recent" | "downloads";
  category?: string;
}

export interface SkillsMPError {
  code: string;
  message: string;
}

// ============================================
// CLIENT CLASS
// ============================================

export class SkillsMPClient {
  private apiKey: string | null;
  private baseUrl: string;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || process.env.SKILLMP_API_KEY || null;
    this.baseUrl = baseUrl || SKILLSMP_API_BASE;
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData: SkillsMPError;
      try {
        const json = await response.json();
        errorData = json.error || { code: "UNKNOWN", message: response.statusText };
      } catch {
        errorData = { code: "UNKNOWN", message: response.statusText };
      }

      throw new SkillsMPAPIError(response.status, errorData.code, errorData.message);
    }

    return response.json();
  }

  /**
   * Search skills by keyword
   */
  async search(params: SearchParams): Promise<SearchResult> {
    const searchParams = new URLSearchParams({
      q: params.q,
      page: String(params.page || 1),
      limit: String(Math.min(params.limit || 20, 100)),
    });

    if (params.sortBy) {
      searchParams.set("sortBy", params.sortBy);
    }
    if (params.category) {
      searchParams.set("category", params.category);
    }

    return this.fetch<SearchResult>(`/skills/search?${searchParams}`);
  }

  /**
   * AI semantic search for skills
   */
  async aiSearch(query: string, limit = 10): Promise<SearchResult> {
    const searchParams = new URLSearchParams({
      q: query,
      limit: String(Math.min(limit, 50)),
    });

    return this.fetch<SearchResult>(`/skills/ai-search?${searchParams}`);
  }

  /**
   * Get a specific skill by ID
   */
  async getSkill(skillId: string): Promise<SkillsMPSkill> {
    return this.fetch<SkillsMPSkill>(`/skills/${skillId}`);
  }

  /**
   * Get skill content/prompt template
   */
  async getSkillContent(skillId: string): Promise<string> {
    const skill = await this.getSkill(skillId);
    return skill.promptTemplate || "";
  }

  /**
   * Check if API key is valid
   */
  async validateApiKey(): Promise<boolean> {
    try {
      await this.search({ q: "test", limit: 1 });
      return true;
    } catch (error) {
      if (error instanceof SkillsMPAPIError) {
        return error.code !== "INVALID_API_KEY" && error.code !== "MISSING_API_KEY";
      }
      return false;
    }
  }
}

// ============================================
// ERROR CLASS
// ============================================

export class SkillsMPAPIError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "SkillsMPAPIError";
    this.status = status;
    this.code = code;
  }
}

// ============================================
// SINGLETON
// ============================================

let clientInstance: SkillsMPClient | null = null;

export function getSkillsMPClient(): SkillsMPClient {
  if (!clientInstance) {
    clientInstance = new SkillsMPClient();
  }
  return clientInstance;
}

export function setSkillsMPApiKey(apiKey: string): void {
  clientInstance = new SkillsMPClient(apiKey);
}
