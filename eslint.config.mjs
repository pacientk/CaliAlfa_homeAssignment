// Flat ESLint config. The rules here are the enforcement half of
// docs/architecture/coding-rules.md; severities follow
// docs/architecture/PROJECT-PROFILE.md § Lint severity.
import js from '@eslint/js';
import comments from '@eslint-community/eslint-plugin-eslint-comments';
import boundaries from 'eslint-plugin-boundaries';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactNative from 'eslint-plugin-react-native';
import security from 'eslint-plugin-security';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

/** React Native primitives that may only be imported inside the atom layer. */
const RN_PRIMITIVES = [
  'View',
  'Text',
  'ScrollView',
  'Pressable',
  'TouchableOpacity',
  'TouchableHighlight',
  'TouchableWithoutFeedback',
  'Image',
  'ImageBackground',
  'TextInput',
  'FlatList',
  'SectionList',
  'VirtualizedList',
  'Button',
  'Switch',
  'Modal',
  'ActivityIndicator',
  'SafeAreaView',
];

/** Banned regardless of layer — see coding-rules.md § Banned direct imports. */
const RN_BANNED = ['useColorScheme', 'Appearance', 'I18nManager', 'Linking'];

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'ios/**',
      'android/**',
      'vendor/**',
      'coverage/**',
      '**/*.config.js',
      'metro.config.js',
      'jest.config.js',
      'babel.config.js',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        __DEV__: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-native': reactNative,
      'simple-import-sort': simpleImportSort,
      boundaries,
      security,
      '@eslint-community/eslint-comments': comments,
    },
    settings: {
      react: { version: 'detect' },
      'boundaries/include': ['src/**/*'],
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app/**' },
        { type: 'navigation', pattern: 'src/navigation/**' },
        { type: 'screens', pattern: 'src/screens/**' },
        { type: 'widgets', pattern: 'src/widgets/**' },
        { type: 'features', pattern: 'src/features/*', capture: ['feature'] },
        { type: 'entities', pattern: 'src/entities/**' },
        { type: 'shared', pattern: 'src/shared/**' },
      ],
    },
    rules: {
      // ---- FSD layer boundaries: imports flow downward only -----------------
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          message: '${file.type} may not import from ${dependency.type} — imports flow downward only.',
          rules: [
            { from: 'app', allow: ['navigation', 'screens', 'widgets', 'features', 'entities', 'shared'] },
            { from: 'navigation', allow: ['navigation', 'screens', 'widgets', 'features', 'entities', 'shared'] },
            { from: 'screens', allow: ['screens', 'widgets', 'features', 'entities', 'shared'] },
            { from: 'widgets', allow: ['widgets', 'features', 'entities', 'shared'] },
            // A feature may only import its own internals — never another feature.
            {
              from: 'features',
              allow: [['features', { feature: '${from.feature}' }], 'entities', 'shared'],
            },
            { from: 'entities', allow: ['entities', 'shared'] },
            { from: 'shared', allow: ['shared'] },
          ],
        },
      ],

      // ---- Imports ----------------------------------------------------------
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-native',
              importNames: RN_PRIMITIVES,
              message:
                'Raw React Native primitives are only allowed in src/shared/ui/atoms/. Use the App* primitives instead.',
            },
            {
              name: 'react-native',
              importNames: RN_BANNED,
              message:
                'Banned import. Theme comes from useTheme(); the app is single-theme and LTR-only; external URLs go through a wrapper service.',
            },
          ],
          patterns: [
            {
              group: ['../../*', '../../../*'],
              message: 'Use a path alias instead of traversing up two or more levels.',
            },
          ],
        },
      ],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

      // ---- TypeScript -------------------------------------------------------
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

      // ---- Naming -----------------------------------------------------------
      '@typescript-eslint/naming-convention': [
        'error',
        // Booleans read as assertions.
        {
          selector: ['variable', 'parameter', 'classProperty', 'typeProperty'],
          types: ['boolean'],
          format: ['PascalCase'],
          prefix: ['is', 'has', 'should', 'can', 'did', 'was', 'are'],
        },
        // Props types are I-prefixed; domain and token types are not.
        {
          selector: ['interface', 'typeAlias'],
          filter: { regex: 'Props$', match: true },
          format: ['PascalCase'],
          prefix: ['I'],
        },
        { selector: 'typeLike', format: ['PascalCase'] },
      ],

      // ---- React / React Native --------------------------------------------
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'react-native/no-inline-styles': 'error',
      'react-native/no-single-element-style-arrays': 'error',

      // ---- Size and shape ---------------------------------------------------
      'max-depth': ['error', 3],
      'no-magic-numbers': [
        'warn',
        { ignore: [-1, 0, 1, 2, 100], ignoreArrayIndexes: true, enforceConst: true },
      ],

      // ---- Hygiene ----------------------------------------------------------
      '@eslint-community/eslint-comments/require-description': 'error',
      '@eslint-community/eslint-comments/no-unlimited-disable': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-non-literal-regexp': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // The atom layer is the one place allowed to touch React Native primitives.
  {
    files: ['src/shared/ui/atoms/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-native',
              importNames: RN_BANNED,
              message: 'Banned import even inside the atom layer.',
            },
          ],
        },
      ],
    },
  },

  // Component files carry the 150-line limit.
  {
    files: ['src/**/*.tsx'],
    ignores: ['src/**/__tests__/**', 'src/**/*.test.tsx'],
    rules: {
      'max-lines': ['warn', { max: 150, skipBlankLines: true, skipComments: true }],
    },
  },

  // Tests: same quality bar, fewer structural constraints.
  {
    files: ['**/__tests__/**/*.{ts,tsx}', '**/*.test.{ts,tsx}'],
    rules: {
      'no-magic-numbers': 'off',
      'max-lines': 'off',
      'boundaries/element-types': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/unbound-method': 'off',
    },
  },

  prettier,
);
