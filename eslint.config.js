import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import neostandard from 'neostandard'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig(
  globalIgnores(['dist', '**/runtime_test/**', '**/pews.js']),
  ...neostandard({
    ts: true,
    filesTs: ['**/*.{ts,tsx}'],
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  })
)
