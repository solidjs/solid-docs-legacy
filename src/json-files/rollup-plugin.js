// This script is meant to be run on each build, to join a group of files into a
// single JSON file of type JsFiles. Its purpose is to join individual files, so
// that the solid-site can keep using them.


// This will be a rollup plugin which joins all the files of a folder into a
// single "<folder>.json" file if the folder contains a ".json-files" file with
// the order of the files to join as a JSON stringified array.

import { createFilter } from '@rollup/pluginutils';
import glob from 'glob';
import { resolve, basename, dirname, parse } from 'path';
import { readdirSync, readFileSync, writeFileSync } from 'fs';

export default function pack(pluginOptions) {
  const pluginFilter = createFilter(pluginOptions?.include, pluginOptions?.exclude);

  return {
    name: 'json-files', // this name will show up in warnings and errors
    buildStart() {
      const allPaths = glob.sync('**/.json-files', {dot: true, absolute: true});
      const filteredPaths = allPaths.filter(pluginFilter);
      // console.log('json-files count', filteredPaths.length);
      filteredPaths.forEach((orderPath) => {
        let order = [];
        try {
          const orderContent = readFileSync(orderPath);
          order = JSON.parse(orderContent);
        } catch (e) {
          console.warn(`skipping ${orderPath} because ${e}`);
          return;
        }
        if (!Array.isArray(order)) {
          console.warn(`skipping ${orderPath} because it doesn't contain an array`);
          return;
        }
        if (order.length === 0) {
          console.warn(`skipping ${orderPath} because the array is empty`);
          return;
        }
        const inputPath = dirname(orderPath);
        const outputFilename = `${inputPath}.json`;
        const files = order.map((filename) => {
          const inputFilename = `${inputPath}/${filename}`;
          const parsedFilename = parse(filename);
          return {
            name: parsedFilename.name, 
            type: parsedFilename.ext.slice(1), 
            content: readFileSync(inputFilename, 'utf8')
          };
        });
        writeFileSync(outputFilename, JSON.stringify({files}));
      });
    }
  };
}
