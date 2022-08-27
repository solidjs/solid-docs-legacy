Le composant `<For>` est le meilleur moyen de boucler sur un tableau d'objets. Lorsque le tableau change, `<For>` met à jour ou déplace les éléments dans le DOM plutôt que de les recréer. Prenons un exemple. 

```jsx
<For each={cats()}>{(cat, i) =>
  <li>
    <a target="_blank" href={`https://www.youtube.com/watch?v=${cat.id}`}>
      {i() + 1}: {cat.name}
    </a>
  </li>
}</For>
```

Il y a une propriété sur le composant `<For>`: `each`, où vous passez le tableau à boucler.

Ensuite, au lieu d'écrire des nœuds directement entre `<For>` et `</For>`, vous passez un _callback_. Il s'agit d'une fonction similaire au [callback de `map`] de JavaScript (https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/map#parameters). Pour chaque élément du tableau, le callback est appelé avec l'élément comme premier argument et l'index comme second. (`cat` et `i` dans cet exemple.) Vous pouvez ensuite les utiliser dans le callback, qui devrait retourner un noeud à rendre.

Notez que l'index est un _Signal_, pas un nombre constant. C'est parce que `<For>` est "codé par référence" ("keyed by reference"): chaque noeud qu'il rend est couplé à un élément dans le tableau. En d'autres termes, si un élément change de place dans le tableau, plutôt que d'être détruit et recréé, le noeud correspondant se déplacera aussi et son index changera.

La propriété `each` attend un tableau, mais vous pouvez transformer d'autres objets itérables en tableaux avec des utilitaires comme [`Array.from`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/from), [`Object.keys`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Object/keys), ou la [`syntaxe de décomposition`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Operators/Spread_syntax).
