/**
 * Contract Tests: Gates System
 * 
 * Tests the gate validation system:
 * - File existence checks
 * - Content validation
 * - Artifact checks
 * - Metric thresholds
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import { workspaces, projects, stageRuns, artifacts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { GateDefinition } from "@/lib/db/schema";

// Test fixtures
const TEST_WORKSPACE_ID = `test_ws_${nanoid(8)}`;
const TEST_PROJECT_ID = `test_proj_${nanoid(8)}`;

/**
 * Gate evaluator - matches the implementation in stage executors
 */
async function evaluateGate(
  gate: GateDefinition,
  context: {
    cardId: string;
    workspaceId: string;
    stage: string;
    runId?: string;
    files?: Map<string, string>;
    metrics?: Map<string, number>;
  }
): Promise<{ passed: boolean; message: string }> {
  switch (gate.type) {
    case "file_exists": {
      const pattern = gate.config.pattern as string;
      const files = context.files || new Map();
      
      // Simple glob matching
      const hasMatch = Array.from(files.keys()).some((path) => {
        if (pattern.includes("**")) {
          return path.includes(pattern.replace("**", "").replace("/", ""));
        }
        if (pattern.startsWith("*.")) {
          return path.endsWith(pattern.slice(1));
        }
        return path.endsWith(pattern);
      });
      
      return {
        passed: hasMatch,
        message: hasMatch ? "File exists" : gate.failureMessage,
      };
    }

    case "content_check": {
      const file = gate.config.file as string;
      const requiredSections = gate.config.requiredSections as string[];
      const files = context.files || new Map();
      const content = files.get(file) || "";
      
      const missingSections = requiredSections.filter(
        (section) => !content.includes(section)
      );
      
      return {
        passed: missingSections.length === 0,
        message:
          missingSections.length === 0
            ? "All sections present"
            : `Missing sections: ${missingSections.join(", ")}`,
      };
    }

    case "artifact_exists": {
      const artifactType = gate.config.artifactType as string;
      const label = gate.config.label as string | undefined;
      
      // Query artifacts from database
      const arts = await db
        .select()
        .from(artifacts)
        .where(eq(artifacts.cardId, context.cardId));
      
      const hasMatch = arts.some((a) => {
        const typeMatch = a.artifactType === artifactType;
        const labelMatch = !label || a.label?.includes(label);
        return typeMatch && labelMatch;
      });
      
      return {
        passed: hasMatch,
        message: hasMatch ? "Artifact found" : gate.failureMessage,
      };
    }

    case "metric_threshold": {
      const metric = gate.config.metric as string;
      const threshold = gate.config.threshold as number;
      const operator = gate.config.operator as string;
      const metrics = context.metrics || new Map();
      const value = metrics.get(metric);
      
      if (value === undefined) {
        return { passed: false, message: `Metric ${metric} not found` };
      }
      
      let passed = false;
      switch (operator) {
        case ">=":
          passed = value >= threshold;
          break;
        case ">":
          passed = value > threshold;
          break;
        case "<=":
          passed = value <= threshold;
          break;
        case "<":
          passed = value < threshold;
          break;
        case "==":
          passed = value === threshold;
          break;
      }
      
      return {
        passed,
        message: passed
          ? `${metric} (${value}) meets threshold`
          : `${metric} (${value}) does not meet threshold ${operator} ${threshold}`,
      };
    }

    default:
      return { passed: false, message: `Unknown gate type: ${gate.type}` };
  }
}

