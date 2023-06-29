Une partie de ce qui rend Solid si performant est que nos composants ne sont essentiellement que des appels de fonction. La façon dont nous propageons les mises à jour est que le compilateur encapsule des expressions potentiellement réactives dans des getters d'objet. Vous pouvez imaginer le compilateur donner en sortie:

```jsx
// Ce JSX
<MyComp dynamic={mySignal()}>
  <Child />
</MyComp>

// deviendra
MyComp({
  get dynamic() { return mySignal() },
  get children() { return Child() }
});
```
Cela signifie que ces props sont évalués paresseusement. Leur accès est différé jusqu'à leur utilisation. Cela conserve la réactivité sans introduire de wrappers ou de synchronisation superflus. Cependant, cela signifie qu'un accès répété peut entraîner la recréation de composants ou d'éléments enfants.

La grande majorité du temps, vous n'insérerez que des props dans le JSX, il n'y a donc aucun problème.
Cependant, lorsque vous travaillez avec des enfants, vous devez faire attention à ne pas créer les enfants plusieurs fois.

Pour cette raison, Solid dispose du helper `children`. Cette méthode crée un mémo autour de la propriété `children` et résout toute référence réactive enfant imbriquée afin que vous puissiez interagir directement avec les enfants.

Dans cet exemple, nous avons une liste dynamique et nous voulons définir la propriété de style `color` des éléments. Si nous interagissions directement avec `props.children`, non seulement nous créerions les noeuds plusieurs fois, mais nous constaterions que `props.children` est une fonction, le Memo retourné par `<For>`.

À la place, utilisons le helper `children` à l'intérieur de `colored-list.tsx`:
```jsx
export default function ColoredList(props) {
  const c = children(() => props.children);
  return <>{c()}</>
}
```
Maintenant, pour mettre à jour nos éléments, créons un Effet:
```jsx
createEffect(() => c().forEach(item => item.style.color = props.color));
```
