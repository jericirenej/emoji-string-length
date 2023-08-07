module.exports = {
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:@typescript-eslint/strict",
    "prettier"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: { project: true, tsConfigRootDir: __dirname },
  plugins: ["@typescript-eslint"],
  root: true,
};
