import "@telekom/scale-components/dist/scale-components/scale-components.css";
import "./index.css";

import { defineCustomElements } from "@telekom/scale-components/loader";
import { createRoot } from "react-dom/client";
import { App } from "./App";

defineCustomElements();

const container = document.querySelector("#root")!;
const root = createRoot(container);

root.render(<App />);
