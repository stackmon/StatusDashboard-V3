import react from "@vitejs/plugin-react";
import { copyFileSync } from "node:fs";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import { VitePWA, type ManifestOptions } from "vite-plugin-pwa";

const requiredBuildVars = [
  "SD_BACKEND_URL",
  "SD_CLIENT_ID",
  "SD_AUTHORITY_URL",
  "SD_PROJECT_ID",
] as const;

const Product = "Dashboard";

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
  const title = `${App} ${Product}`;

  const shortcutIcon = { src: "/favicon-96x96.png", sizes: "96x96", type: "image/png" };

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
        name: "New Event",
        short_name: "New Event",
        description: "Create a new maintenance event",
        url: "/NewEvent",
        icons: [shortcutIcon],
      },
      {
        name: "Login",
        short_name: "Login",
        description: "Sign in to create and review maintenance events",
        url: "/login",
        icons: [shortcutIcon],
      },
      {
        name: "Availability",
        short_name: "Availability",
        description: "View the availability matrix of the regions",
        url: "/Availability",
        icons: [shortcutIcon],
      },
      {
        name: "History",
        short_name: "History",
        description: "Browse the maintenance events of the past",
        url: "/History",
        icons: [shortcutIcon],
      },
      // Android keeps the first four shortcuts, so this one is the desktop-only entry.
      {
        name: "Reviews",
        short_name: "Reviews",
        description: "Review the maintenance events waiting for approval",
        url: "/Reviews",
        icons: [shortcutIcon],
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
      {
        // The precache route answers a navigation to "/" from the precached
        // index.html, which is what kept visitors on the previous build. The
        // shell is a copy that is only used as the offline fallback.
        name: "sd3-offline-shell",
        apply: "build",
        closeBundle: {
          order: "pre",
          handler() {
            copyFileSync(
              path.resolve(__dirname, "dist/index.html"),
              path.resolve(__dirname, "dist/shell.html")
            );
          },
        },
      },
      VitePWA({
        strategies: "generateSW",
        registerType: "prompt",
        injectRegister: null,
        manifest,
        workbox: {
          clientsClaim: true,
          inlineWorkboxRuntime: true,
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2,webmanifest}"],
          globIgnores: ["index.html"],
          // Serving the document from the cache keeps visitors on the previous
          // build until the waiting worker activates, so a plain reload never
          // picks up a new release. Documents come from the network instead and
          // fall back to the precached shell when the network is gone.
          navigateFallback: null,
          runtimeCaching: [
            {
              // Document paths only: no file extension, and not the API.
              urlPattern: /^(?!.*\/(?:v2|rss|swagger)(?:\/|$))(?=.*\/[^./]*$)/,
              handler: "NetworkFirst",
              options: {
                cacheName: "documents",
                precacheFallback: { fallbackURL: "shell.html" },
              },
            },
          ],
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
