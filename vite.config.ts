// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "AIChatRoomComponents", // New library name
      formats: ["es", "cjs"],
      fileName: (format) => `ai-chat-room-components.${format === "es" ? "mjs" : "js"}`,
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
        // Removed manualChunks and assetFileNames for simpler library bundling
      },
    },
    cssCodeSplit: true,
  },
  css: {
    // Removed preprocessorOptions for simpler library bundling
  },
});
