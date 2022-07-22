import { readdir, writeFile } from "fs/promises";
import { readdirSync } from "fs";
import { join, resolve } from "path";
import gitlog from "gitlog";
import markdownMagic from "markdown-magic";
import tablemark from "tablemark";
import { parse } from "path";
const langsDir = resolve(__dirname, "../langs");

function* walkSync(dir: string): Generator<string, void, void> {
  const files = readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    if (file.isDirectory()) {
      yield* walkSync(join(dir, file.name));
    } else {
      yield join(dir, file.name);
    }
  }
}

function getCommitInfo(file: string, lang: string) {
  const commits = gitlog({
    repo: process.cwd(),
    file,
    number: 2,
    includeMergeCommitFiles: true,
    fields: ["hash", "authorDate", "subject"],
  });

  let latestCommit = commits.shift()!;
  if (latestCommit.subject.startsWith("refactor")) {
    latestCommit = commits.shift()!;
  }

  const date = Date.parse(
    latestCommit.authorDate.split(" ").slice(0, -1).join(" ")
  );
  return {
    file: file.slice(join(langsDir, lang).length + 1),
    hash: latestCommit.hash,
    date,
  };
}

type UpdateData = {
  file: string;
  hashLang: string;
  hashEn: string;
  dateLang: number;
  dateEn: number;
};

type Updates = { [lang: string]: UpdateData[] };

type CreatedData = {
  file: string;
};

type Created = { [lang: string]: CreatedData[] };

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
  const fileLink = (lang: string, path: string) =>
    link(
      path,
      `https://github.com/solidjs/solid-docs/tree/main/langs/${lang}/${path}`
    );
  const commitLink = (date: number, hash: string) =>
    link(
      new Date(date).toLocaleDateString("en-US"),
      `https://github.com/solidjs/solid-docs/commit/${hash}`
    );

  const config = {
    matchWord: "MM",
    transforms: {
      UPDATED(content, options) {
        const langUpdates = updates[options.lang];
        const rows = langUpdates.map((data) => ({
          fileLang: fileLink(options.lang, data.file),
          fileEn: fileLink("en", data.file),
          updatedEn: commitLink(data.dateEn, data.hashEn),
          updatedLang: commitLink(data.dateLang, data.hashLang),
        }));
        if (rows.length === 0) return "";
        return tablemark(rows, {
          columns: [
            "File",
            "English File",
            "Last Updated (EN)",
            `Last Updated (${options.lang.toUpperCase()})`,
          ],
        });
      },
      CREATED(content, options) {
        const langCreated = created[options.lang];
        const byResource: { [resource: string]: CreatedData[] } = {};
        for (const data of langCreated) {
          const dir = parse(data.file).dir;
          if (!byResource[dir]) {
            byResource[dir] = [];
          }
          byResource[dir].push(data);
        }
        const rows = Object.entries(byResource).map(([resource, data]) => ({
          resource,
          files: data.map((d) => fileLink(options.lang, d.file)).join(", "),
        }));
        if (rows.length === 0) return "";
        return tablemark(rows, { columns: ["Resource Name", "English Files"] });
      },
    },
  };
  markdownMagic(join(langsDir, "*", "README.md"), config);
}

async function initializeTodoData() {
  const langs: string[] = (await readdir(langsDir)).filter(
    (lang: string) => lang !== "en"
  );

  const updates: Updates = {};

  const created: Created = {};

  langs.forEach((lang) => {
    updates[lang] = [];
    created[lang] = [];
  });

  const enFiles = [...walkSync(join(langsDir, "en"))].map((file) =>
    getCommitInfo(file, "en")
  );

  for (const lang of langs) {
    const langFiles = [...walkSync(join(langsDir, lang))].map((file) =>
      getCommitInfo(file, lang)
    );
    for (const enFile of enFiles) {
      const langFile = langFiles.find((f) => f.file == enFile.file);
      if (langFile) {
        if (enFile.date > langFile.date) {
          updates[lang].push({
            file: langFile.file,
            hashLang: langFile.hash,
            hashEn: enFile.hash,
            dateLang: langFile.date,
            dateEn: enFile.date,
          });
        }
      } else {
        created[lang].push({
          file: enFile.file,
        });
      }
    }
  }

  await makeMarkdownMagic(updates, created);
}

initializeTodoData();
