module.exports = {
  root: true,
  plugins: ["stylelint-scss"],
  extends: ["stylelint-config-standard-scss"],
  rules: {
    "max-nesting-depth": 3,
    "no-descending-specificity": true,
    "string-quotes": "single"
  },
  ignoreFiles: ["**/node_modules/**", "dist/**", "src/pages/**"]
};
