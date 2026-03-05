# FGA Engine — Customer Story

## Current State (Pain)

```
Admin evaluates AskElephant for enterprise team
  → Security team asks: "Who can see what? Can you restrict access?"
    → Admin discovers: No UI to configure access controls
      → Must ask AskElephant engineering to make changes per-customer
        → Deal stalls or requires custom engineering work
          → Enterprise deals blocked; trust gap widens
```

**Key Quote:** _"I want to share my calls with my team without the effort of adding them to the call"_ — Revenue Leader (Notion PRD)

**Key Quote:** _"As a sales manager when I make a new hire I want them to be able to see my team's calls without having to retroactively add them"_ — Sales Manager (Notion PRD)

---

## User Stories

### Enterprise Admin

_"As an Enterprise Admin, I want to describe my access policy in plain English and have AI generate the corresponding rules, so that I don't need to understand authorization primitives."_

### RevOps Manager

_"As a RevOps Manager, I want to configure team-level sharing so that I don't need to manage individual meeting permissions."_

### Sales Manager

_"As a Sales Manager, I want new hires to automatically inherit my team's access rules so that onboarding doesn't require retroactive meeting sharing."_

### Sales Rep

_"As a Sales Rep, when I can't access a meeting, I want to see a clear explanation of why and a one-click request access button."_

---

## Future State (With AI-Assisted FGA)

```
Admin visits Settings → Authorization
  → AI greets them: "How should your team share access?"
    → Admin types: "Managers see their team's calls, attendees only for everything else"
      → AI generates policies, shows impact (47 users, 1,200 meetings)
        → Admin confirms → Policies active in 2 minutes
          → New hires auto-inherit access, audit trail ready for compliance
            → Enterprise deal closes; trust established
```

---

## Transformation Moment

The admin types a sentence describing their security policy. The AI translates it into access rules, shows exactly who's affected, and asks for confirmation. **Enterprise-grade security configured in a 2-minute conversation.** No forms, no dropdowns, no authorization vocabulary.

---

## Outcome Chain

```
AI-assisted access control configuration
  → Admins set up access rules in plain language
    → Enterprise teams trust AskElephant with sensitive data
      → They adopt with larger teams and more sensitive use cases
        → We close enterprise deals and expand ARR
```
