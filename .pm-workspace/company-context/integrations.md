# Integration Landscape

## CRM Integrations

### HubSpot

- **Status:** Production
- **Sync:** Bi-directional
- **Features:** Contact sync, deal updates, activity logging, meeting notes
- **Auth:** OAuth 2.0

### Salesforce

- **Status:** Production
- **Sync:** Bi-directional
- **Features:** Contact/Lead sync, Opportunity updates, Task creation
- **Auth:** OAuth 2.0

## Communication Platforms

### Slack

- **Status:** Production
- **Features:** Notifications, meeting summaries, action items
- **Auth:** OAuth 2.0

### Notion

- **Status:** Production
- **Features:** Meeting notes sync, knowledge base integration
- **Auth:** OAuth 2.0

## Meeting Platforms

### Zoom

- **Status:** Production
- **Features:** Bot recording, real-time transcription
- **Auth:** OAuth 2.0

### Google Meet

- **Status:** Production
- **Features:** Bot recording, calendar integration
- **Auth:** OAuth 2.0

### Microsoft Teams

- **Status:** Production
- **Features:** Bot recording, Teams app
- **Auth:** OAuth 2.0 / Azure AD

## Data Flow

1. Meeting recorded via bot
2. Audio transcribed to text
3. AI extracts insights, actions, moments
4. Data synced to connected CRMs
5. Notifications sent to Slack/Teams
6. Notes optionally synced to Notion
