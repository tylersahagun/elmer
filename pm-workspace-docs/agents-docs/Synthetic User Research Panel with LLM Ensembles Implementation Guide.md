

**Bottom line up front**: Building a synthetic user research panel using LLM ensemble methods is practical and cost-effective at scale. The optimal architecture combines **stratified persona generation** (using Verbalized Sampling to avoid mode collapse), **structured prototype evaluation** (with persona role-playing and Nielsen heuristics), **majority voting aggregation** (which outperforms debate in most cases), and **Cursor slash commands** for orchestration. For 1,000 personas evaluating a prototype, expect costs of **$1.50-5.00 per evaluation run** using model tiering (Haiku for personas, Sonnet for aggregation).

The research reveals a critical insight: **simple majority voting accounts for most performance gains** typically attributed to complex multi-agent debate systems. This simplifies implementation considerably while maintaining signal quality.

---

## System architecture overview

The synthetic panel system follows a four-layer architecture designed for implementation as Cursor slash commands with file-based workflows:

```
┌─────────────────────────────────────────────────────────────────┐
│                    CURSOR ORCHESTRATION LAYER                    │
│  .cursor/commands/  →  /generate-panel  /evaluate  /aggregate   │
└─────────────────────────────────────────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ PERSONA LAYER   │    │ EVALUATION LAYER│    │ AGGREGATION     │
│ 100-3000 agents │    │ Prototype eval  │    │ LAYER           │
│ Claude Haiku    │    │ Heuristic rubric│    │ Voting/MoA      │
│ $0.80/1M tokens │    │ Claude Haiku    │    │ Claude Sonnet   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                       FILE STORAGE LAYER                         │
│  personas/*.json  │  evaluations/*.json  │  results/*.json      │
└─────────────────────────────────────────────────────────────────┘
```

The system operates entirely through local files and Cursor's agent infrastructure, requiring no external orchestration services.

---

## Persona generation from conversation data

### Extraction pipeline for real transcripts

The persona extraction process converts raw customer conversation transcripts into structured persona attributes through a three-stage pipeline:

**Stage 1: Attribute extraction** — Process each transcript to identify demographics, goals, pain points, and behavioral patterns. Use chunking for long transcripts (target 125-150 tokens per minute of conversation).

```python
TRANSCRIPT_EXTRACTION_PROMPT = """
Analyze this customer conversation transcript and extract:

1. ROLE INDICATORS: Job title, department, seniority signals
2. COMPANY CONTEXT: Size indicators, industry, tech maturity
3. GOALS EXPRESSED: What outcomes does this person want?
4. PAIN POINTS: Frustrations, complaints, current workarounds
5. TECHNICAL PROFICIENCY: How comfortable with technology?
6. DECISION AUTHORITY: End user, influencer, or buyer?
7. COMMUNICATION STYLE: Analytical, driver, amiable, or expressive?
8. DIRECT QUOTES: 2-3 representative quotes in their voice

Transcript:
{transcript}

Return as JSON matching the PersonaAttributes schema.
"""
```

**Stage 2: Clustering** — Group similar extracted attributes using embeddings and hierarchical clustering. Target **8-15 persona archetypes** from your transcript corpus, representing distinct user segments.

**Stage 3: Synthetic expansion** — Use the Persona Hub methodology to expand from archetypes to diverse individual personas. The key technique is **Persona-to-Persona expansion**: generate related personas (colleagues, managers, competitors) from each archetype.

### Avoiding mode collapse at scale

The critical challenge when generating 1,000+ personas is mode collapse—all personas converging to a generic "helpful professional" archetype. Research identifies **Verbalized Sampling** as the most effective countermeasure, achieving **1.6-2.1x diversity improvement** over direct prompting.

```python
VERBALIZED_SAMPLING_PROMPT = """
Generate 5 distinct user personas for a meeting recording/AI analysis tool.
Each persona must have probability < 0.10 (sample from distribution tails).

<response>
<text>[Full persona in JSON format]</text>
<probability>0.08</probability>
</response>

DIVERSITY REQUIREMENTS:
- Attitude toward AI: Include skeptics and resisters, not just enthusiasts
- Company maturity: From 10-person startup to 10,000-employee enterprise
- Primary motivation: Efficiency, revenue growth, compliance, or career advancement
- Technical comfort: From "barely uses email" to "builds custom integrations"

Sample from TAIL distributions - include edge cases and unconventional combinations.
Previous personas generated (avoid similarity): {previous_personas}
"""
```

Additional anti-mode-collapse techniques:
- **Temperature variation**: Use 0.8-1.2 for persona generation
- **Explicit negative traits**: Instruct the model to include skeptics, late adopters, and frustrated users
- **Stratified generation**: Pre-define dimension combinations and generate within each cell
- **Persona-to-persona expansion**: Generate colleagues, reports, and counterparts

### JSON schema for revenue team personas

