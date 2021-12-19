import supported from "../build/out/supported.json"
import {DocFile, LessonFile, LessonLookup, StringKeyed, ResourceMetadata} from "./types";

export { supported, ResourceMetadata, DocFile, LessonFile, LessonLookup }

function traverse(resourcePath: string[]): StringKeyed | false | string[]{
  let cursor = supported;
  for (const part of resourcePath) {
    // @ts-ignore
    cursor = cursor[part];
    if (!cursor) {
      return false;
    }
  }
  return cursor;
}

export async function getGuides(lang: string) {
  const metadata = (await import(`../build/out/docs/${lang}/guides/_metadata.json`)).default as {
    [resource: string]: ResourceMetadata
  };
  if (metadata) {
    return Object.entries(metadata)
      .filter( ([resource, metadata]) => metadata.title)
      .sort((a, b) => (a[1].sort - b[1].sort))
      .map( ([resource, {description, title}]) => ({
        resource: "guides/" + resource,
        description, title
    }))
  }
}

export function getSupported(resourcePath: string, lang: string) {
  const cursor = traverse(resourcePath.split('/'));
  if (!cursor) {
    return false;
  }
  if (Array.isArray(cursor)) {
    return cursor.includes(lang);
  }

  const keys = Object.keys(cursor);

  if (!keys.length) return false;

  if (keys.length) {
    return keys.filter(key => {
      if (!Array.isArray(cursor[key])) return false;
      return (cursor[key] as string[]).includes(lang);
    });
  }
}

export async function getDoc(lang: string, resource: string): Promise<DocFile | false> {
  const resourcePath = resource.split('/');
  const cursor = traverse(resourcePath);
  if (!Array.isArray(cursor) || !cursor.includes(lang)) {
    return false;
  }
  // We have to have each depth explicitly for rollup dynamic imports to work
  if (resourcePath.length == 1) {
    return (await import(`../build/out/docs/${lang}/${resourcePath[0]}.json`)).default as DocFile;
  }
  if (resourcePath.length == 2) {
    return (await import(`../build/out/docs/${lang}/${resourcePath[0]}/${resourcePath[1]}.json`)).default as DocFile;
  }
  return false;
}

export async function getTutorial(lang: string, lesson: string): Promise<LessonFile | false> {
  const cursor = traverse(['tutorials', lesson]);
  if (!Array.isArray(cursor) || !cursor.includes(lang)) {
    return false;
  }
  const lessonFile = (await import(`../build/out/tutorials/${lang}/${lesson}.json`)).default as LessonFile;
  return lessonFile;
  return false;
}

export async function getTutorialDirectory(lang: string): Promise<LessonLookup[] | false> {
  const directory = (await import(`../build/out/tutorials/${lang}/directory.json`)).default;
  if (directory)
    return directory.default;
  return false;
}