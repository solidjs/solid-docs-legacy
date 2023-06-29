Pour plus de commodité, Solid dispose d'un helper `on` qui permet de définir des dépendances explicites pour nos calculs. Ceci est principalement utilisé comme un moyen laconique d'être encore plus explicite sur les Signaux qui sont suivis (et de ne suivre aucun autre signal, même s'ils sont lus). De plus, `on` fournit une option `defer` qui permet au calcul de ne pas s'exécuter immédiatement et de ne s'exécuter qu'au premier changement.

Laissons notre effet s'exécuter uniquement lorsque `a` est mis à jour et différons l'exécution jusqu'à ce que la valeur change:
```js
createEffect(on(a, (a) => {
  console.log(a, b());
}, { defer: true }));
```
