import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'GDL',
      fileName: (format) => `gdl.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      output: {
        globals: {
          // Add external libs here if needed
        },
      },
    },
  },
  plugins: [dts({
    outputDir: 'dist',
    insertTypesEntry: true,
  })],
});
