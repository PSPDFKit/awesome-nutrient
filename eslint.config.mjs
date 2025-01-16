import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ["**/assets/**"],
  },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
];
