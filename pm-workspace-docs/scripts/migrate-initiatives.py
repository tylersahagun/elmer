#!/usr/bin/env python3
"""
Migration script to generate _meta.json for existing initiatives.
Infers phase from existing files and sets timestamps from file modification dates.
"""

import json
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

# Get the script directory and workspace root
SCRIPT_DIR = Path(__file__).parent
WORKSPACE_ROOT = SCRIPT_DIR.parent
INITIATIVES_DIR = WORKSPACE_ROOT / "initiatives"
HYPOTHESES_DIR = WORKSPACE_ROOT / "hypotheses"


def get_file_timestamps(folder: Path) -> tuple[Optional[datetime], Optional[datetime]]:
    """Get earliest and latest modification times for files in a folder."""
    earliest = None
    latest = None
    
    for file_path in folder.rglob("*"):
        if file_path.is_file() and not file_path.name.startswith("."):
            mtime = datetime.fromtimestamp(file_path.stat().st_mtime)
            if earliest is None or mtime < earliest:
                earliest = mtime
            if latest is None or mtime > latest:
                latest = mtime
    
    return earliest, latest


def infer_phase(folder: Path) -> str:
    """Infer the current phase based on which files exist."""
    has_research = (folder / "research.md").exists()
    has_prd = (folder / "prd.md").exists()
    has_design_brief = (folder / "design-brief.md").exists()
    has_prototype_notes = (folder / "prototype-notes.md").exists()
    has_jury_evals = (folder / "jury-evaluations").exists()
    has_engineering_spec = (folder / "engineering-spec.md").exists()
    has_gtm_brief = (folder / "gtm-brief.md").exists()
    
    # Infer phase from file presence (reverse order - most advanced first)
    if has_jury_evals:
        return "validate"
    elif has_prototype_notes:
        return "build"
    elif has_prd and has_design_brief:
        return "define"
    elif has_prd:
        return "define"
    elif has_research:
        return "discovery"
    else:
        return "discovery"


def infer_personas(folder: Path) -> List[str]:
    """Try to infer personas from PRD or research content."""
    personas = []
    persona_keywords = {
        "sales-rep": ["sales rep", "sales representative", "rep ", "reps "],
        "sales-leader": ["sales leader", "sales manager", "manager", "leadership"],
        "csm": ["csm", "customer success", "cs manager"],
        "revops": ["revops", "revenue operations", "operations", "admin"]
    }
    
    # Check PRD and research for persona mentions
    for filename in ["prd.md", "research.md"]:
        filepath = folder / filename
        if filepath.exists():
            content = filepath.read_text().lower()
            for persona, keywords in persona_keywords.items():
                if any(kw in content for kw in keywords):
                    if persona not in personas:
                        personas.append(persona)
    
    return personas if personas else ["sales-rep"]  # Default


def infer_pillar(folder: Path) -> Optional[str]:
    """Try to infer strategic pillar from content."""
    pillar_keywords = {
        "customer-trust": ["trust", "privacy", "security", "transparency", "reliability"],
        "data-knowledge": ["data", "analytics", "insights", "knowledge", "stats"],
        "trend-visibility": ["trend", "performance", "visibility", "tracking"]
    }
    
    for filename in ["prd.md", "research.md"]:
        filepath = folder / filename
        if filepath.exists():
            content = filepath.read_text().lower()
            for pillar, keywords in pillar_keywords.items():
                if any(kw in content for kw in keywords):
                    return pillar
    
    return None


def infer_priority(folder: Path) -> str:
    """Try to infer priority from content."""
    for filename in ["prd.md", "research.md"]:
        filepath = folder / filename
        if filepath.exists():
            content = filepath.read_text().lower()
            if "p0" in content or "critical" in content or "urgent" in content:
                return "P0"
            elif "p1" in content or "high priority" in content:
                return "P1"
            elif "p2" in content or "medium priority" in content:
                return "P2"
    return "P2"  # Default


