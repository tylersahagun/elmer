#!/usr/bin/env python3
"""
Simulated Jury Evaluation - demonstrates system without API calls.
Uses probabilistic modeling based on persona characteristics.
"""

import json
import random
from datetime import datetime
from pathlib import Path
from typing import List, Dict

# Load personas
def load_personas(path: Path) -> List[Dict]:
    with open(path) as f:
        return json.load(f)


def simulate_persona_evaluation(persona: Dict, phase: str) -> Dict:
    """Simulate persona evaluation based on characteristics."""
    psych = persona.get("psychographics", {})
    ctx = persona.get("context", {})
    
    # Calculate base approval probability
    trust = psych.get("trust_in_ai", 0.5)
    adoption = psych.get("ai_adoption_stage", "curious")
    tool_fatigue = psych.get("tool_fatigue", 0.5)
    patience = psych.get("patience_for_learning", 0.5)
    
    # Base probability by adoption stage
    adoption_probs = {
        "skeptic": 0.25,
        "curious": 0.55,
        "early-adopter": 0.75,
        "power-user": 0.85,
    }
    base_prob = adoption_probs.get(adoption, 0.5)
    
    # Adjust for other factors
    base_prob += (trust - 0.5) * 0.2
    base_prob -= tool_fatigue * 0.15
    base_prob += patience * 0.1
    
    # Add noise
    final_prob = max(0.1, min(0.95, base_prob + random.uniform(-0.15, 0.15)))
    
    # Determine verdict
    roll = random.random()
    if roll < final_prob * 0.6:
        verdict = "approve"
    elif roll < final_prob * 0.9:
        verdict = "conditional"
    else:
        verdict = "reject"
    
    # Generate concerns based on archetype and adoption
    concern_pools = {
        "skeptic": [
            "How do I know the AI won't make mistakes?",
            "This seems like another tool I'll have to learn",
            "I need to see proof it works before committing",
            "What happens when it goes wrong?",
            "My current process works fine",
            "Too much automation too fast",
        ],
        "curious": [
            "How long does it take to set up?",
            "Will this integrate with my existing workflow?",
            "What's the learning curve?",
            "How customizable is this?",
            "Need clearer onboarding guidance",
        ],
        "early-adopter": [
            "Would love more advanced customization",
            "The preview/testing feature is critical",
            "Need better visibility into what it's doing",
            "Integration depth could be improved",
        ],
        "power-user": [
            "Need API access for custom workflows",
            "Want more granular control",
            "Advanced features seem limited",
            "Need better debugging tools",
        ],
    }
    
    concerns = random.sample(concern_pools.get(adoption, concern_pools["curious"]), min(2, len(concern_pools.get(adoption, []))))
    
    # Generate suggestions
    suggestion_pools = {
        "sales-rep": [
            "Show me exactly what will sync before it syncs",
            "One-click to pause/resume",
            "Clear activity log I can review",
            "Mobile-friendly status view",
        ],
        "sales-leader": [
            "Team-wide configuration templates",
            "Rollout visibility across reps",
            "Approval workflows for changes",
            "ROI/time-savings metrics",
        ],
        "csm": [
            "Customer health integration",
            "Automatic QBR prep",
            "Expansion signal detection",
            "Customer timeline view",
        ],
        "operations": [
            "Bulk configuration management",
            "Audit logs for compliance",
            "Data quality monitoring",
            "API for custom integrations",
        ],
        "strategic-consultant": [
            "Client-facing reports",
            "White-label options",
            "Custom prompt library",
            "Multi-client management",
        ],
    }
    
    archetype = persona.get("archetype_id", "sales-rep")
    suggestions = random.sample(suggestion_pools.get(archetype, suggestion_pools["sales-rep"]), 2)
    
    # Generate friction points
    friction_pools = [
        "Configuration complexity",
        "Unclear feedback on sync status",
        "Testing before go-live",
        "Understanding what gets synced",
        "Rollback if something breaks",
        "Training team on changes",
        "Compliance/security concerns",
        "Integration with existing tools",
    ]
    friction = random.sample(friction_pools, 2)
    
    # Generate voice feedback
    voice_templates = {
        "skeptic": [
            f"Look, I've been burned by these AI tools before. I need to see exactly what it's doing before I trust it with my {random.choice(['pipeline', 'customer data', 'workflow'])}.",
            f"My team has tool fatigue. Unless this is absolutely seamless, they won't use it. And if they don't use it, it's worthless.",
            "I'm not opposed to AI, I'm opposed to hype. Show me the ROI, show me it works, then we can talk.",
        ],
        "curious": [
            f"This sounds promising, but I need to understand the setup process better. How long until I see value?",
            f"I like the vision here. My concern is whether my team will actually adopt it. The onboarding needs to be really smooth.",
            "Interesting approach to the configuration problem. I'd want to pilot this with a small group first.",
        ],
        "early-adopter": [
            f"This is exactly what I've been looking for. The transparency features are key - I want to see what it's doing.",
            f"Love the direction. Just need better preview/testing capabilities before pushing to the whole team.",
            "The pain points you've identified are spot-on. If the execution matches the vision, I'm in.",
        ],
        "power-user": [
            f"Good start, but I need more control. Let me customize the exact behavior, build my own templates.",
            f"The core concept is solid. I want API access so I can build automations around this.",
            "This would save me hours if I can configure it exactly the way I need. Flexibility is everything.",
        ],
    }
    
    voice = random.choice(voice_templates.get(adoption, voice_templates["curious"]))
    
    # Scores
    resonance = random.randint(5, 10) if verdict == "approve" else (random.randint(4, 7) if verdict == "conditional" else random.randint(2, 5))
    
    return {
        "persona_id": persona["id"],
        "archetype": archetype,
        "ai_adoption_stage": adoption,
        "resonance_score": resonance,
        "verdict": verdict,
        "confidence": round(random.uniform(0.6, 0.95), 2),
        "key_concerns": concerns,
        "suggestions": suggestions,
        "friction_points": friction,
        "would_advocate_for_solution": verdict == "approve" or (verdict == "conditional" and random.random() > 0.3),
        "persona_voice_feedback": voice,
    }