The schema balances comprehensiveness with practical utility for evaluation tasks:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "B2BSaaSPersona",
  "type": "object",
  "required": ["id", "demographics", "firmographics", "role", "goals", "painPoints", "technicalProficiency"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^persona_[a-z0-9]{8}$"
    },
    "demographics": {
      "type": "object",
      "properties": {
        "name": {"type": "string"},
        "age": {"type": "integer", "minimum": 22, "maximum": 65},
        "location": {"type": "string"},
        "yearsExperience": {"type": "integer"}
      }
    },
    "firmographics": {
      "type": "object",
      "properties": {
        "companySize": {"enum": ["1-50", "51-200", "201-1000", "1000+"]},
        "industry": {"type": "string"},
        "fundingStage": {"enum": ["bootstrapped", "seed", "series-a", "series-b", "series-c+", "public"]},
        "salesTeamSize": {"type": "integer"},
        "techStack": {"type": "array", "items": {"type": "string"}}
      }
    },
    "role": {
      "type": "object",
      "properties": {
        "title": {"type": "string"},
        "department": {"enum": ["sales", "customer-success", "revenue-operations", "sales-enablement", "executive"]},
        "seniority": {"enum": ["individual-contributor", "manager", "director", "vp", "c-suite"]},
        "decisionAuthority": {"enum": ["end-user", "influencer", "champion", "economic-buyer", "technical-validator"]}
      }
    },
    "goals": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "goal": {"type": "string"},
          "priority": {"enum": ["primary", "secondary", "tertiary"]},
          "successMetrics": {"type": "array", "items": {"type": "string"}}
        }
      },
      "minItems": 2,
      "maxItems": 4
    },
    "painPoints": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "description": {"type": "string"},
          "severity": {"enum": ["low", "medium", "high", "critical"]},
          "currentWorkaround": {"type": "string"}
        }
      },
      "minItems": 2,
      "maxItems": 5
    },
    "technicalProficiency": {
      "type": "object",
      "properties": {
        "level": {"enum": ["novice", "intermediate", "advanced", "expert"]},
        "aiAdoptionStage": {"enum": ["skeptic", "curious", "early-adopter", "power-user"]},
        "toolsUsed": {"type": "array", "items": {"type": "string"}}
      }
    },
    "personality": {
      "type": "object",
      "properties": {
        "communicationStyle": {"enum": ["analytical", "driver", "amiable", "expressive"]},
        "riskTolerance": {"enum": ["risk-averse", "moderate", "risk-tolerant"]},
        "changeReadiness": {"enum": ["resistant", "cautious", "open", "eager"]}
      }
    },
    "voiceQuotes": {
      "type": "array",
      "items": {"type": "string"},
      "minItems": 2,
      "maxItems": 3,
      "description": "Representative quotes in persona's authentic voice"
    },
    "dayInLife": {
      "type": "string",
      "description": "100-word narrative of typical workday"
    }
  }
}
```

### Stratified generation for 1,000 personas

To ensure coverage across your target market, define a stratification matrix:

```python
STRATIFICATION_DIMENSIONS = {
    "role": ["SDR", "AE", "CSM", "Sales Manager", "VP Sales", "RevOps"],
    "company_size": ["1-50", "51-200", "201-1000", "1000+"],
    "tech_proficiency": ["novice", "intermediate", "advanced"],
    "ai_adoption": ["skeptic", "curious", "early-adopter", "power-user"]
}

# Generate target distribution (adjust weights based on your ICP)
def generate_stratified_targets(total_personas: int = 1000) -> dict:
    targets = {}
    for role in STRATIFICATION_DIMENSIONS["role"]:
        for size in STRATIFICATION_DIMENSIONS["company_size"]:
            for tech in STRATIFICATION_DIMENSIONS["tech_proficiency"]:
                for ai in STRATIFICATION_DIMENSIONS["ai_adoption"]:
                    # Weight toward your ICP (example: favor mid-market AEs)
                    weight = calculate_weight(role, size, tech, ai)
                    targets[(role, size, tech, ai)] = int(total_personas * weight)
    return targets
```

---

## Scenario and context representation

### JSON structure for evaluation scenarios

Scenarios define the context in which personas evaluate prototypes—what task they're trying to accomplish and under what conditions:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "EvaluationScenario",
  "type": "object",
  "required": ["id", "name", "task", "context", "successCriteria"],
  "properties": {
    "id": {"type": "string"},
    "name": {"type": "string"},
    "description": {"type": "string"},
    "task": {
      "type": "object",
      "properties": {
        "primaryGoal": {"type": "string"},
        "steps": {"type": "array", "items": {"type": "string"}},
        "expectedDuration": {"type": "string"},
        "difficulty": {"enum": ["easy", "moderate", "complex"]}
      }
    },
    "context": {
      "type": "object",
      "properties": {
        "timeOfDay": {"type": "string"},
        "deviceType": {"enum": ["desktop", "mobile", "tablet"]},
        "environment": {"type": "string"},
        "interruptionLevel": {"enum": ["none", "occasional", "frequent"]},
        "priorExperience": {"type": "string"}
      }
    },
    "successCriteria": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "criterion": {"type": "string"},
          "measurement": {"type": "string"},
          "threshold": {"type": "string"}
        }
      }
    },
    "relevantPersonaAttributes": {
      "type": "array",
      "items": {"type": "string"},
      "description": "Which persona dimensions matter most for this scenario"
    }
  }
}
```

### Example scenario for AskElephant

