// orchestrator/src/lib/files/index.ts

export {
  extractTextFromFile,
  type ExtractionResult,
} from "./extractText";

export {
  validateFile,
  validateFileContent,
  getAllowedExtensions,
  ACCEPTED_FILE_TYPES,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_DISPLAY,
  type ValidationResult,
} from "./validators";
