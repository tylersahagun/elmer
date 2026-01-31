---
name: slack-block-kit
description: Format Slack messages using Block Kit for rich, interactive layouts. Apply when sending any Slack message that should look polished.
---

# Slack Block Kit Formatting Skill

This skill teaches agents to format Slack messages using Block Kit—a JSON-based UI framework for building rich, interactive messages.

## When to Apply This Skill

Apply when:

- Sending Slack messages via MCP tools
- Creating notifications, alerts, or status updates
- Building interactive messages with buttons or menus
- Formatting EOD/EOW reports for Slack
- Any message that should look professional

## MCP Tools

**Server:** `user-mcp-config-2mgoji` (Composio)
**Tool:** `SLACK_SEND_MESSAGE`

```json
{
  "channel": "C12345678",
  "text": "Fallback text for notifications",
  "blocks": [ ... ]
}
```

**Important:** Always include top-level `text` as notification fallback.

---

## Architecture

```
Message Payload
└── blocks[] (layout containers, max 50)
    └── Block elements (interactive components)
        └── Composition objects (text, options)
```

---

## Block Types Quick Reference

| Type        | Use For              | Key Rules                                   |
| ----------- | -------------------- | ------------------------------------------- |
| `header`    | Titles               | 150 chars max, `plain_text` only            |
| `section`   | Main content         | 3000 chars, can have accessory              |
| `divider`   | Visual separation    | No content                                  |
| `image`     | Standalone images    | HTTPS URL required, `alt_text` required     |
| `context`   | Metadata, timestamps | Max 10 elements, renders small/muted        |
| `actions`   | Button rows, menus   | Max 25 elements                             |
| `table`     | Tabular data         | **1 per message**, max 100 rows, 20 columns |
| `rich_text` | Formatted text       | Lists, quotes, code blocks, styled text     |

---

## Table Block

**Constraints:**

- **Only 1 table per message** (error: `only_one_table_allowed`)
- Table renders at BOTTOM of message (appended)
- Max 100 rows, 20 columns
- Cells can be `raw_text` or `rich_text`

### Basic Table

```json
{
  "type": "table",
  "column_settings": [
    { "align": "left" },
    { "align": "center" },
    { "align": "right" }
  ],
  "rows": [
    [
      { "type": "raw_text", "text": "Name" },
      { "type": "raw_text", "text": "Count" },
      { "type": "raw_text", "text": "Value" }
    ],
    [
      { "type": "raw_text", "text": "Item A" },
      { "type": "raw_text", "text": "5" },
      { "type": "raw_text", "text": "$100" }
    ]
  ]
}
```

### Column Settings

| Property     | Type    | Description                                |
| ------------ | ------- | ------------------------------------------ |
| `align`      | string  | `left`, `center`, or `right`               |
| `is_wrapped` | boolean | Whether to wrap long text (default: false) |

---

## Rich Text Block

Rich text provides more flexibility than mrkdwn. Use for complex formatting needs.

### Rich Text Section (Basic)

```json
{
  "type": "rich_text",
  "elements": [
    {
      "type": "rich_text_section",
      "elements": [
        { "type": "text", "text": "Hello " },
        { "type": "text", "text": "bold text", "style": { "bold": true } },
        { "type": "text", "text": " and " },
        { "type": "text", "text": "italic", "style": { "italic": true } }
      ]
    }
  ]
}
```

### Rich Text List (Bullet/Numbered)

```json
{
  "type": "rich_text",
  "elements": [
    {
      "type": "rich_text_section",
      "elements": [{ "type": "text", "text": "Features shipped:" }]
    },
    {
      "type": "rich_text_list",
      "style": "bullet",
      "elements": [
        {
          "type": "rich_text_section",
          "elements": [{ "type": "text", "text": "HubSpot integration" }]
        },
        {
          "type": "rich_text_section",
          "elements": [{ "type": "text", "text": "Mobile improvements" }]
        }
      ]
    }
  ]
}
```

### Text Style Object

```json
{
  "style": {
    "bold": true,
    "italic": true,
    "strike": true,
    "code": true
  }
}
```

---

## Block JSON Structures

### Header Block

```json
{
  "type": "header",
  "text": {
    "type": "plain_text",
    "text": ":rocket: Header Text Here",
    "emoji": true
  }
}
```

### Section Block

```json
{
  "type": "section",
  "text": {
    "type": "mrkdwn",
    "text": "*Bold* and _italic_ text with <https://example.com|links>"
  }
}
```

### Section with Accessory (Button)

```json
{
  "type": "section",
  "text": {
    "type": "mrkdwn",
    "text": "Your meeting has been processed."
  },
  "accessory": {
    "type": "button",
    "text": { "type": "plain_text", "text": "View", "emoji": true },
    "url": "https://app.example.com/meetings/123",
    "action_id": "view_meeting"
  }
}
```

### Section with Fields (Two-Column Layout)

```json
{
  "type": "section",
  "fields": [
    { "type": "mrkdwn", "text": "*Status:*\nComplete" },
    { "type": "mrkdwn", "text": "*Duration:*\n45 min" },
    { "type": "mrkdwn", "text": "*Attendees:*\n4 people" },
    { "type": "mrkdwn", "text": "*Priority:*\nHigh" }
  ]
}
```

