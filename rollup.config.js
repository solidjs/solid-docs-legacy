import typescript from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';
import dynamicImportVars from "@rollup/plugin-dynamic-import-vars"

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'cjs'
  },
  plugins: [typescript(), json(), dynamicImportVars()]
};