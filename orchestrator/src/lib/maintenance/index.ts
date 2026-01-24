/**
 * Maintenance Module
 *
 * Signal hygiene utilities for orphan detection, duplicate detection,
 * archival workflows, and cleanup suggestions.
 *
 * Usage: import { findOrphanSignals } from "@/lib/maintenance";
 */

export {
  findOrphanSignals,
  getOrphanCount,
  type OrphanSignal,
  type OrphanDetectionResult,
} from "./orphan-detector";

export {
  findDuplicateSignals,
  getDuplicateCount,
  type DuplicatePair,
  type DuplicateDetectionResult,
} from "./duplicate-detector";
