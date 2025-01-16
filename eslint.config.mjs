import globals from "globals";
import pluginJs from "@eslint/js";
import pluginUnicorn from "eslint-plugin-unicorn";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ["**/assets/**", "**/node_modules/**", "**/public/**"],
  },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  {
    plugins: {
      unicorn: pluginUnicorn,
    },
    rules: {
      "unicorn/filename-case": [
        "error",
        {
          case: "kebabCase",
        },
      ],
    },
  },
];