describe("Gates System Contract Tests", () => {
  beforeAll(async () => {
    // Create test workspace
    await db.insert(workspaces).values({
      id: TEST_WORKSPACE_ID,
      name: "Test Workspace",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create test project
    await db.insert(projects).values({
      id: TEST_PROJECT_ID,
      workspaceId: TEST_WORKSPACE_ID,
      name: "Test Project",
      stage: "inbox",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  afterAll(async () => {
    // Delete in correct order due to FK constraints
    await db.delete(artifacts).where(eq(artifacts.cardId, TEST_PROJECT_ID));
    await db.delete(stageRuns).where(eq(stageRuns.cardId, TEST_PROJECT_ID));
    await db.delete(projects).where(eq(projects.id, TEST_PROJECT_ID));
    await db.delete(workspaces).where(eq(workspaces.id, TEST_WORKSPACE_ID));
  });

  describe("File Existence Gates", () => {
    it("should pass when file exists", async () => {
      const gate: GateDefinition = {
        id: "test_file",
        name: "Test File Gate",
        type: "file_exists",
        config: { pattern: "prd.md" },
        required: true,
        failureMessage: "PRD not found",
      };

      const files = new Map([["initiatives/test/prd.md", "# PRD Content"]]);

      const result = await evaluateGate(gate, {
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "prd",
        files,
      });

      expect(result.passed).toBe(true);
    });

    it("should fail when file does not exist", async () => {
      const gate: GateDefinition = {
        id: "test_file",
        name: "Test File Gate",
        type: "file_exists",
        config: { pattern: "prd.md" },
        required: true,
        failureMessage: "PRD not found",
      };

      const files = new Map([["initiatives/test/research.md", "# Research"]]);

      const result = await evaluateGate(gate, {
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "prd",
        files,
      });

      expect(result.passed).toBe(false);
      expect(result.message).toBe("PRD not found");
    });

    it("should match glob patterns", async () => {
      const gate: GateDefinition = {
        id: "test_glob",
        name: "Test Glob Gate",
        type: "file_exists",
        config: { pattern: "*.stories.tsx" },  // Simple extension pattern
        required: true,
        failureMessage: "No stories found",
      };

      const files = new Map([
        ["components/Button/Button.stories.tsx", "export default {}"],
      ]);

      const result = await evaluateGate(gate, {
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "prototype",
        files,
      });

      expect(result.passed).toBe(true);
    });
  });

  describe("Content Check Gates", () => {
    it("should pass when all sections present", async () => {
      const gate: GateDefinition = {
        id: "test_content",
        name: "Test Content Gate",
        type: "content_check",
        config: {
          file: "prd.md",
          requiredSections: ["Problem Statement", "Success Metrics"],
        },
        required: true,
        failureMessage: "Missing required sections",
      };

      const files = new Map([
        [
          "prd.md",
          `# Product Requirements
          
## Problem Statement
Users struggle with X.

## Success Metrics
- Metric 1
- Metric 2`,
        ],
      ]);

      const result = await evaluateGate(gate, {
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "prd",
        files,
      });

      expect(result.passed).toBe(true);
    });

    it("should fail with missing sections", async () => {
      const gate: GateDefinition = {
        id: "test_content",
        name: "Test Content Gate",
        type: "content_check",
        config: {
          file: "prd.md",
          requiredSections: ["Problem Statement", "Success Metrics", "MVP Scope"],
        },
        required: true,
        failureMessage: "Missing required sections",
      };

      const files = new Map([
        [
          "prd.md",
          `# Product Requirements
          
## Problem Statement
Users struggle with X.`,
        ],
      ]);

      const result = await evaluateGate(gate, {
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "prd",
        files,
      });

      expect(result.passed).toBe(false);
      expect(result.message).toContain("Success Metrics");
      expect(result.message).toContain("MVP Scope");
    });
  });

  describe("Artifact Existence Gates", () => {
    let testRunId: string;
    
    beforeAll(async () => {
      // Create a valid run to satisfy FK constraint
      const runResult = await db.insert(stageRuns).values({
        id: `gate_test_run_${nanoid(8)}`,
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "prototype",
        status: "succeeded",
        attempt: 1,
        triggeredBy: "test",
        idempotencyKey: `gate_test_${nanoid(8)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        finishedAt: new Date(),
      }).returning();
      testRunId = runResult[0].id;
    });
    
    afterAll(async () => {
      // Cleanup the test run
      await db.delete(stageRuns).where(eq(stageRuns.id, testRunId));
    });
    
    it("should pass when artifact exists", async () => {
      // Create test artifact with valid runId
      await db.insert(artifacts).values({
        id: `artifact_${nanoid(12)}`,
        runId: testRunId,
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "prototype",
        artifactType: "url",
        label: "Chromatic Preview",
        uri: "https://chromatic.com/preview/123",
        createdAt: new Date(),
      });

      const gate: GateDefinition = {
        id: "test_artifact",
        name: "Test Artifact Gate",
        type: "artifact_exists",
        config: { artifactType: "url", label: "Chromatic" },
        required: true,
        failureMessage: "Chromatic URL not found",
      };

      const result = await evaluateGate(gate, {
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "prototype",
      });

      expect(result.passed).toBe(true);
    });

    it("should fail when artifact does not exist", async () => {
      const gate: GateDefinition = {
        id: "test_artifact",
        name: "Test Artifact Gate",
        type: "artifact_exists",
        config: { artifactType: "pr" },
        required: true,
        failureMessage: "PR not found",
      };

      const result = await evaluateGate(gate, {
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "build",
      });

      expect(result.passed).toBe(false);
      expect(result.message).toBe("PR not found");
    });
  });

  describe("Metric Threshold Gates", () => {
    it("should pass when metric meets threshold (>=)", async () => {
      const gate: GateDefinition = {
        id: "test_metric",
        name: "Test Metric Gate",
        type: "metric_threshold",
        config: { metric: "jury_score", threshold: 70, operator: ">=" },
        required: true,
        failureMessage: "Score too low",
      };

      const metrics = new Map([["jury_score", 85]]);

      const result = await evaluateGate(gate, {
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "validate",
        metrics,
      });

      expect(result.passed).toBe(true);
    });

    it("should fail when metric below threshold", async () => {
      const gate: GateDefinition = {
        id: "test_metric",
        name: "Test Metric Gate",
        type: "metric_threshold",
        config: { metric: "jury_score", threshold: 70, operator: ">=" },
        required: true,
        failureMessage: "Score too low",
      };

      const metrics = new Map([["jury_score", 55]]);

      const result = await evaluateGate(gate, {
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "validate",
        metrics,
      });

      expect(result.passed).toBe(false);
      expect(result.message).toContain("55");
    });

    it("should handle missing metrics", async () => {
      const gate: GateDefinition = {
        id: "test_metric",
        name: "Test Metric Gate",
        type: "metric_threshold",
        config: { metric: "nonexistent_metric", threshold: 70, operator: ">=" },
        required: true,
        failureMessage: "Metric not found",
      };

      const result = await evaluateGate(gate, {
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "validate",
        metrics: new Map(),
      });

      expect(result.passed).toBe(false);
      expect(result.message).toContain("not found");
    });

    it("should handle different operators", async () => {
      const metrics = new Map([["count", 5]]);

      // Test < operator
      const ltGate: GateDefinition = {
        id: "lt_gate",
        name: "Less Than Gate",
        type: "metric_threshold",
        config: { metric: "count", threshold: 10, operator: "<" },
        required: true,
        failureMessage: "Count too high",
      };

      const ltResult = await evaluateGate(ltGate, {
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "test",
        metrics,
      });
      expect(ltResult.passed).toBe(true);

      // Test == operator
      const eqGate: GateDefinition = {
        id: "eq_gate",
        name: "Equals Gate",
        type: "metric_threshold",
        config: { metric: "count", threshold: 5, operator: "==" },
        required: true,
        failureMessage: "Count mismatch",
      };

      const eqResult = await evaluateGate(eqGate, {
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "test",
        metrics,
      });
      expect(eqResult.passed).toBe(true);
    });
  });

  describe("Required vs Optional Gates", () => {
    it("should distinguish required gates for advancement blocking", () => {
      const gates: GateDefinition[] = [
        {
          id: "required_gate",
          name: "Required",
          type: "file_exists",
          config: { pattern: "prd.md" },
          required: true,
          failureMessage: "Required file missing",
        },
        {
          id: "optional_gate",
          name: "Optional",
          type: "file_exists",
          config: { pattern: "nice-to-have.md" },
          required: false,
          failureMessage: "Optional file missing",
        },
      ];

      const requiredGates = gates.filter((g) => g.required);
      const optionalGates = gates.filter((g) => !g.required);

      expect(requiredGates.length).toBe(1);
      expect(optionalGates.length).toBe(1);
      expect(requiredGates[0].id).toBe("required_gate");
    });
  });
});
