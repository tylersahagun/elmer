# /video Command

Generate a product marketing video from initiative documentation using Remotion.

## Usage

```
/video [initiative-name] [--type=TYPE] [--preview]
```

## Arguments

| Argument          | Required | Description                                           |
| ----------------- | -------- | ----------------------------------------------------- |
| `initiative-name` | Yes      | Name of the initiative (must have PRD)                |
| `--type`          | No       | Video type: `announcement` (default), `demo`, `recap` |
| `--preview`       | No       | Only generate code, don't render                      |

## Examples

```bash
# Generate announcement video
/video meeting-privacy-agent

# Generate demo walkthrough
/video meeting-privacy-agent --type=demo

# Preview composition without rendering
/video meeting-privacy-agent --preview

# Generate release recap
/video q4-features --type=recap
```

## What This Command Does

1. **Validates Prerequisites**
   - Checks initiative exists in `pm-workspace-docs/initiatives/`
   - Verifies PRD is complete
   - Confirms Remotion project is initialized

2. **Loads Context**
   - PRD for messaging and features
   - Design brief for visual direction
   - Prototype screenshots (if available)
   - Company branding guidelines

3. **Delegates to Subagent**
   - Routes to `video-generator` subagent
   - Applies `remotion-builder` skill
   - Generates video composition code

4. **Outputs**
   - Creates `remotion/src/compositions/{InitiativeName}/`
   - Registers composition in `Root.tsx`
   - Saves props to `videos/{name}/props.json`
   - Optionally renders final video

## Video Types

### `announcement` (Default)

45-60 second feature launch video.

**Structure:**

- Hook (2s) - Attention-grabbing statement
- Problem (4s) - Pain point visualization
- Solution (6s) - Feature introduction
- Demo (18s) - Screenshot walkthrough
- Benefits (6s) - Key value props
- CTA (4s) - Next steps

**Best for:** New feature launches, major releases, product announcements

### `demo`

60-90 second product walkthrough.

**Structure:**

- Context (3s) - What we're showing
- Step 1-N (15s each) - Feature demonstration
- Key moments (10s) - Highlight important details
- Summary (5s) - Recap and next steps

**Best for:** Sales enablement, customer training, documentation

### `recap`

30-45 second release summary.

**Structure:**

- Highlights (10s) - Top features shipped
- Quick demos (20s) - Fast visual tour
- What's next (10s) - Coming soon preview

**Best for:** Weekly updates, changelog videos, sprint reviews

## Prerequisites

Before running `/video`:

1. **Initiative must have PRD**

   ```
   pm-workspace-docs/initiatives/{name}/prd.md
   ```

   If missing, run `/PM {name}` first.

2. **Remotion must be initialized**

   ```bash
   # If not setup, run from pm-workspace:
   cd remotion && npm install
   ```

3. **Screenshots recommended**
   For best results, have prototype screenshots in:

   ```
   remotion/public/screenshots/{initiative-name}/
   ```

   Generate from Storybook:

   ```bash
   cd elephant-ai && npm run storybook -w web
   # Screenshot key screens manually or via Chromatic
   ```

## Output Files

After running `/video meeting-privacy-agent`:

```
pm-workspace/
├── remotion/src/compositions/MeetingPrivacyAgent/
│   ├── index.tsx              # Main export
│   ├── Announcement.tsx       # Video composition
│   └── scenes/
│       ├── Hook.tsx
│       ├── Problem.tsx
│       ├── Solution.tsx
│       ├── Demo.tsx
│       └── CTA.tsx
├── remotion/src/Root.tsx      # Updated with new composition
└── videos/meeting-privacy-agent/
    ├── props.json             # Composition props
    ├── storyboard.md          # Human-readable breakdown
    └── announcement.mp4       # Rendered video (if not --preview)
```

## Next Steps After Running

1. **Preview the video:**

   ```bash
   cd remotion && npm run dev
   ```

   Open http://localhost:3000 and select your composition.

2. **Iterate on content:**
   Edit the scene components or props as needed.

3. **Render final video:**

   ```bash
   npx remotion render {CompositionId} ../videos/{name}/announcement.mp4
   ```

4. **Share for review:**

   ```bash
   /share
   ```

5. **Deploy to AskElephant (future):**
   Integration with AskElephant's video pipeline.

## Error Handling

| Error                      | Solution                                              |
| -------------------------- | ----------------------------------------------------- |
| "Initiative not found"     | Create initiative with `/new-initiative {name}`       |
| "PRD missing"              | Generate PRD with `/PM {name}`                        |
| "Remotion not initialized" | Run setup in `/remotion` directory                    |
| "Screenshots missing"      | Will use placeholder gradients; add screenshots later |

## Related Commands

| Command           | Description                        |
| ----------------- | ---------------------------------- |
| `/PM`             | Generate PRD and documentation     |
| `/proto`          | Build Storybook prototype          |
| `/share`          | Create PR for review               |
| `/new-initiative` | Create initiative folder structure |

## Technical Notes

- Videos are 1920×1080 @ 30fps by default
- All compositions must be deterministic (no `Math.random()`)
- Assets must use `staticFile()` for proper bundling
- Props are saved as JSON for reproducibility
- Render time: ~2-5 minutes for 60-second video (local)
