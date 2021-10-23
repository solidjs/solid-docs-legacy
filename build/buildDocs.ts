import htmlnano from 'htmlnano';
import frontmatter from 'front-matter';
import {getHighlighter, loadTheme} from 'shiki';
import markdown from 'markdown-it';
import anchor, {AnchorInfo} from 'markdown-it-anchor';
import Token from 'markdown-it/lib/token';
// import Got from 'got';
import {existsSync} from 'fs';
import {mkdir, readdir, readFile, writeFile} from 'fs/promises';
import {join, resolve} from 'path'

import {DocFile, DocPageLookup, LessonFile, LessonLookup, Section} from "../src/types";

const docPages: DocPageLookup[] = [
  {
    subdir: ".",
    outputName: "api"
  },
  {
    subdir: "guides",
    outputName: "guide"
  },
]

const langsDir = resolve(__dirname, "../langs");

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

run();

// Write the file to a specific path
async function writeToPath(path: string, release: any) {
  await writeFile(path, JSON.stringify(release, null, 2), {
    encoding: 'utf-8',
  });
}

async function outputDocs(lang: string) {
  const langPath = join(langsDir, lang);

  const outputDir = resolve(__dirname, '../dist/docs', lang);
  if (!existsSync(outputDir)) {
    await mkdir(outputDir, { recursive: true });
  }

  for ( const {subdir, outputName} of docPages) {
    const output = await processSections(join(langPath, subdir));
    const outputPath = join(outputDir, `${outputName}.json`);
    await writeToPath(outputPath, output);
  }
}

async function outputTutorials(lang: string) {

  const tutorialsDir = join(langsDir, lang, "tutorials");

  const lookupPath = join(tutorialsDir, "directory.json");

  if (!existsSync(lookupPath)) {
    console.log("(tutorials don't exist)")
    return false;
  }

  const lookups: LessonLookup[] = await import(lookupPath);

  const combineTutorialFiles = async (name: string): Promise<LessonFile> => {
    const outputMap: { [filename: string]: keyof LessonFile } = {
      "lesson.json": "lesson",
      "solved.json": "solved",
      "lesson.md": "markdown"
    }

    const output: LessonFile = {};
    for (const [filename, outputKey] of Object.entries(outputMap)) {
      const filePath = join(tutorialsDir, name, filename);
      const fileContent = await readFile(filePath, {encoding: 'utf-8'});
      try {
        output[outputKey] = JSON.parse(fileContent);
      } catch (err) {
        output[outputKey] = fileContent;
      }
    }

    return output;
  }

  for (const lesson of lookups) {
    const output = await combineTutorialFiles(lesson.internalName);
    const outputDir = resolve(__dirname, '../dist/tutorials', lang);
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true });
    }
    await writeToPath(`${outputDir}/${lesson.internalName}.json`, output);
    return true;
  }
}

async function outputSupported({tutorials, docs}: {tutorials: string[], docs: string[]}) {
  const supported = {
    tutorials,
    docs
  }
  const outputPath = resolve(__dirname, '../src', "supported.json");
  await writeToPath(outputPath, supported);
}

async function processSections(directoryPath: string): Promise<DocFile> {
  const mdFiles = (await readdir(directoryPath))
    .filter(name => name.endsWith(".md"))
    .map(relative => join(directoryPath, relative));

  let results = [];
  for (const mdFile of mdFiles) {
    const fileContent = await readFile(mdFile, {encoding: 'utf-8'});
    results.push(await processMarkdown(fileContent));
  }

  results.sort(
    (a: any, b: any) => (
      a.attributes ? a.attributes.sort : 0) - (b.attributes ? b.attributes.sort : 0)
  );

  let content = '';
  let sections = [];
  for (let i in results) {
    content += results[i].html;
    sections.push(...results[i].sections);
  }

  return {
    sections,
    content
  }
}

// Parse individual markdown files
async function processMarkdown(mdToProcess: string) {
  const { attributes, body } = frontmatter(mdToProcess);
  const theme = await loadTheme(resolve(__dirname, 'github-light.json'));
  const highlighter = await getHighlighter({ theme });
  const md = markdown({
    html: true,
    linkify: true,
    highlight(codeToHightlight, lang) {
      const language = lang === 'js' ? 'ts' : lang === 'jsx' ? 'tsx' : lang;
      return highlighter.codeToHtml(codeToHightlight, language);
    },
  });
  const sections: Section[] = [];
  let first: Section;
  let second: Section | undefined;
  md.use(anchor, {
    permalink: true,
    permalinkBefore: true,
    permalinkSymbol: '#',
    callback: (token: Token, { slug, title }: AnchorInfo) => {
      // h1 -> 1, h2 -> 2, etc.
      const level = Number.parseInt(token.tag[1], 10);
      const section: Section = { slug, title, level, children: [] };
      if (level === 1) {
        first = section;
        second = undefined;
        sections.push(first);
      } else if (level === 2) {
        second = section;
        first.children!.push(second);
      } else {
        if (!second) return;
        else second.children!.push(section);
      }
    },
  });
  const renderedMarkdown = md.render(body)
  const optimizedMarkdown = (await htmlnano.process(renderedMarkdown)).html
  const html = '<section class="mt-10">' + optimizedMarkdown + '</section>';
  return { html, attributes, sections };
}
