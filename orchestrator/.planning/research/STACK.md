# Stack Recommendations: Onboarding Wizard & Repo Discovery

**Research Date:** 2026-01-25
**Milestone:** Onboarding carousel, repo structure discovery, initiative auto-population
**Researcher:** Claude (Opus 4.5)

## Executive Summary

This document recommends technologies for building an onboarding carousel with conversational UI, GitHub repository analysis, and automatic workspace population. All recommendations work within the existing Next.js 16 + React 19 + Radix UI + Framer Motion stack.

**Key Insight:** The existing codebase already has most foundational pieces in place. The primary gaps are: (1) multi-step wizard state management, (2) structured conversation flow UI, and (3) initiative detection heuristics. No new major dependencies required.

---

## 1. Multi-Step Wizard / Onboarding Carousel

### Recommendation: **Build custom with existing primitives**

**Confidence:** HIGH (95%)

**Rationale:**
- Existing stack has all required pieces: Radix Dialog, Framer Motion animations, Zustand state
- Multi-step wizard libraries (react-multi-step-form, formkit/wizard) add complexity without value for this use case
- Onboarding is not a traditional form submission flow - it's a discovery/configuration flow with async GitHub calls
- Custom implementation allows tight integration with existing animation patterns (`springPresets`, `staggerContainer`)

**Implementation Pattern:**
```typescript
// src/components/onboarding/OnboardingWizard.tsx
interface WizardState {
  step: 'connect' | 'discover' | 'configure' | 'populate' | 'complete';
  repoSelection: { owner: string; repo: string } | null;
  discoveredStructure: DiscoveredStructure | null;
  configOverrides: ConfigOverrides;
}

// Use Zustand for wizard state (already in stack)
const useOnboardingStore = create<OnboardingState>()(...);
```

**What NOT to use:**
| Library | Why Not |
|---------|---------|
| `react-hook-form` | Overkill - onboarding has 2-3 actual inputs, rest is selection/confirmation |
| `formik` + `yup` | Same - validation complexity not needed |
| `@mantine/form` wizard | Pulls in Mantine ecosystem conflict with Radix |
| `react-step-wizard` | Outdated (last update 2022), no React 19 support |
| `use-wizard` | Minimal value over custom implementation |

**Existing code to reuse:**
- `src/components/ui/dialog.tsx` - animated dialog with motion primitives
- `src/lib/store.ts` - Zustand patterns for state management
- `src/lib/animations.ts` - spring presets and stagger containers

---

## 2. Conversational UI / GSD-Style Question Flow

### Recommendation: **Extend existing ChatSidebar pattern**

**Confidence:** HIGH (90%)

**Rationale:**
- `src/components/chat/ChatSidebar.tsx` already implements message threading, slash commands, quick actions
- GSD-style questioning is a structured conversation, not free-form chat
- No AI generation needed for discovery questions - they're deterministic based on repo structure
- Existing pattern handles loading states, suggestions, and response formatting

**Implementation Pattern:**
```typescript
// Structured question flow (not AI-generated)
interface DiscoveryQuestion {
  id: string;
  question: string;
  type: 'confirm' | 'select' | 'multiselect' | 'path';
  context: string; // What we found that prompted this question
  options?: { label: string; value: string }[];
  defaultValue?: string | string[];
}

// Example flow:
// 1. "I found /initiatives/ with 3 folders. Should I import these as projects?"
// 2. "I see /pm-workspace-docs/personas/. Map to personas?"
// 3. "Detected .cursor/commands/. Import agent commands?"
```

**What NOT to use:**
| Library | Why Not |
|---------|---------|
| `@chatui/core` | Chinese-first, heavyweight, wrong abstraction |
| `stream-chat-react` | Designed for Stream Chat service, overkill |
| `react-chat-elements` | Stale (2023), basic styling conflicts |
| AI SDK UI components | Designed for streaming AI responses, not structured Q&A |

**New component to create:**
```typescript
// src/components/onboarding/DiscoveryChat.tsx
// Lightweight, deterministic conversation flow
// No AI dependency - questions derived from repo scan results
```

---

## 3. GitHub Repository Analysis & Tree Parsing

### Recommendation: **Use existing @octokit/rest + custom analysis layer**

**Confidence:** HIGH (95%)

