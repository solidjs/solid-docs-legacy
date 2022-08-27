Vous pouvez toujours obtenir une référence à un élément DOM dans Solid par le biais d'une affectation, puisque JSX crée des éléments DOM réels. Par exemple:

```jsx
const myDiv = <div>Mon Élément</div>;
```

Cependant, il y a un avantage à ne pas séparer vos éléments et à les placer dans un seul modèle JSX contigu, car cela permet à Solid de mieux optimiser leur création.

Au lieu de cela, vous pouvez obtenir une référence à un élément dans Solid en utilisant l'attribut `ref`. Les références sont essentiellement des affectations comme l'exemple ci-dessus, qui se produisent au moment de la création avant qu'elles ne soient attachées au DOM du document. Il suffit de déclarer une variable, de la passer en tant qu'attribut `ref`, et la variable sera assignée:

```jsx
let myDiv;

<div ref={myDiv}>Mon Élément</div>
```

Prenons donc une référence à notre élément canvas et animons-le:

```jsx
<canvas ref={canvas} width="256" height="256" />
```

Les références peuvent également prendre la forme d'une fonction de rappel. Cela peut être pratique pour encapsuler la logique, surtout lorsque vous n'avez pas besoin d'attendre que les éléments soient attachés. Par exemple:

```jsx
<div ref={el => /* Faire quelque chose avec el... */}>Mon Élément</div>
```
