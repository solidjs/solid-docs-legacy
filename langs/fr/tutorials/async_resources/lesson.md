Les ressources sont des signaux spéciaux conçus spécifiquement pour gérer un chargement asynchrone. Leur but est d'envelopper les valeurs asynchrones d'une manière qui les rend faciles à interagir avec le modèle d'exécution distribué de Solid. C'est le contraire de `async`/`await` ou des générateurs qui fournissent des modèles d'exécution séquentiels. L'objectif est que l'asynchronisme ne bloque pas l'exécution et ne colore pas notre code.

Les ressources peuvent être pilotées par un signal source qui fournit la requête à une fonction asynchrone de récupération des données (ici `fetchUser`) qui renvoie une promesse (`Promise`). Le contenu de la fonction de récupération de données peut être n'importe quoi. Vous pouvez utiliser des endpoints REST typiques, GraphQL ou tout ce qui peut générer une promesse. Les ressources n'ont pas d'opinion sur le moyen de charger les données, mais seulement sur le fait qu'elles sont gérées par des promesses.

Le signal résultant de la ressource contient également des propriétés réactives `loading` et `error` qui permettent de contrôler facilement notre template en fonction de l'état actuel.

Pour ce faire, nous allons remplacer notre signal `user` par une ressource:
```js
const [user] = createResource(userId, fetchUser);
```
Cette ressource est gérée par le signal `userId` et appelle notre fonction `fetchUser` dès qu'elle change.

La deuxième valeur retournée par la fonction `createResource` contient une méthode `mutate` pour mettre à jour directement le signal interne et une méthode `refetch` pour recharger la requête actuelle même si la source n'a pas changé.

```js
const [user, { mutate, refetch }] = createResource(userId, fetchUser);
```

`lazy` utilise `createResource` en interne pour gérer ses importations dynamiques.
