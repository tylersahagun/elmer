# Design System Command

View and reference the interface design system.

## Usage

```
/design-system
```

## Behavior

This is a read-only command that loads and displays the design system.

## Process

1. **Load system** - Read `.interface-design/system.md`
2. **Display summary** - Show key tokens and patterns
3. **Reference links** - Point to full documentation

## Design System Location

`.interface-design/system.md`

## What's Included

- **Spacing scale** - Consistent padding/margin values
- **Color tokens** - Surface, text, accent colors
- **Typography** - Font sizes, weights, line heights
- **Depth strategy** - Shadows, borders, elevation
- **Component patterns** - Common UI patterns

## Integration

The design system is automatically used by:
- `/proto` - Builds with consistent tokens
- `/context-proto` - Uses app-level patterns
- `/figma-sync` - Maps Figma tokens

## Updating the System

Use `/admin` to modify design system:
```
/admin update design system spacing
```

Or edit directly: `.interface-design/system.md`
