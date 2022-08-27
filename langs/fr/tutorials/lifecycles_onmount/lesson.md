Il n'y a que quelques fonctions de cycle de vie dans Solid, car tout vit et meurt grâce au système réactif. Le système réactif est créé et mis à jour de manière synchrone, de sorte que la seule planification se résume aux effets qui sont poussés à la fin de la mise à jour.

Nous avons constaté que les développeurs effectuant des tâches de base ne pensent pas souvent de cette façon donc pour faciliter les choses, nous avons créé un alias, `onMount`. `onMount` est simplement un appel à `createEffect` qui n'est pas suivi, ce qui signifie qu'il n'est jamais ré-exécuté. C'est juste un appel à l'effet mais vous pouvez l'utiliser avec la certitude
qu'il ne sera exécuté qu'une seule fois pour votre composant, une fois que le rendu initial sera effectué.

Utilisons le hook `onMount` pour récupérer des photos:
```js
onMount(async () => {
  const res = await fetch(`https://jsonplaceholder.typicode.com/photos?_limit=20`);
  setPhotos(await res.json());
});
```

Les cycles de vie ne sont exécutés que dans le navigateur, donc mettre du code dans `onMount` a l'avantage de ne pas s'exécuter sur le serveur pendant le SSR. Même si nous faisons de la récupération de données dans cet exemple, nous utilisons généralement les ressources de Solid pour une véritable coordination serveur/navigateur.
