import { defineConfig } from "eslint/config";
import pluginReact from "eslint-plugin-react";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import sortDestructureKeys from "eslint-plugin-sort-destructure-keys";
import globals from "globals";
import tseslint from "typescript-eslint";

import js from "@eslint/js";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: {
      js,
      "simple-import-sort": simpleImportSort,
      "sort-destructure-keys": sortDestructureKeys,
    },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser }
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,

  {
    rules: {
      "react/react-in-jsx-scope": 0,
      "sort-destructure-keys/sort-destructure-keys": ["error", { caseSensitive: false }],
      "simple-import-sort/imports": ["error", {
        groups: [
          ["^react$", "^next", "^[a-z]"],
          ["^@"],
          ["^~"],
          ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
          ["^.+(utils|store|hooks|assets|routes|interfaces)"],
          ["^.+\\.(png|jpg|jpeg|gif|svg)$"],
          ["^.+constant"],
          ["^.+\\.s?css$"],
          ["^\\u0000"],
        ],
      }],
    }
  }
]);
