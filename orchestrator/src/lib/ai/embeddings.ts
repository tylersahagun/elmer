/**
 * AI Embeddings Module
 *
 * Generates text embeddings using OpenAI's text-embedding-3-small model.
 * Includes Base64 conversion utilities for storage (matching memoryEntries pattern).
 */

import OpenAI from "openai";

// Maximum characters to process (text-embedding-3-small supports ~8191 tokens)
const MAX_INPUT_LENGTH = 30000;

/**
 * Generate a vector embedding for the given text using OpenAI text-embedding-3-small.
 *
 * @param text - The text to embed
 * @returns Array of numbers representing the 1536-dimensional embedding vector
 * @throws Error if the OpenAI API call fails
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Clean and prepare input text
  const cleanedText = cleanText(text);

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: cleanedText,
  });

  return response.data[0].embedding;
}

/**
 * Clean input text for embedding generation.
 * - Replace newlines with spaces
 * - Trim whitespace
 * - Truncate to max length
 */
function cleanText(text: string): string {
  return text
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_INPUT_LENGTH);
}

/**
 * Convert an embedding array to Base64 string for compact storage.
 * Uses Float32Array for efficient binary representation.
 *
 * @param embedding - Array of numbers (embedding vector)
 * @returns Base64 encoded string
 */
export function embeddingToBase64(embedding: number[]): string {
  const float32Array = new Float32Array(embedding);
  const buffer = Buffer.from(float32Array.buffer);
  return buffer.toString("base64");
}

/**
 * Convert a Base64 string back to an embedding array.
 *
 * @param base64 - Base64 encoded embedding string
 * @returns Array of numbers (embedding vector)
 */
export function base64ToEmbedding(base64: string): number[] {
  const buffer = Buffer.from(base64, "base64");
  const float32Array = new Float32Array(
    buffer.buffer,
    buffer.byteOffset,
    buffer.length / 4
  );
  return Array.from(float32Array);
}

/**
 * Generate embedding and return as Base64 for direct storage.
 * Convenience function combining generateEmbedding and embeddingToBase64.
 *
 * @param text - The text to embed
 * @returns Base64 encoded embedding string ready for database storage
 */
export async function generateEmbeddingBase64(text: string): Promise<string> {
  const embedding = await generateEmbedding(text);
  return embeddingToBase64(embedding);
}
