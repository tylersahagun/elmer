# Engineering Spec: Call Import Engine

## Technical Overview

Build a unified, extensible import engine that enables support-manageable call imports from external platforms. The architecture should:

1. **Abstract platform-specific logic** into discrete "import contexts"
2. **Standardize the processing pipeline** for all imported calls
3. **Support batch processing** with rate limiting and error handling
4. **Enable future extensibility** for continuous sync (not implementing now)

### Architectural Approach

```
┌─────────────────────────────────────────────────────────────┐
│                    Import Engine                             │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Gong    │  │  Grain   │  │ Dialpad  │  │  Manual  │    │
│  │ Context  │  │ Context  │  │ Context  │  │  Upload  │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       │             │             │             │           │
│       └─────────────┴─────────────┴─────────────┘           │
│                          │                                   │
│              ┌───────────▼───────────┐                      │
│              │   Unified Processor   │                      │
│              │  - Normalize metadata │                      │
│              │  - Queue transcription│                      │
│              │  - Create engagement  │                      │
│              └───────────┬───────────┘                      │
│                          │                                   │
│              ┌───────────▼───────────┐                      │
│              │  Standard Pipeline    │                      │
│              │  (transcription,      │                      │
│              │   storage, indexing)  │                      │
│              └───────────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Model Changes

### New Fields on Engagement

```typescript
interface EngagementImportMetadata {
  importSource: EngagementDataSource; // Existing enum
  importedAt: Timestamp;
  sourceCallId: string; // ID from source platform
  importBatchId: string; // Links to import job
  metadataQuality: 'full' | 'partial' | 'minimal';
}
```

### New Collection: ImportJobs

```typescript
interface ImportJob {
  id: string;
  customerId: string;
  platform: EngagementDataSource;
  status: 'queued' | 'in_progress' | 'completed' | 'failed' | 'partial';
  totalCalls: number;
  processedCalls: number;
  failedCalls: number;
  createdAt: Timestamp;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  requestedBy: string; // CS/Support user
  errors: ImportError[];
  config: ImportJobConfig;
}

interface ImportError {
  callId: string;
  error: string;
  retryable: boolean;
  timestamp: Timestamp;
}

interface ImportJobConfig {
  credentials: EncryptedCredentials; // Stored securely, deleted after use
  dateRange?: { start: Date; end: Date };
  filters?: Record<string, any>;
}
```

---

## API Changes

### Internal Admin Endpoints

```typescript
// Create import job (CS/Support only)
POST /admin/imports
Body: {
  customerId: string;
  platform: string;
  credentials: object;
  options?: { dateRange?, filters? }
}
Response: { jobId: string; estimatedCalls: number; estimatedDuration: string }

// Get import job status
GET /admin/imports/:jobId
Response: ImportJob

// List import jobs for customer
GET /admin/imports?customerId=xxx
Response: ImportJob[]

// Retry failed calls in job
POST /admin/imports/:jobId/retry
Response: { retriedCount: number }

// Cancel import job
DELETE /admin/imports/:jobId
Response: { status: 'cancelled' }
```

### Future Public Endpoints (v2)

Reserved for customer self-service:
- `POST /api/imports` - Customer-initiated import
- `GET /api/imports/:id` - Customer status check
- WebSocket for real-time progress

---

## Import Context Interface

Each platform implements a standard interface:

```typescript
interface ImportContext {
  platform: EngagementDataSource;
  
  // Validate credentials before starting import
  validateCredentials(creds: object): Promise<{ valid: boolean; error?: string }>;
  
  // Get list of calls to import (pagination supported)
  listCalls(creds: object, options: ListOptions): AsyncGenerator<SourceCall>;
  
  // Fetch single call with media and metadata
  fetchCall(creds: object, callId: string): Promise<{
    media: MediaFile;
    metadata: CallMetadata;
  }>;
  
  // Rate limit configuration
  rateLimits: {
    requestsPerSecond: number;
    requestsPerDay: number;
  };
}

