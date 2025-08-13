const googleConfig = require('eslint-config-google');

module.exports = [
    {
        files: ['**/*.js'],
        ignores: ['**/dist/**', '**/node_modules/**', '**/src/js/lib/**'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                angular: 'readonly',
                $: 'readonly',
                _: 'readonly',
                d3: 'readonly',
                getError: 'readonly',
                window: 'readonly',
                document: 'readonly',
                define: 'readonly',
                require: 'readonly',
            },
        },
        rules: {
            ...googleConfig.rules,
            'valid-jsdoc': 'off',
            'no-console': 'error',
            'no-debugger': 'error',
            'comma-dangle': ['error', { objects: 'never' }],
            'max-len': 'off',
            indent: 'off',
            'no-tabs': 'off',
            'no-mixed-spaces-and-tabs': 'off',
            'space-before-function-paren': 'off',
            'padded-blocks': 'off',
            'require-jsdoc': 'off',
            quotes: 'off',
            'no-var': 'off',
            'spaced-comment': 'off',
            'key-spacing': 'off',
        },
        linterOptions: {
            reportUnusedDisableDirectives: true,
        },
    },
];
