Es gibt nur wenige Lifecycle-Methoden in Solid, da alles innerhalb des reaktiven Systems lebt und stirbt. Das reaktive System wird synchron erzeugt und aktualisiert, sodass die einzigen Zwischenschritte in Effekten bestehen, die ans Ende der Aktualisierung geschoben werden.

Wir haben festgestellt, dass Entwickler bei einfachen Aufgaben oft nicht auf diese Weise denken, und um ihnen die Dinge etwas einfacher zu machen, haben wir einen nicht-verfolgten `createEffect`-Aufruf mit `onMount` verfügbar gemacht. Es ist nur ein Effekt-Aufruf, aber Du kannst ihn in der Sicherheit einsetzen, dass er nur ein Mal pro Komponente laufen wird, sobald diese initial gerendert wurde.

Lass uns `onMount` benutzen, um ein paar Fotos zu holen:
```js
onMount(async () => {
  const res = await fetch(`https://jsonplaceholder.typicode.com/photos?_limit=20`);
  setPhotos(await res.json());
});
```

Lifecycle-Methoden laufen nur im Browser, daher hat man den Vorteil, dass sie nicht während des serverseitigen Rendering laufen. Obwohl wir in diesem Beispiel Daten vom Server laden, machen wir das normalerweise mit Ressourcen für echte Server-/Browser-Koordination.
