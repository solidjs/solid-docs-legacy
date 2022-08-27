Les Signaux sont des valeurs traçables, mais ils ne représentent que la moitié de l'équation. Pour compléter ceux-ci, il y a des observateurs qui peuvent être mis à jour par ces valeurs traçables. Un _effet_ est un tel observateur ; il exécute un effet secondaire qui dépend des Signaux.

Un effet peut être créé en important `createEffect` depuis `solid-js` et en lui fournissant une fonction. L'effet s'abonne automatiquement à tout Signal lu pendant l'exécution de la fonction et s'exécute à nouveau lorsque l'un d'eux change.

Créons donc un effet qui se répète chaque fois que `count` change:
```jsx
createEffect(() => {
  console.log("Le compte est maintenant:", count());
});
```

Pour mettre à jour notre Signal `count`, nous allons attacher un gestionnaire de clic à notre bouton:
```jsx
<button onClick={() => setCount(count() + 1)}>Cliquez Moi</button>
```

Cliquez maintenant sur le bouton pour écrire dans la console. Il s'agit d'un exemple relativement simple, mais pour comprendre le fonctionnement de Solid, vous devez imaginer que chaque expression dans le JSX est son propre effet qui se réexécute chaque fois que ses Signaux dépendants changent. C'est ainsi que tout le rendu fonctionne dans Solid: du point de vue de Solid, *tout le rendu n'est qu'un effet secondaire du système réactif*.

> Les effets que les développeurs créent avec `createEffect` s'exécutent une fois le rendu terminé et sont principalement utilisés pour planifier les mises à jour qui interagissent avec le DOM. Si vous souhaitez modifier le DOM plus tôt, utilisez [`createRenderEffect`](https://www.solidjs.com/docs/latest/api#createrendereffect)
