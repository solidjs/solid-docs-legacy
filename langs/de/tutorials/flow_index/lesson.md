Manchmal macht es Sinn, referenzielle Vergleiche zu verwenden, um Reihen zu vergleichen. Wenn man mit einfachen Werten oder verschachtelten Arrays arbeitet, kann die Verwendung der Werte als Vergleichsschlüssel zu unnötigem Rendering führen. Wenn wir beispielsweise eine Liste von Strings zu einem input-Feld transformieren würden, das diesen Wert im Array bearbeiten kann, würde jede Änderung des Werts dazu führen, dass das Input neu gerendert wird, da es als eindeutiger Identifikator gesehen wird.

In diesen Fällen ist konzeptuell der Array-Index der Schlüssel zu der Liste. Dafür hat Solid die `<Index>`-Komponente.

`<Index>` hat eine vergleichbare Funktionssignatur wie `<For>`, außer dass diesmal der Wert das Signal ist und der Index fest.

```jsx
<Index each={cats()}>{(cat, i) =>
  <li>
    <a target="_blank" href={`https://www.youtube.com/watch?v=${cat().id}`}>
      {i + 1}: {cat().name}
    </a>
  </li>
}</Index>
```
