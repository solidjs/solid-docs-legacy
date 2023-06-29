La fusion de props n'est pas la seule opération sur les props que l'on peut vouloir faire.

Souvent, nous voulons diviser les props en groupes, afin que nous puissions en utiliser certains sur
le composant actuel mais sépare les autres pour passer aux composants enfants.

À cette fin, Solid dispose de [`splitProps`](/docs/latest/api#splitprops). Il s'agit de prendre l'objet props et un ou plusieurs tableaux de clés que nous voulons extraire dans leurs propres objets props. Elle retourne un tableau d'objets props, un par tableau de clés spécifiées, plus un objet props avec toutes les clés restantes. Tous les objets retournés conservent leur réactivité.

Notre exemple ne se met pas à jour lorsque nous définissons le nom en raison de la perte de réactivité lorsque nous déstructurons dans `greeting.tsx`:
```jsx
export default function Greeting(props) {
  const { greeting, name, ...others } = props;
  return <h3 {...others}>{greeting} {name}</h3>
}
```

À la place, nous pouvons maintenir la réactivité avec `splitProps`:
```jsx
export default function Greeting(props) {
  const [local, others] = splitProps(props, ["greeting", "name"]);
  return <h3 {...others}>{local.greeting} {local.name}</h3>
}
```
Maintenant, le bouton fonctionne comme prévu.
