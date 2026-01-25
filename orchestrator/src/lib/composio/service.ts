import { Composio } from "@composio/core";
import { getWorkspace, updateWorkspace } from "@/lib/db/queries";

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
    return client.tools.execute(toolName, {
      userId,
      arguments: args,
    });
  }

  async listTools(workspaceId: string, toolkits?: string[]) {
    const client = await this.getClient(workspaceId);
    const userId = this.getComposioUserId(workspaceId);
    return client.tools.get(userId, { toolkits });
  }

  async connectService(
    workspaceId: string,
    serviceName: string,
    callbackUrl: string
  ) {
    const client = await this.getClient(workspaceId);
    const userId = this.getComposioUserId(workspaceId);
    const request = await client.connectedAccounts.link(userId, {
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
