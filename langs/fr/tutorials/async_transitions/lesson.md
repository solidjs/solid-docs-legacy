`Suspense` nous permet d'afficher le contenu d'un `fallback` lorsque les données sont en cours de chargement. C'est très bien pour le chargement initial, mais lors de la navigation ultérieure, il est souvent pire pour l'expérience utilisateur de revenir à l'état squelette.

Nous pouvons éviter de revenir à l'état squelette (`fallback`) en utilisant `useTransition`. Il fournit un wrapper et un indicateur d'attente. Le wrapper place toutes les mises à jour en aval dans une transaction qui n'est pas validée tant que tous les événements asynchrones ne sont pas terminés.

Cela signifie que lorsque le flux de contrôle est suspendu, il continue d'afficher la branche actuelle tout en rendant la suivante hors écran. Les lectures de ressource sous les branches existantes l'ajoutent à la transition. Cependant, tout nouveau composant `Suspense` imbriqué affichera son `fallback` s'il n'a pas terminé son chargement avant d'être affiché.

Remarquez que lorsque vous naviguez dans l'exemple, nous voyons le contenu disparaître et revenir à texte de chargement (`fallback`). Ajoutons une transition dans notre composant `App`. Tout d'abord, remplaçons la fonction `updateTab` :

```js
const [pending, start] = useTransition();
const updateTab = (index) => () => start(() => setTab(index));
```

`useTransition` renvoie un indicateur de signal d'attente et une méthode pour démarrer la transition, que nous allons envelopper autour de notre mise à jour.

Nous devons utiliser ce signal d'attente pour donner un indicateur dans notre interface utilisateur. Nous pouvons ajouter une classe `pending` à notre div contenant les onglets:

```js
<div class="tab" classList={{ pending: pending() }}>
```

Et avec cela, notre changement d'onglet devrait être beaucoup plus fluide.
