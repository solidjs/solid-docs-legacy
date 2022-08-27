Dans de nombreuses occasions, vous pouvez vouloir exposer une référence de l'intérieur d'un composant à un parent. Pour ce faire, on utilise toujours l'attribut `ref`. De l'extérieur, l'utilisation de `ref` sur un composant est très similaire à l'utilisation de `ref` sur un élément natif. Vous pouvez lui passer une variable à assigner ou une fonction de rappel.

Cependant, il est de la responsabilité de l'auteur du composant de connecter ce `ref` à un élément interne pour le faire remonter. Pour ce faire, nous utilisons `props.ref`. Il s'agit d'une forme de rappel de `ref` si l'un ou l'autre type de `ref` est donné, mais ce détail vous est le plus souvent caché car vous allez plus que probablement l'assigner directement à l'attribut `ref` de l'un des éléments ou composants dans le JSX de ce composant.

Pour que le logo s'anime à nouveau, nous devons transférer la référence (ref) de `canvas.tsx`:

```jsx
<canvas ref={props.ref} width="256" height="256" />
```