interface SourceCall {
  id: string;
  title?: string;
  date: Date;
  duration: number;
  participants?: Participant[];
  mediaUrl?: string;
  transcript?: string; // If source provides
}
```

---

## Frontend Components

**None required for v1.**

Future considerations:
- Admin dashboard for import management
- Customer self-service portal

---

## Backend Services

### Affected Services

| Service | Changes |
|---------|---------|
| `media-recording-processing` | Add import job orchestration |
| `fireflies.context.ts` | Refactor to implement ImportContext interface |
| `ringcentral.context.ts` | Refactor to implement ImportContext interface |
| `gong.context.ts` | Refactor to implement ImportContext interface |
| `hubspot.context.ts` | Refactor to implement ImportContext interface |
| NEW: `grain.context.ts` | First new context (POC) |
| NEW: `import-orchestrator.ts` | Job queue management |

### New Cloud Functions

```typescript
// Scheduled job processor (runs nightly)
export const processImportQueue = functions.pubsub
  .schedule('every 1 hours from 20:00 to 08:00')
  .onRun(async () => {
    // Process queued import jobs
    // Respect rate limits (~5,000 calls per 12 hours)
  });

// Import job status webhook (for notifications)
export const onImportJobUpdate = functions.firestore
  .document('importJobs/{jobId}')
  .onUpdate(async (change) => {
    // Notify CS via Slack on status changes
  });
```

---

## Dependencies

### External
- Source platform APIs (Gong, Grain, etc.)
- GCS for media storage
- Transcription service (AssemblyAI/Google Cloud)

### Internal
- Engagement creation pipeline
- Company/Contact matching
- Slack notifications

### Packages
- No new packages required for v1
- Consider `bottleneck` for advanced rate limiting if needed

---

## Migration Strategy

### Rollout Plan

1. **Phase 1: Grain POC** (Week 1-2)
   - Implement Grain context
   - Manual trigger for Noah's import
   - Validate end-to-end flow

2. **Phase 2: Framework Extraction** (Week 2-3)
   - Abstract patterns from Grain + existing contexts
   - Create ImportContext interface
   - Build orchestrator

3. **Phase 3: Support Enablement** (Week 3-4)
   - Admin endpoints
   - Slack notifications
   - Runbook documentation

4. **Phase 4: Additional Platforms** (Ongoing)
   - Dialpad, Fathom, etc. as demand arises

### Rollback Plan

- Imports are additive (no data deletion)
- Failed imports can be cancelled and retried
- No schema migrations blocking rollback

---

## Testing Strategy

### Unit Tests
- Each ImportContext: credential validation, call listing, media fetch
- Orchestrator: queue management, error handling, rate limiting

### Integration Tests
- End-to-end import flow with mock platform API
- Transcription pipeline integration
- Engagement creation verification

### Manual Testing
- Grain POC with Noah's actual data
- Verify calls appear in meeting list
- Verify searchability and playback

### Load Testing
- Simulate 10K call import
- Verify rate limiting works
- Measure processing time

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Third-party API changes | Abstract behind context interface; alert on failures |
| Rate limit changes (like Gong incident) | Implement adaptive rate limiting; alert on 429s |
| Credential security | Encrypt at rest; delete after import; audit logging |
| Pipeline overload | Dedicated queue; night processing; separate from real-time |
| Incomplete metadata | Graceful degradation; document limitations per platform |

---

## Open Technical Questions

1. **Credential storage:** Use existing secrets manager or dedicated import credentials store?
2. **Job queue:** Cloud Tasks vs. Firestore-based queue vs. PubSub?
3. **Retry policy:** How many retries? Exponential backoff parameters?
4. **Parallel processing:** How many concurrent imports per customer? Per platform?
5. **Cleanup policy:** When do we delete import job records?

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Import throughput | 5,000 calls / 12 hours |
| Individual call processing | < 30 seconds |
| API response (job status) | < 500ms |
| Job startup time | < 1 minute from creation |

---

## Monitoring & Alerting

### Metrics to Track
- Import jobs created/completed/failed per day
- Calls processed per hour
- Error rate by platform
- Processing time p50/p95/p99

### Alerts
- Job failed after max retries
- Rate limit exceeded (429 response)
- No jobs processed in 24 hours (if jobs queued)
- Unusual error rate (>10%)
