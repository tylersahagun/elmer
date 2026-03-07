import {
  derivePresenceContext,
  filterPresenceByProject,
  type PresenceEntry,
} from "../usePresence";

describe("usePresence helpers", () => {
  describe("derivePresenceContext", () => {
    test("extracts project and document ids from project document routes", () => {
      expect(
        derivePresenceContext("/workspace/ws_123/projects/project_456/documents/doc_789"),
      ).toEqual({
        location: "/workspace/ws_123/projects/project_456/documents/doc_789",
        projectId: "project_456",
        documentId: "doc_789",
      });
    });

    test("returns undefined ids when route has no project or document context", () => {
      expect(derivePresenceContext("/workspace/ws_123/signals")).toEqual({
        location: "/workspace/ws_123/signals",
        projectId: undefined,
        documentId: undefined,
      });
    });
  });

  describe("filterPresenceByProject", () => {
    const entries: PresenceEntry[] = [
      {
        _id: "presence_1",
        userId: "user_1",
        displayName: "Ada Lovelace",
        location: "/workspace/ws_123/projects/project_456",
        projectId: "project_456",
      },
      {
        _id: "presence_2",
        userId: "user_2",
        displayName: "Grace Hopper",
        location: "/workspace/ws_123/projects/project_999",
        projectId: "project_999",
      },
    ];

    test("returns only entries for the requested project", () => {
      expect(filterPresenceByProject(entries, "project_456")).toEqual([entries[0]]);
    });

    test("returns an empty list when entries or project id are missing", () => {
      expect(filterPresenceByProject(undefined, "project_456")).toEqual([]);
      expect(filterPresenceByProject(entries, undefined)).toEqual([]);
    });
  });
});
