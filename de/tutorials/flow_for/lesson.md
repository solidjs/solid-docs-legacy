Wenn man über eine Liste iterieren möchte, ist die `<For>`-Komponente der beste Weg für jedes Array von Werten, die nicht Daten-Primitiven sind. Es wird automatisch nach Referenz indiziert, so dass während Aktualisierungen bei Verschiebung von Daten die korrespondierenden Reihen ebenfalls Verschoben statt gelöscht und neu erstellt werden. Das Callback, welches als Kind Verwendet wird, wird nicht reaktiv verfolgt und übergibt den jeweiligen Wert und seinen Index als Signal.

```jsx
<For each={cats()}>{(cat, i) =>
  <li>
    <a target="_blank" href={`https://www.youtube.com/watch?v=${cat.id}`}>
      {i() + 1}: {cat.name}
    </a>
  </li>
}</For>
```
Der `index` ist ein Signal und kann daher unabhängig vom Wert aktualisiert werden, wenn dieser verschoben wird. Wäre der Wert kein Signal, würde dieser eine neue Referenz erhalten, was dazu führen würde, dass die Elemente neu gerendert statt verschoben werden würden. Um verschachtelte Updates zu machen, verwende man verschachtelte Signale oder den Store-Proxy.

Man kann `<For>` auch verwenden, über andere iterierbare Objekte zu iterieren, die keine Arrays sind, indem man Methoden wie `Object.keys` oder einfach den Spread-Operator zur Umwandlung in ein Array verwendet, etwa so: `[...iterable]`.