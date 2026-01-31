/**
 * Webhook authentication utilities
 * Supports both API key and HMAC signature verification
 */
import crypto from "crypto";
import { nanoid } from "nanoid";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { webhookKeys } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export interface AuthResult {
  valid: boolean;
  workspaceId?: string;
  webhookKeyId?: string;
  error?: string;
}

/**
 * Verify HMAC-SHA256 signature using timing-safe comparison
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

  // Handle both 'sha256=xxx' and plain 'xxx' formats
  const normalizedSignature = signature.startsWith("sha256=")
    ? signature.slice(7)
    : signature;

  try {
    return crypto.timingSafeEqual(
      Buffer.from(normalizedSignature, "hex"),
      Buffer.from(expectedSignature, "hex"),
    );
  } catch {
    // Buffer lengths don't match - invalid signature format
    return false;
  }
}

/**
 * Verify webhook authentication via API key or HMAC signature
 *
 * Supports two authentication methods:
 * 1. API Key: X-API-Key header contains the apiKey from webhookKeys table
 * 2. HMAC Signature: X-Webhook-Signature + X-Workspace-ID headers
 */
export async function verifyWebhookAuth(
  request: NextRequest,
  rawBody: string,
): Promise<AuthResult> {
  // Option 1: HMAC Signature (preferred for security)
  const signature = request.headers.get("x-webhook-signature");
  const workspaceIdHeader = request.headers.get("x-workspace-id");

  if (signature && workspaceIdHeader) {
    const webhookKey = await db.query.webhookKeys.findFirst({
      where: and(
        eq(webhookKeys.workspaceId, workspaceIdHeader),
        eq(webhookKeys.isActive, true),
      ),
    });

    if (!webhookKey) {
      return { valid: false, error: "Invalid workspace or inactive key" };
    }

    const isValid = verifyHmacSignature(rawBody, signature, webhookKey.secret);
    if (!isValid) {
      return { valid: false, error: "Invalid signature" };
    }

    return {
      valid: true,
      workspaceId: webhookKey.workspaceId,
      webhookKeyId: webhookKey.id,
    };
  }

  // Option 2: API Key (simpler integration)
  const apiKey = request.headers.get("x-api-key");
  if (apiKey) {
    const webhookKey = await db.query.webhookKeys.findFirst({
      where: and(
        eq(webhookKeys.apiKey, apiKey),
        eq(webhookKeys.isActive, true),
      ),
    });

    if (!webhookKey) {
      return { valid: false, error: "Invalid API key" };
    }

    return {
      valid: true,
      workspaceId: webhookKey.workspaceId,
      webhookKeyId: webhookKey.id,
    };
  }

  return { valid: false, error: "No authentication provided" };
}

/**
 * Generate new webhook credentials
 * Returns prefixed API key and hex-encoded HMAC secret
 */
export function generateWebhookCredentials(): {
  apiKey: string;
  secret: string;
} {
  return {
    apiKey: `wk_${nanoid(32)}`,
    secret: crypto.randomBytes(32).toString("hex"),
  };
}
