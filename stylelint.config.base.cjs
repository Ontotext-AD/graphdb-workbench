module.exports = {
  root: true,
  plugins: ["stylelint-scss"],
  extends: ["stylelint-config-standard-scss"],
  rules: {
    "max-nesting-depth": 4,
    "no-descending-specificity": true,
    "at-rule-disallowed-list": ["import"]
  },
  ignoreFiles: ["**/node_modules/**", "dist/**"],
};
