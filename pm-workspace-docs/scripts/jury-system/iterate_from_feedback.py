#!/usr/bin/env python3
"""
Jury Feedback → Product Iteration Pipeline

Takes jury evaluation results and generates:
1. Research gaps to fill
2. PRD updates based on friction points
3. Prototype requirements addressing top concerns

Usage:
    python iterate_from_feedback.py --initiative hubspot-agent-config-ui
    python iterate_from_feedback.py --initiative hubspot-agent-config-ui --generate-all
"""

import json
import argparse
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional


def load_latest_evaluation(initiative_path: Path) -> Optional[Dict]:
    """Load the most recent jury evaluation for an initiative."""
    eval_dir = initiative_path / "jury-evaluations"
    if not eval_dir.exists():
        return None
    
    # Find latest eval file
    eval_files = list(eval_dir.glob("*-eval-*.json"))
    if not eval_files:
        return None
    
    latest = max(eval_files, key=lambda p: p.stat().st_mtime)
    
    with open(latest) as f:
        data = json.load(f)
    
    # Also load the report
    report_file = latest.parent / latest.name.replace("-eval-", "-report-").replace(".json", ".md")
    report_content = ""
    if report_file.exists():
        with open(report_file) as f:
            report_content = f.read()
    
    return {
        "data": data,
        "report": report_content,
        "file": str(latest),
    }


def analyze_feedback(eval_data: Dict) -> Dict:
    """Extract actionable insights from jury feedback."""
    data = eval_data["data"]
    
    # Categorize concerns by severity
    critical_concerns = []
    high_concerns = []
    medium_concerns = []
    
    for concern in data.get("top_concerns", []):
        count = concern.get("count", 0)
        if count >= data["total"] * 0.15:  # >15% mentioned
            critical_concerns.append(concern)
        elif count >= data["total"] * 0.10:  # >10% mentioned
            high_concerns.append(concern)
        else:
            medium_concerns.append(concern)
    
    # Identify archetype-specific issues
    archetype_issues = {}
    for arch, counts in data.get("by_archetype", {}).items():
        total = sum(counts.values())
        pass_rate = (counts.get("approve", 0) + counts.get("conditional", 0)) / total * 100 if total > 0 else 0
        if pass_rate < 50:
            archetype_issues[arch] = {
                "pass_rate": round(pass_rate, 1),
                "needs_attention": True,
            }
    
    # Identify adoption stage gaps
    adoption_gaps = {}
    for stage, counts in data.get("by_adoption", {}).items():
        total = sum(counts.values())
        pass_rate = (counts.get("approve", 0) + counts.get("conditional", 0)) / total * 100 if total > 0 else 0
        if pass_rate < 40:
            adoption_gaps[stage] = {
                "pass_rate": round(pass_rate, 1),
                "needs_targeted_research": True,
            }
    
    return {
        "verdict": "PASS" if data.get("approval_rate", 0) + data.get("conditional_rate", 0) >= 60 else "FAIL",
        "combined_rate": data.get("approval_rate", 0) + data.get("conditional_rate", 0),
        "critical_concerns": critical_concerns,
        "high_concerns": high_concerns,
        "medium_concerns": medium_concerns,
        "top_suggestions": data.get("top_suggestions", [])[:7],
        "friction_points": data.get("friction_points", [])[:5],
        "archetype_issues": archetype_issues,
        "adoption_gaps": adoption_gaps,
        "sample_feedback": data.get("sample_feedback", []),
    }


