import type { KanbanColumn } from "@/lib/store";
import {
  mapWorkspaceColumnToKanbanColumn,
  resolveWorkspaceColumns,
  type WorkspaceColumnConfig,
} from "@/lib/workspaces/columns";

const fallbackColumns: KanbanColumn[] = [
  {
    id: "inbox",
    displayName: "Inbox",
    color: "slate",
    order: 0,
    enabled: true,
  },
];

describe("workspace column helpers", () => {
  test("mapWorkspaceColumnToKanbanColumn: maps API shape into kanban state", () => {
    const column: WorkspaceColumnConfig = {
      id: "cfg_1",
      stage: "discovery",
      displayName: "Discovery",
      color: "teal",
      order: 1,
      enabled: true,
      autoTriggerJobs: ["analyze_transcript"],
      rules: {
        contextPaths: ["signals/slack"],
        contextNotes: "Use recent research context",
      },
    };

    expect(mapWorkspaceColumnToKanbanColumn(column)).toEqual({
      id: "discovery",
      configId: "cfg_1",
      displayName: "Discovery",
      color: "teal",
      order: 1,
      enabled: true,
      autoTriggerJobs: ["analyze_transcript"],
      agentTriggers: [],
      humanInLoop: undefined,
      requiredDocuments: undefined,
      requiredApprovals: undefined,
      contextPaths: ["signals/slack"],
      contextNotes: "Use recent research context",
      loopGroupId: undefined,
      loopTargets: undefined,
      dependencyNotes: undefined,
    });
  });

  test("resolveWorkspaceColumns: falls back when API columns are missing", () => {
    expect(resolveWorkspaceColumns(undefined, fallbackColumns)).toEqual(
      fallbackColumns,
    );
    expect(resolveWorkspaceColumns([], fallbackColumns)).toEqual(
      fallbackColumns,
    );
  });

  test("resolveWorkspaceColumns: sorts API columns by order", () => {
    const resolved = resolveWorkspaceColumns(
      [
        {
          id: "cfg_2",
          stage: "prototype",
          displayName: "Prototype",
          color: "pink",
          order: 2,
          enabled: true,
        },
        {
          id: "cfg_1",
          stage: "discovery",
          displayName: "Discovery",
          color: "teal",
          order: 1,
          enabled: true,
        },
      ],
      fallbackColumns,
    );

    expect(resolved.map((column) => column.id)).toEqual([
      "discovery",
      "prototype",
    ]);
  });
});
