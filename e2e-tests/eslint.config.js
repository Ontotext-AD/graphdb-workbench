import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginCypress from 'eslint-plugin-cypress/flat';

export default [
    {
        files: ['**/*.{js,mjs,cjs}'],
        plugins: { js: pluginJs },
        languageOptions: { globals: globals.browser },
        rules: {
            ...pluginJs.configs.recommended.rules,
        },
    },
    {
        files: ['**/*.{js,mjs,cjs}'],
        plugins: { cypress: pluginCypress },
        languageOptions: {
            globals: {
                ...globals.browser,
                cy: 'readonly',
                Cypress: 'readonly',
                describe: 'readonly',
                it: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                before: 'readonly',
                after: 'readonly',
                expect: 'readonly',

                // Node.js globals for scripts
                process: 'readonly',
            }
        },
        rules: {
            ...pluginJs.configs.recommended.rules,
            ...pluginCypress.configs.recommended.rules,
        },
    },
];
