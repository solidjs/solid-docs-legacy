Alors que `lazy` et `createResource` peuvent être utilisés seuls, Solid fournit également un mécanisme pour coordonner l'affichage de plusieurs événements asynchrones. `Suspense` sert de limite pour afficher un substitut (`fallback`) au lieu du contenu partiellement chargé lorsque ces événements asynchrones sont résolus.

Cela peut améliorer l'expérience de l'utilisateur en supprimant la lenteur de l'interface causé par trop d'états de chargement intermédiaires et partiels. `Suspense` détecte automatiquement toute lecture asynchrone descendante et agit en conséquence. Vous pouvez imbriquer autant de composants `Suspense` que nécessaire et seul l'ancêtre le plus proche se transformera en `fallback` lorsque l'état `loading` sera détecté.

Ajoutons un composant `Supsense` à notre exemple lazy-loading: 

```jsx
<>
  <h1>Bienvenue</h1>
  <Suspense fallback={<p>Chargement...</p>}>
    <Accueilir name="Jake" />
  </Suspense>
</>
```

Maintenant, nous avons un substitut du composant `Accueilir` pendant son chargement.

Il est important de noter que c'est la lecture d'une valeur dérivée asynchrone qui déclenche `Suspense`, et non la récupération asynchrone elle-même. Si un signal de ressource (y compris les composants `lazy`) n'est pas lu sous la limite de `Suspense`, il ne sera pas suspendu.

A bien des égards, `Suspense` est juste un composant `Show` qui effectue le rendu dans les deux branches. Bien que `Suspense` soit vital pour le rendu asynchrone serveur, ne sentez pas le besoin de l'utiliser immédiatement pour le code rendu par le client. Le rendu fin de Solid n'a pas de coût supplémentaire pour diviser les choses manuellement.

```jsx
function Deferred(props) {
  const [resume, setResume] = createSignal(false);
  setTimeout(() => setResume(true), 0);

  return <Show when={resume()}>{props.children}</Show>;
}
```

Tout le travail dans Solid est déjà mis en file d'attente indépendamment. Pas besoin de choses comme le Time Slicing.