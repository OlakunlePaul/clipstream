import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import webExtension, { readJsonFile } from "vite-plugin-web-extension";
import path from "path";

function makeManifest() {
  const manifest = readJsonFile("src/manifest.json");
  return manifest;
}

export default defineConfig({
  root: "src", // Set root to src so paths in manifest are relative to it
  envDir: "../",
  plugins: [
    react(),
    webExtension({
      manifest: makeManifest,
      additionalInputs: ["offscreen/index.html"],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "../dist", // Build out to packages/chrome-ext/dist
    emptyOutDir: true,
  },
});
