const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");

module.exports = tseslint.config(
    {
        files: ["**/*.ts"],
        extends: [
            eslint.configs.recommended,
            ...tseslint.configs.recommended,
            ...tseslint.configs.stylistic,
        ],
        rules: {
            'no-console': 'warn',
            'eqeqeq': 'error',
            'curly': 'error',
            'quotes': ['error', 'single'],
            'semi': ['error', 'always'],
            'indent': ['error', 2],
            'no-multiple-empty-lines': ['error', { max: 1 }],
            'no-redeclare': ['error', { builtinGlobals: false }],
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': ['error'],
            'no-undef': 'off',
            '@typescript-eslint/no-empty-interface': 'off',
            '@typescript-eslint/no-empty-object-type': 'off',
            '@typescript-eslint/consistent-type-definitions': 'off',
        }
    }
);
