import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'GDL',
      fileName: (format) => `gdl.${format}.js`,
    },
    rollupOptions: {
      output: {
        globals: {
          // Add any external lib here if needed
        },
      },
    },
  },
});
