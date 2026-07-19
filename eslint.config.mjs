import js from "@eslint/js";
import tseslint from "typescript-eslint";

/** Root flat config — packages are strict; apps/web starter code is gradually tightened. */
export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.react-router/**",
      "**/convex/_generated/**",
      "**/.turbo/**",
      "**/.vercel/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["packages/**/*.{ts,tsx}", "eslint.config.mjs"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  {
    files: ["apps/**/*.{ts,tsx}"],
    rules: {
      // Reference app still contains starter-kit debt; packages enforce the bar.
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-console": "off",
      "no-empty-pattern": "off",
      "no-case-declarations": "off",
    },
  },
);
