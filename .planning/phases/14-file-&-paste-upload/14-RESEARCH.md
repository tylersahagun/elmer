# Phase 14: File & Paste Upload - Research

**Researched:** 2026-01-22
**Domain:** File upload, document parsing, drag-drop UI, serverless file handling
**Confidence:** HIGH

## Summary

Phase 14 extends signal ingestion with file upload capability (PDF, CSV, TXT) and enhances the paste interface. The research confirms all necessary primitives exist in the codebase - the existing CreateSignalModal provides the paste interface pattern, and there's already an upload API route at `/api/uploads`. The key decision is whether to use Vercel Blob (for production-grade file storage) or continue with local filesystem storage.

Key findings:

1. **Storage Strategy:** Use Vercel Blob for production (bypasses 4.5MB serverless limit), fall back to local storage for development. Files are transient - extract text, create signal, optionally delete original.
2. **File Parsing:** Use `unpdf` for PDF extraction (serverless-compatible), `papaparse` for CSV parsing (fast, RFC-compliant). Plain text requires no library.
3. **UI Pattern:** Use `react-dropzone` for drag-and-drop with file type validation. Extend existing CreateSignalModal with tabbed interface (Paste | Upload).
4. **Processing Flow:** Queue-first pattern from Phase 13 applies here. Upload file -> extract text -> create signal with source="upload" and file metadata.

**Primary recommendation:** Extend CreateSignalModal with tabs for "Paste" and "Upload" modes. For upload mode, use react-dropzone for file selection, client-side file validation, then server-side text extraction before signal creation. Files are processed server-side, text extracted, signal created, original file can be discarded (or kept for audit trail).

## Standard Stack

### New Dependencies Required
| Library | Version | Purpose | Why This Library |
|---------|---------|---------|------------------|
| react-dropzone | ^14.x | Drag-and-drop file input | De facto standard for React file drops, hooks-based API, lightweight |
| unpdf | ^0.12.x | PDF text extraction | Serverless-optimized, modern alternative to pdf-parse, zero native deps |
| papaparse | ^5.x | CSV parsing | Fastest JS CSV parser, RFC 4180 compliant, streaming support |
| @vercel/blob | ^0.27.x | File storage (optional) | Bypasses 4.5MB limit, production-grade, but adds Vercel dependency |

### Existing (No Changes Needed)
| Library | Version | Purpose |
|---------|---------|---------|
| @tanstack/react-query | ^5.90.18 | Mutations for upload/signal creation |
| next | 16.1.3 | API routes, after() for async processing |
| @radix-ui/react-tabs | ^1.1.13 | Tab interface for Paste/Upload modes |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-dropzone | Native input type="file" | Less UX polish, no drag-drop preview |
| unpdf | pdf-parse | pdf-parse is unmaintained since 2019 |
| unpdf | pdf.js-extract | More complex setup, larger bundle |
| papaparse | csv-parse | papaparse is faster, better error handling |
| Vercel Blob | Local filesystem | 4.5MB limit on serverless, no CDN, dev-only viable |
| Vercel Blob | AWS S3 | More setup complexity, additional infrastructure |

**Installation:**
```bash
npm install react-dropzone unpdf papaparse
# Optional for production file storage:
npm install @vercel/blob
```

## Architecture Patterns

### Recommended Project Structure
```
orchestrator/src/
├── app/api/
│   └── signals/
│       └── upload/
│           └── route.ts           # File upload + text extraction + signal creation
├── components/signals/
│   ├── CreateSignalModal.tsx      # MODIFY: Add tabbed interface
│   ├── FileDropZone.tsx           # NEW: Drag-drop file input component
│   └── FileUploadTab.tsx          # NEW: Upload tab content
└── lib/
    └── files/
        ├── index.ts               # Exports
        ├── extractText.ts         # PDF, CSV, TXT text extraction
        └── validators.ts          # File type and size validation
```

### Pattern 1: Tabbed Create Signal Modal
**What:** Extend CreateSignalModal with Radix Tabs for Paste vs Upload modes
**When to use:** Single modal handles both manual paste and file upload
**Example:**
```typescript
// Modified CreateSignalModal.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploadTab } from "./FileUploadTab";

export function CreateSignalModal({ workspaceId, isOpen, onClose, onSuccess }: Props) {
  const [activeTab, setActiveTab] = useState("paste");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Signal</DialogTitle>
          <DialogDescription>
            Add user feedback by pasting text or uploading a file.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="paste">Paste Text</TabsTrigger>
            <TabsTrigger value="upload">Upload File</TabsTrigger>
          </TabsList>

          <TabsContent value="paste">
            {/* Existing paste form */}
          </TabsContent>

          <TabsContent value="upload">
            <FileUploadTab
              workspaceId={workspaceId}
              onSuccess={onSuccess}
              onClose={onClose}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
```

