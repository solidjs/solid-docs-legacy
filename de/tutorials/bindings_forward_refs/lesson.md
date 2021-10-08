Oftmals möchte man eine Referenz von innerhalb einer Komponente deren Eltern-Komponente verfügbar machen. Der Weg, dies zu tun, ist immer noch das `ref`-Attribut. Von außerhalb `ref` einer Komponente zu nutzen funktioniert sehr ähnlich wie `ref` auf einem nativen Element zu verwenden. Man kann entweder eine Variable zur Zuweisung oder eine Setter-Funktion übergeben.

Allerdings ist es die Verantwortung des Authors, diese `ref` zu einem internen Element zu verbinden, um diese aufwärts weiterzuleiten. Um dies zu tun, verwenden wir `props.ref`. Dies ist eine callback-Form von `ref`, unabhängig davon, welcher Typ von `ref` übergeben wird, obwohl dieses Detail weitgehend versteckt bleiben wird, da es vermutlich ohnehin an das `ref`-Attribut eines der internen Elemente oder Komponenten innerhalb des JSX übergeben wird.

Um das Logo wieder animieren zu können, müssen wir die die ref von `canvas.tsx` weiterleiten:

```jsx
<canvas ref={props.ref} width="256" height="256" />
```
