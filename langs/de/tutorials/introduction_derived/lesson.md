Wir haben gesehen, dass jedes Mal, wenn wir mit einem Signal in JSX interagieren, automatisch die Oberfläche aktualisiert wird, wenn sich das Signal verändert. Aber die Komponenten-Funktionen selbst laufen nur ein Mal.

Wir können neue Ausdrücke erzeugen, die auf anderen Signalen basieren, indem wir sie in eine Funktion schachteln. Eine Funktion, die ein Signal aufruft, wird damit effektiv selbst ein Signal: Wenn sich ihr enthaltenes Signal verändert, wird es im Anschluss alle seine Leser aktualisieren.

Lass uns unseren Zähler aktualisieren, in dem wir eine `doubleCount`-Funktion hinzufügen:

```jsx
const doubleCount = () => count() * 2;
```

Wir können nun `doubleCount` genau wie ein Signal im JSX aufrufen:
```jsx
return <div>Count: {doubleCount()}</div>;
```

Wir nennen solche Funktionen _abgeleitete Signale_, weil sie ihre Reaktivität durch die Signale erhalten, auf die sie zugreifen. Sie speichern nicht selbst einen Wert – wenn man ein abgeleitetes Signal erstellt, aber nie aufruft, wird es wie jede andere unbenutzte Funktion aus der Ausgabe von Solids Parser entfernt. Aber sie aktualisieren alle Effekte, die auf ihnen basieren und lösen ein neues Rendering aus, wenn sie in einer Komponente genutzt werden.
