Es gibt nur wenige Methoden in Solid, um den Lebenszyklus (Englisch: Lifecycle) der Anwendung zu handhaben, da alles innerhalb des reaktiven Systems lebt und stirbt. Das reaktive System wird synchron erzeugt und aktualisiert, sodass die einzigen Zwischenschritte in Effekten bestehen, die ans Ende der Aktualisierung geschoben werden.

Wir haben festgestellt, dass Entwickler bei einfachen Aufgaben oft nicht auf diese Weise denken, also haben wir, um die Dinge zu vereinfachen, einen Alias `onMount` („Wenn geladen“) erstellt. `onMount` ist nur ein `createEffect`-Aufruf der nicht reaktiv verfolgt, was bedeutet er wird niemals wieder ausgeführt. Du kannst ihn in der Sicherheit einsetzen, dass er nur ein Mal pro Komponente laufen wird, sobald diese zum ersten Mal gerendert wurde.

Lass uns `onMount` benutzen, um ein paar Fotos zu holen:
```js
onMount(async () => {
  const res = await fetch(`https://jsonplaceholder.typicode.com/photos?_limit=20`);
  setPhotos(await res.json());
});
```

Lebenszyklus-Methoden werden nur im Browser ausgeführt, sodass das Einfügen von Code in `onMount` den Vorteil hat, dass er während [SSR](https://www.debugbear.com/blog/server-side-rendering) nicht auf dem Server ausgeführt wird. Obwohl wir in diesem Beispiel Daten abrufen, verwenden wir normalerweise die Ressourcen von Solid für eine echte Server/Browser-Koordination.

