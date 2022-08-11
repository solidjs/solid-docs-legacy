La plupart des bundlers (comme Webpack, Rollup, Parcel, Vite) gèrent  automatiquement le fractionnement du code quand vous utilisez un import dynamique. La méthodd `lazy` de Solid nous permet d'envelopper l'import dynamique du composant pour un lazy-loading (chargement paresseux) différé. La valeur de sortie est un composant quipeut être utilisé dans notre template JSX comme n'importe quel composant à l'exception du fait qu'en interne, il charge dynamiquement le code importé sous-jacent lors du premier rendu, interrompant cette branche du rendu jusqu'à ce que le code soit disponible.

Pour utiliser la méthode `lazy`, replacez l'import suivant:
```js
import Accueilir from "./accueilir";
```
avec:
```js
const Accueilir = lazy(() => import("./accueilir"));
```

Le chargement sera probablement encore trop rapide pour être visible. Mais vous pouvez ajouter un faux délai si vous souhaitez rendre le chargement plus visible.

```js
const Accueilir = lazy(async () => {
  // Simuler un délai de 1000 millisecondes.
  await new Promise(r => setTimeout(r, 1000))
  return import("./accueilir")
});
```
