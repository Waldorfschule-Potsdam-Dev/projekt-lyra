import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function safeImportPlugin() {
  return {
    name: 'safe-import-plugin',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (source.startsWith('\0') || source.startsWith('vite/')) return null;
      // Ignore entry points and absolute/relative paths (only mock packages)
      if (!importer || source.startsWith('/') || source.startsWith('.')) return null;

      // @ts-ignore: Rollup plugin context types are not fully inferred here
      const resolved = await this.resolve(source, importer, { skipSelf: true, ...options });
      if (!resolved) {
        console.warn(`\n[SafeImport] Package "${source}" requested by "${importer}" is missing! Mocking it.\n`);
        return '\0mock-' + source;
      }
      return null;
    },
    load(id) {
      if (id.startsWith('\0mock-')) {
        return `
          import React from 'react';
          console.error("This module was missing and has been mocked:", ${JSON.stringify(id)});
          const FallbackComponent = () => React.createElement('div', { style: { color: 'red', padding: '10px', border: '1px solid red' } }, 'Missing Package: ' + ${JSON.stringify(id.replace('\0mock-', ''))});
          
          const proxy = new Proxy(FallbackComponent, {
            get: (target, prop) => {
              if (prop === '__esModule') return true;
              if (prop === 'default') return proxy;
              if (typeof prop === 'string' && prop !== 'prototype' && prop !== 'name' && prop !== 'length') {
                  return proxy;
              }
              return target[prop as keyof typeof target];
            }
          });
          export default proxy;
        `;
      }
    }
  };
}

export default defineConfig({
  plugins: [react(), safeImportPlugin()],
  server: {
    hmr: {
      overlay: false,
    },
  },
  optimizeDeps: {
    force: false,
  },
  cacheDir: process.env.VITE_CACHE_DIR || "node_modules/.vite",
});
