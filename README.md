<p>
  <img width="100%" src="https://assets.solidjs.com/banner?project=Docs&type=core" alt="Solid Docs">
</p>

## For contributing new content, head to the [new docs project](https://github.com/solidjs/solid-docs-next)!

# Solid Docs

This is documentation for SolidJS v1.0.0 and associated Solid packages and projects. You can find more information about Solid and all its documentation at [https://solidjs.com/](https://solidjs.com/).

# Translations

Solid's documentation is available in 10 languages:

| Language           | API Documentation | Guides | Tutorials | Contibutors                                                                                                                                                                |
| ------------------ | ----------------- | ------ | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🇫🇷 French (fr)     | 100%              | 100%   | 100%        | [xstevenyung](https://github.com/xstevenyung), [Vexcited](https://github.com/Vexcited)                                                                                                                              |
| 🇮🇹 Italian (it)    | 100%              | 100%   | 0%        | [davedbase](https://github.com/davedbase), [Nusakan](https://github.com/GabrielMarisescu),                                                                                 |
| 🇵🇹 Portuguese (pt) | 100%              | 100%   | 0%        | [candidosales](https://github.com/candidosales)                                                                                                                            |
| 🇨🇳 Chinese (zh-cn) | 100%              | 100%   | 100%      | [Gavin-Gong](https://github.com/Gavin-Gong)                                                                                                                                |
| 🇯🇵 Japanese (ja)   | 100%              | 100%   | 100%      | [jay-es](https://github.com/jay-es)                                                                                                                                        |
| 🇪🇸 Spanish (es)    | 10%               | 0%     | 0%        | [jnfrati](https://github.com/jnfrati), [augusto1024](https://github.com/augusto1024)                                                                                       |
| 🇮🇩 Indonesian (id) | 100%              | 100%   | 0%        | [athif23](https://github.com/athif23)                                                                                                                                      |
| 🇩🇪 German (de)     | 100%              | 100%   | 100       | [atk](https://github.com/atk)                                                                                                                                              |
| 🇷🇺 Russian (ru)    | 100%              | 100%   | 100%      | [Pheianox](https://github.com/pheianox), [TheFedaikin](https://github.com/TheFedaikin), [nairabrab](https://github.com/nairabrab), [Norskeld](https://github.com/norskeld) |
| 🇰🇷 Korean (ko-kr)  | 100%              | 100%   | 100%      | [LechuckRoh](https://github.com/lechuckroh)                                                                                                                                |

# Support

We would love contributions to our documentation. Writing clear, concise, and easy-to-translate documentation for a project like Solid can be tricky. It takes a community to make this possible. We encourage you to submit translations and edits as PRs
and to join the #_docs_ channel on the [Solid Discord](https://discord.com/invite/solidjs). A style guide and roadmap will be coming soon.

To start a translation project, create a folder with the language code in the `langs` folder of the project and copy English docs from the `en` folder. File structures must be maintained and content should be a direct translation without additions or modification of the original material. Kindly submit your contributions as PRs. A Solid team member and other native speakers of your language will have an opportunity to review your work before it's merged into the main branch.

If you feel the documentation is missing anything important, please feel free to open an issue or submit a modifying PR.

# Language READMEs

Each language folder has a `README.md` file that lets you know what changes have been made to the English documentation since the language has been updated.
The tables are automatically updated using [`markdown-magic`](https://github.com/DavidWells/markdown-magic) when a commit is made to the main branch.
Note that the READMEs are only updated on the main branch.

(If you create a new language folder, it will automatically get a `README.md` file when the PR is merged.)

These READMEs are also a place for translation maintainers to write any notes about their translation.

# Building

This package serves to build the markdown files into a consumable format imported by [solid-site](https://github.com/solidjs/solid-site).

Run `yarn build` to run the build script. This compiles the markdown into various json files in the `dist` folder and turns the `index.ts` file into an entry point that accesses them. Then, to view your changes in the context of the site, clone both repositories and run `yarn link` in the solid-docs directory and `yarn link @solid.js/docs` in the solid-site directory.

After linking, run `yarn watch` in solid-docs to recompile your changes as you make them. Note that adding a new language or a new tutorial directory for a language that didn't have one won't trigger the watcher; run `yarn build` first.

### Theming

The script mentioned above uses shiki to process the code which in turn uses VSCode tokens. Therefore any VSCode theme can be applied.

All you have to do is retrieve the JSON file describing your favorite theme (see ./build/github-light.json for an example), paste it into the build folder and refer to it in the fetchReleases.ts file around line 158: const theme = await loadTheme(resolve(\_\_dirname, 'your-theme.json'));.

## Importing Docs and Tutorials

This section probably won't be relevant unless you're working on solid-site.
The package exposes async functions to load the documentation using dynamic imports.

```ts
getSupported(resourcePath: string, lang?: string)
```

Takes a _resource path_ and returns a list of language codes that support that resource.
If passed a language code, it will return `true` if that language supports the resource.

```js
getSupported('tutorials/async_lazy'); //[ 'de', 'en', 'ja', 'ru', 'zh-cn' ]
getSupported('guides/comparison', 'fr'); // true
```

Resource paths follow the directory structure of the language folders.
Currently, there are guide resources (`guides/name`), tutorial resources (`tutorials/name`), and the API resource (`api`).

```ts
getAllResourcePaths(lang: string): Promise<string[]>
```

Returns a list of all resource paths for a given language.

```ts
getGuides(lang: string): Promise<Array<{resource: string, title: string, description: string}>>
```

Takes a language code and returns an array of metadata for all supported guides. The array is sorted by the sort number in the
guide metadata.

```ts
getDoc(lang: string, resource: string): Promise<DocFile | false>
```

Takes a language code matching a `langs` subdirectory and a resource name and returns a documentation file (see `src/types.ts`) if it exists.
Use this to get the compiled output for all resources except tutorials.

```ts
getTutorial(lang: string, lesson: string): Promise<LessonFile | false>
```

Takes a language code and a lesson name and returns a lesson file if it exists. Each tutorial file has the `lesson` code files (the starting state of the code editor); the `solved` files, which show up when the user clicks the Solve button; and the lesson markdown itself.

Lesson names come from a lang folder's `tutorials/directory.json` file which can be imported using the following function.

```ts
getTutorialDirectory(lang: string): Promise<LessonLookup[] | false>
```

Returns the directory object for language if it provides tutorials.

# Thank You

Translating Solid's documentation into many languages helps our community grow internationally. Thank you to all our supporters and contributors who help maintain Solid Docs.
