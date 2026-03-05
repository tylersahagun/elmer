# Multi-Platform Prototyping Architecture

> Generated: 2026-03-04
> Purpose: Add alternative prototyping surfaces (nano-banana, Figma Make, v0, Magic Patterns, Replit) alongside Storybook/Chromatic as the canonical output, enabling prototype conversations to have multiple concurrent directions

---

## The Model: Storybook/Chromatic as Canonical + N Alternatives

The core idea is that **Storybook/Chromatic is the source of truth** (production-ready components in the real elephant-ai codebase), but a prototype conversation can have multiple **prototype variants** at different fidelities, from different tools, running in parallel. The Elmer project detail Prototypes tab shows all of them.

```
Initiative: "Meeting Summary AI Feed"
│
├── Storybook/Chromatic (canonical)
│   └── production React components, deployed to Chromatic
│       Status: v2, passing jury
│
├── nano-banana (visual exploration)
│   └── 3 PNG mockups: dark theme, light theme, mobile
│       Status: generated Mar 3, used as reference for v2
│
├── v0 (rapid UI iteration)
│   └── 4 TSX component variants (FeedCard, EmptyState, LoadingState, ErrorState)
│       Status: variants A and B promoted to Storybook
│
├── Magic Patterns (embeddable concept)
│   └── hosted URL: https://app.magicpatterns.com/[id]
│       Status: shared with Rob for async review
│
└── Figma Make (designer handoff exploration)
    └── GitHub: askelephant/prototypes/meeting-summary-figma-make
        Status: transferred to Adam for refinement
```

---

## Data Schema Extension

Add to Elmer's `prototypes` table (existing) and create a new `prototype_variants` table:

```sql
-- Extend existing prototypes table with variant relationship
ALTER TABLE prototypes ADD COLUMN is_canonical BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE prototypes ADD COLUMN variant_group_id TEXT; -- groups variants under one initiative

-- New: prototype_variants stores all non-Storybook prototype outputs
CREATE TABLE prototype_variants (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  prototype_id TEXT REFERENCES prototypes(id) ON DELETE SET NULL, -- optional link to canonical
  
  -- Platform identity
  platform TEXT NOT NULL, -- 'storybook' | 'v0' | 'magic_patterns' | 'figma_make' | 'replit' | 'nano_banana'
  platform_variant TEXT, -- e.g. 'v0-1.5-lg', 'figma-make-claude', 'replit-agent'
  
  -- What was generated
  name TEXT NOT NULL,
  prompt TEXT, -- the generation prompt used
  description TEXT,
  
  -- Output
  output_type TEXT NOT NULL, -- 'iframe_url' | 'static_images' | 'tsx_code' | 'github_repo' | 'deployed_url'
  output_url TEXT,           -- iframe URL, deployed URL, or Chromatic URL
  output_images JSONB,       -- array of { url, label, description } for image outputs (nano-banana)
  output_code TEXT,          -- raw TSX/code for v0/Figma Make exports
  github_repo TEXT,          -- for Figma Make or Magic Patterns GitHub sync
  github_branch TEXT,
  
  -- Status and lifecycle
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft' | 'review' | 'promoted' | 'archived'
  promoted_to_storybook BOOLEAN NOT NULL DEFAULT FALSE,
  promotion_notes TEXT,
  
  -- Human review
  feedback TEXT,
  rating INTEGER, -- 1-5
  reviewed_by TEXT REFERENCES users(id),
  reviewed_at TIMESTAMP,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prototype_variants_project ON prototype_variants(project_id);
CREATE INDEX idx_prototype_variants_platform ON prototype_variants(platform);
CREATE INDEX idx_prototype_variants_status ON prototype_variants(status);
```

---

## Platform Profiles

### nano-banana

| Property | Value |
|----------|-------|
| **Role** | Visual exploration, moodboards, wireframes — upstream of code |
| **Output** | PNG/JPEG/WebP images stored in Elmer + asset storage |
| **Automation** | Full CLI automation (`uv tool install nanobanana-cli`) |
| **API** | CLI: `nano-banana dashboard "prompt" --output ./assets/` |
| **iframeable** | No — static images rendered in a gallery view |
| **Cost** | Gemini API costs (~$0.001/image) |
| **When to use** | Before any code is written; visual direction exploration; moodboards for the jury |

**Integration:** Agent calls `nano-banana` CLI, stores images in Elmer's asset storage, creates `prototype_variants` record with `output_type: 'static_images'`. Images are displayed as a gallery in the Prototypes tab.

