import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";

const requiredBuildVars = [
  "SD_BACKEND_URL",
  "SD_CLIENT_ID",
  "SD_AUTHORITY_URL",
] as const;

export default defineConfig(({ mode }) => {
  const loadedEnv = loadEnv(mode, process.cwd(), "SD_");
  const sdEnv = Object.fromEntries(
    Object.entries({ ...process.env, ...loadedEnv }).filter(([key]) => key.startsWith("SD_"))
  );

  if (mode !== "development") {
    for (const key of requiredBuildVars) {
      if (!sdEnv[key]) {
        throw new Error(`Environment variable ${key} is missing or empty.`);
      }
    }
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "src"),
      },
    },
    define: {
      "process.env": sdEnv,
    },
    envPrefix: "SD_",
    server: {
      proxy: {
        "/auth": {
          target: "https://api.test.status.otc-service.com",
          changeOrigin: true,
        },
        "/v2": {
          target: "https://api.test.status.otc-service.com",
          changeOrigin: true,
        },
      },
    },
  };
});
