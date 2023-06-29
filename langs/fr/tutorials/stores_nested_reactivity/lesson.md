L'une des raisons de la réactivité à grain fin de Solid est qu'il peut gérer les mises à jour imbriquées de manière indépendante. Vous pouvez avoir une liste d'utilisateurs et lorsque nous mettons à jour un nom, nous ne mettons à jour qu'un seul emplacement dans le DOM sans modifier la liste elle-même. Très peu de frameworks UI (même réactifs) peuvent faire cela.

Mais comment faire ? Dans cet exemple, nous avons une liste de todos dans un Signal. Afin de marquer un todo comme complet, nous devrions remplacer le todo par un clone. C'est ainsi que la plupart des frameworks fonctionnent, mais c'est un gaspillage car nous réexécutons la liste en la différenciant et nous recréons les éléments DOM comme illustré dans le `console.log`.

```js
const toggleTodo = (id) => {
  setTodos(
    todos().map((todo) => (todo.id !== id ? todo : { ...todo, completed: !todo.completed })),
  );
};
```

Au lieu de cela, dans une bibliothèque à grain fin comme Solid, nous initialisons les données avec des Signaux imbriqués comme ceci:

```js
const addTodo = (text) => {
  const [completed, setCompleted] = createSignal(false);
  setTodos([...todos(), { id: ++todoId, text, completed, setCompleted }]);
};
```

Maintenant nous pouvons mettre à jour l'état d'achèvement en appelant `setCompleted` sans aucune différence supplémentaire. Ceci est dû au fait que nous avons déplacé la complexité vers les données plutôt que vers la vue. Et nous savons exactement comment les données changent.

```js
const toggleTodo = (id) => {
  const todo = todos().find((t) => t.id === id);
  if (todo) todo.setCompleted(!todo.completed())
}
```
Si vous changez les références restantes de `todo.completed` en `todo.completed()`, l'exemple ne devrait maintenant exécuter le `console.log` qu'à la création et non pas lorsque vous basculez un todo.

Cela nécessite bien sûr un mappage manuel et c'était le seul choix qui s'offrait à nous dans le passé. Mais aujourd'hui, grâce aux proxies, nous pouvons faire la plupart de ce travail en arrière-plan sans intervention manuelle. Passez aux tutoriels suivants pour voir comment.
