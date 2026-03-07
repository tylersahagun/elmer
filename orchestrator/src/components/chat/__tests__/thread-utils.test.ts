import { describe, expect, it } from "vitest";

import {
  deriveThreadTitle,
  findReusableContextThread,
  getThreadContextLabel,
  shouldRetitleThread,
} from "@/lib/chat/thread-utils";

describe("thread utils", () => {
  describe("deriveThreadTitle", () => {
    it("collapses whitespace and uses the first user message as the title", () => {
      expect(
        deriveThreadTitle("  Draft   the PRD for the internal alpha reset  "),
      ).toBe("Draft the PRD for the internal alpha reset");
    });

    it("truncates long titles without dropping inspectability", () => {
      expect(
        deriveThreadTitle(
          "This is a very long thread title that should be truncated before it overflows the thread rail",
          32,
        ),
      ).toBe("This is a very long thread titl…");
    });

    it("falls back to the default title for empty input", () => {
      expect(deriveThreadTitle("   ")).toBe("New conversation");
    });
  });

  describe("getThreadContextLabel", () => {
    it("maps known context types to compact labels", () => {
      expect(getThreadContextLabel("project")).toBe("Project");
      expect(getThreadContextLabel("job")).toBe("Run");
      expect(getThreadContextLabel("document")).toBe("Doc");
      expect(getThreadContextLabel("signal")).toBe("Signal");
    });

    it("returns null for unknown context types", () => {
      expect(getThreadContextLabel("workspace")).toBeNull();
      expect(getThreadContextLabel(undefined)).toBeNull();
    });
  });

  describe("findReusableContextThread", () => {
    it("returns the matching non-archived context thread", () => {
      const reusable = findReusableContextThread(
        [
          {
            isArchived: true,
            contextEntityType: "project",
            contextEntityId: "proj_1",
            title: "Old archived thread",
          },
          {
            isArchived: false,
            contextEntityType: "project",
            contextEntityId: "proj_1",
            title: "Current project thread",
          },
        ],
        "project",
        "proj_1",
      );

      expect(reusable?.title).toBe("Current project thread");
    });

    it("returns undefined when only unrelated threads exist", () => {
      expect(
        findReusableContextThread(
          [
            {
              isArchived: false,
              contextEntityType: "job",
              contextEntityId: "job_1",
            },
          ],
          "project",
          "proj_1",
        ),
      ).toBeUndefined();
    });
  });

  describe("shouldRetitleThread", () => {
    it("only retitles placeholder threads", () => {
      expect(shouldRetitleThread("New conversation", "About: Reset lane")).toBe(
        true,
      );
      expect(shouldRetitleThread("Existing title", "About: Reset lane")).toBe(
        false,
      );
      expect(shouldRetitleThread("New conversation", "New conversation")).toBe(
        false,
      );
    });
  });
});
