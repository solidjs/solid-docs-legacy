Parfois, vos composants et éléments acceptent un nombre variable d'attributs et il est judicieux de les transmettre sous forme d'objet plutôt qu'individuellement. Cela est particulièrement vrai lorsqu'on enveloppe un élément DOM dans un composant, une pratique courante lors de la création de systèmes de conception (design systems).

Pour cela, nous utilisons l'opérateur de décomposition `...`.

On peut passer un objet avec un nombre variable de propriétés:

```jsx
<Info {...pkg} />
```