def generate_research_gaps(analysis: Dict, initiative_name: str) -> str:
    """Generate research questions to address gaps."""
    
    content = f"""# Research Gaps: {initiative_name}

Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}
Based on: Jury Evaluation ({analysis['combined_rate']:.1f}% combined pass rate)

---

## Summary

The jury evaluation identified several gaps in our understanding. This document outlines targeted research to address them.

## Critical Research Needs

"""
    
    # Add adoption gap research
    if analysis["adoption_gaps"]:
        content += "### Adoption Stage Deep Dives\n\n"
        for stage, info in analysis["adoption_gaps"].items():
            content += f"**{stage.title()} Users ({info['pass_rate']}% pass rate)**\n\n"
            if stage == "skeptic":
                content += """Research questions:
1. What specific past experiences have made you skeptical of AI tools?
2. What would it take to earn your trust with a new AI tool?
3. What's the minimum proof you need before trying something new?
4. What's your biggest fear about AI in your workflow?

Interview targets: 5-7 users who self-identify as skeptical of AI

"""
            elif stage == "curious":
                content += """Research questions:
1. What's holding you back from adopting AI tools more fully?
2. What would make you feel confident to try this?
3. Who would you need buy-in from to adopt a new tool?
4. What's your ideal onboarding experience?

Interview targets: 5-7 users in evaluation/consideration phase

"""
    
    # Add archetype-specific research
    if analysis["archetype_issues"]:
        content += "### Archetype-Specific Research\n\n"
        for arch, info in analysis["archetype_issues"].items():
            content += f"**{arch.replace('-', ' ').title()} ({info['pass_rate']}% pass rate)**\n\n"
            content += f"""This archetype is underperforming. Research needed:
1. What specific workflows does this archetype have that we're not addressing?
2. What competing tools are they currently using?
3. What would make them switch from their current solution?
4. What's unique about their day-to-day that we're missing?

Interview targets: 3-5 {arch.replace('-', ' ')} users

"""
    
    # Add concern-driven research
    content += "### Concern-Driven Research\n\n"
    for concern in analysis["critical_concerns"][:3]:
        content += f"**\"{concern['theme']}\" ({concern['count']} mentions)**\n\n"
        content += f"""This is a top concern. Research needed:
- Observe users encountering this in current tools
- Understand the root cause of this concern
- Identify existing workarounds users employ
- Test potential solutions in concept validation

"""
    
    content += """---

## Research Methods

| Method | Target | Timeline |
|--------|--------|----------|
| User Interviews | 10-15 users | 1-2 weeks |
| Competitive Analysis | Top 3 competitors | 3 days |
| Usability Testing | 5 users per variant | 1 week |
| Survey | 100+ responses | 1 week |

## Next Steps

1. Schedule interviews with users from underperforming segments
2. Create interview guides based on questions above
3. Conduct competitive analysis on friction points
4. Re-run jury evaluation after research synthesis

"""
    
    return content