### Pattern 2: File Drop Zone with react-dropzone
**What:** Drag-and-drop file input with preview and validation
**When to use:** File upload UI
**Example:**
```typescript
// FileDropZone.tsx
"use client";

import { useCallback } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { Upload, File, X } from "lucide-react";

const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "text/csv": [".csv"],
  "text/plain": [".txt"],
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface FileDropZoneProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  onFileClear: () => void;
  error?: string;
  disabled?: boolean;
}

export function FileDropZone({
  file,
  onFileSelect,
  onFileClear,
  error,
  disabled,
}: FileDropZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[], rejections: FileRejection[]) => {
      if (rejections.length > 0) {
        // Handle rejection (file type, size)
        console.error("File rejected:", rejections[0].errors);
        return;
      }
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    disabled,
  });

  if (file) {
    return (
      <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/30">
        <div className="flex items-center gap-3">
          <File className="w-8 h-8 text-muted-foreground" />
          <div>
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
        </div>
        <button
          onClick={onFileClear}
          className="p-1 hover:bg-muted rounded"
          disabled={disabled}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`
        p-8 border-2 border-dashed rounded-lg text-center cursor-pointer
        transition-colors
        ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"}
        ${error ? "border-red-500" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <input {...getInputProps()} />
      <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
      <p className="mb-2 text-sm font-medium">
        {isDragActive ? "Drop the file here" : "Drag and drop a file, or click to select"}
      </p>
      <p className="text-xs text-muted-foreground">
        PDF, CSV, or TXT files up to 5MB
      </p>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
```

### Pattern 3: Server-Side Text Extraction
**What:** Extract text from uploaded files using unpdf and papaparse
**When to use:** API route that processes uploaded files
**Example:**
```typescript
// lib/files/extractText.ts
import { extractText as extractPdfText } from "unpdf";
import Papa from "papaparse";

export interface ExtractionResult {
  text: string;
  metadata: {
    fileType: "pdf" | "csv" | "txt";
    originalFileName: string;
    pageCount?: number;
    rowCount?: number;
  };
}

export async function extractTextFromFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<ExtractionResult> {
  const fileType = getFileType(mimeType, fileName);

  switch (fileType) {
    case "pdf":
      return extractFromPdf(buffer, fileName);
    case "csv":
      return extractFromCsv(buffer, fileName);
    case "txt":
      return extractFromTxt(buffer, fileName);
    default:
      throw new Error(`Unsupported file type: ${mimeType}`);
  }
}

function getFileType(mimeType: string, fileName: string): "pdf" | "csv" | "txt" {
  if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) return "pdf";
  if (mimeType === "text/csv" || fileName.endsWith(".csv")) return "csv";
  if (mimeType === "text/plain" || fileName.endsWith(".txt")) return "txt";
  throw new Error(`Unknown file type: ${mimeType}`);
}

async function extractFromPdf(buffer: Buffer, fileName: string): Promise<ExtractionResult> {
  const { text, totalPages } = await extractPdfText(buffer, { mergePages: true });

  return {
    text: text.trim(),
    metadata: {
      fileType: "pdf",
      originalFileName: fileName,
      pageCount: totalPages,
    },
  };
}

async function extractFromCsv(buffer: Buffer, fileName: string): Promise<ExtractionResult> {
  const csvString = buffer.toString("utf-8");
  const result = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true,
  });

  // Convert CSV rows to readable text format
  const rows = result.data as Record<string, string>[];
  const text = rows
    .map((row, i) => {
      const values = Object.entries(row)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
      return `Row ${i + 1}: ${values}`;
    })
    .join("\n");

  return {
    text,
    metadata: {
      fileType: "csv",
      originalFileName: fileName,
      rowCount: rows.length,
    },
  };
}

