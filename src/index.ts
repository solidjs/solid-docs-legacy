import { DocFile, LessonFile, LessonLookup, ResourceMetadata, JsonFile, Example } from "./types";

export { DocFile, LessonFile, LessonLookup, ResourceMetadata, JsonFile, Example };

function noThrow<T>(x: Promise<T>): Promise<T | undefined> {
  return x.catch(() => undefined);
}

export async function getApi(lang: string): Promise<DocFile | undefined> {
  return await noThrow(import(`../langs/${lang}/api/api.md`));
}

export async function getDoc(
  lang: string,
  resource?: string
): Promise<DocFile | undefined> {
  return await noThrow(import(`../langs/${lang}/guides/${resource}.md`));
}

export async function getGuideDirectory(
  lang: string
): Promise<ResourceMetadata[] | undefined> {
  const directory = await noThrow(
    import(`../langs/${lang}/guides/directory.json`)
  );
  return directory?.default;
}

export async function getTutorial(
  lang: string,
  lesson: string
): Promise<LessonFile | undefined> {
  const [lessonFiles, solved, markdown] = await Promise.all([
    noThrow(import(`../langs/${lang}/tutorials/${lesson}/lesson.json`)),
    noThrow(import(`../langs/${lang}/tutorials/${lesson}/solved.json`)),
    noThrow(import(`../langs/${lang}/tutorials/${lesson}/lesson.md`)),
  ]);
  return {
    lesson: lessonFiles?.default,
    solved: solved?.default,
    markdown: markdown?.default,
  };
}

export async function getTutorialDirectory(
  lang: string
): Promise<LessonLookup[] | undefined> {
  const directory = await noThrow(
    import(`../langs/${lang}/tutorials/directory.json`)
  );
  return directory?.default;
}

export async function getExample(
  lang: string,
  id: string
): Promise<Example | undefined> {
  const example = await noThrow(import(`../langs/${lang}/examples/${id}.json`));
  return example?.default;
}

export async function getExamplesDirectory(
  lang: string
): Promise<Example[] | undefined> {
  const {examples: ids} = await noThrow(import(`../langs/${lang}/examples/_index.json`));
  if (!ids) return undefined;
  const result = [];
  for (const id of ids) {
    const example = await getExample(lang, id);
    if (!example) {
      console.warn(`Example ${id} not found`);
      continue;
    }
    // REM clone before mutating, otherwise import() cached value will be mutated
    const clonedExample = {...example};
    delete clonedExample.files;
    // FIXME building the directory on demand is very slow because every user
    // has to download all examples data (and their files). Instead, the
    // directory should be precomputed by the rollup plugin
    result.push(clonedExample);
  }
  return result;
}
