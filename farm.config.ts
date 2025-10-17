import { defineConfig } from "@farmfe/core";
import farmPostcssPlugin from "@farmfe/js-plugin-postcss";
import path from "path";

export default defineConfig((cfg) => {
  let env: object | undefined;

  if (cfg.mode !== "development") {
    env = {
      SD_BACKEND_URL: process.env.SD_BACKEND_URL,
      SD_CLIENT_ID: process.env.SD_CLIENT_ID,
      SD_AUTHORITY_URL: process.env.SD_AUTHORITY_URL,
      SD_ANALYTICS_URL: process.env.SD_ANALYTICS_URL || "",
      SD_ANALYTICS_ID: process.env.SD_ANALYTICS_ID || "",
    };

    for (const [key, value] of Object.entries(env)) {
      if (key === "SD_ANALYTICS_URL" || key === "SD_ANALYTICS_ID") {
        continue;
      }
      if (!value) {
        throw new Error(`Environment variable ${key} is missing or empty.`);
      }
    }
  }

  return {
    plugins: ["@farmfe/plugin-react", farmPostcssPlugin()],
    compilation: {
      resolve: {
        alias: {
          "~/": path.join(process.cwd(), "src"),
        }
      },
      define: env,
    },
    envPrefix: "SD_",
    server: {
      proxy: {
        "/auth": {
          target: "http://localhost:8000",
          changeOrigin: true
        },
        "/v2": {
          target: "http://localhost:8000",
          changeOrigin: true
        }
      }
    }
  };
});
