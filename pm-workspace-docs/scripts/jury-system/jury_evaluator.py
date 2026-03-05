#!/usr/bin/env python3
"""
Condorcet Jury System - Synthetic User Evaluation

Runs a panel of synthetic user personas to evaluate product initiatives,
prototypes, or features using Condorcet's Jury Theorem principles.

Usage:
    python jury_evaluator.py --initiative hubspot-agent-config-ui --phase research
    python jury_evaluator.py --initiative hubspot-agent-config-ui --phase prototype --jury-size 100

Phases:
    - research: Validate pain points and problem framing
    - prd: Validate user stories and proposed solutions  
    - prototype: Validate UI/UX design decisions
"""

import json
import random
import asyncio
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
import argparse
import hashlib

# Try imports
try:
    from anthropic import AsyncAnthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False


@dataclass
class JuryConfig:
    """Configuration for jury evaluation."""
    jury_size: int = 100
    stratified_sampling: bool = True
    include_skeptics_percent: float = 0.20
    fast_model: str = "claude-3-haiku-20240307"
    synthesis_model: str = "claude-3-5-sonnet-20241022"
    parallel_evaluations: int = 10
    temperature: float = 0.7


@dataclass
class EvaluationResult:
    """Individual persona evaluation result."""
    persona_id: str
    archetype: str
    verdict: str  # "approve", "reject", "conditional"
    confidence: float
    key_concerns: List[str]
    suggestions: List[str]
    would_use: bool
    friction_points: List[str]
    reasoning: str


RESEARCH_EVAL_PROMPT = '''You are {name}, a {title} at a {company_size} {industry} company.

YOUR PROFILE:
- Tech Literacy: {tech_literacy}
- AI Adoption Stage: {ai_adoption_stage} (Trust in AI: {trust_in_ai})
- Communication Style: {communication_style}
- Primary Pain: {primary_pain}
- Fear: {fear}
- Voice: {voice_quotes}

You're being asked to evaluate whether this PROBLEM STATEMENT resonates with your real experience:

---
{content}
---

Respond AS THIS PERSONA (use first person, match their communication style):

1. RESONANCE (0-10): How much does this problem resonate with my daily work?
2. ACCURACY: Does this capture my actual pain points? What's missing?
3. PRIORITY: Would I prioritize solving this over other problems?
4. VERDICT: "approve" (this nails it), "conditional" (close but needs refinement), or "reject" (misses the mark)
5. SUGGESTIONS: What would make this more relevant to someone like me?

Respond in JSON format:
{{
  "resonance_score": 0-10,
  "verdict": "approve|conditional|reject",
  "confidence": 0.0-1.0,
  "accuracy_assessment": "string",
  "missing_pain_points": ["string"],
  "priority_vs_other_problems": "high|medium|low",
  "suggestions": ["string"],
  "would_advocate_for_solution": true|false,
  "persona_voice_feedback": "string (in character)"
}}'''


PRD_EVAL_PROMPT = '''You are {name}, a {title} at a {company_size} {industry} company.

YOUR PROFILE:
- Tech Literacy: {tech_literacy}
- AI Adoption Stage: {ai_adoption_stage} (Trust in AI: {trust_in_ai})
- Communication Style: {communication_style}
- Primary Pain: {primary_pain}
- Fear: {fear}
- Voice: {voice_quotes}

You're evaluating this PROPOSED SOLUTION:

---
{content}
---

Respond AS THIS PERSONA evaluating whether you would adopt this solution:

1. USEFULNESS (0-10): Would this actually solve my problem?
2. ADOPTION LIKELIHOOD: Would I use this regularly?
3. CONCERNS: What worries me about this approach?
4. FRICTION: What would make adoption difficult?
5. VERDICT: "approve" (I'd advocate for this), "conditional" (interested with changes), "reject" (wouldn't use)

Respond in JSON format:
{{
  "usefulness_score": 0-10,
  "verdict": "approve|conditional|reject",
  "confidence": 0.0-1.0,
  "adoption_likelihood": "definitely|probably|maybe|unlikely|never",
  "key_concerns": ["string"],
  "friction_points": ["string"],
  "must_have_features": ["string"],
  "nice_to_have_features": ["string"],
  "deal_breakers": ["string"],
  "suggestions": ["string"],
  "would_champion_internally": true|false,
  "persona_voice_feedback": "string (in character)"
}}'''


