/**
 * Contract Tests: Skills System
 *
 * Tests the skills catalog functionality using mocked Convex.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createSkill,
  getSkillById,
  getSkills,
  searchSkills,
  updateSkillTrustLevel,
  deleteSkill,
  isSkillTrusted,
  type CreateSkillInput,
} from "@/lib/skills";

// In-memory store simulating Convex
let skillStore: Record<string, unknown>[] = [];
let idCounter = 1;

// Mock the Convex API module with identifiable functions
vi.mock("../../../convex/_generated/api", () => ({
  api: {
    skills: {
      list: "skills:list",
      get: "skills:get",
      getByLegacyId: "skills:getByLegacyId",
      create: "skills:create",
      update: "skills:update",
      remove: "skills:remove",
      upsertByEntrypoint: "skills:upsertByEntrypoint",
    },
  },
}));

vi.mock("convex/browser", () => ({
  ConvexHttpClient: vi.fn().mockImplementation(() => ({
    query: vi.fn().mockImplementation((fn: string, args: Record<string, unknown>) => {
      if (fn === "skills:list") {
        const wsId = args?.workspaceId;
        return Promise.resolve(
          wsId ? skillStore.filter((s) => (s as {workspaceId?: string}).workspaceId === wsId) : [...skillStore],
        );
      }
      if (fn === "skills:get") {
        const id = args?.id as string;
        return Promise.resolve(skillStore.find((s) => (s as {_id: string})._id === id) ?? null);
      }
      if (fn === "skills:getByLegacyId") {
        return Promise.resolve(null);
      }
      return Promise.resolve(null);
    }),
    mutation: vi.fn().mockImplementation((fn: string, args: Record<string, unknown>) => {
      if (fn === "skills:create") {
        const id = `mock_skill_${idCounter++}`;
        skillStore.push({ _id: id, _creationTime: Date.now(), ...args });
        return Promise.resolve(id);
      }
      if (fn === "skills:update") {
        const id = args?.id as string;
        const idx = skillStore.findIndex((s) => (s as {_id: string})._id === id);
        if (idx >= 0) skillStore[idx] = { ...skillStore[idx], ...args };
        return Promise.resolve();
      }
      if (fn === "skills:remove") {
        const id = args?.id as string;
        const idx = skillStore.findIndex((s) => (s as {_id: string})._id === id);
        if (idx >= 0) {
          skillStore.splice(idx, 1);
          return Promise.resolve();
        }
        return Promise.reject(new Error(`Skill not found: ${id}`));
      }
      return Promise.resolve(null);
    }),
  })),
}));

const TEST_WORKSPACE_ID = "test_ws_skills";

describe("Skills System Contract Tests", () => {
  beforeEach(() => {
    skillStore = [];
    idCounter = 1;
  });

  describe("Skill Creation", () => {
    it("should create a local skill", async () => {
      const input: CreateSkillInput = {
        workspaceId: TEST_WORKSPACE_ID,
        source: "local",
        name: "Test Research Skill",
        description: "Analyzes user research transcripts",
        version: "1.0.0",
        trustLevel: "community",
        tags: ["research", "analysis"],
        promptTemplate: "Analyze the following transcript: {{transcript}}",
      };

      const skillId = await createSkill(input);
      expect(skillId).toBeDefined();

      const skill = await getSkillById(skillId);
      expect(skill).toBeDefined();
      expect(skill?.name).toBe("Test Research Skill");
      expect(skill?.source).toBe("local");
      expect(skill?.trustLevel).toBe("community");
    });

    it("should create a skill with input/output schema", async () => {
      const input: CreateSkillInput = {
        workspaceId: TEST_WORKSPACE_ID,
        source: "local",
        name: "PRD Generator",
        description: "Generates PRD from research",
        version: "1.0.0",
        trustLevel: "vetted",
        inputSchema: {
          type: "object",
          properties: {
            research: { type: "string", description: "Research content" },
            persona: { type: "string", description: "Target persona" },
          },
          required: ["research"],
        },
        outputSchema: {
          type: "object",
          properties: {
            prd: { type: "string", description: "Generated PRD" },
          },
        },
      };

      const skillId = await createSkill(input);
      const skill = await getSkillById(skillId);

      expect(skill?.inputSchema).toBeDefined();
      expect(
        (skill?.inputSchema as Record<string, unknown>)?.properties,
      ).toHaveProperty("research");
      expect(skill?.outputSchema).toBeDefined();
    });
  });

  describe("Skill Trust Levels", () => {
    it("should identify trusted skills (vetted)", async () => {
      const skillId = await createSkill({
        workspaceId: TEST_WORKSPACE_ID,
        source: "local",
        name: "Vetted Skill",
        trustLevel: "vetted",
      });
      const skill = await getSkillById(skillId);
      expect(isSkillTrusted(skill!)).toBe(true);
    });

    it("should identify untrusted skills (community)", async () => {
      const skillId = await createSkill({
        workspaceId: TEST_WORKSPACE_ID,
        source: "local",
        name: "Community Skill",
        trustLevel: "community",
      });
      const skill = await getSkillById(skillId);
      expect(isSkillTrusted(skill!)).toBe(false);
    });

    it("should update trust level", async () => {
      const skillId = await createSkill({
        workspaceId: TEST_WORKSPACE_ID,
        source: "local",
        name: "Upgradable Skill",
        trustLevel: "community",
      });

      let skill = await getSkillById(skillId);
      expect(skill?.trustLevel).toBe("community");

      await updateSkillTrustLevel(skillId, "vetted");
      skill = await getSkillById(skillId);
      expect(skill?.trustLevel).toBe("vetted");
    });
  });

  describe("Skill Search", () => {
    beforeEach(async () => {
      for (const s of [
        { name: "Research Analyzer", description: "Analyzes user research data", trustLevel: "vetted" as const },
        { name: "PRD Writer", description: "Writes product requirements", trustLevel: "community" as const },
        { name: "Prototype Builder", description: "Creates UI prototypes", trustLevel: "vetted" as const },
      ]) {
        await createSkill({ workspaceId: TEST_WORKSPACE_ID, source: "local", ...s });
      }
    });

    it("should search skills by name", async () => {
      const results = await searchSkills("Research", TEST_WORKSPACE_ID);
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.some((s) => s.name.includes("Research"))).toBe(true);
    });

    it("should search skills by description", async () => {
      const results = await searchSkills("requirements", TEST_WORKSPACE_ID);
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.some((s) => s.name === "PRD Writer")).toBe(true);
    });

    it("should get all skills for workspace", async () => {
      const allSkills = await getSkills(TEST_WORKSPACE_ID);
      expect(allSkills.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("Skill Deletion", () => {
    it("should delete a skill", async () => {
      const skillId = await createSkill({
        workspaceId: TEST_WORKSPACE_ID,
        source: "local",
        name: "Deletable Skill",
        trustLevel: "community",
      });

      let skill = await getSkillById(skillId);
      expect(skill).toBeDefined();

      const deleted = await deleteSkill(skillId);
      expect(deleted).toBe(true);

      skill = await getSkillById(skillId);
      expect(skill).toBeNull();
    });

    it("should return false when deleting non-existent skill", async () => {
      const deleted = await deleteSkill("nonexistent_skill_id");
      expect(deleted).toBe(false);
    });
  });
});
