import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import dynamicImportVars from "@rollup/plugin-dynamic-import-vars";
import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { remarkMdxToc } from "remark-mdx-toc";
import jsonFolders from "./rollup-plugins/generate-json-folders.js";

export default {
  input: "src/index.ts",
  output: {
    sourcemap: true,
    dir: "dist",
  },
  plugins: [
    mdx({
      jsxImportSource: "solid-jsx",
      remarkPlugins: [remarkGfm, remarkMdxToc],
      rehypePlugins: [
        rehypeHighlight,
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            properties: { class: "header-anchor" },
            content: { type: "text", value: "#" },
          },
        ],
      ],
    }),
    typescript(),
    jsonFolders(),
    json(),
    dynamicImportVars.default(),
  ],
  external: ["solid-jsx/jsx-runtime"]
};
