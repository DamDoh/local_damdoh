
module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
    tsconfigRootDir: __dirname, // Correctly point to the functions directory
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
    "/dist/**/*", // Ignore built files for compiled output.
    "/generated/**/*", // Ignore generated files.
  ],
  plugins: ["@typescript-eslint", "import"],
  rules: {
    "quotes": ["error", "double"],
    "import/no-unresolved": 0,
    "indent": ["error", 2],
    "object-curly-spacing": ["error", "always"],
    "max-len": ["error", { "code": 120 }],
    "require-jsdoc": "off", // Disable for cleaner TypeScript code
    "@typescript-eslint/no-var-requires": "off",
  },
};
