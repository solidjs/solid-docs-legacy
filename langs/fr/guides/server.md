---
title: Serveur
description: Une explication des capacités côté serveur de Solid
sort: 3
---

# Rendu Côté Serveur

Solid gère le rendu côté serveur en compilant les templates JSX pour que l'ajout de code soit ultra efficace. Cela est fait grâce au plug-in Babel ou au preset en passant `generate: "ssr"`. Pour le côté client et serveur, vous devez passer `hydratable: true` pour générer du code d'hydratation compatible.

Le moteur d'exécution de `solid-js` et `solid-js/web` sont interchangé pour des équivalents non réactifs à l'exécution du code dans un environnement Node. Pour les autres environnements, vous allez avoir besoin d'empaqueter (nous utilisons le terme bundle dans la suite de la doc) le code serveur avec des exports spécifiques à `node`. La plupart des bundlers ont une manière de le faire. En général, nous recommandons aussi d'utiliser les conditions d'export `solid` en plus, car il est recommandé que les libraires fournissent leurs sources sous l'export `solid`.

Construire pour le Rendu Côté Serveur va demander un peu plus de configuration, car il faudra générer 2 bundles séparés. Le point d'entré côté client devra utiliser `hydrate`:

```jsx
import { hydrate } from "solid-js/web";

hydrate(() => <App />, document);
```

_Note: Il est possible d'effectuer le rendu et l'hydratation depuis la racine du Document. Cela nous permet de décrire une vue entière en JSX._

Le point d'entrée serveur peut utiliser une des quatre options de rendu offertes par Solid. Chacun va produire un résultat et une balise script qui sera insérée dans l'entête du document.

```jsx
import {
  renderToString,
  renderToStringAsync,
  renderToNodeStream,
  renderToWebStream,
} from "solid-js/web";

// Chaîne de caractère pour le rendu synchrone
const html = renderToString(() => <App />);

// Chaîne de caractère pour le rendu asynchrone
const html = await renderToStringAsync(() => <App />);

// API Node Stream
pipeToNodeWritable(App, res);

// API Web Stream (pour Cloudflare Workers par example)
const { readable, writable } = new TransformStream();
pipeToWritable(() => <App />, writable);
```

Pour vous faciliter la vie, `solid-js/web` exportent une condition `isServer`. C'est utile pour la plupart des bundlers qui seront capable de (_tree shake_)[https://developer.mozilla.org/fr/docs/Glossary/Tree_shaking] (procédé permettant de supprimer les exports non exploités) avec cette condition ou d'importer seulement ce qui est utilisé par le code sous cette condition dans votre bundle client.

```jsx
import { isServer } from "solid-js/web";

if (isServer) {
  // N'exécuter ce code que côté serveur
} else {
  // N'exécuter ce code que dans le navigateur
}
```

## Script d'Hydratation

Dans le but de progressivement hydrater avant même que le code d'exécution de Solid ne se charge, un script spécial a besoin d'être inséré sur la page. Il peut soit être généré soit insérer via `generateHydrationScript` ou alors inclut comme une partie du JSX en utilisant la balise `<HydratationScriptp />`.

```js
import { generateHydrationScript } from "solid-js/web";

const app = renderToString(() => <App />);

const html = `
  <html lang="en">
    <head>
      <title>🔥 Solid SSR 🔥</title>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="stylesheet" href="/styles.css" />
      ${generateHydrationScript()}
    </head>
    <body>${app}</body>
  </html>
`;
```

```jsx
import { HydrationScript } from "solid-js/web";

const App = () => {
  return (
    <html lang="en">
      <head>
        <title>🔥 Solid SSR 🔥</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/styles.css" />
        <HydrationScript />
      </head>
      <body>{/*... rest of App*/}</body>
    </html>
  );
};
```

Lorsque l'on hydrate depuis le document qui inclut des ressources qui ne sont pas disponibles pendant l'exécution du client, cela peut poser problème. Solid fourni un composant `<NoHydratation />` dont les enfants vont fonctionner normalement côté serveur, mais ne seront pas hydratés dans le navigateur.

```jsx
<NoHydration>
  {manifest.map((m) => (
    <link rel="modulepreload" href={m.href} />
  ))}
</NoHydration>
```

