import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ["**/assets/**", "**/node_modules/**", "**/public/**"],
  },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
];
