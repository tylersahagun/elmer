/**
 * Classification Module Barrel Export
 *
 * Provides signal classification, clustering, and project embedding utilities.
 */

export { classifySignal, generateProjectEmbedding } from "./classifier";
export { findSignalClusters, generateClusterTheme } from "./clustering";
export type { SignalCluster, ClusterSignal } from "./clustering";