**Rules:** Max 10 fields, each max 2000 chars.

### Divider Block

```json
{
  "type": "divider"
}
```

### Image Block

```json
{
  "type": "image",
  "image_url": "https://example.com/chart.png",
  "alt_text": "Q4 revenue chart"
}
```

### Context Block

```json
{
  "type": "context",
  "elements": [
    {
      "type": "mrkdwn",
      "text": ":clock1: Posted at <!date^1234567890^{time}|12:00 PM>"
    }
  ]
}
```

### Actions Block

```json
{
  "type": "actions",
  "block_id": "actions_1",
  "elements": [
    {
      "type": "button",
      "text": { "type": "plain_text", "text": "Approve", "emoji": true },
      "style": "primary",
      "action_id": "approve_btn",
      "value": "approved"
    },
    {
      "type": "button",
      "text": { "type": "plain_text", "text": "Reject", "emoji": true },
      "style": "danger",
      "action_id": "reject_btn",
      "value": "rejected"
    }
  ]
}
```

**Button styles:** `primary` (green), `danger` (red), or omit for default gray.

---

## mrkdwn Syntax (NOT Standard Markdown!)

### Text Formatting

| Format        | Syntax         | Example            |
| ------------- | -------------- | ------------------ |
| Bold          | `*text*`       | `*important*`      |
| Italic        | `_text_`       | `_emphasis_`       |
| Strikethrough | `~text~`       | `~deleted~`        |
| Code          | `` `code` ``   | `` `function()` `` |
| Code block    | ` ```code``` ` | Multi-line         |
| Quote         | `>text`        | Indented           |

### Links and Mentions

| Type          | Syntax                              |
| ------------- | ----------------------------------- |
| URL           | `<https://example.com>`             |
| URL with text | `<https://example.com\|Click here>` |
| User mention  | `<@U12345678>`                      |
| Channel link  | `<#C12345678>`                      |
| @here         | `<!here>`                           |
| @channel      | `<!channel>`                        |

### Escape Characters

| Character | Escape As |
| --------- | --------- |
| `&`       | `&amp;`   |
| `<`       | `&lt;`    |
| `>`       | `&gt;`    |

### NOT Supported (Common Mistakes)

| Wrong         | Correct          |
| ------------- | ---------------- |
| `**bold**`    | `*bold*`         |
| `*italic*`    | `_italic_`       |
| `[text](url)` | `<url\|text>`    |
| `# Header`    | Use header block |

---

## Block Selection Quick Guide

| Content Type       | Best Block                      |
| ------------------ | ------------------------------- |
| Title/Headline     | `header`                        |
| Main text          | `section`                       |
| Key-value pairs    | `section` with `fields`         |
| Text + button      | `section` with `accessory`      |
| Standalone image   | `image`                         |
| Row of buttons     | `actions`                       |
| Metadata/footer    | `context`                       |
| Visual break       | `divider`                       |
| Tabular data       | `table` (1 per message, at end) |
| Complex formatting | `rich_text`                     |

---

## Validation Checklist

Before sending:

- [ ] Valid JSON syntax
- [ ] Fallback `text` field at root level
- [ ] All `action_id` values unique
- [ ] Character limits respected (header: 150, section: 3000)
- [ ] Image URLs are HTTPS
- [ ] mrkdwn syntax correct (not standard Markdown)
- [ ] Max 50 blocks for messages
- [ ] Only 1 table block (if using tables)
- [ ] Table block is LAST in blocks array

---

## Common Emoji Reference

| Type     | Emojis                                                |
| -------- | ----------------------------------------------------- |
| Success  | `:white_check_mark:` `:tada:` `:rocket:`              |
| Alert    | `:warning:` `:rotating_light:` `:exclamation:`        |
| Info     | `:information_source:` `:memo:` `:newspaper:`         |
| Revenue  | `:moneybag:` `:chart_with_upwards_trend:` `:trophy:`  |
| Meetings | `:movie_camera:` `:calendar:` `:busts_in_silhouette:` |
| Dev      | `:hammer_and_wrench:` `:gear:` `:package:` `:bug:`    |
| Time     | `:clock1:` `:hourglass:` `:stopwatch:`                |
| Category | `:sparkles:` `:wrench:` `:loud_sound:` `:bulb:`       |

---

## Date Formatting

Use `<!date^TIMESTAMP^FORMAT|FALLBACK>` in mrkdwn.

| Token           | Output                           |
| --------------- | -------------------------------- |
| `{date_num}`    | 2026-01-28                       |
| `{date_short}`  | Jan 28, 2026                     |
| `{date_long}`   | Monday, January 28th, 2026       |
| `{date_pretty}` | today/yesterday/tomorrow or date |
| `{time}`        | 2:34 PM                          |
| `{ago}`         | 3 minutes ago                    |

Example:

```
<!date^1234567890^{date_short} at {time}|Jan 28, 2026 at 2:34 PM>
```

---

## Testing

Recommend testing in [Block Kit Builder](https://app.slack.com/block-kit-builder) before sending.