def generate_meta_json(initiative_name: str, folder: Path) -> Dict:
    """Generate _meta.json for an initiative."""
    earliest, latest = get_file_timestamps(folder)
    phase = infer_phase(folder)
    personas = infer_personas(folder)
    pillar = infer_pillar(folder)
    priority = infer_priority(folder)
    
    now = datetime.now().isoformat()
    created_at = earliest.isoformat() if earliest else now
    updated_at = latest.isoformat() if latest else now
    
    # Calculate days in phase (rough estimate)
    days_in_phase = 0
    if latest:
        days_in_phase = (datetime.now() - latest).days
    
    # Determine status based on staleness
    status = "on_track"
    if days_in_phase > 14:
        status = "stale"
    elif days_in_phase > 7:
        status = "at_risk"
    
    meta = {
        "$schema": "pm-workspace-meta-v1",
        "initiative": initiative_name,
        "hypothesis_id": f"hyp-{initiative_name}",
        "phase": phase,
        "sub_phase": None,
        "status": status,
        "priority": priority,
        "owner": "tyler",
        "personas": personas,
        "pillar": pillar,
        "created_at": created_at,
        "updated_at": updated_at,
        "phase_history": [
            {
                "phase": phase,
                "entered": created_at,
                "exited": None
            }
        ],
        "blockers": [],
        "next_action": f"Review {phase} phase status",
        "graduation_criteria": {},
        "timeline": {
            "started": created_at[:10],
            "target_launch": None
        },
        "metrics": {
            "days_in_phase": days_in_phase,
            "total_iterations": 0
        }
    }
    
    return meta


def create_placeholder_hypothesis(initiative_name: str, folder: Path) -> Dict:
    """Create a placeholder hypothesis for an existing initiative."""
    # Try to extract problem statement from research or PRD
    problem_statement = f"Problem identified in {initiative_name} initiative"
    evidence = []
    
    research_path = folder / "research.md"
    if research_path.exists():
        content = research_path.read_text()
        # Look for problem-related sections
        lines = content.split("\n")
        for i, line in enumerate(lines):
            if "problem" in line.lower() or "pain" in line.lower():
                # Get next few lines as context
                context = "\n".join(lines[i:i+5])
                if len(context) > 50:
                    problem_statement = context[:500]
                    break
    
    prd_path = folder / "prd.md"
    if prd_path.exists():
        content = prd_path.read_text()
        lines = content.split("\n")
        for i, line in enumerate(lines):
            if "## problem" in line.lower():
                context = "\n".join(lines[i+1:i+6])
                if len(context) > 50:
                    problem_statement = context[:500]
                    break
    
    hypothesis = {
        "id": f"hyp-{initiative_name}",
        "name": initiative_name.replace("-", " ").title(),
        "status": "committed",
        "initiative_id": initiative_name,
        "problem_statement": problem_statement,
        "personas": infer_personas(folder),
        "evidence_count": 1,  # Placeholder
        "severity": "medium",
        "frequency": "common",
        "created_at": datetime.now().isoformat(),
        "validated_at": datetime.now().isoformat()
    }
    
    return hypothesis


def write_hypothesis_file(hypothesis: Dict, folder: Path):
    """Write a hypothesis markdown file."""
    content = f"""# Hypothesis: {hypothesis['name']}

## Status
- **Current:** committed
- **Created:** {hypothesis['created_at'][:10]}
- **Last Updated:** {hypothesis['validated_at'][:10]}
- **Linked Initiative:** {hypothesis['initiative_id']}

---

## Problem Statement

{hypothesis['problem_statement']}

---

## Evidence

_Migrated from existing initiative. Evidence to be documented._

---

## Assessment

| Dimension | Rating | Notes |
|-----------|--------|-------|
| **Severity** | {hypothesis['severity'].title()} | Inferred from existing work |
| **Frequency** | {hypothesis['frequency'].title()} | Inferred from existing work |
| **Personas Affected** | {', '.join(hypothesis['personas'])} | Inferred from PRD/research |
| **Evidence Strength** | Moderate | Existing initiative in progress |

---

## Outcome Chain

_To be documented._

---

## History

| Date | Action | Notes |
|------|--------|-------|
| {hypothesis['created_at'][:10]} | Migrated | Created from existing initiative |

"""
    
    filepath = folder / f"{hypothesis['initiative_id']}.md"
    filepath.write_text(content)
    return filepath