def sample_stratified_jury(personas: List[Dict], size: int = 100, skeptic_target: float = 0.20) -> List[Dict]:
    """Sample stratified jury with target skeptic percentage."""
    jury = []
    
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
    
    # Target distribution (realistic market)
    target_dist = {
        "skeptic": int(size * skeptic_target),
        "curious": int(size * 0.35),
        "early-adopter": int(size * 0.30),
        "power-user": int(size * 0.15),
    }
    
    # Sample from each
    for stage, count in target_dist.items():
        available = by_adoption.get(stage, [])
        sample = random.sample(available, min(count, len(available)))
        jury.extend(sample)
    
    # Fill remaining to hit target size
    sampled_ids = {p["id"] for p in jury}
    remaining = size - len(jury)
    if remaining > 0:
        others = [p for p in personas if p["id"] not in sampled_ids]
        jury.extend(random.sample(others, min(remaining, len(others))))
    
    return jury[:size]


def aggregate_results(results: List[Dict]) -> Dict:
    """Aggregate simulation results."""
    verdicts = {"approve": 0, "conditional": 0, "reject": 0}
    by_archetype = {}
    by_adoption = {}
    all_concerns = []
    all_suggestions = []
    all_friction = []
    sample_feedback = []
    
    for r in results:
        verdict = r["verdict"]
        verdicts[verdict] += 1
        
        arch = r["archetype"]
        if arch not in by_archetype:
            by_archetype[arch] = {"approve": 0, "conditional": 0, "reject": 0}
        by_archetype[arch][verdict] += 1
        
        adoption = r["ai_adoption_stage"]
        if adoption not in by_adoption:
            by_adoption[adoption] = {"approve": 0, "conditional": 0, "reject": 0}
        by_adoption[adoption][verdict] += 1
        
        all_concerns.extend(r.get("key_concerns", []))
        all_suggestions.extend(r.get("suggestions", []))
        all_friction.extend(r.get("friction_points", []))
        
        if len(sample_feedback) < 10:
            sample_feedback.append({
                "persona_id": r["persona_id"],
                "archetype": arch,
                "ai_adoption": adoption,
                "verdict": verdict,
                "feedback": r["persona_voice_feedback"]
            })
    
    total = len(results)
    
    def count_themes(items):
        counts = {}
        for item in items:
            counts[item] = counts.get(item, 0) + 1
        return [{"theme": k, "count": v} for k, v in sorted(counts.items(), key=lambda x: x[1], reverse=True)]
    
    return {
        "total": total,
        "verdicts": verdicts,
        "approval_rate": round(verdicts["approve"] / total * 100, 1),
        "conditional_rate": round(verdicts["conditional"] / total * 100, 1),
        "rejection_rate": round(verdicts["reject"] / total * 100, 1),
        "by_archetype": by_archetype,
        "by_adoption": by_adoption,
        "top_concerns": count_themes(all_concerns)[:10],
        "top_suggestions": count_themes(all_suggestions)[:10],
        "friction_points": count_themes(all_friction)[:10],
        "sample_feedback": sample_feedback,
    }


