Die `<For>`-Komponente der beste Weg, um über eine Liste von Objekten zu iterieren. Wenn die Liste sich ändert, aktualisiert oder verschiebt `<For>` die zugehörigen DOM-Elemente, statt sie neu zu erzeugen. Schauen wir uns ein Beispiel an.

```jsx
<For each={cats()}>{(cat, i) =>
  <li>
    <a target="_blank" href={`https://www.youtube.com/watch?v=${cat.id}`}>
      {i() + 1}: {cat.name}
    </a>
  </li>
}</For>
```

Die `<For>`-Komponente hat ein Attribut: `each`, dem Du eine Liste übergibst, welche durchlaufen werden soll.

Anstatt nun direkt DOM-Knoten zwischen `<For>` und `</For>` zu schreiben, übergib einen _Callback_. Dies ist eine ähnliche Funktion wie JavaScripts [`map`-Callback](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map#parameters). Für jedes Element der Liste wird der Callback mit dem Element als erstem Argument und dem Index als zweitem aufgerufen. (`cat` und `i` in diesem Beispiel.) Du kannst diese Variablen dann im Callback verwenden, der einen zu rendernden DOM-Knoten zurückgeben sollte.

Beachte, dass der Index ein _Signal_ ist, keine konstante Zahl. Das liegt daran, dass `<For>` "Referenz-verschlüsselt" ist: Jeder DOM-Knoten, den es darstellt, ist mit einem Element in der Liste verbunden. Mit anderen Worten, wenn ein Element in der Liste umplaziert wird, wird der entsprechende DOM-Knoten nicht zerstört und neu erstellt, sondern ebenfalls verschoben und sein Index ändert sich.

Das `each`-Attribut erwartet ein Array, aber Du kannst andere iterierbare Objekte übergeben, mit Werkzeugen wie [`Array.from`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from), [`Object.keys`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys), oder der [`Spread Syntax`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax).
