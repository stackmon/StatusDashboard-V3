import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: tseslint.configs.recommended,
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
    },
    // The following rules are turned off to maintain compatibility with legacy browser and to ensure smooth integration with existing systems.
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-namespace": "off",
      "prefer-const": "off",
      "no-fallthrough": "off",
    },
  }
);
