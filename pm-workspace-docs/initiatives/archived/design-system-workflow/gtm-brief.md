# GTM Brief: Design System & Workflow Modernization

## Overview

This is an **internal enablement initiative**, not a customer-facing feature. The "go-to-market" is internal adoption by the engineering and design teams.

---

## Value Proposition

**For engineers:** Ship UI faster with confidence—automated checks catch design mistakes before review.

**For designers:** Scale your impact across 14+ engineers without being the bottleneck.

**For the company:** Consistent UX builds user trust; polished product wins deals.

---

## Target Audience

### Primary: Engineering Team ("The Herd")

**Who:** All engineers shipping frontend code

**What they need to know:**
- New CI checks will run on PRs touching `web/src/components/`
- Red violations block merge; yellow are warnings
- Use components from `ui/` library, not raw HTML elements
- Use semantic tokens, not hardcoded values

**Enablement needed:**
- Team announcement in Slack (#engineering)
- Documentation link in PR template
- Office hours Q&A session

### Secondary: Design Team (Skyler + Adam)

**Who:** Designers reviewing PRs and editing tokens

**What they need to know:**
- How to edit tokens directly in Cursor
- How to use Storybook for preview
- The Red/Yellow/Green review classification
- When to approve vs. request changes

**Enablement needed:**
- 1:1 training session with Skyler
- Recorded walkthrough for Adam
- Cursor workflow cheatsheet

---

## Key Messages

### For Engineers

1. **"The system has your back"** — You'll know immediately if something doesn't match the design system. No more surprises in design review.

2. **"Components, not custom"** — If it's a button, modal, card, or form—use what's in `ui/`. It's already polished.

3. **"Tokens, not values"** — Never hardcode colors or spacing. The design system will evolve (rebrand!), and tokens update everywhere automatically.

### For Designers

1. **"Your principles, automated"** — The checks enforce Human-First Design so you don't have to.

2. **"Direct control"** — Edit tokens in Cursor → see changes in Storybook → no Figma round-trip.

3. **"Scale your impact"** — Every engineer's code gets your seal of approval through the token system.

### For Leadership

1. **"UX consistency = user trust"** — The Apple effect. Every polished pixel builds confidence.

2. **"Enables the rebrand"** — Clean token system means brand refresh is a token update, not a rewrite.

3. **"Designer scalability"** — 2 designers can support 14+ engineers with automated enforcement.

---

## Internal Launch Plan

### Phase 1: Soft Launch (Week 1-2)

**Goal:** Introduce the system without disruption

**Activities:**
- [ ] Announce in #engineering Slack: "New design checks coming—warnings only for now"
- [ ] Link to design-brief.md for pattern reference
- [ ] Skyler sends quick Loom explaining Human-First Design principles
- [ ] Add design system link to PR template

**Success metric:** Engineers aware of the change

### Phase 2: Enablement (Week 3-4)

**Goal:** Team can use the system effectively

**Activities:**
- [ ] Engineering all-hands: 15-min walkthrough of check results
- [ ] Skyler training session: Direct token editing in Cursor
- [ ] Create "Design System FAQ" in Notion
- [ ] Office hours for questions

**Success metric:** < 5 questions per week about how it works

### Phase 3: Full Enforcement (Week 5+)

**Goal:** Design quality is non-negotiable

**Activities:**
- [ ] Enable blocking checks (red violations fail CI)
- [ ] Celebrate first clean week in #engineering
- [ ] Share compliance trend in team meeting
- [ ] Begin legacy remediation sprints

**Success metric:** > 90% of PRs pass on first attempt

---

## Competitive Positioning

**Not applicable** — This is internal tooling. However, the outcome (consistent UX) is competitive:

- Users subconsciously compare our polish to Gong, Chorus, Clari
- Every inconsistency reinforces "scrappy startup" perception
- Every polished detail reinforces "enterprise-ready" perception

---

## Customer Impact

### Direct Impact: None

This is internal—customers won't see a changelog entry.

### Indirect Impact: High

- **Perceived quality improves** — UI feels more professional
- **Trust builds** — Consistency signals attention to detail
- **Faster bug fixes** — Componentized UI is easier to update

---

## Internal Enablement Needs

### Documentation

| Document | Owner | Status |
|----------|-------|--------|
| Design Brief (principles) | Tyler | ✅ Created |
| Engineering Spec (technical) | Tyler | ✅ Created |
| Pattern Reference | Tyler | Pending |
| Token Editing Guide | Tyler | Pending |
| Exception Process | Tyler | Pending |

### Training

| Session | Audience | Duration | Format |
|---------|----------|----------|--------|
| Design System Overview | Engineering | 15 min | All-hands |
| CI Check Walkthrough | Engineering | 10 min | Loom |
| Cursor Token Editing | Skyler | 30 min | 1:1 |
| Human-First Design | All | 5 min | Loom from Skyler |

### Support Channels

- **#design-system** (Slack) — Questions about patterns/tokens
- **PR comments** — Inline from CI check
- **Office hours** — Weekly for first month

---

## Launch Tier Recommendation

**Tier: P2 (Internal)**

**Justification:**
- No customer-facing changes
- No marketing/sales enablement needed
- No documentation changes for external users
- Success measured internally (compliance rate)

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| **Engineers frustrated by blocking PRs** | Soft launch with warnings first; tune before enforcement |
| **Skyler doesn't adopt Cursor workflow** | Dedicated training time; start with small wins |
| **False positives create noise** | Review exceptions weekly; add to allow-list |
| **Legacy remediation overwhelming** | Scope to priority pages (billing, settings) first |

---

## Success Metrics

### Adoption Metrics

| Metric | Week 1 Target | Week 4 Target | Week 8 Target |
|--------|---------------|---------------|---------------|
| Engineers aware of checks | 100% | 100% | 100% |
| PRs passing first attempt | 50% | 75% | 90% |
| Skyler editing tokens directly | 0 | 3/week | 5/week |
| Questions in #design-system | High | Medium | Low |

### Quality Metrics

| Metric | Baseline | Week 4 | Week 8 |
|--------|----------|--------|--------|
| Codebase compliance rate | 70% | 75% | 85% |
| New code compliance rate | — | 95% | 99% |
| Design review turnaround | Days | < 24h | < 4h |

---

## Timeline

```
Week 1-2: Foundation
├── CI workflow deployed (warnings only)
├── Documentation published
└── #engineering announcement

Week 3-4: Enablement
├── Training sessions
├── Office hours
└── Feedback collection

Week 5-6: Enforcement
├── Blocking checks enabled
├── Legacy audit started
└── Compliance tracking active

Week 7+: Maintenance
├── Monthly rule tuning
├── Legacy remediation sprints
└── Compliance trending toward 100%
```

---

## Appendix: Communication Templates

### Slack Announcement (Week 1)

```
🎨 **New: Automated Design Quality Checks**

Starting this week, PRs touching frontend components will run automated design quality checks. This helps us:

• Catch inconsistencies before design review
• Use the design system consistently
• Scale design quality across the team

**What you need to know:**
• Checks run automatically on PR
• Results show as Red (fix required) / Yellow (warning) / Green (pass)
• For now, these are **warnings only** — not blocking

📚 Full guide: [link to design-brief.md]
❓ Questions: #design-system

Thanks for helping us level up our UX consistency!
```

### PR Template Addition

```markdown
## Design Checklist

- [ ] Uses existing components from `ui/` library
- [ ] Colors are semantic tokens (not hex values)
- [ ] Spacing follows Tailwind scale (not arbitrary)
- [ ] Checked in both light and dark mode

📚 [Design System Guide](link)
```

---

## References

- PRD: `pm-workspace-docs/initiatives/design-system-workflow/prd.md`
- Design Brief: `pm-workspace-docs/initiatives/design-system-workflow/design-brief.md`
- Engineering Spec: `pm-workspace-docs/initiatives/design-system-workflow/engineering-spec.md`
