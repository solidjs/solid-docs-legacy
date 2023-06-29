Les Stores sont la réponse de Solid à la réactivité imbriquée. Ce sont des objets proxy dont les propriétés peuvent être suivies et peuvent contenir d'autres objets qui sont automatiquement enveloppés dans des proxies eux-mêmes, et ainsi de suite.

Pour garder les choses légères, Solid crée des Signaux sous-jacents uniquement pour les propriétés accessibles dans les étendues de portée. Et ainsi, tous les Signaux dans les Stores sont créés paresseusement comme demandé.

L'appel `createStore` prend comme argument la valeur initiale et renvoie un tuple en lecture/écriture similaire aux Signaux. Le premier élément est le proxy du Store qui est en lecture seule, et le second est une fonction de définition.

La fonction setter dans sa forme la plus basique prend un objet dont les propriétés seront fusionnées avec l'état actuel. Il prend également en charge la syntaxe du chemin afin que nous puissions effectuer des mises à jour imbriquées. De cette façon, nous pouvons toujours garder le contrôle de notre réactivité mais faire des mises à jour précises.

> La syntaxe de chemin de Solid a de nombreuses formes et inclut une syntaxe puissante pour effectuer des itérations et des plages. Reportez-vous à la documentation de l'API pour une référence complète.

Voyons à quel point il est plus facile d'obtenir une réactivité imbriquée avec un Store. Nous pouvons remplacer l'initialisation de notre composant par ceci:

```js
const [todos, setTodos] = createStore([]);
const addTodo = (text) => {
  setTodos([...todos, { id: ++todoId, text, completed: false }]);
};
const toggleTodo = (id) => {
  setTodos(
    (todo) => todo.id === id,
    "completed",
    (completed) => !completed
  );
};
```

Nous utilisons la syntaxe de chemin du Store avec des fonctions setters qui nous permettent de prendre l'état précédent et de renvoyer le nouvel état sur des valeurs imbriquées.

Et c'est tout. Le reste de la template réagira déjà de manière granulaire (vérifiez la console en cliquant sur la checkbox).