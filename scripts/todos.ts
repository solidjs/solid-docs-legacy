import {getSupported, getAllResourcePaths} from "../src";
import {readdir, writeFile} from "fs/promises";
import {join, resolve} from "path";
import {promisify} from "util";
import {exec} from "child_process";
import gitlog from "gitlog"

import markdownMagic from "markdown-magic";
import tablemark from "tablemark";


const asyncExec = promisify(exec);

const langsDir = resolve(__dirname, "../langs");

async function getFilePaths(resourcePath: string, lang: string): Promise<string[]> {
  if (resourcePath.startsWith("tutorials")) {
    const dir = join(langsDir, lang, resourcePath);
    try {
      const files = await readdir(dir);
      return files.map(file => join("langs", lang, resourcePath, file));
    } catch (e){
      return [];
    }
  }
  const file = join("langs", lang, `${resourcePath}.md`);
  return [file]
}


let fileMap: {
  [file: string]: {
    [lang: string]: string
  }
} | undefined = undefined;
async function getFileMap() {
  if (fileMap) return fileMap;
  fileMap = {}
  for (const resourcePath of getAllResourcePaths("en")) {
    const supported = getSupported(resourcePath);
    if (Array.isArray(supported)) {
      for (const lang of supported) {
        const filePaths = (await getFilePaths(resourcePath, lang));
        for (const filePath of filePaths) {
          if (!fileMap[filePath]) {
            fileMap[filePath] = {};
          }
          fileMap[filePath] = {
            lang,
            resource: resourcePath
          }
        }
      }
    }
  }
  return fileMap;
}
function getCommitInfo(file: string) {
  const [latestCommit] = gitlog({
    repo: process.cwd(),
    file,
    number: 1,
    fields: ["hash", "authorDate"]
  })

  const date = Date.parse(latestCommit.authorDate.split(" ").slice(0, -1).join(" "));
  return {
    file: file.split(langsDir).slice(-1)[0],
    hash: latestCommit.hash,
    date
  }
}


type UpdateData = {
  resource: string,
  fileLang: string,
  fileEn: string,
  hashLang: string,
  hashEn: string,
  dateLang: number
  dateEn: number
}

type Updates = { [lang: string]: UpdateData[]}

type CreatedData = {
  resource: string,
  fileEn: string,
}

type Created = { [lang: string]: CreatedData[]}

async function makeMarkdownMagic(updates: Updates, created: Created) {
  // const readmePath = join(__dirname, "../README.md");
  const langs = new Set([...Object.keys(updates), ...Object.keys(created)]);
  for (const lang of langs) {
    const dirFiles = await readdir(join(langsDir, lang));
    if (!dirFiles.includes("README.md")) {
      const template = `
## Translator Notes

## Todo

### Updates  
These files exist for this language, but may need to be updated to reflect the newest changes.  
<!--MM:START (UPDATED:lang=${lang}) --><!--MM:END-->
### Missing Files  
These files haven't been created yet for this language.  
<!--MM:START (CREATED:lang=${lang}) --><!--MM:END-->
        `;
      await writeFile(join(langsDir, lang, "README.md"), template, "utf8");
    }
  }

  const link = (text: string, href: string) => `[${text}](${href})`;
  const fileLink = (path: string) => link(path, `https://github.com/solidjs/solid-docs/tree/main/${path}`)
  const commitLink = (date: number, hash: string) => link(new Date(date).toLocaleDateString("en-US"), `https://github.com/solidjs/solid-docs/commit/${hash}`)

  const config = {
    matchWord: "MM",
    transforms: {
      UPDATED(content, options) {
        const langUpdates = updates[options.lang];
        const rows = langUpdates.map(data => ({
          fileLang: fileLink(data.fileLang),
          fileEn: fileLink(data.fileEn),
          updatedEn: commitLink(data.dateEn, data.hashEn),
          updatedLang: commitLink(data.dateLang, data.hashLang),
        }))
        return tablemark(rows, { columns: ["File", "English File", "Last Updated (EN)", `Last Updated (${options.lang.toUpperCase()})`] });
      },
      CREATED(content, options) {
        const langCreated = created[options.lang];
        const byResource: { [resource: string]: CreatedData[] } = {};
        for (const data of langCreated) {
          if (!byResource[data.resource]) {
            byResource[data.resource] = [];
          }
          byResource[data.resource].push(data);
        }
        const rows = Object.entries(byResource).map(([resource, data]) => ({
          resource,
          files: data.map(d => fileLink(d.fileEn)).join(", ")
        }))
        return tablemark(rows, { columns: ["Resource Name", "English Files"] });
      }
    }
  }
  markdownMagic(join(langsDir, "*", "README.md"), config);
}


async function initializeTodoData() {
  const langs: string[] = (await readdir(langsDir)).filter((lang: string) => lang !== "en");

  const updates: Updates = {}

  const created: Created = {}

  langs.forEach(lang => {
    updates[lang] = [];
    created[lang] = [];
  })

  for (const resourcePath of getAllResourcePaths("en")) {
    const enFiles = await getFilePaths(resourcePath, "en");
    const enLatest = enFiles.map(getCommitInfo);

    for (const lang of langs) {
      const isSupported = getSupported(resourcePath, lang);
      if (isSupported) {
        const langFiles = await getFilePaths(resourcePath, lang);
        const langLatest = langFiles.map(getCommitInfo);
        for (let i = 0; i < enFiles.length; i++) {
          if ( enLatest[i].date > langLatest[i].date) {
            updates[lang].push({
              resource: resourcePath,
              fileLang: langFiles[i],
              fileEn: enFiles[i],
              hashLang: langLatest[i].hash,
              hashEn: enLatest[i].hash,
              dateLang: langLatest[i].date,
              dateEn: enLatest[i].date
            })
          }
        }
      } else {
        const enFiles = await getFilePaths(resourcePath, "en");
        created[lang].push(...enFiles.map(file => ({
          resource: resourcePath,
          fileEn: file
        })));
      }
    }
  }

  await makeMarkdownMagic(updates, created);
}

async function updateTodoData(sinceHash?: string) {
  const {stdout, stderr} = await asyncExec(`git diff --name-only ${sinceHash}`);
  const map = await getFileMap();
  const touchedFiles = stdout.split("\n").filter(file => file in map);
  for (const file of touchedFiles) {
    console.log(map[file]);
  }
}


(async () => {
  const fileMap = await getFileMap();
  initializeTodoData();
  // return;
  // console.log(await filePaths("tutorials/props_split", "en"));



  // const data = await updateTodoData("1d65088afae4b6fd351499975c7b88078a6322b0");
  // console.log(data);

  // getAllResourcePaths("en").map(async (path) => {
  //
  //   const enFiles = await filePaths(path, "en");
  //   const enLatest = enFiles.map(commitInfo);
  //
  //   for (const lang of langs) {
  //     const isSupported = getSupported(path, lang);
  //     if (isSupported) {
  //       const langFiles = await filePaths(path, lang);
  //       const langLatest = langFiles.map(commitInfo);
  //       for (let i = 0; i < enFiles.length; i++) {
  //         if ( enLatest[i].date > langLatest[i].date) {
  //           console.log(`${lang} ${path} ${langLatest[i].file} is out of date`)
  //         }
  //       }
  //     }
  //   }
  //   // console.log(commitInfo);
  // })


  // for (const lang of langs) {
  //   getAllResourcePaths(lang).map(path => {
  //     const isSupported = getSupported(path, lang);
  //     if (isSupported) {
  //       gitlog()
  //     }
  //   })
  // }

})();

