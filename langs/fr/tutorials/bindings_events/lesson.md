Les événements dans Solid sont des attributs préfixés par `on`. Ils sont traités de manière spéciale à plusieurs égards. Premièrement, ils ne suivent pas l'heuristique normale pour envelopper. Dans de nombreux cas, il est difficile de déterminer la différence entre un Signal et un gestionnaire d'événements. Ainsi, puisque les événements sont appelés et ne nécessitent pas de réactivité pour être mis à jour, ils ne sont liés qu'initialement. Vous pouvez toujours demander à votre gestionnaire d'exécuter un code différent en fonction de l'état actuel de votre application.

Les événements courants de l'interface utilisateur (qui font des bulles (bubble) et sont composés) sont automatiquement délégués au document. Pour améliorer les performances de la délégation, Solid prend en charge une syntaxe de tableau pour appeler le gestionnaire avec des données (comme premier argument) sans créer de fermetures supplémentaires:

```jsx
const handler = (data, event) => /*...*/

<button onClick={[handler, data]}>Cliquez Moi</button>
```

Dans cette exemple, attachons l'handler à l'event `mousemove`:
```jsx
<div onMouseMove={handleMouseMove}>
  La position de la souris est de {pos().x} x {pos().y}
</div>
```

Toutes les liaisons `on` sont insensibles à la casse, ce qui signifie que les noms d'événements doivent être en minuscules. Par exemple, `onMouseMove` contrôle le nom de l'événement `mousemove`. Si vous devez prendre en charge d'autres casse ou ne pas utiliser la délégation d'événements, vous pouvez utiliser le namespace `on:` pour faire correspondre les gestionnaires d'événements qui suivent les deux points:

```jsx
<button on:DOMContentLoaded={() => /* Faire quelque chose */} >Cliquez Moi</button>
```
