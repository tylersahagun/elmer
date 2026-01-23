/**
 * Type definitions for third-party integration payloads
 */

// ============================================
// SLACK TYPES
// ============================================

export interface SlackEventPayload {
  type: "url_verification" | "event_callback";
  challenge?: string; // For url_verification
  token?: string; // Deprecated verification token (ignored)
  team_id?: string;
  api_app_id?: string;
  event?: SlackMessageEvent;
  event_id?: string;
  event_time?: number;
}

export interface SlackMessageEvent {
  type: string; // "message"
  channel: string; // Channel ID (e.g., "C1234567890")
  user: string; // User ID who sent message
  text: string; // Message content
  ts: string; // Message timestamp (e.g., "1234567890.123456")
  thread_ts?: string; // Thread timestamp if reply
  bot_id?: string; // Present if sent by a bot
  subtype?: string; // Message subtype (message_changed, message_deleted, etc.)
}

export interface SlackMessageInput {
  workspaceId: string;
  event: SlackMessageEvent;
  teamId: string;
  receivedAt: Date;
}

// ============================================
// PYLON TYPES
// ============================================

export interface PylonWebhookPayload {
  data: PylonTicketData;
  event_type?: string; // "issue.created", "issue.updated", etc.
}

export interface PylonTicketData {
  id: string;
  title?: string;
  body_html?: string;
  body_text?: string; // Plain text version if available
  state?: string; // "open", "closed", etc.
  priority?: string;
  requester?: {
    email: string;
    name?: string;
  };
  account?: {
    id: string;
    name?: string;
  };
  link?: string; // URL to ticket in Pylon
  created_at?: string;
  updated_at?: string;
}

export interface PylonTicketInput {
  workspaceId: string;
  payload: PylonTicketData;
  receivedAt: Date;
}

// ============================================
// COMMON TYPES
// ============================================

export interface SignalCreateResult {
  created: boolean;
  signalId?: string;
  duplicate?: boolean;
  filtered?: string; // Reason if filtered out (bot_message, subtype)
  error?: string;
}
