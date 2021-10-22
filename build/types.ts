export interface Section {
  slug: string;
  title: string;
  level: number;
  children?: Section[];
}

export type DocPageLookup = {
  subdir: string, //relative to a lang folder
  outputName: string
}
export type DocFile = {
  sections: any[],
  content: string
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