```json
{
  "id": "scenario_meeting_review",
  "name": "Post-meeting action item review",
  "description": "User returns to review AI-generated action items from a customer call",
  "task": {
    "primaryGoal": "Verify AI-extracted action items are accurate and add to CRM",
    "steps": [
      "Open meeting recording from notification",
      "Review AI-generated summary",
      "Verify action items are correct",
      "Edit any incorrect items",
      "Push to Salesforce with one click"
    ],
    "expectedDuration": "2-3 minutes",
    "difficulty": "easy"
  },
  "context": {
    "timeOfDay": "Between back-to-back meetings",
    "deviceType": "desktop",
    "environment": "Open office, some distractions",
    "interruptionLevel": "occasional",
    "priorExperience": "Has used product for 2 weeks"
  },
  "successCriteria": [
    {
      "criterion": "Task completion",
      "measurement": "Can complete full flow",
      "threshold": "100% of steps achievable"
    },
    {
      "criterion": "Time efficiency",
      "measurement": "Perceived time to complete",
      "threshold": "Under 3 minutes"
    },
    {
      "criterion": "Confidence",
      "measurement": "Trust in AI accuracy",
      "threshold": "Would use without double-checking source"
    }
  ],
  "relevantPersonaAttributes": ["technicalProficiency", "aiAdoptionStage", "timeConstraints"]
}
```

### Representing prototypes for LLM evaluation

LLMs can evaluate three prototype formats, each requiring different representation strategies:

**Figma designs / Screenshots** — Use GPT-4V or Claude's vision capabilities. Annotate screenshots with numbered element labels for precise feedback:

```json
{
  "prototypeType": "figma_screenshot",
  "format": "annotated_image",
  "imageUrl": "./prototypes/dashboard_v2.png",
  "elementAnnotations": [
    {"id": "1", "type": "button", "label": "Review Meeting", "location": "top-right"},
    {"id": "2", "type": "card", "label": "AI Summary Card", "location": "center"},
    {"id": "3", "type": "list", "label": "Action Items List", "location": "below-summary"}
  ],
  "interactionNotes": "Clicking element 1 expands the full transcript"
}
```

**Written specifications** — Structure as user flow narratives with explicit UI descriptions:

```markdown
## Screen: Meeting Dashboard

**Header**: Shows meeting title, date, participants (avatars), duration
**Primary Action**: "Review AI Summary" button (blue, prominent)

**AI Summary Card**:
- 3-bullet executive summary
- Confidence indicator (high/medium/low)
- "See full transcript" link

**Action Items Section**:
- Checklist format with assignee avatars
- Each item has: checkbox, description, assignee dropdown, due date
- "Push to Salesforce" button at bottom
```

**Functional prototypes** — Describe as state-transition sequences:

```json
{
  "prototypeType": "functional",
  "screens": [
    {
      "id": "dashboard",
      "description": "Main dashboard showing recent meetings",
      "elements": ["meeting_list", "search_bar", "filter_dropdown"],
      "actions": {"click_meeting": "opens meeting_detail"}
    },
    {
      "id": "meeting_detail",
      "description": "Individual meeting view with AI analysis",
      "elements": ["summary_card", "action_items", "transcript_panel"],
      "actions": {"click_push_to_crm": "shows confirmation_modal"}
    }
  ]
}
```

---

## Prototype evaluation framework

### Persona role-playing prompt architecture

The evaluation prompt uses a **two-stage approach**: establish persona context deeply, then present the evaluation task. Research shows directly specifying roles (not "imagine you are...") produces better results.

```python
PERSONA_EVALUATION_SYSTEM_PROMPT = """
You ARE {persona.demographics.name}, a {persona.role.title} at a {persona.firmographics.companySize} employee {persona.firmographics.industry} company.

YOUR REALITY:
- Technical comfort: {persona.technicalProficiency.level}
- AI attitude: {persona.technicalProficiency.aiAdoptionStage}
- Communication style: {persona.personality.communicationStyle}
- Change readiness: {persona.personality.changeReadiness}

YOUR GOALS:
{format_goals(persona.goals)}

YOUR FRUSTRATIONS:
{format_pain_points(persona.painPoints)}

YOUR VOICE (speak like this):
{format_quotes(persona.voiceQuotes)}

You are evaluating a product prototype. Respond ONLY from this persona's authentic perspective. Your technical limitations, skepticism, time constraints, and frustrations are REAL. Do not break character.
"""

EVALUATION_USER_PROMPT = """
SCENARIO: {scenario.description}
YOUR TASK: {scenario.task.primaryGoal}
CONTEXT: {scenario.context.environment}, {scenario.context.interruptionLevel} interruptions

PROTOTYPE:
{prototype_description}

Evaluate this prototype as {persona.demographics.name}. Be authentic to your persona's limitations and frustrations.

Provide your evaluation:

1. FIRST IMPRESSION (in your voice, 2-3 sentences):
   What do you notice? What confuses you?

2. TASK WALKTHROUGH:
   - Step by step, how would you attempt {scenario.task.primaryGoal}?
   - Where do you hesitate or feel uncertain?
   - At what point might you give up?

3. HEURISTIC SCORES (1-5, where 1=unusable, 5=excellent):
   - Visibility of system status: [score] - [brief justification]
   - Match with your expectations: [score] - [brief justification]
   - User control and freedom: [score] - [brief justification]
   - Consistency: [score] - [brief justification]
   - Error prevention: [score] - [brief justification]

4. SPECIFIC ISSUES (list each):
   - What: [description]
   - Where: [UI element]
   - Severity: [cosmetic/minor/major/catastrophic]
   - Why it matters TO YOU: [persona-specific impact]

5. EMOTIONAL RESPONSE:
   - Frustration (1-5): [score]
   - Confidence in completing task (1-5): [score]
   - Likelihood to recommend (1-5): [score]

6. VERDICT:
   Would you use this product? Why or why not?
"""
```

