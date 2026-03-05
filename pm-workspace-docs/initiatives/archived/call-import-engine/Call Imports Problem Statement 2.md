## Overview

Call Imports provides a unified system for ingesting call recordings from various sources into AskElephant for AI-powered analysis. Whether recordings come from conversation intelligence platforms like Gong, telephony systems like RingCentral, or direct file uploads, Call Imports normalizes them into a consistent format for processing.

Designed for teams with existing call recording infrastructure, this feature eliminates the need to change recording tools while still benefiting from AskElephant's AI analysis. Organizations can continue using their preferred recording solutions while centralizing intelligence extraction.

The import system supports both automated integrations (webhooks, scheduled syncs) and manual uploads, providing flexibility for different organizational needs and compliance requirements.

## Core Problem Solved

Organizations often have call recordings scattered across multiple platforms - sales calls in Gong, support calls in RingCentral, phone calls in HubSpot. Call Imports consolidates these sources, enabling unified analysis and insights across all customer conversations regardless of where they were recorded.

## Key Capabilities

- **Fireflies Import**: Sync recordings from [Fireflies.ai](http://Fireflies.ai) with automatic engagement creation
- **RingCentral Import**: Import phone call recordings from RingCentral telephony
- **Gong Import**: Sync call recordings from [Gong.io](http://Gong.io) conversation intelligence
- **HubSpot Calls**: Import call recordings logged in HubSpot CRM (every 10 minutes)
- **Zapier Import**: Receive recordings via Zapier webhooks from any connected source
- **Manual Upload**: Direct file upload for recordings from any source

## How It Works

1. **Connect Source**: Set up the integration with your recording source (Gong, RingCentral, etc.) or enable upload.
2. **Configure Sync**: Set up automatic sync schedules or webhook endpoints for real-time import.
3. **Recording Detection**: When new recordings are available, the system detects and queues them for import.
4. **Engagement Creation**: Each recording creates an engagement record with metadata (participants, duration, date).
5. **Processing Pipeline**: Imported recordings enter the transcription and analysis pipeline like native recordings.

## Technical Reference

- **Primary components**: `functions/src/contexts/media-recording-processing/`
- **Import contexts**: `fireflies.context.ts`, `ringcentral.context.ts`, `gong.context.ts`, `hubspot.context.ts`, `zapier.context.ts`
- **Upload handler**: `uploads.functions.ts`
- **Data source enum**: `EngagementDataSource.GONG`, `FIREFLIES`, `RINGCENTRAL`, `HUBSPOT`, `ZAPIER`, `UPLOAD`
- **HubSpot interval**: 10 minutes (`HUBSPOT_CALL_IMPORT_INTERVAL_MINUTES`)

## Configuration Options

- **Source Selection**: Enable/disable specific import sources based on your stack
- **Sync Frequency**: Configure how often automated imports run
- **Participant Matching**: Map external user IDs to AskElephant users/contacts
- **Duplicate Detection**: Prevent re-importing already processed recordings

## Common Use Cases

1. **Gong Consolidation**: Already using Gong for recording? Import those recordings for additional AskElephant analysis
2. **Phone + Video**: Combine RingCentral phone calls with Zoom video meetings in one intelligence platform
3. **Historical Import**: Upload historical recordings to build a complete conversation database
4. **Multi-Channel Analysis**: Analyze patterns across phone, video, and in-person (uploaded) conversations

## Known Limitations

- Import quality depends on source recording quality
- Participant matching requires email addresses in source system
- Some sources may have API rate limits affecting sync frequency
- Large files may require chunked upload for manual imports
- Processing time varies based on recording length and queue depth

## Related Product Areas

- **Zoom Integration**: Native recording capture vs import
- **Meetings & Recordings**: Where imported recordings appear
- **Companies & Contacts**: Participant matching and association
- **HubSpot Integration**: Includes call import as part of CRM integration