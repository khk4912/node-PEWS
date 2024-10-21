import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import love from 'eslint-config-love'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    ...love,
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json'
      },
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  }
)
