export interface ExportSyncResult {
  status: "synced" | "failed";
  error?: string;
}

export async function runSecondaryExport(
  label: string,
  sync: () => Promise<void>,
): Promise<ExportSyncResult> {
  try {
    await sync();
    return { status: "synced" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : `${label} export failed`;
    console.error(`[${label}] export failed:`, error);
    return {
      status: "failed",
      error: message,
    };
  }
}
