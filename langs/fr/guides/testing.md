# Tester Solid

Pour utiliser votre code Solid en production, il doit être testé. Comme vous ne voulez pas tout tester manuellement, vous avez besoin de tests automatisés. Ce guide décrit comment tout mettre en place et quelques patterns utiles pour tester le code Solid.

## Configuration des Tests

Nous offrons un support pour deux librairies de test:

- jest - très bien établi avec de nombreuses fonctionnalités

- uvu - apporte seulement le strict nécessaire

Les deux sont basés sur [solid-testing-library](https://github.com/solidjs/solid-testing-library), qui intègre [Testing Library](https://testing-library.com/) dans Solid. Testing Library imite un navigateur léger et fournit une API pour interagir avec lui depuis vos tests.

Nous maintenons un template de démarrage pour les tests Solid et Jest. Nous vous recommandons de baser votre projet sur celui-ci, ou bien d'installer le template de démarrage dans un projet de base et de copier la configuration de celui-ci dans votre propre projet.

Les templates utilisent l'utilitaire [degit](https://github.com/Rich-Harris/degit) pour l'installation.

### Configurer Jest

L'intégration Jest est basée sur le préréglage de configuration Jest [solid-jest/preset/browser](https://github.com/solidjs/solid-jest) qui vous permet d'utiliser Solid comme dans un navigateur. Cela utilise Babel pour transformer le code Solid.

Il utilise [jest-dom](https://github.com/testing-library/jest-dom) pour étendre `expect` avec un tas de matchers personnalisés qui vous aident à écrire des tests.

#### Jest avec TypeScript (`ts-jest`)

```bash
$ npx degit solidjs/templates/ts-jest mon-projet-solid
$ cd mon-projet-solid
$ npm install # ou pnpm install ou yarn install
```

Notez que ce template ne fait pas de vérification de type pendant les tests ; vous pouvez utiliser votre IDE ou un script personnalisé `tsc --noEmit` dans votre `package.json` pour déclencher de telles vérifications.

### Configurer uvu

Nous maintenons aussi un template de démarrage pour `uvu`.

Il inclut [solid-dom-testing](https://www.npmjs.com/package/solid-dom-testing) pour vous aider à écrire des assertions utiles avec Testing Library.

#### Uvu avec TypeScript (`ts-uvu`)

```bash
$ npx degit solidjs/templates/ts-uvu mon-projet-solid
$ cd mon-projet-solid
$ npm install # ou pnpm install ou yarn install
```

#### Rapport de couverture d'Uvu

> Malheureusement, en raison d'une [limitation de babel](https://github.com/babel/babel/issues/4289), nous ne pouvons pas obtenir de source maps pour le JSX transpilé, ce qui aura pour conséquence que les composants afficheront une couverture nulle. Cela fonctionnera pour le code non-JSX, cependant.

Si vous voulez vérifier la couverture de code de vos tests, l'outil préféré de uvu est c8. Pour l'installer et le configurer, exécutez:

```sh
> npm i --save-dev c8 # ou `yarn add -D c8` ou `pnpm add -D c8`
> npm set-script "test:coverage" "c8 uvu -r solid-register"
```

Maintenant si vous faites `npm run test:coverage`, vous verrez la couverture du test.

Si vous voulez des rapports en HTML, vous pouvez utiliser `c8 -r html` au lieu de `c8` pour activer le rapporteur html.

#### Mode Surveillance

`uvu` n'a pas de mode de surveillance par défaut, mais vous pouvez utiliser `chokidar-cli` pour faire la même chose:

```sh
> npm i --save-dev chokidar-cli # ou `yarn add -D chokidar-cli` or `pnpm add -D chokidar-cli`
> npm set-script "test:watch" "chokidar src/**/*.ts src/**/*.tsx -c \"uvu -r solid-register\"
# utiliser .js/.jsx à la place de .ts/.tsx
```

Maintenant si vous exécutez `npm run test:watch`, les tests seront exécutés à chaque fois que vous modifiez un fichier.

## Patterns de Tests et Meilleures Pratiques

Maintenant que vous avez installé vos outils de test, vous devez commencer à les utiliser. Pour vous faciliter la tâche, Solid supporte quelques patterns sympathiques.

### Tester l'État Réactif

Il se peut que vous souhaitiez garder des parties de votre état séparées des composants pour faciliter la maintenance ou pour pouvoir supporter des vues multiples. Dans ce cas, l'interface contre laquelle vous testez est l'état lui-même. Gardez à l'esprit qu'en dehors d'une [racine réactive](https://www.solidjs.com/docs/latest/api#createroot), votre état n'est pas suivi et les mises à jour ne déclenchent pas d'effets ni de mémos.

De plus, puisque les effets se déclenchent de manière asynchrone, il peut être utile d'envelopper nos assertions dans un effet final. Alternativement, pour observer une séquence d'effets sur plusieurs changements, il peut être utile de retourner les outils nécessaires de `createRoot` et de les exécuter dans une fonction de test asynchrone (puisque `createRoot` lui-même ne peut pas prendre une fonction `async`).

A titre d'exemple, testons `createLocalStorage` à partir de l'[exemple "todos"](https://www.solidjs.com/examples/todos):

```ts
import { createEffect } from "solid-js";
import { createStore, Store, SetStoreFunction } from "solid-js/store";

export function createLocalStore<T>(
  initState: T
): [Store<T>, SetStoreFunction<T>] {
  const [state, setState] = createStore(initState);
  if (localStorage.todos) setState(JSON.parse(localStorage.todos));
  createEffect(() => (localStorage.todos = JSON.stringify(state)));
  return [state, setState];
}
```

Au lieu de créer un composant TODO, nous pouvons tester ce modèle de manière isolée ; lorsque nous faisons cela, nous devons garder à l'esprit que 1. les changements réactifs ne fonctionnent que lorsqu'ils ont un contexte de suivi fourni par `render` ou `createRoot` et 2. sont asynchrones, mais nous pouvons utiliser `createEffect` pour les attraper. Utiliser `createRoot` a l'avantage que nous pouvons déclencher l'élimination manuellement:

#### Tester avec Jest

```ts
import { createLocalStore } from "./main.tsx";
import { createRoot, createEffect } from "solid-js";

describe("createLocalStore", () => {
  beforeEach(() => {
    localStorage.removeItem("todos");
  });

  const initialState = {
    todos: [],
    newTitle: "",
  };

  test("il lit l'état préexistant de localStorage", () =>
    createRoot((dispose) => {
      const savedState = { todos: [], newTitle: "saved" };
      localStorage.setItem("todos", JSON.stringify(savedState));
      const [state] = createLocalStore(initialState);
      expect(state).toEqual(savedState);
      dispose();
    }));

  test("il stocke le nouvel état dans le localStorage", () =>
    createRoot((dispose) => {
      const [state, setState] = createLocalStore(initialState);
      setState("newTitle", "updated");
      // pour catch un effet, utiliser un effet
      return new Promise<void>((resolve) =>
        createEffect(() => {
          expect(JSON.parse(localStorage.todos || "")).toEqual({
            todos: [],
            newTitle: "updated",
          });
          dispose();
          resolve();
        })
      );
    }));

  test("il met à jour l'état plusieurs fois", async () => {
    const { dispose, setState } = createRoot((dispose) => {
      const [state, setState] = createLocalStore(initialState);
      return { dispose, setState };
    });
    setState("newTitle", "first");
    // attendre un tick pour résoudre tous les effets
    await new Promise((done) => setTimeout(done, 0));
    expect(JSON.parse(localStorage.todos || "")).toEqual({
      todos: [],
      newTitle: "first",
    });
    setState("newTitle", "second");
    await new Promise((done) => setTimeout(done, 0));
    expect(JSON.parse(localStorage.todos || "")).toEqual({
      todos: [],
      newTitle: "first",
    });
    dispose();
  });
});
```

#### Tester with uvu

```ts
import { createLocalStore } from "./main";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { createEffect, createRoot } from "solid-js";

const todoTest = suite("createLocalStore");

todoTest.before.each(() => {
  localStorage.removeItem("todos");
});

const initialState = {
  todos: [],
  newTitle: "",
};

todoTest("il lit l'état préexistant de localStorage", () =>
  createRoot((dispose) => {
    const savedState = { todos: [], newTitle: "saved" };
    localStorage.setItem("todos", JSON.stringify(savedState));
    const [state] = createLocalStore(initialState);
    assert.equal(state, savedState);
    dispose();
  })
);

todoTest("il stocke le nouvel état dans le localStorage", () =>
  createRoot((dispose) => {
    const [_, setState] = createLocalStore(initialState);
    setState("newTitle", "updated");
    // pour catch un effet, utiliser un effet
    return new Promise<void>((resolve) =>
      createEffect(() => {
        assert.equal(JSON.parse(localStorage.todos || ""), {
          todos: [],
          newTitle: "updated",
        });
        dispose();
        resolve();
      })
    );
  })
);

todoTest.run();
```

### Tester les Directives

Les [Directives](https://www.solidjs.com/docs/latest/api#use%3A___) permettent d'utiliser les Refs d'une manière réutilisable. Il s'agit essentiellement de fonctions qui suivent le modèle `(ref: HTMLElement, data: Accessor<any>) => void`. Dans notre [tutoriel sur les directives](https://www.solidjs.com/tutorial/bindings_directives?solved), nous définissons la directive `clickOutside` qui doit appeler le callback contenu dans l'argument de l'accesseur.

Nous pourrions maintenant créer un composant et y utiliser la directive, mais nous testerions alors l'utilisation des directives au lieu de tester directement la directive. Il est plus simple de tester la surface de la directive en fournissant un noeud monté et l'accesseur:

#### Tester avec Jest

```ts
// click-outside.test.ts
import clickOutside from "click-outside";
import { createRoot } from "solid-js";
import { fireEvent } from "solid-testing-library";

describe("clickOutside", () => {
  const ref = document.createElement("div");

  beforeAll(() => {
    document.body.appendChild(ref);
  });

  afterAll(() => {
    document.body.removeChild(ref);
  });

  test("se déclenchera sur un clic à l'extérieur", () =>
    createRoot(
      (dispose) =>
        new Promise<void>((resolve) => {
          let clickedOutside = false;
          clickOutside(ref, () => () => {
            clickedOutside = true;
          });
          document.body.addEventListener("click", () => {
            expect(clickedOutside).toBeTruthy();
            dispose();
            resolve();
          });
          fireEvent.click(document.body);
        })
    ));

  test("ne se déclenchera pas sur un clic à l'intérieur", () =>
    createRoot(
      (dispose) =>
        new Promise<void>((resolve) => {
          let clickedOutside = false;
          clickOutside(ref, () => () => {
            clickedOutside = true;
          });
          ref.addEventListener("click", () => {
            expect(clickedOutside).toBeFalsy();
            dispose();
            resolve();
          });
          fireEvent.click(ref);
        })
    ));
});
```

#### Tester avec uvu

```ts
// click-outside.test.ts
import clickOutside from "click-outside.tsx";
import { createRoot } from "solid-js";
import { fireEvent } from "solid-testing-library";

const clickTest = suite("clickOutside");

const ref = document.createElement("div");

clickTest.before(() => {
  document.body.appendChild(ref);
});

clickTest.after(() => {
  document.body.removeChild(ref);
});

clickTest("se déclenchera sur un clic à l'extérieur", () =>
  createRoot(
    (dispose) =>
      new Promise<void>((resolve) => {
        let clickedOutside = false;
        clickOutside(ref, () => () => {
          clickedOutside = true;
        });
        document.body.addEventListener("click", () => {
          assert.ok(clickedOutside);
          dispose();
          resolve();
        });
        fireEvent.click(document.body);
      })
  )
);

clickTest("ne se déclenchera pas sur un clic à l'intérieur", () =>
  createRoot(
    (dispose) =>
      new Promise<void>((resolve) => {
        let clickedOutside = false;
        clickOutside(ref, () => () => {
          clickedOutside = true;
        });
        ref.addEventListener("click", () => {
          assert.is(clickedOutside, false);
          dispose();
          resolve();
        });
        fireEvent.click(ref);
      })
  )
);

clickTest.run();
```

### Tester les composants

Prenons un simple composant compteur de clics que nous voulons tester:

```jsx
// main.tsx
import { createSignal, Component } from "solid-js";

export const Counter: Component = () => {
  const [count, setCount] = createSignal(0);

  return (
    <div role="button" onClick={() => setCount((c) => c + 1)}>
      Count: {count()}
    </div>
  );
};
```

Ici, nous utilisons `solid-testing-library`. Ses helpers les plus importantes sont `render` pour rendre un composant dans le DOM d'une manière gérée, `fireEvent` pour dispatcher les événements d'une manière qui ressemble aux événements réels de l'utilisateur et `screen` pour fournir des sélecteurs globaux. Nous utilisons également des assertions utiles ajoutées à `expect` fourni par `@testing-library/jest-dom`.

#### Testing with Jest

```ts
// main.test.tsx
import { Counter } from "./main";
import { cleanup, fireEvent, render, screen } from "solid-testing-library";

describe("Counter", () => {
  afterEach(cleanup);

  test("il commence avec zéro", () => {
    render(() => <Counter />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Count: 0");
  });

  test("il augmente sa valeur au clic", async () => {
    render(() => <Counter />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    // La boucle d'événement prend une Promise à résoudre pour être terminée.
    await Promise.resolve();
    expect(button).toHaveTextContent("Count: 1");
    fireEvent.click(button);
    await Promise.resolve();
    expect(button).toHaveTextContent("Count: 2");
  });
});
```

#### Tester avec uvu

```ts
// main.test.tsx
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { Counter } from "main";
import { fireEvent, render, screen } from "solid-testing-library";
import { isInDocument, hasTextContent } from "solid-dom-testing";

const testCounter = suite("Counter");

testCounter.after.each(cleanup);

testCounter("il commence avec zéro", () => {
  const { getByRole } = render(() => <Counter />);
  const button = getByRole("button");
  assert.ok(isInDocument(button), "bouton pas dans le dom");
  assert.ok(hasTextContent(button, "Count: 0"), "mauvais contenu de texte");
});

testCounter("il augmente sa valeur au clic", async () => {
  render(() => <Counter />);
  const button = screen.getByRole("button");
  fireEvent.click(button);
  // La boucle d'événement prend une Promise à résoudre pour être terminée.
  await Promise.resolve();
  assert.ok(
    hasTextContent(button, "Count: 1"),
    "ne compte pas 1 après le premier clic"
  );
  fireEvent.click(button);
  await Promise.resolve();
  assert.ok(
    hasTextContent(button, "Count: 2"),
    "ne compte pas 2 après le premier clic"
  );
});

testCounter.run();
```
