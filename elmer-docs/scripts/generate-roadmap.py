#!/usr/bin/env python3
"""
Roadmap generator script.
Reads all _meta.json files and generates roadmap views.
"""

import json
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List

# Get the script directory and workspace root
SCRIPT_DIR = Path(__file__).parent
WORKSPACE_ROOT = SCRIPT_DIR.parent
INITIATIVES_DIR = WORKSPACE_ROOT / "initiatives"
ROADMAP_DIR = WORKSPACE_ROOT / "roadmap"


def load_all_meta() -> List[Dict]:
    """Load all _meta.json files from initiatives."""
    initiatives = []
    
    exclude = {"_template", "current"}
    
    for item in INITIATIVES_DIR.iterdir():
        if item.is_dir() and item.name not in exclude and not item.name.startswith("."):
            meta_path = item / "_meta.json"
            if meta_path.exists():
                try:
                    meta = json.loads(meta_path.read_text())
                    meta["_folder"] = item.name
                    initiatives.append(meta)
                except json.JSONDecodeError:
                    print(f"  Warning: Invalid JSON in {meta_path}")
    
    return initiatives


def generate_roadmap_json(initiatives: List[Dict]) -> Dict:
    """Generate the main roadmap.json structure."""
    # Count by phase
    by_phase = {
        "discovery": 0,
        "define": 0,
        "build": 0,
        "validate": 0,
        "launch": 0,
        "measure": 0,
        "learn": 0
    }
    
    # Count by status
    by_status = {
        "on_track": 0,
        "at_risk": 0,
        "blocked": 0,
        "stale": 0
    }
    
    # Process initiatives
    initiative_list = []
    for meta in initiatives:
        phase = meta.get("phase", "discovery")
        status = meta.get("status", "on_track")
        
        by_phase[phase] = by_phase.get(phase, 0) + 1
        by_status[status] = by_status.get(status, 0) + 1
        
        # Calculate days in phase
        days_in_phase = 0
        if meta.get("updated_at"):
            try:
                updated = datetime.fromisoformat(meta["updated_at"].replace("Z", "+00:00"))
                days_in_phase = (datetime.now(updated.tzinfo) - updated).days
            except:
                days_in_phase = meta.get("metrics", {}).get("days_in_phase", 0)
        
        initiative_list.append({
            "id": meta.get("initiative", meta["_folder"]),
            "name": meta.get("initiative", meta["_folder"]).replace("-", " ").title(),
            "hypothesis_id": meta.get("hypothesis_id"),
            "phase": phase,
            "sub_phase": meta.get("sub_phase"),
            "status": status,
            "priority": meta.get("priority", "P2"),
            "owner": meta.get("owner"),
            "personas": meta.get("personas", []),
            "pillar": meta.get("pillar"),
            "timeline": {
                "started": meta.get("timeline", {}).get("started"),
                "target_launch": meta.get("timeline", {}).get("target_launch"),
                "phase_entered": meta.get("phase_history", [{}])[-1].get("entered") if meta.get("phase_history") else None,
                "days_in_phase": days_in_phase
            },
            "progress": {
                phase: {"status": "in_progress"} for phase in ["discovery", "define", "build", "validate", "launch"]
            },
            "blockers": meta.get("blockers", []),
            "next_action": meta.get("next_action", ""),
            "metrics": meta.get("metrics", {})
        })
    
    # Sort by priority then phase
    phase_order = ["discovery", "define", "build", "validate", "launch", "measure", "learn"]
    priority_order = {"P0": 0, "P1": 1, "P2": 2, "P3": 3}
    
    initiative_list.sort(key=lambda x: (
        priority_order.get(x["priority"], 2),
        phase_order.index(x["phase"]) if x["phase"] in phase_order else 99
    ))
    
    return {
        "$schema": "elmer-roadmap-v1",
        "generated_at": datetime.now().isoformat(),
        "summary": {
            "total_initiatives": len(initiatives),
            "by_phase": by_phase,
            "health": by_status
        },
        "initiatives": initiative_list,
        "timeline_view": [],  # Could be enhanced later
        "dependencies_graph": {
            "nodes": [i["id"] for i in initiative_list],
            "edges": []
        }
    }


