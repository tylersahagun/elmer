/**
 * useStreamingDiscovery — STUB
 *
 * The discovery SSE stream (/api/discovery/stream) has been deleted as part
 * of the Convex migration (GTM-37). This hook will be re-implemented in
 * Phase 2 (GTM-44) using Convex Actions + useQuery for real-time progress.
 *
 * The stub keeps all callers compiling without changes.
 */

import type {
  DiscoveryResult,
  DiscoveryProgress,
  DiscoveredInitiative,
  DiscoveredContextPath,
  DiscoveredAgent,
  DiscoveredSubmodule,
} from "@/lib/discovery/types";

interface UseStreamingDiscoveryOptions {
  workspaceId: string;
  enabled?: boolean;
  onInitiativeFound?: (initiative: DiscoveredInitiative) => void;
  onContextPathFound?: (contextPath: DiscoveredContextPath) => void;
  onAgentFound?: (agent: DiscoveredAgent) => void;
  onComplete?: (result: DiscoveryResult) => void;
  onError?: (error: string) => void;
}

interface UseStreamingDiscoveryReturn {
  isScanning: boolean;
  progress: DiscoveryProgress | null;
  result: DiscoveryResult | null;
  error: string | null;
  initiatives: DiscoveredInitiative[];
  contextPaths: DiscoveredContextPath[];
  agents: DiscoveredAgent[];
  submodules: DiscoveredSubmodule[];
  scanningSubmodules: Set<string>;
  startDiscovery: () => void;
  cancelDiscovery: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useStreamingDiscovery(
  _options: UseStreamingDiscoveryOptions,
): UseStreamingDiscoveryReturn {
  return {
    isScanning: false,
    progress: null,
    result: null,
    error: "Discovery will be re-implemented in Phase 2 (GTM-44).",
    initiatives: [],
    contextPaths: [],
    agents: [],
    submodules: [],
    scanningSubmodules: new Set(),
    startDiscovery: () => {},
    cancelDiscovery: () => {},
  };
}
