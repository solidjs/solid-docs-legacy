Nous avons vu que chaque fois que nous accédons à un Signal dans JSX, il met automatiquement à jour la vue lorsque ce Signal change. Mais la fonction de composant elle-même ne s'exécute qu'une seule fois.

Nous pouvons créer de nouvelles expressions qui dépendent des Signaux en enveloppant un Signal dans une fonction. Une fonction qui accède à un Signal est effectivement aussi un Signal: lorsque son Signal encapsulé change, elle met à jour à son tour ses lecteurs.

Mettons à jour notre `Counter` pour compter par 2 en introduisant une fonction `doubleCount`:
```jsx
const doubleCount = () => count() * 2;
```

Nous pouvons alors appeler `doubleCount` comme un Signal dans notre JSX:
```jsx
return <div>Count: {doubleCount()}</div>;
```

Nous appelons des fonctions comme celles-ci _Signaux dérivés_ car elles tirent leur réactivité du Signal auquel elles accèdent. Ils ne stockent pas eux-mêmes une valeur (si vous créez un Signal dérivé mais ne l'appelez jamais, il sera supprimé de la sortie de Solid comme toute fonction inutilisée) mais ils mettront à jour tous les effets qui en dépendent, et ils déclencheront un rendu s'il est inclus dans une vue.