def generate_roadmap_md(roadmap: Dict) -> str:
    """Generate narrative markdown roadmap."""
    lines = [
        "# Product Roadmap",
        "",
        f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        f"**Total Initiatives:** {roadmap['summary']['total_initiatives']}",
        "",
        "---",
        "",
        "## Summary",
        "",
        "| Phase | Count |",
        "|-------|-------|",
    ]
    
    for phase, count in roadmap['summary']['by_phase'].items():
        lines.append(f"| {phase.title()} | {count} |")
    
    lines.extend([
        "",
        "---",
        "",
        "## Health",
        "",
        "| Status | Count |",
        "|--------|-------|",
    ])
    
    for status, count in roadmap['summary']['health'].items():
        emoji = {"on_track": "✅", "at_risk": "⚠️", "blocked": "🚫", "stale": "💤"}.get(status, "")
        lines.append(f"| {emoji} {status.replace('_', ' ').title()} | {count} |")
    
    lines.extend([
        "",
        "---",
        "",
        "## By Phase",
        ""
    ])
    
    # Group by phase
    phases = ["discovery", "define", "build", "validate", "launch", "measure", "learn"]
    for phase in phases:
        phase_initiatives = [i for i in roadmap['initiatives'] if i['phase'] == phase]
        lines.append(f"### {phase.title()}")
        lines.append("")
        
        if phase_initiatives:
            lines.append("| Initiative | Owner | Priority | Days | Status |")
            lines.append("|------------|-------|----------|------|--------|")
            for init in phase_initiatives:
                status_emoji = {"on_track": "✅", "at_risk": "⚠️", "blocked": "🚫", "stale": "💤"}.get(init['status'], "")
                lines.append(f"| {init['name']} | {init['owner'] or '-'} | {init['priority']} | {init['timeline']['days_in_phase']} | {status_emoji} |")
            lines.append("")
        else:
            lines.append("_No initiatives in this phase._")
            lines.append("")
    
    # Stale items
    stale = [i for i in roadmap['initiatives'] if i['status'] == 'stale' or i['timeline']['days_in_phase'] > 14]
    lines.extend([
        "---",
        "",
        "## Stale Items (>14 days in phase)",
        ""
    ])
    
    if stale:
        for init in stale:
            lines.append(f"- **{init['name']}**: {init['timeline']['days_in_phase']} days in {init['phase']}")
    else:
        lines.append("_No stale items._")
    
    lines.extend([
        "",
        "---",
        "",
        "## By Pillar",
        ""
    ])
    
    # Group by pillar
    pillars = ["customer-trust", "data-knowledge", "trend-visibility", None]
    pillar_names = {
        "customer-trust": "Customer Trust",
        "data-knowledge": "Data Knowledge",
        "trend-visibility": "Trend Visibility",
        None: "Unassigned"
    }
    
    for pillar in pillars:
        pillar_initiatives = [i for i in roadmap['initiatives'] if i['pillar'] == pillar]
        lines.append(f"### {pillar_names[pillar]}")
        lines.append("")
        
        if pillar_initiatives:
            for init in pillar_initiatives:
                lines.append(f"- **{init['name']}** ({init['phase']}) - {init['priority']}")
        else:
            lines.append("_No initiatives._")
        lines.append("")
    
    lines.extend([
        "---",
        "",
        "## By Persona",
        ""
    ])
    
    # Group by persona
    personas = ["sales-rep", "sales-leader", "csm", "revops"]
    persona_names = {
        "sales-rep": "Sales Rep",
        "sales-leader": "Sales Leader",
        "csm": "CSM",
        "revops": "RevOps"
    }
    
    for persona in personas:
        persona_initiatives = [i for i in roadmap['initiatives'] if persona in i.get('personas', [])]
        lines.append(f"### {persona_names[persona]}")
        lines.append("")
        
        if persona_initiatives:
            for init in persona_initiatives:
                lines.append(f"- **{init['name']}** ({init['phase']}) - {init['priority']}")
        else:
            lines.append("_No initiatives._")
        lines.append("")
    
    lines.extend([
        "---",
        "",
        "*This file is auto-generated. Run `/roadmap refresh` to update.*"
    ])
    
    return "\n".join(lines)


