import { defineConfig } from "vitest/config";
import path from "path";
import dotenv from "dotenv";

// Load env from .env.local for tests
dotenv.config({ path: path.resolve(__dirname, ".env.local") });

export default defineConfig({
  test: {
    globals: true,
    include: [
      "src/__tests__/**/*.test.ts",
      "src/**/__tests__/**/*.test.ts",
      "convex/__tests__/**/*.test.ts",
    ],
    exclude: ["node_modules", ".next"],
    // Use edge-runtime for convex/ tests (required by convex-test)
    // Use node for all other tests
    environmentMatchGlobs: [
      ["convex/**", "edge-runtime"],
      ["**", "node"],
    ],
    setupFiles: ["./src/__tests__/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        ".next/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/types.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