**Rationale:**
- `@octokit/rest ^22.0.1` already installed and working
- `src/app/api/github/tree/route.ts` has tree traversal implemented
- `src/lib/agents/sync.ts` has patterns for fetching file content, parsing directories
- No additional libraries needed - just analysis heuristics

**Implementation Pattern:**
```typescript
// src/lib/github/repo-analyzer.ts
interface RepoAnalysisResult {
  initiatives: InitiativeFolder[];
  contextPaths: {
    personas?: string;
    signals?: string;
    knowledge?: string;
  };
  agentConfig: {
    cursorDir?: boolean;
    agentsMd?: boolean;
    commandsDir?: string;
  };
  prototypePath?: string;
  submodules: Submodule[];
}

// Detection heuristics (not magic - pattern matching)
const INITIATIVE_PATTERNS = [
  '/initiatives/',
  '/projects/',
  '/features/',
];

const PERSONA_PATTERNS = [
  '/personas/',
  '/pm-workspace-docs/personas/',
  '/context/personas/',
];
```

**What NOT to use:**
| Library | Why Not |
|---------|---------|
| `isomorphic-git` | Full git implementation - we only need GitHub API reads |
| `simple-git` | Requires local git access, not web-compatible |
| `degit` | For cloning, not analysis |
| AST parsers | Overkill for directory/metadata detection |

**Existing code to extend:**
- `src/app/api/github/tree/route.ts` - directory listing
- `src/lib/agents/sync.ts` - file content fetching patterns
- `src/app/api/github/[owner]/[repo]/analyze/route.ts` - agent architecture detection

---

## 4. Initiative Metadata Parsing

### Recommendation: **JSON + frontmatter parsing with existing tools**

**Confidence:** HIGH (90%)

**Rationale:**
- Initiative metadata lives in `_meta.json` files (per PROJECT.md)
- May also have markdown frontmatter in PRD/research docs
- No complex parsing needed - standard JSON.parse + simple frontmatter extraction

**Implementation Pattern:**
```typescript
// src/lib/github/initiative-parser.ts
interface InitiativeMeta {
  name: string;
  status: 'inbox' | 'discovery' | 'prd' | 'design' | 'prototype' | 'validate' | 'tickets';
  createdAt?: string;
  updatedAt?: string;
  assignee?: string;
  priority?: 'low' | 'medium' | 'high';
}

// Parse _meta.json from initiative folders
async function parseInitiativeMeta(content: string): Promise<InitiativeMeta> {
  return JSON.parse(content);
}

// Extract frontmatter from markdown files
function extractFrontmatter(markdown: string): Record<string, unknown> {
  const match = markdown.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  // Simple YAML-like parsing (key: value lines)
  // Or use existing remark-frontmatter if needed
}
```

**What NOT to use:**
| Library | Why Not |
|---------|---------|
| `gray-matter` | Could work, but adds dependency for simple parsing |
| `js-yaml` | Full YAML parser overkill for key-value frontmatter |
| `toml` | Not using TOML format |

**If complex YAML needed later:**
- `gray-matter ^4.0.3` - lightweight, well-maintained, SSR-safe
- Only add if frontmatter becomes complex (nested objects, arrays)

---

## 5. Real-time Progress & Streaming

### Recommendation: **Use existing SSE patterns from execution worker**

**Confidence:** HIGH (95%)

**Rationale:**
- `src/app/api/jobs/stream/route.ts` already implements SSE streaming
- `src/hooks/useRealtimeJobs.ts` (referenced in ARCHITECTURE.md) handles client subscription
- Onboarding progress fits same pattern: steps completing, items discovered

**Implementation Pattern:**
```typescript
// Reuse existing SSE infrastructure
// src/app/api/onboarding/progress/route.ts
export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      // Send progress updates as steps complete
      sendEvent(controller, { type: 'step_complete', step: 'discover', data: {...} });
      sendEvent(controller, { type: 'item_found', itemType: 'initiative', name: '...' });
    }
  });
  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } });
}
```

**What NOT to use:**
| Library | Why Not |
|---------|---------|
| `socket.io` | Heavyweight, requires server infrastructure |
| `pusher-js` | Third-party service dependency |
| `ably` | Same - external service |
| WebSockets | SSE sufficient for unidirectional progress |

---

## 6. File/Directory Browser UI

### Recommendation: **Extend existing PathBrowser component**

**Confidence:** MEDIUM (80%)

