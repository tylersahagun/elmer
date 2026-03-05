# Slack Block Kit Digests

This document contains ready-to-use Block Kit JSON for sharing digests in Slack.

**How to use:**

1. Copy the JSON you want to send
2. Go to [Block Kit Builder](https://app.slack.com/block-kit-builder) to preview/test
3. Or use the Slack API `chat.postMessage` with the `blocks` parameter
4. Or paste directly into a Slack workflow that accepts Block Kit

---

## Daily Digest - January 23, 2026

```json
{
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "AskElephant Daily Digest",
        "emoji": true
      }
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "📰 Thursday, January 23, 2026"
        }
      ]
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*🏆 Today's Headline*\n\n>*Dialpad Goes Live + Desktop Stability* — Dialpad direct integration shipped today, bringing another major telephony platform to AskElephant. Desktop app also got significant recording improvements."
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*✨ New Features*\n\n*CRM Integrations*\n• Dialpad direct integration — full telephony support now live\n• Dialpad event handling — deduplication and callback routing\n\n*Recording & Capture*\n• Desktop MP4 audio — higher quality desktop recordings\n• Web recording visual feedback — indicators during active recording\n\n*Platform*\n• First login tracking — PostHog analytics for new users\n• Scalable seeder infrastructure — test data generation"
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*🔧 Improvements*\n\n• Engagement page restored — full functionality back\n• AI description improvements\n• Engagement query performance — instrumented dataloaders"
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*🐛 Bugs Fixed: 6*\n\n• Auto logout toggle restored\n• Desktop recording stop reliability\n• Mobile push notification delivery\n• Resend webhook rawBody issues\n• Stripe billing adjustments\n• Desktop build memory optimization"
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*👥 Team Focus*"
      }
    },
    {
      "type": "section",
      "fields": [
        {
          "type": "mrkdwn",
          "text": "*Eduardo*\nDialpad, desktop fixes, mobile"
        },
        {
          "type": "mrkdwn",
          "text": "*Matt Noxon*\nPerformance, dataloaders, seeder"
        },
        {
          "type": "mrkdwn",
          "text": "*Jason*\nStripe, PostHog, auto-logout fix"
        },
        {
          "type": "mrkdwn",
          "text": "*Dylan*\nVoiceprint, embeddings arch"
        },
        {
          "type": "mrkdwn",
          "text": "*Bryan*\nAI description improvements"
        },
        {
          "type": "mrkdwn",
          "text": "*Palmer*\nHubSpot app card POC, notes"
        },
        {
          "type": "mrkdwn",
          "text": "*Adam*\nEngagement card updates"
        },
        {
          "type": "mrkdwn",
          "text": "*Skylar*\nGlobal Chat first-time exp"
        }
      ]
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*📅 Coming Next*\n\n• HubSpot app card POC review\n• Embeddings table partitioning\n• Global Chat onboarding continues"
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "📊 *Stats:* 6 features | 3 improvements | 6 bugs fixed"
        },
        {
          "type": "mrkdwn",
          "text": "🚀 *21 PRs merged* • *Eduardo leading with 10*"
        }
      ]
    }
  ]
}
```

---

## Weekly Digest - Week 4 (January 20-24, 2026)

```json
{
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "AskElephant Weekly Digest",
        "emoji": true
      }
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "📰 Week 4: January 20-24, 2026"
        }
      ]
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*🏆 Week's Headline*\n\n>*Dialpad Integration Now Live* — Customers using Dialpad can now connect their telephony directly to AskElephant, bringing automatic call recording and AI insights to another major platform."
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*✨ New Features*\n\n*CRM Integrations*\n• Dialpad direct integration — full telephony support\n• HubSpot workflow testing — test CRM triggers before going live\n• HubSpot app card POC — new CRM surface (in review)\n\n*Recording & Capture*\n• Desktop MP4 audio — higher quality recordings\n• Web recording visual feedback — indicators when recording\n• Voiceprint candidate timestamps — speaker ID groundwork"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Workflows & Automation*\n• Variable extraction node — new data extraction capability\n• Workflow builder quick edit — rename workflows inline\n• Recipe creation flow improvements\n\n*Platform*\n• Admin onboarding — streamlined workspace setup\n• First login tracking — better analytics on new users\n• Project UI components — new organizational features"
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*🔧 Improvements*\n\n*Performance*\n• Page load time optimizations\n• Instrumented dataloaders for engagement queries\n• Scalable seeder infrastructure\n\n*Mobile & Desktop*\n• Mobile pipeline updates\n• Desktop build optimizations\n• Mobile version display updates\n\n*AI & Intelligence*\n• AI description improvements\n• Engagement card enhancements"
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*🐛 Bugs Fixed: 14*\n\n*Customer-Impacting*\n• Auto logout toggle restored\n• Mobile login issues resolved\n• HubSpot agent project recognition\n• Workflow assistant tool execution\n• Percentage discounts with decimals\n\n*Platform Stability*\n• Desktop recording stop/start reliability\n• Dialpad event deduplication\n• Resend webhook processing\n• Inactive user recording prevention\n• Onboarding flow fixes"
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*👥 Team Contributions*"
      }
    },
    {
      "type": "section",
      "fields": [
        {
          "type": "mrkdwn",
          "text": "*Eduardo*\nDialpad, desktop, mobile"
        },
        {
          "type": "mrkdwn",
          "text": "*Matt Noxon*\nPerformance, infrastructure"
        },
        {
          "type": "mrkdwn",
          "text": "*Palmer*\nHubSpot, workflow builder"
        },
        {
          "type": "mrkdwn",
          "text": "*Bryan*\nAI capabilities"
        },
        {
          "type": "mrkdwn",
          "text": "*Jason*\nBilling, notifications, analytics"
        },
        {
          "type": "mrkdwn",
          "text": "*Dylan*\nVoiceprint, embeddings"
        },
        {
          "type": "mrkdwn",
          "text": "*Kaden*\nCore platform features"
        },
        {
          "type": "mrkdwn",
          "text": "*Adam*\nOnboarding, engagement, UI"
        }
      ]
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "_Skylar: Global Chat first-time experience (in progress)_"
        }
      ]
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*📅 What's Coming Next*\n\n• *Global Chat onboarding* — First-time user experience launching\n• *HubSpot App Card* — New CRM integration surface\n• *Voiceprint Phase 2* — Speaker identification continues"
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "📊 *Week Stats:* 21 features | 6 improvements | 14 bugs fixed"
        }
      ]
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "_Week 4 of 2026 • For the AskElephant team_"
        }
      ]
    }
  ]
}
```

---

## Compact Daily Digest (Shorter Version)

A more condensed version if the full digest is too long:

```json
{
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "AskElephant Daily Digest",
        "emoji": true
      }
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "📰 Thursday, January 23, 2026"
        }
      ]
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": ">*Dialpad Goes Live + Desktop Stability* — Another major telephony platform now integrated, plus desktop recording improvements."
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*✨ Features*\n• Dialpad direct integration\n• Desktop MP4 audio recording\n• Web recording visual feedback\n• First login tracking\n\n*🔧 Improvements*\n• Engagement page restored\n• AI description improvements\n• Engagement query performance"
      },
      "accessory": {
        "type": "image",
        "image_url": "https://askelephant.com/favicon.ico",
        "alt_text": "AskElephant"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*🐛 6 Bugs Fixed*\nAuto logout, desktop recording, mobile push, webhooks, billing, build optimization"
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "🚀 *21 PRs merged* • *Eduardo (10)* • *Matt (6)* • *Jason (4)*"
        }
      ]
    }
  ]
}
```

---

## Usage Notes

### Block Kit Builder

Test and preview at: https://app.slack.com/block-kit-builder

### API Usage

```bash
curl -X POST https://slack.com/api/chat.postMessage \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "C0123456789",
    "blocks": [/* your blocks here */]
  }'
```

### Slack Formatting Reference

- `*bold*` → **bold**
- `_italic_` → _italic_
- `~strikethrough~` → ~~strikethrough~~
- `>quote` → blockquote
- `• item` → bullet point
- `\n` → line break

### Accessibility Tips (from Slack docs)

- Emojis at end of text, not as bullets or controls
- Keep content clear and concise
- Use context blocks for metadata
- Limit to essential information
- Test in both light and dark mode

### Block Limits

- Messages: 50 blocks max
- Modals/Home tabs: 100 blocks max
- Section fields: 10 max
- Context elements: 10 max
