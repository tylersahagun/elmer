import type { WorkspaceSettings } from "@/lib/db/schema";

export type TrustLevel = "untrusted" | "experimental" | "community" | "vetted";

export interface AgentTrustConfig {
  level: TrustLevel;
  allowedTools: string[];
  requiresApproval: boolean;
  canWriteFiles: boolean;
  canAccessNetwork: boolean;
}

export interface AgentSecuritySettings {
  trustLevel?: TrustLevel;
  allowedTools?: string[];
  allowedGitHubOrgs?: string[];
  blockedGitHubRepos?: string[];
  requireVerifiedOwner?: boolean;
}

export const TRUST_LEVELS: Record<TrustLevel, AgentTrustConfig> = {
  untrusted: {
    level: "untrusted",
    allowedTools: ["get_project_context", "get_workspace_context"],
    requiresApproval: true,
    canWriteFiles: false,
    canAccessNetwork: false,
  },
  experimental: {
    level: "experimental",
    allowedTools: ["get_project_context", "get_workspace_context", "save_document"],
    requiresApproval: true,
    canWriteFiles: true,
    canAccessNetwork: false,
  },
  community: {
    level: "community",
    allowedTools: ["*"],
    requiresApproval: false,
    canWriteFiles: true,
    canAccessNetwork: false,
  },
  vetted: {
    level: "vetted",
    allowedTools: ["*", "COMPOSIO_*"],
    requiresApproval: false,
    canWriteFiles: true,
    canAccessNetwork: true,
  },
};

const DEFAULT_TRUST_LEVEL: TrustLevel = "community";

const SUSPICIOUS_PATTERNS: RegExp[] = [
  /ignore previous instructions/i,
  /system prompt/i,
  /developer message/i,
  /override (?:all|the) instructions/i,
  /act as .*system/i,
  /you are chatgpt/i,
];

const MAX_PROMPT_CHARS = 50_000;

export function getAgentSecuritySettings(
  settings?: WorkspaceSettings
): AgentSecuritySettings {
  return settings?.agentSecurity ?? {};
}

export function getTrustConfig(
  settings?: WorkspaceSettings
): AgentTrustConfig {
  const trustLevel =
    settings?.agentSecurity?.trustLevel ?? DEFAULT_TRUST_LEVEL;
  return TRUST_LEVELS[trustLevel];
}

export function isToolAllowed(
  toolName: string,
  settings?: WorkspaceSettings
): boolean {
  const config = getTrustConfig(settings);
  const allowlist = settings?.agentSecurity?.allowedTools ?? config.allowedTools;

  if (allowlist.includes("*")) {
    return true;
  }

  if (allowlist.includes(toolName)) {
    return true;
  }

  return allowlist.some((pattern) => {
    if (pattern.endsWith("*")) {
      return toolName.startsWith(pattern.replace("*", ""));
    }
    return false;
  });
}

export function sanitizePromptContent(content: string): string {
  if (!content) {
    return "";
  }

  const trimmed = content.slice(0, MAX_PROMPT_CHARS);
  const lines = trimmed.split("\n");
  const filtered = lines.filter((line) => {
    return !SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(line));
  });

  return filtered.join("\n").trim();
}
