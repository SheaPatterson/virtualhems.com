import { defineConfig } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";

export default defineConfig(({ mode }) => {
  const isElectron = process.env.ELECTRON === 'true' || mode === 'electron';

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      dyadComponentTagger(),
      react(),
      isElectron && electron([
        {
          // Main-process entry point of the Electron App.
          entry: 'electron/main.ts',
          onready(options) {
            options.spawn();
          },
          vite: {
            build: {
              outDir: 'dist-electron',
            },
          },
        },
        {
          entry: 'electron/preload.ts',
          onready(options) {
            // Notify the Renderer-Process to reload the page when the Preload-Scripts build is complete, 
            // instead of restarting the entire Electron App.
            options.reload();
          },
          vite: {
            build: {
              outDir: 'dist-electron',
            },
          },
        },
      ]),
      isElectron && renderer(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    }
  };
});