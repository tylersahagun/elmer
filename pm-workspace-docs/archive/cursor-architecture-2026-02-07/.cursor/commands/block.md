# /block Command

Create a calendar focus block for deep work on a specific task.

## Usage

```
/block [task] [duration]
/block "Advance flagship-meeting-recap" 2h
/block "Write PRD for call-import-engine" 1h30m
```

## Behavior

**Delegates to:** `daily-planner` skill

1. **Parse inputs** - Task description and duration
2. **Find next available slot** - Check calendar for gaps
3. **Create focus event** - Google Calendar event with "Focus:" prefix
4. **Confirm to user** - Show created event details

## Parameters

| Parameter | Format        | Examples                     |
| --------- | ------------- | ---------------------------- |
| task      | Quoted string | "Write PRD", "Review design" |
| duration  | Number + unit | 2h, 1h30m, 45m, 90m          |

## Output

### Example

```
/block "Advance flagship-meeting-recap" 2h
```

```markdown
✅ Focus block created

**Event:** Focus: Advance flagship-meeting-recap
**When:** Today 11:00 - 13:00 (2h)
**Calendar:** Primary

Next available slot was 11:00-13:00 (between Standup and 1:1 with Brian).

[View in Calendar](https://calendar.google.com/...)
```

## Calendar Event Format

The created event will have:

- **Title:** `Focus: {task}`
- **Description:** `Protected deep work time for: {task}`
- **Event Type:** focusTime (shows as purple in Google Calendar)
- **Visibility:** Default (shows as busy to others)

## MCP Tools Used

- `GOOGLESUPER_LIST_EVENTS` - Find available slots
- `GOOGLESUPER_CREATE_EVENT` - Create the focus block

## Related Commands

- `/morning` - See available focus blocks for today
- `/protect [hours]` - Auto-block focus time for the week

## Tips

- Use specific task names for accountability
- Block 2-3 hours for deep work, 30-60 min for quick tasks
- Put task in quotes if it contains spaces
- Review created blocks at end of week for patterns
