Signale sind verfolgbare Werte, aber sie sind nur eine Hälfte der Gleichung. Um diese zu ergänzen, gibt es Beobachter, die durch sie aktualisiert werden können. Ein _Effekt_ ist ein solcher Beobachter; er führt einen Seiteneffekt aus, der von Signalen abhängt.

Ein Effekt kann erzeugt werden, indem man `createEffect` aus `solid-js` importiert und es mit einer Funktion als Parameter aufruft. Der Effekt schreibt sich dann automatisch für alle Änderungen in den Signalen ein, die zur Laufzeit der Funktion aufgerufen werden und läuft noch einmal, wenn sich einer von ihnen ändert.

Bauen wir einen Effekt, der läuft, wenn sich `count` ändert:

```jsx
createEffect(() => {
  console.log("The count is now", count());
});
```

Um unser `count`-Signal zu aktualisieren, hängen wir einen Klick-Handler an unseren Knopf:

```jsx
<button onClick={() => setCount(count() + 1)}>Click Me</button>
```

Jetzt wird beim Klick auf den Knopf in die Konsole geschrieben. Das ist ein relativ einfaches Beispiel, aber um zu verstehen, wie Solid funktioniert, stelle man sich vor, dass jeder Ausdruck in JSX ein eigener Effekt ist, der neu ausgeführt wird, sobald eine Signal-Abhängigkeit sich ändert. So funktioniert alles Rendering in Solid: aus Solids Perspektive *ist alles Rendering nur ein Seiteneffekt des reaktiven Systems*.

> Effekte, die Entwickler mit `createEffect` erstellen, laufen erst, wenn das Rendering abgeschlossen ist und werden meistens verwendet, um Aktualisierungen auszuführen, die mit dem DOM interagieren. Falls man das DOM noch früher anpassen möchte, nutze man [`createRenderEffect`](https://www.solidjs.com/docs/latest/api#createrendereffect).