
import { outputTutorials, outputDocs, writeToPath } from "./buildDocs";
import { readdir } from "fs/promises";
import { resolve, join, sep } from "path";
import  watch from "node-watch";

const langsDir = resolve(__dirname, "../langs");

async function buildAll() {
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

async function watchAll() {
  const langs: string[] = await readdir(langsDir);
  for (const lang of langs) {
    const langDir = join(langsDir, lang);
    watch(langDir, { recursive: true }, async (event, name) => {
      const relative = name.split(langDir)[1];
      if (relative.startsWith(sep + "tutorials")) {
        console.log("Rebuilding tutorials for", lang)
        await outputTutorials(lang);
      } else {
        console.log("Rebuilding docs for", lang)
        await outputDocs(lang);
      }
    });
  }
}

async function outputSupported({tutorials, docs}: {tutorials: string[], docs: string[]}) {
  const supported = {
    tutorials,
    docs
  }
  const outputPath = resolve(__dirname, './out', "supported.json");
  await writeToPath(outputPath, supported);
}


if (process.argv[2] === "--watch") {
  watchAll()
} else {
  buildAll();
}

// run();