// Use this script to refresh examples from solid-site in case they were changed
// before merging the "split-js-files" branch in both solid-docs and solid-site.
//
// input 
//   1: source folder (eg: "<root>/../solid-site/public/examples")
//   2: dest folder (eg: "<root>/langs/en/examples-src")
// output
//   - as many subfolders of the dest folder as files in the glob, each named after the basename of the file
//   - as many files in each subfolder as there are packed into each file in the glob

import { resolve, basename, dirname } from 'path';
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'fs';

let [sourceFolder, destFolder] = process.argv.slice(2);
if (!(sourceFolder && destFolder)) {
  throw new Error('Expected both a source and a dest folder');
}

sourceFolder = resolve('./', sourceFolder);
destFolder = resolve('./', destFolder);


const sourceFiles = readdirSync(sourceFolder);
sourceFiles.forEach((sourceFilename) => {
  const sourcePath = `${sourceFolder}/${sourceFilename}`;
  if (!/\.json$/.test(sourcePath)) {
    console.log(`skipping ${sourcePath} because not '.json'`);
    return;
  }
  const json = readFileSync(sourcePath, 'utf8');
  let data;
  try {
    console.log(`parsing ${sourcePath}`);
    data = JSON.parse(json);
  } catch (e) {
    console.log(`skipping ${sourcePath} because ${e}`);
    return;
  }
  if (!data.files?.length) {
    console.log('no files to extract');
    return;
  }
  console.log(`extracting ${data.files.length} files`);
  const destPathParent = `${destFolder}/${basename(sourceFilename, '.json')}`;
  mkdirSync(destPathParent, {recursive: true});
  const filesOrder = [];
  data.files.forEach((file) => {
    const destFilename = `${file.name}.${file.type || 'jsx'}`;
    filesOrder.push(destFilename);
    const destPath = `${destPathParent}/${destFilename}`;
    let content = file.content;
    if (Array.isArray(content)) content = content.join('\n');
    writeFileSync(destPath, content);
    console.log(`- extracted ${destPath}`);
  });
  // Commented out the following write because not needed to only update examples
  // writeFileSync(`${destPathParent}/.json-files`, JSON.stringify(filesOrder));
});
