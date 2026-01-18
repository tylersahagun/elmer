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

// Note: ./ui contains shadcn/ui primitives and is NOT exported here
// to avoid duplicate exports. Import directly from './ui' if needed.
