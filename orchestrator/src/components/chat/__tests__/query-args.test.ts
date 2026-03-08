import { describe, expect, it } from "vitest";

import { getListThreadsQueryArgs } from "@/lib/chat/query-args";

describe("chat query args", () => {
  describe("getListThreadsQueryArgs", () => {
    it("returns skip when the signed-in user id is missing", () => {
      expect(
        getListThreadsQueryArgs({
          isAuthenticated: true,
          userId: "",
          workspaceId: "ws_123",
        }),
      ).toBe("skip");
    });

    it("includes userId in the listThreads query contract", () => {
      expect(
        getListThreadsQueryArgs({
          isAuthenticated: true,
          userId: "user_123",
          workspaceId: "ws_123",
        }),
      ).toEqual({
        workspaceId: "ws_123",
        userId: "user_123",
      });
    });
  });
});
