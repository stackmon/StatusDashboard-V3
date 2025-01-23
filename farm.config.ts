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
      key: "/home/ubuntu/.acme.sh/inf.aloen.to_ecc/inf.aloen.to.key",
      cert: "/home/ubuntu/.acme.sh/inf.aloen.to_ecc/fullchain.cer"
    }
  }
});
