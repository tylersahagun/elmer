#!/usr/bin/env python3
"""
Expands seed personas to 1000 using procedural variation.
Creates diverse personas while maintaining archetype characteristics.
"""

import json
import random
import hashlib
from pathlib import Path
from copy import deepcopy
from typing import List, Dict

# Variation pools for procedural generation
FIRST_NAMES = {
    "male": ["James", "John", "Michael", "David", "Robert", "William", "Richard", "Thomas", "Christopher", "Daniel",
             "Marcus", "Kevin", "Brian", "Steven", "Eric", "Anthony", "Jose", "Carlos", "Luis", "Diego",
             "Wei", "Jin", "Chen", "Hiroshi", "Raj", "Arjun", "Omar", "Ahmed", "Kofi", "Kwame",
             "Patrick", "Sean", "Connor", "Liam", "Noah", "Ethan", "Mason", "Alexander", "Sebastian", "Henry"],
    "female": ["Mary", "Jennifer", "Linda", "Patricia", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen",
               "Maria", "Ana", "Carmen", "Sofia", "Isabella", "Valentina", "Camila", "Lucia", "Elena", "Gabriela",
               "Li", "Mei", "Yuki", "Priya", "Aisha", "Fatima", "Amara", "Zara", "Nadia", "Layla",
               "Emma", "Olivia", "Ava", "Sophia", "Mia", "Charlotte", "Amelia", "Harper", "Evelyn", "Luna"],
}

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
    "Chen", "Wang", "Li", "Kim", "Park", "Nguyen", "Patel", "Singh", "Kumar", "Shah",
    "Thompson", "White", "Harris", "Martin", "Jackson", "Lee", "Perez", "Taylor", "Anderson", "Thomas",
    "O'Brien", "Murphy", "Kelly", "Sullivan", "McCarthy", "Ryan", "Walsh", "O'Connor", "Kennedy", "Brennan",
    "Schmidt", "Mueller", "Weber", "Schneider", "Fischer", "Meyer", "Wagner", "Becker", "Hoffmann", "Schulz",
    "Nakamura", "Tanaka", "Yamamoto", "Watanabe", "Ito", "Kobayashi", "Sato", "Takahashi", "Suzuki", "Kato",
    "Okonkwo", "Adeyemi", "Mensah", "Asante", "Diallo", "Toure", "Mbeki", "Zulu", "Mandela", "Achebe",
]

LOCATIONS = [
    "San Francisco, CA", "New York, NY", "Austin, TX", "Seattle, WA", "Boston, MA", "Denver, CO",
    "Chicago, IL", "Los Angeles, CA", "Atlanta, GA", "Miami, FL", "Dallas, TX", "Phoenix, AZ",
    "Portland, OR", "Nashville, TN", "Minneapolis, MN", "Detroit, MI", "Philadelphia, PA", "San Diego, CA",
    "Toronto, ON", "Vancouver, BC", "London, UK", "Dublin, Ireland", "Berlin, Germany", "Amsterdam, Netherlands",
    "Sydney, Australia", "Singapore", "Tokyo, Japan", "Mumbai, India", "São Paulo, Brazil", "Mexico City, Mexico",
]

INDUSTRIES = [
    "B2B SaaS", "Fintech", "HR Tech", "EdTech", "Healthcare IT", "Cybersecurity", "E-commerce SaaS",
    "MarTech", "Proptech", "Logistics Tech", "Manufacturing", "Financial Services", "Insurance Tech",
    "Legal Tech", "Construction Tech", "Retail Tech", "Travel Tech", "Food Tech", "Clean Tech",
    "Enterprise Software", "Developer Tools", "Cloud Infrastructure", "Data Analytics", "AI/ML",
]

COMPANY_SIZES = ["1-50", "51-200", "201-1000", "1000+"]
FUNDING_STAGES = ["bootstrapped", "seed", "series-a", "series-b", "series-c+", "public"]
TECH_LITERACY = ["novice", "intermediate", "advanced", "expert"]
AI_ADOPTION = ["skeptic", "curious", "early-adopter", "power-user"]
COMM_STYLES = ["analytical", "driver", "amiable", "expressive"]

