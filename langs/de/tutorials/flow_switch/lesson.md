Manchmal muss man mit Bedingungen mit mehr als zwei einander ausschließenden Ergebnissen umgehen. Für diesen Fall haben wir die `<Switch>`- und `<Match>`-Komponenten, die ähnlich wie JavaScripts `switch`/`case` funktionieren.

Es wird versuchen, die Bedingungen in ihrer Reihenfolge zu prüfen, um den Inhalt des ersten Statements mit einer zutreffenden Bedingung zu rendern. Falls alle Bedingungen fehlschlagen, wird das fallback gerendert.

In unserem Beispiel können wir die verschachtelten `<Show>`-Komponenten wie folgt ersetzen:

```jsx
<Switch fallback={<p>{x()} is between 5 and 10</p>}>
  <Match when={x() > 10}>
    <p>{x()} is greater than 10</p>
  </Match>
  <Match when={5 > x()}>
    <p>{x()} is less than 5</p>
  </Match>
</Switch>
```
