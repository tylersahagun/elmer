// orchestrator/src/lib/files/validators.ts

export const ACCEPTED_FILE_TYPES = {
  "application/pdf": [".pdf"],
  "text/csv": [".csv"],
  "text/plain": [".txt"],
} as const;

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_FILE_SIZE_DISPLAY = "5MB";

// Magic bytes for PDF verification
const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46]; // %PDF

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate file before upload (client-side compatible)
 * Checks: size limit, file type (MIME + extension), empty file
 */
export function validateFile(file: File): ValidationResult {
  // Size check
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${MAX_FILE_SIZE_DISPLAY}`,
    };
  }

  // Empty file check
  if (file.size === 0) {
    return {
      valid: false,
      error: "File is empty",
    };
  }

  // Type check (MIME + extension)
  const acceptedMimes = Object.keys(ACCEPTED_FILE_TYPES);
  const acceptedExtensions = Object.values(ACCEPTED_FILE_TYPES).flat() as readonly string[];
  const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;

  const mimeValid = acceptedMimes.includes(file.type);
  const extensionValid = acceptedExtensions.includes(extension);

  if (!mimeValid && !extensionValid) {
    return {
      valid: false,
      error: "Invalid file type. Accepted: PDF, CSV, TXT",
    };
  }

  return { valid: true };
}

/**
 * Server-side content validation (magic bytes check for PDFs)
 * Call after receiving buffer on server
 */
export async function validateFileContent(
  buffer: Buffer,
  mimeType: string
): Promise<ValidationResult> {
  // For PDFs, verify magic bytes to detect spoofed MIME types
  if (mimeType === "application/pdf" || mimeType.includes("pdf")) {
    const fileStart = Array.from(buffer.subarray(0, PDF_SIGNATURE.length));
    const isPdf = PDF_SIGNATURE.every((byte, i) => fileStart[i] === byte);

    if (!isPdf) {
      return {
        valid: false,
        error: "File does not appear to be a valid PDF",
      };
    }
  }

  return { valid: true };
}

/**
 * Get allowed extensions as flat array for react-dropzone accept prop
 */
export function getAllowedExtensions(): string[] {
  return Object.values(ACCEPTED_FILE_TYPES).flat();
}
