/**
 * Skills Module
 * 
 * Manages skills from multiple sources and stage recipes.
 */

// SkillsMP Client
export {
  SkillsMPClient,
  SkillsMPAPIError,
  getSkillsMPClient,
  setSkillsMPApiKey,
  type SkillsMPSkill,
  type SearchResult,
  type SearchParams,
} from "./skillsmp-client";

// Skills Service
export {
  loadLocalSkills,
  syncLocalSkills,
  searchSkillsMP,
  importFromSkillsMP,
  resyncSkillsMP,
  getSkills,
  getSkillById,
  searchSkills,
  createSkill,
  updateSkillTrustLevel,
  deleteSkill,
  getSkillPrompt,
  isSkillTrusted,
  type Skill,
  type CreateSkillInput,
  type ImportSkillInput,
} from "./skills-service";

// Stage Recipes Service
export {
  getStageRecipe,
  getAllStageRecipes,
  createStageRecipe,
  updateStageRecipe,
  deleteStageRecipe,
  validateRecipe,
  canRunFullyAuto,
  initializeDefaultRecipes,
  type StageRecipe,
  type CreateRecipeInput,
  type UpdateRecipeInput,
  type RecipeValidation,
} from "./stage-recipes-service";