## Async et Streaming côté serveur

Ces mécanismes sont construits sur les connaissances que Solid possède de votre application. Cela fonctionne en utilisant les "Suspenses" et l'API "Resource" sur le serveur, au lieu de récupérer des données en avance puis d'effectuer le rendu. Solid va récupérer les données pendant qu'il effectue le rendu sur le serveur de la même manière que du côté client. Votre code ainsi que le schéma d'exécution sont écrits exactement de la même manière.

Le rendu asynchrone attend jusqu'à ce que toutes les limites des "Suspenses" soit résolu et ensuite envoi les résultats (ou les écrits dans un fichier dans le cas de la Génération de Site Statique)

Le Streaming commence à envoyer le contenu synchrone au navigateur qui va immédiatement afficher le contenu de repli (ex un indicateur de chargement) côté serveur. Puis au fur et à mesure que les données asynchrones finissent de se charger, le serveur envoi les données dans le même flux au client pour résoudre le Suspense où le navigateur finit le travail et va remplacer le contenu de repli avec le vrai contenu.

Les avantages de cette approche :

- Le serveur n'a pas besoin d'attendre les données asynchrones pour répondre. Les ressources peuvent être chargées plus tôt dans le navigateur et l'utilisateur commence à voir le contenu plus tôt.
- Comparer à la récupération des données côté client comme dans la JAMStack, le chargement des données commence sur le serveur immédiatement et n'a pas besoin d'attendre que le client charge le JavaScript.
- Toutes les données sont sérialisées et transportées du serveur vers le client automatiquement.

## Limitations du rendu côté serveur

La solution de rendu côté serveur isomorphe de Solid est très puissante, car vous pouvez écrire votre code en général en tant qu'un seul et même code source qui va s'exécuter de la même manière dans les deux environnements. Cependant, il y a des attentes demandées pour l'hydratation. Principalement que la vue affichée dans le client soit la même que celle rendue sur le serveur. Il n'y a pas besoin que ce soit exactement le même texte, mais la structure de votre balisage HTML doit être le même.

Nous utilisons des marqueurs rendus par le serveur pour comparer les éléments et la localisation des ressources sur le serveur. Pour cette raison, le Client et le Serveur ont les mêmes composants. Cela n'est pas forcément un problème vu que Solid interprète de la même façon sur le client et le serveur. Mais actuellement, il n'y a aucun moyen d'interpréter quelque chose côté serveur qui ne soit pas ensuite envoyé et afficher par le client. Actuellement, il n'y aucun moyen d'hydrater partiellement une page entière, et de ne pas générer de marqueurs d'hydratation associés. C'est une approche tout ou rien. L'Hydratation Partielle est un point que nous voulons explorer dans le futur.

Enfin, toutes les ressources ont besoin d'être définies sous l'arbre de `render`. Ils sont automatiquement sérialisés et récupérés par le navigateur, mais cela fonctionnera grâce à la méthode `render` ou `pipeTo` qui grade trace des progrès du rendu. Une chose que nous ne pouvons pas faire s’ils sont créés en isolation du contexte. De manière similaire, il n'y a pas de réactivité sur le serveur, donc ne faites pas de changement de vos signaux au rendu initial et attendez-vous à ce qu'il se reflète un peu plus haut dans l'arbre. Bien que nous ayons des limitations de Suspense, le rendu côté serveur de Solid est basiquement du haut vers le bas.

## Commencer avec le Rendu Côté Serveur

La configuration du rendu côté serveur n'est pas tout à fait terminée. Nous avons quelques exemples dans le package [solid-ssr](https://github.com/solidjs/solid/blob/main/packages/solid-ssr).

Toutefois, un nouveau kit de démarrage est en progression [SolidStart](https://github.com/solidjs/solid-start) qui vise à rendre cette expérience beaucoup plus harmonieuse.

## Commencer avec la Génération de Site Statique

[solid-ssr](https://github.com/solidjs/solid/blob/main/packages/solid-ssr) fournis aussi un simple utilitaire pour générer des sites statiques ou prérendus. Lisez le README pour plus d'information.
