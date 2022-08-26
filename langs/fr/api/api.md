# Réactivité basique

L'approche globale de Solid en matière de réactivité consiste à envelopper tout calcul réactif dans une fonction et à réexécuter cette fonction lorsque ses dépendances sont mises à jour.
Le compilateur JSX de Solid englobe également la plupart des expressions JSX (code entre accolades) avec une fonction, de sorte qu'elles se mettent automatiquement à jour (et déclenchent les mises à jour correspondantes dans le DOM) lorsque leurs dépendances changent.
Plus précisément, la réexécution automatique d'une fonction se produit chaque fois que la fonction est appelée dans une _portée surveillée_ (ou _tracking scope_ en anglais), comme une expression JSX ou des appels API qui construisent des "calculs" (`createEffect`, `createMemo`, etc.).
Par défaut, les dépendances d'une fonction sont suivies automatiquement lorsqu'elles sont appelées dans une portée surveillée, en détectant quand la fonction lit l'état réactif (par exemple, via le getter d'un Signal ou l'attribut d'un Store).
Par conséquent, vous n'avez généralement pas besoin de vous soucier des dépendances vous-mêmes.
(Mais si le suivi automatique des dépendances ne donne pas les résultats que vous souhaitez, vous pouvez [remplacer le suivi des dépendances](#reactive-utilities)).
Cette approche rend la réactivité _composable_ : appeler une fonction dans une autre fonction fait généralement en sorte que la fonction appelante hérite des dépendances de la fonction appelée.

## `createSignal`

```ts
import { createSignal } from "solid-js";

function createSignal<T>(
  initialValue: T,
  options?: { equals?: false | ((prev: T, next: T) => boolean) }
): [get: () => T, set: (v: T) => T];

// Types disponibles pour la valeur de retour de `createSignal`.
import type { Signal, Accessor, Setter } from "solid-js";
type Signal<T> = [get: Accessor<T>, set: Setter<T>];
type Accessor<T> = () => T;
type Setter<T> = (v: T | ((prev?: T) => T)) => T;
```

C'est la primitive réactive la plus basique utilisée pour surveiller une seule valeur (qui peut être n'importe quel objet JavaScript) qui change dans le temps.
La valeur du Signal commence par être égale au premier argument passé `initialValue` (ou `undefined` s'il n'y a pas d'argument).
La fonction `createSignal` retourne une paire de fonctions sous la forme d'un tableau à deux éléments : un _getter_ (ou _accessor_) et un _setter_. 
Dans une utilisation typique, vous auriez à déstructurer ce tableau en un Signal nommé de la manière suivante:

```js
const [count, setCount] = createSignal(0);
const [ready, setReady] = createSignal(false);
```

L'appel du getter (par exemple, `count()` ou `ready()`) renvoie la valeur actuelle du Signal.
Crucial pour le suivi automatique des dépendances, l'appel du getter
à l'intérieur d'une portée surveillée fait que la fonction appelante dépend de ce Signal, donc cette fonction sera réexécutée si le Signal est mis à jour.

L'appel du setter (par exemple, `setCount(nextCount)` ou `setReady(nextReady)`) définit la valeur du Signal et _met à jour_ le Signal (déclenchant la réexécution des dépendants) si la valeur a effectivement changé (voir les détails ci-dessous).
Comme seul argument, le setter prend soit la nouvelle valeur du signal, soit une fonction qui fait correspondre la dernière valeur du signal à une nouvelle valeur.
Le setter renvoie également la valeur du Signal mise à jour. Par exemple:

```js
// Lit la valeur actuelle du Signal, et
// depend de s'il est dans une portée surveillée
// (mais non réactif en dehors d'une portée surveillée):
const currentCount = count();

// Ou envelopper tout calcul avec une fonction,
// et cette fonction peut être utilisée dans une portée surveillée:
const doubledCount = () => 2 * count();

// Ou construire une portée surveillée et dépendre du signal:
const countDisplay = <div>{count()}</div>;

// Mettre à jour la valeur d'un Signal en donnant une nouvelle valeur:
setReady(true);

// Mettre à jour la valeur d'un Signal en donnant une fonction incluant la valeur précédente:
const newCount = setCount((prev) => prev + 1);
```

> Si vous souhaitez stocker une fonction dans un Signal, vous devez utiliser la forme suivante:
>
> ```js
> setValue(() => myFunction);
> ```
>
> Cependant, les fonctions ne sont pas traitées spécialement comme l'argument `initialValue` de `createSignal`,
> donc vous devez passer la valeur initiale d'une fonction telle quelle:
>
> ```js
> const [func, setFunc] = createSignal(myFunction);
> ```

À moins que vous ne soyez dans un [batch](#batch), un [effet](#createEffect) ou une [transition](#use-transition), les signaux sont mis à jour immédiatement lorsque vous les définissez.
Par exemple:

```js
setReady(false);
console.assert(ready() === false);
setReady(true);
console.assert(ready() === true);
```

Si vous n'êtes pas sûr que votre code sera exécuté dans un `batch` ou une `transition` (par exemple, un code de bibliothèque), vous devez éviter de faire cette supposition.

##### Options

Plusieurs primitives de Solid prennent un objet "options" comme dernier argument facultatif.
L'objet "options" de `createSignal` vous permet de fournir une option `equals`. Par exemple:

```js
const [getValue, setValue] = createSignal(initialValue, { equals: false });
```

Par défaut, lors de l'appel du setter d'un Signal, le Signal n'est mis à jour (et n'oblige les les dépendants à réexécuter) que si la nouvelle valeur est réellement différente de l'ancienne, conformément à l'opérateur `===` de JavaScript.

Vous pouvez également définir `equals` sur `false` pour que les dépendances soient toujours réexécutées après l'appel du setter, ou vous pouvez passer votre propre fonction pour tester l'égalité.
Quelques exemples:

```js
// Utilisation de `{ equals: false }` pour permettre de modifier l'objet en place;
// normalement, cela ne serait pas vu comme une mise à jour car
// l'objet a la même identité avant et après le changement.
const [object, setObject] = createSignal({ count: 0 }, { equals: false });
setObject((current) => {
  current.count += 1;
  current.updated = new Date();
  return current;
});

// Utilisation d'un Signal `{ equals: false }` en tant que déclencheur sans valeur initiale:
const [depend, rerun] = createSignal(undefined, { equals: false });
// Maintenant, un appel à `depend()` dans une portée surveillée
// fait que cette portée est réexécutée à chaque fois que `rerun()` est appelé.

// Définir l'égalité en fonction de la longueur de la chaîne:
const [myString, setMyString] = createSignal("string", {
  equals: (newVal, oldVal) => newVal.length === oldVal.length,
});

setMyString("strung"); // Considéré comme égal à la dernière valeur et ne provoquera pas de mises à jour
setMyString("stranger"); // Considéré comme différent et provoquera des mises à jour
```

## `createEffect`

```ts
import { createEffect } from "solid-js";

function createEffect<T>(fn: (v: T) => T, value?: T): void;
```

Les effets sont un moyen général de faire en sorte que du code arbitraire ("effets secondaires") s'exécute à chaque fois que les dépendances changent, par exemple, pour modifier le DOM manuellement.
`createEffect` crée un nouveau calcul qui exécute la fonction donnée dans une portée surveillée, ce qui permet de suivre automatiquement ses dépendances, et réexécute automatiquement la fonction chaque fois que les dépendances sont mises à jour.
Par exemple:

```js
const [a, setA] = createSignal(initialValue);

// L'effet va dépendre du signal `a`
createEffect(() => doSideEffect(a()));
```

La fonction effet est appelée avec la valeur retournée par la dernière exécution de la fonction passée en argument. Cette valeur peut être initialisée en tant que 2ème argument optionnel. Cela peut être utile lors de comparaison sans créer une fonction supplémentaire.

```js
createEffect((prev) => {
  const sum = a() + b();
  if (sum !== prev) console.log("Valeur de 'sum' changé en", sum);
  return sum;
}, 0);
```

Les effets sont principalement destinés aux effets secondaires qui lisent mais n'écrivent pas au système réactif:
il est préférable d'éviter de modifier des signaux dans les effets, ce qui sans précaution peut provoquer des rendus supplémentaires ou même des boucles d'effets infinies.
A la place, préférez l'utilisation de [`createMemo`](#creatememo) pour calculer de nouvelles valeurs qui dépendent d'autres valeurs réactives, de sorte que le système réactif sache ce qui dépend de quoi, et puisse l'optimiser en conséquence.
Si vous modifiez des signaux dans un effet, la fonction d'effet est automatiquement enveloppée dans [`batch`](#batch), ce qui signifie que tous les changements de signaux à l'intérieur de l'effet ne se propagent qu'après que l'effet se termine.
Cela permet à plusieurs mises à jour de signaux de ne déclencher une seule mise à jour et évite que des effets secondaires non désirés ne se produisent au milieu de vos effets secondaires.
En fait, si plusieurs effets se déclenchent tous en même temps, ils sont collectivement regroupés en un seul `batch`.

La _première_ exécution de la fonction d'effet n'est pas immédiate ; elle est programmée pour être exécutée après la phase de rendu en cours (par exemple, après avoir appelé la fonction passée à [`render`](#render), [`createRoot`](#createroot), ou [`runWithOwner`](#runwithowner)).
Si vous voulez attendre que la première exécution ait lieu, utilisez [`queueMicrotask`](https://developer.mozilla.org/fr/docs/Web/API/queueMicrotask) (qui s'exécute avant que le navigateur ne rende le DOM) ou `await Promise.resolve()` ou `setTimeout(..., 0)` (qui s'exécutent après le rendu du navigateur).
Après cette première exécution, les effets s'exécutent généralement immédiatement lorsque leurs dépendances sont mises à jour (sauf si vous êtes dans un [batch](#batch) ou une [transition](#use-transition)). Par exemple:

```js
// Supposez que ce code est dans une fonction de composant, donc fait partie d'une phase de rendu
const [count, setCount] = createSignal(0);

// Cet effet imprime le compte au début et quand il change
createEffect(() => console.log("count =", count()));
// L'effet ne se produit pas encore
console.log("coucou");
setCount(1); // L'effet ne se produit toujours pas encore
setCount(2); // L'effet ne se produit toujours pas encore

queueMicrotask(() => {
  // now `count = 2` will print
  console.log("microtask");
  setCount(3); // immediately prints `count = 3`
  console.log("au revoir");
});

// --- overall output: ---
// coucou
// count = 2
// microtask
// count = 3
// au revoir
```

Le délai dans la première exécution est utile car il signifie qu'un effet défini dans la portée d'un composant s'exécute après que le JSX retourné par le composant ait été ajouté au DOM.
En particulier, les [`ref`](#ref)s seront déjà définis.
Ainsi, vous pouvez utiliser un effet pour manipuler le DOM manuellement,
appeler des bibliothèques JS vanilla, ou d'autres effets secondaires.

Notez que la première exécution de l'effet s'exécute toujours avant que le navigateur ne rende le DOM à l'écran (similaire à `useLayoutEffect` de React).
Si vous avez besoin d'attendre jusqu'après le rendu (par exemple, pour mesurer le rendu), vous pouvez utiliser `await Promise.resolve()` (ou `Promise.resolve().then(...)`), mais notez que l'utilisation ultérieure de l'état réactif (comme les signaux) ne déclenchera pas la réexécution de l'effet, car le suivi n'est pas possible après qu'une fonction `async` utilise `await`.
Ainsi, vous devriez utiliser toutes les dépendances avant la promesse.

Si vous préférez qu'un effet soit exécuté immédiatement, même pour sa première exécution, utilisez [`createRenderEffect`](#createrendereffect) ou [`createComputed`](#createcomputed).

Vous pouvez nettoyer vos effets secondaires entre les exécutions de la fonction d'effet en appelant [`onCleanup`](#oncleanup) _à l'intérieur_ de la fonction d'effet.
Une telle fonction de nettoyage est appelée à la fois entre les exécutions de l'effet et lorsque l'effet est éliminé (par exemple, lorsque le composant contenant l'effet est démonté).
Par exemple:

```js
// Écouter un événement donné dynamiquement par le signal `eventName`
createEffect(() => {
  const event = eventName();
  const callback = (e) => console.log(e);
  ref.addEventListener(event, callback);
  onCleanup(() => ref.removeEventListener(event, callback));
});
```

## `createMemo`

```ts
import { createMemo } from "solid-js";

function createMemo<T>(
  fn: (v: T) => T,
  value?: T,
  options?: { equals?: false | ((prev: T, next: T) => boolean) }
): () => T;
```
Les mémos vous permettent d'utiliser efficacement une valeur dérivée dans de nombreux calculs réactifs.
`createMemo` crée une valeur réactive en lecture seule égale à la valeur de retour de la fonction donnée et s'assure que cette fonction n'est exécutée que lorsque ses dépendances changent.

```js
const value = createMemo(() => computeExpensiveValue(a(), b()));

// Lecture de la valeur.
value();
```

Dans Solid, vous n'avez souvent pas besoin d'envelopper les fonctions dans des mémos ;
vous pouvez aussi simplement définir et appeler une fonction ordinaire
pour obtenir un comportement réactif similaire.
La principale différence réside dans le fait que vous appelez la fonction dans plusieurs configurations réactives.
Dans ce cas, lorsque les dépendances de la fonction sont mises à jour, la fonction sera appelée plusieurs fois, sauf si elle est enveloppée dans un mémo.
fonction sera appelée plusieurs fois, sauf si elle est enveloppée dans `createMemo`. Par exemple:

```js
const user = createMemo(() => searchForUser(username()));
// Comparaison avec: const user = () => searchForUser(username());
return (
  <ul>
    <li>Votre name est "{user()?.name}"</li>
    <li>
      Votre email est <code>{user()?.email}</code>
    </li>
  </ul>
);
```

Lorsque le Signal `username` est mis à jour, `searchForUser` sera appelé qu'une seule fois.
Si l'utilisateur (`user`) retourné a effectivement changé, le mémo `user` se met à jour, et alors les deux éléments de la liste seront mis à jour automatiquement.

Si nous avions plutôt défini `user` comme une simple fonction
`() => searchForUser(username())`, alors `searchForUser` aurait été
appelé deux fois, une fois lors de la mise à jour de chaque élément de la liste.

Une autre différence clé est qu'un memo peut empêcher les dépendances de se mettre à jour lorsque les dépendances du mémo changent mais pas la valeur du mémo résultant.
Tout comme [`createSignal`](#createsignal), le sSgnal dérivé créé par `createMemo` se _met à jour_ (et déclenche la ré-exécution des dépendants) uniquement lorsque la valeur renvoyée par la fonction mémo change réellement par rapport à la valeur précédente, selon l'opérateur `===` de JavaScript.
Alternativement, vous pouvez passer un objet options avec `equals` réglé sur `false` pour toujours mettre à jour le mémo lorsque ses dépendances changent,
ou vous pouvez passer votre propre fonction `equals` pour tester l'égalité.

La fonction mémo est appelée avec une valeur retournée depuis la dernière exécution de la fonction mémo. Cette valeur peut être initialisée optionnellement en tant que 2ème argument. Cela est utile pour réduire le nombre de calculs, par exemple:

```js
// Suivre la somme de toutes les valeurs prises par input()
const sum = createMemo((prev) => input() + prev, 0);
```

La fonction mémo ne doit pas modifier d'autres signaux en appelant des setters (elle doit être "pure").
Cela permet à Solid d'optimiser l'ordre d'exécution des mises à jour des mémos en fonction de leur graphe de dépendance, de sorte que tous les mémos peuvent se mettre à jour au maximum une fois en réponse à un changement de dépendance.

## `createResource`

```ts
import { createResource } from "solid-js";
import type { ResourceReturn } from "solid-js";

type ResourceReturn<T> = [
  {
    (): T | undefined;
    loading: boolean;
    error: any;
    latest: T | undefined;
  },
  {
    mutate: (v: T | undefined) => T | undefined;
    refetch: (info: unknown) => Promise<T> | T;
  }
];

function createResource<T, U = true>(
  fetcher: (
    k: U,
    info: { value: T | undefined; refetching: boolean | unknown }
  ) => T | Promise<T>,
  options?: { initialValue?: T }
): ResourceReturn<T>;

function createResource<T, U>(
  source: U | false | null | (() => U | false | null),
  fetcher: (
    k: U,
    info: { value: T | undefined; refetching: boolean | unknown }
  ) => T | Promise<T>,
  options?: { initialValue?: T }
): ResourceReturn<T>;
```

Crée un signal qui reflète le résultat d'une requête asynchrone.
`createResource` prend une fonction de récupération asynchrone (`fetcher`) et retourne un Signal qui est mis à jour avec les données résultantes lorsque la récupération (`fetcher`) est terminée.
Il y a deux façons d'utiliser `createResource` : vous pouvez passer la fonction de récupération (`fetcher`) comme seul argument, ou vous pouvez en plus passer un Signal `source` comme premier argument.
Le Signal `source` redéclenchera le `fetcher` à chaque fois qu'il changera, et sa valeur sera passée au `fetcher`.

```js
const [data, { mutate, refetch }] = createResource(fetchData);
```

```js
const [data, { mutate, refetch }] = createResource(sourceSignal, fetchData);
```

Dans ces extraits, la fonction de récupération (`fetcher`) est `fetchData`, et `data()` est indéfini jusqu'à ce que `fetchData` termine.
Dans le premier cas, `fetchData` sera appelée immédiatement.
Dans le second, `fetchData` sera appelé dès que `sourceSignal` aura une valeur autre que `false`, `null`, ou `undefined`.
Elle sera appelée à nouveau chaque fois que la valeur de `sourceSignal` change, et cette valeur sera toujours passée à `fetchData` comme premier argument.

Vous pouvez appeler `mutate` pour mettre à jour directement le signal `data` (il fonctionne comme tout autre signal setter). Vous pouvez aussi appeler `refetch` pour relancer directement la fonction de récupération (`fetcher`), et passer un argument optionnel pour fournir des informations supplémentaires au fetcher, par exemple `refetch(info)`.

`data` fonctionne comme le getter d'un Signal normal : utilisez `data()` pour lire la dernière valeur retournée par `fetchData`.
Mais il a aussi des propriétés réactives supplémentaires : `data.loading` vous indique si le fetcher a été appelé mais n'a pas été retourné, et `data.error` vous indique si la requête a échoué ; si c'est le cas, il contient l'erreur lancée par le fetcher. (Note : si vous anticipez des erreurs, vous pouvez vouloir envelopper `createResource` dans un [ErrorBoundary](#<errorboundary>).)

À partir de la **1.4.0**, `data.latest` retournera la dernière valeur retournée et ne déclenchera pas de [Suspense](#<suspense>) et de [transitions](#usetransition) ; si aucune valeur n'a encore été retournée, `data.latest` agit de la même manière que `data()`.
Cela peut être utile si vous voulez afficher les données périmées pendant le chargement des nouvelles données.

`loading`, `error`, et `latest` sont des getters réactifs et peuvent être suivis.

Le `fetcher` est la fonction asynchrone que vous fournissez à `createResource` pour récupérer réellement les données.
Elle reçoit deux arguments : la valeur du Signal source (si elle est fournie), et un objet info avec deux propriétés : `value` et `refetching`.
`value` vous indique la valeur précédemment récupérée.
`refetching` est `true` si le fetcher a été déclenché en utilisant la fonction `refetch`, sinon `false`.
Si la fonction `refetch` a été appelée avec un argument (`refetch(info)`), on assigne `refetching` à cet argument.

```js
async function fetchData(source, { value, refetching }) {
  // Récupère les données et retourne une valeur.
  // `source` indique la valeur actuelle du Signal source;
  // `value` indique la dernière valeur qu'à retourné cette fonction;
  // `refetching` est sur `true` quand cette fonction a été appelée en utilisant `refetch()`,
  // OU elle est égale au paramètre optionnel : `refetch(info)`
}

const [data, { mutate, refetch }] = createResource(getQuery, fetchData);

// Lire la valeur.
data();

// Vérifier si la valeur est en chargement.
data.loading;

// Vérifier si des erreurs sont apparues lors de la récupération.
data.error;

// Met à jour la valeur sans créer de promesse.
mutate(optimisticValue);

// Réexécute la requête pour certain cas.
refetch();
```

`loading` et `error` sont des propriétés réactives qui peuvent être surveillées.

**Nouveau depuis la 1.4.0**

Si vous utilisez `renderToStream`, vous pouvez dire à Solid d'attendre une ressource avant de vider le flux en utilisant l'option `deferStream`:

```js
// Récupère un utilisateur et diffuse le contenu dès que possible
const [user] = createResource(() => params.id, fetchUser);

// Récupère un utilisateur mais ne diffuse le contenu qu'après le chargement de cette ressource
const [user] = createResource(() => params.id, fetchUser, {
  deferStream: true,
});
```

# Cycles de vie

## `onMount`

```ts
import { onMount } from "solid-js";

function onMount(fn: () => void): void;
```

Programme une méthode qui va s'exécuter après le rendu initial et que les éléments soient monté. C'est idéal pour utiliser des `ref`s et gérer d'autres effets secondaires qui ne doivent s'exécuter qu'une seule fois. C'est l'équivalent de `createEffect` sans dépendances.

## `onCleanup`

```ts
import { onCleanup } from "solid-js";

function onCleanup(fn: () => void): void;
```

Programme une méthode de nettoyage qui s'exécute à la destruction ou recalcule de la portée réactive actuelle. Peut être utilisé dans n'importe quel Composant ou Effet.

## `onError`

```ts
import { onError } from "solid-js";

function onError(fn: (err: any) => void): void;
```

Programme une méthode de gestion d'erreur qui va s'exécuter lorsque la portée enfant lève une erreur. Seulement la portée la plus proche de l'erreur va exécuter sa fonction de gestion d'erreur. Si une erreur se reproduit, la fonction se réexécute.

# Utilitaires réactifs

Ce sont des fonctions d'aide qui permettent de mieux gérer la planification des mises à jour et de contrôler comment la réactivité est gérée.

## `untrack`

```ts
import { untrack } from "solid-js";

function untrack<T>(fn: () => T): T;
```

Ignore le suivi des dépendances dans le bloc de code exécuté et retourne la valeur.

## `batch`

```ts
import { batch } from "solid-js";

function batch<T>(fn: () => T): T;
```

Groupe les mises à jour dans le bloc jusqu'à la fin pour éviter des calculs inutiles. Cela veut dire que la lecture des valeurs dans les lignes suivantes ne seront pas à jour. La méthode set des [Stores de Solid](#createstore), les méthodes de tableau de [Mutable Store](#createmutable) et les Effets enveloppent automatiquement leur code dans un `batch`.

## `on`

```ts
import { on } from "solid-js";

function on<T extends Array<() => any> | (() => any), U>(
  deps: T,
  fn: (input: T, prevInput: T, prevValue?: U) => U,
  options: { defer?: boolean } = {}
): (prevValue?: U) => U | undefined;
```

`on` est fait pour passer dans une fonction de calcul qui va rendre ses dépendances explicites. Si un tableau de dépendances est passé, `input` et `prevInput` sont des tableaux.

```js
createEffect(on(a, (v) => console.log(v, b())));

// est l'équivalent de:
createEffect(() => {
  const v = a();
  untrack(() => console.log(v, b()));
});
```

Vous pouvez aussi ne pas exécuter le calcul immédiatement et à la place choisir de l'exécuter au changement en passant l'option `defer: true`

```js
// Ne s'exécute pas immédiatement.
createEffect(on(a, (v) => console.log(v), { defer: true }));

setA("new"); // Maintenant elle s'exécute.
```

Veuillez noter que pour les `stores` et `mutable`, l'ajout ou la suppression d'une propriété de l'objet parent déclenchera un effet. Voir [`createMutable`](#createMutable)

## `createRoot`

```ts
import { createRoot } from "solid-js";

function createRoot<T>(fn: (dispose: () => void) => T): T;
```

Créer un nouveau contexte qui ne sera pas surveillé et qui ne se détruira pas automatiquement. C'est utile pour les contextes réactifs imbriqués que vous ne voulez pas détruire lorsque le parent se réévalue.

Tous les projets Solid devraient être enrobés de cette fonction à haut niveau pour s'assurer que toute la mémoire/calcul soit libérée. Normalement, vous n'avez pas à vous soucier de ceci, car `createRoot` est embarqué dans la fonction d'entrée `render`.

## `getOwner`

```ts
import { getOwner } from "solid-js";

function getOwner(): Owner;
```

Obtient la portée réactive qui possède le code en cours d'exécution, par exemple, pour passer dans un appel ultérieur à `runWithOwner` en dehors de la portée actuelle.

En interne, les calculs (effets, mémos, etc.) créent des propriétaires qui sont les enfants de leur propriétaire, jusqu'au propriétaire racine créé par `createRoot` ou `render`. En particulier, cet arbre de propriété permet à Solid de nettoyer automatiquement un calcul supprimé en parcourant son sous-arbre et en appelant tous les rappels [`onCleanup`](#oncleanup).
Par exemple, lorsque les dépendances d'un `createEffect` changent, l'effet appelle tous les rappels descendants `onCleanup` avant d'exécuter à nouveau la fonction d'effet. L'appel de `getOwner` renvoie le nœud propriétaire actuel responsable de la suppression du bloc d'exécution actuel.

Les composants ne sont pas des calculs, donc ne créent pas de noeud propriétaire, mais ils sont typiquement rendus à partir d'un `createEffect` qui le fait, donc le résultat est similaire : quand un composant est démonté, tous les callbacks `onCleanup` descendants sont appelés. L'appel de `getOwner` à partir d'un composant renvoie le propriétaire qui est responsable du rendu et du démontage de ce composant.

Notez que la portée réactive propriétaire n'est pas nécessairement _suivie_. Par exemple, [`untrack`](#untrack) désactive le suivi pendant la durée d'une fonction (sans créer une nouvelle portée réactive), tout comme les composants créés via JSX (`<Component ...>`).

## `runWithOwner`

```ts
import { runWithOwner } from 'solid-js';

function runWithOwner<T>(owner: Owner, fn: (() => void) => T): T;
```

Exécute la fonction donnée sous le propriétaire fourni,
à la place du propriétaire de la portée externe (et sans l'affecter).
Par défaut, les calculs créés par `createEffect`, `createMemo`, etc. appartiennent au propriétaire du code en cours d'exécution (la valeur de retour de `getOwner`), et seront donc éliminés lorsque leur propriétaire le fera. L'appel à `runWithOwner` fournit un moyen de remplacer cette valeur par défaut par un propriétaire spécifié manuellement (typiquement, la valeur de retour d'un appel précédent à `getOwner`), permettant un contrôle plus précis du moment où les calculs sont éliminés.

Il est important d'avoir un propriétaire (correct) pour deux raisons:

- Les calculs sans propriétaire ne peuvent pas être éliminés. Par exemple, si vous appelez `createEffect` sans propriétaire (par exemple, dans la portée globale), l'effet continuera à fonctionner pour toujours, au lieu d'être éliminé lorsque son propriétaire sera éliminé.
-  [`useContext`](#usecontext) obtient le contexte en remontant l'arbre des propriétaires pour trouver l'ancêtre le plus proche fournissant le contexte désiré. Donc, sans propriétaire, vous ne pouvez pas chercher un contexte fourni (et avec le mauvais propriétaire, vous pourriez obtenir le mauvais contexte).

Définir manuellement le propriétaire est particulièrement utile lorsque l'on fait de la réactivité en dehors de toute portée de propriétaire. En particulier, les calculs asynchrones (via les fonctions `async` ou les callbacks comme `setTimeout`) perdent le propriétaire automatiquement défini, donc se souvenir du propriétaire original via `getOwner` et le restaurer via `runWithOwner` est nécessaire dans ces cas.
Par exemple:

```js
const owner = getOwner();
setTimeout(() => {
  // Ce callback est exécuté sans propriétaire.
  // Restaurer le propriétaire via runWithOwner:
  runWithOwner(owner, () => {
    const foo = useContext(FooContext);
    createEffect(() => {
      console.log(foo);
    });
  });
}, 1000);
```

Notez que les propriétaires ne sont pas ce qui détermine le suivi des dépendances, donc `runWithOwner` n'aide pas au suivi dans les fonctions asynchrones ; l'utilisation d'un état réactif dans la partie asynchrone (par exemple, après le premier `await`) ne sera pas suivie comme une dépendance.

## `mergeProps`

```ts
import { mergeProps } from "solid-js";

function mergeProps(...sources: any): any;
```

Une méthode `merge` qui va fusionner des objets réactifs. C'est utile pour associer des valeurs par défaut aux props de composants dans le cas où le parent ne les fournit pas. Ou cloner l'objet props en incluant des propriétés réactives.

Cette méthode fonctionne en utilisant les proxies et associant les propriétés dans l'ordre inverse. Cela permet de dynamiquement surveiller les propriétés qui ne sont pas présentes quand l'objet prop est fusionné la première fois.

```js
// Props par défault.
props = mergeProps({ name: "Smith" }, props);

// Cloner l'objet `props`.
newProps = mergeProps(props);

// Fusionner l'objet `props`
props = mergeProps(props, otherProps);
```

## `splitProps`

```ts
import { splitProps } from "solid-js";

function splitProps<T>(
  props: T,
  ...keys: Array<(keyof T)[]>
): [...parts: Partial<T>];
```

C'est un remplacement de la déstructuration. Elle va séparer un objet réactif par une liste de clés pour maintenir la réactivité.

Elle prend un objet réactif et un nombre quelconque de tableaux de clés ; pour chaque tableau de clés, elle renvoie un objet réactif avec uniquement les propriétés de l'objet original. Le dernier objet réactif dans le tableau retourné aura toutes les propriétés restantes de l'objet original.

Cela peut être utile si vous voulez consommer un sous-ensemble de props et passer le reste à un enfant.

```js
function MyComponent(props) {
  const [local, others] = splitProps(props, ["children"]);

  return (
    <>
      <div>{local.children}</div>
      <Child {...others} />
    </>
  );
}
```

Parce que `splitProps` prend n'importe quel nombre de tableaux, nous pouvons diviser un objet props autant que nous le souhaitons (si, par exemple, nous avons plusieurs composants enfants qui nécessitent chacun un sous-ensemble des props).

Disons qu'un composant a reçu six props:

```js
<MyComponent a={1} b={2} c={3} d={4} e={5} foo="bar" />;
function MyComponent(props) {
  console.log(props); // {a: 1, b: 2, c: 3, d: 4, e: 5, foo: "bar"}
  const [voyelles, consonnes, reste] = splitProps(
    props,
    ["a", "e"],
    ["b", "c", "d"]
  );
  console.log(voyelles); // {a: 1, e: 5}
  console.log(consonnes); // {b: 2, c: 3, d: 4}
  console.log(reste.foo); // bar
}
```

## `useTransition`

```ts
import { useTransition } from "solid-js";

function useTransition(): [
  pending: () => boolean,
  startTransition: (fn: () => void) => Promise<void>
];
```

Utilisé pour grouper les mises à jour asynchrones dans une transition qui va reporter les changements jusqu'à ce que tous les processus asynchrones soient complétés. Ceci est lié au Suspense et surveille seulement les ressources lues dans les limites des Suspenses.

```js
const [isPending, start] = useTransition();

// Vérifie si entrain de transitionner.
isPending();

// Enrobe dans une transition.
start(() => setSignal(newValue), () => /* La transition est terminée. */)
```

## `startTransition`

**Nouveau depuis la v1.1.0**

```ts
import { startTransition } from 'solid-js';

function startTransition: (fn: () => void) => Promise<void>;
```

Similaire à `useTransition` sauf qu'il n'y a pas d'état en attente associé. Celui-ci peut simplement être utilisé directement pour lancer la transition.

## `observable`

```ts
import { observable } from "solid-js";

function observable<T>(input: () => T): Observable<T>;
```

Cette méthode prend un signal et produit un simple objet Observable.
Vous pouvez l'utiliser avec une librairie Observable de votre choix typiquement avec l'opérateur `from`.

```js
// Intégrer rxjs avec un Signal Solid
import { observable } from "solid-js";
import { from } from "rxjs";

const [s, set] = createSignal(0);

const obsv$ = from(observable(s));

obsv$.subscribe((v) => console.log(v));
```

Vous pouvez également utiliser `from` sans `rxjs` ; voir ci-dessous.

## `from`

**Nouveau depuis la v1.1.0**

```ts
import { from } from "solid-js";

function from<T>(
  producer:
    | ((setter: (v: T) => T) => () => void)
    | {
        subscribe: (
          fn: (v: T) => void
        ) => (() => void) | { unsubscribe: () => void };
      }
): () => T;
```

Un helper pour faciliter à opérer avec des producteurs externes comme les observables RxJS ou avec Svelte Stores. En gros, cela transforme n'importe quel objet pouvant être abonné (objet avec une méthode `subscribe`) en un Signal et gère l'abonnement et la destruction.

```js
const signal = from(obsv$);
```

Il peut également prendre une fonction de producteur personnalisée où la fonction est passée à une fonction setter qui renvoie une fonction de désabonnement:

```js
const clock = from((set) => {
  const t = setInterval(() => set(1), 1000);
  return () => clearInterval(t);
});
```

> Note: Les contrôles d'égalité des Signaux créés par `from` sont désactivés afin de mieux s'interfacer avec les flux et sources externes.

## `mapArray`

```ts
import { mapArray } from "solid-js";

function mapArray<T, U>(
  list: () => readonly T[],
  mapFn: (v: T, i: () => number) => U
): () => U[];
```

Fonction d'aide d'association réactive qui va mettre en cache chaque élément par référence pour réduire les associations inutiles lors de mise à jour. Elle ne va exécuter la fonction d'association qu'une fois par valeur et va la déplacer ou supprimer en fonction du besoin. L'argument index est un signal. La fonction d'association elle-même n'est pas surveillée.

Cette fonction d'aide est utilisée pour le contrôle de flux avec `<For />`

```js
const mapped = mapArray(source, (model) => {
  const [name, setName] = createSignal(model.name);
  const [description, setDescription] = createSignal(model.description);

  return {
    id: model.id,
    get name() {
      return name();
    },
    get description() {
      return description();
    }
    setName,
    setDescription
  }
});
```

## `indexArray`

```ts
import { indexArray } from "solid-js";

function indexArray<T, U>(
  list: () => readonly T[],
  mapFn: (v: () => T, i: number) => U
): () => U[];
```

Similaire à `mapArray` sauf qu'elle associe par index. L'élément est un signal et l'index est maintenant une constante.

Cette fonction d'aide est utilisée pour le contrôle de flux avec `<Index />`

```js
const mapped = indexArray(source, (model) => {
  return {
    get id() {
      return model().id
    }
    get firstInitial() {
      return model().firstName[0];
    },
    get fullName() {
      return `${model().firstName} ${model().lastName}`;
    },
  }
});
```

# Stores

## `createStore`

```ts
import { createStore } from "solid-js/store";
import type { StoreNode, Store, SetStoreFunction } from "solid-js/store";

function createStore<T extends StoreNode>(
  state: T | Store<T>
): [get: Store<T>, set: SetStoreFunction<T>];
type Store<T> = T;  // conceptuellement en lecture seule, mais pas typée comme telle.
```

La fonction create prend un état initial, l'enveloppe dans un store et renvoie un objet proxy en lecture seule et une fonction de mise à jour (setter).

```js
const [state, setState] = createStore(initialValue);

// Lis une valeur.
state.someValue;

// Met à jour une valeur.
setState({ merge: "thisValue" });

setState("path", "to", "value", newValue);
```

En tant que proxies, les objets Store ne suivent que lorsqu'une propriété est accédée.

En cas d'accès à des objets imbriqués, les Stores produisent des objets Store imbriqués, et ce, tout au long de l'arbre. Toutefois, cela ne s'applique qu'aux tableaux et aux objets ordinaires. Les classes ne sont pas envelopées donc les `Date`, `HTMLElement`, `RegExp`, `Map`, `Set` ne sont pas réactifs.

#### Tableaux dans les Stores

Depuis la version **1.4.0**, l'objet d'état de niveau supérieur peut être un tableau. Dans les versions précédentes, il fallait créer un objet pour envelopper le tableau:

```jsx
// Après Solid 1.4.0
const [todos, setTodos] = createStore([
  { id: 1, title: "Chose que je dois faire", done: false },
  { id: 2, title: "Apprendre un nouveau Framework", done: false },
]);
...
<For each={todos}>{todo => <Todo todo={todo} />}</For>;
```

```jsx
// Avant Solid 1.4.0
const [state, setState] = createStore({
  todos: [
    { id: 1, title: "Chose que je dois faire", done: false },
    { id: 2, title: "Apprendre un nouveau Framework", done: false },
  ],
});
<For each={state.todos}>{(todo) => <Todo todo={todo} />}<For>;
```

Notez que la modification d'un tableau dans un Store ne déclenchera pas les calculs qui s'abonnent directement au tableau. Par exemple:

```js
createEffect(() => {
  console.log(state.todos);
});

// Cela ne déclenchera pas l'effet:
setState(todos, state.todos.length, { id: 3 });
// Cela va déclencher l'effet, parce que la référence du tableau change:
setState("todos", (prev) => [...prev, { id: 3 }]);
```

### Getters

Les objets Store supportent l'utilisation d'accesseur (getters) pour calculer des valeurs.

```js
const [state, setState] = createStore({
  user: {
    firstName: "John",
    lastName: "Smith",
    get fullName() {
      return `${this.firstName} ${this.lastName}`;
    },
  },
});
```

Ce sont de simples accesseurs qui s'exécutent à nouveau lorsqu'on y accède, donc vous avez toujours besoin d'utiliser un mémo si vous souhaitez garder en cache la valeur ;

```js
let fullName;
const [state, setState] = createStore({
  user: {
    firstName: "John",
    lastName: "Smith",
    get fullName() {
      return fullName();
    },
  },
});
fullName = createMemo(() => `${state.user.firstName} ${state.user.lastName}`);
```

### Mise à jour des Stores

Les changements peuvent prendre la forme de fonction qui passe en paramètre la valeur de l'état précédent et retourne un nouvel état ou une valeur. Les objets sont toujours superficiellement fusionnés. Affecter une valeur `undefined` pour les supprimer du Store.

```js
const [state, setState] = createStore({
  firstName: "John",
  lastName: "Miller",
});

setState({ firstName: "Johnny", middleName: "Lee" });
// ({ firstName: 'Johnny', middleName: 'Lee', lastName: 'Miller' })

setState((state) => ({ preferredName: state.firstName, lastName: "Milner" }));
// ({ firstName: 'Johnny', preferredName: 'Johnny', middleName: 'Lee', lastName: 'Milner' })
```

Il est possible d'utiliser des chemins en utilisant les clés des tableaux, un rayon d'objet et des fonctions de filtrage.

`setState` supporte aussi les options imbriquées où vous pouvez indiquer le chemin du changement. L'état que vous voulez mettre à jour peut être d'autres valeurs qui ne sont pas des objets. Les objets sont fusionnés, mais les autres valeurs (tableaux inclus) sont remplacées.

```js
const [state, setState] = createStore({
  counter: 2,
  list: [
    { id: 23, title: 'Birds' }
    { id: 27, title: 'Fish' }
  ]
});

setState('counter', c => c + 1);
setState('list', l => [...l, {id: 43, title: 'Marsupials'}]);
setState('list', 2, 'read', true);
// {
//   counter: 3,
//   list: [
//     { id: 23, title: 'Birds' }
//     { id: 27, title: 'Fish' }
//     { id: 43, title: 'Marsupials', read: true }
//   ]
// }
```

Le chemin peut être des clés en chaîne de caractère, des clés de tableau, des itérations d'objet `({ from, to, by })` ou des fonctions de filtrage. Cela permet une expressivité impressionnante pour décrire le changement d'état.

```js
const [state, setState] = createStore({
  todos: [
    { task: 'Finir le travail', completed: false }
    { task: 'Faire les courses', completed: false }
    { task: 'Faire le dinner', completed: false }
  ]
});

setState('todos', [0, 2], 'completed', true);
// {
//   todos: [
//     { task: 'Finir le travail', completed: true }
//     { task: 'Faire les courses', completed: false }
//     { task: 'Faire le dinner', completed: true }
//   ]
// }

setState('todos', { from: 0, to: 1 }, 'completed', c => !c);
// {
//   todos: [
//     { task: 'Finir le travail', completed: false }
//     { task: 'Faire les courses', completed: true }
//     { task: 'Faire le dinner', completed: true }
//   ]
// }

setState('todos', todo => todo.completed, 'task', t => t + '!')
// {
//   todos: [
//     { task: 'Finir le travail', completed: false }
//     { task: 'Faire les courses!', completed: true }
//     { task: 'Faire le dinner!', completed: true }
//   ]
// }

setState('todos', {}, todo => ({ marked: true, completed: !todo.completed }))
// {
//   todos: [
//     { task: 'Finir le travail', completed: true, marked: true }
//     { task: 'Faire les courses!', completed: false, marked: true }
//     { task: 'Faire le dinner!', completed: false, marked: true }
//   ]
// }
```

## Utilitaires de Store

### `produce`

```ts
import { produce } from "solid-js/store";

function produce<T>(
  fn: (state: T) => void
): (
  state: T extends NotWrappable ? T : Store<T>
) => T extends NotWrappable ? T : Store<T>;
```

Inspiré de l'API d'Immer qui a été adapté pour les objets Store dans Solid pour permettre la mutation localisée.

```js
setState(
  produce((s) => {
    s.user.name = "Frank";
    s.list.push("Pencil Crayon");
  })
);
```

### `reconcile`

```ts
import { reconcile } from "solid-js/store";

function reconcile<T>(
  value: T | Store<T>,
  options?: {
    key?: string | null;
    merge?: boolean;
  } = { key: "id" }
): (
  state: T extends NotWrappable ? T : Store<T>
) => T extends NotWrappable ? T : Store<T>;
```

La comparaison de données n'est pas appliquée lorsque l'on ne peut pas appliquer de mise à jour précise. Utile quand nous voulons gérer des données immuables depuis les stores ou grosses réponses d'API.

La clé est utilisée quand les éléments associés sont disponibles. Par défaut `merge: false` fais une vérification de référence quand c'est possible pour déterminer l'égalité et replace lorsque la référence n'est pas égale. `merge: true` pousse toutes les comparaisons aux feuilles de l'arbre de données et remplace la donnée précédente par la nouvelle valeur de manière efficace.

```js
// S'abonner à un observable.
const unsubscribe = store.subscribe(({ todos }) => (
  setState('todos', reconcile(todos)));
);
onCleanup(() => unsubscribe());
```

### `unwrap`

```ts
import { unwrap } from "solid-js/store";

function unwrap(store: Store<T>): T;
```

Retourne les données sous-jacentes dans le Store sans proxy.

### `createMutable`

```ts
import { createMutable } from 'solid-js/store';

function createMutable<T extends StoreNode>(
  state: T | Store<T>,
): Store<T>;
```

Créer un nouvel objet Store mutable. Les stores se mettent à jour seulement quand les valeurs changent. Le traçage est fait par l'interception de l'accès de propriété et automatiquement tracé dans des imbrications profondes en utilisant un proxy.

Utile pour l'intégration de système externe ou en tant que couche de compatibilité avec MobX/Vue.

> **Note:** Un état mutable peut être passé et changer n'importe où, ce qui peut le rendre dur à suivre et peut casser le sens unidirectionnel plus facilement. Il est généralement recommandé d'utiliser `createStore` à la place. Le modificateur `produce` peut fournir beaucoup de ces avantages sans aucun sacrifice.

```js
const state = createMutable(initialValue);

// Lecture de la valeur.
state.someValue;

// Affectation d'une valeur.
state.someValue = 5;

state.list.push(anotherValue);
```

Les Mutables supportent les fonctions de mutations ainsi que les fonctions accesseurs.

```js
const user = createMutable({
  firstName: "John",
  lastName: "Smith",
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  },
  set fullName(value) {
    [this.firstName, this.lastName] = value.split(" ");
  },
});
```

### `modifyMutable`

**Nouveau depuis la v1.4.0**

```ts
import { modifyMutable } from 'solid-js/store';

function modifyMutable<T>(mutable: T, modifier: (state: T) => T): void;
```

Ce helper simplifie la modification multiple d'un Store mutable (tel que retourné par [`createMutable`](#createmutable)) en un seul [`batch`](#batch), de sorte que les calculs dépendants ne soient mis à jour qu'une seule fois au lieu d'une fois par mise à jour.
Le premier argument est le Store mutable à modifier, et le second argument est un modificateur de Store tel que ceux renvoyés par [`reconcile`](#reconcile) ou [`produce`](#produce).
(Si vous passez votre propre fonction modificatrice, faites attention que son argument est
une version non enveloppée du magasin.)

Par exemple, supposons que nous ayons une interface utilisateur dépendant de plusieurs champs d'un mutable:

```tsx
const state = createMutable({
  user: {
    firstName: "John",
    lastName: "Smith",
  },
});

<h1>Bienvenue {state.user.firstName + ' ' + state.user.lastName}</h1>
```

En modifiant *n* champs en séquence, l'interface utilisateur sera mise à jour *n* fois:

```ts
state.user.firstName = "Jake";  // Déclenche mise à jour.
state.user.lastName = "Johnson";  // Déclenche une autre mise à jour.
```

Pour déclencher une seule mise à jour, nous pourrions modifier les champs dans un `batch`:

```ts
batch(() => {
  state.user.firstName = "Jake";
  state.user.lastName = "Johnson";
});
```

`modifyMutable` combiné avec `reconcile` ou `produce` fournit deux façons alternatives de faire des choses similaires:

```ts
// Remplace state.user avec l'objet spécifié (suprimant tout autre champs)
modifyMutable(state.user, reconcile({
  firstName: "Jake",
  lastName: "Johnson",
}));

// Modifie les deux champs dans un `batch`, déclenchant une seule mise à jour.
modifyMutable(state.user, produce((u) => {
  u.firstName = "Jake";
  u.lastName = "Johnson";
}));
```

# APIs de Composant

## `createContext`

```ts
interface Context<T> {
  id: symbol;
  Provider: (props: { value: T; children: any }) => any;
  defaultValue: T;
}
export function createContext<T>(defaultValue?: T): Context<T | undefined>;
```

Un Contexte permet une forme d'injection de dépendance dans Solid. Il est utilisé pour éviter de devoir passer des données en tant que props à travers plusieurs composants intermédiaires.

Cette fonction crée un objet contexte qui peut être utilisé grâce à `useContext` et fournir un contrôleur de flux `Provider`. Un contexte par défaut est utilisé quand aucun `Provider` n'est trouvé dans la hiérarchie du haut.

```js
export const CounterContext = createContext([{ count: 0 }, {}]);

export function CounterProvider(props) {
  const [state, setState] = createStore({ count: props.count || 0 });
  const store = [
    state,
    {
      increment() {
        setState("count", (c) => c + 1);
      },
      decrement() {
        setState("count", (c) => c - 1);
      },
    },
  ];

  return (
    <CounterContext.Provider value={store}>
      {props.children}
    </CounterContext.Provider>
  );
}
```

La valeur donnée au `Provider` est passée telle quelle à `useContext`. Cela signifie qu'enrober une expression réactive ne marchera pas. Vous devrez passer des Signaux ou des Stores directement au lieu d'y accéder dans le JSX.

## `useContext`

```ts
export function useContext<T>(context: Context<T>): T;
```

Utiliser pour récupérer un contexte, et d'éviter de passer des données via les props dans chaque fonction Composant.

```js
const [state, { increment, decrement }] = useContext(CounterContext);
```

## `children`

```ts
export function children(fn: () => any): () => any;
```

Utiliser pour faciliter l'interaction avec `props.children`. Cette fonction d'aide résout n'importe quelle réactivité imbriquée et retourne un mémo. Cette approche est recommandée pour utiliser `props.children` dans autre chose que l'utiliser directement dans le JSX.

```js
const list = children(() => props.children);

// faire quelque chose avec la donnée
createEffect(() => list());
```

## `lazy`

```ts
export function lazy<T extends Component<any>>(
  fn: () => Promise<{ default: T }>
): T & { preload: () => Promise<T> };
```

Utiliser le chargement de composant en mode paresseux pour permettre le découpage dynamique de code. Les composants ne sont chargés qu'une fois utilisée. Les composants chargés paresseusement peuvent être utilisé de la même manière qu'un composant importé normalement, il peut recevoir des props, etc. Les composants paresseux déclenchent les `<Suspense />`

```js
// Enrobe l'import
const ComponentA = lazy(() => import("./ComponentA"));

// utiliser dans le JSX
<ComponentA title={props.title} />;
```

# Primitives secondaires

Vous n'en aurez sûrement pas besoin pour votre première app, mais ce sont des outils utiles à avoir sous le coude.

## `createDeferred`

```ts
export function createDeferred<T>(
  source: () => T,
  options?: {
    timeoutMs?: number;
    name?: string;
    equals?: false | ((prev: T, next: T) => boolean);
  }
): () => T;
```

Créer une valeur en lecture seule qui va notifier les changements en aval quand le navigateur est inactif. `timeoutMs` est le temps maximum attendu avant de forcer la mise à jour.

## `createComputed`

```ts
export function createComputed<T>(
  fn: (v: T) => T,
  value?: T,
  options?: { name?: string }
): void;
```

Crée une nouvelle fonction de calcul qui va automatiquement tracer les dépendances et s'exécuter immédiatement avant le rendu. L'utiliser pour écrire sur d'autres primitives réactives. Quand c'est possible, utiliser plutôt `createMemo` car écrire sur un signal en milieu de mise à jour peut causer d'autres fonctions à se recalculer.

## `createRenderEffect`

```ts
export function createRenderEffect<T>(
  fn: (v: T) => T,
  value?: T,
  options?: { name?: string }
): void;
```

Créer un nouveau calcul qui va automatiquement tracer ces dépendances et s'exécuter durant la phase de rendu pendant que les éléments de DOM sont créés et mis à jour, mais pas nécessairement connecté. Toutes les mises à jour du DOM interne se passent à ce moment-là.

## `createSelector`

```ts
export function createSelector<T, U>(
  source: () => T,
  fn?: (a: U, b: T) => boolean,
  options?: { name?: string }
): (k: U) => boolean;
```

Créer un signal conditionnel qui va seulement notifier les abonnées quand un élément entré ou sorti correspond à la valeur de la clé. Utile pour déléguer la sélection d'états, car l'opération devient O(1) au lieu de O(n).

```js
const isSelected = createSelector(selectedId);

<For each={list()}>
  {(item) => <li classList={{ active: isSelected(item.id) }}>{item.name}</li>}
</For>;
```

# Rendering

# Rendu

Ces imports sont exposés depuis `solid-js/web`.

## `render`

```ts
export function render(
  code: () => JSX.Element,
  element: MountableElement
): () => void;
```

Le point d'entrée de l'application côté navigateur. Il faut fournir une définition de composant de haut niveau ou une fonction et un élément sur lequel monter l'application. Il est recommandé que cet élément soit vide, car la fonction de disposition va effacer tous les enfants.

```js
const dispose = render(App, document.getElementById("app"));
```

## `hydrate`

```ts
export function hydrate(
  fn: () => JSX.Element,
  node: MountableElement
): () => void;
```

Cette méthode est similaire à `render` sauf qu'elle essaye d'hydrater ce qui est déjà rendu dans le DOM. Quand elle est initialisée dans le navigateur, une page a déjà été rendue côté serveur.

```js
const dispose = hydrate(App, document.getElementById("app"));
```

## `renderToString`

```ts
export function renderToString<T>(
  fn: () => T,
  options?: {
    eventNames?: string[];
    nonce?: string;
  }
): string;
```

Effectue un rendu en tant que chaîne de caractères de manière synchrone. La fonction génère aussi une balise script pour l'hydratation progressive. Les options incluses `eventNames` pour écouter des évènements avant que la page ne se charge et à l'exécution de l'hydrations et annoncer l'ajout de la balise tag.

```js
const html = renderToString(App);
```

## `renderToStringAsync`

```ts
export function renderToStringAsync<T>(
  fn: () => T,
  options?: {
    eventNames?: string[];
    timeoutMs?: number;
    nonce?: string;
  }
): Promise<string>;
```

Similaire à `renderToString` sauf qu'elle va attendre que toutes les limites de `<Suspense/>` soit résolues avant de retourner le résultat. Les données des ressources sont automatiquement sérialisées dans une balise script et seront hydratées au chargement du client.

```js
const html = await renderToStringAsync(App);
```

## `pipeToNodeWritable`

```ts
export type PipeToWritableResults = {
  startWriting: () => void;
  write: (v: string) => void;
  abort: () => void;
};
export function pipeToNodeWritable<T>(
  fn: () => T,
  writable: { write: (v: string) => void },
  options?: {
    eventNames?: string[];
    nonce?: string;
    noScript?: boolean;
    onReady?: (r: PipeToWritableResults) => void;
    onComplete?: (r: PipeToWritableResults) => void | Promise<void>;
  }
): void;
```

Cette méthode traduit en flux Node. Il traduit le contenu de manière synchrone en incluant tous les contenus de repli des Suspenses, et ensuite continus vers un flux de données provenant des ressources asynchrones au fur et à mesure de leur complétion.

```js
pipeToNodeWritable(App, res);
```

L'option `onReady` est utile pour écrire dans le flux autour du noyau du rendu de l'application. Si vous utilisez `onReady`, vous devez appeler manuellement `startWriting`

## `pipeToWritable`

```ts
export type PipeToWritableResults = {
  write: (v: string) => void;
  abort: () => void;
  script: string;
};
export function pipeToWritable<T>(
  fn: () => T,
  writable: WritableStream,
  options?: {
    eventNames?: string[];
    nonce?: string;
    noScript?: boolean;
    onReady?: (
      writable: { write: (v: string) => void },
      r: PipeToWritableResults
    ) => void;
    onComplete?: (
      writable: { write: (v: string) => void },
      r: PipeToWritableResults
    ) => void;
  }
): void;
```

Cette méthode traduit en flux web. Il traduit le contenu de manière synchrone en incluant tous les contenus de repli des Suspenses, et ensuite continus vers un flux de données provenant des ressources asynchrones au fur et à mesure de leur complétion.

```js
const { readable, writable } = new TransformStream();
pipeToWritable(App, writable);
```

L'option `onReady` est utile pour écrire dans le flux autour du noyau du rendu de l'application. Si vous utilisez `onReady`, vous devez appeler manuellement `startWriting`

## `isServer`

```ts
export const isServer: boolean;
```

Cela indique si le code est exécuté côté serveur ou côté navigateur. Comme le système d'exécution exporte ceci en tant que constante booléenne, cela permet aux bundlers d'éliminer le code et leurs imports de leurs bundle respectifs.

```js
if (isServer) {
  // Je ne serais jamais dans le bundle du navigateur
} else {
  // Je ne serais jamais côté serveur
}
```

# Control Flow

Solid utilise les composants pour le contrôle de flux. Pour que la réactivité soit performante, nous avons besoin de contrôler comment les éléments sont créés. Par exemple, avec une liste, un simple `map` est inefficace, car il va toujours itérer sur chaque élément. Cela veut dire qu'on doit utiliser des fonctions d'aide.

Enrober ces composants est un moyen pratique pour réduire le templating et permettre aux utilisateurs de composer et construire leurs propres contrôles de flux.

Ces composants de contrôle de flux sont automatiquement importés. Tous à l'exception de `Portal` et `Dynamic` sont importés depuis `solid-js`. Ces deux-là son spécifique au DOM et sont exportés par `solid-js/web`.

> Note : Toutes fonctions enfants au contrôle de flux sont non tracées. Cela permet d'imbriquer des créations d'états, et mieux isoler les réactions.

## `<For>`

```ts
export function For<T, U extends JSX.Element>(props: {
  each: readonly T[];
  fallback?: JSX.Element;
  children: (item: T, index: () => number) => U;
}): () => U[];
```

Simple référencement de contrôle de flux par boucle.

```jsx
<For each={state.list} fallback={<div>Loading...</div>}>
  {(item) => <div>{item}</div>}
</For>
```

Le second argument optionnel est un signal index :

```jsx
<For each={state.list} fallback={<div>Loading...</div>}>
  {(item, index) => (
    <div>
      #{index()} {item}
    </div>
  )}
</For>
```

## `<Show>`

```ts
function Show<T>(props: {
  when: T | undefined | null | false;
  fallback?: JSX.Element;
  children: JSX.Element | ((item: T) => JSX.Element);
}): () => JSX.Element;
```

Le contrôle de flux `Show` est utilisée pour afficher conditionnellement une partie de la vue. Ceci est similaire à un opérateur ternaire (`a ? b : c`) mais est idéal pour le templating JSX.

```jsx
<Show when={state.count > 0} fallback={<div>Loading...</div>}>
  <div>My Content</div>
</Show>
```

`Show` peut aussi être utilisé comme un moyen d'associé une clé d'un modèle de données spécifique à un bloc. Par exemple, la fonction est réexécutée quand le modèle est remplacé.

```jsx
<Show when={state.user} fallback={<div>Loading...</div>}>
  {(user) => <div>{user.firstName}</div>}
</Show>
```

## `<Switch>`/`<Match>`

```ts
export function Switch(props: {
  fallback?: JSX.Element;
  children: JSX.Element;
}): () => JSX.Element;

type MatchProps<T> = {
  when: T | undefined | null | false;
  children: JSX.Element | ((item: T) => JSX.Element);
};
export function Match<T>(props: MatchProps<T>);
```

Utile quand il y a plus de 2 conditions mutuelles exclusives. Peut-être utiliser pour faire un système de routage simple par exemple.

```jsx
<Switch fallback={<div>Not Found</div>}>
  <Match when={state.route === "home"}>
    <Home />
  </Match>
  <Match when={state.route === "settings"}>
    <Settings />
  </Match>
</Switch>
```

`Match` supporte aussi une fonction enfant qui sert de flux associé à une clé.

## `<Index>`

```ts
export function Index<T, U extends JSX.Element>(props: {
  each: readonly T[];
  fallback?: JSX.Element;
  children: (item: () => T, index: number) => U;
}): () => U[];
```

Une fonction d'itération sur des listes sans clé (les lignes sont associées à un index au lieu d'une clé). Ceci est utile quand il n'y a pas de clé conceptuelle, par exemple si la donnée est composée de primitives et c'est l'index qui est fixe au lieu de la valeur.

L'élément est un signal :

```jsx
<Index each={state.list} fallback={<div>Loading...</div>}>
  {(item) => <div>{item()}</div>}
</Index>
```

Le second argument optionnel est un index de type `number` :

```jsx
<Index each={state.list} fallback={<div>Loading...</div>}>
  {(item, index) => (
    <div>
      #{index} {item()}
    </div>
  )}
</Index>
```

## `<ErrorBoundary>`

```ts
function ErrorBoundary(props: {
  fallback: JSX.Element | ((err: any, reset: () => void) => JSX.Element);
  children: JSX.Element;
}): () => JSX.Element;
```

Intercepte les erreurs qui ne sont pas traitées et affiche un contenu de repli.

```jsx
<ErrorBoundary fallback={<div>Something went terribly wrong</div>}>
  <MyComp />
</ErrorBoundary>
```

Il est aussi possible de passer une fonction qui va recevoir l'erreur ainsi qu'une fonction de réinitialisation.

```jsx
<ErrorBoundary
  fallback={(err, reset) => <div onClick={reset}>Error: {err.toString()}</div>}
>
  <MyComp />
</ErrorBoundary>
```

## `<Suspense>`

```ts
export function Suspense(props: {
  fallback?: JSX.Element;
  children: JSX.Element;
}): JSX.Element;
```

Un composant qui garde une trace de toutes les ressources lues dans sa portée et affiche un contenu de repli jusqu'à ce que toutes les ressources soient chargées. Ce qui rend les `Suspenses` différents de `Show` est l'aspect non bloquant, car les deux branches existent en même temps même si elles ne sont pas dans le DOM.

```jsx
<Suspense fallback={<div>Loading...</div>}>
  <AsyncComponent />
</Suspense>
```

## `<SuspenseList>` (Expérimental)

```ts
function SuspenseList(props: {
  children: JSX.Element;
  revealOrder: "forwards" | "backwards" | "together";
  tail?: "collapsed" | "hidden";
}): JSX.Element;
```

`SuspenseList` permet de coordonner plusieurs composants `Suspense` et `SuspenseList` en parallèle. Il contrôle l'ordre dans la quel le contenu est révélé pour réduire les mises en page et possède une option pour fusionner ou cacher les états de repli.

```jsx
<SuspenseList revealOrder="forwards" tail="collapsed">
  <ProfileDetails user={resource.user} />
  <Suspense fallback={<h2>Loading posts...</h2>}>
    <ProfileTimeline posts={resource.posts} />
  </Suspense>
  <Suspense fallback={<h2>Loading fun facts...</h2>}>
    <ProfileTrivia trivia={resource.trivia} />
  </Suspense>
</SuspenseList>
```

`SuspenseList` est encore en phase expérimentale et ne supporte pas complètement le rendu côté serveur.

## `<Dynamic>`

```ts
function Dynamic<T>(
  props: T & {
    children?: any;
    component?: Component<T> | string | keyof JSX.IntrinsicElements;
  }
): () => JSX.Element;
```

Ce composant vous laisse insérer un composant ou une balise arbitraire avec des props associées.

```jsx
<Dynamic component={state.component} someProp={state.something} />
```

## `<Portal>`

```ts
export function Portal(props: {
  mount?: Node;
  useShadow?: boolean;
  isSVG?: boolean;
  children: JSX.Element;
}): Text;
```

Ce composant va insérer un élément dans le nœud monté. C'est utile pour insérer des boîtes de dialogue en dehors de l'agencement de la page. Les évènements se propagent à travers la hiérarchie du composant.

Le portail est monté dans une `<div>` à moins que la cible est un entête de document. `useShadow` place l'élément dans un `ShadowRoot` pour l'isolation de style, et `isSVG` est requise si l'insertion est faite dans un élément SVG pour que la `<div>` ne soit pas insérée.

```jsx
<Portal mount={document.getElementById("modal")}>
  <div>My Content</div>
</Portal>
```

# Attributs JSX spéciaux

En général, Solid essaye de respecter un maximum les conventions du DOM. La majorité des props est traitée comme des attributs sur les éléments natifs et les propriétés dans les Web Components, mais dans quelques cas, des comportements spéciaux sont associés.

Pour les attributs dans un espace de noms personnalisé avec TypeScript, vous aurez besoin d'étendre l'espace de nom JSX de Solid :

```ts
declare module "solid-js" {
  namespace JSX {
    interface Directives {
      // use:____
    }
    interface ExplicitProperties {
      // prop:____
    }
    interface ExplicitAttributes {
      // attr:____
    }
    interface CustomEvents {
      // on:____
    }
    interface CustomCaptureEvents {
      // oncapture:____
    }
  }
}
```

## `ref`

Les références sont un moyen d'accéder à l'élément de DOM sous-jacent à notre JSX. Même s’il est possible d'assigner un élément dans une variable, il est plus optimal de laisser le composant dans le flux de JSX. Les références sont assignées au moment du rendu, mais avant que les éléments soient connectés au DOM. Ils peuvent avoir deux formes.

```js
// assignation simple
let myDiv;

// utilisation de `onMount` ou `createEffect` pour lire après la connexion au DOM
onMount(() => console.log(myDiv));
<div ref={myDiv} />

// Ou utilisation d'une fonction (appelé avant la connexion au DOM)
<div ref={el => console.log(el)} />
```

Les références peuvent aussi être utilisées sur les Composants. Elles auront besoin d'être attachées de l'autre côté.

```jsx
function MyComp(props) {
  return <div ref={props.ref} />;
}

function App() {
  let myDiv;
  onMount(() => console.log(myDiv.clientWidth));
  return <MyComp ref={myDiv} />;
}
```

## `classList`

Un attribut d'aide pour utiliser `element.classList.toggle`. Il va prendre un objet dont la clé est un nom de classes et l'assigner quand la condition sera considérée `true`

```jsx
<div
  classList={{ active: state.active, editing: state.currentId === row.id }}
/>
```

## `style`

L'attribut style fonctionne soit comme avec une chaîne de caractère soit avec un objet. À la différence de React, Solid utilise `element.style.setProperty` en coulisse. Cela signifie que les variables CSS sont supportées, mais aussi que nous devons utiliser la version dash-case des propriétés. Cela donne de meilleures performances et une meilleure cohésion avec le résultat du rendu côté serveur.

```jsx
// chaine de caractère
<div style={`color: green; background-color: ${state.color}; height: ${state.height}px`} />

// objet
<div style={{
  color: "green",
  "background-color": state.color,
  height: state.height + "px" }}
/>

// variable css
<div style={{ "--my-custom-color": state.themeColor }} />
```

## `innerHTML`/`textContent`

Ils fonctionnent de la même manière que la propriété. Passez une chaîne de caractère et elle sera affichée. **Attention !!!** Utiliser `innerHTML` avec n'importe quelle donnée peut exposer vos utilisateurs à des risques, car cela peut être exploité comme faille de sécurité. `textContent` bien que généralement pas utiliser peut être une optimisation de performance quand vous savez que l'enfant ne sera que du texte, car il évite la comparaison générique.

```jsx
<div textContent={state.text} />
```

## `on___`

Les gestionnaires d'évènement dans Solid prennent typiquement la forme de `onclick` ou `onClick` en fonction du style du code. Le nom de l'évènement est en minuscule. Solid utilise une délégation d'évènement semi-synthétique pour les évènements communs à l'interface utilisateur qui ne sont pas composés et remontés. Cela améliore les performances pour les évènements communs.

```jsx
<div onClick={(e) => console.log(e.currentTarget)} />
```

Solid supporte aussi de fournir un tableau au gestionnaire d'évènement pour associer la valeur au premier argument de la fonction de gestion d'évènement. Cela n'utilise pas `bind` ou créer de fonction additionnelle, donc c'est un moyen très optimisé de déléguer des évènements.

```jsx
function handler(itemId, e) {
  /*...*/
}

<ul>
  <For each={state.list}>{(item) => <li onClick={[handler, item.id]} />}</For>
</ul>;
```

Les évènements ne peuvent pas rebondir et l'association n'est pas réactive, car c'est généralement plus coûteux d'attacher/détacher des écouteurs. Vu que les évènements sont naturellement appelés, il n'y a pas besoin de réactivité.

```jsx
// si défini, l'appeler, sinon ne rien faire.
<div onClick={() => props.handleClick?.()} />
```

## `on:___`/`oncapture:___`

Pour tous les autres évènements, comme un évènement avec un nom non conventionnel ou un que vous souhaitez ne pas déléguer, il existe `on` qui va simplement ajouter un écouteur d'évènement.

```jsx
<div on:Weird-Event={(e) => alert(e.detail)} />
```

## `use:___`

Il existe des directives personnalisées. C'est en quelque sorte du sucre syntaxique autour des références pour permettre de facilement attacher plusieurs directives à un même élément. Une directive est simplement une fonction avec la signature suivante :

```ts
function directive(element: Element, accessor: () => any): void;
```

Les fonctions directives sont appelées au moment du rendu, mais avant d'être ajouté au DOM. Vous pouvez faire ce que vous souhaitez à l'intérieur, y compris créer des signaux, effets, programmer des fonctions de nettoyage, etc.

```js
const [name, setName] = createSignal("");

function model(el, value) {
  const [field, setField] = value();
  createRenderEffect(() => (el.value = field()));
  el.addEventListener("input", (e) => setField(e.target.value));
}

<input type="text" use:model={[name, setName]} />;
```

Pour étendre l'espace de noms de JSX dans TypeScript.

```ts
declare module "solid-js" {
  namespace JSX {
    interface Directives {
      model: [() => any, (v: any) => any];
    }
  }
}
```

## `prop:___`

Force la prop à être traitée comme une propriété au lieu d'un attribut.

```jsx
<div prop:scrollTop={props.scrollPos + "px"} />
```

## `attr:___`

Force la prop à être traitée comme un attribut au lieu d'une propriété. C'est utile pour les Web Components où vous voulez associer un attribut.

```jsx
<my-element attr:status={props.status} />
```

## `/* @once */`

Le compilateur de Solid utilise une façon heuristique pour enrober la réactivité et évaluer paresseusement une expression JSX. Est-ce qu'il contient un appel à une fonction, accède à une propriété ou au JSX ? Si oui, nous l'enrobons dans un accesseur quand il est passé à un composant ou un effet s’il est passé à un élément natif.

En sachant ça, nous pouvons réduire la pénalisation effective pour les choses qui ne vont pas changer en y accédant depuis l'extérieur de JSX. Une simple variable ne sera jamais enrobée. Nous pouvons aussi dire au compilateur de ne pas les enrober en commençant une expression avec un commentaire décoratif `/_ @once _/`.

```jsx
<MyComponent static={/*@once*/ state.wontUpdate} />
```

Cela fonctionne aussi sur les enfants.

```jsx
<MyComponent>{/*@once*/ state.wontUpdate}</MyComponent>
```
