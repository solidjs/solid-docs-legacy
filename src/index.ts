import supported from "../build/out/supported.json";
import {
  DocFile,
  LessonFile,
  LessonLookup,
  StringKeyed,
  ResourceMetadata,
} from "./types";

export { supported, ResourceMetadata, DocFile, LessonFile, LessonLookup };

function traversePath(resourcePath: string[]): StringKeyed | false | string[] {
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

export async function getGuides(
  lang: string,
  defaultToEnglish = false
): Promise<ResourceMetadata[] | undefined> {
  const supported = getSupported("guides", lang);
  if (Array.isArray(supported) && supported.length) {
    const metadata = (
      await import(`../build/out/docs/${lang}/guides/_metadata.json`)
    ).default as {
      [resource: string]: {
        sort: number;
        title: string;
        description: string;
      };
    };

    if (metadata) {
      return Object.entries(metadata)
        .filter(([resource, metadata]) => metadata.title)
        .sort((a, b) => a[1].sort - b[1].sort)
        .map(([resource, { description, title }]) => ({
          resource: "guides/" + resource,
          description,
          title,
        }));
    }
  }

  return defaultToEnglish ? getGuides("en") : [];
}

export function getSupported(resourcePath: string, lang?: string) {
  const cursor = traversePath(resourcePath.split("/"));
  if (!cursor) {
    return false;
  }
  if (Array.isArray(cursor)) {
    if (lang) {
      return cursor.includes(lang);
    }
    return cursor;
  }

  if (!lang) {
    return false;
  }

  const keys = Object.keys(cursor);

  if (!keys.length) return false;

  if (keys.length) {
    return keys.filter((key) => {
      if (!Array.isArray(cursor[key])) return false;
      return (cursor[key] as string[]).includes(lang);
    });
  }
}

export function getAllResourcePaths(lang: string) {
  const paths: string[] = [];
  const traverse = (resourcePath: string[], cursor: StringKeyed | string[]) => {
    if (Array.isArray(cursor)) {
      if (cursor.includes(lang)) {
        paths.push(resourcePath.join("/"));
      }
      return;
    }
    for (const [key, value] of Object.entries(cursor)) {
      traverse(resourcePath.concat(key), value);
    }
  };
  traverse([], supported);
  return paths;
}

export async function getDoc(
  lang: string,
  resource: string
): Promise<DocFile | false> {
  const resourcePath = resource.split("/");
  const cursor = traversePath(resourcePath);
  if (!Array.isArray(cursor) || !cursor.includes(lang)) {
    return false;
  }
  // We have to have each depth explicitly for rollup dynamic imports to work
  if (resourcePath.length == 1) {
    return (await import(`../build/out/docs/${lang}/${resourcePath[0]}.json`))
      .default as DocFile;
  }
  if (resourcePath.length == 2) {
    return (
      await import(
        `../build/out/docs/${lang}/${resourcePath[0]}/${resourcePath[1]}.json`
      )
    ).default as DocFile;
  }
  return false;
}

export async function getTutorial(
  lang: string,
  lesson: string
): Promise<LessonFile | false> {
  const cursor = traversePath(["tutorials", lesson]);
  if (!Array.isArray(cursor) || !cursor.includes(lang)) {
    return false;
  }
  const lessonFile = (
    await import(`../build/out/tutorials/${lang}/${lesson}.json`)
  ).default as LessonFile;
  return lessonFile;
  return false;
}

export async function getTutorialDirectory(
  lang: string
): Promise<LessonLookup[] | false> {
  const directory = await import(
    `../build/out/tutorials/${lang}/directory.json`
  );
  if (directory?.default) {
    return directory.default;
  }
  if (directory) {
    return directory;
  }
  return false;
}