```typescript
// In Elmer's job executor for platform: 'nano_banana'
async function executeNanoBananaVariant(job) {
  const { prompt, projectName, styles } = job.input;
  
  // Generate multiple directions
  const commands = [
    `nano-banana dashboard "${prompt} - light theme" --output /tmp/${jobId}-light.png`,
    `nano-banana dashboard "${prompt} - dark theme" --output /tmp/${jobId}-dark.png`,
    `nano-banana wireframe "${prompt}" --output /tmp/${jobId}-wire.png`,
  ];
  
  const images = await Promise.all(commands.map(cmd => exec(cmd)));
  const uploadedUrls = await uploadToStorage(images);
  
  await savePrototypeVariant({
    platform: 'nano_banana',
    output_type: 'static_images',
    output_images: uploadedUrls.map((url, i) => ({
      url,
      label: ['Light Theme', 'Dark Theme', 'Wireframe'][i],
    })),
  });
}
```

---

### v0 (Vercel)

| Property | Value |
|----------|-------|
| **Role** | Rapid TSX component generation; best path to Storybook promotion |
| **Output** | TSX code, deployable Vercel URL |
| **Automation** | Full API (OpenAI-compatible), TypeScript SDK |
| **API** | `POST https://api.v0.dev/v1/chat/completions` or `v0-sdk` |
| **iframeable** | Via Vercel deploy URL |
| **Cost** | Premium/Team plan required for API |
| **When to use** | Quick component exploration; when you want something promotable to Storybook |

**Integration:** Elmer calls the v0 API with project context and AskElephant design system instructions. Returns TSX that can be stored in Elmer, embedded via Vercel preview, or promoted directly to elephant-ai.

```typescript
// New job type: 'generate_v0_variant'
async function executeV0Variant(job) {
  const { prompt, projectContext, designSystemInstructions } = job.input;
  
  const response = await fetch('https://api.v0.dev/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.V0_API_KEY}` },
    body: JSON.stringify({
      model: 'v0-1.5-lg',
      messages: [
        {
          role: 'user',
          content: `${designSystemInstructions}\n\nCreate: ${prompt}\n\nContext: ${projectContext}`,
        },
      ],
      stream: false,
    }),
  });
  
  const { choices } = await response.json();
  const tsxCode = choices[0].message.content;
  
  await savePrototypeVariant({
    platform: 'v0',
    platform_variant: 'v0-1.5-lg',
    output_type: 'tsx_code',
    output_code: tsxCode,
    prompt,
  });
}
```

**Promotion to Storybook:** When a v0 variant is marked for promotion, an agent takes the TSX code, adapts it to use `@/` imports from elephant-ai's component tree, wraps it in a Storybook story, and commits it via `write_repo_files`.

---

### Magic Patterns

| Property | Value |
|----------|-------|
| **Role** | Embeddable concept prototypes; best for async stakeholder review |
| **Output** | Hosted URL (native iframe embed) |
| **Automation** | REST API + MCP server |
| **API** | `POST https://api.magicpatterns.com/v1/generate` ($99/mo, 100 gen/mo) |
| **iframeable** | Yes — API returns URL designed for direct iframe embedding |
| **Cost** | $99/month + $0.25/generation over 100 |
| **When to use** | Sharing concepts with stakeholders who don't have Chromatic access; fast visual iteration with Figma export |

**Integration:** Elmer calls Magic Patterns API, stores returned URL, embeds directly in the Prototypes tab iframe viewer. Can also pull Figma file context for consistency.

```typescript
// New job type: 'generate_magic_patterns_variant'
async function executeMagicPatternsVariant(job) {
  const { prompt, figmaFileUrl, designSystem } = job.input;
  
  const response = await fetch('https://api.magicpatterns.com/v1/generate', {
    method: 'POST',
    headers: { 'x-api-key': process.env.MAGIC_PATTERNS_API_KEY },
    body: JSON.stringify({ prompt, figmaContext: figmaFileUrl }),
  });
  
  const { url } = await response.json();
  
  await savePrototypeVariant({
    platform: 'magic_patterns',
    output_type: 'iframe_url',
    output_url: url,
    prompt,
  });
}
```

---

### Figma Make

