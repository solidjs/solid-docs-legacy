La plupart du temps, composer des Signaux dérivés suffit. Cependant, il est parfois avantageux de mettre les valeurs en cache afin de réduire le travail en double. Nous pouvons utiliser des mémos pour évaluer une fonction et stocker le résultat jusqu'à ce que ses dépendances changent. C'est idéal pour mettre en cache les calculs pour les effets qui ont d'autres dépendances et atténuer le travail requis pour les opérations coûteuses comme la création de nœuds DOM.

Les mémos sont à la fois un observateur, comme un effet, et un Signal en lecture seule. Puisqu'ils connaissent à la fois leurs dépendances et leurs observateurs, ils peuvent s'assurer qu'ils ne s'exécutent qu'une seule fois pour tout changement. Cela les rend préférables aux effets d'enregistrement qui écrivent sur les Signaux. Généralement, ce qui peut être dérivé doit être dérivé.

Créer un mémo est aussi simple que de passer une fonction à `createMemo`, importée de `solid-js`. Dans cet exemple, le recalcul de la valeur devient de plus en plus coûteux à chaque clic. Si nous l'enveloppons dans `createMemo`, il ne recalcule qu'une seule fois par clic:

```jsx
const fib = createMemo(() => fibonacci(count()));
```
Placez un `console.log` dans la fonction `fib` pour confirmer la fréquence d'exécution:
```jsx
const fib = createMemo(() => {
  console.log("Calcul de la fonction Fibonacci");
  return fibonacci(count());
});
```
