---
name: prototype-notification
description: Send Slack DM notification after prototype is built with links to Chromatic, local Storybook, and documentation. Use after proto-builder completes.
---

# Prototype Notification Skill

Send a polished Slack DM notification after a prototype is built, with action buttons linking to Chromatic (hosted walkthrough) and Documentation (embedded in Storybook).

## When to Use

- After `proto-builder` completes successfully
- After Chromatic deployment returns `storybookUrl`
- After documentation MDX files are created in `docs/` folder

## Required Inputs

| Input              | Source                  | Example                                                |
| ------------------ | ----------------------- | ------------------------------------------------------ |
| `initiative_name`  | Proto-builder context   | `flagship-meeting-recap`                               |
| `chromatic_url`    | Chromatic CLI output    | `https://main--696c2c54e35ea5bca2a772d8.chromatic.com` |
| `version`          | `_meta.json` or default | `v1`                                                   |
| `creative_options` | Prototype count         | `3`                                                    |
| `figjam_url`       | `_meta.json` (optional) | `https://www.figma.com/...`                            |

## URL Generation Rules

**CRITICAL:** The Storybook URL path is based on the `title` property in the `.stories.tsx` file, NOT the folder structure.

### Step 1: Find the Story Title

Read the `.stories.tsx` file and find the `meta.title` property:

```typescript
const meta: Meta = {
  title: "Flagship Meeting Recap/RecapArtifact", // <- This determines the URL
  ...
};
```

### Step 2: Convert Title to URL Path

1. Replace spaces with hyphens: `"Flagship Meeting Recap"` → `flagship-meeting-recap`
2. Replace `/` with `-`: `"Flagship Meeting Recap/RecapArtifact"` → `flagship-meeting-recap-recapartifact`
3. Add `--[story-name]` at the end: `flagship-meeting-recap-recapartifact--success`
4. Make everything lowercase

**Common Story Names:** `success`, `loading`, `error`, `empty`, `default`

### Chromatic URL (Hosted)

**Two URL formats available:**

| Format                   | URL Pattern                                 | Use Case                                       |
| ------------------------ | ------------------------------------------- | ---------------------------------------------- |
| **Iframe (Recommended)** | `/iframe.html?id=[story-id]&viewMode=story` | Clean view, no Storybook UI - best for sharing |
| **Full Storybook**       | `/?path=/story/[story-id]`                  | Full Storybook navigation and controls         |

**Iframe format (clean, shareable):**

```
https://[build-hash]--696c2c54e35ea5bca2a772d8.chromatic.com/iframe.html?id=[converted-title]--[story-name]&viewMode=story
```

**Production URL:**

```
https://main--696c2c54e35ea5bca2a772d8.chromatic.com
```

### Local Storybook URL

Always use port 6006 (default Storybook port):

**Iframe format (clean):**

```
http://localhost:6006/iframe.html?id=[converted-title]--[story-name]&viewMode=story
```

### Common Title Patterns

| Story File Title                                         | URL Path                                                        |
| -------------------------------------------------------- | --------------------------------------------------------------- |
| `"Flagship Meeting Recap/RecapArtifact"`                 | `flagship-meeting-recap-recapartifact--[story]`                 |
| `"Prototypes/FlagshipMeetingRecap/InContext"`            | `prototypes-flagshipmeetingrecap-incontext--[story]`            |
| `"FlagshipMeetingRecap/Walkthrough/CompleteWalkthrough"` | `flagshipmeetingrecap-walkthrough-completewalkthrough--[story]` |

### Documentation URL (Storybook Docs)

Documentation is embedded as MDX pages in Storybook for the same clean iframe viewing experience.

**Iframe format for docs:**

```
https://[build-hash]--696c2c54e35ea5bca2a772d8.chromatic.com/iframe.html?id=[docs-path]--docs&viewMode=docs
```

**Documentation is rendered as Storybook stories (React components).**

**Story path conversion:**

1. Take the story's `meta.title` value: `"Flagship Meeting Recap/Documentation"`
2. Replace `/` with `-`, replace spaces with `-`, make lowercase
3. Append `--[story-export-name]` (lowercase)

**Available documentation pages:**

| Page         | Story ID                                             |
| ------------ | ---------------------------------------------------- |
| Overview     | `flagship-meeting-recap-documentation--overview`     |
| PRD          | `flagship-meeting-recap-documentation--prd`          |
| Design Brief | `flagship-meeting-recap-documentation--design-brief` |

## Notification Template (Block Kit)

**Four buttons:** Walkthrough (primary), Customer Story (FigJam), PRD, and Research

```json
{
  "text": "Prototype Ready: [Initiative Name]",
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": ":art: Prototype Ready: [Initiative Name]",
        "emoji": true
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Here's the prototype that's been generated for *[initiative-name]*.\n\n:paintbrush: *[X] Creative Options* created\n:white_check_mark: All AI states implemented\n:runner: Complete walkthrough included"
      }
    },
    { "type": "divider" },
    {
      "type": "actions",
      "block_id": "prototype_links",
      "elements": [
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": ":globe_with_meridians: View Walkthrough",
            "emoji": true
          },
          "url": "[CHROMATIC_WALKTHROUGH_URL]",
          "action_id": "view_walkthrough",
          "style": "primary"
        },
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": ":busts_in_silhouette: Customer Story",
            "emoji": true
          },
          "url": "[FIGJAM_URL]",
          "action_id": "view_figjam"
        },
        {
          "type": "button",
          "text": { "type": "plain_text", "text": ":memo: PRD", "emoji": true },
          "url": "[GITHUB_PRD_URL]",
          "action_id": "view_prd"
        },
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": ":mag: Research",
            "emoji": true
          },
          "url": "[GITHUB_RESEARCH_URL]",
          "action_id": "view_research"
        }
      ]
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": ":package: Version: *[version]* | :eyes: Clean iframe view (no Storybook UI)"
        }
      ]
    }
  ]
}
```

