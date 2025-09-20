import { defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'

const tsPlugin = typescript({
  tsconfig: './tsconfig.json',
  compilerOptions: {
    declaration: true,
    declarationDir: 'dist/types',
    rootDir: 'src',
    noEmit: false
  },
  outputToFilesystem: true
})

export default defineConfig([
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'esm',
        sourcemap: true
      },
      {
        file: 'dist/index.cjs',
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      }
    ],
    plugins: [tsPlugin]
  },
  {
    input: 'dist/types/index.d.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es'
    },
    plugins: [dts()],
    onwarn (warning, warn) {
      if (warning.code === 'EMPTY_BUNDLE') return
      warn(warning)
    }
  }
])
