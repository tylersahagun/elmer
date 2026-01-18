/**
 * elmer UI Component Library
 * 
 * A comprehensive set of React components following Atomic Design principles:
 * - Atoms: Basic building blocks (Button, Input, Badge, etc.)
 * - Molecules: Combinations of atoms (Card, FormField, Alert, etc.)
 * - Organisms: Complex UI patterns (Dialog, Navigation, EmptyState)
 * - Brand: elmer-specific brand components (Logo, themes)
 * 
 * Usage:
 * ```tsx
 * import { Button, Card, Dialog, ElmerLogo } from '@/components';
 * ```
 */

// Atoms - Basic UI building blocks
export * from './atoms';

// Molecules - Compound components
export * from './molecules';

// Organisms - Complex components
export * from './organisms';

// Brand - elmer brand components
export * from './brand';

// Legacy UI components (shadcn/ui style)
// These are kept for backwards compatibility
export * from './ui';
