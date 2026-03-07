import {
  getProjectDocumentRoute,
  getProjectRoute,
  getProjectRouteWithTab,
  getProjectTabFromSearchParam,
  getSignalIdFromSearchParam,
} from "@/lib/projects/navigation";

describe("project navigation helpers", () => {
  test("getProjectTabFromSearchParam: returns supported tabs", () => {
    expect(getProjectTabFromSearchParam("tasks")).toBe("tasks");
    expect(getProjectTabFromSearchParam("signals")).toBe("signals");
    expect(getProjectTabFromSearchParam("overview")).toBe("overview");
  });

  test("getProjectTabFromSearchParam: falls back to overview", () => {
    expect(getProjectTabFromSearchParam(undefined)).toBe("overview");
    expect(getProjectTabFromSearchParam("unknown")).toBe("overview");
  });

  test("getSignalIdFromSearchParam: trims and validates values", () => {
    expect(getSignalIdFromSearchParam(" signal_123 ")).toBe("signal_123");
    expect(getSignalIdFromSearchParam("   ")).toBeNull();
    expect(getSignalIdFromSearchParam(null)).toBeNull();
  });

  test("getProjectRoute: prefers workspace-scoped route when available", () => {
    expect(getProjectRoute("proj_123", "ws_456")).toBe(
      "/workspace/ws_456/projects/proj_123",
    );
    expect(getProjectRoute("proj_123")).toBe("/projects/proj_123");
  });

  test("getProjectDocumentRoute: prefers workspace-scoped document routes", () => {
    expect(getProjectDocumentRoute("proj_123", "doc_789", "ws_456")).toBe(
      "/workspace/ws_456/projects/proj_123/documents/doc_789",
    );
    expect(getProjectDocumentRoute("proj_123", "doc_789")).toBe(
      "/projects/proj_123/documents/doc_789",
    );
  });

  test("getProjectRouteWithTab: appends the requested tab", () => {
    expect(getProjectRouteWithTab("proj_123", "commands", "ws_456")).toBe(
      "/workspace/ws_456/projects/proj_123?tab=commands",
    );
  });
});
