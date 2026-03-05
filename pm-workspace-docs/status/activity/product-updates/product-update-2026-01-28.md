# Product & Engineering Update: Jan 28, 2026

**For:** Sam Ho (VP Product)
**From:** Tyler Sahagun

---

## Executive Summary

**Delivery:** Shipped critical improvements for HubSpot integration and Workflows.
**Focus:** Mobile global chat and Zoom SDK compliance are top priorities for the remainder of the week.

---

## 📦 Initiative Progress (P0/P1)

### 🔌 HubSpot Integration (P0)

**Status:** Build | **Active**

- **Shipped:** Improved deal import pipeline shaping; better edge case handling for syncs.
- **Next:** Validation with partnership customers (James Hinkson).
- **Risk:** Need to ensure import pipeline handles all partner edge cases before full rollout.

### ⚡️ Workflows & Automation (P0)

**Status:** Build | **Active**

- **Shipped:** Performance improvements (new indexing) and legacy code cleanup. Fixed "recap email" button.
- **Next:** Validation with heavy-usage customers.

### 📱 Mobile App (P1)

**Status:** Build | **Active**

- **Shipped:** Fixed chat auth issues. Foundation for Global Chat is in place.
- **Next:** Finish Global Chat integration; App Store submission.
- **Stakeholder:** Coordination with CX needed for launch comms.

### 🛡️ Data Quality & Platform (P1)

**Status:** Build | **Active**

- **Shipped:** Auto-merge for "www" vs "non-www" domains (reduces CX cleanup tickets). Salesforce Agent list objects tool.
- **Next:** Voiceprint schema and PostHog syncing indexes.

---

## 🛠 Quality & Engineering Health

- **Bugs Squashed:** 4 critical fixes (Onboarding restart loop, Mobile auth, Bot notifications).
- **Infrastructure:** Cloud SQL connector upgrade; test isolation improvements.
- **Compliance:** Zoom SDK fix in progress (Deadline: Feb 1).

---

## 🔮 Tomorrow's Focus

1.  **Mobile:** Push Global Chat to testing.
2.  **Partnerships:** Validate HubSpot imports with live data.
3.  **Compliance:** Merge Zoom SDK fix.
