Certains frameworks associent leurs méthodes de nettoyage aux valeurs de retour de leurs effets secondaires ou de leurs méthodes de cycle de vie. Comme tout ce qui se trouve dans un arbre de rendu Solid vit à l'intérieur d'un effet (éventuellement inerte) et peut être imbriqué, nous avons fait de `onCleanup` une méthode de première classe. Vous pouvez l'appeler à n'importe quel scope et elle s'exécutera lorsque ce scope sera déclenché pour être réévalué et lorsqu'il sera finalement éliminé.

Utilisez-le dans vos composants ou dans vos effets. Utilisez-le dans vos directives personnalisées. Utilisez-le à peu près partout où il fait partie de l'exécution synchrone du système réactif.

L'exemple Signal de l'introduction ne se nettoie pas tout seul. Corrigeons cela en remplaçant l'appel `setInterval` par ceci:

```js
const timer = setInterval(() => setCount(count() + 1), 1000);
onCleanup(() => clearInterval(timer));
```