Solid recommande fortement l'utilisation de modèles immuables peu profonds pour la mise à jour de l'état. En séparant les lectures et les écritures, nous gardons un meilleur contrôle sur la réactivité de notre système sans risquer de perdre la trace des changements apportés à notre proxy lorsqu'il passe par des couches de composants. Ce risque est beaucoup plus important avec les Stores qu'avec les Signals.

Parfois, cependant, il est plus facile de raisonner sur la mutation. C'est pourquoi Solid fournit un modificateur de Store `produce` inspiré d'Immer qui vous permet de muter une version proxy inscriptible de votre objet Store dans vos appels `setStore`.

C'est un outil agréable à avoir pour permettre de petites zones de mutation sans renoncer au contrôle. Utilisons `produce` sur notre exemple de Todos en remplaçant notre code de gestionnaire d'événement par:

```jsx
const addTodo = (text) => {
  setTodos(
    produce((todos) => {
      todos.push({ id: ++todoId, text, completed: false });
    })
  );
};
const toggleTodo = (id) => {
  setTodos(
    (todo) => todo.id === id,
    produce((todo) => (todo.completed = !todo.completed))
  );
};
```

Alors que `produce` avec les Stores gère probablement la grande majorité des cas, Solid a aussi un objet Store mutable qui est disponible à partir de `createMutable`. Bien que cette approche ne soit pas recommandée pour les API internes, elle est parfois utile pour l'interopérabilité ou la compatibilité avec des systèmes tiers.
