Une erreur JavaScript provenant de l'interface utilisateur ne doit pas entraîner l'arrêt de toute l'application. Les limites d'erreur (`ErrorBoundary`) sont des composants qui détectent les erreurs JavaScript n'importe où dans leur arbre de composants enfant, enregistrent ces erreurs et affichent une interface utilisateur de secours à la place de l'arbre de composants qui a planté.

Un composant a planté notre exemple. Nous allons l'envelopper dans un `ErrorBoundary` qui affiche l'erreur.

```jsx
<ErrorBoundary fallback={err => err}>
  <Broken />
</ErrorBoundary>
```
