# PRD Amendments: hubspot-agent-config-ui

Generated: 2026-01-09 01:07
Based on: Jury Evaluation (50.6% combined pass rate)

---

## Amendment Summary

The jury evaluation surfaced critical gaps in our current PRD. This document provides specific additions and changes.

## Must-Add Requirements (Critical Friction)

### FR-1: Address "Rollback if something breaks"

**Priority:** P0 (Critical)
**Mentions:** 282 personas flagged this as abandonment trigger

**Requirement:**
- System MUST provide one-click rollback for any automated action
- Users MUST be able to undo changes within 30 days
- Rollback MUST restore exact previous state without data loss
- Show clear "Undo" option after every automated action

**Acceptance Criteria:**
- [ ] Rollback available for all sync operations
- [ ] Rollback completes in <5 seconds
- [ ] Rollback confirmation shows exactly what will be restored
- [ ] Audit log captures all rollback actions

### FR-2: Address "Integration with existing tools"

**Priority:** P0 (Critical)
**Mentions:** 274 personas flagged this as abandonment trigger

**Requirement:**
- System MUST integrate with user's existing tool stack without disruption
- Integration MUST be bi-directional where applicable
- Users MUST be able to configure integration granularity
- Provide clear status indicators for all integrations

**Acceptance Criteria:**
- [ ] Native integrations for Salesforce, HubSpot, Slack
- [ ] Webhook support for custom integrations
- [ ] Integration health dashboard
- [ ] Automatic retry with user notification on failure

### FR-3: Address "Compliance/security concerns"

**Priority:** P0 (Critical)
**Mentions:** 250 personas flagged this as abandonment trigger

**Requirement:**
- System MUST meet enterprise security requirements
- Provide clear documentation of data handling
- Users MUST be able to control what data is captured/stored
- Support for compliance frameworks (SOC2, GDPR, HIPAA where applicable)

**Acceptance Criteria:**
- [ ] SSO/SAML support
- [ ] Role-based access controls
- [ ] Data retention policies
- [ ] Audit logs for all data access

### FR-4: Address "Configuration complexity"

**Priority:** P0 (Critical)
**Mentions:** 248 personas flagged this as abandonment trigger

**Requirement:**
- Configuration MUST be achievable in <10 minutes for basic setup
- Provide pre-built templates for common use cases
- Guided wizard for first-time configuration
- Progressive disclosure - show advanced options only when needed

**Acceptance Criteria:**
- [ ] 3 or fewer steps for basic configuration
- [ ] Template library with 5+ pre-built configs
- [ ] Contextual help at every step
- [ ] Preview of configuration effects before applying

### FR-5: Address "Testing before go-live"

**Priority:** P0 (Critical)
**Mentions:** 248 personas flagged this as abandonment trigger

**Requirement:**
- Users MUST be able to preview/test changes before applying to production
- Provide sandbox environment for experimentation
- Show simulated outcomes before executing
- Clear visual diff of what will change

**Acceptance Criteria:**
- [ ] Preview mode available for all configurations
- [ ] Sandbox with sample data included
- [ ] Side-by-side comparison of before/after
- [ ] Test mode that logs without executing

## Should-Add Features (Top Suggestions)

### SF-1: "Mobile-friendly status view"

**Priority:** P1 (High)
**Mentions:** 185 personas requested this

### SF-2: "Clear activity log I can review"

**Priority:** P1 (High)
**Mentions:** 180 personas requested this

### SF-3: "Show me exactly what will sync before it syncs"

**Priority:** P1 (High)
**Mentions:** 174 personas requested this

### SF-4: "One-click to pause/resume"

**Priority:** P1 (High)
**Mentions:** 161 personas requested this

### SF-5: "Approval workflows for changes"

**Priority:** P1 (High)
**Mentions:** 141 personas requested this

## Persona-Specific Requirements

### For Operations (Currently 48.0% pass rate)

- Add targeted value proposition in onboarding
- Surface features most relevant to this persona first
- Consider dedicated workflow/view for this user type
- Validate all changes with this segment before release

---

## Amendment Tracking

| Amendment | Status | Owner | Target Date |
|-----------|--------|-------|-------------|
| FR-1 | Pending | TBD | TBD |
| FR-2 | Pending | TBD | TBD |
| FR-3 | Pending | TBD | TBD |
| FR-4 | Pending | TBD | TBD |
| FR-5 | Pending | TBD | TBD |


## Re-Validation Plan

After implementing amendments:
1. Re-run jury evaluation with same 1000 personas
2. Target: >70% combined pass rate
3. Target: >30% pass rate for currently-failing segments
4. If not met, iterate again

