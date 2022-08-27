Les props sont ce que nous appelons l'objet qui est passé à notre fonction de composant lors de l'exécution qui représente tous les attributs liés à son JSX. Les objets props sont en lecture seule et ont des propriétés réactives qui sont enveloppées dans des getters d'objet. Cela leur permet d'avoir une forme cohérente, que l'appelant ait utilisé des Signaux, des expressions de Signal ou des valeurs statiques. Vous y accédez par `props.nomDuProp`.

Pour cette raison, il est également très important de ne pas simplement déstructurer l'objet props, car cela perdrait la réactivité si cela n'est pas fait dans le cadre d'une portée. En général, l'accès aux propriétés de l'objet props en dehors des primitives de Solid ou de JSX peut entraîner une perte de réactivité. Ceci ne s'applique pas seulement à la déstructuration, mais aussi aux spreads et aux fonctions comme `Object.assign`.

Solid a quelques utilitaires pour nous aider lorsque nous travaillons avec les props. Le premier est `mergeProps`, qui fusionne des objets potentiellement réactifs ensemble (comme un `Object.assign` non destructif) sans perdre la réactivité. Le cas le plus courant est lors de la définition des props par défaut pour nos composants.

Dans cet exemple, dans `greetings.tsx`, nous avons intégré les valeurs par défaut dans la template, mais nous pourrions également utiliser `mergeProps` pour conserver les mises à jour réactives même lors de la définition des valeurs par défaut:

```jsx
const merged = mergeProps({ greeting: "Hi", name: "John" }, props);

return <h3>{merged.greeting} {merged.name}</h3>
```
