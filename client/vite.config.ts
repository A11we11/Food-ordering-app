/* import { defineConfig } from "vitest/config.js"; */
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  test: {
    globals: true,
    environment: "jsdom",

    setupFiles: ["./src/test/setup.ts", "./src/setupTests.ts"],

    css: true,
    /*   typecheck: {
      tsconfig: "./tsconfig.app.json",
    }, */
    typecheck: {
      tsconfig: "tsconfig.test.json",
    },
  },
  assetsInclude: ["**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.svg"],
  define: {
    global: "globalThis",
  },
});
