// This script is meant to be run on each build, to join a group of files into a
// single JSON file of type JsFiles. Its purpose is to join individual files, so
// that the solid-site can keep using them.

import glob from 'glob';
import { dirname, parse, basename } from 'path';
import { readFileSync, writeFileSync } from 'fs';

export default function pack(pluginOptions) {
  const pluginName = 'json-files';
  if (pluginOptions) {
    console.warn(`[${pluginName}] no plugin options are supported`);
  }
  return {
    name: pluginName,
    buildStart() {
      const matchers = '{**/examples/*/_index.json,**/tutorials/*/*/_index.json}';
      const allPaths = glob.sync(matchers, {absolute: true});
      allPaths.forEach((descriptorPath) => {
        let descriptor = {};
        try {
          descriptor = JSON.parse(readFileSync(descriptorPath, 'utf8'));
        } catch (e) {
          console.warn(`[${pluginName}] skipping ${descriptorPath} because ${e}`);
          return;
        }
        if (!Array.isArray(descriptor.files) || descriptor.files.length === 0) {
          console.warn(`[${pluginName}] skipping ${descriptorPath} because the files property is not a list or it's an empty list`);
          return;
        }
        
        const examplePath = dirname(descriptorPath);
        const outputFilename = `${examplePath}.json`;
        const files = descriptor.files.map((filename) => {
          const inputFilename = `${examplePath}/${filename}`;
          const parsedFilename = parse(filename);
          return {
            name: parsedFilename.name, 
            type: parsedFilename.ext.slice(1), 
            content: readFileSync(inputFilename, 'utf8')
          };
        });
        writeFileSync(outputFilename, JSON.stringify({
          id: basename(examplePath),
          name: descriptor.name,
          description: descriptor.description,
          files
        }));
      });
    }
  };
}
