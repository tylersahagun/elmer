import { Composio } from "@composio/core";
import { getWorkspace, updateWorkspace } from "@/lib/db/queries";

// NOTE: Composio SDK has significant API changes. These type casts are temporary.
// TODO: Update to proper Composio SDK v2 API when stable
/* eslint-disable @typescript-eslint/no-explicit-any */

export class ComposioService {
  async getClient(workspaceId: string): Promise<Composio> {
    const workspace = await getWorkspace(workspaceId);
    const apiKey = workspace?.settings?.composio?.apiKey;
    if (!apiKey) {
      throw new Error("Composio API key not configured");
    }
    return new Composio({ apiKey });
  }

  getComposioUserId(workspaceId: string): string {
    return `workspace-${workspaceId}`;
  }

  async executeTool(
    workspaceId: string,
    toolName: string,
    args: Record<string, unknown>
  ) {
    const client = await this.getClient(workspaceId);
    const userId = this.getComposioUserId(workspaceId);
    return (client.tools as any).execute(toolName, {
      userId,
      arguments: args,
    });
  }

  async listTools(workspaceId: string, toolkits?: string[]) {
    const client = await this.getClient(workspaceId);
    const userId = this.getComposioUserId(workspaceId);
    // Pass toolkits param only if defined (Composio SDK type requires explicit values)
    const tools = client.tools as any;
    if (toolkits && toolkits.length > 0) {
      return tools.get(userId, { toolkits });
    }
    return tools.get(userId, {});
  }

  async connectService(
    workspaceId: string,
    serviceName: string,
    callbackUrl: string
  ) {
    const client = await this.getClient(workspaceId);
    const userId = this.getComposioUserId(workspaceId);
    const accounts = client.connectedAccounts as any;
    const request = await accounts.link(userId, {
      toolkit: serviceName,
      callbackUrl,
    });
    return request;
  }

  async updateWorkspaceComposioSettings(
    workspaceId: string,
    settings: { apiKey?: string; enabled?: boolean; connectedServices?: string[] }
  ) {
    const workspace = await getWorkspace(workspaceId);
    const existing = workspace?.settings?.composio || {};
    return updateWorkspace(workspaceId, {
      settings: {
        ...workspace?.settings,
        composio: {
          ...existing,
          ...settings,
        },
      },
    });
  }
}

export const composioService = new ComposioService();
