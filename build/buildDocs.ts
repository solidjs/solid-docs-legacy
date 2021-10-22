import htmlnano from 'htmlnano';
import frontmatter from 'front-matter';
import {getHighlighter, loadTheme} from 'shiki';
import markdown from 'markdown-it';
import anchor, {AnchorInfo} from 'markdown-it-anchor';
import Token from 'markdown-it/lib/token';
// import Got from 'got';
import {basename} from 'path';
import {existsSync} from 'fs';
import {writeFile, mkdir, readFile, readdir} from 'fs/promises';
import {resolve, join} from 'path'

import {Section} from "./types";

type DocPage = {
  directory: string, //relative to a lang folder
  outputName: string
}

const docPages: DocPage[] = [
  {
    directory: ".",
    outputName: "api"
  },
  {
    directory: "guides",
    outputName: "guide"
  },
]

async function run() {
  const langsDir = resolve(__dirname, "../langs");
  const langs: string[] = await readdir(langsDir);

  for (const lang of langs) {
    console.log("Processing", lang, "docs")
    const langPath = join(langsDir, lang);

    const outputDir = resolve(__dirname, '../dist/docs', lang);
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true });
    }

    for ( const {directory, outputName} of docPages) {
      const output = await processSections(join(langPath, directory));
      const outputPath = join(outputDir, `${outputName}.json`);
      await writeToPath(outputPath, output);
    }
  }
}

run();

// Write the file to a specific path
async function writeToPath(path: string, release: any) {
  await writeFile(path, JSON.stringify(release, null, 2), {
    encoding: 'utf-8',
  });
}

async function processSections(directoryPath: string) {
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