PROTOTYPE_EVAL_PROMPT = '''You are {name}, a {title} at a {company_size} {industry} company.

YOUR PROFILE:
- Tech Literacy: {tech_literacy}
- AI Adoption Stage: {ai_adoption_stage} (Trust in AI: {trust_in_ai})
- Tool Fatigue: {tool_fatigue}
- Patience for Learning: {patience_for_learning}
- First Click Tendency: {first_click_tendency}
- Abandonment Trigger: {abandonment_trigger}
- Voice: {voice_quotes}

You're evaluating this UI/UX PROTOTYPE DESCRIPTION:

---
{content}
---

Respond AS THIS PERSONA doing a cognitive walkthrough:

1. FIRST IMPRESSION: What's my gut reaction seeing this?
2. USABILITY (0-10): Can I figure out how to use this?
3. EFFICIENCY: Does this respect my time?
4. TRUST: Do I trust this with my data/workflow?
5. VERDICT: "approve" (I'd use this), "conditional" (with improvements), "reject" (too frustrating)

Apply these heuristics as this persona would:
- Visibility of system status
- Match to real-world expectations
- Error prevention and recovery
- Flexibility and efficiency

Respond in JSON format:
{{
  "first_impression": "string",
  "usability_score": 0-10,
  "efficiency_score": 0-10,
  "trust_score": 0-10,
  "verdict": "approve|conditional|reject",
  "confidence": 0.0-1.0,
  "friction_points": ["string"],
  "confusion_points": ["string"],
  "what_i_looked_for_first": "string",
  "abandonment_risk": "high|medium|low",
  "abandonment_triggers_found": ["string"],
  "suggestions": ["string"],
  "would_complete_onboarding": true|false,
  "persona_voice_feedback": "string (in character)"
}}'''


SYNTHESIS_PROMPT = '''You are a PM synthesizer analyzing {jury_size} user persona evaluations of {phase} content.

EVALUATION SUMMARY:
- Total Evaluations: {total}
- Approvals: {approvals} ({approval_rate}%)
- Conditional: {conditional} ({conditional_rate}%)
- Rejections: {rejections} ({rejection_rate}%)

BREAKDOWN BY ARCHETYPE:
{archetype_breakdown}

BREAKDOWN BY AI ADOPTION STAGE:
{adoption_breakdown}

SAMPLE FEEDBACK (representative):
{sample_feedback}

TOP CONCERNS (by frequency):
{top_concerns}

TOP SUGGESTIONS (by frequency):
{top_suggestions}

FRICTION POINTS (by frequency):
{friction_points}

Generate a structured synthesis report:

1. **JURY VERDICT**: Overall pass/fail with confidence
2. **CONSENSUS THEMES**: What did most personas agree on?
3. **POLARIZING ISSUES**: Where did personas diverge by archetype/adoption stage?
4. **SKEPTIC PERSPECTIVE**: What did AI skeptics specifically flag?
5. **CRITICAL FRICTION**: Top 3 issues that would cause abandonment
6. **ACTIONABLE RECOMMENDATIONS**: Prioritized list of changes
7. **CONDORCET CONFIDENCE**: Statistical confidence in collective judgment

Format as markdown report.'''


