import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "prefer-const": "warn",
      "no-case-declarations": "warn",
      "no-fallthrough": "warn",
      "no-empty": "warn",
      "no-undef": "off",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".expo/**",
      "babel.config.js",
      "tailwind.config.js",
      "webpack.config.js",
      "metro.config.js",
      "jest.config.js",
    ],
  },
);
