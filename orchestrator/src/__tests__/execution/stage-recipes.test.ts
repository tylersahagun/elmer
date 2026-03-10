/**
 * Contract Tests: Stage Recipes
 * 
 * Tests the stage recipes (skills per stage) system using mocked Convex.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
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

// In-memory stores
let skillStore: Record<string, unknown>[] = [];
let recipeStore: Record<string, unknown>[] = [];
let idCounter = 1;

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
    stageRuns: {
      getRecipe: "stageRuns:getRecipe",
      listRecipes: "stageRuns:listRecipes",
      upsertRecipeFull: "stageRuns:upsertRecipeFull",
      deleteRecipe: "stageRuns:deleteRecipe",
    },
  },
}));

vi.mock("convex/browser", () => ({
  ConvexHttpClient: vi.fn().mockImplementation(() => ({
    query: vi.fn().mockImplementation((fn: string, args: Record<string, unknown>) => {
      // Skills
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
      // Recipes
      if (fn === "stageRuns:getRecipe") {
        const wsId = args?.workspaceId as string;
        const stage = args?.stage as string;
        return Promise.resolve(
          recipeStore.find(
            (r) => (r as {workspaceId: string}).workspaceId === wsId && (r as {stage: string}).stage === stage,
          ) ?? null,
        );
      }
      if (fn === "stageRuns:listRecipes") {
        const wsId = args?.workspaceId as string;
        return Promise.resolve(recipeStore.filter((r) => (r as {workspaceId: string}).workspaceId === wsId));
      }
      return Promise.resolve(null);
    }),
    mutation: vi.fn().mockImplementation((fn: string, args: Record<string, unknown>) => {
      // Skills
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
        if (idx >= 0) skillStore.splice(idx, 1);
        return Promise.resolve();
      }
      // Recipes
      if (fn === "stageRuns:upsertRecipeFull") {
        const wsId = args?.workspaceId as string;
        const stage = args?.stage as string;
        const existing = recipeStore.findIndex(
          (r) => (r as {workspaceId: string}).workspaceId === wsId && (r as {stage: string}).stage === stage,
        );
        const id = `mock_recipe_${idCounter++}`;
        if (existing >= 0) {
          recipeStore[existing] = { ...recipeStore[existing], ...args };
          return Promise.resolve((recipeStore[existing] as {_id: string})._id);
        }
        recipeStore.push({ _id: id, _creationTime: Date.now(), ...args });
        return Promise.resolve(id);
      }
      if (fn === "stageRuns:deleteRecipe") {
        const wsId = args?.workspaceId as string;
        const stage = args?.stage as string;
        const idx = recipeStore.findIndex(
          (r) => (r as {workspaceId: string}).workspaceId === wsId && (r as {stage: string}).stage === stage,
        );
        if (idx >= 0) {
          recipeStore.splice(idx, 1);
          return Promise.resolve(true);
        }
        return Promise.resolve(false);
      }
      return Promise.resolve(null);
    }),
  })),
}));

const TEST_WORKSPACE_ID = "test_ws_recipes";

describe("Stage Recipes Contract Tests", () => {
  beforeEach(() => {
    skillStore = [];
    recipeStore = [];
    idCounter = 1;
  });

  describe("Recipe CRUD", () => {
    it("should create a stage recipe with defaults", async () => {
      const recipeId = await createStageRecipe({ workspaceId: TEST_WORKSPACE_ID, stage: "inbox" });
      expect(recipeId).toBeDefined();

      const recipe = await getStageRecipe(TEST_WORKSPACE_ID, "inbox");
      expect(recipe).toBeDefined();
      expect(recipe?.stage).toBe("inbox");
      expect(recipe?.automationLevel).toBe("fully_auto");
      expect(recipe?.enabled).toBe(true);

      await deleteStageRecipe(TEST_WORKSPACE_ID, "inbox");
    });

    it("should create a recipe with custom configuration", async () => {
      await createStageRecipe({
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
      });

      const recipe = await getStageRecipe(TEST_WORKSPACE_ID, "prd");
      expect(recipe?.automationLevel).toBe("human_approval");
      expect(recipe?.gates.length).toBe(1);
      expect(recipe?.gates[0].id).toBe("custom_gate");
      expect(recipe?.onFailBehavior).toBe("review_required");
      expect(recipe?.provider).toBe("openai");

      await deleteStageRecipe(TEST_WORKSPACE_ID, "prd");
    });

    it("should update an existing recipe", async () => {
      await createStageRecipe({ workspaceId: TEST_WORKSPACE_ID, stage: "design", automationLevel: "auto_notify" });
      await updateStageRecipe(TEST_WORKSPACE_ID, "design", { automationLevel: "fully_auto", enabled: false });

      const recipe = await getStageRecipe(TEST_WORKSPACE_ID, "design");
      expect(recipe?.automationLevel).toBe("fully_auto");
      expect(recipe?.enabled).toBe(false);

      await deleteStageRecipe(TEST_WORKSPACE_ID, "design");
    });

    it("should delete a recipe", async () => {
      await createStageRecipe({ workspaceId: TEST_WORKSPACE_ID, stage: "prototype" });

      const deleted = await deleteStageRecipe(TEST_WORKSPACE_ID, "prototype");
      expect(deleted).toBe(true);

      const recipe = await getStageRecipe(TEST_WORKSPACE_ID, "prototype");
      expect(recipe).toBeNull();
    });

    it("should get all recipes for workspace", async () => {
      await createStageRecipe({ workspaceId: TEST_WORKSPACE_ID, stage: "inbox" });
      await createStageRecipe({ workspaceId: TEST_WORKSPACE_ID, stage: "discovery" });
      await createStageRecipe({ workspaceId: TEST_WORKSPACE_ID, stage: "prd" });

      const recipes = await getAllStageRecipes(TEST_WORKSPACE_ID);
      expect(recipes.length).toBeGreaterThanOrEqual(3);

      await deleteStageRecipe(TEST_WORKSPACE_ID, "inbox");
      await deleteStageRecipe(TEST_WORKSPACE_ID, "discovery");
      await deleteStageRecipe(TEST_WORKSPACE_ID, "prd");
    });
  });

  describe("Recipe Validation", () => {
    it("should validate recipe with valid skills", async () => {
      const vettedSkillId = await createSkill({
        workspaceId: TEST_WORKSPACE_ID,
        source: "local",
        name: "Vetted Analysis",
        trustLevel: "vetted",
      });

      await createStageRecipe({
        workspaceId: TEST_WORKSPACE_ID,
        stage: "validate",
        automationLevel: "auto_notify",
        recipeSteps: [{ skillId: vettedSkillId, order: 1 }],
      });

      const recipe = await getStageRecipe(TEST_WORKSPACE_ID, "validate");
      const validation = await validateRecipe(recipe!);

      expect(validation.valid).toBe(true);
      expect(validation.errors.length).toBe(0);
      expect(validation.skillsStatus[0].found).toBe(true);
      expect(validation.skillsStatus[0].trusted).toBe(true);

      await deleteStageRecipe(TEST_WORKSPACE_ID, "validate");
    });

    it("should detect missing skills", async () => {
      await createStageRecipe({
        workspaceId: TEST_WORKSPACE_ID,
        stage: "tickets",
        recipeSteps: [{ skillId: "nonexistent_skill_id", order: 1 }],
      });

      const recipe = await getStageRecipe(TEST_WORKSPACE_ID, "tickets");
      const validation = await validateRecipe(recipe!);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some((e) => e.includes("not found"))).toBe(true);

      await deleteStageRecipe(TEST_WORKSPACE_ID, "tickets");
    });

    it("should warn about untrusted skills in fully_auto mode", async () => {
      const communitySkillId = await createSkill({
        workspaceId: TEST_WORKSPACE_ID,
        source: "local",
        name: "Community Tool",
        trustLevel: "community",
      });

      await createStageRecipe({
        workspaceId: TEST_WORKSPACE_ID,
        stage: "build",
        automationLevel: "fully_auto",
        recipeSteps: [{ skillId: communitySkillId, order: 1 }],
      });

      const recipe = await getStageRecipe(TEST_WORKSPACE_ID, "build");
      const validation = await validateRecipe(recipe!);

      expect(validation.warnings.some((w) => w.includes("not vetted"))).toBe(true);

      await deleteStageRecipe(TEST_WORKSPACE_ID, "build");
    });
  });

  describe("Fully Auto Permission", () => {
    it("should allow fully_auto with all vetted skills", async () => {
      const vettedSkillId = await createSkill({
        workspaceId: TEST_WORKSPACE_ID,
        source: "local",
        name: "Trusted Tool",
        trustLevel: "vetted",
      });

      await createStageRecipe({
        workspaceId: TEST_WORKSPACE_ID,
        stage: "alpha",
        automationLevel: "fully_auto",
        recipeSteps: [{ skillId: vettedSkillId, order: 1 }],
      });

      const recipe = await getStageRecipe(TEST_WORKSPACE_ID, "alpha");
      const canAuto = await canRunFullyAuto(recipe!);

      expect(canAuto).toBe(true);
      await deleteStageRecipe(TEST_WORKSPACE_ID, "alpha");
    });

    it("should deny fully_auto with any untrusted skill", async () => {
      const vettedId = await createSkill({
        workspaceId: TEST_WORKSPACE_ID,
        source: "local",
        name: "Trusted",
        trustLevel: "vetted",
      });
      const communityId = await createSkill({
        workspaceId: TEST_WORKSPACE_ID,
        source: "local",
        name: "Untrusted",
        trustLevel: "community",
      });

      await createStageRecipe({
        workspaceId: TEST_WORKSPACE_ID,
        stage: "beta",
        automationLevel: "fully_auto",
        recipeSteps: [
          { skillId: vettedId, order: 1 },
          { skillId: communityId, order: 2 },
        ],
      });

      const recipe = await getStageRecipe(TEST_WORKSPACE_ID, "beta");
      const canAuto = await canRunFullyAuto(recipe!);

      expect(canAuto).toBe(false);
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
      await deleteStageRecipe(TEST_WORKSPACE_ID, "ga");
    });
  });

  describe("Default Recipe Initialization", () => {
    it("should initialize default recipes for all stages", async () => {
      const initWorkspaceId = "test_init_workspace";
      await initializeDefaultRecipes(initWorkspaceId);

      const recipes = await getAllStageRecipes(initWorkspaceId);
      expect(recipes.length).toBe(11);

      const inboxRecipe = recipes.find((r) => r.stage === "inbox");
      expect(inboxRecipe?.automationLevel).toBe("fully_auto");

      const validateRecipe_ = recipes.find((r) => r.stage === "validate");
      expect(validateRecipe_?.automationLevel).toBe("human_approval");
    });

    it("should not overwrite existing recipes", async () => {
      const customWorkspaceId = "test_custom_workspace";

      await createStageRecipe({
        workspaceId: customWorkspaceId,
        stage: "inbox",
        automationLevel: "manual",
      });

      await initializeDefaultRecipes(customWorkspaceId);

      const inboxRecipe = await getStageRecipe(customWorkspaceId, "inbox");
      expect(inboxRecipe?.automationLevel).toBe("manual");
    });
  });

  describe("Recipe Steps Configuration", () => {
    it("should preserve step ordering", async () => {
      const skill1Id = await createSkill({
        workspaceId: TEST_WORKSPACE_ID,
        source: "local",
        name: "Step 1",
        trustLevel: "vetted",
      });
      const skill2Id = await createSkill({
        workspaceId: TEST_WORKSPACE_ID,
        source: "local",
        name: "Step 2",
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

      await deleteStageRecipe(TEST_WORKSPACE_ID, "discovery");
    });
  });
});
