import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import { VitePWA, type ManifestOptions } from "vite-plugin-pwa";

const requiredBuildVars = [
  "SD_BACKEND_URL",
  "SD_CLIENT_ID",
  "SD_AUTHORITY_URL",
] as const;

const Product = "Status Dashboard";

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

  const Name = sdEnv.SD_NAME?.trim() || "T Cloud Public";
  const App = sdEnv.SD_APP_NAME?.trim() || `${Name} Status`;
  const title = `${Name} ${Product}`;

  const manifest: Partial<ManifestOptions> = {
    name: title,
    short_name: App,
    description: "Your go-to resource for monitoring the availability of various components in different regions.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    lang: "en",
    dir: "ltr",
    theme_color: "#ffffff",
    background_color: "#ffffff",
    categories: ["business", "productivity", "utilities"],
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Availability",
        url: "/Availability",
        icons: [
          {
            src: "/favicon-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
      {
        name: "History",
        url: "/History",
        icons: [
          {
            src: "/favicon-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
    ],
  };

  return {
    plugins: [
      react(),
      {
        // Replaces the placeholders in index.html, the manifest link is added by VitePWA.
        name: "sd3-branding",
        transformIndexHtml: {
          order: "pre",
          handler: (html) => html
            .replaceAll("%SD_TITLE%", title)
            .replaceAll("%SD_APP_NAME%", App),
        },
      },
      VitePWA({
        strategies: "generateSW",
        registerType: "prompt",
        injectRegister: null,
        manifest,
        workbox: {
          inlineWorkboxRuntime: true,
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2,webmanifest}"],
          navigateFallback: "index.html",
          navigateFallbackDenylist: [/^\/v2\//, /^\/rss/, /^\/openapi\.json$/, /^\/swagger/],
        },
      }),
    ],
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "src"),
      },
    },
    define: {
      "process.env": {
        ...sdEnv,
        SD_NAME: Name,
        SD_APP_NAME: App,
        SD_PRODUCT: Product,
      },
    },
    envPrefix: "SD_",
    server: {
      proxy: {
        "/v2": {
          target: "https://test.status.otc-service.com",
          changeOrigin: true,
        },
      },
    },
  };
});
