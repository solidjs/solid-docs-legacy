---
title: Pour commencer
description: Un guide sur comment débuter sur Solid.
sort: 0
---

# Pour commencer

## Essayer Solid

La manière la plus simple de commencer avec Solid est d'essayer en ligne. Notre REPL sur https://playground.solidjs.com est la meilleure façon d'expérimenter, ainsi que sur https://codesandbox.io/ où vous pouvez modifier [nos différents exemples](https://github.com/solidjs/solid/blob/main/documentation/resources/examples.md).
Sinon, vous pouvez utiliser simplement notre template [vite](https://vitejs.dev/) en lançant ces commandes dans votre terminal :

```sh
> npx degit solidjs/templates/js mon-app
> cd mon-app
> npm i # ou yarn ou pnpm
> npm run dev # ou yarn ou pnpm
```

Ou avec TypeScript:

```sh
> npx degit solidjs/templates/ts mon-app
> cd mon-app
> npm i # ou yarn ou pnpm
> npm run dev # ou yarn ou pnpm
```

## Comprendre Solid

Solid est fondamentalement construit autour de petites pièces composables qui servent à créer les fondations de nos applications. Ces pièces sont principalement des fonctions qui sont utilisées pour beaucoup d'APIs de niveau superficiel. Heureusement, vous n'avez pas besoin de connaître la majorité pour commencer.

Les deux principaux piliers de ces fondations sont les Composants et les Primitives Réactives.

Les Composants sont des fonctions qui acceptent des props en tant qu'objet et retournent des éléments JSX incluant des éléments natifs du DOM et d'autres composants. Ils peuvent s'écrire en tant qu'élément JSX en utilisant le PascalCase:

```jsx
function MyComponent(props) {
  return <div>Hello {props.name}</div>;
}

<MyComponent name="Solid" />;
```

Les Composants sont légers dans le sens où ils ne possèdent pas eux-mêmes d'état (not stateful) et n'ont pas d'instances. À la place, ils servent de fonctions de construction (factory) pour les éléments du DOM et des primitives réactives.

La réactivité de précision (fined-grained reactivity) est construite sur 3 primitives simples : Signaux, Mémos et Effets. Ensemble, ils forment un système de synchronisation automatiquement suivi qui s'assure que votre vue reste à jour. Le calcul de la réactivité prend forme de simple expression enrober dans des fonctions qui s'exécutent de manière synchrone.

```js
const [first, setFirst] = createSignal("JSON");
const [last, setLast] = createSignal("Bourne");

createEffect(() => console.log(`${first()} ${last()}`));
```

Vous pouvez en apprendre plus sur [le système de réactivité de Solid](https://www.solidjs.com/docs/latest#reactivity) et [le système de rendu de Solid](https://www.solidjs.com/docs/latest#rendering).

## Penser Solid

Le design de Solid a été créé avec certaines opinions sur les principes et les valeurs qui nous aident à construire de meilleurs sites internet et applications. Il est plus simple d'apprendre et d'utiliser Solid quand vous connaissez la philosophie derrière son design.

### 1. Données déclaratives

Les "données déclaratives" est le concept de lier la description des données au comportement de leurs déclarations. Cela permet de facilement grouper le comportement des données dans un seul endroit.

### 2. Disparition de composants

Il est déjà difficile de structurer vos composants sans prendre en compte les mises à jour de ceux-ci. Le système de mise à jour de Solid est complètement indépendant des composants. Les Composants sont des fonctions qui sont appelées une fois et ensuite cessent d'exister. Les Composants n'existent que dans l'unique but d'organiser votre code, ni plus, ni moins.

### 3. Séparation Lecture/Écriture

Le contrôle précis et la prévisibilité créent de meilleurs systèmes. Nous n'avons pas besoin d'immutabilité stricte pour forcer un flux unidirectionnel, juste de la possibilité de prendre une décision consciente de savoir quelle pièce peut écrire et laquelle ne peut pas.

### 4. Privilégier la simplicité à la facilité

Une leçon que nous apprenons à la dure avec un système de réactivité détaillé. Les conventions explicites et constantes même si elles demandent plus d'efforts en valent la peine. Le but est de fournir un minimum d'outils pour servir à la base sur la quel construire.

---

## Web Components

Solid est né d'un désire de mettre les Web Components en tant qu'acteur principal. Au fur et à mesure du temps, le design de Solid a évolué et ses objectifs ont changé. Cependant, Solid reste une bonne alternative pour les auteurs de Web Components. [Solid Element](https://github.com/solidjs/solid/tree/main/packages/solid-element) permets d'écrire et d'enrober des fonctions Composants en Solid pour produire des Web Components petits et performants. Au sain d'une application en Solid, Solid Element est capable d'utiliser l'API de Contexte et les Portails sont supportés dans le Shadow DOM avec l'isolation de style.

## Rendu côté serveur

Solid propose une solution dynamique de rendu côté serveur qui permet une vraie expérience isomorphe. Avec l'utilisation de la primitive "Resource", les requêtes asynchrones sont facilement faites et, plus importantes, automatiquement sérialisées et synchronisées entre le client et le navigateur.

Comme Solid supporte le fonctionnement asynchrone et le stream rendering côté serveur, vous pouvez écrire votre code d'une seule manière et l'exécuter côté serveur. Ce qui veut dire que des fonctionnalités comme [render-as-you-fetch](https://reactjs.org/docs/concurrent-mode-suspense.html#approach-3-render-as-you-fetch-using-suspense) et le fractionnement de code vont fonctionner sans effort avec Solid.

Pour plus d'information, n'hésitez pas à lire le [guide serveur](https://www.solidjs.com/docs/latest#server-side-rendering).

## Pas de Compilation ?

Vous n'aimez pas JSX ? Cela ne vous gêne pas de faire du travail manuel pour enrober vos expressions, d'avoir de moins bonne performance et des paquets plus gros ? Il est possible de créer des applications Solid en utilisant des Tagged Template Literals ou HyperScript dans un environnement non compilé.

Vous pouvez les exécuter directement depuis le navigateur en utilisant [Skypack](https://www.skypack.dev/):

```html
<html>
  <body>
    <script type="module">
      import {
        createSignal,
        onCleanup,
      } from "https://cdn.skypack.dev/solid-js";
      import { render } from "https://cdn.skypack.dev/solid-js/web";
      import html from "https://cdn.skypack.dev/solid-js/html";

      const App = () => {
        const [count, setCount] = createSignal(0),
          timer = setInterval(() => setCount(count() + 1), 1000);
        onCleanup(() => clearInterval(timer));
        return html`<div>${count}</div>`;
      };
      render(App, document.body);
    </script>
  </body>
</html>
```

N'oubliez pas, vous aurez quand même besoin de la librairie utilisée pour l'expression du DOM pour que cela fonctionne avec TypeScript. Vous pouvez utiliser les Tagged Template Literals avec [Lit DOM Expressions](https://github.com/ryansolid/dom-expressions/tree/main/packages/lit-dom-expressions) ou HyperScript avec [Hyper DOM Expressions](https://github.com/ryansolid/dom-expressions/tree/main/packages/hyper-dom-expressions).
