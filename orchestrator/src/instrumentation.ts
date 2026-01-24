/**
 * Next.js Instrumentation Hook
 * 
 * This file is called once when the Next.js server starts.
 * We use it to auto-start the background job worker.
 */

export async function register() {
  // Only run in Node.js runtime (not Edge)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Check if we should auto-start the worker
    const shouldAutoStart = process.env.AUTO_START_WORKER !== "false";
    
    if (shouldAutoStart) {
      console.log("🚀 Auto-starting background job worker...");
      
      try {
        // Dynamic import to avoid issues during build
        const { startWorker } = await import("./lib/agent/worker");
        startWorker();
        console.log("✅ Background worker started successfully");
      } catch (error) {
        console.error("❌ Failed to auto-start worker:", error);
        // Don't throw - we don't want to prevent the app from starting
      }
    } else {
      console.log("⏸️ Worker auto-start disabled (AUTO_START_WORKER=false)");
    }
  }
}
