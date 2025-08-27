import { defineConfig } from "vitest/config.js";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",

    setupFiles: ["./src/test/setup.ts"],
    css: true,
    /*   typecheck: {
      tsconfig: "./tsconfig.app.json",
    }, */
  },
  assetsInclude: ["**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.svg"],
  define: {
    global: "globalThis",
  },
});
