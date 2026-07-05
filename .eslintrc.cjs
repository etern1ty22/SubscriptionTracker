const strictTypeScriptRules = {
  "@typescript-eslint/consistent-type-imports": [
    "error",
    {
      prefer: "type-imports",
      fixStyle: "inline-type-imports"
    }
  ],
  "@typescript-eslint/consistent-type-definitions": ["error", "type"],
  "@typescript-eslint/explicit-function-return-type": [
    "error",
    {
      allowExpressions: true,
      allowTypedFunctionExpressions: true
    }
  ],
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/no-floating-promises": "error",
  "@typescript-eslint/no-misused-promises": "error",
  "@typescript-eslint/no-unnecessary-condition": "error",
  "@typescript-eslint/no-unused-vars": [
    "error",
    {
      argsIgnorePattern: "^_",
      caughtErrorsIgnorePattern: "^_",
      varsIgnorePattern: "^_"
    }
  ],
  "array-callback-return": "error",
  curly: ["error", "all"],
  eqeqeq: ["error", "always"],
  "no-console": [
    "error",
    {
      allow: ["warn", "error"]
    }
  ],
  "no-else-return": "error",
  "no-implicit-coercion": "error",
  "no-var": "error",
  "object-shorthand": "error",
  "prefer-const": "error",
  "prefer-template": "error"
};

module.exports = {
  root: true,
  env: {
    es2022: true,
    node: true
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./apps/api/tsconfig.json", "./apps/web/tsconfig.json", "./packages/shared/tsconfig.json"],
    tsconfigRootDir: __dirname,
    sourceType: "module"
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/strict-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked"
  ],
  ignorePatterns: [
    "node_modules/",
    "dist/",
    "coverage/",
    ".next/",
    "next-env.d.ts",
    "package-lock.json"
  ],
  rules: strictTypeScriptRules,
  overrides: [
    {
      files: ["apps/web/**/*.tsx", "apps/web/**/*.ts"],
      env: {
        browser: true,
        node: true
      }
    },
    {
      files: ["**/*.module.ts"],
      rules: {
        "@typescript-eslint/no-extraneous-class": "off"
      }
    },
    {
      files: ["*.cjs"],
      parserOptions: {
        project: null
      },
      rules: {
        "@typescript-eslint/no-require-imports": "off"
      }
    }
  ]
};
