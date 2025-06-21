import { fileURLToPath } from "url";
import { dirname } from "path";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals", 
    "next/typescript",
    "@typescript-eslint/recommended"
  ),
  ...compat.plugins(
    "@typescript-eslint",
    "react-hooks",
    "jsx-a11y",
    "import",
    "unused-imports",
    "complexity"
  ),
  {
    rules: {
      // TypeScript rules
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/prefer-const": "error",
      
      // React Hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      
      // Accessibility rules
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-has-content": "error",
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",
      
      // Import rules
      "import/order": [
        "error",
        {
          "groups": [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index"
          ],
          "newlines-between": "always",
          "alphabetize": {
            "order": "asc",
            "caseInsensitive": true
          }
        }
      ],
      "import/no-unresolved": "off",
      "import/no-duplicates": "error",
      
      // Unused imports
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          "vars": "all",
          "varsIgnorePattern": "^_",
          "args": "after-used",
          "argsIgnorePattern": "^_"
        }
      ],
      
      // General code quality
      "prefer-const": "error",
      "no-console": ["warn", { "allow": ["warn", "error"] }],
      "no-debugger": "error",
      "no-duplicate-imports": "error",
      
      // Complexity rules
      "complexity": ["warn", { "max": 10 }],
      "max-depth": ["warn", { "max": 4 }],
      "max-lines-per-function": ["warn", { "max": 50, "skipBlankLines": true, "skipComments": true }],
      "max-params": ["warn", { "max": 4 }],
      
      // React specific
      "react/display-name": "error",
      "react/no-unescaped-entities": "off",
      
      // Next.js specific
      "@next/next/no-img-element": "warn"
    }
  }
];

export default eslintConfig;