def generate_gantt_md(roadmap: Dict) -> str:
    """Generate Mermaid Gantt chart."""
    lines = [
        "# Roadmap Timeline (Gantt)",
        "",
        f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        "",
        "```mermaid",
        "gantt",
        "    title Product Roadmap 2026",
        "    dateFormat YYYY-MM-DD",
        ""
    ]
    
    # Group by pillar for sections
    pillars = {}
    for init in roadmap['initiatives']:
        pillar = init['pillar'] or "unassigned"
        if pillar not in pillars:
            pillars[pillar] = []
        pillars[pillar].append(init)
    
    pillar_names = {
        "customer-trust": "Customer Trust",
        "data-knowledge": "Data Knowledge",
        "trend-visibility": "Trend Visibility",
        "unassigned": "Other"
    }
    
    for pillar, inits in pillars.items():
        lines.append(f"    section {pillar_names.get(pillar, pillar.title())}")
        for init in inits:
            # Determine task status
            status = "active" if init['status'] == 'on_track' else "done" if init['phase'] in ['launch', 'measure', 'learn'] else ""
            status_str = f":{status}, " if status else ":"
            
            # Use started date or default to today
            start_date = init['timeline'].get('started', datetime.now().strftime('%Y-%m-%d'))
            if start_date:
                start_date = start_date[:10]
            else:
                start_date = datetime.now().strftime('%Y-%m-%d')
            
            # Estimate duration based on phase
            phase_durations = {
                "discovery": 14,
                "define": 7,
                "build": 21,
                "validate": 7,
                "launch": 3,
                "measure": 14,
                "learn": 7
            }
            duration = phase_durations.get(init['phase'], 14)
            
            # Sanitize name for Mermaid (remove special chars)
            safe_name = init['name'].replace("-", " ").replace("_", " ")
            safe_id = init['id'].replace("-", "_")
            
            lines.append(f"    {safe_name} {status_str}{safe_id}, {start_date}, {duration}d")
    
    lines.extend([
        "```",
        "",
        "---",
        "",
        "## Legend",
        "",
        "- **Active tasks** show current work in progress",
        "- **Done tasks** show completed/launched initiatives",
        "- **Duration** estimated based on phase",
        "",
        "---",
        "",
        "*This file is auto-generated. Run `/roadmap refresh` to update.*"
    ])
    
    return "\n".join(lines)


def generate_kanban_md(roadmap: Dict) -> str:
    """Generate Mermaid Kanban/block diagram."""
    lines = [
        "# Roadmap Kanban View",
        "",
        f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        "",
        "## Visual Board",
        ""
    ]
    
    # Create a table-based kanban (more reliable than mermaid block)
    phases = ["discovery", "define", "build", "validate", "launch"]
    
    lines.append("| Discovery | Define | Build | Validate | Launch |")
    lines.append("|-----------|--------|-------|----------|--------|")
    
    # Get max items per phase
    phase_items = {p: [i for i in roadmap['initiatives'] if i['phase'] == p] for p in phases}
    max_items = max(len(items) for items in phase_items.values()) if phase_items else 1
    max_items = max(max_items, 1)
    
    for row in range(max_items):
        cells = []
        for phase in phases:
            items = phase_items.get(phase, [])
            if row < len(items):
                init = items[row]
                status_emoji = {"on_track": "✅", "at_risk": "⚠️", "blocked": "🚫", "stale": "💤"}.get(init['status'], "")
                cells.append(f"{status_emoji} {init['name'][:20]}")
            else:
                cells.append("")
        lines.append("| " + " | ".join(cells) + " |")
    
    lines.extend([
        "",
        "---",
        "",
        "## Initiative Details",
        ""
    ])
    
    for phase in phases:
        items = phase_items.get(phase, [])
        if items:
            lines.append(f"### {phase.title()} ({len(items)})")
            lines.append("")
            for init in items:
                status_emoji = {"on_track": "✅", "at_risk": "⚠️", "blocked": "🚫", "stale": "💤"}.get(init['status'], "")
                lines.append(f"**{init['name']}** {status_emoji}")
                lines.append(f"- Priority: {init['priority']}")
                lines.append(f"- Owner: {init['owner'] or 'Unassigned'}")
                lines.append(f"- Days in phase: {init['timeline']['days_in_phase']}")
                if init['next_action']:
                    lines.append(f"- Next: {init['next_action']}")
                lines.append("")
    
    lines.extend([
        "---",
        "",
        "## Phase Definitions",
        "",
        "| Phase | Description | Exit Criteria |",
        "|-------|-------------|---------------|",
        "| **Discovery** | Understanding the problem | Research complete, user problems documented |",
        "| **Define** | Specifying the solution | PRD approved, design brief complete |",
        "| **Build** | Creating the prototype | Prototype covers all states, stories complete |",
        "| **Validate** | Testing with users | Jury pass rate ≥70%, stakeholder approval |",
        "| **Launch** | Releasing to users | Released, instrumentation active |",
        "",
        "---",
        "",
        "*This file is auto-generated. Run `/roadmap refresh` to update.*"
    ])
    
    return "\n".join(lines)


