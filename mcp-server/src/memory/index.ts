import Anthropic from "@anthropic-ai/sdk";
import type { StoreMemoryInput, QueryMemoryInput, ToolResult } from "../types.js";

const anthropic = new Anthropic();

// ============================================
// MEMORY STORAGE (In-memory for now, would use SQLite in production)
// ============================================

interface MemoryEntry {
  id: string;
  workspaceId: string;
  projectId?: string;
  type: "decision" | "feedback" | "context" | "artifact" | "conversation";
  content: string;
  embedding?: number[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

// In-memory store (would be replaced with SQLite in production)
const memoryStore: MemoryEntry[] = [];

// ============================================
// EMBEDDING GENERATION
// ============================================

async function generateEmbedding(text: string): Promise<number[]> {
  // Use Claude to generate a semantic representation
  // In production, you'd use a dedicated embedding model like voyage-3 or text-embedding-3
  // For now, we'll use a simple hash-based approach as a placeholder
  
  // Placeholder: Generate a simple numeric representation
  // In production, replace with actual embedding API call
  const hash = text.split("").reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
  }, 0);
  
  // Create a 384-dimensional pseudo-embedding
  const embedding: number[] = [];
  let seed = hash;
  for (let i = 0; i < 384; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    embedding.push((seed / 0x7fffffff) * 2 - 1);
  }
  
  return embedding;
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ============================================
// STORE MEMORY
// ============================================

export async function storeMemory(input: StoreMemoryInput): Promise<ToolResult<{ id: string }>> {
  try {
    const id = crypto.randomUUID();
    const embedding = await generateEmbedding(input.content);
    
    const entry: MemoryEntry = {
      id,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      type: input.type,
      content: input.content,
      embedding,
      metadata: input.metadata,
      createdAt: new Date(),
    };
    
    memoryStore.push(entry);
    
    return { success: true, data: { id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================
// QUERY MEMORY
// ============================================

export async function queryMemory(input: QueryMemoryInput): Promise<ToolResult<MemoryEntry[]>> {
  try {
    const queryEmbedding = await generateEmbedding(input.query);
    
    // Filter by workspace and optionally project
    let candidates = memoryStore.filter((entry) => {
      if (entry.workspaceId !== input.workspaceId) return false;
      if (input.projectId && entry.projectId !== input.projectId) return false;
      return true;
    });
    
    // Score by similarity
    const scored = candidates.map((entry) => ({
      entry,
      score: entry.embedding ? cosineSimilarity(queryEmbedding, entry.embedding) : 0,
    }));
    
    // Sort by score and take top N
    scored.sort((a, b) => b.score - a.score);
    const results = scored.slice(0, input.limit).map((s) => s.entry);
    
    return { success: true, data: results };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================
// GET PROJECT HISTORY
// ============================================

export async function getProjectHistory(
  workspaceId: string,
  projectId: string
): Promise<ToolResult<MemoryEntry[]>> {
  try {
    const entries = memoryStore
      .filter((entry) => entry.workspaceId === workspaceId && entry.projectId === projectId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return { success: true, data: entries };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================
// SUMMARIZE CONTEXT
// ============================================

export async function summarizeContext(
  workspaceId: string,
  projectId?: string
): Promise<ToolResult<string>> {
  try {
    // Get relevant memories
    const memories = memoryStore
      .filter((entry) => {
        if (entry.workspaceId !== workspaceId) return false;
        if (projectId && entry.projectId !== projectId) return false;
        return true;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 20);
    
    if (memories.length === 0) {
      return { success: true, data: "No context available." };
    }
    
    // Use Claude to summarize
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: "You are a helpful assistant summarizing project context. Be concise and focus on key decisions, feedback, and current state.",
      messages: [
        {
          role: "user",
          content: `Summarize this project context:\n\n${memories.map((m) => `[${m.type}] ${m.content}`).join("\n\n")}`,
        },
      ],
    });
    
    const content = response.content[0];
    if (content.type !== "text") {
      return { success: false, error: "Unexpected response type" };
    }
    
    return { success: true, data: content.text };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
