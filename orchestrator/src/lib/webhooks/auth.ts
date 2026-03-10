/**
 * Webhook authentication utilities
 * Supports API key verification via Convex webhookKeys table.
 *
 * Keys are stored as SHA-256 hashes in Convex. To verify:
 *   SHA-256(incomingApiKey) → lookup by keyHash
 *
 * HMAC signature auth is not supported in the Convex model (no secret stored).
 */
import crypto from "crypto";
import { nanoid } from "nanoid";
import { NextRequest } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}

export interface AuthResult {
  valid: boolean;
  workspaceId?: string;
  webhookKeyId?: string;
  error?: string;
}

/**
 * Verify HMAC-SHA256 signature using timing-safe comparison.
 * Kept for compatibility; HMAC auth via Convex model is not supported.
 */
export function verifyHmacSignature(
  rawBody: string,
  signature: string,
  secret: string,
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const normalizedSignature = signature.startsWith("sha256=")
    ? signature.slice(7)
    : signature;

  try {
    return crypto.timingSafeEqual(
      Buffer.from(normalizedSignature, "hex"),
      Buffer.from(expectedSignature, "hex"),
    );
  } catch {
    return false;
  }
}

/**
 * Verify webhook authentication via API key (X-API-Key header).
 * Hashes the incoming key with SHA-256 and looks up in Convex webhookKeys.
 *
 * HMAC signature (X-Webhook-Signature) auth is deprecated in the Convex
 * model because the secret is not stored. Use X-API-Key instead.
 */
export async function verifyWebhookAuth(
  request: NextRequest,
  _rawBody: string,
): Promise<AuthResult> {
  const apiKey = request.headers.get("x-api-key");
  if (apiKey) {
    const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex");
    const client = getConvexClient();
    const webhookKey = await client.query(api.webhookKeys.findByKeyHash, { keyHash });

    if (!webhookKey) {
      return { valid: false, error: "Invalid API key" };
    }

    return {
      valid: true,
      workspaceId: webhookKey.workspaceId as string,
      webhookKeyId: webhookKey._id as string,
    };
  }

  const signature = request.headers.get("x-webhook-signature");
  if (signature) {
    return {
      valid: false,
      error: "HMAC signature auth is not supported in this version. Use X-API-Key.",
    };
  }

  return { valid: false, error: "No authentication provided" };
}

/**
 * Generate new webhook credentials.
 * The API key is returned as-is to the caller; only its SHA-256 hash is stored.
 */
export function generateWebhookCredentials(): {
  apiKey: string;
  keyHash: string;
} {
  const apiKey = `wk_${nanoid(32)}`;
  const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex");
  return { apiKey, keyHash };
}
