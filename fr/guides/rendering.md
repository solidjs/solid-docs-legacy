---
title: Rendu
description: Discussion entre les différentes options de template et de rendu avec Solid
sort: 2
---

# Rendu

Solid supporte 3 formes de template JSX, Tagged Template Literals et sa propre variation de HyperScript, même si JSX est la forme prédominante. Pourquoi ? JSX est un super DSL fait pour la compilation. Il possède une syntaxe claire, supporte TypeScript, fonctionne avec Babel et supporte d'autres outils comme le Surlignage Syntaxique et Prettier. Il est pragmatique d'utiliser un outil qui vous donne tout cela inclus. En tant que solution compilée, il offre une expérience développeur géniale. Pourquoi s'embêter avec une syntaxe DSL personnalisée quand vous pouvez en utiliser une qui est déjà supportée à grande échelle ?

## Compilation de JSX

Le rendu implique une précompilation de template JSX en code JS natif optimisé. Le code JSX produit :

- Le template des éléments DOM qui sont clonés pour chaque instanciation
- Une série de déclarations de référence utilisée seulement pour firstChild et nextSibling
- Un calcul précis des mises à jour des éléments créées

Cette approche est plus performante et produit moins de code que la création de chaque élément, un par un, avec `document.createElement`.

## Attributs et Props

Solid essaye de refléter les conventions HTML autant que possible en incluant des noms d'attributs insensibles aux majuscules et minuscules.

La majorité des attributs sur les éléments JSX natifs sont les mêmes que ceux du DOM. Les valeurs statiques sont incluses directement dans le template qui est cloné. Il y a un quelques exceptions comme `class`, `style`, `value`, `innerHTML` qui fournissent des fonctionnalités supplémentaires.

