# GTM Shipped-to-Customer Notification Workflow

**Created:** 2026-02-21  
**Purpose:** Design the end-to-end workflow for notifying customers when requested features ship, leveraging the HubSpot-linked Customer Requests junction database.

## 1. Goal

When a project milestone is shipped, automatically generate a target list of customers who requested the feature, prepare communication context (including metrics impact), and queue tasks for the Revenue/CS teams to perform direct outreach.

## 2. Prerequisites

- **Notion Databases:** 
  - `Initiatives`
  - `Milestones`
  - `Customer Requests` (linked to Milestones/Initiatives, HubSpot Contacts/Companies, Slack Threads)
- **Integration Points:**
  - Notion (for status triggers)
  - HubSpot (for CRM contact data)
  - PostHog/Stripe (for impacted metrics data)

## 3. Workflow Triggers

The workflow initiates when:
1. An `Initiative` Phase changes to **Launch** OR
2. A `Milestone` Status changes to **Shipped**.

## 4. Execution Steps

### Step 1: Query the Customer Requests Database
- Filter the `Customer Requests` database where `Initiative/Milestone` matches the shipped item.
- Retrieve the linked `HubSpot Company` and `HubSpot Contact` fields.
- Retrieve the original `Slack Signal` to provide context to the outreach owner.

### Step 2: Assemble Context Payload
- Fetch the **Outcome Metrics** from the `Metric Links` database (e.g., PostHog usage deltas or Stripe revenue impact).
- Fetch the **GTM Brief** or release notes from the `Documents` database linked to the Initiative.
- Combine this into a standardized summary message payload (e.g., "Feature X is now live. We saw a 25% improvement in Y during early access...").

### Step 3: Generate the Target List
- Identify the internal Revenue/CS Owners for the accounts linked in the `Customer Requests` database (via HubSpot API or local mapping).

### Step 4: Create Outreach Tasks
- **In HubSpot:** Automatically create a task assigned to the Contact Owner.
  - *Title:* "Notify [Contact Name] at [Company Name] about [Feature Name] release"
  - *Description:* Include the context payload from Step 2, a link to the original Slack signal, and a drafted outreach email template.
- **In Notion:** Update the `Status` of the corresponding `Customer Requests` rows to **Queued for Outreach**.
- **In Slack:** Send a DM to the Account Owner with a quick summary and a button/link to the HubSpot task.

### Step 5: Log Completion & Response
- When the Account Owner marks the HubSpot task as complete (or logs an email activity), sync the status back to the Notion `Customer Requests` database.
- Update the `Status` to **Notified**.
- Optionally, record any replies or renewed interest from the customer as a new signal in the `Feedback` database.

## 5. Value Realization

- **Closed Loop:** Direct line from roadmap request to shipped value to customer awareness.
- **Measurable Impact:** Outreach templates include specific metrics (PostHog/Stripe) to demonstrate real value to the customer.
- **Accountability:** Notion provides a centralized view of all "Pending Notifications" vs "Completed Notifications" tied directly to the Initiative.