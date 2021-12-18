
import { outputTutorials, outputDocs, writeToPath } from "../build/buildDocs";
import { readdir } from "fs/promises";
import { resolve, join, sep } from "path";
import  watch from "node-watch";

const langsDir = resolve(__dirname, "../langs");

async function buildAll() {
  const langs: string[] = await readdir(langsDir);

  type stringKeyed = { [key: string]: stringKeyed | string[] };
  const supported: stringKeyed = {};

  function addSupported(resource: string, lang: string) {
    const path = resource.split("/");
    let pointer: any = supported;
    for (let i = 0; i < path.length - 1; i++) {
      pointer = pointer[path[i]] || (pointer[path[i]] = {});
    }
    const lastSegment = path[path.length - 1];
    if (pointer[lastSegment]) {
      pointer[lastSegment].push(lang);
    } else {
      pointer[lastSegment] = [lang];
    }
  }

  for (const lang of langs) {
    console.log("Processing", lang)
    const supportedTutorials = await outputTutorials(lang);
    if (supportedTutorials) supportedTutorials.forEach(resource => addSupported(resource, lang));
    (await outputDocs(lang)).forEach(resource => addSupported(resource, lang));
  }

  const outputPath = resolve(__dirname, '../build/out', "supported.json");
  await writeToPath(outputPath, supported);
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

if (process.argv[2] === "--watch") {
  watchAll()
} else {
  buildAll();
}

// run();