### Structured evaluation output schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PersonaEvaluation",
  "type": "object",
  "required": ["personaId", "prototypeId", "scenarioId", "heuristicScores", "issues", "emotionalResponse"],
  "properties": {
    "personaId": {"type": "string"},
    "prototypeId": {"type": "string"},
    "scenarioId": {"type": "string"},
    "timestamp": {"type": "string", "format": "date-time"},
    "firstImpression": {"type": "string"},
    "taskWalkthrough": {
      "type": "object",
      "properties": {
        "stepsAttempted": {"type": "array", "items": {"type": "string"}},
        "hesitationPoints": {"type": "array", "items": {"type": "string"}},
        "abandonmentRisk": {"enum": ["low", "medium", "high"]},
        "abandonmentPoint": {"type": "string"}
      }
    },
    "heuristicScores": {
      "type": "object",
      "properties": {
        "visibilityOfSystemStatus": {"$ref": "#/$defs/heuristicScore"},
        "matchWithExpectations": {"$ref": "#/$defs/heuristicScore"},
        "userControlAndFreedom": {"$ref": "#/$defs/heuristicScore"},
        "consistency": {"$ref": "#/$defs/heuristicScore"},
        "errorPrevention": {"$ref": "#/$defs/heuristicScore"},
        "recognitionOverRecall": {"$ref": "#/$defs/heuristicScore"},
        "flexibilityAndEfficiency": {"$ref": "#/$defs/heuristicScore"},
        "aestheticAndMinimalist": {"$ref": "#/$defs/heuristicScore"},
        "errorRecovery": {"$ref": "#/$defs/heuristicScore"},
        "helpAndDocumentation": {"$ref": "#/$defs/heuristicScore"}
      }
    },
    "issues": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {"type": "string"},
          "description": {"type": "string"},
          "location": {"type": "string"},
          "severity": {"enum": ["cosmetic", "minor", "major", "catastrophic"]},
          "severityScore": {"type": "integer", "minimum": 1, "maximum": 4},
          "heuristicViolated": {"type": "string"},
          "personaImpact": {"type": "string"},
          "recommendation": {"type": "string"}
        }
      }
    },
    "emotionalResponse": {
      "type": "object",
      "properties": {
        "frustration": {"type": "integer", "minimum": 1, "maximum": 5},
        "confidence": {"type": "integer", "minimum": 1, "maximum": 5},
        "likelihood_to_recommend": {"type": "integer", "minimum": 1, "maximum": 5}
      }
    },
    "verdict": {
      "type": "object",
      "properties": {
        "wouldUse": {"type": "boolean"},
        "reasoning": {"type": "string"}
      }
    },
    "rawFeedback": {"type": "string"}
  },
  "$defs": {
    "heuristicScore": {
      "type": "object",
      "properties": {
        "score": {"type": "integer", "minimum": 1, "maximum": 5},
        "justification": {"type": "string"}
      }
    }
  }
}
```

---

## Voting and aggregation layer

### Why majority voting beats debate

Research from 2025 demonstrates that **majority voting alone accounts for most performance gains** typically attributed to multi-agent debate. On benchmarks like GSM8K, pure voting achieves **94.0%** accuracy versus **87.8%** for 5-round debate. The theoretical explanation: debate forms a martingale process over agent beliefs—expected belief remains unchanged over rounds.

**Use majority voting** for:
- Tasks with clear correct answers (usability issue detection)
- Cost-sensitive applications (voting is 3-5x cheaper than debate)
- Reproducibility requirements

**Use debate/synthesis** for:
- Open-ended synthesis tasks (aggregating qualitative feedback)
- Tasks benefiting from iterative refinement
- Heterogeneous specialized agents

### Condorcet's Jury Theorem limitations

The theorem promises that if each agent exceeds 50% accuracy, ensemble accuracy approaches 100% with more agents. However, **LLMs violate the independence assumption**—models trained on similar data produce correlated errors. Research shows models agree 60% of the time when both err.

Practical implications:

| Agents | Theoretical (independent) | Realistic (correlated) |
|--------|---------------------------|------------------------|
| 3      | ~78%                      | ~72-75%                |
| 5      | ~84%                      | ~76-80%                |
| 10     | ~90%                      | ~80-85%                |
| 20     | ~95%+                     | ~82-88%                |

**Diminishing returns occur after 5-7 agents** for any single question. Scale comes from asking many diverse personas, not many identical queries.

### Reducing correlated errors through prompt diversity

Research shows **prompt diversity often outperforms model diversity** for reducing error correlation:

```python
DIVERSE_EVALUATION_PROMPTS = [
    # Analytical framing
    "Systematically analyze each UI element against usability principles...",
    
    # Narrative framing  
    "Walk through your experience using this interface step by step...",
    
    # Problem-focused framing
    "Identify everything that could go wrong when using this interface...",
    
    # Comparison framing
    "Compare this to tools you've used before. What's better? Worse?...",
    
    # Teaching framing
    "Explain to a colleague how to use this interface and what to watch out for..."
]

