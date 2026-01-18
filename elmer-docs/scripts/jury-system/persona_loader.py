#!/usr/bin/env python3
"""
Persona Loader - Finds and loads personas for jury evaluation.

Priority:
1. Generated personas (latest batch in personas/generated/)
2. Seed personas (committed to repo in personas/seeds/)
3. Expansion from seeds if needed

Usage:
    from persona_loader import load_personas_for_jury
    personas = load_personas_for_jury(jury_size=100)
"""

import json
import random
from pathlib import Path
from typing import List, Dict, Optional
from copy import deepcopy


def get_personas_root() -> Path:
    """Get the root personas directory."""
    script_dir = Path(__file__).parent
    return script_dir.parent.parent / "personas"


def find_latest_generated_personas_file() -> Optional[Path]:
    """
    Find the most recent generated personas file.
    Looks for personas.json or all-personas.json in batch directories.
    Returns None if no generated personas exist.
    """
    generated_dir = get_personas_root() / "generated"
    
    if not generated_dir.exists():
        return None
    
    # Find all batch directories, sorted by name (which includes date)
    batch_dirs = sorted(
        [d for d in generated_dir.iterdir() if d.is_dir() and d.name.startswith("batch-")],
        reverse=True  # Most recent first
    )
    
    for batch_dir in batch_dirs:
        # Check for all-personas.json first (expanded), then personas.json
        for filename in ["all-personas.json", "personas.json"]:
            personas_file = batch_dir / filename
            if personas_file.exists():
                return personas_file
    
    return None


def load_seed_personas() -> List[Dict]:
    """
    Load seed personas from personas/seeds/*.json
    These are the small, committed set for running locally.
    """
    seeds_dir = get_personas_root() / "seeds"
    
    if not seeds_dir.exists():
        return []
    
    all_personas = []
    for json_file in seeds_dir.glob("*-personas.json"):
        try:
            with open(json_file) as f:
                personas = json.load(f)
                all_personas.extend(personas)
        except (json.JSONDecodeError, IOError) as e:
            print(f"Warning: Could not load {json_file}: {e}")
    
    return all_personas


def load_archetypes() -> Dict[str, Dict]:
    """Load archetype definitions for expansion."""
    archetypes_dir = get_personas_root() / "archetypes"
    
    archetypes = {}
    if archetypes_dir.exists():
        for json_file in archetypes_dir.glob("*.json"):
            try:
                with open(json_file) as f:
                    archetype = json.load(f)
                    archetypes[archetype["archetype_id"]] = archetype
            except (json.JSONDecodeError, IOError, KeyError) as e:
                print(f"Warning: Could not load archetype {json_file}: {e}")
    
    return archetypes


def expand_persona(seed: Dict, index: int, archetypes: Dict) -> Dict:
    """
    Create a light variation of a seed persona.
    Used when we need more personas than seeds provide.
    """
    persona = deepcopy(seed)
    
    # New ID to prevent duplicates
    persona["id"] = f"expanded_{seed['id']}_{index}"
    
    # Light variation on psychographics (±15%)
    psych = persona.get("psychographics", {})
    for key in ["trust_in_ai", "tool_fatigue", "patience_for_learning", "complexity_tolerance", "migration_sensitivity"]:
        if key in psych and isinstance(psych[key], (int, float)):
            variance = random.uniform(-0.15, 0.15)
            psych[key] = max(0.0, min(1.0, psych[key] + variance))
            psych[key] = round(psych[key], 2)
    
    # Occasionally flip adoption stage toward adjacent stage (10% chance)
    if random.random() < 0.1:
        stages = ["skeptic", "curious", "early-adopter", "power-user"]
        current = psych.get("ai_adoption_stage", "curious")
        if current in stages:
            idx = stages.index(current)
            # Move one step in either direction
            if idx == 0:
                psych["ai_adoption_stage"] = stages[1]
            elif idx == len(stages) - 1:
                psych["ai_adoption_stage"] = stages[-2]
            else:
                psych["ai_adoption_stage"] = stages[idx + random.choice([-1, 1])]
    
    return persona