def generate_prd_updates(analysis: Dict, initiative_name: str) -> str:
    """Generate PRD amendments based on jury feedback."""
    
    content = f"""# PRD Amendments: {initiative_name}

Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}
Based on: Jury Evaluation ({analysis['combined_rate']:.1f}% combined pass rate)

---

## Amendment Summary

The jury evaluation surfaced critical gaps in our current PRD. This document provides specific additions and changes.

## Must-Add Requirements (Critical Friction)

"""
    
    # Convert friction points to requirements
    for i, friction in enumerate(analysis["friction_points"][:5], 1):
        content += f"""### FR-{i}: Address "{friction['theme']}"

**Priority:** P0 (Critical)
**Mentions:** {friction['count']} personas flagged this as abandonment trigger

**Requirement:**
"""
        # Generate specific requirement based on friction type
        theme = friction['theme'].lower()
        if "rollback" in theme:
            content += """- System MUST provide one-click rollback for any automated action
- Users MUST be able to undo changes within 30 days
- Rollback MUST restore exact previous state without data loss
- Show clear "Undo" option after every automated action

**Acceptance Criteria:**
- [ ] Rollback available for all sync operations
- [ ] Rollback completes in <5 seconds
- [ ] Rollback confirmation shows exactly what will be restored
- [ ] Audit log captures all rollback actions

"""
        elif "integration" in theme:
            content += """- System MUST integrate with user's existing tool stack without disruption
- Integration MUST be bi-directional where applicable
- Users MUST be able to configure integration granularity
- Provide clear status indicators for all integrations

**Acceptance Criteria:**
- [ ] Native integrations for Salesforce, HubSpot, Slack
- [ ] Webhook support for custom integrations
- [ ] Integration health dashboard
- [ ] Automatic retry with user notification on failure

"""
        elif "compliance" in theme or "security" in theme:
            content += """- System MUST meet enterprise security requirements
- Provide clear documentation of data handling
- Users MUST be able to control what data is captured/stored
- Support for compliance frameworks (SOC2, GDPR, HIPAA where applicable)

**Acceptance Criteria:**
- [ ] SSO/SAML support
- [ ] Role-based access controls
- [ ] Data retention policies
- [ ] Audit logs for all data access

"""
        elif "config" in theme or "complexity" in theme:
            content += """- Configuration MUST be achievable in <10 minutes for basic setup
- Provide pre-built templates for common use cases
- Guided wizard for first-time configuration
- Progressive disclosure - show advanced options only when needed

**Acceptance Criteria:**
- [ ] 3 or fewer steps for basic configuration
- [ ] Template library with 5+ pre-built configs
- [ ] Contextual help at every step
- [ ] Preview of configuration effects before applying

"""
        elif "testing" in theme or "preview" in theme:
            content += """- Users MUST be able to preview/test changes before applying to production
- Provide sandbox environment for experimentation
- Show simulated outcomes before executing
- Clear visual diff of what will change

**Acceptance Criteria:**
- [ ] Preview mode available for all configurations
- [ ] Sandbox with sample data included
- [ ] Side-by-side comparison of before/after
- [ ] Test mode that logs without executing

"""
        else:
            content += f"""- Address this concern through UX and feature improvements
- Conduct targeted research to understand root cause
- Validate solution with affected user segment

**Acceptance Criteria:**
- [ ] Concern addressed in design
- [ ] Validated with 5+ users from affected segment
- [ ] Re-test with jury shows improvement

"""
    
    # Add suggestion-driven features
    content += """## Should-Add Features (Top Suggestions)

"""
    for i, suggestion in enumerate(analysis["top_suggestions"][:5], 1):
        content += f"""### SF-{i}: "{suggestion['theme']}"

**Priority:** P1 (High)
**Mentions:** {suggestion['count']} personas requested this

"""
    
    # Add persona-specific amendments
    content += """## Persona-Specific Requirements

"""
    
    for arch, info in analysis.get("archetype_issues", {}).items():
        content += f"""### For {arch.replace('-', ' ').title()} (Currently {info['pass_rate']}% pass rate)

- Add targeted value proposition in onboarding
- Surface features most relevant to this persona first
- Consider dedicated workflow/view for this user type
- Validate all changes with this segment before release

"""
    
    content += """---

## Amendment Tracking

| Amendment | Status | Owner | Target Date |
|-----------|--------|-------|-------------|
"""
    for i in range(1, min(6, len(analysis["friction_points"]) + 1)):
        content += f"| FR-{i} | Pending | TBD | TBD |\n"
    
    content += """

## Re-Validation Plan

After implementing amendments:
1. Re-run jury evaluation with same 1000 personas
2. Target: >70% combined pass rate
3. Target: >30% pass rate for currently-failing segments
4. If not met, iterate again

"""
    
    return content


