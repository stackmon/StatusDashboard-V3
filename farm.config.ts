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
    },
    define: {
      SD_BACKEND_URL: process.env.SD_BACKEND_URL,
      SD_CLIENT_ID: process.env.SD_CLIENT_ID,
      SD_AUTHORITY_URL: process.env.SD_AUTHORITY_URL,
      SD_REDIRECT_URL: process.env.SD_REDIRECT_URL,
      SD_LOGOUT_REDIRECT_URL: process.env.SD_LOGOUT_REDIRECT_URL,
      SD_AUTH_SECRET: process.env.SD_AUTH_SECRET,
    }
  },
  envPrefix: "SD_",
  server: {
    proxy: {
      "/api": {
        target: "https://status.cloudmon.eco.tsi-dev.otc-service.com",
        changeOrigin: true
      }
    }
  }
});