PAIN_TEMPLATES = {
    "sales-rep": [
        "Spending too much time on {activity} instead of selling",
        "Missing {signal} that could close deals faster",
        "CRM data is always {issue} which hurts my {outcome}",
        "Can't keep track of {items} across all my deals",
        "Competitors are {advantage} and I'm falling behind",
    ],
    "sales-leader": [
        "Can't get visibility into {metric} without asking reps",
        "Forecast is {quality} and I look bad in board meetings",
        "Reps aren't {behavior} consistently across the team",
        "Ramp time is too long - need to cut from {current} to {target}",
        "Team adoption of tools is {level} and hurting productivity",
    ],
    "csm": [
        "Managing too many accounts means I miss {signal}",
        "QBR prep takes {time} that I could spend with customers",
        "Expansion opportunities are hidden in {location}",
        "Can't scale {activity} with my current book of business",
        "Customer health scores don't reflect {reality}",
    ],
    "operations": [
        "Data quality is {quality} because reps don't update {system}",
        "Building {integration} for every new tool is exhausting",
        "Forecasting methodology is {state} across the org",
        "Can't get {report} without manual data pulls",
        "Tech debt from {past_tool} is massive",
    ],
    "strategic-consultant": [
        "Client conversations contain {value} but extracting it takes hours",
        "Billable time wasted on {activity} instead of strategy",
        "Can't scale my expertise without {constraint}",
        "{stakeholder} expects AI insights but my tools are legacy",
        "Knowledge lives in {location} and can't be shared",
    ],
}

FEAR_TEMPLATES = {
    "sales-rep": [
        "AI making mistakes that hurt my deals",
        "Being micromanaged through AI surveillance",
        "Tool complexity slowing me down instead of speeding me up",
        "Compliance issues with AI transcription",
        "Losing my job to AI automation",
    ],
    "sales-leader": [
        "Team not adopting the tool",
        "Investing in something that becomes shelfware",
        "AI forecast that leadership doesn't trust",
        "Change fatigue killing team morale",
        "Spending budget without measurable ROI",
    ],
    "csm": [
        "AI flagging false positives that waste my time",
        "Automation feeling robotic to customers",
        "Missing the human touch that builds relationships",
        "Compliance risk with customer data",
        "Customers feeling surveilled or analyzed",
    ],
    "operations": [
        "Another tool that creates tech debt",
        "Integration complexity overwhelming the team",
        "Migration risk to existing workflows",
        "Vendor lock-in with proprietary data format",
        "Budget spent on features we don't need",
    ],
    "strategic-consultant": [
        "AI diluting the quality that clients pay premium for",
        "Getting caught using unapproved tools",
        "AI missing nuance that costs us the engagement",
        "Recommendations I can't defend to C-suite clients",
        "AI becoming a commodity that erodes our value",
    ],
}


def generate_name() -> str:
    gender = random.choice(["male", "female"])
    first = random.choice(FIRST_NAMES[gender])
    last = random.choice(LAST_NAMES)
    return f"{first} {last}"


def generate_id(archetype: str, index: int) -> str:
    prefix = archetype[:2].lower()
    return f"persona_{prefix}{str(index).zfill(4)}"


def vary_score(base: float, variance: float = 0.2) -> float:
    """Vary a score while keeping it in bounds."""
    new_val = base + random.uniform(-variance, variance)
    return round(max(0.0, min(1.0, new_val)), 2)


def generate_persona_variation(seed: Dict, archetype: str, index: int) -> Dict:
    """Create a variation of a seed persona."""
    persona = deepcopy(seed)
    
    # New identity
    persona["id"] = generate_id(archetype, index)
    persona["demographics"]["name"] = generate_name()
    persona["demographics"]["age"] = random.randint(24, 58)
    persona["demographics"]["location"] = random.choice(LOCATIONS)
    persona["demographics"]["years_experience"] = max(1, persona["demographics"]["age"] - 22 - random.randint(0, 5))
    
    # Vary firmographics
    persona["firmographics"]["industry"] = random.choice(INDUSTRIES)
    persona["firmographics"]["company_size"] = random.choice(COMPANY_SIZES)
    persona["firmographics"]["funding_stage"] = random.choice(FUNDING_STAGES)
    
    # Vary psychographics (keep within archetype bounds)
    persona["psychographics"]["tech_literacy"] = random.choice(TECH_LITERACY)
    
    # Ensure minimum skeptics (15%)
    if random.random() < 0.15:
        persona["psychographics"]["ai_adoption_stage"] = "skeptic"
        persona["psychographics"]["trust_in_ai"] = vary_score(0.3, 0.15)
    else:
        persona["psychographics"]["ai_adoption_stage"] = random.choice(AI_ADOPTION)
        base_trust = {"skeptic": 0.3, "curious": 0.5, "early-adopter": 0.7, "power-user": 0.85}
        persona["psychographics"]["trust_in_ai"] = vary_score(
            base_trust[persona["psychographics"]["ai_adoption_stage"]], 0.15
        )
    
    # Vary other scores
    for key in ["patience_for_learning", "tool_fatigue", "migration_sensitivity", "complexity_tolerance"]:
        if key in persona["psychographics"]:
            persona["psychographics"][key] = vary_score(persona["psychographics"][key], 0.25)
    
    persona["psychographics"]["communication_style"] = random.choice(COMM_STYLES)
    
    # Vary context
    pains = PAIN_TEMPLATES.get(archetype, PAIN_TEMPLATES["sales-rep"])
    fears = FEAR_TEMPLATES.get(archetype, FEAR_TEMPLATES["sales-rep"])
    persona["context"]["fear"] = random.choice(fears)
    
    return persona


