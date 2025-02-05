import "@telekom/scale-components/dist/scale-components/scale-components.css";
import "./index.css";

import { defineCustomElements } from "@telekom/scale-components/loader";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { createRoot } from "react-dom/client";
import { App } from "./App";

dayjs.extend(utc);
dayjs.extend(timezone);
defineCustomElements();

const container = document.querySelector("#root")!;
const root = createRoot(container);

root.render(<App />);