def load_personas_for_jury(jury_size: int = 100, skeptic_minimum: float = 0.15) -> List[Dict]:
    """
    Load personas for jury evaluation, using best available source.
    
    Priority:
    1. Generated personas (if available and sufficient)
    2. Seed personas (with expansion if needed)
    
    Args:
        jury_size: Target number of personas
        skeptic_minimum: Minimum percentage of skeptics (default 15%)
    
    Returns:
        List of persona dicts ready for jury evaluation
    
    Raises:
        FileNotFoundError: If no personas are available (seeds or generated)
    """
    # Try generated personas first
    generated_file = find_latest_generated_personas_file()
    
    if generated_file:
        print(f"📦 Loading generated personas from: {generated_file.parent.name}/{generated_file.name}")
        with open(generated_file) as f:
            personas = json.load(f)
        
        if len(personas) >= jury_size:
            return sample_stratified(personas, jury_size, skeptic_minimum)
        else:
            print(f"⚠️  Generated file has {len(personas)} personas, need {jury_size}. Will supplement with seeds.")
    
    # Fall back to seeds
    seed_personas = load_seed_personas()
    
    if not seed_personas:
        # No seeds either - provide helpful error
        raise FileNotFoundError(
            "No personas found! To run jury evaluations:\n"
            "1. Add seed personas to elmer-docs/personas/seeds/*.json, OR\n"
            "2. Run 'python elmer-docs/scripts/jury-system/expand_personas.py' to generate a batch\n"
            "\n"
            "See elmer-docs/personas/README.md for details."
        )
    
    print(f"📦 Loading {len(seed_personas)} seed personas from: personas/seeds/")
    
    # If we have generated but not enough, combine
    all_personas = []
    if generated_file:
        with open(generated_file) as f:
            all_personas = json.load(f)
    
    all_personas.extend(seed_personas)
    
    # If still not enough, expand seeds
    if len(all_personas) < jury_size:
        archetypes = load_archetypes()
        needed = jury_size - len(all_personas)
        print(f"🔄 Expanding {needed} personas from seeds...")
        
        expansion_index = 0
        while len(all_personas) < jury_size:
            # Sample from seeds and expand
            seed = random.choice(seed_personas)
            expanded = expand_persona(seed, expansion_index, archetypes)
            all_personas.append(expanded)
            expansion_index += 1
    
    return sample_stratified(all_personas, jury_size, skeptic_minimum)


def sample_stratified(personas: List[Dict], size: int, skeptic_minimum: float = 0.15) -> List[Dict]:
    """
    Sample personas with stratified distribution ensuring skeptic representation.
    
    Args:
        personas: Full list of available personas
        size: Target sample size
        skeptic_minimum: Minimum percentage of skeptics
    """
    if len(personas) <= size:
        return personas
    
    # Separate by adoption stage
    by_adoption = {
        "skeptic": [],
        "curious": [],
        "early-adopter": [],
        "power-user": [],
    }
    
    for p in personas:
        stage = p.get("psychographics", {}).get("ai_adoption_stage", "curious")
        if stage in by_adoption:
            by_adoption[stage].append(p)
        else:
            by_adoption["curious"].append(p)
    
    jury = []
    
    # Ensure minimum skeptics
    skeptic_count = max(int(size * skeptic_minimum), 1)
    skeptics_available = by_adoption.get("skeptic", [])
    if skeptics_available:
        jury.extend(random.sample(skeptics_available, min(skeptic_count, len(skeptics_available))))
    
    # Fill remaining with other stages
    remaining = size - len(jury)
    other_personas = [p for p in personas if p not in jury]
    
    if other_personas and remaining > 0:
        jury.extend(random.sample(other_personas, min(remaining, len(other_personas))))
    
    random.shuffle(jury)
    return jury[:size]


def get_persona_stats(personas: List[Dict]) -> Dict:
    """Get distribution statistics for a persona list."""
    total = len(personas)
    if total == 0:
        return {"total": 0}
    
    stats = {
        "total": total,
        "by_archetype": {},
        "by_adoption": {},
    }
    
    for p in personas:
        arch = p.get("archetype_id", "unknown")
        stats["by_archetype"][arch] = stats["by_archetype"].get(arch, 0) + 1
        
        adoption = p.get("psychographics", {}).get("ai_adoption_stage", "unknown")
        stats["by_adoption"][adoption] = stats["by_adoption"].get(adoption, 0) + 1
    
    # Calculate percentages
    for key in ["by_archetype", "by_adoption"]:
        for k, v in stats[key].items():
            stats[key][k] = {"count": v, "percent": round(v / total * 100, 1)}
    
    return stats


if __name__ == "__main__":
    # Test the loader
    print("Testing persona loader...\n")
    
    try:
        personas = load_personas_for_jury(jury_size=25)
        stats = get_persona_stats(personas)
        
        print(f"\n✅ Loaded {stats['total']} personas")
        print(f"\nBy archetype:")
        for arch, data in stats["by_archetype"].items():
            print(f"  - {arch}: {data['count']} ({data['percent']}%)")
        
        print(f"\nBy AI adoption:")
        for stage, data in stats["by_adoption"].items():
            print(f"  - {stage}: {data['count']} ({data['percent']}%)")
            
    except FileNotFoundError as e:
        print(f"❌ {e}")
