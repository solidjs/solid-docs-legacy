Parfois, vous devez gérer des conditionnels avec plus de 2 résultats exclusifs mutuels. Dans ce cas, nous avons les composants `<Switch>` et `<Match>` modélisés à peu près d'après le `switch`/`case` de JavaScript.

Il essaiera de faire correspondre chaque condition, s'arrêtant pour rendre la première qui est évaluée comme vraie. Quand aucune condition n'est remplie, le contenu de `fallback` sera rendu.

Dans l'exemple, nous pouvons remplacer nos composants `<Show>` imbriqués par ceci:
```jsx
<Switch fallback={<p>{x()} est entre 5 et 10</p>}>
  <Match when={x() > 10}>
    <p>{x()} est plus grand que 10</p>
  </Match>
  <Match when={5 > x()}>
    <p>{x()} est plus petit que 5</p>
  </Match>
</Switch>
```
