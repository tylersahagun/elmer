/**
 * Tour step definitions for the post-onboarding tour.
 *
 * The tour shows how workspace components work together (TOUR-02)
 * and where work is created in GitHub (TOUR-03).
 */

/**
 * Placement of the tour step content relative to the spotlight target
 */
export type TourStepPlacement = 'top' | 'bottom' | 'left' | 'right' | 'center';

/**
 * Definition for a single tour step
 */
export interface TourStepDefinition {
  /** Unique identifier for the step */
  id: string;
  /** CSS selector or element ID to highlight (null for center overlay) */
  target: string | null;
  /** Step title */
  title: string;
  /** Step description content */
  content: string;
  /** Placement of content relative to target */
  placement: TourStepPlacement;
  /** Optional example to illustrate the feature */
  example?: string;
  /** Auto-advance time in milliseconds (default: 8000ms) */
  autoAdvanceMs?: number;
  /** Whether this step can be skipped */
  optional?: boolean;
  /** Whether the workspace menu should be opened for this step */
  requiresMenuOpen?: boolean;
}

/**
 * Default auto-advance time in milliseconds (8-10 seconds as per CONTEXT.md)
 */
export const DEFAULT_AUTO_ADVANCE_MS = 8000;

/**
 * Tour steps in order of presentation.
 *
 * Steps are designed to show:
 * 1. How components work together (projects, knowledge base, personas, signals, agents)
 * 2. Where work is created (GitHub repo paths)
 */
export const tourSteps: TourStepDefinition[] = [
  {
    id: 'welcome',
    target: null, // Center overlay, no specific target
    title: 'Welcome to your workspace!',
    content:
      "Your workspace is now connected to GitHub. Let's take a quick tour to see how everything works together.",
    placement: 'center',
    autoAdvanceMs: 6000, // Shorter for welcome
    optional: false,
  },
  {
    id: 'projects-kanban',
    target: '[data-tour="kanban-board"]',
    title: 'Your projects flow through stages',
    content:
      'The kanban board organizes your projects by status. Each column represents a stage in your workflow.',
    placement: 'right',
    example: 'Drag a project to "PRD" to start generating documentation.',
    autoAdvanceMs: DEFAULT_AUTO_ADVANCE_MS,
    optional: true,
  },
  {
    id: 'knowledge-base',
    target: '[data-tour="knowledge-base"]',
    title: 'Your knowledge base syncs from GitHub',
    content:
      'Documentation and context files from your repository are automatically imported here.',
    placement: 'right',
    example: 'These docs inform all AI-generated content for accurate, contextual outputs.',
    autoAdvanceMs: DEFAULT_AUTO_ADVANCE_MS,
    optional: true,
    requiresMenuOpen: true,
  },
  {
    id: 'personas',
    target: '[data-tour="personas"]',
    title: 'Personas represent your users',
    content:
      'Define the different types of users who interact with your product.',
    placement: 'right',
    example: 'Attach personas to projects for targeted PRDs that speak to specific user needs.',
    autoAdvanceMs: DEFAULT_AUTO_ADVANCE_MS,
    optional: true,
    requiresMenuOpen: true,
  },
  {
    id: 'signals',
    target: '[data-tour="signals"]',
    title: 'Signals capture customer feedback',
    content:
      'Collect and organize feedback, feature requests, and insights from your users.',
    placement: 'right',
    example: 'Cluster similar signals to identify patterns and prioritize what matters most.',
    autoAdvanceMs: DEFAULT_AUTO_ADVANCE_MS,
    optional: true,
    requiresMenuOpen: true,
  },
  {
    id: 'agents',
    target: '[data-tour="agents"]',
    title: 'Agents automate your workflow',
    content:
      'AI agents can generate PRDs, analyze feedback, and automate repetitive tasks.',
    placement: 'right',
    example: 'Run an agent to generate a PRD from a project with one click.',
    autoAdvanceMs: DEFAULT_AUTO_ADVANCE_MS,
    optional: true,
    requiresMenuOpen: true,
  },
  {
    id: 'github-integration',
    target: '[data-tour="github-settings"]',
    title: 'All work syncs back to GitHub',
    content:
      'Generated documents, PRDs, and other outputs are automatically committed to your repository.',
    placement: 'left',
    example: 'Look for new files in your .elmer/ or docs/ folder after running agents.',
    autoAdvanceMs: 10000, // Slightly longer for final step
    optional: false,
    requiresMenuOpen: true,
  },
];

/**
 * Total number of tour steps
 */
export const TOTAL_TOUR_STEPS = tourSteps.length;

/**
 * Get a tour step by ID
 */
export function getTourStepById(id: string): TourStepDefinition | undefined {
  return tourSteps.find((step) => step.id === id);
}

/**
 * Get a tour step by index
 */
export function getTourStepByIndex(index: number): TourStepDefinition | undefined {
  return tourSteps[index];
}

/**
 * Check if all step IDs are unique (development helper)
 */
export function validateTourSteps(): boolean {
  const ids = tourSteps.map((step) => step.id);
  const uniqueIds = new Set(ids);
  return ids.length === uniqueIds.size;
}
