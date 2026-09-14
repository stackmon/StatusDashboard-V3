import "@telekom/scale-components/dist/scale-components/scale-components.css";
import 'react-markdown-editor-lite/lib/index.css';
import "./index.css";

import { defineCustomElements } from "@telekom/scale-components/loader";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { Logger } from "./Helpers/Logger";

dayjs.extend(utc);
dayjs.extend(timezone);
defineCustomElements();

const src = process.env.SD_ANALYTICS_URL || "";

const commit = (process.env.SD_GIT_SHA || "").slice(0, 7);
const build = commit ? `https://github.com/stackmon/StatusDashboard-V3/commit/${commit}` : "dev";

const log = new Logger("App");

log.info(`© 2026, T-Cloud, Ecosystem Squad, ${build}`);

if (src) {
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  s.setAttribute("data-website-id", process.env.SD_ANALYTICS_ID || "");
  document.head.appendChild(s);
}

const container = document.querySelector("#root")!;
const root = createRoot(container);

root.render(<App />);
