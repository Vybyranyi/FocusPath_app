import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Deliberately .mjs: the server compiles as CommonJS ("module": "Node16" with no
// "type": "module" in package.json), so a plain eslint.config.js would be read
// as CJS and `export default` would not parse.
export default tseslint.config([
    {
        ignores: ['dist/**', 'coverage/**'],
    },
    {
        files: ['**/*.ts'],
        extends: [js.configs.recommended, tseslint.configs.recommended],
        languageOptions: {
            globals: globals.node,
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: 'module',
            },
        },
        rules: {
            // An unused argument is often required to hold a position — Express
            // error handlers must take four parameters to be recognised as such,
            // and several helpers ignore the leading document in a transform.
            // Prefixing with _ is how the code already signals that.
            //
            // ignoreRestSiblings covers the other deliberate case: destructuring
            // a field out purely to build an object without it. The name has to
            // match the key, so it cannot be prefixed away.
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    ignoreRestSiblings: true,
                    caughtErrors: 'none',
                },
            ],
        },
    },
    {
        // Jest globals live only in the test files and the setup that runs
        // after the framework installs.
        files: ['**/*.test.ts', 'jest.setup.ts'],
        languageOptions: {
            globals: globals.jest,
        },
    },
]);
