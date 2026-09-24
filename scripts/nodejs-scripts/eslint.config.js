import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import importPlugin from 'eslint-plugin-import';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import sonarJs from 'eslint-plugin-sonarjs';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import { configs as typeScriptConfigs } from 'typescript-eslint';

export default defineConfig([
    {
        ignores: ['docs/**/*', '**/{build,coverage,dist,generated,.nx,.turbo}', '**/*.generated.*'],
    },
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        extends: [
            js.configs.recommended,
            typeScriptConfigs.recommended,
            typeScriptConfigs.stylistic,
            reactHooksPlugin.configs.flat.recommended,
            importPlugin.flatConfigs.recommended,
            importPlugin.flatConfigs.typescript,
            eslintPluginUnicorn.configs.recommended,
            sonarJs.configs.recommended,
            eslintConfigPrettier,
        ],
        plugins: {
            'simple-import-sort': simpleImportSort,
        },
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        rules: {
            'no-console': ['warn', { allow: ['error'] }],
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    args: 'all',
                    argsIgnorePattern: '^_',
                    caughtErrors: 'all',
                    caughtErrorsIgnorePattern: '^_',
                    destructuredArrayIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    ignoreRestSiblings: true,
                },
            ],
            camelcase: [
                'error',
                {
                    properties: 'always',
                    ignoreDestructuring: false,
                },
            ],

            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',
            'import/first': 'error',
            'import/newline-after-import': 'error',
            'import/no-duplicates': 'error',
        },
        settings: {
            'import/resolver': {
                typescript: true,
                node: true,
            },
        },
    },
    {
        files: ['**/*.test.{ts, tsx, js, jsx}'],
        languageOptions: {
            globals: {
                ...globals.jest,
            },
        },
    },
]);
