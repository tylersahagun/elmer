import { beforeEach, describe, expect, it, vi } from "vitest";

const { mcpGet, mcpPost, mcpPatch } = vi.hoisted(() => ({
  mcpGet: vi.fn(),
  mcpPost: vi.fn(),
  mcpPatch: vi.fn(),
}));

vi.mock("../../convex-client.js", () => ({
  mcpGet,
  mcpPost,
  mcpPatch,
  WORKSPACE_ID: "workspace-test",
}));

import {
  advanceStage,
  createProject,
  listProjects,
  updateProject,
} from "../projects.js";
import { getSignal, ingestSignal, synthesizeSignals } from "../signals.js";
import { listAgents, runAgent } from "../agents.js";
import { getJob, respondToQuestion } from "../jobs.js";
import { graphGetContext, listCommands, search, storeMemory } from "../knowledge.js";

describe("MCP tools", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("formats projects grouped by stage", async () => {
    mcpGet.mockResolvedValueOnce([
      {
        _id: "project-1",
        name: "Inbox project",
        stage: "inbox",
        status: "on_track",
        priority: "P1",
        metadata: { tldr: "Clarify the operator loop." },
      },
      {
        _id: "project-2",
        name: "Validate project",
        stage: "validate",
        status: "at_risk",
        priority: "P0",
      },
    ]);

    const output = await listProjects();

    expect(mcpGet).toHaveBeenCalledWith("/projects");
    expect(output).toContain("# Active Projects");
    expect(output).toContain("## INBOX");
    expect(output).toContain("**Inbox project** (P1, on_track)");
    expect(output).toContain("> Clarify the operator loop.");
    expect(output).toContain("## VALIDATE");
  });

  it("creates and updates a project through the Convex client seam", async () => {
    mcpPost.mockResolvedValueOnce({ id: "project-3" });

    const createOutput = await createProject(
      "Seeded project",
      "Deterministic release gate",
      "inbox",
      "P2",
    );
    const updateOutput = await updateProject("project-3", {
      slackChannelId: "C123",
      slackChannelName: "alpha-feedback",
    });

    expect(mcpPost).toHaveBeenCalledWith("/projects", {
      name: "Seeded project",
      description: "Deterministic release gate",
      stage: "inbox",
      priority: "P2",
    });
    expect(mcpPatch).toHaveBeenCalledWith("/project", {
      id: "project-3",
      slackChannelId: "C123",
      slackChannelName: "alpha-feedback",
    });
    expect(createOutput).toContain("Created project **Seeded project**");
    expect(updateOutput).toContain("Linked Slack channel: `C123` (#alpha-feedback)");
  });

  it("advances a project to the next stage", async () => {
    mcpGet.mockResolvedValueOnce({
      project: {
        _id: "project-4",
        name: "Discovery project",
        stage: "discovery",
        status: "on_track",
        priority: "P1",
      },
    });

    const output = await advanceStage("project-4");

    expect(mcpPatch).toHaveBeenCalledWith("/project", {
      id: "project-4",
      stage: "define",
    });
    expect(output).toContain("advanced from **discovery** → **define**");
  });

  it("renders a single signal and ingests a new one", async () => {
    mcpGet.mockResolvedValueOnce([
      {
        _id: "signal-1",
        verbatim: "Customers keep asking for a workspace-first flow.",
        interpretation: "Workspace navigation is blocking evaluation.",
        severity: "high",
        source: "slack",
        status: "new",
      },
    ]);
    mcpPost.mockResolvedValueOnce({ id: "signal-2" });

    const signalOutput = await getSignal("signal-1");
    const ingestOutput = await ingestSignal(
      "Agent visibility is too opaque for the alpha loop.",
      "interview",
      "critical",
    );

    expect(signalOutput).toContain("Workspace navigation is blocking evaluation.");
    expect(mcpPost).toHaveBeenCalledWith("/signals", {
      verbatim: "Agent visibility is too opaque for the alpha loop.",
      source: "interview",
      severity: "critical",
    });
    expect(ingestOutput).toContain("Signal ingested");
    expect(ingestOutput).toContain("Source: interview");
  });

  it("clusters unlinked signals into themes", async () => {
    mcpPost.mockResolvedValueOnce({
      total: 3,
      unlinkedCount: 3,
      signals: [
        { _id: "s1", verbatim: "Editor autosave is missing", source: "slack" },
        { _id: "s2", verbatim: "Editor save button is hard to trust", source: "slack" },
        { _id: "s3", verbatim: "Agent approvals need better visibility", source: "email" },
      ],
      unlinked: [
        { _id: "s1", verbatim: "Editor autosave is missing", source: "slack" },
        { _id: "s2", verbatim: "Editor save button is hard to trust", source: "slack" },
        { _id: "s3", verbatim: "Agent approvals need better visibility", source: "email" },
      ],
    });

    const output = await synthesizeSignals();

    expect(mcpPost).toHaveBeenCalledWith("/signals/synthesize", {});
    expect(output).toContain("# Signal Map");
    expect(output).toContain('## Theme Clusters (unlinked signals)');
    expect(output).toContain('"editor"');
  });

  it("lists enabled agents and runs an agent job", async () => {
    mcpGet.mockResolvedValueOnce([
      {
        _id: "agent-1",
        name: "write-prd",
        type: "command",
        enabled: true,
        executionMode: "server",
        description: "Draft a PRD",
      },
      {
        _id: "agent-2",
        name: "disabled-agent",
        type: "command",
        enabled: false,
        executionMode: "server",
      },
    ]);
    mcpPost.mockResolvedValueOnce({ id: "job-1" });

    const listOutput = await listAgents("command");
    const runOutput = await runAgent("agent-1", "project-1", {
      rawInput: "Draft the alpha PRD",
    });

    expect(mcpGet).toHaveBeenCalledWith("/agents", { type: "command" });
    expect(listOutput).toContain("write-prd");
    expect(listOutput).not.toContain("disabled-agent");
    expect(mcpPost).toHaveBeenCalledWith("/jobs", {
      type: "execute_agent_definition",
      projectId: "project-1",
      input: { rawInput: "Draft the alpha PRD", agentDefinitionId: "agent-1" },
      agentDefinitionId: "agent-1",
    });
    expect(runOutput).toContain("Job ID:");
  });

  it("formats job state, logs, and HITL guidance", async () => {
    mcpGet.mockResolvedValueOnce({
      job: {
        _id: "job-2",
        type: "execute_agent_definition",
        status: "waiting_input",
        output: {
          content:
            "Deterministic HITL stub completed successfully with a concise final summary.",
        },
      },
      logs: [
        { level: "info", message: "Seeded approval requested", stepKey: "awaiting_input" },
      ],
    });

    const output = await getJob("job-2");

    expect(output).toContain("Waiting for input");
    expect(output).toContain("Recent Logs");
    expect(output).toContain("Seeded approval requested");
    expect(output).toContain("Output");
  });

  it("submits a pending-question response", async () => {
    const output = await respondToQuestion("question-1", "approve");

    expect(mcpPost).toHaveBeenCalledWith("/questions/answer", {
      questionId: "question-1",
      response: "approve",
    });
    expect(output).toContain("Answer submitted");
  });

  it("searches across projects and knowledge entries", async () => {
    mcpGet
      .mockResolvedValueOnce([
        {
          _id: "kb-1",
          type: "company_context",
          title: "Operator loop",
          content: "The operator loop requires evidence and human gates.",
        },
      ])
      .mockResolvedValueOnce([
        {
          _id: "project-5",
          name: "Operator alpha",
          description: "Improve the operator loop",
          stage: "validate",
        },
      ]);

    const output = await search("operator");

    expect(output).toContain('Search: "operator"');
    expect(output).toContain("Project: Operator alpha");
    expect(output).toContain("KB: Operator loop");
  });

  it("groups commands by phase", async () => {
    mcpGet.mockResolvedValueOnce([
      {
        _id: "cmd-1",
        name: "synthesize-signals",
        type: "command",
        enabled: true,
        executionMode: "server",
        description: "Cluster signals",
        triggers: ["signal map"],
      },
      {
        _id: "cmd-2",
        name: "validate-jury",
        type: "command",
        enabled: true,
        executionMode: "server",
        description: "Run the jury loop",
      },
    ]);

    const output = await listCommands();

    expect(output).toContain("## Signal Collection (1)");
    expect(output).toContain("/synthesize-signals");
    expect(output).toContain("## Validation (1)");
    expect(output).toContain("/validate-jury");
  });

  it("stores memory and returns graph context", async () => {
    mcpPost.mockResolvedValueOnce({ id: "memory-1" });
    mcpGet
      .mockResolvedValueOnce({
        project: {
          name: "Alpha cockpit",
          stage: "validate",
          metadata: { tldr: "Keep the operator loop visible." },
        },
        documents: [
          {
            type: "prd",
            title: "Alpha PRD",
            content: "A concise document body for the deterministic release gate.",
          },
        ],
      })
      .mockResolvedValueOnce([
        { type: "decision", content: "We gate alpha on seeded approval coverage." },
      ]);

    const storeOutput = await storeMemory(
      "Gate alpha on seeded approval coverage.",
      "decision",
      "project-9",
    );
    const graphOutput = await graphGetContext("project-9");

    expect(mcpPost).toHaveBeenCalledWith("/memory", {
      content: "Gate alpha on seeded approval coverage.",
      type: "decision",
      projectId: "project-9",
    });
    expect(storeOutput).toContain("Memory stored");
    expect(graphOutput).toContain("Graph Context: Alpha cockpit");
    expect(graphOutput).toContain("Alpha PRD");
    expect(graphOutput).toContain("seeded approval coverage");
  });
});
