Du weißt jetzt, wie Du Listen in Solid mit `<For>` rendern kannst, aber Solid bietet auch die Komponente `<Index>`, die in bestimmten Situationen zu weniger Rendern führt.

Wenn die Liste aktualisiert wird, verwendet die `<For>`-Komponente referenzielle Gleichheit, um Elemente mit dem letzten Zustand der Liste zu vergleichen. Aber das ist nicht immer erwünscht.

In JavaScript werden Primitiven (wie Zeichenketten und Zahlen) immer nach Wert verglichen. Wenn wir `<For>` mit primitiven Werten oder Listen von Listen verwenden, könnten wir viel unnötiges Rendering verursachen. Wenn wir `<For>` verwenden würden, um eine Liste von Strings `<input>`-Feldern zuzuordnen, die bearbeitet werden können, würde jede Änderung an einem String dazu führen, dass das zugehörige `<input>` neu erstellt wird.

Für diese Fälle steht die Komponente `<Index>` zur Verfügung. Als Faustregel gilt, wenn Du mit Primitiven arbeitest, verwende `<Index>`.

```jsx
<Index each={cats()}>{(cat, i) =>
  <li>
    <a target="_blank" href={`https://www.youtube.com/watch?v=${cat().id}`}>
      {i + 1}: {cat().name}
    </a>
  </li>
}</Index>
```

Es hat eine ähnliche Signatur wie `<For>`, außer dass diesmal das Element das Signal ist und der Index fest ist. Jeder gerenderte Knoten entspricht einer Stelle in der Liste. Immer, wenn sich die Daten an dieser Stelle ändern, wird das Signal aktualisiert.

`<For>` kümmert sich um die Werte in Deiner Liste, und die Position jedes Wertes innerhalb der Liste kann sich effizient ändern; `<Index>` kümmert sich um die Indices in Deiner Liste, und der Wert an jedem Index kann sich effizient ändern.
