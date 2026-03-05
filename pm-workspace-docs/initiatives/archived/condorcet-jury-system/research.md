# Condorcet Jury System - Research Synthesis

## TL;DR

Two complementary research documents establish the theoretical and practical foundations for implementing a synthetic user advisory board. **Document 1** provides the mathematical rigor (Condorcet's theorem, Bayesian Truth Serum, MoA architecture), while **Document 2** provides implementation pragmatism (cost modeling, Cursor slash commands, prompt engineering). Combined, they validate that:

1. **Majority voting works**: Simple voting accounts for most performance gains (not complex debate)
2. **Scale matters**: 100-500 personas provides statistical significance at ~$2-5/run
3. **Diversity is critical**: Verbalized Sampling prevents mode collapse; 15% skeptics minimum
4. **File-based is sufficient**: No external orchestration needed for MVP

---

## Source Documents Analyzed

1. **Implementation of a Massive-Scale Synthetic User Advisory Board in Cursor: A Multi-Agent Architectural Framework** (Document 1)
   - Location: `.pm-workspace/agents-docs/`
   - Focus: Theoretical foundations, MCP architecture, advanced techniques

2. **Synthetic User Research Panel with LLM Ensembles: Implementation Guide** (Document 2)
   - Location: `.pm-workspace/agents-docs/`
   - Focus: Practical implementation, cost optimization, Cursor-native workflow

---

## Key Insights from Document 1 (Theoretical Framework)

### Condorcet's Jury Theorem Mathematics

The theorem proves that aggregating imperfect voters (each with probability p > 0.5 of being correct) asymptotically approaches certainty as group size increases:

$$P_n = \sum_{k=m}^{n} \binom{n}{k} p^k (1-p)^{n-k}$$

**Critical conditions for our implementation**:

| Condition | Requirement | Our Mitigation |
|-----------|-------------|----------------|
| **Competence (p > 0.5)** | Each agent better than random | Self-Consistency filtering (Section 5.2) |
| **Independence** | Voters statistically independent | Verbalized Sampling + prompt diversity |
| **Binary or rankable** | Clear decision structure | Structured JSON output with scores |

### Mixture-of-Agents (MoA) Architecture

A 4-layer hierarchy handles scale:

| Layer | Role | Count | Model |
|-------|------|-------|-------|
| 0 | Persona Generator | 1 | GPT-4o/Opus |
| 1 | The Jury | 1-3000 | GPT-4o-mini/Haiku |
| 2 | Cluster Aggregators | 20-50 | GPT-4o/Sonnet |
| 3 | The Adjudicator | 1 | Claude Sonnet |

**Insight**: This hierarchical compression allows 3000 evaluations to produce coherent 1-page synthesis.

### Verbalized Sampling (Critical for Diversity)

Standard prompting causes **mode collapse**—all personas converge to "average user." Verbalized Sampling forces exploration of distribution tails:

> "Identify 10 distinct variations... ranging from 'Centroid' (typical) to 'Edge Cases' (outliers). For each variation, assign a probability of occurrence."

**Result**: 1.6-2.1x diversity improvement over direct prompting.

### Bayesian Truth Serum (BTS)

For subjective feedback ("Is this trustworthy?"), BTS rewards "surprisingly common" answers—opinions more prevalent than predicted. This surfaces expert minority insights that majority voting would suppress.

**Formula**: Score_k = ln(actual_frequency / predicted_frequency)

Positive scores indicate hidden expertise worth highlighting.

### MCP Server Architecture

Document 1 proposes FastMCP with async task handling for long-running operations:

```python
@mcp.tool(task=True)
async def run_advisory_board(prototype_url: str, agent_count: int = 1000):
    # Returns task_id immediately
    # Progress notifications via MCP protocol
    # Final result via resource endpoint
```

**Relevance**: If we scale to 1000+ personas, MCP provides better UX than blocking Cursor.

---

## Key Insights from Document 2 (Implementation Guide)

### Bottom Line Up Front

> "Simple majority voting accounts for most performance gains typically attributed to complex multi-agent debate systems."

This simplifies our implementation considerably. On benchmarks:
- **Pure voting**: 94.0% accuracy
- **5-round debate**: 87.8% accuracy

**Implication**: Skip complex debate patterns; use voting + MoA synthesis.

### Condorcet Limitations in Practice

LLMs violate the independence assumption—models trained on similar data produce correlated errors. Research shows models agree 60% of the time when both err.

| Agents | Theoretical (independent) | Realistic (correlated) |
|--------|---------------------------|------------------------|
| 10 | ~90% | ~80-85% |
| 20 | ~95%+ | ~82-88% |

**Implication**: Diminishing returns after 5-7 agents for any single question. Scale comes from asking **many diverse personas**, not many identical queries.

### Prompt Diversity > Model Diversity

For reducing correlated errors:

```python
DIVERSE_EVALUATION_PROMPTS = [
    "Systematically analyze each UI element...",      # Analytical
    "Walk through your experience step by step...",   # Narrative
    "Identify everything that could go wrong...",     # Problem-focused
    "Compare this to tools you've used before...",    # Comparison
    "Explain to a colleague how to use this..."       # Teaching
]
```

Rotate framings to decorrelate responses.

### Cost Model (Per Prototype Run)

| Operation | Model | Cost |
|-----------|-------|------|
| Generate 1000 personas | Haiku | $0.64 |
| 1000 evaluations | Haiku | $2.00 |
| Issue aggregation | Haiku | $0.05 |
| MoA synthesis | Sonnet | $0.23 |
| **Total** | | **~$3.00** |

**Implication**: Daily or per-commit runs are economically feasible.

### Optimal Panel Size

| Use Case | Recommended Agents |
|----------|-------------------|
| Quick validation | 10-20 |
| Standard evaluation | 50-100 |
| Comprehensive panel | 200-500 |
| Full market simulation | 1000+ |

**Recommendation**: 100 diverse personas × 5 prompt variations = 500 total evaluations for most use cases.

### Anti-Mode-Collapse Techniques

1. **Temperature variation**: 0.8-1.2 for generation
2. **Explicit negative traits**: Include skeptics, resisters
3. **Stratified generation**: Pre-define dimension combinations
4. **Persona-to-persona expansion**: Generate colleagues, counterparts

### Issue Aggregation Threshold

> "Issue must appear in >20% of evaluations to be considered validated."

This filters noise while catching real problems.

---

## Synthesis: How These Inform Our Implementation

### Architecture Decisions

| Decision | Document 1 | Document 2 | Our Choice |
|----------|------------|------------|------------|
| **Orchestration** | MCP Server | Cursor-native | **Cursor-native for MVP**, MCP for scale |
| **Voting method** | Condorcet + BTS | Majority + MoA | **Majority voting for quantitative, MoA for qualitative** |
| **Model tier** | GPT-4o-mini for jury | Claude Haiku for jury | **Claude Haiku** (better structured output) |
| **Sample size** | 1-3000 | 100-500 | **200-500** (balance of signal vs cost) |
| **Diversity** | Verbalized Sampling | Stratified + VS | **Both** (stratify first, VS within cells) |

### Integrated Workflow Design

Both documents focus on post-prototype evaluation. Our innovation is integrating validation **earlier**:

| Phase | Document Focus | Our Extension |
|-------|---------------|---------------|
| Research | Not covered | Validate pain point resonance |
| PM/PRD | Not covered | Validate user stories and flows |
| Prototype | Primary focus | Full usability evaluation |
| Iterate | Mentioned briefly | Systematic improvement loop |

### Self-Consistency Implementation

Document 1 recommends running each agent 3x with temperature 0.7:

```
If 3/3 agree → High confidence, count vote
If 2/3 agree → Medium confidence, count vote
If all differ → Discard as noise
```

This boosts individual agent accuracy (the "p" in Condorcet) before aggregation.

### File-Based vs External Services

Document 2 explicitly recommends against external orchestration for MVP:

> "The system operates entirely through local files and Cursor's agent infrastructure, requiring no external orchestration services."

**Our alignment**: All outputs in `.pm-workspace/initiatives/[name]/jury-validation/`

---

## Calibration Questions (Unresolved)

Both documents acknowledge the gap between synthetic and real users:

1. **How do we calibrate?** Run synthetic eval, then real user test, measure divergence
2. **What's acceptable divergence?** If synthetic predicts 70% success and real shows 60%, is that useful?
3. **When do we trust synthetic over intuition?** When sample size is large and diverse

### Proposed Calibration Process

1. Run synthetic eval on existing feature (where we have real usage data)
2. Compare synthetic predictions to actual PostHog metrics
3. Identify systematic biases (e.g., "synthetic users are 15% more optimistic")
4. Apply correction factor to future predictions

---

## Implementation Priority

Based on both documents:

### Phase 1: Foundation (Week 1)
- [x] Define persona schema (from Document 2's JSON structure)
- [x] Extract archetypes from real interviews
- [ ] Generate initial 500 personas with Verbalized Sampling
- [ ] Validate diversity metrics (no mode collapse)

### Phase 2: Research Integration (Week 2)
- [ ] Add pain point validation to `research` command
- [ ] Implement resonance scoring prompt
- [ ] Create aggregation logic (>60% = validated)

### Phase 3: PRD Integration (Week 2-3)
- [ ] Add user story validation
- [ ] Add flow validation
- [ ] Segment results by persona archetype

### Phase 4: Prototype Evaluation (Week 3-4)
- [ ] Implement full heuristic evaluation prompt
- [ ] Add self-consistency filtering
- [ ] Build MoA synthesis for qualitative feedback
- [ ] Create `jury-report.md` output format

### Phase 5: Iteration Loop (Week 4)
- [ ] Create `iterate` command
- [ ] Build version comparison (v1 vs v2)
- [ ] Track improvements in `iteration-log.md`

---

## References

- Document 1: Sections 1.2 (CJT), 2.3 (Verbalized Sampling), 5.1-5.4 (Execution & Consensus), 7 (Implementation)
- Document 2: Sections "Why majority voting beats debate", "Condorcet limitations", "Cost modeling", "Cursor slash command implementation"

---

*Last updated: 2026-01-08*
*Analyst: Cursor Agent*