def get_diverse_prompt(persona_index: int) -> str:
    """Rotate through prompt framings to reduce correlation"""
    return DIVERSE_EVALUATION_PROMPTS[persona_index % len(DIVERSE_EVALUATION_PROMPTS)]
```

### Implementation of voting methods

```python
from collections import Counter
from typing import List, Dict, Any
import numpy as np

class EnsembleAggregator:
    """Aggregation methods for LLM ensemble outputs"""
    
    def majority_vote_issues(self, evaluations: List[Dict]) -> List[Dict]:
        """
        Aggregate usability issues across personas.
        Issues mentioned by >threshold personas are considered valid.
        """
        issue_counts = Counter()
        issue_details = {}
        
        for eval in evaluations:
            for issue in eval.get("issues", []):
                # Normalize issue description for matching
                issue_key = self._normalize_issue(issue["description"], issue["location"])
                issue_counts[issue_key] += 1
                if issue_key not in issue_details:
                    issue_details[issue_key] = issue
                else:
                    # Aggregate severity (take max)
                    issue_details[issue_key]["severity_score"] = max(
                        issue_details[issue_key].get("severity_score", 1),
                        issue.get("severity_score", 1)
                    )
        
        # Threshold: issue must appear in >20% of evaluations
        threshold = len(evaluations) * 0.2
        validated_issues = [
            {**issue_details[key], "mention_count": count, "mention_rate": count/len(evaluations)}
            for key, count in issue_counts.items()
            if count >= threshold
        ]
        
        return sorted(validated_issues, key=lambda x: (-x["severity_score"], -x["mention_count"]))
    
    def weighted_heuristic_scores(self, evaluations: List[Dict]) -> Dict[str, float]:
        """
        Aggregate heuristic scores with persona weighting.
        Weight by persona relevance to scenario.
        """
        heuristics = ["visibilityOfSystemStatus", "matchWithExpectations", 
                      "userControlAndFreedom", "consistency", "errorPrevention"]
        
        aggregated = {}
        for h in heuristics:
            scores = [e["heuristicScores"][h]["score"] for e in evaluations 
                      if h in e.get("heuristicScores", {})]
            if scores:
                aggregated[h] = {
                    "mean": np.mean(scores),
                    "std": np.std(scores),
                    "min": min(scores),
                    "max": max(scores),
                    "n": len(scores)
                }
        return aggregated
    
    def borda_count_features(self, rankings: List[List[str]]) -> List[str]:
        """
        Aggregate feature priority rankings using Borda count.
        Each persona ranks features; aggregate into consensus ranking.
        """
        scores = Counter()
        n_features = max(len(r) for r in rankings) if rankings else 0
        
        for ranking in rankings:
            for position, feature in enumerate(ranking):
                # Higher position = more points
                scores[feature] += (n_features - position)
        
        return [feature for feature, _ in scores.most_common()]
```

### Mixture-of-Agents architecture for synthesis

For aggregating qualitative feedback into actionable insights, use a **proposer-aggregator architecture**:

```python
async def mixture_of_agents_synthesis(
    evaluations: List[Dict],
    prototype_context: str
) -> str:
    """
    MoA pattern: Multiple proposer analyses → Single aggregator synthesis
    """
    # Phase 1: Run specialized proposer agents in parallel
    proposer_prompts = [
        ("usability_analyst", "Identify the top 5 usability issues from these evaluations..."),
        ("pattern_finder", "Find patterns in feedback across persona types..."),
        ("priority_recommender", "Recommend priority fixes based on severity and frequency..."),
        ("segment_analyst", "How does feedback differ by persona segment (role, tech level)?...")
    ]
    
    proposer_responses = await asyncio.gather(*[
        run_llm(
            model="claude-3-haiku-20240307",  # Cheaper model for proposers
            system=f"You are a {role}.",
            user=f"{prompt}\n\nEvaluations:\n{format_evaluations(evaluations)}"
        )
        for role, prompt in proposer_prompts
    ])
    
    # Phase 2: Aggregator synthesizes proposer outputs
    aggregator_prompt = f"""
    You are synthesizing UX research findings into an executive summary.
    
    Prototype context: {prototype_context}
    
    Analysis from specialized reviewers:
    {chr(10).join(f"### {role}:{chr(10)}{response}" for (role, _), response in zip(proposer_prompts, proposer_responses))}
    
    Synthesize into a single actionable report:
    1. CRITICAL ISSUES (must fix before launch)
    2. IMPORTANT ISSUES (should fix)
    3. MINOR ISSUES (nice to fix)
    4. WHAT'S WORKING WELL
    5. SEGMENT-SPECIFIC INSIGHTS
    6. RECOMMENDED NEXT STEPS
    """
    
    return await run_llm(
        model="claude-sonnet-4-20250514",  # Better model for synthesis
        system="You are a senior UX researcher synthesizing findings.",
        user=aggregator_prompt
    )
