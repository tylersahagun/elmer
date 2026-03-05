# Storybook Live Preview Research

## Problem Statement

We want to build Storybook prototypes via the `@Cursor proto` command in Slack, automatically deploy them to a shareable URL (not localhost), and send the live link back to Slack so prototypes can be viewed on mobile.

---

## Solution Options Evaluated

| Option | Pros | Cons | Cost | Best For |
|--------|------|------|------|----------|
| **Chromatic** ✅ | Purpose-built for Storybook, visual testing, GitHub Action with URL output, CDN-hosted | Requires signup | Free: 5K snapshots/mo | Our use case |
| **Vercel** | Fast deploys, preview URLs | Not Storybook-specific | Free tier available | General sites |
| **Netlify** | Deploy previews | Manual config | Free tier available | General sites |
| **GitHub Pages** | Free | Slow, no preview per-commit | Free | Static sites |
| **Ngrok/Cloudflare Tunnel** | Instant | Requires local machine running | Free tier | Local testing |

---

## Recommended: Chromatic

### Why Chromatic?

1. **Purpose-built for Storybook** - Made by the Storybook team
2. **Automatic shareable URLs** - Every build gets a unique URL
3. **Permalink per branch** - `https://<branch>--<appid>.chromatic.com`
4. **GitHub Action outputs** - Returns `storybookUrl` that we can send to Slack
5. **Visual testing** - Catches UI regressions (bonus feature)
6. **CDN-hosted** - Fast loading on mobile devices
7. **Free tier** - 5,000 snapshots/month (enough for PM prototyping)

### URL Format

```
# Per-build URL (unique)
https://www.chromatic.com/build?appId=abc123&number=100

# Branch permalink (always latest)
https://main--abc123.chromatic.com

# Specific story
https://main--abc123.chromatic.com/?path=/story/hubspotconfig--default
```

### GitHub Action Output

The Chromatic action outputs:

| Output | Description | Example |
|--------|-------------|---------|
| `storybookUrl` | Preview URL for branch | `https://main--abc123.chromatic.com` |
| `buildUrl` | Chromatic build page | `https://www.chromatic.com/build?appId=...` |
| `url` | Alias for buildUrl | Same as above |
| `changeCount` | Visual changes detected | `3` |
| `componentCount` | Components published | `15` |

---

## Implementation Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Slack Workflow                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  @Cursor proto hubspot-config                                    │
│  "Create a settings panel with toggle switches"                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Cursor Agent (pm-workspace repo)                                │
│  1. Creates components in prototypes/src/components/             │
│  2. Creates .stories.tsx files                                   │
│  3. Commits and pushes to main                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  GitHub Action: deploy-storybook.yml                             │
│  1. Triggers on push to prototypes/**                            │
│  2. Builds Storybook                                             │
│  3. Deploys to Chromatic                                         │
│  4. Gets storybookUrl output                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Slack Notification                                              │
│  "🎨 New Storybook Prototype Ready!"                             │
│  [📱 Open Storybook] [🔍 View in Chromatic]                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Tyler on Phone                                                  │
│  Clicks link → Views prototype on mobile                         │
│  Provides feedback → @Cursor in Slack                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Setup Steps

### 1. Create Chromatic Account

1. Go to [chromatic.com](https://www.chromatic.com)
2. Sign in with GitHub
3. Create a new project → Select `pm-workspace` repo
4. Copy the **Project Token**

### 2. Add GitHub Secrets

In `tylersahagun/pm-workspace` → Settings → Secrets:

| Secret Name | Value |
|-------------|-------|
| `CHROMATIC_PROJECT_TOKEN` | Token from Chromatic dashboard |
| `SLACK_BOT_TOKEN` | From Slack app (xoxb-...) |
| `SLACK_CHANNEL_ID` | Channel ID for notifications |

### 3. Create Slack App (if needed)

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Create New App → From Scratch
3. Add scopes: `chat:write`, `chat:write.public`
4. Install to workspace
5. Copy Bot Token (xoxb-...)

### 4. Test the Workflow

```bash
# In pm-workspace
cd prototypes
# Make a small change
echo "// test" >> src/components/Button/Button.tsx
git add . && git commit -m "Test Chromatic deploy" && git push
```

Watch the GitHub Action run and check Slack for the notification.

---

## Cursor Agent Enhancement

The proto command should:

1. **Build the prototype** - Create components and stories
2. **Commit and push** - Trigger the GitHub Action
3. **Wait for deployment** - Poll or just notify immediately
4. **Return in Slack** - "Prototype deploying! You'll receive a link when ready."

### Updated Proto Flow

```
User: @Cursor proto hubspot-config "Add a validation toggle"

Agent:
1. Read existing prototype at prototypes/src/components/HubSpotConfig/
2. Create/update components
3. Create/update .stories.tsx
4. Run `npm run build-storybook` locally to verify
5. Commit: "feat(prototype): Add validation toggle to HubSpotConfig"
6. Push to main
7. Respond: "✅ Prototype updated! Deploying now...
   You'll receive a Slack notification with the preview link in ~2 minutes."

[GitHub Action runs → Slack notification with live URL]
```

---

## Alternative: Manual Deploy Command

If you want more control, add a manual trigger:

```
@Cursor deploy prototype
```

This could:
1. Build Storybook
2. Manually trigger the GitHub Action via workflow_dispatch
3. Wait for URL
4. Return in Slack

---

## Cost Analysis

### Chromatic Free Tier
- 5,000 snapshots/month
- Unlimited projects
- 30 days history

### Estimated Usage
- ~10 prototypes/week
- ~5 components/prototype
- ~3 viewports tested
- = ~150 snapshots/week
- = ~600 snapshots/month
- **Well within free tier**

---

## Next Steps

1. [x] Create GitHub Action workflow (`deploy-storybook.yml`)
2. [ ] Create Chromatic account and get project token
3. [ ] Add secrets to GitHub repo
4. [ ] Create/configure Slack app for notifications
5. [ ] Test end-to-end flow
6. [ ] Update pm-workspace.mdc rules with deployment step
7. [ ] Document in SLACK-COMMANDS.md

---

## References

- [Chromatic GitHub Action](https://www.chromatic.com/docs/github-actions)
- [Chromatic Publishing](https://www.chromatic.com/docs/publish)
- [Storybook Publishing Docs](https://storybook.js.org/docs/sharing/publish-storybook)
- [Slack GitHub Action](https://github.com/slackapi/slack-github-action)