**Rationale:**
- `src/components/settings/PathBrowser.tsx` already exists for context path selection
- Pattern fits: show GitHub tree, allow selection, navigate folders
- May need enhancement for multi-select and preview

**Implementation Pattern:**
```typescript
// Extend PathBrowser with:
// 1. Multi-select capability for batch initiative import
// 2. Preview pane showing _meta.json content
// 3. Visual indicators for detected structure types
```

**Alternative if PathBrowser insufficient:**
- Build dedicated `RepoExplorer` component using same primitives
- Radix Tree component not needed - flat list with breadcrumb navigation sufficient

**What NOT to use:**
| Library | Why Not |
|---------|---------|
| `react-arborist` | Tree virtualization overkill for GitHub browsing (max ~100 items visible) |
| `@atlaskit/tree` | Atlassian ecosystem, heavy |
| `rc-tree` | Ant Design ecosystem conflict |

---

## 7. State Persistence During Onboarding

### Recommendation: **Zustand with sessionStorage persistence**

**Confidence:** HIGH (90%)

**Rationale:**
- User may refresh during onboarding - don't lose progress
- Session-scoped (not permanent) - clears when tab closes
- Zustand already in stack, has persist middleware

**Implementation Pattern:**
```typescript
// src/lib/stores/onboarding-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useOnboardingStore = create(
  persist(
    (set, get) => ({
      // ... wizard state
    }),
    {
      name: 'elmer-onboarding',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
```

**What NOT to use:**
| Library | Why Not |
|---------|---------|
| `localStorage` directly | Zustand middleware handles serialization edge cases |
| IndexedDB | Overkill for wizard state |
| React Query persistence | Wrong abstraction - this isn't server cache |

---

## 8. Animation & Transitions

### Recommendation: **Existing Framer Motion / Motion setup**

**Confidence:** HIGH (95%)

**Rationale:**
- `framer-motion ^12.26.2` and `motion ^12.26.2` already installed
- `src/lib/animations.ts` has spring presets, stagger patterns
- Dialog component already has flip animations
- Carousel transitions should use same visual language

**Key animations needed:**
```typescript
// Step transitions (horizontal slide)
const stepVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction < 0 ? 300 : -300, opacity: 0 }),
};

// Discovery item appearance (stagger)
// Reuse existing staggerContainer, staggerItem from animations.ts

// Progress indicator (spring)
// Reuse springPresets.snappy
```

---

## Summary: Dependencies to Add

**None required.** All capabilities exist in current stack.

## Summary: New Files to Create

| File | Purpose |
|------|---------|
| `src/components/onboarding/OnboardingWizard.tsx` | Main carousel container with step management |
| `src/components/onboarding/steps/*.tsx` | Individual step components (Connect, Discover, Configure, Populate) |
| `src/components/onboarding/DiscoveryChat.tsx` | Conversational UI for structure confirmation |
| `src/lib/github/repo-analyzer.ts` | Heuristic-based repository structure detection |
| `src/lib/github/initiative-parser.ts` | Parse _meta.json and markdown frontmatter |
| `src/lib/stores/onboarding-store.ts` | Zustand store with session persistence |
| `src/app/api/onboarding/analyze/route.ts` | API route for async repo analysis |
| `src/app/api/onboarding/populate/route.ts` | API route for workspace population |

## Summary: Existing Code to Extend

| File | Extension |
|------|-----------|
| `src/components/settings/PathBrowser.tsx` | Multi-select, preview pane |
| `src/lib/agents/sync.ts` | Reuse file fetching patterns |
| `src/app/api/github/tree/route.ts` | Add recursive option for deep scan |
| `src/lib/store.ts` | Add onboarding state slice or separate store |

---

## Confidence Levels Explained

- **HIGH (90-95%)**: Recommendation aligns with existing patterns, no technical risk
- **MEDIUM (80-89%)**: Recommendation solid but may need iteration based on UX feedback
- **LOW (<80%)**: Would flag concerns, but none in this stack review

---

## Open Questions for Implementation

1. **Submodule handling:** Should onboarding auto-initialize submodules, or prompt user to do so manually first?
2. **Partial import:** If user has 10 initiatives but only wants 3, how does UI handle selection?
3. **Conflict resolution:** If workspace already has projects, how do we handle re-onboarding?
4. **Progress granularity:** How many SSE events per second is reasonable during population?

---

*Stack research complete. Ready for roadmap creation.*
