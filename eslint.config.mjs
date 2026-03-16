import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'node_modules/**',
    '*.config.mjs',
    '*.config.ts',
    // Bỏ qua components/editor folder hoàn toàn
    'components/editor/**',
    '@data/**',
    'generated/**',
    'coverage/**',
    // Bỏ qua developments folder
    'developments/**',
  ]),
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      // Best practices
      'no-console': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'prefer-const': 'off',
      
      // React
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      
      // Next.js
      '@next/next/no-html-link-for-pages': 'off',

      // Import sorting
      'simple-import-sort/imports': ['error', {
        groups: [
          ['^react$', '^react/'],
          ['^@?\\w'],
          ['^@(/.*|$)'],
          ['^components(/.*|$)'],
          ['^\\u0000'],
          ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
          ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
          ['^.+\\.(css|scss|less)$'],
        ],
      }],
    },
  },
]);

export default eslintConfig;
