import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, workspaceId, context } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Build context string
    let contextString = "";
    if (context?.projects) {
      const byStage: Record<string, string[]> = {};
      context.projects.forEach((p: { name: string; stage: string }) => {
        if (!byStage[p.stage]) byStage[p.stage] = [];
        byStage[p.stage].push(p.name);
      });

      contextString = "Current projects:\n";
      Object.entries(byStage).forEach(([stage, names]) => {
        contextString += `- ${stage}: ${names.join(", ")}\n`;
      });
    }

    const systemPrompt = `You are a helpful PM assistant for a product management orchestration tool.

You help product managers:
- Understand project status
- Suggest next steps
- Identify blocked or stalled work
- Create issues from feedback
- Navigate the workspace

${contextString ? `\n## Current Workspace Context\n${contextString}` : ""}

Be concise and actionable. Use markdown formatting for clarity.
When suggesting actions, be specific about which project or feature you're referring to.`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: message }],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      return NextResponse.json(
        { error: "Unexpected response type" },
        { status: 500 }
      );
    }

    // Extract potential suggestions from the response
    const suggestions: string[] = [];
    if (content.text.toLowerCase().includes("status")) {
      suggestions.push("Project status");
    }
    if (content.text.toLowerCase().includes("next") || content.text.toLowerCase().includes("focus")) {
      suggestions.push("Next steps");
    }
    if (content.text.toLowerCase().includes("create") || content.text.toLowerCase().includes("issue")) {
      suggestions.push("Create issue");
    }

    return NextResponse.json({
      message: content.text,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