class JuryEvaluator:
    """Runs jury evaluation on initiatives."""
    
    def __init__(self, config: JuryConfig, personas_path: Path, pm_workspace: Path):
        self.config = config
        self.personas_path = personas_path
        self.pm_workspace = pm_workspace
        self.client = AsyncAnthropic() if ANTHROPIC_AVAILABLE else None
        self.personas = self._load_personas()
    
    def _load_personas(self) -> List[Dict]:
        """Load all personas from JSON."""
        with open(self.personas_path) as f:
            return json.load(f)
    
    def _sample_jury(self) -> List[Dict]:
        """Sample a stratified jury from personas."""
        if not self.config.stratified_sampling:
            return random.sample(self.personas, min(self.config.jury_size, len(self.personas)))
        
        # Stratified sampling by archetype and ai_adoption
        jury = []
        target_size = self.config.jury_size
        
        # Ensure minimum skeptics
        skeptics = [p for p in self.personas if p.get("psychographics", {}).get("ai_adoption_stage") == "skeptic"]
        skeptic_count = int(target_size * self.config.include_skeptics_percent)
        jury.extend(random.sample(skeptics, min(skeptic_count, len(skeptics))))
        
        # Fill remaining with stratified sampling
        remaining = target_size - len(jury)
        sampled_ids = {p["id"] for p in jury}
        
        archetypes = ["sales-rep", "sales-leader", "csm", "operations", "strategic-consultant"]
        per_archetype = remaining // len(archetypes)
        
        for arch in archetypes:
            arch_personas = [p for p in self.personas if p.get("archetype_id") == arch and p["id"] not in sampled_ids]
            sample = random.sample(arch_personas, min(per_archetype, len(arch_personas)))
            jury.extend(sample)
            sampled_ids.update(p["id"] for p in sample)
        
        return jury[:target_size]
    
    def _get_eval_prompt(self, phase: str) -> str:
        """Get the appropriate prompt template for phase."""
        prompts = {
            "research": RESEARCH_EVAL_PROMPT,
            "prd": PRD_EVAL_PROMPT,
            "prototype": PROTOTYPE_EVAL_PROMPT,
        }
        return prompts.get(phase, RESEARCH_EVAL_PROMPT)
    
    def _format_persona_prompt(self, persona: Dict, content: str, phase: str) -> str:
        """Format the evaluation prompt with persona details."""
        template = self._get_eval_prompt(phase)
        
        psych = persona.get("psychographics", {})
        ctx = persona.get("context", {})
        demo = persona.get("demographics", {})
        firm = persona.get("firmographics", {})
        behav = persona.get("behavioral_heuristics", {})
        
        return template.format(
            name=demo.get("name", "User"),
            title=persona.get("role", {}).get("title", "Employee"),
            company_size=firm.get("company_size", "medium"),
            industry=firm.get("industry", "tech"),
            tech_literacy=psych.get("tech_literacy", "intermediate"),
            ai_adoption_stage=psych.get("ai_adoption_stage", "curious"),
            trust_in_ai=psych.get("trust_in_ai", 0.5),
            communication_style=psych.get("communication_style", "analytical"),
            tool_fatigue=psych.get("tool_fatigue", 0.5),
            patience_for_learning=psych.get("patience_for_learning", 0.5),
            primary_pain=ctx.get("primary_pain", "unknown"),
            fear=ctx.get("fear", "unknown"),
            voice_quotes=json.dumps(persona.get("voice_quotes", [])),
            first_click_tendency=behav.get("first_click_tendency", "unknown"),
            abandonment_trigger=behav.get("abandonment_trigger", "unknown"),
            content=content,
        )
    
    async def _evaluate_single(self, persona: Dict, content: str, phase: str) -> Dict:
        """Run single persona evaluation."""
        prompt = self._format_persona_prompt(persona, content, phase)
        
        try:
            response = await self.client.messages.create(
                model=self.config.fast_model,
                max_tokens=1000,
                temperature=self.config.temperature,
                messages=[{"role": "user", "content": prompt}]
            )
            
            result_text = response.content[0].text
            
            # Parse JSON from response
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0]
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0]
            
            result = json.loads(result_text)
            result["persona_id"] = persona["id"]
            result["archetype"] = persona.get("archetype_id")
            result["ai_adoption_stage"] = persona.get("psychographics", {}).get("ai_adoption_stage")
            return result
            
        except Exception as e:
            return {
                "persona_id": persona["id"],
                "archetype": persona.get("archetype_id"),
                "ai_adoption_stage": persona.get("psychographics", {}).get("ai_adoption_stage"),
                "verdict": "error",
                "error": str(e),
            }
    
    async def _run_evaluations(self, jury: List[Dict], content: str, phase: str) -> List[Dict]:
        """Run parallel evaluations for all jury members."""
        semaphore = asyncio.Semaphore(self.config.parallel_evaluations)
        
        async def bounded_eval(persona):
            async with semaphore:
                return await self._evaluate_single(persona, content, phase)
        
        tasks = [bounded_eval(p) for p in jury]
        results = await asyncio.gather(*tasks)
        return results
    
    def _aggregate_results(self, results: List[Dict]) -> Dict:
        """Aggregate individual results into summary statistics."""
        valid_results = [r for r in results if r.get("verdict") != "error"]
        
        verdicts = {"approve": 0, "conditional": 0, "reject": 0}
        by_archetype = {}
        by_adoption = {}
        all_concerns = []
        all_suggestions = []
        all_friction = []
        sample_feedback = []
        
        for r in valid_results:
            verdict = r.get("verdict", "conditional")
            verdicts[verdict] = verdicts.get(verdict, 0) + 1
            
            arch = r.get("archetype", "unknown")
            if arch not in by_archetype:
                by_archetype[arch] = {"approve": 0, "conditional": 0, "reject": 0}
            by_archetype[arch][verdict] += 1
            
            adoption = r.get("ai_adoption_stage", "unknown")
            if adoption not in by_adoption:
                by_adoption[adoption] = {"approve": 0, "conditional": 0, "reject": 0}
            by_adoption[adoption][verdict] += 1
            
            all_concerns.extend(r.get("key_concerns", r.get("missing_pain_points", [])))
            all_suggestions.extend(r.get("suggestions", []))
            all_friction.extend(r.get("friction_points", []))
            
            if r.get("persona_voice_feedback") and len(sample_feedback) < 10:
                sample_feedback.append({
                    "persona_id": r["persona_id"],
                    "archetype": arch,
                    "ai_adoption": adoption,
                    "verdict": verdict,
                    "feedback": r["persona_voice_feedback"]
                })
        
        total = len(valid_results)
        return {
            "total": total,
            "verdicts": verdicts,
            "approval_rate": round(verdicts["approve"] / total * 100, 1) if total > 0 else 0,
            "conditional_rate": round(verdicts["conditional"] / total * 100, 1) if total > 0 else 0,
            "rejection_rate": round(verdicts["reject"] / total * 100, 1) if total > 0 else 0,
            "by_archetype": by_archetype,
            "by_adoption": by_adoption,
            "top_concerns": self._count_themes(all_concerns, 10),
            "top_suggestions": self._count_themes(all_suggestions, 10),
            "friction_points": self._count_themes(all_friction, 10),
            "sample_feedback": sample_feedback,
        }
    
    def _count_themes(self, items: List[str], top_n: int) -> List[Dict]:
        """Count and return top themes."""
        counts = {}
        for item in items:
            if item:
                # Normalize
                key = item.lower().strip()
                counts[key] = counts.get(key, 0) + 1
        
        sorted_items = sorted(counts.items(), key=lambda x: x[1], reverse=True)
        return [{"theme": k, "count": v} for k, v in sorted_items[:top_n]]
    
    async def _synthesize_report(self, aggregated: Dict, phase: str, jury_size: int) -> str:
        """Generate synthesis report using more capable model."""
        
        archetype_breakdown = "\n".join([
            f"- {arch}: Approve {v['approve']}, Conditional {v['conditional']}, Reject {v['reject']}"
            for arch, v in aggregated["by_archetype"].items()
        ])
        
        adoption_breakdown = "\n".join([
            f"- {stage}: Approve {v['approve']}, Conditional {v['conditional']}, Reject {v['reject']}"
            for stage, v in aggregated["by_adoption"].items()
        ])
        
        sample_feedback = "\n".join([
            f"[{f['archetype']}/{f['ai_adoption']}] {f['verdict']}: \"{f['feedback'][:200]}...\""
            for f in aggregated["sample_feedback"][:5]
        ])
        
        top_concerns = "\n".join([
            f"- {c['theme']} ({c['count']} mentions)"
            for c in aggregated["top_concerns"][:7]
        ])
        
        top_suggestions = "\n".join([
            f"- {s['theme']} ({s['count']} mentions)"
            for s in aggregated["top_suggestions"][:7]
        ])
        
        friction_points = "\n".join([
            f"- {f['theme']} ({f['count']} mentions)"
            for f in aggregated["friction_points"][:7]
        ])
        
        prompt = SYNTHESIS_PROMPT.format(
            jury_size=jury_size,
            phase=phase,
            total=aggregated["total"],
            approvals=aggregated["verdicts"]["approve"],
            approval_rate=aggregated["approval_rate"],
            conditional=aggregated["verdicts"]["conditional"],
            conditional_rate=aggregated["conditional_rate"],
            rejections=aggregated["verdicts"]["reject"],
            rejection_rate=aggregated["rejection_rate"],
            archetype_breakdown=archetype_breakdown,
            adoption_breakdown=adoption_breakdown,
            sample_feedback=sample_feedback,
            top_concerns=top_concerns,
            top_suggestions=top_suggestions,
            friction_points=friction_points,
        )
        
        response = await self.client.messages.create(
            model=self.config.synthesis_model,
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}]
        )
        
        return response.content[0].text
    
    async def evaluate(self, initiative_name: str, phase: str) -> Tuple[Dict, str]:
        """Run full jury evaluation on an initiative."""
        # Load initiative content
        initiative_path = self.pm_workspace / "initiatives" / initiative_name
        
        if phase == "research":
            content_file = initiative_path / "research.md"
        elif phase == "prd":
            content_file = initiative_path / "prd.md"
        elif phase == "prototype":
            content_file = initiative_path / "prototype-notes.md"
        else:
            content_file = initiative_path / f"{phase}.md"
        
        if not content_file.exists():
            raise FileNotFoundError(f"Content file not found: {content_file}")
        
        with open(content_file) as f:
            content = f.read()
        
        print(f"📋 Loaded {phase} content from {content_file}")
        
        # Sample jury
        jury = self._sample_jury()
        print(f"👥 Sampled {len(jury)} jury members (stratified)")
        
        # Count skeptics
        skeptics = len([j for j in jury if j.get("psychographics", {}).get("ai_adoption_stage") == "skeptic"])
        print(f"   - Including {skeptics} skeptics ({skeptics/len(jury)*100:.1f}%)")
        
        # Run evaluations
        print(f"🧪 Running {len(jury)} parallel evaluations...")
        results = await self._run_evaluations(jury, content, phase)
        
        # Aggregate
        print("📊 Aggregating results...")
        aggregated = self._aggregate_results(results)
        
        # Synthesize
        print("✍️ Generating synthesis report...")
        report = await self._synthesize_report(aggregated, phase, len(jury))
        
        return aggregated, report
    
    def save_results(self, initiative_name: str, phase: str, aggregated: Dict, report: str):
        """Save evaluation results to files."""
        output_dir = self.pm_workspace / "initiatives" / initiative_name / "jury-evaluations"
        output_dir.mkdir(parents=True, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        
        # Save raw aggregated data
        data_file = output_dir / f"{phase}-eval-{timestamp}.json"
        with open(data_file, "w") as f:
            json.dump(aggregated, f, indent=2)
        
        # Save report
        report_file = output_dir / f"{phase}-report-{timestamp}.md"
        with open(report_file, "w") as f:
            f.write(f"# Jury Evaluation Report: {initiative_name}\n\n")
            f.write(f"**Phase:** {phase}\n")
            f.write(f"**Date:** {datetime.now().isoformat()}\n")
            f.write(f"**Jury Size:** {aggregated['total']}\n\n")
            f.write("---\n\n")
            f.write(report)
        
        print(f"\n💾 Results saved:")
        print(f"   - Data: {data_file}")
        print(f"   - Report: {report_file}")
        
        return data_file, report_file


async def main():
    parser = argparse.ArgumentParser(description="Run jury evaluation on initiative")
    parser.add_argument("--initiative", required=True, help="Initiative name")
    parser.add_argument("--phase", required=True, choices=["research", "prd", "prototype"], help="Phase to evaluate")
    parser.add_argument("--jury-size", type=int, default=100, help="Number of jury members")
    parser.add_argument("--skeptics", type=float, default=0.20, help="Minimum skeptic percentage")
    
    args = parser.parse_args()
    
    if not ANTHROPIC_AVAILABLE:
        print("Error: anthropic package required. Run: pip install anthropic")
        return
    
    # Setup paths
    script_dir = Path(__file__).parent.parent.parent  # .pm-workspace
    personas_path = script_dir / "personas" / "generated" / "batch-2026-01-08" / "all-personas.json"
    
    config = JuryConfig(
        jury_size=args.jury_size,
        include_skeptics_percent=args.skeptics,
    )
    
    evaluator = JuryEvaluator(config, personas_path, script_dir)
    
    print(f"\n🏛️  CONDORCET JURY EVALUATION")
    print(f"=" * 50)
    print(f"Initiative: {args.initiative}")
    print(f"Phase: {args.phase}")
    print(f"Jury Size: {args.jury_size}")
    print(f"=" * 50)
    
    try:
        aggregated, report = await evaluator.evaluate(args.initiative, args.phase)
        evaluator.save_results(args.initiative, args.phase, aggregated, report)
        
        # Print summary
        print(f"\n📊 VERDICT SUMMARY")
        print(f"   ✅ Approve: {aggregated['verdicts']['approve']} ({aggregated['approval_rate']}%)")
        print(f"   ⚠️  Conditional: {aggregated['verdicts']['conditional']} ({aggregated['conditional_rate']}%)")
        print(f"   ❌ Reject: {aggregated['verdicts']['reject']} ({aggregated['rejection_rate']}%)")
        
    except FileNotFoundError as e:
        print(f"❌ Error: {e}")


if __name__ == "__main__":
    asyncio.run(main())

