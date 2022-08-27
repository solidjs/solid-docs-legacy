Les _Signaux_ sont le pillier de la réactivité dans Solid. Ils contiennent des valeurs qui changent avec le temps ; lorsque vous modifiez la valeur d'un Signal, il met automatiquement à jour tout ce qui l'utilise.

Pour créer un Signal, importons `createSignal` à partir de `solid-js` et appelons-le à partir de notre composant `Counter` comme ceci:
```jsx
const [count, setCount] = createSignal(0);
```

L'argument passé à l'appel de création est la valeur initiale et la valeur de retour est un tableau avec deux fonctions, un getter et un setter. En [déstructurant](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment), nous pouvons nommer ces fonctions comme bon nous semble. Dans ce cas, nous nommons le getter `count` et le setter `setCount`.

Il est important de noter que la première valeur renvoyée est un getter (une fonction renvoyant la valeur actuelle) et non la valeur elle-même. En effet, le framework doit garder une trace de l'endroit où ce signal est lu afin de pouvoir mettre à jour les choses en conséquence.

Dans cette leçon, nous utiliserons la fonction `setInterval` de JavaScript pour créer un compteur qui s'incrémente périodiquement. Nous pouvons mettre à jour notre signal `count` chaque seconde en ajoutant ce code à notre composant `Counter`:
```jsx
setInterval(() => setCount(count() + 1), 1000);
```

À chaque tick, nous lisons le décompte (valeur de `count`) précédent, ajoutons 1 et définissons la nouvelle valeur.

> Les Signaux de Solid acceptent également une forme de fonction où vous pouvez utiliser la valeur précédente pour définir la valeur suivante.
> ```jsx
> setCount(c => c + 1);
> ```

Enfin, nous devons lire le Signal dans notre code JSX:
```jsx
return <div>Count: {count()}</div>;
```
