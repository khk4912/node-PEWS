import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import neostandard from 'neostandard'

export default tseslint.config(
  ...neostandard({
    ignores: ['dist', 'runtime_test', '**/*.js'],
    filesTs: ['**/*.{ts,tsx}'],
    ts: true
  }),
  { ignores: ['dist', 'runtime_test', '**/*.js'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname
      },
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  }
)