| Property | Value |
|----------|-------|
| **Role** | Designer-first exploration; best when starting from Figma frames |
| **Output** | React/TS code + live URL; GitHub export |
| **Automation** | No public API — human-triggered only |
| **API** | None (Figma Embed API exists but doesn't trigger generation) |
| **iframeable** | Yes — published Figma Make apps embed via URL |
| **Cost** | Included in Figma plans |
| **When to use** | Designer (Skylar/Adam) has existing Figma frames; needs an interactive version fast |

**Integration:** No programmatic generation -- Figma Make is triggered manually by a designer. Elmer stores the resulting URL or GitHub repo link. The agent's role is: after Figma Make runs, sync the output into Elmer and optionally adapt components to elephant-ai's design system.

```typescript
// Not auto-generated; added manually via API
POST /api/projects/[id]/prototype-variants
{
  "platform": "figma_make",
  "output_type": "iframe_url",  
  "output_url": "https://make.figma.com/proto/[id]",
  "github_repo": "AskElephant/meeting-summary-figma-make",
  "name": "Meeting Summary - Designer Direction"
}
```

---

### Replit

| Property | Value |
|----------|-------|
| **Role** | Full running demo for external stakeholders or technical exploration |
| **Output** | Running app with shareable URL |
| **Automation** | No generative API |
| **API** | No programmatic generation |
| **iframeable** | Yes (`?embed=true&lite=true`) |
| **Cost** | Free tier available |
| **When to use** | Need a full running app (with backend) for a demo; external stakeholder who needs to click through a real experience |

**Integration:** Like Figma Make -- manually created, URL stored in Elmer as a variant record.

---

## UI: Prototypes Tab Redesign

The current Prototypes tab in Elmer's project detail shows a single Storybook embed. Redesign it to show all variants with clear hierarchy:

```
┌─────────────────────────────────────────────────────────────────┐
│  Prototypes                                    + Add Variant ▼  │
│                                                                  │
│  ⭐ Canonical                                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Storybook/Chromatic  v2  ✓ Jury Pass                      │ │
│  │  [Storybook iframe embedded here]                          │ │
│  │  https://main--b6891b.chromatic.com?path=/story/...        │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Variants                                        Show all (4) ▾ │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ 🎨 nano-banana   │  │ ⚡ v0            │  │ 🔗 Magic     │  │
│  │ Visual Explore   │  │ Component Draft  │  │ Patterns     │  │
│  │ Mar 3, 3 images  │  │ 4 TSX variants   │  │ Embeddable   │  │
│  │ [View Gallery]   │  │ [View + Promote] │  │ [Open Embed] │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│                                                                  │
│  + Generate New Variant                                          │
│    [nano-banana] [v0] [Magic Patterns] [Figma Make] [Replit]    │
└─────────────────────────────────────────────────────────────────┘
```

### New API Routes

```
POST   /api/projects/[id]/prototype-variants           Create variant (manual or auto)
GET    /api/projects/[id]/prototype-variants           List all variants
PATCH  /api/projects/[id]/prototype-variants/[vid]     Update status, feedback, rating
POST   /api/projects/[id]/prototype-variants/[vid]/promote  Promote v0 TSX to Storybook
DELETE /api/projects/[id]/prototype-variants/[vid]     Archive variant

POST   /api/generate/nano-banana   Trigger nano-banana generation job
POST   /api/generate/v0            Trigger v0 generation job
POST   /api/generate/magic-patterns Trigger Magic Patterns generation job
```

---

## New Job Types

Add to the 16 existing job types:

| Job Type | Platform | What It Does |
|----------|----------|-------------|
| `generate_visual_mockup` | nano-banana | Runs `nano-banana` CLI for 2-3 visual directions |
| `generate_v0_variant` | v0 | Calls v0 API, stores TSX code, optionally deploys to Vercel |
| `generate_magic_patterns_variant` | Magic Patterns | Calls Magic Patterns API, stores iframe URL |
| `promote_variant_to_storybook` | → Storybook | Takes TSX from v0/Figma Make, adapts imports, creates Storybook story, commits to elephant-ai |

---

## Prototype Variant Lifecycle

```
Exploration          Review              Decision
──────────           ──────              ────────
                                         
nano-banana ──┐                         → Archive (used as visual ref)
              │                          
v0 ───────────┼──→ Variants Tab ──→ Jury Review ──→ Promote to Storybook
              │    (show all)                         (canonical)
Magic ────────┤                         → Archive (stakeholder ref)
Patterns      │                          
              │                         → Archive
Figma Make ───┘                          
Replit                                  → Archive
```

---

## Integration with the Memory Graph

Each prototype variant becomes a graph node:

```
project ──[has_variant]──→ nano_banana_mockup
project ──[has_variant]──→ v0_component_draft
project ──[has_canonical]──→ storybook_prototype

v0_component_draft ──[promoted_to]──→ storybook_prototype
v0_component_draft ──[informed_by]──→ nano_banana_mockup
storybook_prototype ──[evaluated_by]──→ jury_evaluation
```

This lets agents traverse: "show me all prototype variants for this project, and which one influenced the canonical build."
