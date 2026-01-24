/**
 * Notifications Module
 *
 * Re-exports notification utilities for cleaner imports.
 * Usage: import { notifyClusterDiscovered } from "@/lib/notifications";
 */

export {
  shouldSendNotification,
  createThresholdAwareNotification,
  notifyClusterDiscovered,
  type NotificationContext,
  type NotificationFilterResult,
} from "./threshold-filter";
