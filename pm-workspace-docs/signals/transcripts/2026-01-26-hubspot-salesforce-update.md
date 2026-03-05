# HubSpot & Salesforce Integration Update

**Signal ID:** `sig-2026-01-26-hubspot-salesforce-update`
**Type:** Internal Update Transcript
**Source:** Palmer (Engineering)
**Captured:** 2026-01-26
**Duration:** ~2:38

---

## TL;DR

Palmer provided a rundown of recently shipped HubSpot integration features and an upcoming Salesforce agent. Three major deliverables documented:
1. **AskElephant HubSpot App Card** - SHIPPED (live on contact/company pages)
2. **Structured HubSpot Agent Workflow Action** - SHIPPED (full configuration UI)
3. **Salesforce Agent** - IN PROGRESS (open PR, feature parity with HubSpot)

---

## Features Documented

### 1. AskElephant HubSpot App Card (SHIPPED)

**Location:** Contact and Company pages within HubSpot

**Capabilities:**
- Company information display with links back to AskElephant
- Recent meetings list (if user has meetings with that company)
- Chat feature for asking AskElephant questions about the company
- Chat creates conversation on company page with HubSpot agent
- Internal search is activated within this context

**User Value:**
- No context switching - stay in HubSpot while accessing AskElephant insights
- Company-scoped chat keeps conversations relevant
- Meeting history provides immediate context

---

### 2. Structured HubSpot Agent Workflow Action (SHIPPED)

**Purpose:** Update HubSpot objects via workflow automation

**Configuration Options:**
| Setting | Description |
|---------|-------------|
| Add meetings | Provide meeting context to the agent |
| Object type | Select which HubSpot object to update |
| Search instructions | Define how to find the target object |
| Create if not found | Option to create objects that don't exist |
| Property configuration | Set up multiple properties to update |
| Property instructions | Per-property update instructions |
| Additional read properties | Context properties for the agent |
| Read before write | Additional context gathering before updates |
| Append vs replace | Choose to append to field or replace entirely |
| Human-in-the-loop | Approval workflow before execution |

**Scalability:**
- Unlimited properties per workflow
- Multiple object types supported
- Fully configurable per use case

---

### 3. Salesforce Agent (IN PROGRESS)

**Status:** Open PR pending merge

**Capabilities:**
- Update objects in Salesforce (mirror of HubSpot Agent)
- Full parity with Structured HubSpot Agent
- Same configuration options and flexibility

**Impact:**
- Closes gap for Salesforce customers
- Enables CRM-agnostic workflow automation
- Competitive positioning vs Momentum (Salesforce-only)

---

## Strategic Alignment

### Product Vision Alignment ✅
- **Action over Insights**: Features enable automated CRM updates, not just reporting
- **Human-Centered AI**: Human-in-the-loop option maintains trust
- **Integration-First**: Meets users where they work (inside HubSpot)

### Initiative Links
- **hubspot-agent-config-ui**: Direct validation of hypothesis - users can configure agents without leaving HubSpot
- **crm-exp-ete**: Structured agent action advances end-to-end CRM automation
- **composio-agent-framework**: Agent architecture patterns applicable to future integrations

---

## Key Quotes

> "On any contact and company pages within HubSpot, there will be this AskElephant card."

> "A chat feature that you can use to chat with AskElephant about this company... creating a chat on the company page with the HubSpot agent."

> "Lots of configuration options. You can add meetings to give context... set up all the properties that you want to update."

> "We'll have parity with Salesforce and HubSpot on the structured agent."

---

## Documentation Gaps Identified

### Items to Document
1. **Technical spec for HubSpot App Card** - How is authentication handled? Workspace vs user level?
2. **Structured Agent workflow action** - PRD or engineering spec needs updating with shipped features
3. **Salesforce Agent PR** - Link to PR for tracking merge status

### Follow-Up Actions
- [ ] Update `hubspot-agent-config-ui` initiative _meta.json with shipped status
- [ ] Create/update engineering spec with App Card implementation details
- [ ] Link Salesforce Agent PR to `crm-exp-ete` initiative
- [ ] Update Linear project with completed items

---

## Related Signals

- `sig-2026-01-21-crispy-product-feedback` - Partner request for HubSpot sidebar/widget
- `sig-2026-01-24-council-of-product` - Palmer widget work mentioned
- `sig-2026-01-26-council-of-product` - CRM integration discussions

## Personas Mentioned

- **Sales Rep** - Primary user of HubSpot App Card
- **RevOps** - Configures Structured Agent workflow actions
- **Sales Leader** - Benefits from automated CRM hygiene

---

## Participant

- **Palmer** (Engineering) - Presenter

---

## Next Steps

1. **Verify Salesforce Agent merge status** - Check PR progress
2. **Update initiative artifacts** - Reflect shipped features in PRD/specs
3. **Internal announcement** - Ensure team knows these features are live
4. **Customer enablement** - Documentation/training for CSMs to demo
