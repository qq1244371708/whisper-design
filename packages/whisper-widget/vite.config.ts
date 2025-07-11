// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      exclude: ['src/main.tsx', 'src/App.tsx', 'src/views/**/*'],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'WhisperWidget',
      formats: ['es', 'cjs'],
      fileName: format => `whisper-widget.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'dayjs', 'uuid', 'use-immer'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          dayjs: 'dayjs',
          uuid: 'uuid',
          'use-immer': 'useImmer',
        },
      },
    },
    cssCodeSplit: false, // [!] 库模式下建议关闭CSS代码分割
    sourcemap: true, // [!] 生成sourcemap便于调试
    minify: 'esbuild', // [!] 使用esbuild进行压缩，性能更好
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/variables" as *; @use "@/styles/mixins" as *;`,
      },
    },
  },
  // [!] 开发环境优化
  server: {
    port: 5173,
    open: true,
    hmr: true,
  },
});
