/**
 * Contract Tests: Command Routing Metadata
 *
 * Ensures command definitions are parsed with delegation metadata.
 */

import { describe, it, expect } from "vitest";
import { parseCommand } from "@/lib/agents/parser";

describe("Command Delegation Parsing", () => {
  it("parses skill delegation from Uses clause", () => {
    const content = `# Portfolio Status

**Uses**: portfolio-status

## Usage
- \`/status-all\`
`;
    const result = parseCommand(content, "status-all.md");
    expect(result.delegatesTo).toEqual({
      type: "skill",
      name: "portfolio-status",
    });
  });

  it("parses subagent delegation from Delegates to clause", () => {
    const content = `# Figma Sync

**Delegates to**: figma-sync

## Usage
- \`/figma-sync [url]\`
`;
    const result = parseCommand(content, "figma-sync.md");
    expect(result.delegatesTo).toEqual({
      type: "subagent",
      name: "figma-sync",
    });
  });
});
