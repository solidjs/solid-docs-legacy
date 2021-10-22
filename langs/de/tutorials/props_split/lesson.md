Props-Objekte zusammenzuführen ist nicht die einzige Operation, die wir machen können. Oft nutzen wir Destrukturierung, um manche der Props auf die gegenwärtige Komponente anzuwenden und andere abzuspalten, um sie an die Kind-Komponenten weiterzugeben.

Für diesen Zweck hat Solid `splitProps`. Diese Methode nimmt das Props-Objekt und ein oder mehr Arrays von Eigenschaftsnamen entgegen, die in ihre eigenen Props-Objekte extrahiert werden sollen. Sie gibt ein Array von Props-Objekten zurück, eines pro Array mit Eigenschaftsnamen und ein weiteres mit den übrigen Eigenschaften, ähnlich wie beim Rest-Parameter. Alle zurückgegebenen Props-Objekte bewahren die Reaktivität.

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
Jetzt funktioniert der Knopf wie erwartet.
