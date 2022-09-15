// This script is meant to be run on each build, to join a group of files into a
// single JSON file of type JsFiles. Its purpose is to join individual files, so
// that the solid-site can keep using them.

import glob from 'glob';
import { dirname, parse, basename } from 'path';
import { readFileSync, writeFileSync } from 'fs';

const pluginName = 'generate-json-folders';

const directoryPattern = '**/examples-src/$descriptor.json';
const examplesPattern = '**/examples-src/*/$descriptor.json';

function getGlobPaths(...patterns) {
  return glob.sync(
    patterns.length > 1 ? `{${patterns.join(',')}}` : patterns[0], 
    {absolute: true}
  );
}

function getDescriptor(descriptorPath) {
  let descriptor = null;
  try {
    descriptor = JSON.parse(readFileSync(descriptorPath, 'utf8'));
  } catch (e) {
    console.warn(`[${pluginName}] skipping ${descriptorPath} because ${e}`);
    return descriptor;
  }
  return descriptor;
}

function getGeneratedPath(path) {
  return path.replace('/examples-src/', '/examples/');
}

function getFiles(folderPath, filenames) {
  return (filenames || []).map((filename) => {
    const filepath = `${folderPath}/${filename}`;
    const {name, ext} = parse(filename);
    return {
      name, 
      type: ext.slice(1), 
      content: readFileSync(filepath, 'utf8')
    };
  });
}

function createExamplesDirectory(cachedExamples) {
  const descriptorPaths = glob.sync(directoryPattern, {absolute: true});
  descriptorPaths.forEach((descriptorPath) => {
    const descriptor = getDescriptor(descriptorPath);
    if (!descriptor) return; // skip
    const directory = descriptor.map((id) => {
      const exampleSrcPath = `${dirname(descriptorPath)}/${id}`;
      const example = cachedExamples[exampleSrcPath];
      return example;
    });
    const directoryPath = getGeneratedPath(descriptorPath);
    writeFileSync(directoryPath, JSON.stringify(directory));
  });
}

export default function pack(pluginOptions) {
  if (pluginOptions) {
    console.warn(`[${pluginName}] no plugin options are supported`);
  }
  return {
    name: pluginName,
    buildStart() {
      const descriptorPaths = getGlobPaths(examplesPattern);
      const cachedExamples = {};
      descriptorPaths.forEach((descriptorPath) => {
        const descriptor = getDescriptor(descriptorPath);
        if (!descriptor) return; // skip
        
        const exampleSrcPath = dirname(descriptorPath);
        const files = getFiles(exampleSrcPath, descriptor.files);
        const example = {
          id: basename(exampleSrcPath),
          name: descriptor.name,
          description: descriptor.description,
          files
        };
        const examplePath = getGeneratedPath(exampleSrcPath);
        writeFileSync(`${examplePath}.json`, JSON.stringify(example));
        delete example.files;
        cachedExamples[exampleSrcPath] = example;
      });
      createExamplesDirectory(cachedExamples);
    }
  };
}
