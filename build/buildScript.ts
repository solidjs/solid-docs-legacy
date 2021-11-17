const langsDir = resolve(__dirname, "../langs");

import { outputTutorials, outputDocs, writeToPath } from "./buildDocs";
import { readdir } from "fs/promises";
import { resolve } from "path";

async function run() {
  const langs: string[] = await readdir(langsDir);

  const tutorialLangs = [];
  const docLangs = langs; //TODO: Don't assume that docs are fully supported for every lang

  for (const lang of langs) {
    console.log("Processing", lang)
    if (await outputTutorials(lang)) {
      tutorialLangs.push(lang);
    }
    await outputDocs(lang);
  }

  //Outputs to ./src, to be directly imported by index.ts
  await outputSupported({tutorials: tutorialLangs, docs: docLangs});
}

async function outputSupported({tutorials, docs}: {tutorials: string[], docs: string[]}) {
  const supported = {
    tutorials,
    docs
  }
  const outputPath = resolve(__dirname, './out', "supported.json");
  await writeToPath(outputPath, supported);
}

run();