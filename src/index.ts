import supported from "./supported.json"
import {DocFile, LessonFile, LessonLookup} from "./types";

export const supportedDocs: string[] = supported.docs;
export const supportedTutorials: string[] = supported.tutorials;

export async function getDoc(lang: string, resource: string): Promise<DocFile | false> {
   if (supported.docs.includes(lang)) {
      const doc = await import(`./docs/${lang}/${resource}.json`) as DocFile;
      return doc;
   }
   return false;
}

export async function getTutorial(lang: string, lesson: string): Promise<LessonFile | false> {
   if (supported.tutorials.includes(lang)) {
      const lessonFile = await import(`./tutorials/${lang}/${lesson}.json`) as LessonFile;
      return lessonFile;
   }
   return false;
}

export async function getTutorialDirectory(lang: string): Promise<LessonLookup[] | false> {
   if (supported.tutorials.includes(lang)) {
      const directory = await import(`./tutorials/${lang}/directory.json`);
      return directory.default;
   }
   return false;
}