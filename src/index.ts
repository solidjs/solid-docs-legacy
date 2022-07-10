import { DocFile, LessonFile, LessonLookup, ResourceMetadata } from "./types";

export { DocFile, LessonFile, LessonLookup, ResourceMetadata };

export async function getApi(
  lang: string
): Promise<DocFile | undefined> {
  return (await import(`../langs/${lang}/api/api.md`));
}

export async function getDoc(
  lang: string,
  resource?: string
): Promise<DocFile | undefined> {
  return (await import(`../langs/${lang}/guides/${resource}.md`));
}

export async function getGuideDirectory(
  lang: string
): Promise<ResourceMetadata[] | undefined> {
  const directory = await import(`../langs/${lang}/guides/directory.json`);
  return directory?.default;
}

export async function getTutorial(
  lang: string,
  lesson: string
): Promise<LessonFile | undefined> {
  const [lessonFiles, solved, markdown] = await Promise.all([
    import(`../langs/${lang}/tutorials/${lesson}/lesson.json`),
    import(`../langs/${lang}/tutorials/${lesson}/solved.json`),
    import(`../langs/${lang}/tutorials/${lesson}/lesson.md`),
  ]);
  return {
    lesson: lessonFiles.default,
    solved: solved.default,
    markdown: markdown.default,
  };
}

export async function getTutorialDirectory(
  lang: string
): Promise<LessonLookup[] | undefined> {
  const directory = await import(`../langs/${lang}/tutorials/directory.json`);
  return directory?.default;
}
