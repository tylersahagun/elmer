#!/usr/bin/env python3
"""
Persona Generation Script for Condorcet Jury System

Generates 1000 synthetic personas using Verbalized Sampling
to avoid mode collapse and ensure diversity.

Usage:
    python generate_personas.py --count 1000 --output ./personas/generated/batch-2026-01-08/
    
Requires:
    pip install anthropic pydantic
"""

import json
import asyncio
import hashlib
import random
from datetime import datetime
from pathlib import Path
from typing import Optional
import argparse

# Try to import anthropic, provide helpful error if not available
try:
    from anthropic import AsyncAnthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False
    print("Note: anthropic package not installed. Run: pip install anthropic")

# Configuration
CONFIG = {
    "model": "claude-3-haiku-20240307",
    "temperature": 0.9,
    "max_concurrent": 10,
    "batch_size": 5,  # Personas per API call
}

ARCHETYPE_DISTRIBUTION = {
    "sales-rep": 350,
    "sales-leader": 250,
    "csm": 150,
    "operations": 150,
    "strategic-consultant": 100,
}

GENERATION_PROMPT = '''You are generating synthetic user personas for AskElephant, a meeting recording and AI analysis platform for B2B revenue teams.

ARCHETYPE: {archetype}
ARCHETYPE DETAILS:
{archetype_json}

Generate {count} DISTINCT personas that are variations of this archetype. Use VERBALIZED SAMPLING:
- Each persona should have probability < 0.15 (sample from distribution tails)
- Include at least 1 skeptic (ai_adoption_stage: "skeptic") 
- Vary across: company size, tech literacy, communication style, specific pain points
- Use diverse names (varied ethnicities, genders)
- Make voice_quotes authentic to each variation

AVOID mode collapse - each persona must be meaningfully different!

Previous personas in this batch (ensure distinctiveness):
{previous_personas}

Return a JSON array of {count} personas matching this schema:
{{
  "id": "persona_[8-char-hash]",
  "archetype_id": "{archetype}",
  "sub_type": "[if applicable]",
  "demographics": {{
    "name": "[Full Name]",
    "age": [22-65],
    "location": "[City, State/Country]",
    "years_experience": [0-40]
  }},
  "role": {{
    "title": "[Job Title]",
    "department": "[sales|customer-success|revenue-operations|marketing|executive]",
    "seniority": "[individual-contributor|manager|director|vp|c-suite]",
    "decision_authority": "[decision-maker|influencer-champion|evaluator|end-user]"
  }},
  "firmographics": {{
    "company_size": "[1-50|51-200|201-1000|1000+]",
    "industry": "[Industry]",
    "tech_stack": ["Tool1", "Tool2"],
    "funding_stage": "[bootstrapped|seed|series-a|series-b|series-c+|public]"
  }},
  "psychographics": {{
    "tech_literacy": "[novice|intermediate|advanced|expert]",
    "ai_adoption_stage": "[skeptic|curious|early-adopter|power-user]",
    "trust_in_ai": [0.0-1.0],
    "patience_for_learning": [0.0-1.0],
    "tool_fatigue": [0.0-1.0],
    "migration_sensitivity": [0.0-1.0],
    "complexity_tolerance": [0.0-1.0],
    "communication_style": "[analytical|driver|amiable|expressive]"
  }},
  "context": {{
    "primary_pain": "[Main frustration]",
    "secondary_pains": ["Pain 2", "Pain 3"],
    "current_workarounds": ["Workaround 1"],
    "success_looks_like": "[Ideal outcome]",
    "fear": "[What they're afraid of with new tools]"
  }},
  "behavioral_heuristics": {{
    "first_click_tendency": "[Where they look first in UI]",
    "error_response": "[How they react to errors]",
    "abandonment_trigger": "[What makes them give up]"
  }},
  "voice_quotes": [
    "[Quote 1 in their authentic voice]",
    "[Quote 2 in their authentic voice]"
  ],
  "decision_context": {{
    "decision_authority": "[decision-maker|influencer-champion|evaluator|end-user]",
    "evaluation_role": "[primary|secondary|none]",
    "competitive_evaluation": true/false,
    "stakeholders_to_convince": ["Stakeholder 1"]
  }}
}}

Return ONLY the JSON array, no markdown or explanation.'''


def generate_id():
    """Generate a unique persona ID."""
    return f"persona_{hashlib.md5(str(random.random()).encode()).hexdigest()[:8]}"


def load_archetype(archetype_id: str, base_path: Path) -> dict:
    """Load archetype JSON from file."""
    archetype_path = base_path / "archetypes" / f"{archetype_id}.json"
    if archetype_path.exists():
        with open(archetype_path) as f:
            return json.load(f)
    return {"archetype_id": archetype_id, "note": "Archetype file not found"}


