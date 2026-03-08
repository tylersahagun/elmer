import { describe, expect, it } from "vitest";

import { getRealtimeJobsQueryArgs } from "../useRealtimeJobs";

describe("getRealtimeJobsQueryArgs", () => {
  it("skips the jobs query when the hook is disabled", () => {
    expect(
      getRealtimeJobsQueryArgs({
        workspaceId: "ws_123",
        enabled: false,
        isConvexAuthenticated: true,
      }),
    ).toBe("skip");
  });

  it("skips the jobs query before Convex auth is ready", () => {
    expect(
      getRealtimeJobsQueryArgs({
        workspaceId: "ws_123",
        enabled: true,
        isConvexAuthenticated: false,
      }),
    ).toBe("skip");
  });

  it("returns the workspace payload once Convex auth is ready", () => {
    expect(
      getRealtimeJobsQueryArgs({
        workspaceId: "ws_123",
        enabled: true,
        isConvexAuthenticated: true,
      }),
    ).toEqual({ workspaceId: "ws_123" });
  });
});
