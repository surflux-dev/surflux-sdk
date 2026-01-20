import js from '@eslint/js';
import tseslintParser from '@typescript-eslint/parser';
import tseslintPlugin from '@typescript-eslint/eslint-plugin';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: {
        // Node.js globals
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        // Browser globals (for cross-platform support)
        window: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
        EventSource: 'readonly',
        MessageEvent: 'readonly',
        Event: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslintPlugin,
    },
    rules: {
      ...tseslintPlugin.configs.recommended.rules,
      ...tseslintPlugin.configs['recommended-type-checked'].rules,
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/unbound-method': 'warn',
      // Formatting rules that complement EditorConfig
      // Note: indent rule is deprecated - EditorConfig handles indentation
      'eol-last': ['error', 'always'], // Require newline at end of file (matches EditorConfig)
      'no-trailing-spaces': 'error', // Remove trailing whitespace (matches EditorConfig)
      'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }], // Limit blank lines
      // Code quality rules
      'no-console': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'examples/**',
      '*.js',
      '!jest.config.js',
      '*.d.ts',
      '*.map',
    ],
  },
  {
    files: ['**/*.test.ts', '**/*.spec.ts'],
    languageOptions: {
      globals: {
        // Jest globals
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
];
