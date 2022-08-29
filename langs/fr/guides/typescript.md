# TypeScript

Solid est conçu pour être facile à utiliser avec TypeScript:
son utilisation de JSX standard rend le code largement compris par TypeScript,
et il fournit des types intégrés sophistiqués pour son API.
Ce guide présente quelques conseils utiles pour travailler avec TypeScript et
pour typer votre code Solid.

## Configurer TypeScript

Les [templates de démarrage Solid](https://github.com/solidjs/templates/)
offrent de bons points de départ pour
[`tsconfig.json`](https://github.com/solidjs/templates/blob/master/ts/tsconfig.json).

Plus important encore, pour utiliser TypeScript avec le compilateur Solid JSX,
vous devez configurer TypeScript pour laisser les constructions JSX intactes via
[`"jsx": "preserve"`](https://www.typescriptlang.org/tsconfig#jsx),
et indiquer à TypeScript d'où proviennent les types JSX via
[`"jsxImportSource": "solid-js"`](https://www.typescriptlang.org/tsconfig#jsxImportSource).
Ainsi, un `tsconfig.json` minimal ressemblerait à ceci:

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "solid-js"
  }
}
```

Si votre base de code utilise un mélange de types JSX (par exemple, certains fichiers sont en React
tandis que d'autres fichiers sont en Solid), vous pouvez définir la `jsxImportSource` par défaut
dans `tsconfig.json` pour la majorité de votre code, et ensuite
[remplacer l'option `jsxImportSource`](https://www.typescriptlang.org/tsconfig#jsxImportSource)
dans des fichiers `.tsx` spécifiques en utilisant le pragme suivant:

```ts
/** @jsxImportSource solid-js */
```

ou

```ts
/** @jsxImportSource react */
```

## Types de l'API

Solid est écrit en TypeScript, de sorte que tout est typé d'emblée.
La [documentation de l'API](https://www.solidjs.com/docs/latest/api) détaille les
types de tous les appels de l'API, ainsi que plusieurs définitions de types utiles pour faciliter
la référence à des notions de Solid lorsque vous devez spécifier des types explicites.
Ici, nous explorons les types résultants de l'utilisation de quelques primitives de base.

### Signaux

`createSignal<T>` est paramétré par le type `T` de l'objet stocké dans le
Signal. Par exemple:

```ts
const [count, setCount] = createSignal<number>();
```

Le premier `createSignal` a pour type de retour `Signal<number>`, correspondant au type 
que nous lui avons passé. C'est un tuple du getter et du 
setter, qui ont chacun un type générique: 

```ts 
import type { Signal, Accessor, Setter } from 'solid-js';
type Signal<T> = [get: Accessor<T>, set: Setter<T>];
```

Dans ce cas, le Signal getter `count` est de type
`Accessor<number | undefined>`. `Accessor<T>` est une définition de type
fournie par Solid, dans ce cas, elle est équivalente à `() => number | undefined`.
Le `| undefined` est ajouté dans cet exemple parce que nous n'avons pas fourni une
valeur par défaut à `createSignal`, donc la valeur du signal commence effectivement par être
`undefined`.

Le Signal setter `setCount` a le type `Setter<number>`, ce qui est une définition plus
compliquée correspondant approximativement à
`(value?: number | ((prev?: number) => number)) => number`, représentant les
deux possibilités pour l'argument passé: vous pouvez appeler `setCount` avec 
soit un `number`, soit une fonction
qui prend la valeur précédente (s'il y en a une) et retourne un `number`.

Le type `Setter` actuel est plus compliqué, afin de détecter le passage accidentel
d'une fonction au setter, alors que vous auriez pu vouloir définir le signal à cette
valeur de la fonction au lieu d'appeler la fonction pour déterminer la nouvelle valeur.
Si vous obtenez une erreur TypeScript "Argument ... is not assignable to
parameter" lors de l'appel de `setCount(value)`, essayez d'encapsuler l'argument du setter
comme ça `setCount(() => value)` pour vous assurer que `value` n'est pas appelé.

##### Valeurs par défaut

Nous pouvons éviter d'avoir à fournir explicitement le type du Signal lors de l'appel à
`createSignal`, et d'éviter la partie `| undefined` du type, en fournissant
une valeur par défaut à `createSignal`:

```ts
const [count, setCount] = createSignal(0);
const [name, setName] = createSignal('');
```

Dans ce cas, TypeScript déduit que le type des Signaux sont respectivement `number` et `string`.
Ainsi, par exemple, `count` obtient le type `Accessor<number>`
et `name` obtient le type `Accessor<string>` (sans `| undefined`).

### Contexte

Similaire aux Signaux,
[`createContext<T>`](https://www.solidjs.com/docs/latest/api#createcontext)
est paramétrée par le type `T` de la valeur du contexte.
On peut fournir ce type explicitement:

```ts
type Data = {count: number, name: string};
const dataContext = createContext<Data>();
```

Dans ce cas, `dataContext` a le type `Context<Data | undefined>`,
ce qui fait que le type de retour de `useContext(dataContext)` est `Data | undefined`.
La raison de `| undefined` est que le contexte peut ne pas être fourni dans les
ancêtres du composant actuel, auquel cas `useContext` retourne `undefined`.

Si nous fournissons une valeur par défaut à `createContext`, nous évitons la partie `| undefined`
du type, et nous évitons souvent d'avoir à spécifier explicitement
le type du `createContext`:

```ts
const dataContext = createContext({count: 0, name: ''});
```

Dans ce cas, TypeScript déduit que `dataContext` a le type
`Context<{count: number, name: string}>`, ce qui est équivalent à
`Context<Data>` (sans `| undefined`).

Un autre pattern commun est de définir une fonction factory qui produit la
valeur pour un contexte. Ensuite, nous pouvons saisir le type de retour de cette fonction à l'aide de la fonction 
TypeScript [`ReturnType`](https://www.typescriptlang.org/docs/handbook/utility-types.html#returntypetype)
et l'utiliser pour typer le contexte:

```ts
export const makeCountNameContext = (initialCount = 0, initialName = '') => {
  const [count, setCount] = createSignal(initialCount);
  const [name, setName] = createSignal(initialName);
  return [{count, name}, {setCount, setName}] as const;
    // `as const` force la déduction du type de tuple.
};
type CountNameContextType = ReturnType<typeof makeCountNameContext>;
export const CountNameContext = createContext<CountNameContextType>();
export const useCountNameContext = () => useContext(CountNameContext);
```

Dans cet exemple, `CountNameContextType` correspond à la valeur de retour de 
`makeCountNameContext`:
```ts
[
  {readonly count: Accessor<number>, readonly name: Accessor<string>},
  {readonly setCount: Setter<number>, readonly setName: Setter<string>}
]
```

et `useCountNameContext` a le type `() => CountNameContextType | undefined`.

Si vous voulez éviter la possibilité `undefined`, vous pourriez affirmer que le
contexte est toujours fourni lorsqu'il est utilisé:
```ts
export const useCountNameContext = () => useContext(CountNameContext)!;
```

C'est une affirmation dangereuse ; il serait plus sûr de fournir un argument par 
défaut à `createContext` afin que le contexte soit toujours 
défini.

## Types de Composant

```ts
import type { JSX, Component } from 'solid-js';
type Component<P = {}> = (props: P) => JSX.Element;
```

Pour typer une fonction de composant basique, utilisez le type `Component<P>`,
où `P` est le type de l'argument `props` et doit être de type [Object](https://www.typescriptlang.org/docs/handbook/2/objects.html).
Cela permettra de s'assurer que les props correctement typés sont passés en tant qu'attributs,
et que la valeur de retour est quelque chose qui peut être rendu par Solid:
un `JSX.Element` peut être un noeud DOM, un tableau de `JSX.Element`,
une fonction retournant un `JSX.Element`, un booléen, `undefined`/`null`, etc.
Voici quelques exemples:

```tsx
const Counter: Component = () => {
  const [count, setCount] = createSignal(0);
  return (
    <button onClick={() => setCount((c) => c+1)}>
      {count()}
    </button>
  );
};

<Counter/>;              // ok
<Counter initial={5}/>;  // type error: pas de prop `initial`
<Counter>hi</Counter>    // type error: pas de prop `children`

const InitCounter: Component<{initial: number}> = (props) => {
  const [count, setCount] = createSignal(props.initial);
  return (
    <button onClick={() => setCount((c) => c+1)}>
      {count()}
    </button>
  );
};

<InitCounter initial={5}/>;  // ok
```

Si vous voulez que votre composant prenne en charge les enfants JSX, vous pouvez soit explicitement
explicitement un type pour `children` à `P`, ou vous pouvez utiliser le type `ParentComponent`
qui ajoute automatiquement `children?: JSX.Element`. Sinon, si vous souhaitez
déclarer votre composant avec une `function` au lieu de `const`, vous pouvez
utiliser le helper `ParentProps` pour le type `props`. Quelques exemples:

```tsx
import { JSX, ParentComponent, ParentProps } from 'solid-js';
type ParentProps<P = {}> = P & { children?: JSX.Element };
type ParentComponent<P = {}> = Component<ParentProps<P>>;

// Types équivalents:
//const CustomCounter: Component<{children?: JSX.Element}> = ...
//function CustomCounter(props: ParentProps): JSX.Element { ...
const CustomCounter: ParentComponent = (props) => {
  const [count, setCount] = createSignal(0);
  return (
    <button onClick={() => setCount((c) => c+1)}>
      {count()}
      {props.children}
    </button>
  );
};

// Types équivalents:
//const CustomInitCounter: Component<{initial: number, children?: JSX.Element}> = ...
//function CustomInitCounter(props: ParentProps<{initial: number}>): JSX.Element { ...
const CustomInitCounter: ParentComponent<{initial: number}> = (props) => {
  const [count, setCount] = createSignal(props.initial);
  return (
    <button onClick={() => setCount((c) => c+1)}>
      {count()}
      {props.children}
    </button>
  );
};
```

Dans ce dernier exemple, l'argument `props` est automatiquement typé comme suit
`props: ParentProps<{initial: number}>` ce qui est équivalent à
`props: {initial: number, children?: JSX.Element}`.
(Notez qu'avant Solid 1.4, `Component` était équivalent à `ParentComponent`.)

Solid fournit deux autres sous-types de `Component` pour traiter les `children`:

```ts
import {JSX, FlowComponent, FlowProps, VoidComponent, VoidProps} from 'solid-js';
type FlowProps<P = {}, C = JSX.Element> = P & { children: C };
type FlowComponent<P = {}, C = JSX.Element> = Component<FlowProps<P, C>>;
type VoidProps<P = {}> = P & { children?: never };
type VoidComponent<P = {}> = Component<VoidProps<P>>;
```

`VoidComponent` est destiné aux composants qui ne supportent absolument pas `children`.
`VoidComponent<P>` est équivalent à `Component<P>` quand `P` ne fournit pas de type `children`.

`FlowComponent` est destiné aux composants de "control flow" comme les composants
`<Show>` et `<For>` de Solid.  Ces composants ont généralement besoin de `children` pour avoir un
sens, et ont parfois des types spécifiques pour `children`, tels que l'exigence
d'être une fonction unique. Par exemple:

```tsx
const CallMeMaybe: FlowComponent<{when: boolean}, () => void> = (props) => {
  createEffect(() => {
    if (props.when)
      props.children();
  });
  return <>{props.when ? 'Calling' : 'Not Calling'}</>;
};

<CallMeMaybe when={true}/>;  // type error: `children` est manquant
<CallMeMaybe when={true}>hi</CallMeMaybe>;  // type error: `children` n'est pas une fonction
<CallMeMaybe when={true}>
  {() => console.log("Here's my number")}
</CallMeMaybe>;              // ok
```

## Gestionnaires d'événements

Le namespace `JSX` offre une suite de types utiles pour travailler avec le DOM HTML
en particulier. Voir la
[définition de JSX dans `dom-expressions`](https://github.com/ryansolid/dom-expressions/blob/main/packages/dom-expressions/src/jsx.d.ts)
pour tous les types fournis.

Un type utile fourni par le namespace `JSX` est
`JSX.EventHandler<T, E>`,
qui représente un gestionnaire d'événement à argument unique pour un élément DOM de type `T` et un événement de type `E`.
Vous pouvez l'utiliser pour typer tous les gestionnaires d'événements que vous définissez en dehors de JSX.
Par exemple:

```tsx
import type { JSX } from 'solid-js';
const onInput: JSX.EventHandler<HTMLInputElement, InputEvent> = (event) => {
  console.log('input changé en', event.currentTarget.value);
};

<input onInput={onInput}/>
```

Les handlers définis en ligne dans les
[attributs JSX `on___`](https://www.solidjs.com/docs/latest/api#on___)
(avec des types d'événements intégrés) sont automatiquement typés comme le type approprié de
`JSX.EventHandler` approprié:

```tsx
<input onInput={(event) => {
  console.log('input changé en', event.currentTarget.value);
}}/>;
```

Notez que `JSX.EventHandler<T>` contraint
[l'attribut `currentTarget`](https://developer.mozilla.org/fr/docs/Web/API/Event/currentTarget)
de l'événement soit de type `T` (dans l'exemple, `event.currentTarget` est de type
`HTMLInputEvent`, et possède donc l'attribut `value`). Cependant,
[l'attribut `target`](https://developer.mozilla.org/fr/docs/Web/API/Event/target) de l'événement
pourrait être n'importe quel `DOMElement`.
En effet, `currentTarget` est l'élément auquel le gestionnaire d'événement était attaché,
et dont le type est donc connu, alors que `target` est
l'élément avec lequel l'utilisateur a interagi et qui a provoqué l'événement à être
capturé par le gestionnaire d'événements, ce qui peut être n'importe quel élément du DOM.

## L'attribut `ref`

Lorsque nous utilisons l'attribut `ref` avec une variable, nous indiquons à Solid d'assigner
l'élément du DOM à 
la variable une fois que l'élément est rendu. Sans TypeScript, cela ressemble à:

```jsx
let divRef;

console.log(divRef); // undefined

onMount(() => {
  console.log(divRef); // <div> element
})

return (
  <div ref={divRef}/>
)
```

Cela présente un défi pour le typage de cette variable: doit-on typer `divRef` 
comme un `HTMLDivElement`, même s'il n'est défini comme tel qu'après le rendu ?
(Nous supposons ici que le mode `strictNullChecks` de TypeScript est activé ;
sinon, TypeScript ignore les variables potentiellement `undefined`.)

Le pattern le plus sûr en TypeScript est de reconnaître que `divRef` est `undefined` (non défini)
pour une période de temps, et de le vérifier quand on l'utilise:

```tsx
let divRef: HTMLDivElement | undefined;

divRef.focus();  // correctement reporté comme une erreur au moment de la compilation

onMount(() => {
  if (!divRef) return;
  divRef.focus();  // correctement autorisé
});

return (
  <div ref={divRef!}>
    ...
  </div>
);
```

Alternativement, puisque nous savons que `onMount` n'est appelé qu'après le rendu de l'élément `<div>`
a été rendu, nous pourrions utiliser une
[assertion non nulle (`!`)](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#non-null-assertion-operator-postfix-)
lors de l'accès à `divRef` dans `onMount`:

```tsx
onMount(() => {
  divRef!.focus();
});
```

Un autre modèle assez sûr consiste à omettre `undefined` du type de `divRef`,
et d'utiliser une
[assertion d'affectation définie (`!`)](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-7.html#definite-assignment-assertions)
dans l'attribut `ref`:

```tsx
let divRef: HTMLDivElement;

divRef.focus();  // correctement reporté comme une erreur au moment de la compilation

onMount(() => {
  divRef.focus();  // correctement autorisé
});

return (
  <div ref={divRef!}>
    ...
  </div>
);
```

Nous devons utiliser `ref={divRef!}` car TypeScript suppose que l'attribut `ref`
est défini sur la variable `divRef`, et donc que `divRef` devrait être
être déjà assigné. Dans Solid, c'est l'inverse: `divRef` est
assigné par l'attribut `ref`.  L'assertion d'affectation définitive
`divRef!` convainc efficacement TypeScript que c'est ce qui se passe:
TypeScript comprendra que `divRef` a été assigné après cette ligne.

Avec ce pattern, TypeScript signalera correctement toute utilisation accidentelle de
Refs dans le corps de la fonction (avant le bloc JSX où ils sont définis).
Cependant, TypeScript ne signale pas actuellement l'utilisation de variables potentiellement
indéfinies à l'intérieur de fonctions imbriquées. Dans le contexte de Solid,
vous devez faire attention à ne pas utiliser de Refs dans `createMemo`, `createRenderEffect`,
et `createComputed` (avant le bloc JSX qui définit les refs),
car ces fonctions sont appelées immédiatement,
donc les Refs ne seront pas encore définis (pourtant TypeScript ne signalera pas cela comme une erreur).
En revanche, le pattern précédent permet de détecter ces erreurs.

Un autre pattern courant, mais moins sûr, consiste à placer l'assertion d'affectation définitive au moment de la déclaration de la variable.

```tsx
let divRef!: HTMLDivElement;

divRef.focus();  // autorisé malgré une erreur

onMount(() => {
  divRef.focus();  // correctement autorisé
});

return (
  <div ref={divRef}>
    ...
  </div>
);
```

Cette approche désactive effectivement la vérification des affectations pour cette variable,
ce qui est une solution de contournement facile, mais nécessite une attention supplémentaire.
En particulier, contrairement au pattern précédent, elle permet de manière incorrecte une utilisation
prématurée de la variable, même en dehors des fonctions imbriquées.

## Réduction du Control Flow

Un pattern commun est d'utiliser
[`<Show>`](https://www.solidjs.com/docs/latest/api#%3Cshow%3E)
pour afficher des données uniquement lorsque celles-ci sont définies:

```tsx
const [name, setName] = createSignal<string>();

return (
  <Show when={name()}>
    Bienvenue {name().replace(/\s+/g, '\xa0')}!
  </Show>
);
```

Dans ce cas, TypeScript ne peut pas déterminer que les deux appels à `name()` retourneront la même valeur et que le second appel ne se produira que si le premier appel a retourné une valeur véridique.
Ainsi, il se plaindra que `name()` pourrait être `undefined` quand il essaiera d'appeler `.replace()`.

Voici deux solutions à ce problème:

1. Vous pouvez affirmer manuellement que `name()` sera non-nul lors du second appel
   en utilisant l'[opérateur d'assertion non nul `!`](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#non-null-assertion-operator-postfix-) de TypeScript:

   ```tsx
   return (
     <Show when={name()}>
       Bienvenue {name()!.replace(/\s+/g, '\xa0')}!
     </Show>
   );
   ```

2. Vous pouvez utiliser la forme avec un callback de `<Show>`,
   qui transmet la valeur de `when` lorsqu'elle est véridique:

   ```tsx
   return (
     <Show when={name()}>
       {(n) =>
         <>Bienvenue {n.replace(/\s+/g, '\xa0')}!</>
       }
     </Show>
   );
   ```

   Dans ce cas, le typage du composant `Show` est assez intelligent pour dire à TypeScript que `n` est véridique,
   et qu'il ne peut donc pas être `undefined` (ou `null` ou
   `false`).

   Notez, cependant, que cette forme de `<Show>` force l'intégralité des 
   enfants à être rendu à chaque fois que `name()` change, au lieu de ne le faire que lorsque `name()`
   passe d'une valeur fausse à une valeur vraie.
   Cela signifie que les enfants ne bénéficient pas de tous les avantages de la réactivité
   (réutilisation des parties inchangées et mise à jour de ce qui a changé).

## Attributs JSX Spéciaux et Directives

### `on:___`/`oncapture:___`

Si vous utilisez des gestionnaires d'événements personnalisés via
[les attributs `on:___`/`oncapture:___`](https://www.solidjs.com/docs/latest/api#on%3A___%2Foncapture%3A___) de Solid,
vous devez définir des types correspondants pour les objets `Event` résultants
en surchargeant les interfaces `CustomEvents` et `CustomCaptureEvents`.
dans le namespace `JSX` du module `"solid-js"`, comme suit:

```tsx
class NameEvent extends CustomEvent {
  type: 'Name';
  detail: {name: string};

  constructor(name: string) {
    super('Name', {detail: {name}});
  }
}

declare module "solid-js" {
  namespace JSX {
    interface CustomEvents { // on:Name
      "Name": NameEvent;
    }
    interface CustomCaptureEvents { // oncapture:Name
      "Name": NameEvent;
    }
  }
}

<div on:Name={(event) => console.log('le nom est', event.detail.name)}/>
```

### `prop:___`/`attr:___`

Si vous utilisez des propriétés forcées via
l'[attribut `prop:___`](https://www.solidjs.com/docs/latest/api#prop%3A___) de Solid,
ou des attributs personnalisés via
l'[attribut `attr:___`](https://www.solidjs.com/docs/latest/api#attr%3A___) de Solid,
vous pouvez définir leurs types dans les interfaces `ExplicitProperties` et
`ExplicitAttributes`, respectivement:

```tsx
declare module "solid-js" {
  namespace JSX {
    interface ExplicitProperties { // prop:___
      count: number;
      name: string;
    }
    interface ExplicitAttributes { // attr:___
      count: number;
      name: string;
    }
  }
}

<Input prop:name={name()} prop:count={count()}/>
<mon-web-component attr:name={name()} attr:count={count()}/>
```

### `use:___`

Si vous définissez des Directives personnalisées pour les
[attributs `use:___`](https://www.solidjs.com/docs/latest/api#use%3A___) de Solid,
vous pouvez les typer dans l'interface `Directives`, comme ceci:

```tsx
function model(element: HTMLInputElement, value: Accessor<Signal<string>>) {
  const [field, setField] = value();
  createRenderEffect(() => (element.value = field()));
  element.addEventListener("input", (e) => setField(e.target.value));
}

declare module "solid-js" {
  namespace JSX {
    interface Directives {  // use:model
      model: Signal<string>;
    }
  }
}

let [name, setName] = createSignal('');

<input type="text" use:model={[name, setName]} />;
```

Si vous `importez` une Directive `d` d'un autre module, et que `d` est utilisé uniquement
comme une Directive `use:d`, alors TypeScript (ou plus précisément,
[`babel-preset-typescript`](https://babeljs.io/docs/en/babel-preset-typescript))
supprimera par défaut le `import` de `d` (par crainte que `d` soit un type,
car TypeScript ne comprend pas `use:d` comme une référence à `d`).
Il y a deux façons de résoudre ce problème:
   
1. Utilisez
   l'option de configuration [`onlyRemoveTypeImports: true` de `babel-preset-typescript`](https://babeljs.io/docs/en/babel-preset-typescript#onlyremovetypeimports)
   qui l'empêche de supprimer tout `import`s sauf `import type ...`.
   Si vous utilisez `vite-plugin-solid`, vous pouvez spécifier cette option via
   `solidPlugin({ typescript: { onlyRemoveTypeImports: true } })`
   dans le fichier `vite.config.ts`.

   Notez que cette option peut être problématique si vous n'utilisez pas de manière vigilante les fonctions
   `export type` et `import type` dans votre codebase.

2. Ajoutez un faux accès comme `false && d;` à chaque module `import`ant la directive `d`.
   Cela empêchera TypeScript de supprimer l'import de `d`, et de supposer que vous êtes en train de secouer l'arborescence via par exemple [Terser](https://terser.org/),
   ce code sera omis de votre bundle de code final.

   Le faux accès plus simple `d;` empêchera également le `import` d'être
   supprimé, mais ne sera généralement pas retiré de l'arbre, et finira donc dans
   votre bundle de code final.