```

### Practical thresholds for agent counts

Based on research and cost modeling:

| Use Case | Recommended Agents | Rationale |
|----------|-------------------|-----------|
| Quick validation | 10-20 | Catches major issues, low cost |
| Standard evaluation | 50-100 | Good coverage across segments |
| Comprehensive panel | 200-500 | Statistical significance, segment analysis |
| Full market simulation | 1000+ | Mirrors real user distribution |

**Optimal configuration for most evaluations**: 100 diverse personas, 5 prompt variations = 500 total evaluations, aggregated via majority voting for issues + MoA for synthesis.

---

## Cursor slash command implementation

### Project structure

```
your-project/
├── .cursor/
│   ├── commands/                    # Slash commands
│   │   ├── generate-personas.md
│   │   ├── evaluate-prototype.md
│   │   ├── aggregate-results.md
│   │   └── full-panel-run.md
│   ├── rules/
│   │   └── synthetic-panel.mdc      # Project rules
│   ├── hooks.json                   # Lifecycle automation
│   └── mcp.json                     # External tool config
├── synthetic-panel/
│   ├── personas/
│   │   ├── generated/               # Output personas
│   │   │   └── batch_2025-01-09/
│   │   │       ├── personas.json
│   │   │       └── generation_log.json
│   │   ├── archetypes/              # Base archetypes
│   │   │   └── revenue_team.json
│   │   └── transcripts/             # Source transcripts
│   │       └── customer_calls/
│   ├── prototypes/
│   │   ├── specs/                   # Written specifications
│   │   ├── screenshots/             # Figma exports
│   │   └── schemas/                 # Prototype schemas
│   ├── scenarios/
│   │   └── evaluation_scenarios.json
│   ├── evaluations/
│   │   └── [prototype_id]/
│   │       └── [timestamp]/
│   │           ├── raw_evaluations.json
│   │           ├── aggregated_issues.json
│   │           └── synthesis_report.md
│   ├── config/
│   │   ├── stratification.json
│   │   └── model_config.json
│   └── scripts/
│       ├── generate_personas.py
│       ├── run_evaluation.py
│       └── aggregate_results.py
└── README.md
```

### Slash command: /generate-personas

Create `.cursor/commands/generate-personas.md`:

```markdown
# Generate Synthetic Personas

Generate a diverse panel of synthetic user personas for UX research.

## Objective
Create {count} diverse B2B SaaS personas for evaluating AskElephant prototypes, ensuring coverage across roles, company sizes, technical proficiency, and AI adoption stages.

## Instructions

1. Read the stratification config from `synthetic-panel/config/stratification.json`
2. Read existing archetypes from `synthetic-panel/personas/archetypes/`
3. For each cell in the stratification matrix:
   - Generate personas using Verbalized Sampling (request probability < 0.10)
   - Ensure diversity in personality, goals, and pain points within each cell
   - Include skeptics and resistant users (minimum 15% of total)
4. Validate each persona against the schema in `synthetic-panel/config/persona_schema.json`
5. Save to `synthetic-panel/personas/generated/batch_{date}/personas.json`
6. Log generation metadata to `generation_log.json`

## Output Format
- JSON array of PersonaSchema-compliant objects
- Each persona has unique id: `persona_{8-char-hash}`
- Include generation metadata: timestamp, model used, stratification cell

## Quality Checks
- No two personas should have identical goals + pain points combinations
- Names should be diverse (varied ethnicities, genders)
- Voice quotes should sound authentic to the persona's role and experience level
```

### Slash command: /evaluate-prototype

Create `.cursor/commands/evaluate-prototype.md`:

```markdown
# Evaluate Prototype with Synthetic Panel

Run persona-based evaluation of a prototype using the synthetic user panel.

## Inputs Required
- Prototype: Specify path to prototype spec/screenshot in `synthetic-panel/prototypes/`
- Scenario: Reference scenario from `synthetic-panel/scenarios/evaluation_scenarios.json`
- Panel size: Number of personas to use (default: 100)

## Execution Steps

1. Load prototype from specified path
2. Load evaluation scenario
3. Select personas from `synthetic-panel/personas/generated/` using stratified sampling
4. For each persona (in batches of 50 for rate limiting):
   a. Construct evaluation prompt with persona context + scenario + prototype
   b. Use prompt diversity (rotate through 5 framings)
   c. Call LLM with structured output schema
   d. Validate response against EvaluationSchema
   e. Save individual result
5. After all evaluations complete, trigger aggregation

## Model Configuration
- Persona evaluations: claude-3-haiku-20240307 (cost optimization)
- Temperature: 0.7 for diversity
- Max tokens: 1500 per evaluation

## Output
Save to `synthetic-panel/evaluations/{prototype_id}/{timestamp}/`
- `raw_evaluations.json`: Array of all evaluation results
- `evaluation_metadata.json`: Run configuration, timing, cost estimate
```

### Slash command: /aggregate-results

Create `.cursor/commands/aggregate-results.md`:

```markdown
# Aggregate Panel Evaluation Results

Synthesize raw evaluations into actionable insights using ensemble methods.

## Input
Path to raw evaluations: `synthetic-panel/evaluations/{prototype_id}/{timestamp}/raw_evaluations.json`

## Aggregation Process

1. **Issue Aggregation (Majority Voting)**
   - Group similar issues by location + description
   - Apply 20% threshold (issue must appear in >20% of evaluations)
   - Take maximum severity when same issue reported differently
   - Calculate mention rate and segment breakdown