async def generate_batch(
    client,
    archetype: str,
    archetype_json: dict,
    count: int,
    previous: list
) -> list:
    """Generate a batch of personas using the API."""
    previous_summary = json.dumps([
        {"name": p.get("demographics", {}).get("name"), 
         "company_size": p.get("firmographics", {}).get("company_size"),
         "ai_adoption": p.get("psychographics", {}).get("ai_adoption_stage")}
        for p in previous[-10:]  # Only last 10 for context
    ], indent=2) if previous else "None yet"
    
    prompt = GENERATION_PROMPT.format(
        archetype=archetype,
        archetype_json=json.dumps(archetype_json, indent=2),
        count=count,
        previous_personas=previous_summary
    )
    
    response = await client.messages.create(
        model=CONFIG["model"],
        max_tokens=4000,
        temperature=CONFIG["temperature"],
        messages=[{"role": "user", "content": prompt}]
    )
    
    # Parse response
    content = response.content[0].text
    # Clean up any markdown if present
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
    
    try:
        personas = json.loads(content)
        # Ensure IDs are unique
        for p in personas:
            if "id" not in p or not p["id"].startswith("persona_"):
                p["id"] = generate_id()
        return personas
    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}")
        print(f"Content: {content[:500]}...")
        return []


async def generate_all_personas(output_path: Path, base_path: Path, total: int = 1000):
    """Generate all personas across archetypes."""
    if not ANTHROPIC_AVAILABLE:
        print("Error: anthropic package required. Run: pip install anthropic")
        return
    
    client = AsyncAnthropic()
    all_personas = []
    
    # Calculate per-archetype counts
    scale_factor = total / 1000
    archetype_counts = {k: int(v * scale_factor) for k, v in ARCHETYPE_DISTRIBUTION.items()}
    
    print(f"Generating {total} personas...")
    print(f"Distribution: {archetype_counts}")
    
    for archetype, count in archetype_counts.items():
        print(f"\n--- Generating {count} {archetype} personas ---")
        archetype_json = load_archetype(archetype, base_path)
        archetype_personas = []
        
        # Generate in batches
        batches = (count + CONFIG["batch_size"] - 1) // CONFIG["batch_size"]
        for i in range(batches):
            batch_count = min(CONFIG["batch_size"], count - i * CONFIG["batch_size"])
            print(f"  Batch {i+1}/{batches} ({batch_count} personas)...")
            
            try:
                batch = await generate_batch(
                    client, archetype, archetype_json, batch_count, archetype_personas
                )
                archetype_personas.extend(batch)
                print(f"    Generated {len(batch)} personas")
            except Exception as e:
                print(f"    Error: {e}")
            
            # Small delay to avoid rate limits
            await asyncio.sleep(0.5)
        
        all_personas.extend(archetype_personas)
        print(f"  Total {archetype}: {len(archetype_personas)}")
    
    # Save all personas
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Save combined file
    with open(output_path / "personas.json", "w") as f:
        json.dump(all_personas, f, indent=2)
    
    # Save manifest
    manifest = {
        "generated_at": datetime.now().isoformat(),
        "total_count": len(all_personas),
        "by_archetype": {k: len([p for p in all_personas if p.get("archetype_id") == k]) 
                        for k in ARCHETYPE_DISTRIBUTION.keys()},
        "diversity_metrics": calculate_diversity(all_personas),
        "config": CONFIG
    }
    with open(output_path / "manifest.json", "w") as f:
        json.dump(manifest, f, indent=2)
    
    print(f"\n✅ Generated {len(all_personas)} personas")
    print(f"📁 Saved to {output_path}")
    
    return all_personas


def calculate_diversity(personas: list) -> dict:
    """Calculate diversity metrics for generated personas."""
    if not personas:
        return {}
    
    # Count distributions
    ai_adoption = {}
    company_size = {}
    tech_literacy = {}
    
    for p in personas:
        psych = p.get("psychographics", {})
        firm = p.get("firmographics", {})
        
        ai = psych.get("ai_adoption_stage", "unknown")
        ai_adoption[ai] = ai_adoption.get(ai, 0) + 1
        
        size = firm.get("company_size", "unknown")
        company_size[size] = company_size.get(size, 0) + 1
        
        tech = psych.get("tech_literacy", "unknown")
        tech_literacy[tech] = tech_literacy.get(tech, 0) + 1
    
    total = len(personas)
    skeptic_count = ai_adoption.get("skeptic", 0)
    
    return {
        "total_personas": total,
        "skeptic_percent": round(skeptic_count / total * 100, 1) if total > 0 else 0,
        "ai_adoption_distribution": {k: round(v/total*100, 1) for k, v in ai_adoption.items()},
        "company_size_distribution": {k: round(v/total*100, 1) for k, v in company_size.items()},
        "tech_literacy_distribution": {k: round(v/total*100, 1) for k, v in tech_literacy.items()},
    }


def main():
    parser = argparse.ArgumentParser(description="Generate synthetic personas for jury system")
    parser.add_argument("--count", type=int, default=1000, help="Number of personas to generate")
    parser.add_argument("--output", type=str, default=None, help="Output directory")
    parser.add_argument("--base", type=str, default=None, help="Base personas directory")
    
    args = parser.parse_args()
    
    # Determine paths
    script_dir = Path(__file__).parent.parent.parent  # .pm-workspace
    if args.output:
        output_path = Path(args.output)
    else:
        output_path = script_dir / "personas" / "generated" / f"batch-{datetime.now().strftime('%Y-%m-%d')}"
    
    if args.base:
        base_path = Path(args.base)
    else:
        base_path = script_dir / "personas"
    
    # Run generation
    asyncio.run(generate_all_personas(output_path, base_path, args.count))


if __name__ == "__main__":
    main()

