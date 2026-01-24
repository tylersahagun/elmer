"use client";

import { useCallback } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ACCEPTED_FILE_TYPES,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_DISPLAY,
} from "@/lib/files";

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
        // Error will be shown via parent state
        const firstError = rejections[0].errors[0];
        console.error("File rejected:", firstError.message);
        return;
      }
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: ACCEPTED_FILE_TYPES,
      maxSize: MAX_FILE_SIZE_BYTES,
      multiple: false,
      disabled,
    });

  // Derive error message from rejections if not provided
  const rejectionError =
    fileRejections.length > 0
      ? fileRejections[0].errors[0].code === "file-too-large"
        ? `File too large. Maximum size is ${MAX_FILE_SIZE_DISPLAY}`
        : fileRejections[0].errors[0].code === "file-invalid-type"
          ? "Invalid file type. Accepted: PDF, CSV, TXT"
          : fileRejections[0].errors[0].message
      : undefined;

  const displayError = error || rejectionError;

  // Show selected file preview
  if (file) {
    return (
      <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/30">
        <div className="flex items-center gap-3 min-w-0">
          <FileText className="w-8 h-8 text-muted-foreground flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-medium truncate">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatFileSize(file.size)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onFileClear}
          className="p-1 hover:bg-muted rounded flex-shrink-0"
          disabled={disabled}
          aria-label="Remove file"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // Show dropzone
  return (
    <div
      {...getRootProps()}
      className={cn(
        "p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors",
        isDragActive && "border-primary bg-primary/5",
        !isDragActive && !displayError && "border-border hover:border-muted-foreground",
        displayError && "border-destructive",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <input {...getInputProps()} />
      <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
      <p className="mb-2 text-sm font-medium">
        {isDragActive
          ? "Drop the file here"
          : "Drag and drop a file, or click to select"}
      </p>
      <p className="text-xs text-muted-foreground">
        PDF, CSV, or TXT files up to {MAX_FILE_SIZE_DISPLAY}
      </p>
      {displayError && (
        <p className="mt-2 text-sm text-destructive">{displayError}</p>
      )}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