2. **Heuristic Score Aggregation**
   - Calculate mean, std, min, max for each Nielsen heuristic
   - Segment by persona type (show how scores differ by role, tech level)

3. **Feature Priority Aggregation (Borda Count)**
   - If personas ranked features, aggregate via Borda count
   - Report consensus ranking with confidence intervals

4. **Qualitative Synthesis (MoA)**
   - Run 4 specialized proposer analyses (usability, patterns, priorities, segments)
   - Aggregate into executive synthesis using claude-sonnet-4-20250514

## Output Files
- `aggregated_issues.json`: Validated issues with metadata
- `heuristic_summary.json`: Score aggregations by segment
- `synthesis_report.md`: Executive summary with recommendations
- `segment_analysis.json`: How feedback differs by persona type
```

### Project rules: synthetic-panel.mdc

Create `.cursor/rules/synthetic-panel.mdc`:

```markdown
---
description: Synthetic user research panel workflow rules
globs:
  - synthetic-panel/**/*
alwaysApply: true
---

# Synthetic Panel Workflow Rules

## File Conventions
- All personas stored as JSON in `synthetic-panel/personas/generated/`
- Evaluation results in `synthetic-panel/evaluations/{prototype_id}/{timestamp}/`
- Use ISO 8601 timestamps for batch naming

## Schema Enforcement
- Validate all personas against PersonaSchema before saving
- Validate all evaluations against EvaluationSchema
- Log validation errors to `validation_errors.json`

## Model Selection
- Persona generation: claude-3-haiku-20240307 with temperature 0.9
- Prototype evaluation: claude-3-haiku-20240307 with temperature 0.7
- Aggregation/synthesis: claude-sonnet-4-20250514 with temperature 0.3
- Never use expensive models for individual persona operations

## Rate Limiting
- Batch persona operations in groups of 50
- Add 1-second delay between batches
- Use asyncio semaphore with concurrency limit of 100

## Quality Standards
- Minimum 15% skeptic/resistant personas in any panel
- No duplicate persona configurations (same role + company + tech level)
- All evaluations must complete structured output schema

## Cost Tracking
- Log token usage for every LLM call
- Include cost estimates in all *_metadata.json files
- Alert if single run exceeds $10
```

### Hooks configuration

Create `.cursor/hooks.json`:

```json
{
  "version": 1,
  "hooks": {
    "afterFileEdit": [
      {
        "command": "python -c \"import json; json.load(open('$CURSOR_FILE_PATH'))\"",
        "description": "Validate JSON syntax after edits to .json files",
        "pattern": "*.json"
      }
    ],
    "stop": [
      {
        "command": "python synthetic-panel/scripts/log_session.py",
        "description": "Log agent session completion"
      }
    ]
  }
}
```

---

## Tooling recommendations

### LLM providers for persona simulation

| Provider | Model | Best For | Cost (1M tokens in/out) | Rate Limits |
|----------|-------|----------|-------------------------|-------------|
| **Anthropic** | Claude 3.5 Haiku | Persona evaluation | $0.80 / $4.00 | 4M tokens/min (Tier 4) |
| **Anthropic** | Claude Sonnet 4 | Aggregation/synthesis | $3.00 / $15.00 | 400K tokens/min |
| **OpenAI** | GPT-4o-mini | Budget alternative | $0.15 / $0.60 | 10M tokens/min |
| **Google** | Gemini 2.0 Flash | Vision tasks (screenshots) | $0.10 / $0.40 | 1M tokens/min |

**Recommended configuration**: Haiku for all persona operations (90% of calls), Sonnet for aggregation (10% of calls). Expected cost for 1,000 personas evaluating one prototype: **$2-4**.

### Orchestration framework selection

Given the Cursor-native workflow requirement, **custom asyncio** is recommended over frameworks:

```python
# core/orchestrator.py
import asyncio
from anthropic import AsyncAnthropic
from pydantic import BaseModel
from typing import List
import json

class PanelOrchestrator:
    def __init__(self, config_path: str = "synthetic-panel/config/model_config.json"):
        with open(config_path) as f:
            self.config = json.load(f)
        self.client = AsyncAnthropic()
        self.semaphore = asyncio.Semaphore(self.config.get("concurrency", 100))
    
    async def run_persona_evaluation(
        self,
        persona: dict,
        prototype: dict,
        scenario: dict
    ) -> dict:
        async with self.semaphore:
            response = await self.client.messages.create(
                model=self.config["evaluation_model"],
                max_tokens=1500,
                temperature=0.7,
                system=self._build_system_prompt(persona),
                messages=[{
                    "role": "user",
                    "content": self._build_evaluation_prompt(prototype, scenario)
                }]
            )
            return self._parse_evaluation(response, persona["id"])
    
    async def run_panel_evaluation(
        self,
        personas: List[dict],
        prototype: dict,
        scenario: dict,
        batch_size: int = 50
    ) -> List[dict]:
        results = []
        for i in range(0, len(personas), batch_size):
            batch = personas[i:i + batch_size]
            batch_results = await asyncio.gather(*[
                self.run_persona_evaluation(p, prototype, scenario)
                for p in batch
            ])
            results.extend(batch_results)
            await asyncio.sleep(1)  # Rate limit buffer
        return results
