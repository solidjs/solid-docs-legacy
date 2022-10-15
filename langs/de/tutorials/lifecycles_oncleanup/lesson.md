Manche Frameworks verbinden ihre Aufräum-Methoden als Rückgabewerte ihrer Seiteneffekte oder Lebenszyklus-Methoden. Da alles in einem Solid-Render-Baum in einem (möglicherweise untätigen) Effekt lebt und verschachtelt sein kann, haben wir `onCleanup` zu einer primären (first-class) Methode gemacht. Man kann diese in jedem Scope aufrufen und die übergebene Funktion wird ausgeführt, wenn der Scope neu aufgebaut wird und wenn er endgültig entfernt wird.

Benutze es in Deinen Komponenten oder Effekten. Nutze es in benutzerdefinierten Direktiven. Nutze es in welchem Teil der synchronen Ausführung des reaktiven Systems auch immer.

Das Signal-Beispiel von der Einführung hat nicht hinter sich aufgeräumt. Beheben wir das, indem wir den `setInterval`-Aufruf hiermit ersetzen:

```js
const timer = setInterval(() => setCount(count() + 1), 1000);
onCleanup(() => clearInterval(timer));
```
