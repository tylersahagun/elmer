import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import { resolve } from "path";

const appName = process.env.APP_NAME ?? "initiative-dashboard";

export default defineConfig({
  root: resolve(__dirname, `apps/${appName}`),
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: resolve(__dirname, `apps/dist/${appName}`),
    emptyOutDir: true,
  },
});
