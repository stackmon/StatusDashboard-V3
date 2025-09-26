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
    },
    https: {
      key: "/etc/letsencrypt/live/inf.aloen.to/privkey.pem",
      cert: "/etc/letsencrypt/live/inf.aloen.to/fullchain.pem"
    }
  }
});
