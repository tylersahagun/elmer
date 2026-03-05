# /morning Command

Generate your daily focus by pulling from all sources: Calendar, Google Tasks, Slack, Linear, and PM workspace initiatives.

## Usage

```
/morning              # Generate daily focus
/morning --refresh    # Regenerate (clear cache)
```

## Behavior

**Delegates to:** `daily-planner` skill

1. **Pull calendar** - Today's events from Google Calendar
2. **Pull personal tasks** - Google Tasks due today or overdue
3. **Check Slack** - Priority messages requiring response
4. **Extract initiative actions** - P0/P1 next_actions from roadmap.json
5. **Calculate focus blocks** - Available deep work time
6. **Generate today.md** - Prioritized daily view

## Output

**Saves to:** `pm-workspace-docs/status/today.md`

### Example Output

```markdown
# Today: Friday Jan 31

## Calendar (4 events)

- 10:00-11:00 - Design Review with Skylar
- 11:30-12:00 - Standup
- 14:00-15:00 - 1:1 with Brian
- 16:00-16:30 - Demo prep

## Priority Actions (P0/P1 only)

1. [30m] Review audit findings with Engineering (feature-availability-audit)
2. [45m] Advance flagship-meeting-recap to Validate
3. [20m] Respond to Rob re: Composio status clarification
4. [1h] Create Linear release criteria for rep-workspace

## Personal Tasks (Google Tasks)

- [ ] Schedule dentist appointment
- [ ] Review family calendar for next week
- [ ] Order birthday gift for Mom

## Slack Requiring Response

- 2 messages in #product-forum from Woody
- 1 DM from Brian

## Focus Blocks Available

- 09:00-10:00 (1h deep work)
- 12:00-14:00 (2h deep work)
- 15:00-16:00 (1h deep work)

---

_Generated: 2026-01-31 08:30 MT_
_Run `/morning` to regenerate_
```

## MCP Tools Used

- `GOOGLESUPER_LIST_EVENTS` - Calendar events
- `GOOGLESUPER_LIST_ALL_TASKS` - Personal tasks
- `LINEAR_SEARCH_ISSUES` - Tyler's assigned issues
- Slack monitor subagent - Priority messages

## Priority Logic

Items are prioritized in this order:

1. **Blockers** - Things blocking teammates (highest urgency)
2. **Calendar-bound** - Meetings and hard deadlines
3. **P0 initiative actions** - Critical path work
4. **Slack responses** - Communication debt
5. **P1 initiative actions** - Important but flexible
6. **Personal tasks** - Life admin

## Related Commands

- `/block [task] [duration]` - Create calendar focus block
- `/triage` - Batch process Slack/email
- `/team` - Check what teammates are working on
- `/eod --digest` - End of day summary

## Daily Ritual

```
8:30am  /morning     → Review priorities, identify top 3
9:00am  /triage      → Clear communication debt
2:00pm  /triage      → Afternoon batch
5:30pm  /eod --digest → Capture what shipped
```
