import { defineConfig } from "@farmfe/core";
import farmPostcssPlugin from "@farmfe/js-plugin-postcss";
import path from "path";

export default defineConfig({
  plugins: ["@farmfe/plugin-react", farmPostcssPlugin()],
  compilation: {
    resolve: {
      alias: {
        "~/": path.join(process.cwd(), "src"),
      }
    }
  },
  server: {
    proxy: {
      "/api": {
        target: "https://status.cloudmon.eco.tsi-dev.otc-service.com",
        changeOrigin: true
      }
    }
  }
});
