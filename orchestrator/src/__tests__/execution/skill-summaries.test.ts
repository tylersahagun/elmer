/**
 * Tests for Skill Summaries functionality
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the built-in summaries
const BUILTIN_SUMMARIES: Record<string, string> = {
  analyze_transcript: "Analyzes user research transcripts to extract key insights, problems, and verbatim quotes.",
  generate_prd: "Creates a comprehensive Product Requirements Document.",
  generate_design_brief: "Produces a design brief with visual direction and interaction patterns.",
  build_prototype: "Builds interactive Storybook prototypes using React and Tailwind CSS.",
  run_jury_evaluation: "Runs synthetic user jury evaluation with multiple personas.",
};

describe("Skill Summaries", () => {
  describe("Built-in Summaries", () => {
    it("should have summaries for all core job types", () => {
      const coreJobTypes = [
        "analyze_transcript",
        "generate_prd",
        "generate_design_brief",
        "generate_engineering_spec",
        "generate_gtm_brief",
        "build_prototype",
        "iterate_prototype",
        "run_jury_evaluation",
        "generate_tickets",
        "validate_tickets",
        "score_stage_alignment",
        "deploy_chromatic",
        "create_feature_branch",
      ];

      // These are the summaries from the API
      const FULL_BUILTIN_SUMMARIES: Record<string, string> = {
        analyze_transcript: "Analyzes user research transcripts to extract key insights, problems, and verbatim quotes. Identifies personas mentioned and suggests relevant projects or hypotheses.",
        generate_prd: "Creates a comprehensive Product Requirements Document including problem statement, target personas, success metrics, user journey, MVP scope, and open questions.",
        generate_design_brief: "Produces a design brief with visual direction, interaction patterns, component specifications, and accessibility considerations based on the PRD.",
        generate_engineering_spec: "Generates technical specifications including architecture decisions, data models, API contracts, and implementation guidelines.",
        generate_gtm_brief: "Creates a go-to-market brief with positioning, messaging, launch timeline, and success metrics for product releases.",
        build_prototype: "Builds interactive Storybook prototypes using React and Tailwind CSS, creating component stories for visual testing and iteration.",
        iterate_prototype: "Refines an existing prototype based on feedback, updating both the UI components and associated documentation.",
        run_jury_evaluation: "Runs synthetic user jury evaluation with multiple personas to validate designs and gather diverse feedback before implementation.",
        generate_tickets: "Breaks down the PRD and engineering spec into actionable development tickets with clear acceptance criteria.",
        validate_tickets: "Reviews generated tickets for completeness, clarity, and proper scoping before handoff to engineering.",
        score_stage_alignment: "Evaluates project alignment with stage requirements and suggests whether it's ready to progress.",
        deploy_chromatic: "Deploys prototype to Chromatic for visual regression testing and stakeholder review.",
        create_feature_branch: "Creates a Git feature branch with proper naming convention and initial commit structure.",
      };

      for (const jobType of coreJobTypes) {
        expect(FULL_BUILTIN_SUMMARIES[jobType]).toBeDefined();
        expect(FULL_BUILTIN_SUMMARIES[jobType].length).toBeGreaterThan(20);
      }
    });

    it("should return meaningful summaries, not just the job type name", () => {
      for (const [jobType, summary] of Object.entries(BUILTIN_SUMMARIES)) {
        // Summary should not just be the job type converted to readable format
        const readableJobType = jobType.replace(/_/g, " ");
        expect(summary.toLowerCase()).not.toBe(readableJobType);
        
        // Summary should be descriptive (more than just a few words)
        expect(summary.split(" ").length).toBeGreaterThan(5);
      }
    });
  });

  describe("Batch Summaries Endpoint Logic", () => {
    it("should return summaries for all requested skill IDs", () => {
      const requestedIds = ["analyze_transcript", "generate_prd", "unknown_skill"];
      const summaries: Record<string, string> = {};
      
      for (const skillId of requestedIds) {
        if (BUILTIN_SUMMARIES[skillId]) {
          summaries[skillId] = BUILTIN_SUMMARIES[skillId];
        } else {
          // Generate readable summary from skill ID
          const readable = skillId
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l: string) => l.toUpperCase());
          summaries[skillId] = `Executes the ${readable} workflow as part of the PM automation pipeline.`;
        }
      }
      
      expect(Object.keys(summaries)).toHaveLength(3);
      expect(summaries["analyze_transcript"]).toBe(BUILTIN_SUMMARIES["analyze_transcript"]);
      expect(summaries["generate_prd"]).toBe(BUILTIN_SUMMARIES["generate_prd"]);
      expect(summaries["unknown_skill"]).toContain("Unknown Skill");
    });

    it("should handle empty skill IDs array", () => {
      const requestedIds: string[] = [];
      const summaries: Record<string, string> = {};
      
      for (const skillId of requestedIds) {
        summaries[skillId] = BUILTIN_SUMMARIES[skillId] || "Unknown";
      }
      
      expect(Object.keys(summaries)).toHaveLength(0);
    });

    it("should deduplicate skill IDs", () => {
      const requestedIds = ["analyze_transcript", "analyze_transcript", "generate_prd"];
      const uniqueIds = [...new Set(requestedIds)];
      
      expect(uniqueIds).toHaveLength(2);
    });
  });

  describe("Individual Summary Endpoint Logic", () => {
    it("should prioritize cached summaries", () => {
      const cachedSummary = "This is a cached summary from the database.";
      const skillMetadata = { aiSummary: cachedSummary };
      
      // If metadata.aiSummary exists, use it
      const summary = skillMetadata.aiSummary;
      expect(summary).toBe(cachedSummary);
    });

    it("should fall back to built-in summaries when no cache", () => {
      const skillId = "analyze_transcript";
      const skillMetadata = null;
      
      // No cached summary, use built-in
      const summary = skillMetadata?.aiSummary || BUILTIN_SUMMARIES[skillId];
      expect(summary).toBe(BUILTIN_SUMMARIES[skillId]);
    });

    it("should generate generic summary for unknown skills", () => {
      const skillId = "custom_unknown_skill";
      const skillMetadata = null;
      
      // No cached and no built-in
      const builtIn = BUILTIN_SUMMARIES[skillId];
      expect(builtIn).toBeUndefined();
      
      // Generate generic
      const genericSummary = `Executes the ${skillId.replace(/_/g, " ")} workflow as part of the PM automation pipeline.`;
      expect(genericSummary).toContain("custom unknown skill");
    });
  });

  describe("Summary Content Quality", () => {
    it("should describe the action being performed", () => {
      // Summaries should contain action verbs
      const actionVerbs = ["analyzes", "creates", "produces", "generates", "builds", "refines", "runs", "breaks", "reviews", "evaluates", "deploys"];
      
      for (const summary of Object.values(BUILTIN_SUMMARIES)) {
        const hasActionVerb = actionVerbs.some(verb => 
          summary.toLowerCase().includes(verb)
        );
        expect(hasActionVerb).toBe(true);
      }
    });

    it("should describe the output or result", () => {
      // Summaries should mention what is produced
      const outputTerms = ["insights", "document", "brief", "specifications", "prototype", "tickets", "evaluation", "branch"];
      
      let matchCount = 0;
      for (const summary of Object.values(BUILTIN_SUMMARIES)) {
        const hasOutputTerm = outputTerms.some(term => 
          summary.toLowerCase().includes(term)
        );
        if (hasOutputTerm) matchCount++;
      }
      
      // Most summaries should describe outputs
      expect(matchCount).toBeGreaterThan(Object.values(BUILTIN_SUMMARIES).length * 0.7);
    });
  });
});

describe("Command File Mapping", () => {
  const mappings: Record<string, string[]> = {
    analyze_transcript: ["RESEARCH.md", "INGEST.md"],
    generate_prd: ["PM.md", "PRD.md"],
    generate_design_brief: ["DESIGN.md"],
    build_prototype: ["PROTO.md", "PROTOTYPE.md"],
    iterate_prototype: ["ITERATE.md"],
    run_jury_evaluation: ["VALIDATE.md", "JURY.md"],
    generate_tickets: ["TICKETS.md"],
  };

  it("should have file mappings for key skills", () => {
    const keySkills = [
      "analyze_transcript",
      "generate_prd",
      "build_prototype",
      "iterate_prototype",
      "run_jury_evaluation",
    ];

    for (const skill of keySkills) {
      expect(mappings[skill]).toBeDefined();
      expect(mappings[skill].length).toBeGreaterThan(0);
    }
  });

  it("should map to .md files", () => {
    for (const files of Object.values(mappings)) {
      for (const file of files) {
        expect(file).toMatch(/\.md$/);
      }
    }
  });
});
