import { Config } from "tailwindcss";
import { isolateOutsideOfContainer, scopedPreflightStyles } from "tailwindcss-scoped-preflight";

/** @type {Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [scopedPreflightStyles({
    isolationStrategy: isolateOutsideOfContainer([
      '[class^="scale-"]',
    ])
  })],
};
