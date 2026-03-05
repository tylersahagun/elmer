# Remotion Workflow Integration

This document defines how Remotion fits into the PM workflow today and how it should evolve.

## Current (manual) flow

1.  **Prototype or release complete**
2.  **Run `/pmm-video [initiative]`** (interactive intake)
    - Captures what to include, what to avoid, and build/manage preferences
3.  **Create/refresh PMM video brief**
    - `pm-workspace-docs/initiatives/[name]/pmm-video-brief.md`
4.  **Generate Remotion composition**
    - Outputs a preview and render command
5.  **Review with PMM (Kenzi) and Marketing (Tony)**
6.  **Publish or share**

## Proposed future automation

- **Post‑merge triggers**: Auto‑generate draft clips based on release notes or GitHub merges.
- **Prototype triggers**: After `/proto`, prepare a draft video brief but keep rendering manual.
- **AskElephant ingestion**: Save final output references in AskElephant for retrieval and storytelling.

## Inputs and outputs

**Inputs**

- PRD + prototype notes
- Release notes (if public‑facing)
- Persona + outcome chain

**Outputs**

- Draft Remotion composition (code)
- Preview render for stakeholder review
- Logged entry in `pm-workspace-docs/status/videos/README.md`

## Stakeholder routing

- **PMM / Marketing**: Kenzi, Tony (review messaging)
- **Design**: Adam, Skylar (visual system alignment)
- **Engineering**: Bryan (technical feasibility on data/asset generation)
