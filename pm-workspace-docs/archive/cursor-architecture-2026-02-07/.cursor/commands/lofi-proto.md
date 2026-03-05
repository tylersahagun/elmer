# Low-Fidelity Prototype Command

Build quick wireframe prototypes for early exploration.

## Usage

```
/lofi-proto [initiative-name]
```

## Behavior

**Delegates to**: `proto-builder` subagent with lofi flag

Simpler than `/proto` - focuses on layout and flow over polish.

## When to Use

| Use LoFi When     | Use Full Proto When       |
| ----------------- | ------------------------- |
| Early exploration | Ready for validation      |
| Testing layouts   | Need all states           |
| Quick concepts    | Need creative options     |
| No PRD yet        | Have PRD and design brief |

## What You Get

- Basic wireframe layouts
- Key interaction flows
- Placeholder content
- Minimal styling
- Interactive demo (live click-through)
- Walkthrough (step-by-step flow)

## What You Don't Get

- All state stories (Loading, Error, etc.)
- Multiple creative options
- Full flow stories
- Chromatic deployment

## Output

```
elephant-ai/web/src/components/prototypes/[Initiative]/
└── v1/
    ├── [ComponentName].tsx
    ├── [ComponentName].stories.tsx
    ├── Demo.tsx
    ├── Demo.stories.tsx
    ├── Walkthrough.tsx
    └── Walkthrough.stories.tsx
```

## Next Steps

After lofi exploration:

- Ready for full prototype: `/proto [name]`
- Need PRD first: `/pm [name]`
- Need research: `/research [name]`
