import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  publicDir: command === "build" ? false : "public",

  build: {
    outDir: "wordpress/italiano-bello-games/assets/bundles",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        "global": "src/plugin/global-entry.js",
        "conversation-cards": "src/games/conversation-cards/entry.js"
      },
      output: {
        entryFileNames: "[name].bundle.js",
        assetFileNames: "[name][extname]"
      }
    }
  }
}));
