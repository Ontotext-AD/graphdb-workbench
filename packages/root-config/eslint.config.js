const eslint = require("@eslint/js");

module.exports = [
    eslint.configs.recommended,
    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: 12,
            sourceType: "module",
            globals: {
                System: "readonly",
                PluginRegistry: "readonly",
                console: "readonly",
                window: "readonly",
                document: "readonly",
                setTimeout: "readonly",
            },
        },
        rules: {
            "no-console": ["error", {allow: ["warn", "error"]}],
            "no-unused-vars": "warn",
            "eqeqeq": "error",
            "curly": "error",
            "quotes": ["error", "single"],
            "semi": ["error", "always"],
            "indent": ["error", 2],
            "no-multiple-empty-lines": ["error", {max: 1}],
        },
    },
];
