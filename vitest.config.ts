import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: "./test/vitest.setup.ts",
    alias: {
      '~': path.resolve(__dirname, './src')
    },
  },
});
