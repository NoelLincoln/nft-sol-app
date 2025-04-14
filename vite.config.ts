import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
import rollupNodePolyFill from 'rollup-plugin-node-polyfills'
import path from 'path'
import { Plugin } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Use absolute paths for polyfilled modules
      buffer: path.resolve(__dirname, 'node_modules/buffer/'),
      process: path.resolve(__dirname, 'node_modules/process/browser.js'),
      stream: path.resolve(__dirname, 'node_modules/stream-browserify/index.js'),
      util: path.resolve(__dirname, 'node_modules/util/'),
    }
  },
  optimizeDeps: {
    include: [
      'buffer',
      'process',
      'stream',
      'util',
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: [
        NodeModulesPolyfillPlugin(), // Only include this plugin
      ]
    }
  },
  build: {
    rollupOptions: {
      plugins: [rollupNodePolyFill() as unknown as Plugin],
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    }
  },
  define: {
    global: 'globalThis',  // Ensure global object compatibility
  }
})