**Notes:**

- If `figjam_url` is not available in `_meta.json`, omit the "Customer Story" button
- PRD and Research link to GitHub: `https://github.com/tylersahagun/elmer/blob/main/elmer-docs/initiatives/[initiative]/prd.md`
- **IMPORTANT:** Files must be committed and pushed to GitHub before links will work

## MCP Tool Call

**Server:** `user-mcp-config-2mgoji`
**Tool:** `SLACK_SEND_MESSAGE`

```json
{
  "channel": "U08JVM8LBP0",
  "text": "Prototype Ready: [Initiative Name]",
  "blocks": [
    /* Block Kit JSON above */
  ]
}
```

**Default Recipient:** Tyler Sahagun (`U08JVM8LBP0`)

To send to a different user, replace the channel with their Slack user ID.

## Complete Example

For initiative `flagship-meeting-recap` with Chromatic base URL `https://main--696c2c54e35ea5bca2a772d8.chromatic.com` and FigJam URL from `_meta.json`:

```json
{
  "channel": "U08JVM8LBP0",
  "text": "Prototype Ready: Flagship Meeting Recap",
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": ":art: Prototype Ready: Flagship Meeting Recap",
        "emoji": true
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Here's the prototype that's been generated for *flagship-meeting-recap*.\n\n:paintbrush: *3 Creative Options* created\n:white_check_mark: All AI states implemented\n:runner: Complete walkthrough included"
      }
    },
    { "type": "divider" },
    {
      "type": "actions",
      "block_id": "prototype_links",
      "elements": [
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": ":globe_with_meridians: View Walkthrough",
            "emoji": true
          },
          "url": "https://main--696c2c54e35ea5bca2a772d8.chromatic.com/iframe.html?id=flagshipmeetingrecap-walkthrough-completewalkthrough--default&viewMode=story",
          "action_id": "view_walkthrough",
          "style": "primary"
        },
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": ":busts_in_silhouette: Customer Story",
            "emoji": true
          },
          "url": "https://www.figma.com/online-whiteboard/create-diagram/8fdb3d58-1f13-4901-b07a-0474aad77030",
          "action_id": "view_figjam"
        },
        {
          "type": "button",
          "text": { "type": "plain_text", "text": ":memo: PRD", "emoji": true },
          "url": "https://github.com/tylersahagun/elmer/blob/main/elmer-docs/initiatives/flagship-meeting-recap/prd.md",
          "action_id": "view_prd"
        },
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": ":mag: Research",
            "emoji": true
          },
          "url": "https://github.com/tylersahagun/elmer/blob/main/elmer-docs/initiatives/flagship-meeting-recap/research.md",
          "action_id": "view_research"
        }
      ]
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": ":package: Version: *v1* | :eyes: Clean iframe view (no Storybook UI)"
        }
      ]
    }
  ]
}
```

## Optional: Screenshot Image

If Chromatic screenshot URL is available, add an image block before the actions:

```json
{
  "type": "image",
  "image_url": "https://[project-id].chromatic.com/snapshot/[build-id]/[story-id].png",
  "alt_text": "Prototype preview for [initiative-name]"
}
```

**Note:** Screenshot URLs require extracting the build ID and story ID from Chromatic output. Skip if not available.

## Execution Steps

When invoked after proto-builder:

1. **Extract initiative name** from proto-builder context
2. **Get Chromatic base URL** from CLI output (look for `storybookUrl` in output)
3. **Read `_meta.json`** to get:
   - `version` (default to `v1`)
   - `figjam_url` (optional - Customer Story button)
4. **Find story title** from `.stories.tsx` file for walkthrough URL
5. **Generate URLs:**
   - Walkthrough: `[base]/iframe.html?id=[story-id]&viewMode=story`
   - FigJam: Use `figjam_url` from `_meta.json` (if available)
   - PRD: `https://github.com/tylersahagun/elmer/blob/main/elmer-docs/initiatives/[initiative]/prd.md`
   - Research: `https://github.com/tylersahagun/elmer/blob/main/elmer-docs/initiatives/[initiative]/research.md`
6. **Build Block Kit message:**
   - Always include: Walkthrough, PRD, Research
   - If `figjam_url` exists: Also include Customer Story button
7. **Send Slack DM** using `SLACK_SEND_MESSAGE` MCP tool

## Integration with slack-block-kit Skill

This skill uses the `slack-block-kit` skill's formatting patterns:

- Header block for title
- Section block for description
- Actions block for buttons (max 5 per block)
- Context block for metadata

Refer to `.cursor/skills/slack-block-kit/SKILL.md` for additional formatting options.

## Error Handling

If Chromatic URL is not available:

- Use placeholder: `https://chromatic.com` with note "Deploy pending"
- Or skip the Chromatic button entirely

If local Storybook path can't be determined:

- Use base URL: `http://localhost:6006`
- User can navigate to prototype manually
