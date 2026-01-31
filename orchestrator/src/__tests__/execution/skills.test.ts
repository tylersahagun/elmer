/**
 * Contract Tests: Skills System
 *
 * Tests the skills catalog functionality:
 * - Local skill management
 * - SkillsMP integration
 * - Trust levels and vetting
 * - Skill search
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import { workspaces, skills } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
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

// Test fixtures
const TEST_WORKSPACE_ID = `test_ws_${nanoid(8)}`;

describe("Skills System Contract Tests", () => {
  beforeAll(async () => {
    // Create test workspace
    await db.insert(workspaces).values({
      id: TEST_WORKSPACE_ID,
      name: "Test Workspace",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  afterAll(async () => {
    // Cleanup test data
    await db.delete(skills).where(eq(skills.workspaceId, TEST_WORKSPACE_ID));
    await db.delete(workspaces).where(eq(workspaces.id, TEST_WORKSPACE_ID));
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
      expect(skillId).toMatch(/^skill_/);

      const skill = await getSkillById(skillId);
      expect(skill).toBeDefined();
      expect(skill?.name).toBe("Test Research Skill");
      expect(skill?.source).toBe("local");
      expect(skill?.trustLevel).toBe("community");

      // Cleanup
      await db.delete(skills).where(eq(skills.id, skillId));
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
            sections: { type: "array", items: { type: "string" } },
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

      // Cleanup
      await db.delete(skills).where(eq(skills.id, skillId));
    });
  });

  describe("Skill Trust Levels", () => {
    it("should identify trusted skills (vetted)", async () => {
      const input: CreateSkillInput = {
        workspaceId: TEST_WORKSPACE_ID,
        source: "local",
        name: "Vetted Skill",
        description: "A vetted skill",
        version: "1.0.0",
        trustLevel: "vetted",
      };

      const skillId = await createSkill(input);
      const skill = await getSkillById(skillId);

      expect(isSkillTrusted(skill!)).toBe(true);

      // Cleanup
      await db.delete(skills).where(eq(skills.id, skillId));
    });

    it("should identify untrusted skills (community)", async () => {
      const input: CreateSkillInput = {
        workspaceId: TEST_WORKSPACE_ID,
        source: "local",
        name: "Community Skill",
        description: "A community skill",
        version: "1.0.0",
        trustLevel: "community",
      };

      const skillId = await createSkill(input);
      const skill = await getSkillById(skillId);

      expect(isSkillTrusted(skill!)).toBe(false);

      // Cleanup
      await db.delete(skills).where(eq(skills.id, skillId));
    });

    it("should update trust level", async () => {
      const input: CreateSkillInput = {
        workspaceId: TEST_WORKSPACE_ID,
        source: "local",
        name: "Upgradable Skill",
        description: "Will be upgraded",
        version: "1.0.0",
        trustLevel: "experimental",
      };

      const skillId = await createSkill(input);
      let skill = await getSkillById(skillId);
      expect(skill?.trustLevel).toBe("experimental");

      await updateSkillTrustLevel(skillId, "vetted");
      skill = await getSkillById(skillId);
      expect(skill?.trustLevel).toBe("vetted");

      // Cleanup
      await db.delete(skills).where(eq(skills.id, skillId));
    });
  });

  describe("Skill Search", () => {
    const skillIds: string[] = [];

    beforeAll(async () => {
      // Create several skills for search testing
      const testSkills: CreateSkillInput[] = [
        {
          workspaceId: TEST_WORKSPACE_ID,
          source: "local",
          name: "Research Analyzer",
          description: "Analyzes user research data",
          version: "1.0.0",
          trustLevel: "vetted",
          tags: ["research", "analysis"],
        },
        {
          workspaceId: TEST_WORKSPACE_ID,
          source: "local",
          name: "PRD Writer",
          description: "Writes product requirements",
          version: "1.0.0",
          trustLevel: "community",
          tags: ["prd", "documentation"],
        },
        {
          workspaceId: TEST_WORKSPACE_ID,
          source: "local",
          name: "Prototype Builder",
          description: "Creates UI prototypes",
          version: "1.0.0",
          trustLevel: "vetted",
          tags: ["prototype", "ui"],
        },
      ];

      for (const skill of testSkills) {
        const id = await createSkill(skill);
        skillIds.push(id);
      }
    });

    afterAll(async () => {
      for (const id of skillIds) {
        await db.delete(skills).where(eq(skills.id, id));
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
      const input: CreateSkillInput = {
        workspaceId: TEST_WORKSPACE_ID,
        source: "local",
        name: "Deletable Skill",
        description: "Will be deleted",
        version: "1.0.0",
        trustLevel: "community",
      };

      const skillId = await createSkill(input);
      let skill = await getSkillById(skillId);
      expect(skill).toBeDefined();

      const deleted = await deleteSkill(skillId);
      expect(deleted).toBe(true);

      skill = await getSkillById(skillId);
      expect(skill).toBeNull();
    });

    it("should return false when deleting non-existent skill", async () => {
      const deleted = await deleteSkill("skill_nonexistent123");
      expect(deleted).toBe(false);
    });
  });
});