def generate_prototype_spec(analysis: Dict, initiative_name: str) -> str:
    """Generate prototype specifications addressing feedback."""
    
    content = f"""# Prototype Specification: {initiative_name}

Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}
Based on: Jury Evaluation ({analysis['combined_rate']:.1f}% combined pass rate)

---

## Prototype Goals

Address the top friction points identified by the jury to improve adoption across all user segments.

## Critical UI/UX Requirements

"""
    
    # Generate specific UI requirements from friction
    for friction in analysis["friction_points"][:3]:
        theme = friction['theme'].lower()
        content += f"""### Addressing: "{friction['theme']}"

"""
        if "rollback" in theme:
            content += """**Component: Undo/Rollback System**

```
┌─────────────────────────────────────────────────────┐
│  ✓ Synced 5 fields to HubSpot                       │
│                                                     │
│  [View Changes]  [Undo All]  [Dismiss]              │
│                                                     │
│  Undo available for 30 days                         │
└─────────────────────────────────────────────────────┘
```

- Toast notification after every action
- Prominent "Undo" button (not buried in menu)
- Time-limited undo window clearly displayed
- Activity history with per-item undo option

"""
        elif "integration" in theme:
            content += """**Component: Integration Status Dashboard**

```
┌─────────────────────────────────────────────────────┐
│  Connected Integrations                             │
├─────────────────────────────────────────────────────┤
│  🟢 HubSpot     Last sync: 2 min ago    [Settings]  │
│  🟡 Salesforce  Syncing...              [View]      │
│  ⚪ Slack       Not connected           [Connect]   │
└─────────────────────────────────────────────────────┘
```

- Real-time status indicators
- Clear connection state (connected/syncing/error/not connected)
- Easy access to integration settings
- Error details when sync fails

"""
        elif "config" in theme or "complexity" in theme:
            content += """**Component: Guided Configuration Wizard**

```
Step 1 of 3: Choose Your Template
┌─────────────────────────────────────────────────────┐
│  📋 Sales Team Starter                              │
│  Syncs: call notes, next steps, deal updates        │
│  Best for: Sales teams new to automation            │
│  [Select]                                           │
├─────────────────────────────────────────────────────┤
│  🎯 Custom Configuration                            │
│  Full control over what syncs and when              │
│  Best for: Power users with specific needs          │
│  [Select]                                           │
└─────────────────────────────────────────────────────┘
```

- Template-first approach (reduce cognitive load)
- Progressive disclosure (hide advanced unless requested)
- Clear descriptions of what each option does
- "Recommended" badge for most popular choice

"""
        elif "testing" in theme or "preview" in theme:
            content += """**Component: Preview/Test Mode**

```
┌─────────────────────────────────────────────────────┐
│  🧪 Test Mode Active                                │
├─────────────────────────────────────────────────────┤
│  Preview: What would sync from last meeting         │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Field          │ Current     │ Would Sync   │   │
│  │ Deal Stage     │ Discovery   │ Demo         │   │
│  │ Next Step      │ -           │ Send proposal│   │
│  │ Close Date     │ Jan 15      │ Jan 22       │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  [Run Test]  [Edit Rules]  [Go Live]               │
└─────────────────────────────────────────────────────┘
```

- Side-by-side before/after comparison
- Dry-run mode that shows but doesn't execute
- Clear "Test" vs "Live" mode indicators
- Easy transition from test to production

"""
        elif "compliance" in theme or "security" in theme:
            content += """**Component: Privacy & Compliance Controls**

```
┌─────────────────────────────────────────────────────┐
│  🔒 Privacy Settings                                │
├─────────────────────────────────────────────────────┤
│  ☑️ Record external meetings                        │
│  ☐ Record internal meetings                         │
│  ☐ Transcribe audio (stores transcript)            │
│                                                     │
│  Data Retention: [30 days ▼]                        │
│                                                     │
│  Compliance: SOC2 Type II certified                 │
│  [View Security Documentation]                      │
└─────────────────────────────────────────────────────┘
```

- Granular control over what's captured
- Clear indication of what's stored vs processed
- Easy access to compliance documentation
- Admin-level controls for organization

"""
        else:
            content += f"""**Component: Address "{friction['theme']}"**

- Research specific UX patterns that address this concern
- Validate with users from affected segment
- A/B test solutions before full rollout

"""
    
    # Add skeptic-specific UI considerations
    content += """## Skeptic-Friendly Design Patterns

Based on 18% pass rate among skeptics, implement these patterns:

### 1. Transparency First
- Show exactly what AI will do before it does it
- Explain reasoning in plain language
- Never auto-execute without preview

### 2. Easy Exit Ramps
- Pause/resume at any time
- Disable individual features without affecting others
- "Turn off AI" panic button always visible

### 3. Proof Before Trust
- Show success metrics from similar users
- Provide trial period with full features
- Display error rates and accuracy statistics

### 4. Human Override
- Manual approval option for all actions
- Batch review before sync
- Clear "I'll do this myself" alternatives

"""
    
    # Add Storybook stories to create
    content += """## Storybook Stories to Create

```typescript
// Stories to implement in elephant-ai/web/src/components/prototypes/

export default {
  title: 'Prototypes/JuryFeedback',
};

// Core stories addressing friction
export const UndoRollbackToast = () => <UndoToast />;
export const IntegrationStatusDashboard = () => <IntegrationStatus />;
export const ConfigurationWizard = () => <ConfigWizard />;
export const PreviewTestMode = () => <PreviewMode />;
export const PrivacyControls = () => <PrivacySettings />;

// Skeptic-specific stories
export const TransparencyPreview = () => <ActionPreview />;
export const PauseResumeControls = () => <PauseResume />;
export const ManualApprovalFlow = () => <ManualApproval />;
```

## Validation Plan

After building prototypes:
1. Run visual jury evaluation with prototype screenshots
2. Target: >50% pass rate among skeptics (up from 18%)
3. Target: >75% overall combined pass rate
4. If not met, iterate on specific components

"""
    
    return content


