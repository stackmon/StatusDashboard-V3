import "@telekom/scale-components/dist/scale-components/scale-components.css";
import "./index.css";

import { createRoot } from "react-dom/client";
import { Main } from "./main";

const container = document.querySelector("#root")!;
const root = createRoot(container);

root.render(<Main />);