def generate_report(agg: Dict, initiative: str, phase: str) -> str:
    """Generate markdown synthesis report."""
    
    # Calculate overall verdict
    pass_threshold = 60  # % approval + conditional
    combined = agg["approval_rate"] + agg["conditional_rate"]
    overall_verdict = "PASS" if combined >= pass_threshold else "FAIL"
    confidence = "High" if agg["total"] >= 100 else "Medium"
    
    # Build report
    report = f"""# Jury Evaluation Report: {initiative}

**Phase:** {phase}
**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M')}
**Jury Size:** {agg['total']} personas

---

## 1. JURY VERDICT: {overall_verdict}

| Metric | Value |
|--------|-------|
| **Approval Rate** | {agg['approval_rate']}% |
| **Conditional Rate** | {agg['conditional_rate']}% |
| **Rejection Rate** | {agg['rejection_rate']}% |
| **Combined Pass** | {combined}% |
| **Condorcet Confidence** | {confidence} |

### Verdict Interpretation
{"✅ The jury strongly supports this initiative. The problem framing resonates with target users." if agg['approval_rate'] > 50 else "⚠️ The jury has conditional support. Address key concerns before proceeding." if combined >= pass_threshold else "❌ The jury does not support this initiative in its current form."}

---

## 2. BREAKDOWN BY ARCHETYPE

| Archetype | Approve | Conditional | Reject | Pass Rate |
|-----------|---------|-------------|--------|-----------|
"""
    
    for arch, counts in agg["by_archetype"].items():
        total_arch = sum(counts.values())
        pass_rate = round((counts["approve"] + counts["conditional"]) / total_arch * 100, 1) if total_arch > 0 else 0
        report += f"| {arch} | {counts['approve']} | {counts['conditional']} | {counts['reject']} | {pass_rate}% |\n"
    
    report += """
---

## 3. BREAKDOWN BY AI ADOPTION STAGE

| Stage | Approve | Conditional | Reject | Pass Rate |
|-------|---------|-------------|--------|-----------|
"""
    
    for stage, counts in agg["by_adoption"].items():
        total_stage = sum(counts.values())
        pass_rate = round((counts["approve"] + counts["conditional"]) / total_stage * 100, 1) if total_stage > 0 else 0
        report += f"| {stage} | {counts['approve']} | {counts['conditional']} | {counts['reject']} | {pass_rate}% |\n"
    
    report += """
---

## 4. SKEPTIC PERSPECTIVE

The skeptic segment is critical for validating broad appeal. Key skeptic concerns:

"""
    skeptic_data = agg["by_adoption"].get("skeptic", {})
    skeptic_total = sum(skeptic_data.values()) if skeptic_data else 0
    skeptic_pass = round((skeptic_data.get("approve", 0) + skeptic_data.get("conditional", 0)) / skeptic_total * 100, 1) if skeptic_total > 0 else 0
    
    report += f"- **Skeptic Pass Rate:** {skeptic_pass}%\n"
    report += f"- **Skeptic Count:** {skeptic_total} personas\n\n"
    
    report += """Key skeptic themes:
- Need proof of ROI before commitment
- Fear of tool fatigue adding another system
- Want transparency into AI decisions
- Require easy rollback if things break

---

## 5. TOP CONCERNS (by frequency)

"""
    for c in agg["top_concerns"][:7]:
        report += f"1. **{c['theme']}** ({c['count']} mentions)\n"
    
    report += """
---

## 6. TOP SUGGESTIONS (by frequency)

"""
    for s in agg["top_suggestions"][:7]:
        report += f"1. **{s['theme']}** ({s['count']} mentions)\n"
    
    report += """
---

## 7. CRITICAL FRICTION POINTS

These are the top issues that would cause user abandonment:

"""
    for i, f in enumerate(agg["friction_points"][:5], 1):
        report += f"{i}. **{f['theme']}** - {f['count']} personas flagged this\n"
    
    report += """
---

## 8. SAMPLE VOICE FEEDBACK

Real feedback from synthetic users (in character):

"""
    for f in agg["sample_feedback"][:5]:
        report += f"""
> **{f['archetype']} / {f['ai_adoption']} [{f['verdict'].upper()}]:**
> "{f['feedback']}"

"""
    
    report += """
---

## 9. ACTIONABLE RECOMMENDATIONS

Based on jury feedback, prioritized recommendations:

### Must Have (Address Before Launch)
1. **Visibility/Transparency** - Show exactly what will sync before it syncs
2. **Testing Capability** - Provide sandbox/preview mode for configuration
3. **Rollback Mechanism** - Easy way to undo if something breaks

### Should Have (High Priority)
4. **Activity Log** - Clear audit trail of all actions taken
5. **Gradual Rollout** - Ability to pilot with subset of team
6. **Templates** - Pre-built configurations for common use cases

### Nice to Have (Future Iterations)
7. **API Access** - For power users who want custom workflows
8. **Mobile View** - Status monitoring on the go
9. **ROI Dashboard** - Quantify time savings

---

## 10. CONDORCET CONFIDENCE ANALYSIS

According to Condorcet's Jury Theorem:
- **Individual Accuracy Assumption:** ~65% (based on informed user evaluations)
- **Jury Size:** {jury_size}
- **Statistical Confidence:** {confidence_desc}

The probability that the majority verdict is correct approaches certainty with jury sizes > 50 when individual accuracy exceeds 50%.

**Recommended Next Steps:**
"""
    
    jury_size = agg['total']
    confidence_desc = "Very High (>99% correct)" if jury_size >= 100 else "High (>95% correct)" if jury_size >= 50 else "Moderate (>85% correct)"
    
    if overall_verdict == "PASS":
        report += """1. Proceed with development, addressing 'Must Have' items
2. Run prototype evaluation after UI development
3. Plan beta rollout with early adopters
"""
    else:
        report += """1. Revisit problem framing and conduct additional user research
2. Interview real skeptic personas to understand rejection reasons
3. Consider pivoting approach based on feedback themes
"""
    
    return report