def main():
    print("\n" + "=" * 60)
    print("PM WORKSPACE MIGRATION")
    print("=" * 60)
    
    # Find all initiatives (excluding _template and special folders)
    exclude = {"_template", "current"}
    initiatives = []
    
    for item in INITIATIVES_DIR.iterdir():
        if item.is_dir() and item.name not in exclude and not item.name.startswith("."):
            initiatives.append(item)
    
    print(f"\nFound {len(initiatives)} initiatives to migrate:\n")
    
    # Track results
    migrated = []
    skipped = []
    hypotheses_created = []
    hypotheses_index = []
    
    for folder in sorted(initiatives):
        initiative_name = folder.name
        meta_path = folder / "_meta.json"
        
        print(f"Processing: {initiative_name}")
        
        # Check if _meta.json already exists
        if meta_path.exists():
            print(f"  → Skipped (already has _meta.json)")
            skipped.append(initiative_name)
            # Still read existing meta for hypothesis index
            try:
                existing_meta = json.loads(meta_path.read_text())
                if existing_meta.get("hypothesis_id"):
                    hypotheses_index.append({
                        "id": existing_meta["hypothesis_id"],
                        "name": initiative_name.replace("-", " ").title(),
                        "status": "committed",
                        "initiative_id": initiative_name,
                        "evidence_count": 1,
                        "severity": "medium",
                        "frequency": "common"
                    })
            except:
                pass
            continue
        
        # Generate _meta.json
        meta = generate_meta_json(initiative_name, folder)
        
        # Write _meta.json
        with open(meta_path, "w") as f:
            json.dump(meta, f, indent=2)
        
        print(f"  → Created _meta.json (phase: {meta['phase']}, status: {meta['status']})")
        migrated.append(initiative_name)
        
        # Create placeholder hypothesis
        hypothesis = create_placeholder_hypothesis(initiative_name, folder)
        hypotheses_index.append(hypothesis)
        
        # Write hypothesis file
        hyp_folder = HYPOTHESES_DIR / "committed"
        hyp_folder.mkdir(parents=True, exist_ok=True)
        hyp_path = write_hypothesis_file(hypothesis, hyp_folder)
        print(f"  → Created hypothesis: {hyp_path.name}")
        hypotheses_created.append(hypothesis['id'])
    
    # Update hypotheses index
    index_path = HYPOTHESES_DIR / "_index.json"
    index_data = {
        "$schema": "pm-workspace-hypotheses-index-v1",
        "last_updated": datetime.now().isoformat(),
        "total": len(hypotheses_index),
        "by_status": {
            "active": 0,
            "validated": 0,
            "committed": len(hypotheses_index),
            "retired": 0
        },
        "hypotheses": hypotheses_index
    }
    
    with open(index_path, "w") as f:
        json.dump(index_data, f, indent=2)
    
    print(f"\n  → Updated hypotheses/_index.json with {len(hypotheses_index)} entries")
    
    # Summary
    print("\n" + "=" * 60)
    print("MIGRATION SUMMARY")
    print("=" * 60)
    print(f"\n✅ Migrated: {len(migrated)}")
    for name in migrated:
        print(f"   - {name}")
    
    if skipped:
        print(f"\n⏭️  Skipped (already had _meta.json): {len(skipped)}")
        for name in skipped:
            print(f"   - {name}")
    
    print(f"\n📋 Hypotheses created: {len(hypotheses_created)}")
    
    print("\n✅ Migration complete!")
    print("\nNext steps:")
    print("  1. Run `python generate-roadmap.py` to create roadmap")
    print("  2. Review generated _meta.json files")
    print("  3. Update hypothesis files with proper problem statements")
    print("  4. Run `/maintain audit` to verify integrity")


if __name__ == "__main__":
    main()
