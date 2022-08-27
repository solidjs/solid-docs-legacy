JSX vous permet d'utiliser JavaScript pour contrôler le flow logique dans les templates. Cependant, sans DOM virtuel, une utilisation naïve de choses comme `Array.prototype.map` recréerait inutilement tous les nœuds DOM à chaque mise à jour. Au lieu de cela, il est courant que les bibliothèques réactives utilisent des helpers pour les templates. Dans Solid, nous les enveloppons dans des composants.

Le contrôle de flow le plus basique est le conditionnel. Le compilateur de Solid est suffisamment intelligent pour gérer de manière optimale les opérateurs ternaires (`a ? b : c`) et les expressions booléennes (`a && b`). Cependant, il est souvent plus lisible d'utiliser le composant `<Show>` de Solid.

Dans cet exemple, nous aimerions afficher uniquement le bouton approprié qui reflète l'état actuel (si l'utilisateur est connecté). Mettez à jour le JSX avec:
```jsx
<Show
  when={loggedIn()}
  fallback={<button onClick={toggle}>Se connecter</button>}
>
  <button onClick={toggle}>Se déconnecter</button>
</Show>
```
La propriété `fallback` agit comme `else` et sera affichée quand la condition passée à `when` n'est pas véridique.

Maintenant, cliquer sur le bouton changera le bouton en fonction de l'état de `loggedIn`.
