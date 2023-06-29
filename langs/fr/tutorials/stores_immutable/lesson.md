Les Stores sont le plus souvent créés dans Solid à l'aide des proxies Store de Solid. Parfois, nous souhaitons nous interfacer avec des bibliothèques immuables telles que Redux, Apollo ou XState et devons effectuer des mises à jour granulaires par rapport à celles-ci.

Dans cet exemple, nous avons un wrapper de base autour de Redux. Vous pouvez voir l'implémentation dans `useRedux.tsx`. La définition du Store et les actions se trouvent dans les fichiers restants.

Le comportement de base est que nous avons créé un objet Store et que nous nous sommes abonnés au store Redux pour mettre à jour l'état lors de la mise à jour.

```js
const [state, setState] = createStore(store.getState());
const unsubscribe = store.subscribe(
  () => setState(store.getState())
);
```
Si vous cliquez à des endroits dans la démo en ajoutant des éléments et en les cochant, cela semble fonctionner plutôt bien. Cependant, ce qui n'est pas évident, c'est que le rendu est inefficace. Notez le `console.log` non seulement lors de la création, mais chaque fois que vous cochez la case.

La raison en est que Solid ne diffère pas par défaut. Il suppose que le nouvel élément est nouveau et le remplace. Si vos données changent de manière granulaire, vous n'avez pas besoin de différencier. Et si vous le faisiez ?

Solid fournit une méthode de différenciation `reconcile` qui améliore l'appel `setStore` et nous permet de différencier les données de ces sources immuables, en notifiant uniquement les mises à jour granulaires.

Changeons le code en:
```js
const [state, setState] = createStore(store.getState());
const unsubscribe = store.subscribe(
  () => setState(reconcile(store.getState()))
);
```
Maintenant, l'exemple fonctionne comme prévu, en n'exécutant que le code de création lors de la création.

Ce n'est pas la seule façon de résoudre ce problème et vous avez vu que certains frameworks ont une propriété `key` sur leurs flux de boucle de modèle. Le problème est qu'en faisant de cela une partie par défaut de la modélisation, vous devez toujours exécuter la réconciliation de la liste et toujours comparer tous les enfants pour les modifications potentielles, même dans les frameworks compilés. Une approche centrée sur les données rend non seulement cela applicable en dehors de la modélisation, mais le rend facultatif. Lorsque vous considérez que la gestion de l'état interne n'en a pas besoin, cela signifie que nous avons par défaut les meilleures performances.

Bien sûr, il n'y a aucun problème à utiliser `reconcile` quand vous en avez besoin. Parfois, un simple réducteur constitue un excellent moyen d'organiser les mises à jour des données. `reconcile` brille ici, créant votre propre primitive `useReducer`:

```js
const useReducer = (reducer, state) => {
  const [store, setStore] = createStore(state);
  const dispatch = (action) => {
    state = reducer(state, action);
    setStore(reconcile(state));
  }
  return [store, dispatch];
};
```

Le comportement de `reconcile` est configurable. Une clé (`key`) personnalisée peut être définie et il existe une option `merge` qui ignore le clonage structurel et ne différencie que les parties.
