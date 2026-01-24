---
phase: 14-file-and-paste-upload
plan: 01
subsystem: api
tags: [unpdf, papaparse, pdf-extraction, csv-parsing, file-validation]

# Dependency graph
requires:
  - phase: 13-webhook-ingestion
    provides: Signal creation patterns, queue-first processing
provides:
  - File text extraction utilities for PDF, CSV, TXT
  - File validation utilities with size and type checks
  - Magic bytes verification for PDF security
affects: [14-02-upload-api, 14-03-upload-ui]

# Tech tracking
tech-stack:
  added: [unpdf@1.4.0, papaparse@5.5.3, @types/papaparse@5.5.2]
  patterns: [file-type-detection, magic-byte-verification]

key-files:
  created:
    - orchestrator/src/lib/files/extractText.ts
    - orchestrator/src/lib/files/validators.ts
    - orchestrator/src/lib/files/index.ts
  modified:
    - orchestrator/package.json

key-decisions:
  - "5MB file size limit to stay under Vercel serverless 4.5MB body limit"
  - "Both MIME type AND extension checked for defense in depth"
  - "Magic bytes verification for PDFs to detect spoofed MIME types"
  - "CSV rows converted to readable text format for signal verbatim"

patterns-established:
  - "File validation: Client-side checks before upload, server-side content verification"
  - "Text extraction: Type detection by MIME then extension fallback"
  - "Error handling: Descriptive errors for empty/unreadable content"

# Metrics
duration: 8min
completed: 2026-01-23
---

# Phase 14 Plan 01: File Parsing Infrastructure Summary

**Text extraction and validation utilities for PDF/CSV/TXT using unpdf and papaparse with magic byte verification**

## Performance

- **Duration:** 8 min
- **Started:** 2026-01-23T08:39:00Z
- **Completed:** 2026-01-23T08:47:00Z
- **Tasks:** 4
- **Files modified:** 4

## Accomplishments
- Installed unpdf and papaparse with TypeScript types
- Created extractTextFromFile() utility for PDF, CSV, TXT extraction
- Created validateFile() and validateFileContent() for client/server validation
- Set up barrel exports for clean @/lib/files imports

## Task Commits

Each task was committed atomically:

1. **Task 1: Add file parsing dependencies** - `8865e3c` (chore)
2. **Task 2: Create file validation utilities** - `2da2de2` (feat)
3. **Task 3: Create text extraction utilities** - `0c6e301` (feat)
4. **Task 4: Create barrel exports for files module** - `178a420` (feat)

## Files Created/Modified
- `orchestrator/package.json` - Added unpdf, papaparse, @types/papaparse
- `orchestrator/src/lib/files/extractText.ts` - PDF/CSV/TXT text extraction with metadata
- `orchestrator/src/lib/files/validators.ts` - File size, type, and content validation
- `orchestrator/src/lib/files/index.ts` - Barrel exports for clean imports

## Decisions Made
- 5MB client-side limit enforced to stay within Vercel 4.5MB serverless body limit
- PDF validation uses magic bytes (%PDF signature) to detect MIME type spoofing
- CSV parsing with header:true converts rows to "Row N: key: value" readable format
- Both MIME type and extension checked for file type validation (defense in depth)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript error with flat() type inference**
- **Found during:** Task 2 (Create file validation utilities)
- **Issue:** `Object.values(ACCEPTED_FILE_TYPES).flat()` produced readonly literal array type, `includes()` rejected string parameter
- **Fix:** Added explicit cast `as readonly string[]` to acceptedExtensions
- **Files modified:** orchestrator/src/lib/files/validators.ts
- **Verification:** TypeScript compiles without errors
- **Committed in:** 2da2de2 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor TypeScript type fix. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- File parsing infrastructure complete and ready for 14-02 (Upload API)
- extractTextFromFile() provides single entry point for text extraction
- Validation utilities ready for both client-side and server-side use
- No blockers for continuing to Plan 02

---
*Phase: 14-file-and-paste-upload*
*Completed: 2026-01-23*
