import "@telekom/scale-components/dist/scale-components/scale-components.css";
import "./index.css";

import { defineCustomElements } from "@telekom/scale-components/loader";
import { createRoot } from "react-dom/client";
import { OIDCProvider } from "./Components/Auth";
import { BrowserRouter } from "./Components/Router";
import { Layout } from "./Pages";
import { StatusContext } from "./Services/Status";

defineCustomElements();

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
