/**
 * Contract Tests: Stage Recipes
 * 
 * Tests the stage recipes (skills per stage) system:
 * - Recipe CRUD
 * - Gates validation
 * - Automation levels
 * - Trust enforcement
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { db } from "@/lib/db";
import { workspaces, skills, stageRecipes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import {
  createSkill,
  createStageRecipe,
  getStageRecipe,
  getAllStageRecipes,
  updateStageRecipe,
  deleteStageRecipe,
  validateRecipe,
  canRunFullyAuto,
  initializeDefaultRecipes,
  type CreateSkillInput,
  type CreateRecipeInput,
} from "@/lib/skills";

// Test fixtures
const TEST_WORKSPACE_ID = `test_ws_${nanoid(8)}`;

describe("Stage Recipes Contract Tests", () => {
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
    await db.delete(stageRecipes).where(eq(stageRecipes.workspaceId, TEST_WORKSPACE_ID));
    await db.delete(skills).where(eq(skills.workspaceId, TEST_WORKSPACE_ID));
    await db.delete(workspaces).where(eq(workspaces.id, TEST_WORKSPACE_ID));
  });

  describe("Recipe CRUD", () => {
    it("should create a stage recipe with defaults", async () => {
      const input: CreateRecipeInput = {
        workspaceId: TEST_WORKSPACE_ID,
        stage: "inbox",
      };

      const recipeId = await createStageRecipe(input);
      expect(recipeId).toBeDefined();
      expect(recipeId).toMatch(/^recipe_/);

      const recipe = await getStageRecipe(TEST_WORKSPACE_ID, "inbox");
      expect(recipe).toBeDefined();
      expect(recipe?.stage).toBe("inbox");
      expect(recipe?.automationLevel).toBe("fully_auto"); // inbox default
      expect(recipe?.enabled).toBe(true);

      // Cleanup
      await deleteStageRecipe(TEST_WORKSPACE_ID, "inbox");
    });

    it("should create a recipe with custom configuration", async () => {
      const input: CreateRecipeInput = {
        workspaceId: TEST_WORKSPACE_ID,
        stage: "prd",
        automationLevel: "human_approval",
        recipeSteps: [],
        gates: [
          {
            id: "custom_gate",
            name: "Custom Gate",
            type: "file_exists",
            config: { pattern: "*.md" },
            required: true,
            failureMessage: "No markdown files found",
          },
        ],
        onFailBehavior: "review_required",
        provider: "openai",
        enabled: true,
      };

      await createStageRecipe(input);
      const recipe = await getStageRecipe(TEST_WORKSPACE_ID, "prd");

      expect(recipe?.automationLevel).toBe("human_approval");
      expect(recipe?.gates.length).toBe(1);
      expect(recipe?.gates[0].id).toBe("custom_gate");
      expect(recipe?.onFailBehavior).toBe("review_required");
      expect(recipe?.provider).toBe("openai");

      // Cleanup
      await deleteStageRecipe(TEST_WORKSPACE_ID, "prd");
    });

    it("should update an existing recipe", async () => {
      await createStageRecipe({
        workspaceId: TEST_WORKSPACE_ID,
        stage: "design",
        automationLevel: "auto_notify",
      });

      await updateStageRecipe(TEST_WORKSPACE_ID, "design", {
        automationLevel: "fully_auto",
        enabled: false,
      });

      const recipe = await getStageRecipe(TEST_WORKSPACE_ID, "design");
      expect(recipe?.automationLevel).toBe("fully_auto");
      expect(recipe?.enabled).toBe(false);

      // Cleanup
      await deleteStageRecipe(TEST_WORKSPACE_ID, "design");
    });

    it("should delete a recipe", async () => {
      await createStageRecipe({
        workspaceId: TEST_WORKSPACE_ID,
        stage: "prototype",
      });

      const deleted = await deleteStageRecipe(TEST_WORKSPACE_ID, "prototype");
      expect(deleted).toBe(true);

      const recipe = await getStageRecipe(TEST_WORKSPACE_ID, "prototype");
      expect(recipe).toBeNull();
    });

    it("should get all recipes for workspace", async () => {
      // Create multiple recipes
      await createStageRecipe({ workspaceId: TEST_WORKSPACE_ID, stage: "inbox" });
      await createStageRecipe({ workspaceId: TEST_WORKSPACE_ID, stage: "discovery" });
      await createStageRecipe({ workspaceId: TEST_WORKSPACE_ID, stage: "prd" });

      const recipes = await getAllStageRecipes(TEST_WORKSPACE_ID);
      expect(recipes.length).toBeGreaterThanOrEqual(3);

      // Cleanup
      await deleteStageRecipe(TEST_WORKSPACE_ID, "inbox");
      await deleteStageRecipe(TEST_WORKSPACE_ID, "discovery");
      await deleteStageRecipe(TEST_WORKSPACE_ID, "prd");
    });
  });

  describe("Recipe Validation", () => {
    let vettedSkillId: string;
    let communitySkillId: string;

    beforeAll(async () => {
      // Create test skills
      vettedSkillId = await createSkill({
        workspaceId: TEST_WORKSPACE_ID,
        source: "local",
        name: "Vetted Analysis",
        description: "A vetted skill",
        version: "1.0.0",
        trustLevel: "vetted",
      });

      communitySkillId = await createSkill({
        workspaceId: TEST_WORKSPACE_ID,
        source: "local",
        name: "Community Tool",
        description: "A community skill",
        version: "1.0.0",
        trustLevel: "community",
      });
    });

    afterAll(async () => {
      await db.delete(skills).where(eq(skills.id, vettedSkillId));
      await db.delete(skills).where(eq(skills.id, communitySkillId));
    });

    it("should validate recipe with valid skills", async () => {
      await createStageRecipe({
        workspaceId: TEST_WORKSPACE_ID,
        stage: "validate",
        automationLevel: "auto_notify",
        recipeSteps: [
          {
            skillId: vettedSkillId,
            order: 1,
            paramsJson: {},
          },
        ],
      });

      const recipe = await getStageRecipe(TEST_WORKSPACE_ID, "validate");
      const validation = await validateRecipe(recipe!);

      expect(validation.valid).toBe(true);
      expect(validation.errors.length).toBe(0);
      expect(validation.skillsStatus[0].found).toBe(true);
      expect(validation.skillsStatus[0].trusted).toBe(true);

      // Cleanup
      await deleteStageRecipe(TEST_WORKSPACE_ID, "validate");
    });

    it("should detect missing skills", async () => {
      await createStageRecipe({
        workspaceId: TEST_WORKSPACE_ID,
        stage: "tickets",
        recipeSteps: [
          {
            skillId: "skill_nonexistent123",
            order: 1,
            paramsJson: {},
          },
        ],
      });

      const recipe = await getStageRecipe(TEST_WORKSPACE_ID, "tickets");
      const validation = await validateRecipe(recipe!);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some((e) => e.includes("not found"))).toBe(true);

      // Cleanup
      await deleteStageRecipe(TEST_WORKSPACE_ID, "tickets");
    });

    it("should warn about untrusted skills in fully_auto mode", async () => {
      await createStageRecipe({
        workspaceId: TEST_WORKSPACE_ID,
        stage: "build",
        automationLevel: "fully_auto",
        recipeSteps: [
          {
            skillId: communitySkillId,
            order: 1,
            paramsJson: {},
          },
        ],
      });

      const recipe = await getStageRecipe(TEST_WORKSPACE_ID, "build");
      const validation = await validateRecipe(recipe!);

      expect(validation.warnings.some((w) => w.includes("not vetted"))).toBe(true);

      // Cleanup
      await deleteStageRecipe(TEST_WORKSPACE_ID, "build");
    });
  });

  describe("Fully Auto Permission", () => {
    let vettedSkillId: string;
    let communitySkillId: string;

    beforeAll(async () => {
      vettedSkillId = await createSkill({
        workspaceId: TEST_WORKSPACE_ID,
        source: "local",
        name: "Trusted Tool",
        description: "A trusted skill",
        version: "1.0.0",
        trustLevel: "vetted",
      });

      communitySkillId = await createSkill({
        workspaceId: TEST_WORKSPACE_ID,
        source: "local",
        name: "Untrusted Tool",
        description: "An untrusted skill",
        version: "1.0.0",
        trustLevel: "community",
      });
    });

    afterAll(async () => {
      await db.delete(skills).where(eq(skills.id, vettedSkillId));
      await db.delete(skills).where(eq(skills.id, communitySkillId));
    });

    it("should allow fully_auto with all vetted skills", async () => {
      await createStageRecipe({
        workspaceId: TEST_WORKSPACE_ID,
        stage: "alpha",
        automationLevel: "fully_auto",
        recipeSteps: [
          { skillId: vettedSkillId, order: 1, paramsJson: {} },
        ],
      });

      const recipe = await getStageRecipe(TEST_WORKSPACE_ID, "alpha");
      const canAuto = await canRunFullyAuto(recipe!);

      expect(canAuto).toBe(true);

      // Cleanup
      await deleteStageRecipe(TEST_WORKSPACE_ID, "alpha");
    });

    it("should deny fully_auto with any untrusted skill", async () => {
      await createStageRecipe({
        workspaceId: TEST_WORKSPACE_ID,
        stage: "beta",
        automationLevel: "fully_auto",
        recipeSteps: [
          { skillId: vettedSkillId, order: 1, paramsJson: {} },
          { skillId: communitySkillId, order: 2, paramsJson: {} },
        ],
      });

      const recipe = await getStageRecipe(TEST_WORKSPACE_ID, "beta");
      const canAuto = await canRunFullyAuto(recipe!);

      expect(canAuto).toBe(false);

      // Cleanup
      await deleteStageRecipe(TEST_WORKSPACE_ID, "beta");
    });

    it("should allow fully_auto with empty recipe (uses built-in executor)", async () => {
      await createStageRecipe({
        workspaceId: TEST_WORKSPACE_ID,
        stage: "ga",
        automationLevel: "fully_auto",
        recipeSteps: [],
      });

      const recipe = await getStageRecipe(TEST_WORKSPACE_ID, "ga");
      const canAuto = await canRunFullyAuto(recipe!);

      expect(canAuto).toBe(true);

      // Cleanup
      await deleteStageRecipe(TEST_WORKSPACE_ID, "ga");
    });
  });

  describe("Default Recipe Initialization", () => {
    it("should initialize default recipes for all stages", async () => {
      // Use a separate workspace to not interfere with other tests
      const initWorkspaceId = `test_init_${nanoid(8)}`;
      await db.insert(workspaces).values({
        id: initWorkspaceId,
        name: "Init Test Workspace",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await initializeDefaultRecipes(initWorkspaceId);

      const recipes = await getAllStageRecipes(initWorkspaceId);
      expect(recipes.length).toBe(11); // All 11 stages

      // Check specific defaults
      const inboxRecipe = recipes.find((r) => r.stage === "inbox");
      expect(inboxRecipe?.automationLevel).toBe("fully_auto");

      const validateRecipe_ = recipes.find((r) => r.stage === "validate");
      expect(validateRecipe_?.automationLevel).toBe("human_approval");

      // Cleanup
      await db.delete(stageRecipes).where(eq(stageRecipes.workspaceId, initWorkspaceId));
      await db.delete(workspaces).where(eq(workspaces.id, initWorkspaceId));
    });

    it("should not overwrite existing recipes", async () => {
      const customWorkspaceId = `test_custom_${nanoid(8)}`;
      await db.insert(workspaces).values({
        id: customWorkspaceId,
        name: "Custom Test Workspace",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create custom inbox recipe
      await createStageRecipe({
        workspaceId: customWorkspaceId,
        stage: "inbox",
        automationLevel: "manual", // Custom override
      });

      // Initialize defaults
      await initializeDefaultRecipes(customWorkspaceId);

      // Check that inbox wasn't overwritten
      const inboxRecipe = await getStageRecipe(customWorkspaceId, "inbox");
      expect(inboxRecipe?.automationLevel).toBe("manual"); // Should be our custom value

      // Cleanup
      await db.delete(stageRecipes).where(eq(stageRecipes.workspaceId, customWorkspaceId));
      await db.delete(workspaces).where(eq(workspaces.id, customWorkspaceId));
    });
  });

  describe("Recipe Steps Configuration", () => {
    it("should preserve step ordering", async () => {
      const skill1Id = await createSkill({
        workspaceId: TEST_WORKSPACE_ID,
        source: "local",
        name: "Step 1",
        description: "First step",
        version: "1.0.0",
        trustLevel: "vetted",
      });

      const skill2Id = await createSkill({
        workspaceId: TEST_WORKSPACE_ID,
        source: "local",
        name: "Step 2",
        description: "Second step",
        version: "1.0.0",
        trustLevel: "vetted",
      });

      await createStageRecipe({
        workspaceId: TEST_WORKSPACE_ID,
        stage: "discovery",
        recipeSteps: [
          { skillId: skill1Id, order: 1, paramsJson: { mode: "fast" } },
          { skillId: skill2Id, order: 2, paramsJson: { mode: "thorough" } },
        ],
      });

      const recipe = await getStageRecipe(TEST_WORKSPACE_ID, "discovery");
      expect(recipe?.recipeSteps.length).toBe(2);
      expect(recipe?.recipeSteps[0].order).toBe(1);
      expect(recipe?.recipeSteps[1].order).toBe(2);
      expect(recipe?.recipeSteps[0].paramsJson).toEqual({ mode: "fast" });

      // Cleanup
      await deleteStageRecipe(TEST_WORKSPACE_ID, "discovery");
      await db.delete(skills).where(eq(skills.id, skill1Id));
      await db.delete(skills).where(eq(skills.id, skill2Id));
    });
  });
});