def save_snapshot(roadmap: Dict):
    """Save a snapshot of the roadmap."""
    snapshots_dir = ROADMAP_DIR / "snapshots"
    snapshots_dir.mkdir(parents=True, exist_ok=True)
    
    snapshot_path = snapshots_dir / f"{datetime.now().strftime('%Y-%m-%d')}.json"
    with open(snapshot_path, "w") as f:
        json.dump(roadmap, f, indent=2)
    
    return snapshot_path


def main():
    print("\n" + "=" * 60)
    print("ROADMAP GENERATOR")
    print("=" * 60)
    
    # Load all initiative metadata
    print("\nLoading initiative metadata...")
    initiatives = load_all_meta()
    print(f"  Found {len(initiatives)} initiatives with _meta.json")
    
    # Generate roadmap JSON
    print("\nGenerating roadmap.json...")
    roadmap = generate_roadmap_json(initiatives)
    
    roadmap_json_path = ROADMAP_DIR / "roadmap.json"
    with open(roadmap_json_path, "w") as f:
        json.dump(roadmap, f, indent=2)
    print(f"  → Saved {roadmap_json_path}")
    
    # Generate markdown views
    print("\nGenerating markdown views...")
    
    roadmap_md_path = ROADMAP_DIR / "roadmap.md"
    roadmap_md_path.write_text(generate_roadmap_md(roadmap))
    print(f"  → Saved {roadmap_md_path}")
    
    gantt_path = ROADMAP_DIR / "roadmap-gantt.md"
    gantt_path.write_text(generate_gantt_md(roadmap))
    print(f"  → Saved {gantt_path}")
    
    kanban_path = ROADMAP_DIR / "roadmap-kanban.md"
    kanban_path.write_text(generate_kanban_md(roadmap))
    print(f"  → Saved {kanban_path}")
    
    # Save snapshot
    print("\nSaving snapshot...")
    snapshot_path = save_snapshot(roadmap)
    print(f"  → Saved {snapshot_path}")
    
    # Summary
    print("\n" + "=" * 60)
    print("ROADMAP SUMMARY")
    print("=" * 60)
    print(f"\nTotal Initiatives: {roadmap['summary']['total_initiatives']}")
    print("\nBy Phase:")
    for phase, count in roadmap['summary']['by_phase'].items():
        if count > 0:
            print(f"  {phase.title()}: {count}")
    print("\nHealth:")
    for status, count in roadmap['summary']['health'].items():
        if count > 0:
            emoji = {"on_track": "✅", "at_risk": "⚠️", "blocked": "🚫", "stale": "💤"}.get(status, "")
            print(f"  {emoji} {status.replace('_', ' ').title()}: {count}")
    
    print("\n✅ Roadmap generation complete!")


if __name__ == "__main__":
    main()