def save_iteration_docs(initiative_path: Path, research: str, prd: str, prototype: str):
    """Save all iteration documents."""
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    
    # Create iteration folder
    iteration_dir = initiative_path / "iterations" / f"iter-{timestamp}"
    iteration_dir.mkdir(parents=True, exist_ok=True)
    
    # Save documents
    (iteration_dir / "research-gaps.md").write_text(research)
    (iteration_dir / "prd-amendments.md").write_text(prd)
    (iteration_dir / "prototype-spec.md").write_text(prototype)
    
    # Create summary
    summary = f"""# Iteration Summary

Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}

## Documents Created

1. **Research Gaps** - `research-gaps.md`
   - Targeted research questions for underperforming segments
   - Interview guides for skeptic and archetype-specific research

2. **PRD Amendments** - `prd-amendments.md`
   - P0 requirements addressing critical friction
   - P1 features from top suggestions
   - Persona-specific requirements

3. **Prototype Spec** - `prototype-spec.md`
   - UI component specifications
   - Skeptic-friendly design patterns
   - Storybook stories to create

## Recommended Workflow

1. **Week 1-2:** Conduct research from `research-gaps.md`
2. **Week 2-3:** Update main PRD with amendments
3. **Week 3-4:** Build prototypes per spec
4. **Week 4:** Re-run jury evaluation to validate improvements

## Success Criteria

- Overall pass rate: ≥70% (up from current)
- Skeptic pass rate: ≥30% (up from 18%)
- All critical friction points addressed
"""
    
    (iteration_dir / "README.md").write_text(summary)
    
    return iteration_dir


def main():
    parser = argparse.ArgumentParser(description="Generate iteration docs from jury feedback")
    parser.add_argument("--initiative", required=True, help="Initiative name")
    parser.add_argument("--generate-all", action="store_true", help="Generate all documents")
    
    args = parser.parse_args()
    
    # Setup paths
    script_dir = Path(__file__).parent.parent.parent  # .pm-workspace
    initiative_path = script_dir / "initiatives" / args.initiative
    
    if not initiative_path.exists():
        print(f"❌ Initiative not found: {args.initiative}")
        return
    
    print(f"\n📊 JURY FEEDBACK → PRODUCT ITERATION")
    print(f"=" * 50)
    print(f"Initiative: {args.initiative}")
    print(f"=" * 50)
    
    # Load evaluation
    eval_data = load_latest_evaluation(initiative_path)
    if not eval_data:
        print("❌ No jury evaluation found. Run evaluation first:")
        print(f"   python simulate_jury.py --initiative {args.initiative} --phase research")
        return
    
    print(f"📁 Loaded evaluation: {eval_data['file']}")
    
    # Analyze feedback
    analysis = analyze_feedback(eval_data)
    print(f"\n📈 Analysis Summary:")
    print(f"   Verdict: {analysis['verdict']} ({analysis['combined_rate']:.1f}% combined)")
    print(f"   Critical concerns: {len(analysis['critical_concerns'])}")
    print(f"   Archetype issues: {len(analysis['archetype_issues'])}")
    print(f"   Adoption gaps: {len(analysis['adoption_gaps'])}")
    
    # Generate documents
    print(f"\n📝 Generating iteration documents...")
    
    research = generate_research_gaps(analysis, args.initiative)
    prd = generate_prd_updates(analysis, args.initiative)
    prototype = generate_prototype_spec(analysis, args.initiative)
    
    # Save
    iteration_dir = save_iteration_docs(initiative_path, research, prd, prototype)
    
    print(f"\n✅ Iteration documents saved to:")
    print(f"   {iteration_dir}")
    print(f"\n📄 Files created:")
    print(f"   - research-gaps.md")
    print(f"   - prd-amendments.md")
    print(f"   - prototype-spec.md")
    print(f"   - README.md (workflow summary)")
    
    print(f"\n🔄 Next Steps:")
    print(f"   1. Review research-gaps.md and schedule user interviews")
    print(f"   2. Update main PRD with prd-amendments.md")
    print(f"   3. Build prototypes per prototype-spec.md")
    print(f"   4. Re-run: python simulate_jury.py --initiative {args.initiative}")


if __name__ == "__main__":
    main()

