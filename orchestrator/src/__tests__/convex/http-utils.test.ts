import { describe, expect, it } from "vitest";
import { resolveWorkspaceId } from "../../../convex/httpUtils";

describe("resolveWorkspaceId", () => {
  it("prefers the workspaceId query param", () => {
    const request = new Request("https://example.test/mcp/projects?workspaceId=query-id");

    const workspaceId = resolveWorkspaceId({
      request,
      body: { workspaceId: "body-id" },
      defaultWorkspaceId: "default-id",
    });

    expect(workspaceId).toBe("query-id");
  });

  it("falls back to the body workspaceId", () => {
    const request = new Request("https://example.test/mcp/projects");

    const workspaceId = resolveWorkspaceId({
      request,
      body: { workspaceId: "body-id" },
      defaultWorkspaceId: "default-id",
    });

    expect(workspaceId).toBe("body-id");
  });

  it("uses the default workspace when no override is provided", () => {
    const request = new Request("https://example.test/mcp/projects");

    const workspaceId = resolveWorkspaceId({
      request,
      body: {},
      defaultWorkspaceId: "default-id",
    });

    expect(workspaceId).toBe("default-id");
  });
});
