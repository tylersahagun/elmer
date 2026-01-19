/**
 * Execution Providers - Abstraction for AI execution backends
 * 
 * NO Cursor dependency - these providers work with hosted LLM APIs
 * and optional CLI tools.
 */

import Anthropic from "@anthropic-ai/sdk";
import { addRunLog } from "./run-manager";

// ============================================
// PROVIDER TYPES
// ============================================

export interface ExecutionContext {
  runId: string;
  workspaceId: string;
  cardId: string;
  stage: string;
  workspacePath?: string;
  contextFiles?: string[];
  variables?: Record<string, unknown>;
}

export interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  tokensUsed?: {
    input: number;
    output: number;
  };
  durationMs?: number;
  toolCalls?: Array<{
    name: string;
    input: Record<string, unknown>;
    output?: unknown;
  }>;
}

export interface StreamCallback {
  onLog: (level: "info" | "warn" | "error" | "debug", message: string, stepKey?: string) => void;
  onProgress: (progress: number, message?: string) => void;
  onArtifact: (type: string, label: string, uri?: string, meta?: Record<string, unknown>) => void;
}

export interface ExecutionProvider {
  name: string;
  execute(
    systemPrompt: string,
    userPrompt: string,
    context: ExecutionContext,
    callbacks?: StreamCallback
  ): Promise<ExecutionResult>;
}

// ============================================
// ANTHROPIC PROVIDER
// ============================================

export class AnthropicProvider implements ExecutionProvider {
  name = "anthropic";
  private client: Anthropic;
  private model: string;

  constructor(apiKey?: string, model = "claude-sonnet-4-20250514") {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
    this.model = model;
  }

  async execute(
    systemPrompt: string,
    userPrompt: string,
    context: ExecutionContext,
    callbacks?: StreamCallback
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    try {
      callbacks?.onLog("info", `Starting Anthropic execution with model ${this.model}`, "provider");
      callbacks?.onProgress(0.1, "Sending request to Anthropic...");

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 8192,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
      });

      const durationMs = Date.now() - startTime;
      
      // Extract text from response
      const output = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("\n");

      callbacks?.onLog("info", `Anthropic execution completed in ${durationMs}ms`, "provider");
      callbacks?.onProgress(1.0, "Execution complete");

      return {
        success: true,
        output,
        tokensUsed: {
          input: response.usage.input_tokens,
          output: response.usage.output_tokens,
        },
        durationMs,
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      callbacks?.onLog("error", `Anthropic execution failed: ${errorMessage}`, "provider");
      
      return {
        success: false,
        error: errorMessage,
        durationMs,
      };
    }
  }
}

// ============================================
// CLI PROVIDER (for local CLI tools)
// ============================================

import { spawn } from "child_process";

export class CLIProvider implements ExecutionProvider {
  name = "cli";
  private command: string;

  constructor(command = "claude") {
    this.command = command;
  }

  async execute(
    systemPrompt: string,
    userPrompt: string,
    context: ExecutionContext,
    callbacks?: StreamCallback
  ): Promise<ExecutionResult> {
    const startTime = Date.now();

    return new Promise((resolve) => {
      callbacks?.onLog("info", `Starting CLI execution with ${this.command}`, "provider");
      callbacks?.onProgress(0.1, "Spawning CLI process...");

      const args = [
        "--system", systemPrompt,
        "--message", userPrompt,
      ];

      if (context.workspacePath) {
        args.push("--cwd", context.workspacePath);
      }

      const child = spawn(this.command, args, {
        cwd: context.workspacePath,
        env: {
          ...process.env,
          WORKSPACE_ID: context.workspaceId,
          CARD_ID: context.cardId,
          STAGE: context.stage,
        },
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (data) => {
        const chunk = data.toString();
        stdout += chunk;
        callbacks?.onLog("debug", chunk, "cli-stdout");
      });

      child.stderr.on("data", (data) => {
        const chunk = data.toString();
        stderr += chunk;
        callbacks?.onLog("warn", chunk, "cli-stderr");
      });

      child.on("error", (error) => {
        const durationMs = Date.now() - startTime;
        callbacks?.onLog("error", `CLI process error: ${error.message}`, "provider");
        
        resolve({
          success: false,
          error: error.message,
          durationMs,
        });
      });

      child.on("close", (code) => {
        const durationMs = Date.now() - startTime;
        
        if (code === 0) {
          callbacks?.onLog("info", `CLI execution completed in ${durationMs}ms`, "provider");
          callbacks?.onProgress(1.0, "Execution complete");
          
          resolve({
            success: true,
            output: stdout,
            durationMs,
          });
        } else {
          callbacks?.onLog("error", `CLI process exited with code ${code}`, "provider");
          
          resolve({
            success: false,
            error: stderr || `Process exited with code ${code}`,
            output: stdout,
            durationMs,
          });
        }
      });
    });
  }
}

// ============================================
// PROVIDER REGISTRY
// ============================================

const providers: Map<string, ExecutionProvider> = new Map();

export function registerProvider(provider: ExecutionProvider): void {
  providers.set(provider.name, provider);
}

export function getProvider(name: string): ExecutionProvider | undefined {
  return providers.get(name);
}

export function getDefaultProvider(): ExecutionProvider {
  // Default to Anthropic
  if (!providers.has("anthropic")) {
    registerProvider(new AnthropicProvider());
  }
  return providers.get("anthropic")!;
}

// Initialize default providers
registerProvider(new AnthropicProvider());

// Only register CLI provider if the command exists
try {
  registerProvider(new CLIProvider());
} catch {
  // CLI not available
}

// ============================================
// HELPER: Create callbacks that log to DB
// ============================================

import { createArtifact } from "./run-manager";

export function createDbCallbacks(
  runId: string,
  cardId: string,
  workspaceId: string,
  stage: string
): StreamCallback {
  return {
    onLog: async (level, message, stepKey) => {
      await addRunLog(runId, level, message, stepKey);
    },
    onProgress: async (progress, message) => {
      if (message) {
        await addRunLog(runId, "info", `[${Math.round(progress * 100)}%] ${message}`, "progress");
      }
    },
    onArtifact: async (type, label, uri, meta) => {
      await createArtifact({
        runId,
        cardId,
        workspaceId,
        stage: stage as import("@/lib/db/schema").ProjectStage,
        artifactType: type as import("@/lib/db/schema").ArtifactType,
        label,
        uri,
        meta,
      });
    },
  };
}
