export interface Section {
  depth: string;
  value: string;
  children?: Section[];
}

export interface LessonLookup {
  lessonName: string;
  internalName: string;
}

export interface ResourceMetadata {
  title: string,
  description: string,
  resource: string
}

export interface DocFile {
  toc: Section[];
  default: string;
}

export interface LessonFile {
  lesson?: any;
  solved?: any;
  markdown?: string;
}

export interface Example {
  id: string;
  name: string;
  description: string;
  files?: any;
}
