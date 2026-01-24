/**
 * Maintenance Module
 *
 * Signal hygiene utilities for orphan detection, duplicate detection,
 * archival workflows, and cleanup suggestions.
 *
 * Usage: import { findOrphanSignals, archiveSignals } from "@/lib/maintenance";
 */

// Detection
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

// Workflows
export {
  archiveSignals,
  unarchiveSignals,
  getArchivableCount,
  type ArchivalResult,
  type ArchivalCriteria,
} from "./archival";

export {
  mergeSignals,
  dismissDuplicatePair,
  type MergeResult,
} from "./merge";