def expand_personas(input_dir: Path, output_file: Path, target_count: int = 1000) -> List[Dict]:
    """Expand seed personas to target count."""
    all_seeds = []
    
    # Load all seed files
    for json_file in input_dir.glob("*-personas.json"):
        with open(json_file) as f:
            seeds = json.load(f)
            all_seeds.extend(seeds)
    
    print(f"Loaded {len(all_seeds)} seed personas")
    
    # Calculate distribution
    archetype_counts = {
        "sales-rep": int(target_count * 0.35),
        "sales-leader": int(target_count * 0.25),
        "csm": int(target_count * 0.15),
        "operations": int(target_count * 0.15),
        "strategic-consultant": int(target_count * 0.10),
    }
    
    all_personas = []
    
    for archetype, count in archetype_counts.items():
        # Get seeds for this archetype
        archetype_seeds = [p for p in all_seeds if p.get("archetype_id") == archetype]
        if not archetype_seeds:
            print(f"Warning: No seeds for {archetype}")
            continue
        
        print(f"Generating {count} {archetype} personas from {len(archetype_seeds)} seeds...")
        
        for i in range(count):
            seed = random.choice(archetype_seeds)
            persona = generate_persona_variation(seed, archetype, len(all_personas) + 1)
            all_personas.append(persona)
    
    # Shuffle for variety
    random.shuffle(all_personas)
    
    # Assign final sequential IDs
    for i, persona in enumerate(all_personas):
        persona["id"] = f"persona_{str(i+1).zfill(4)}"
    
    # Save
    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, "w") as f:
        json.dump(all_personas, f, indent=2)
    
    # Generate stats
    stats = calculate_stats(all_personas)
    stats_file = output_file.parent / "personas-stats.json"
    with open(stats_file, "w") as f:
        json.dump(stats, f, indent=2)
    
    print(f"\n✅ Generated {len(all_personas)} personas")
    print(f"📁 Saved to {output_file}")
    print(f"📊 Stats saved to {stats_file}")
    
    return all_personas


def calculate_stats(personas: List[Dict]) -> Dict:
    """Calculate diversity statistics."""
    total = len(personas)
    
    stats = {
        "total_count": total,
        "by_archetype": {},
        "by_ai_adoption": {},
        "by_company_size": {},
        "by_tech_literacy": {},
        "by_comm_style": {},
        "skeptic_percentage": 0,
    }
    
    for p in personas:
        arch = p.get("archetype_id", "unknown")
        stats["by_archetype"][arch] = stats["by_archetype"].get(arch, 0) + 1
        
        psych = p.get("psychographics", {})
        
        ai = psych.get("ai_adoption_stage", "unknown")
        stats["by_ai_adoption"][ai] = stats["by_ai_adoption"].get(ai, 0) + 1
        
        tech = psych.get("tech_literacy", "unknown")
        stats["by_tech_literacy"][tech] = stats["by_tech_literacy"].get(tech, 0) + 1
        
        comm = psych.get("communication_style", "unknown")
        stats["by_comm_style"][comm] = stats["by_comm_style"].get(comm, 0) + 1
        
        firm = p.get("firmographics", {})
        size = firm.get("company_size", "unknown")
        stats["by_company_size"][size] = stats["by_company_size"].get(size, 0) + 1
    
    skeptics = stats["by_ai_adoption"].get("skeptic", 0)
    stats["skeptic_percentage"] = round(skeptics / total * 100, 1) if total > 0 else 0
    
    # Convert to percentages
    for key in ["by_archetype", "by_ai_adoption", "by_company_size", "by_tech_literacy", "by_comm_style"]:
        for k, v in stats[key].items():
            stats[key][k] = {"count": v, "percent": round(v / total * 100, 1)}
    
    return stats


if __name__ == "__main__":
    script_dir = Path(__file__).parent.parent.parent
    input_dir = script_dir / "personas" / "generated" / "batch-2026-01-08"
    output_file = input_dir / "all-personas.json"
    
    expand_personas(input_dir, output_file, target_count=1000)

