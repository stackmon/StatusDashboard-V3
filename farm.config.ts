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
      key: "/etc/letsencrypt/archive/inf.aloen.to/privkey1.pem",
      cert: "/etc/letsencrypt/archive/inf.aloen.to/fullchain1.pem"
    }
  }
});