Cependant, les éléments personnalisés (à l'exception des éléments natifs) vont utiliser par défaut les propriétés dynamiques. Cela permet de gérer des types de données plus complexes. On utilise la convention camelCase au lieu du standard snake-case pour les attributs, `some-attr` deviens `someAttr`.

Il est aussi possible de contrôler le comportement directement avec un espace de noms de directives. Vous pouvez forcer un attribut `attr:` ou forcer une prop `prop:`

```jsx
<my-element prop:UniqACC={state.value} attr:title={state.title} />
```

> **Note :** Les attributs statiques sont créés en tant que template HTML qui sont clonés. Les expressions fixe et dynamique sont appliquées après dans le l'ordre JSX associé. Bien que cela soit correct, pour la plupart des éléments du DOM, il y en a certain, comme les champs de saisis avec `type='range'`, où l'ordre est important. Garder cela en tête pendant l'association d'élément.

## Point d'entrée

La manière la plus simple de monter Solid est d'importer `render` depuis le module `solid-js/web`. `render` prends une fonction en tant que premier argument et l'élément englobant pour le second argument et retourne une méthode de destruction. Pour de meilleure performance, utiliser un élément sans enfant.

```jsx
import { render } from "solid-js/web";

render(() => <App />, document.getElementById("main"));
```

> **Important** Le premier argument a besoin d'être une fonction. Autrement, nous ne pouvons pas surveiller les propriétés et activer le système de réactivité. Ce simple oubli va faire que vos Effets ne vont pas s'exécuter.

## Composants

Les Composants dans Solid sont des fonctions en PascalCase (Majuscule). Leur premier argument est un objet props et ils doivent retourner des nœuds de DOM.

```jsx
const Parent = () => (
  <section>
    <Label greeting="Hello">
      <div>John</div>
    </Label>
  </section>
);

const Label = (props) => (
  <>
    <div>{props.greeting}</div>
    {props.children}
  </>
);
```

Comme chaque nœud JSX est en réalité un nœud DOM, la seule responsabilité des Composants de haut niveau est de les ajouter dans le DOM.

## Props

Comme React, Vue, Angular et d'autres frameworks, Solid permet de définir des propriétés dans vos composants pour passer des données aux composants enfants. Ci-dessous, un parent passe une chaîne de caractère "Bonjour" au composant `Label` via une propriété `greeting`

```jsx
const Parent = () => (
  <section>
    <Label greeting="Bonjour">
      <div>John</div>
    </Label>
  </section>
);
```

Dans l'exemple au-dessus, la valeur attribuée à `greeting` est statique, mais nous pouvons aussi utilisé des valeurs dynamiques. Par exemple :

```jsx
const Parent = () => {
  const [greeting, setGreeting] = createSignal("Bonjour");

  return (
    <section>
      <Label greeting={greeting()}>
        <div>John</div>
      </Label>
    </section>
  );
};
```

Les Composants ont accès aux propriétés qui leur sont données via l'argument `props`.

```jsx
const Label = (props) => (
  <>
    <div>{props.greeting}</div>
    {props.children}
  </>
);
```

À la différence des autres frameworks, vous ne pouvez pas utiliser la déstructuration d'objet sur les `props` d'un composant. Cela est dû au fait que l'objet `props`, en coulisse, va s'appuyer sur les Object getters pour paresseusement récupérer des valeurs. Utiliser la déstructuration d'objet casse la réactivité des `props`.

Cet exemple montre la "bonne" manière d'accéder aux props dans Solid:

```jsx
// Ici, `props.name` va se mettre à jour comme prévu
const MyComponent = (props) => <div>{props.name}</div>;
```

Cet exemple montre la mauvaise manière d'accéder aux props dans Solid :

```jsx
// Cela n'est pas bon
// Ici, `props.name` ne va pas se mettre à jour (n'est pas réactif) à cause de la déstructuration de `name`
const MyComponent = ({ name }) => <div>{name}</div>;
```

Même si l'objet `props` ressemble à un objet normal (et les utilisateurs de Typescript noteront que le typage est similaire à un objet normal), quand il est utilisé, il est en réalité réactif - en quelque sorte similaire aux Signaux. Cela a quelques implications.

Contrairement aux autres frameworks JSX, les fonctions Composants de Solid sont seulement exécutées une fois (plutôt qu'à chaque cycle de rendu), l'exemple ci-dessous ne va pas fonctionner comme prévu.

```jsx
import { createSignal } from "solid-js";

const BasicComponent = (props) => {
  const value = props.value || "default";

  return <div>{value}</div>;
};

export default function Form() {
  const [value, setValue] = createSignal("");

  return (
    <div>
      <BasicComponent value={value()} />
      <input type="text" oninput={(e) => setValue(e.currentTarget.value)} />
    </div>
  );
}
```

Dans cet exemple, nous voulons probablement que le `BasicComponent` affiche la valeur actuelle saisie dans l'`input`. Mais, comme dit plus tôt, la fonction `BasicComponent` ne va s'exécuter qu'une seule fois quand le composant est initialement créé. À ce moment-là (à la création), `props.value` aura une valeur `''`. Cela veut dire que `const value` dans `BasicComponent` va être affecté `'default'` et ne jamais se mettre à jour. Pendant ce temps, l'objet `props` peut changer, accéder à props dans `const value = props.value || 'default';` est hors du champ observable de Solid, donc il ne se réévalue pas automatique quand l'objet props change.

Alors comment règle-t-on ce problème ?

Et bien, en général, nous voulons accéder à `props` quelque part où Solid peut l'observer. En général, cela veut dire à l'intérieur de JSX ou à l'intérieur d'une fonction `createMemo`, `createEffect` ou thunk(`() => ...`). Ci-dessous une solution qui marche comme prévu :

```jsx
const BasicComponent = (props) => {
  return <div>{props.value || "default"}</div>;
};
```

Ceci est un équivalent et peut être mis dans une fonction

```jsx
const BasicComponent = (props) => {
  const value = () => props.value || "default";

  return <div>{value()}</div>;
};
```

Une autre option, lorsque le calcul est coûteux, est d'utiliser `createMemo`. Par exemple :

```jsx
const BasicComponent = (props) => {
  const value = createMemo(() => props.value || "default");

  return <div>{value()}</div>;
};
```

Ou d'utiliser la fonction d'aide :

```jsx
const BasicComponent = (props) => {
  props = mergeProps({ value: "default" }, props);

  return <div>{props.value}</div>;
};
```

Souvenez-vous, l'exemple ci-dessous ne fonctionne _pas_ :

```jsx
// mauvais
const BasicComponent = (props) => {
  const { value: valueProp } = props;
  const value = createMemo(() => valueProp || "default");
  return <div>{value()}</div>;
};

// mauvais
const BasicComponent = (props) => {
  const valueProp = prop.value;
  const value = createMemo(() => valueProp || "default");
  return <div>{value()}</div>;
};
```

Les Composants en Solid sont une partie essentielle à ses performances. L'approche de "Disparition" des Composants de Solid est possible grâce à l'évaluation paresseuse des props. Au lieu d'évaluer les expressions props immédiatement et de passer en valeurs, l'exécution est reportée jusqu'à ce que la prop est accédée par son enfant. En faisant ça, nous reportons l'exécution jusqu'au dernier moment, typiquement au moment de l'association avec le DOM, ce qui maximise les performances. Cela permet d'aplatir la hiérarchie et de retirer le besoin de maintenir un arbre de Composants.

```jsx
<Component prop1="static" prop2={state.dynamic} />;

// Compile à peu près en

// Nous surveillons le contenu du composant pour l'isoler et éviter des mises à jour coûteuse
untrack(() =>
  Component({
    prop1: "static",
    // expression dynamique, donc nous enrobons dans un function d'accès
    get prop2() {
      return state.dynamic;
    },
  })
);
```

Pour aider à maintenir la réactivité, Solid fournit quelque fonction d'aide pour les props:

```jsx
// props par défaut
props = mergeProps({ name: "Smith" }, props);

// clone les props
const newProps = mergeProps(props);

// fusionne les props
props = mergeProps(props, otherProps);

// Sépare les props en plusieurs objet
const [local, others] = splitProps(props, ["className"])
<div {...others} className={cx(local.className, theme.component)} />
```

## Enfants

Solid gère les enfants JSX comme React. Un enfant unique est une valeur unique dans `props.children` et plusieurs enfants sont géré comme un tableau de valeur. Normalement, vous les passez par la vue JSX. Cependant, si vous voulez interagir avec eux, la méthode suggérée est d'utiliser la fonction d'aide `children` qui va résoudre tous les contrôles de flux en aval et retourner un Mémo.

```jsx
// enfant unique
const Label = (props) => <div class="label">Hi, { props.children }</div>

<Label><span>Josie</span></Label>

// plusieurs enfants
const List = (props) => <div>{props.children}</div>;

<List>
  <div>First</div>
  {state.expression}
  <Label>Judith</Label>
</List>

// itération sur chaque enfant
const List = (props) => <ul>
  <For each={props.children}>{item => <li>{item}</li>}</For>
</ul>;

// modification et itération en utilisant la fonction d'aide
const List = (props) => {
  // la fonction d'aide "children" mémorise la valeur et resouds toutes les dépendances réactives intermédiaires
  const memo = children(() => props.children);
  createEffect(() => {
    const children = memo();
    children.forEach((c) => c.classList.add("list-child"))
  })
  return <ul>
    <For each={memo()}>{item => <li>{item}</li>}</For>
  </ul>;
```

**Important:** Le traitement des balises enfants dans Solid sont des expressions coûteuses et sont englobé de la même manière que des expressions réactives dynamiques. Cela veut dire qu'ils sont évalués paresseusement sur l'accès de `prop`. Soyez prudent quand vous accédez y accéder plusieurs fois ou déstructurer avant l'endroit où vous voulez l'utiliser dans la vue. Cela est dû au fait que Solid n'a pas le luxe de se créer un des nœuds de DOM Virtuel en avance et de trouver les différences, donc la résolution de ces `props` doit être faite quand nécessaire et de manière délibérée. Utilisez la fonction d'aide `children` si vous souhaitez le faire afin de les mémoriser.
