// orchestrator/src/lib/files/extractText.ts

import { extractText as extractPdfText } from "unpdf";
import Papa from "papaparse";

export interface ExtractionResult {
  text: string;
  metadata: {
    fileType: "pdf" | "csv" | "txt";
    originalFileName: string;
    pageCount?: number;      // PDF only
    rowCount?: number;       // CSV only
    charCount: number;
  };
}

/**
 * Extract text from file buffer based on type
 * Main entry point for file text extraction
 */
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

/**
 * Determine file type from MIME type or extension
 */
function getFileType(mimeType: string, fileName: string): "pdf" | "csv" | "txt" {
  const extension = fileName.toLowerCase().split(".").pop();

  // Check MIME type first
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType === "text/csv") return "csv";
  if (mimeType === "text/plain") return "txt";

  // Fall back to extension
  if (extension === "pdf") return "pdf";
  if (extension === "csv") return "csv";
  if (extension === "txt") return "txt";

  throw new Error(`Unknown file type: ${mimeType} (${fileName})`);
}

/**
 * Extract text from PDF using unpdf
 * unpdf is serverless-optimized and handles most PDF formats
 */
async function extractFromPdf(buffer: Buffer, fileName: string): Promise<ExtractionResult> {
  const result = await extractPdfText(buffer, { mergePages: true });
  const text = typeof result.text === "string" ? result.text.trim() : "";

  if (!text) {
    throw new Error(
      "Could not extract text from PDF. The file may be image-only (scanned) or password-protected."
    );
  }

  return {
    text,
    metadata: {
      fileType: "pdf",
      originalFileName: fileName,
      pageCount: result.totalPages,
      charCount: text.length,
    },
  };
}

/**
 * Extract text from CSV using papaparse
 * Converts rows to readable text format for signal verbatim
 */
async function extractFromCsv(buffer: Buffer, fileName: string): Promise<ExtractionResult> {
  const csvString = buffer.toString("utf-8");

  const parseResult = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (parseResult.errors.length > 0) {
    // Log but don't fail on non-critical parse errors
    console.warn("CSV parse warnings:", parseResult.errors);
  }

  const rows = parseResult.data as Record<string, string>[];

  if (rows.length === 0) {
    throw new Error("CSV file is empty or contains no valid data rows");
  }

  // Convert to readable text format
  // Each row becomes: "Row N: field1: value1, field2: value2, ..."
  const text = rows
    .map((row, i) => {
      const values = Object.entries(row)
        .filter(([_, value]) => value !== undefined && value !== "")
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
      charCount: text.length,
    },
  };
}

/**
 * Extract text from TXT file
 * Simple UTF-8 decode with trimming
 */
async function extractFromTxt(buffer: Buffer, fileName: string): Promise<ExtractionResult> {
  const text = buffer.toString("utf-8").trim();

  if (!text) {
    throw new Error("TXT file is empty");
  }

  return {
    text,
    metadata: {
      fileType: "txt",
      originalFileName: fileName,
      charCount: text.length,
    },
  };
}
