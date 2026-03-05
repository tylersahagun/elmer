# Prototype Notes: Structured HubSpot Agent Node

> **Version**: v1
> **Visual Direction**: B ("Live Preview Configuration") with source-quote provenance from Direction C
> **Date**: 2026-02-12
> **Status**: Ready for validation

## Summary

First Storybook prototype implementing the structured HubSpot agent configuration UI. Replaces prompt-based CRM configuration with a property-first visual interface that RevOps can configure in under 5 minutes.

## Component Structure

```
prototypes/HubSpotAgentConfig/
  index.ts
  v1/
    types.ts                         # Domain types, AI states, creative directions
    mock-data.ts                     # Realistic HubSpot data, templates, extractions
    TemplateSelector.tsx             # 6-template gallery entry point
    TemplateSelector.stories.tsx
    PropertyConfigPanel.tsx          # Main 2-column config with live preview
    PropertyConfigPanel.stories.tsx
    SyncPreviewDiff.tsx              # Before/after diff table (unique differentiator)
    SyncPreviewDiff.stories.tsx
    ComponentJourney.tsx             # 5 journey scenarios
    ComponentJourney.stories.tsx
    Demo.tsx                         # Full sidebar clickthrough
    Demo.stories.tsx
    Walkthrough.tsx                  # Narrated step-by-step flow
    Walkthrough.stories.tsx
    components/
      PropertyConfigCard.tsx         # Expandable property configuration card
      ExtractionPreview.tsx          # Inline AI extraction with source quote
      ConfidenceBadge.tsx            # Emerald/amber/rose confidence indicator
      LivePreviewPanel.tsx           # Simulated HubSpot record sidebar
      FieldDiffRow.tsx               # Before/after row in diff table
      TrustBar.tsx                   # Bottom status bar
      SourceQuote.tsx                # Transcript excerpt
      ReviewBadge.tsx                # Amber needs-review indicator
      DependencyIndicator.tsx        # Field dependency chip
      index.ts
```

## Creative Options (3 Interaction Patterns)

All share Direction B's visual language. Vary on user control vs. AI autonomy.

| Option | Name         | Key Difference                                                         |
| ------ | ------------ | ---------------------------------------------------------------------- |
| A      | Full Control | All review-first, manual approval per field                            |
| B      | Balanced     | High-confidence auto-syncs, low-confidence queued for review (default) |
| C      | Efficient    | AI-optimized, auto-sync above 70% confidence                           |

## AI States Implemented

- Loading (short): Spinner while fetching HubSpot properties
- Loading (long): Progress bar during transcript analysis
- Success: Confirmation with undo option (30-day window)
- Error: HubSpot disconnection with retry action
- Low Confidence: Amber badges, dotted borders, review required
- Empty: Encouraging CTA to start with templates

## Journey Flows

1. **Discovery**: User finds "Agent Configuration" in workflow builder
2. **Activation**: New partner selects template, reviews pre-filled properties, first test
3. **Day-2**: Returning admin edits config, views sync history
4. **Happy Path**: Full template -> config -> test -> diff -> approve flow
5. **Error Recovery**: HubSpot disconnection, low-confidence review

## Design Vocabulary (from visual-directions.md)

| Term                 | Component                            |
| -------------------- | ------------------------------------ |
| Property Card        | `PropertyConfigCard`                 |
| Extraction Preview   | `ExtractionPreview`                  |
| Confidence Badge     | `ConfidenceBadge`                    |
| Live Preview Panel   | `LivePreviewPanel`                   |
| Field Diff Row       | `FieldDiffRow`                       |
| Trust Bar            | `TrustBar`                           |
| Template Card        | `TemplateCard` (in TemplateSelector) |
| Source Quote         | `SourceQuote`                        |
| Review Badge         | `ReviewBadge`                        |
| Dependency Indicator | `DependencyIndicator`                |

## Competitive Differentiators Implemented

1. **Property-first configuration** -- No prompt engineering required (vs. Momentum's 200-prompt library)
2. **Live preview panel** -- See HubSpot record update in real-time during configuration (no competitor has this)
3. **Before/after diff** -- Code-review inspired sync preview with confidence and source quotes (no competitor has this)
4. **Template library** -- 5-minute onboarding matching Fathom's simplicity with full customization depth
5. **Confidence thresholds** -- Per-field confidence controlling auto-sync vs. review (no competitor has this)
6. **Source-quote provenance** -- Shows WHERE in the transcript each value was extracted (borrowed from Direction C)

## Storybook Paths

```
Prototypes/HubSpotAgentConfig/v1/TemplateSelector
Prototypes/HubSpotAgentConfig/v1/PropertyConfigPanel
Prototypes/HubSpotAgentConfig/v1/SyncPreviewDiff
Prototypes/HubSpotAgentConfig/v1/Journeys
Prototypes/HubSpotAgentConfig/v1/Demo
Prototypes/HubSpotAgentConfig/v1/Walkthrough
```

## Next Steps

- [ ] Run `/validate structured-hubspot-agent-node` for jury evaluation
- [ ] Share Storybook with Skylar for design review
- [ ] Share with James Hinkson for partner validation
- [ ] Address jury feedback and iterate to v2 if needed
