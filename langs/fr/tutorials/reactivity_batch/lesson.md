La réactivité de Solid est synchrone, ce qui signifie qu'à la ligne suivante après tout changement, le DOM sera mis à jour. Et pour la plupart, c'est parfaitement bien, car le rendu granulaire de Solid n'est qu'une propagation de la mise à jour dans le système réactif. Des modifications non liées "rendues" deux fois ne signifient pas réellement du travail inutile.

Et si les changements sont liés ? Le helper `batch` de Solid permet de mettre en file d'attente plusieurs modifications, puis de les appliquer toutes en même temps avant de notifier leurs observateurs.

Dans cet exemple, nous attribuons les deux noms sur un clic de bouton et cela déclenche notre mise à jour rendue deux fois. Vous pouvez voir les journaux dans la console lorsque vous cliquez sur le bouton. Enveloppons donc les appels `set` dans un `batch`.

```js
 const updateNames = () => {
    console.log("Bouton Cliqué");
    batch(() => {
      setFirstName(firstName() + "n");
      setLastName(lastName() + "!");
    })
  }
```
Et c'est tout. Maintenant, nous ne notifions qu'une seule fois pour l'ensemble des modifications.