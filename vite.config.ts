import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";

const GITHUB_ORIGIN = "https://github.com";

/** Locate the ".git" directory, following the pointer file used by worktrees. */
function resolveGitDir(cwd: string): string | undefined {
  const gitPath = path.join(cwd, ".git");

  try {
    if (fs.statSync(gitPath).isDirectory()) return gitPath;

    const pointer = fs.readFileSync(gitPath, "utf8").trim();
    return path.resolve(cwd, pointer.replace(/^gitdir:\s*/i, ""));
  } catch {
    return undefined;
  }
}

/**
 * Read the built commit without invoking the git binary,
 * so image builds running in a git-less container still resolve it.
 */
function readCommitHash(gitDir?: string): string {
  if (gitDir) {
    try {
      const head = fs.readFileSync(path.join(gitDir, "HEAD"), "utf8").trim();

      if (!head.startsWith("ref:")) return head;

      const ref = head.slice(4).trim();
      const looseRef = path.join(gitDir, ref);

      if (fs.existsSync(looseRef)) return fs.readFileSync(looseRef, "utf8").trim();

      const packedRefs = fs.readFileSync(path.join(gitDir, "packed-refs"), "utf8");
      const packedRef = packedRefs.split(/\r?\n/).find((line) => line.endsWith(` ${ref}`));

      if (packedRef) return packedRef.split(" ")[0];
    } catch {
      // fall back to the environment
    }
  }

  return process.env.GITHUB_SHA || process.env.SD_BUILD_HASH || "";
}

/** Normalize ssh/https remotes into a browsable GitHub URL. */
function toGitHubUrl(remote: string): string | undefined {
  const match = remote.match(/github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?$/);

  return match ? `${GITHUB_ORIGIN}/${match[1]}` : undefined;
}

function readRepositoryUrl(gitDir?: string): string {
  if (gitDir) {
    try {
      const config = fs.readFileSync(path.join(gitDir, "config"), "utf8").split(/\r?\n/);
      let inOrigin = false;

      for (const line of config) {
        const entry = line.trim();

        if (entry.startsWith("[")) {
          inOrigin = /^\[remote\s+"origin"\]$/.test(entry);
        } else if (inOrigin) {
          const url = entry.match(/^url\s*=\s*(.+)$/);

          if (url) return toGitHubUrl(url[1].trim()) ?? "";
        }
      }
    } catch {
      // fall back to the environment
    }
  }

  return process.env.GITHUB_REPOSITORY ? `${GITHUB_ORIGIN}/${process.env.GITHUB_REPOSITORY}` : "";
}

const gitDir = resolveGitDir(process.cwd());
const shortHash = readCommitHash(gitDir).slice(0, 7);
const repositoryUrl = readRepositoryUrl(gitDir);

const buildEnv = {
  SD_BUILD_HASH: shortHash,
  SD_BUILD_URL: repositoryUrl && shortHash ? `${repositoryUrl}/commit/${shortHash}` : "",
};

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
      "process.env": { ...buildEnv, ...sdEnv },
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