async function extractFromTxt(buffer: Buffer, fileName: string): Promise<ExtractionResult> {
  const text = buffer.toString("utf-8").trim();

  return {
    text,
    metadata: {
      fileType: "txt",
      originalFileName: fileName,
    },
  };
}
```

### Pattern 4: Upload API Route with Queue-First Processing
**What:** Handle file upload, extract text, create signal
**When to use:** /api/signals/upload endpoint
**Example:**
```typescript
// app/api/signals/upload/route.ts
import { after } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import { requireWorkspaceAccess } from "@/lib/permissions";
import { extractTextFromFile } from "@/lib/files/extractText";
import { db } from "@/lib/db";
import { signals, activityLogs } from "@/lib/db/schema";
import { nanoid } from "nanoid";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["application/pdf", "text/csv", "text/plain"];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const workspaceId = formData.get("workspaceId") as string | null;
    const interpretation = formData.get("interpretation") as string | null;

    // Validation
    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }
    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type) && !isAllowedByExtension(file.name)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // Permission check
    await requireWorkspaceAccess(workspaceId, "member");

    // Convert file to buffer and extract text
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const extraction = await extractTextFromFile(buffer, file.name, file.type);

    if (!extraction.text || extraction.text.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not extract text from file" },
        { status: 400 }
      );
    }

    // Create signal with extracted text
    const signalId = nanoid();
    const [signal] = await db.insert(signals).values({
      id: signalId,
      workspaceId,
      verbatim: extraction.text,
      interpretation: interpretation || undefined,
      source: "upload",
      sourceRef: `upload-${Date.now()}-${file.name}`,
      sourceMetadata: {
        fileName: file.name,
        fileSize: file.size,
        fileType: extraction.metadata.fileType,
        ...extraction.metadata,
      },
      status: "new",
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    // Log activity asynchronously
    after(async () => {
      await db.insert(activityLogs).values({
        id: nanoid(),
        workspaceId,
        action: "signal.created",
        targetType: "signal",
        targetId: signalId,
        metadata: {
          source: "upload",
          fileName: file.name,
          fileType: extraction.metadata.fileType,
        },
        createdAt: new Date(),
      });
    });

    return NextResponse.json({
      success: true,
      signal: {
        id: signal.id,
        verbatim: signal.verbatim.slice(0, 200) + (signal.verbatim.length > 200 ? "..." : ""),
        source: signal.source,
      },
      extraction: {
        fileType: extraction.metadata.fileType,
        textLength: extraction.text.length,
        ...extraction.metadata,
      },
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}

function isAllowedByExtension(fileName: string): boolean {
  const ext = fileName.toLowerCase().split(".").pop();
  return ["pdf", "csv", "txt"].includes(ext || "");
}
```

### Anti-Patterns to Avoid
- **Storing files permanently without need:** If you only need the text, don't keep the file. Extract and discard.
- **Processing large files synchronously:** For files > 2MB, consider chunked processing or streaming.
- **Trusting client-provided MIME types alone:** Always validate by extension AND content.
- **Using pdf-parse:** It's unmaintained. Use unpdf instead.
- **Not handling empty extraction:** Some PDFs are image-only (scanned). Fail gracefully.
- **Missing file size limits:** Always enforce on both client and server.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag-drop file input | Native HTML5 DnD API | react-dropzone | Handles edge cases, preview, validation |
| PDF text extraction | Call pdf.js directly | unpdf | Serverless-optimized, simpler API |
| CSV parsing | String.split() | papaparse | Handles quotes, escapes, headers properly |
| File type detection | MIME type only | Extension + MIME + magic bytes | MIME can be spoofed |
| Large file uploads | Server-side formData | Vercel Blob client upload | Bypasses 4.5MB limit |

**Key insight:** File handling has many edge cases (encoding, malformed files, binary vs text). Use battle-tested libraries.

## Common Pitfalls

### Pitfall 1: Serverless 4.5MB Body Limit
**What goes wrong:** Uploads fail with 413 error on Vercel for files > 4.5MB
**Why it happens:** Vercel serverless functions have 4.5MB request body limit
**How to avoid:**
- Option A: Set 5MB client-side limit (enforcement at UI level)
- Option B: Use Vercel Blob client uploads for larger files
**Warning signs:** 413 FUNCTION_PAYLOAD_TOO_LARGE errors in production

### Pitfall 2: Image-Only PDFs Return Empty Text
**What goes wrong:** User uploads scanned document, signal created with empty verbatim
**Why it happens:** PDF is images without OCR text layer
**How to avoid:** Check extraction result before creating signal, return helpful error
**Warning signs:** Signals with empty or near-empty verbatim field

### Pitfall 3: CSV Without Headers Parsed Incorrectly
**What goes wrong:** First row treated as data, column names become Row0-N
**Why it happens:** papaparse header: true assumes first row is headers
**How to avoid:** Provide UI option for "first row is header" or auto-detect
**Warning signs:** Weird column names, missing first row of data

### Pitfall 4: Large File Blocks UI
**What goes wrong:** Browser freezes during large file upload/processing
**Why it happens:** Synchronous file reading/processing on main thread
**How to avoid:** Show progress indicator, process in chunks, use Web Workers if needed
**Warning signs:** Unresponsive page during upload

### Pitfall 5: Character Encoding Issues
**What goes wrong:** Garbled text from non-UTF8 files
**Why it happens:** TXT/CSV files may use different encodings (Latin-1, Windows-1252)
**How to avoid:** Detect encoding or default to UTF-8 with error replacement
**Warning signs:** Special characters appear as ???? or garbage

### Pitfall 6: Missing Client-Side Validation
**What goes wrong:** User uploads 100MB video file, waits, then gets error
**Why it happens:** Only server validates file type/size
**How to avoid:** Validate in react-dropzone BEFORE upload starts
**Warning signs:** Slow upload attempts that fail at server

## Code Examples

### File Upload Tab Component
```typescript
// FileUploadTab.tsx
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { FileDropZone } from "./FileDropZone";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";

interface FileUploadTabProps {
  workspaceId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function FileUploadTab({ workspaceId, onSuccess, onClose }: FileUploadTabProps) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [interpretation, setInterpretation] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("No file selected");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("workspaceId", workspaceId);
      if (interpretation.trim()) {
        formData.append("interpretation", interpretation);
      }

      const res = await fetch("/api/signals/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Upload failed");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signals", workspaceId] });
      setFile(null);
      setInterpretation("");
      setUploadError(null);
      onSuccess();
      onClose();
    },
    onError: (error: Error) => {
      setUploadError(error.message);
    },
  });

  const handleUpload = () => {
    setUploadError(null);
    uploadMutation.mutate();
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>File</Label>
        <FileDropZone
          file={file}
          onFileSelect={(f) => {
            setFile(f);
            setUploadError(null);
          }}
          onFileClear={() => setFile(null)}
          error={uploadError || undefined}
          disabled={uploadMutation.isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="upload-interpretation">Interpretation (optional)</Label>
        <Textarea
          id="upload-interpretation"
          placeholder="What does this document tell us?"
          value={interpretation}
          onChange={(e) => setInterpretation(e.target.value)}
          rows={2}
          disabled={uploadMutation.isPending}
          className="resize-none"
        />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={uploadMutation.isPending}>
          Cancel
        </Button>
        <Button onClick={handleUpload} disabled={!file || uploadMutation.isPending}>
          {uploadMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Upload & Create Signal
        </Button>
      </DialogFooter>
    </div>
  );
}
```

### File Validation Utilities
```typescript
// lib/files/validators.ts

export const ACCEPTED_FILE_TYPES = {
  "application/pdf": [".pdf"],
  "text/csv": [".csv"],
  "text/plain": [".txt"],
} as const;

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_FILE_SIZE_DISPLAY = "5MB";

// Magic bytes for file type verification
const FILE_SIGNATURES = {
  pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
};

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(file: File): ValidationResult {
  // Size check
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${MAX_FILE_SIZE_DISPLAY}`,
    };
  }

  // Type check (MIME + extension)
  const acceptedMimes = Object.keys(ACCEPTED_FILE_TYPES);
  const acceptedExtensions = Object.values(ACCEPTED_FILE_TYPES).flat();
  const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;

  const mimeValid = acceptedMimes.includes(file.type);
  const extensionValid = acceptedExtensions.includes(extension);

  if (!mimeValid && !extensionValid) {
    return {
      valid: false,
      error: "Invalid file type. Accepted: PDF, CSV, TXT",
    };
  }

  // Empty file check
  if (file.size === 0) {
    return {
      valid: false,
      error: "File is empty",
    };
  }

  return { valid: true };
}

export async function validateFileContent(buffer: Buffer, mimeType: string): Promise<ValidationResult> {
  // For PDFs, verify magic bytes
  if (mimeType === "application/pdf") {
    const signature = FILE_SIGNATURES.pdf;
    const fileStart = Array.from(buffer.subarray(0, signature.length));
    const isPdf = signature.every((byte, i) => fileStart[i] === byte);

    if (!isPdf) {
      return {
        valid: false,
        error: "File does not appear to be a valid PDF",
      };
    }
  }

  return { valid: true };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| pdf-parse | unpdf | 2024+ | unpdf is maintained, serverless-ready |
| Custom drag-drop | react-dropzone | Standard practice | Better UX, accessibility |
| Server uploads only | Client uploads (Vercel Blob) | 2023+ | Bypasses size limits |
| formidable/multer | Native FormData | Next.js 13+ | Simpler in App Router |
| Store files always | Extract and discard | Domain-specific | Less storage, simpler cleanup |

**Deprecated/outdated:**
- `pdf-parse` - Last updated 2019, use `unpdf` instead
- `formidable` in App Router - Native `request.formData()` is preferred
- Server-side file streaming for small files - Just read buffer for < 5MB

## Open Questions

Things that couldn't be fully resolved:

1. **Vercel Blob vs Local Storage**
   - What we know: Vercel Blob bypasses 4.5MB limit, provides CDN
   - What's unclear: Is storing original files needed for audit trail?
   - Recommendation: **Start with local storage for MVP, 5MB limit enforced client-side.** Add Vercel Blob later if needed for larger files or audit trail.

2. **CSV Signal Structure**
   - What we know: CSV has multiple rows, each could be a separate signal
   - What's unclear: Should one CSV create one signal (all text) or many signals (one per row)?
   - Recommendation: **Start with single signal per file.** Add "Create signal per row" option later if needed.

3. **Paste with Source Selection Enhancement**
   - What we know: INGST-05 mentions "source selection" for paste
   - What's unclear: Is the current source dropdown (paste, interview, email, other) sufficient?
   - Recommendation: **Current UI satisfies requirement.** The source dropdown already exists in CreateSignalModal.

4. **File Retention Policy**
   - What we know: Files could be discarded after text extraction
   - What's unclear: Compliance or audit requirements for keeping originals
   - Recommendation: **Don't store files initially.** Text extraction is the goal; add storage later if needed.

## Gap Analysis: Requirements Review

| Requirement | Research Finding | Recommendation |
|-------------|------------------|----------------|
| INGST-04: File upload for documents and transcripts | Use react-dropzone + unpdf + papaparse | Full implementation covered |
| INGST-05: Paste text entry with source selection | Already exists in CreateSignalModal | No changes needed, just add Upload tab |
| PDF support | unpdf extracts text, serverless-compatible | Use unpdf |
| CSV support | papaparse parses with streaming | Use papaparse |
| TXT support | Buffer.toString("utf-8") | Native Node.js |
| 4.5MB limit workaround | Enforce 5MB client-side OR use Vercel Blob | Start with 5MB limit |

**All requirements can be met with the proposed stack. No blockers identified.**

## Roadmap Implications

Based on this research, the phase should be structured as:

1. **Plan 1: File Parsing Infrastructure**
   - Add unpdf, papaparse dependencies
   - Create lib/files/extractText.ts
   - Create lib/files/validators.ts
   - Unit test text extraction

2. **Plan 2: Upload API & Signal Creation**
   - Create /api/signals/upload route
   - Handle FormData, extract text, create signal
   - Source = "upload", store file metadata in sourceMetadata
   - Reuse queue-first pattern from Phase 13

3. **Plan 3: Upload UI Components**
   - Create FileDropZone component
   - Create FileUploadTab component
   - Extend CreateSignalModal with tabs (Paste | Upload)
   - Wire to upload API

**Phase ordering rationale:**
- Infrastructure first (parsing libs) enables API testing
- API second enables manual testing before UI
- UI last, integrates with working backend

## Sources

### Primary (HIGH confidence)
- [Vercel Blob Client Uploads](https://vercel.com/docs/vercel-blob/client-upload) - Client upload pattern, bypassing 4.5MB limit
- [unpdf GitHub](https://github.com/unjs/unpdf) - PDF extraction API, serverless compatibility
- [react-dropzone GitHub](https://github.com/react-dropzone/react-dropzone) - useDropzone hook API
- [Papa Parse Documentation](https://www.papaparse.com/) - CSV parsing features
- Existing codebase: CreateSignalModal.tsx, /api/uploads/route.ts, signals schema

### Secondary (MEDIUM confidence)
- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) - Security validation patterns
- [Vercel Serverless Limits](https://vercel.com/docs/limits) - 4.5MB body limit documentation
- [7 PDF Parsing Libraries for Node.js](https://strapi.io/blog/7-best-javascript-pdf-parsing-libraries-nodejs-2025) - Library comparison

### Tertiary (LOW confidence)
- Community patterns for CSV-to-signals conversion - Limited official guidance

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Libraries verified against npm and official docs
- Architecture patterns: HIGH - Based on existing codebase patterns (CreateSignalModal, webhook processing)
- File parsing: HIGH - unpdf and papaparse are well-documented
- Security: MEDIUM - OWASP patterns, but file upload security is always nuanced

**Research date:** 2026-01-22
**Valid until:** 90 days (file handling libraries are stable)
