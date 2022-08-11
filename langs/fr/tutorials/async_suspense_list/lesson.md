Parfois, vous avez plusieurs composants `Suspense` que vous souhaitez coordonner. Une approche possible consiste à tout mettre sous un seul `Suspense`, mais cela nous limite à un seul comportement de chargement. Un seul état `fallback` signifie que tout doit toujours attendre que la dernière chose soit chargée. Au lieu de cela, Solid introduit le composant `SuspenseList` pour coordonner cela.

Considérez que vous avez plusieurs composants `Suspense` comme dans notre exemple. Si nous les enveloppons avec un `SuspenseList` configuré avec `revealOrder` de `forwards`, ils seront rendus dans l'ordre où ils apparaissent dans l'arbre, quel que soit l'ordre dans lequel ils se chargent. Cela réduit le saut de page. Vous pouvez définir `revealOrder` sur `backwards` ou `together`, ce qui, respectivement, inverse l'ordre ou attend le chargement de tous les `Suspense`. De plus, il existe une option `tail` qui peut être définie sur `hidden` ou `collapsed`. Cela remplace le comportement par défaut consistant à afficher tous les substituts `fallback` en n'en affichant aucun ou en affichant le suivant dans la direction définie par `revealOrder`.

Notre exemple est actuellement un peu désordonné en termes de substituts de chargement (`fallback`). Bien qu'il charge toutes les données indépendamment, nous affichons souvent plusieurs `fallback` en fonction de l'ordre de chargement des données. Enveloppons le JSX de notre composant `ProfilePage` dans une `<SuspenseList>`:

```jsx
<SuspenseList revealOrder="forwards" tail="collapsed">
  <ProfileDetails user={props.user} />
  <Suspense fallback={<h2>Chargement des posts...</h2>}>
    <ProfileTimeline posts={props.posts} />
  </Suspense>
  <Suspense fallback={<h2>Chargement des anecdotes...</h2>}>
    <ProfileTrivia trivia={props.trivia} />
  </Suspense>
</SuspenseList>
```
