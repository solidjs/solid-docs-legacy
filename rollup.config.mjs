// import typescript from 'rollup-plugin-typescript2';
// import json from '@rollup/plugin-json';
// import dynamicImportVars from "@rollup/plugin-dynamic-import-vars"
import mdx from "@mdx-js/rollup";
import { babel } from '@rollup/plugin-babel';

const extensions = ['.md', '.mdx', '.js', '.ts', '.tsx'];

export default {
  input: 'src/testmdx.tsx',
  output: {
    dir: 'dist',
  },
  plugins: [
    mdx({
      jsx: true,
      jsxImportSource: 'solid-js',
      providerImportSource: 'solid-mdx',
      // remarkPlugins: [remarkGfm, [remarkEmoji, { emoticon: true }]]
    }),
    babel({ extensions, babelHelpers: 'bundled' }),
    // typescript(), json(), dynamicImportVars()
  ]
};