```

If you need more sophisticated orchestration later, **LangGraph** provides the best balance of control and features for complex workflows.

### JSON schema validation

Use **Pydantic** for runtime validation with automatic schema generation:

```python
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from enum import Enum

class Severity(str, Enum):
    cosmetic = "cosmetic"
    minor = "minor"
    major = "major"
    catastrophic = "catastrophic"

class UsabilityIssue(BaseModel):
    id: str
    description: str = Field(..., min_length=10)
    location: str
    severity: Severity
    severity_score: int = Field(..., ge=1, le=4)
    heuristic_violated: Optional[str] = None
    persona_impact: str
    recommendation: str
    
    @field_validator('description')
    @classmethod
    def description_not_generic(cls, v):
        generic_phrases = ["could be better", "needs improvement", "not great"]
        if any(phrase in v.lower() for phrase in generic_phrases):
            raise ValueError("Description too generic; be specific about the issue")
        return v

class PersonaEvaluation(BaseModel):
    persona_id: str
    prototype_id: str
    scenario_id: str
    heuristic_scores: dict
    issues: List[UsabilityIssue]
    emotional_response: dict
    verdict: dict
```

### Logging and observability

For local development, use structured file-based logging:

```python
# core/logging.py
import json
from datetime import datetime
from pathlib import Path
from dataclasses import dataclass, asdict

@dataclass
class EvaluationTrace:
    run_id: str
    persona_id: str
    model: str
    input_tokens: int
    output_tokens: int
    latency_ms: float
    cost_usd: float
    timestamp: str = None
    
    def __post_init__(self):
        self.timestamp = datetime.utcnow().isoformat()

class PanelLogger:
    def __init__(self, log_dir: str = "synthetic-panel/logs"):
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(parents=True, exist_ok=True)
        self.current_run_id = None
        self.traces = []
    
    def start_run(self, run_id: str, config: dict):
        self.current_run_id = run_id
        self.traces = []
        self._write_metadata(config)
    
    def log_evaluation(self, trace: EvaluationTrace):
        self.traces.append(asdict(trace))
    
    def end_run(self):
        run_path = self.log_dir / f"{self.current_run_id}"
        run_path.mkdir(exist_ok=True)
        
        with open(run_path / "traces.json", "w") as f:
            json.dump(self.traces, f, indent=2)
        
        summary = {
            "total_evaluations": len(self.traces),
            "total_tokens": sum(t["input_tokens"] + t["output_tokens"] for t in self.traces),
            "total_cost_usd": sum(t["cost_usd"] for t in self.traces),
            "avg_latency_ms": sum(t["latency_ms"] for t in self.traces) / len(self.traces) if self.traces else 0
        }
        
        with open(run_path / "summary.json", "w") as f:
            json.dump(summary, f, indent=2)
```

For production, integrate with **LangSmith** (if using LangChain) or **Langfuse** (open-source alternative).

---

## Cost modeling and optimization

### Cost breakdown for typical runs

| Operation | Model | Tokens per call | Calls | Cost |
|-----------|-------|-----------------|-------|------|
| Generate 1000 personas | Haiku | ~800 out | 200 (5 per call) | $0.64 |
| 1000 evaluations | Haiku | ~500 in, 400 out | 1000 | $2.00 |
| Issue aggregation | Haiku | ~50K in, 2K out | 1 | $0.05 |
| MoA synthesis | Sonnet | ~60K in, 3K out | 1 | $0.23 |
| **Total per prototype** | | | | **~$3.00** |

### Optimization techniques

1. **Prompt caching**: Anthropic caches system prompts. Structure persona context as system prompt to benefit from caching on repeated evaluations.

2. **Batch API**: For non-real-time runs, use batch APIs (50% discount) with 24-hour turnaround.

3. **Model routing**: Use Haiku for 90% of operations, Sonnet only for synthesis.

4. **Response caching**: Cache evaluation results by (persona_id, prototype_hash, scenario_id). Same persona evaluating unchanged prototype returns cached result.

5. **Token optimization**: Keep persona descriptions under 300 tokens. Use abbreviated attribute representations during evaluation.

---

## Implementation roadmap

**Phase 1 (Week 1): Foundation**
- Set up project structure and file organization
- Create JSON schemas for personas, scenarios, evaluations
- Implement basic persona generation with stratification
- Create first slash command: `/generate-personas`

**Phase 2 (Week 2): Evaluation Pipeline**  
- Build prototype representation system (specs + screenshots)
- Implement persona evaluation prompts with structured output
- Create `/evaluate-prototype` slash command
- Add basic logging and cost tracking

**Phase 3 (Week 3): Aggregation Layer**
- Implement majority voting for issue aggregation
- Build MoA synthesis for qualitative insights
- Create `/aggregate-results` slash command
- Add segment analysis (feedback by persona type)

**Phase 4 (Week 4): Polish and Scale**
- Optimize for 1000+ persona runs
- Add caching and batch processing
- Create `/full-panel-run` orchestration command
- Build observability dashboard (local HTML report)

This system provides a practical, cost-effective approach to synthetic user research that can generate actionable UX insights at a fraction of traditional research costs while maintaining methodological rigor through ensemble validation methods.