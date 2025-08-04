import cypressPlugin from 'eslint-plugin-cypress';
import googleConfig from 'eslint-config-google';

const filteredGoogleRules = Object.fromEntries(
    Object.entries(googleConfig.rules).filter(([key]) => key !== 'valid-jsdoc')
);

export default [
    {
        files: ['**/*.js'],
        ignores: ['dist/**', 'node_modules/**'],

        languageOptions: {
            ecmaVersion: 2018,
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
                require: 'readonly'
            }
        },

        plugins: {
            cypress: cypressPlugin
        },

        rules: {
            ...filteredGoogleRules,
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
            'key-spacing': 'off'
        },

        linterOptions: {
            reportUnusedDisableDirectives: true
        }
    },
    {
        files: ['cypress/**/*.js'],
        languageOptions: {
            ecmaVersion: 2018,
            sourceType: 'module',
            globals: {
                ...cypressPlugin.configs.recommended.languageOptions?.globals
            }
        },
        plugins: {
            cypress: cypressPlugin
        },
        rules: {
            ...cypressPlugin.configs.recommended.rules
        }
    }
];
