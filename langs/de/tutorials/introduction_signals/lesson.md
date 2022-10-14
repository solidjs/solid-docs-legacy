_Signale_ sind der Grundpfeiler der Reaktivität in Solid. Sie enthalten Werte, die sich mit der Zeit ändern; wenn Du den Wert eines Signals änderst, wird automatisch alles aktualisiert, was das Signal benutzt.

Um ein Signal zu erstellen, lass uns `createSignal` aus `solid-js` importieren, und es wie folgt in unserer Counter-Komponente aufrufen:
```jsx
const [count, setCount] = createSignal(0);
```

Das Funktionsargument im create-Aufruf ist der initiale Wert und die Rückgabe ist ein Array mit zwei Funktionen, einem Getter und einem Setter. Mit [Destrukturierung](https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) können wir diese Funktionen nach Belieben benennen. In diesem Fall nennen wir den Getter `count` und den Setter `setCount`.

Beachte, dass der erste zurückgegebene Wert ein Getter ist (eine Funktion, die den Wert zurückgibt) und nicht der Wert selbst. Das ist der Fall, weil das Framework verfolgen muss, wo das Signal gelesen wird, sodass es alle Aktualisierungen entsprechend weiterreichen kann.

In dieser Lektion werden wir JavaScripts `setInterval`-Funktion benutzen, um einen fortlaufend hoch zählenden Zähler zu erstellen. Wir können unser `count`-Signal jede Sekunde aktualisieren, indem wir den folgenden Code unserer Counter-Komponente hinzufügen:

```jsx
setInterval(() => setCount(count() + 1), 1000);
```

Jeden Tick lesen wir den vorherigen Zählerstand, addieren 1 und setzen den neuen Wert.

> Solids Signale akzeptieren auch die Funktions-Form, bei der man den vorherigen Wert erhält und den nächsten zurückgibt.
> ```jsx
> setCount(c => c + 1);
> ```

Zu guter Letzt müssen wir das Signal in unserem JSX lesen:

```jsx
return <div>Count: {count()}</div>;
```
