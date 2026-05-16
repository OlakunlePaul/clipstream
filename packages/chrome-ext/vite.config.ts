import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import webExtension, { readJsonFile } from "vite-plugin-web-extension";
import path from "path";

function makeManifest() {
  const manifest = readJsonFile("src/manifest.json");
  return manifest;
}

export default defineConfig({
  plugins: [
    react(),
    webExtension({
      manifest: makeManifest,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
