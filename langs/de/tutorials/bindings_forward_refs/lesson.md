Oftmals möchte man eine Referenz von innerhalb einer Komponente einer Eltern-Komponente verfügbar machen. Der Weg, das zu tun, ist immer noch das `ref`-Attribut. Von außerhalb funktioniert `ref` auf einer Komponente so wie wie `ref` auf einem nativen Element. Man kann entweder eine Variable zur Zuweisung oder eine Setter-Funktion übergeben.

Allerdings ist es die Verantwortung des Autors, diese `ref` an ein inneres Element zu binden, damit es nach außen zurückgegeben werden kann. Um das zu tun, verwenden wir `props.ref`. Dies ist immer die Callback-Variante von `ref`, unabhängig davon, welcher Typ von `ref` von außen übergeben wurde. Jedoch bleibt dieses Detail in der Regel versteckt, da die `ref` sowieso nur an das `ref`-Attribut eines der inneren Elemente oder Komponenten im JSX dieser Komponente übergeben wird.

Um das Logo wieder animieren zu können, müssen wir die ref von `canvas.tsx` weiterleiten:

```jsx
<canvas ref={props.ref} width="256" height="256" />
```
