import "@telekom/scale-components/dist/scale-components/scale-components.css";
import "./index.css";

import { defineCustomElements } from "@telekom/scale-components/loader";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { createRoot } from "react-dom/client";
import { OIDCProvider } from "./Components/Auth";
import { BrowserRouter } from "./Components/Router";
import { Layout } from "./Pages";
import { StatusContext } from "./Services/Status";

dayjs.extend(utc);
dayjs.extend(timezone);
defineCustomElements();

const s = document.createElement("script");
s.async = true;
s.src = process.env.SD_ANALYTICS_URL || "";
s.setAttribute("data-website-id", process.env.SD_ANALYTICS_ID || "");

if (s.src) {
  document.head.appendChild(s);
}

const container = document.querySelector("#root")!;
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <OIDCProvider>
      <StatusContext>
        <Layout />
      </StatusContext>
    </OIDCProvider>
  </BrowserRouter>
);
