export interface Section {
  slug: string;
  title: string;
  level: number;
  children?: Section[];
}

export type ResourceMetadata = {
  title: string,
  description: string,
  resource: string
}

export type DocPageLookup = {
  subdir: string, //relative to a lang folder
  outputName: string,
  /*
    if true, the markdown files will be output as a single file with outputName; if not, outputName
    will be the name of an output directory containing each processed markdown file
   */
  combine: boolean,
}
export type DocFile = {
  sections: any[],
  html: string
}
export type LessonLookup = {
  lessonName: string,
  internalName: string,
}
// type LessonCode = {
//   files: Array<{ name?: string, type?: string, content?: string }>
// }
export type LessonFile = {
  lesson?: any,
  solved?: any,
  markdown?: string,
}

export type StringKeyed = { [key: string]: StringKeyed | string[] };

