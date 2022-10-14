Die meiste Zeit über sind abgeleitete Signale ausreichend. Allerdings ist es manchmal sinnvoll, Werte zwischenzuspeichern, um doppelte Arbeit zu vermeiden. Wir können Memos verwenden, um eine Funktion auszuführen und das Ergebnis zu speichern, bis sich deren Abhängigkeiten ändern. Das ist sehr nützlich, um Berechnungen für Effekte zu speichern, die zusätzliche Abhängigkeiten haben und den Aufwand für aufwendige Operationen auszugleichen wie DOM-Knoten-Erstellung.

Memos sind gleichzeitig Beobachter wie ein Effekt und ein nur lesbares Signal. Da sie sowohl ihre Abhängigkeiten als auch ihre Beobachter reaktiv verfolgen, können sie sicherstellen, dass sie nur einmal pro Änderung laufen. Das macht sie bevorzugt gegenüber Effekten, die in Signale schreiben. Generell sollte, was abgeleitet werden kann, auch abgeleitet werden.

Ein Memo zu erstellen ist so einfach wie eine Funktion an `createMemo` zu übergeben, das aus `solid-js` importiert wird. Im Beispiel wird die Neuberechnung des Werts mit jedem Klick immer aufwendiger. Wenn wir sie in `createMemo` schachteln, wird nur einmal pro Klick neu berechnet:

```jsx
const fib = createMemo(() => fibonacci(count()));
```
Schreibe ein `console.log` in die `fib`-Funktion, um zu sehen, wie oft sie aufgerufen wird:
```jsx
const fib = createMemo(() => {
  console.log("Calculating Fibonacci");
  return fibonacci(count());
});
```
