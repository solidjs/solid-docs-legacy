Vous savez maintenant comment rendre des listes dans Solid avec `<For>`, mais Solid fournit également le composant `<Index>`, qui entraînera moins de rendus dans certaines situations.

Lorsque le tableau est mis à jour, le composant `<For>` utilise l'égalité référentielle pour comparer les éléments au dernier état du tableau. Mais ce n'est pas toujours souhaité.

En JavaScript, les primitives (comme les chaînes de caractère et les nombres) sont toujours comparées par valeur. Lors de l'utilisation de `<For>` avec des valeurs primitives ou des tableaux de tableaux, nous pourrions causer beaucoup de rendu inutile. Si nous utilisions `<For>` pour mapper une liste de chaînes sur des champs `<input>` pouvant être modifiés chacun, chaque modification de cette valeur entraînerait la recréation de `<input>`.

Le composant `<Index>` est fourni pour ces cas. En règle générale, lorsque vous travaillez avec des primitives, utilisez `<Index>`.

```jsx
<Index each={cats()}>{(cat, i) =>
  <li>
    <a target="_blank" href={`https://www.youtube.com/watch?v=${cat().id}`}>
      {i + 1}: {cat().name}
    </a>
  </li>
}</Index>
```

Il a une signature similaire à `<For>`, sauf que cette fois l'item est le Signal et que l'index est fixe. Chaque nœud rendu correspond à un point dans le tableau. Chaque fois que les données de cet endroit changent, le Signal est mis à jour.

`<For>` se soucie de chaque élément de données de votre tableau, et la position de ces données peut changer ; `<Index>` se soucie de chaque index de votre tableau, et le contenu de chaque index peut changer.