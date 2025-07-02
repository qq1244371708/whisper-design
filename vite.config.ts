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
      name: "demoWhisperDesign",
      formats: ["es", "cjs"],
      fileName: (format) => `[name].${format === "es" ? "mjs" : "js"}`,
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
        manualChunks: (id: string) => {
          if (id.includes("src/components/")) {
            const component = id.split("src/components/")[1].split("/")[0];
            return `components/${component}/index`;
          }
        },
        assetFileNames: (assetInfo: { name?: string }) => {
          if (assetInfo.name?.endsWith(".css")) {
            const match = assetInfo.name.match(
              /components\/([^/]+)\/index\.css/
            );
            if (match) {
              const component = match[1];
              return `components/${component}/style/index.css`;
            }
            return `assets/[name]-[hash][extname]`;
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
    cssCodeSplit: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "@/assets/css/index.scss" as *;',
      },
    },
  },
});