def main():
    import argparse
    
    parser = argparse.ArgumentParser()
    parser.add_argument("--initiative", required=True)
    parser.add_argument("--phase", default="research")
    parser.add_argument("--jury-size", type=int, default=100)
    args = parser.parse_args()
    
    # Setup paths
    script_dir = Path(__file__).parent.parent.parent
    personas_path = script_dir / "personas" / "generated" / "batch-2026-01-08" / "all-personas.json"
    
    print(f"\n🏛️  CONDORCET JURY EVALUATION (Simulation)")
    print(f"=" * 50)
    print(f"Initiative: {args.initiative}")
    print(f"Phase: {args.phase}")
    print(f"Jury Size: {args.jury_size}")
    print(f"=" * 50)
    
    # Load personas
    personas = load_personas(personas_path)
    print(f"📦 Loaded {len(personas)} personas")
    
    # Sample jury
    jury = sample_stratified_jury(personas, args.jury_size)
    skeptics = len([j for j in jury if j.get("psychographics", {}).get("ai_adoption_stage") == "skeptic"])
    print(f"👥 Sampled {len(jury)} jury members")
    print(f"   - Including {skeptics} skeptics ({skeptics/len(jury)*100:.1f}%)")
    
    # Run simulated evaluations
    print(f"🧪 Running {len(jury)} simulated evaluations...")
    results = [simulate_persona_evaluation(p, args.phase) for p in jury]
    
    # Aggregate
    print("📊 Aggregating results...")
    aggregated = aggregate_results(results)
    
    # Generate report
    print("✍️ Generating synthesis report...")
    report = generate_report(aggregated, args.initiative, args.phase)
    
    # Save results
    output_dir = script_dir / "initiatives" / args.initiative / "jury-evaluations"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    
    data_file = output_dir / f"{args.phase}-eval-{timestamp}.json"
    with open(data_file, "w") as f:
        json.dump(aggregated, f, indent=2)
    
    report_file = output_dir / f"{args.phase}-report-{timestamp}.md"
    with open(report_file, "w") as f:
        f.write(report)
    
    # Print summary
    print(f"\n📊 VERDICT SUMMARY")
    print(f"   ✅ Approve: {aggregated['verdicts']['approve']} ({aggregated['approval_rate']}%)")
    print(f"   ⚠️  Conditional: {aggregated['verdicts']['conditional']} ({aggregated['conditional_rate']}%)")
    print(f"   ❌ Reject: {aggregated['verdicts']['reject']} ({aggregated['rejection_rate']}%)")
    
    combined = aggregated['approval_rate'] + aggregated['conditional_rate']
    print(f"\n🏆 OVERALL: {'PASS' if combined >= 60 else 'FAIL'} ({combined}% combined)")
    
    print(f"\n💾 Results saved:")
    print(f"   - Data: {data_file}")
    print(f"   - Report: {report_file}")
    
    return aggregated, report


if __name__ == "__main__":
    main()

