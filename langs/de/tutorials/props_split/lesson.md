Props zusammenzuführen, ist nicht die einzige Operation auf Props, die wir machen könnten.

Oft möchten wir Props in Gruppen aufsplitten, um manche der Props in der aktuellen Komponente zu verwenden und andere abzuspalten, um sie an Kind-Komponenten weiterzugeben.

Für diesen Zweck hat Solid [`splitProps`](/docs/latest/api#splitprops). Diese Methode nimmt das Props-Objekt und ein oder mehrere Listen von Schlüsseln entgegen, die wir in ihre eigenen Props-Objekte extrahieren wollen. Sie gibt eine Liste von Props-Objekten zurück, eines pro Liste mit Schlüsseln, plus ein weiteres mit den verbleibenden Eigenschaften, ähnlich wie beim Rest-Parameter. Alle zurückgegebenen Props-Objekte behalten ihre Reaktivität.

Unser Beispiel aktualisiert sich nicht, wenn wir den Namen ändern, da die Reaktivität durch das Destrukturieren in `greeting.tsx` verloren gegangen ist:
```jsx
export default function Greeting(props) {
  const { greeting, name, ...others } = props;
  return <h3 {...others}>{greeting} {name}</h3>
}
```

Stattdessen können wir die Reaktivität mit `splitProps` beibehalten:
```jsx
export default function Greeting(props) {
  const [local, others] = splitProps(props, ["greeting", "name"]);
  return <h3 {...others}>{local.greeting} {local.name}</h3>
}
```
Jetzt funktioniert der Button wie erwartet.
