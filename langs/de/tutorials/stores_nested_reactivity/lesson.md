Eine der Gründe für feingranulare Reaktivität in Solid ist die Fähigkeit, Aktualisierungen unabhängig voneinander zu behandeln. Man kann eine Liste von Nutzern haben und wenn ein Name geändert wird, aktualisieren wir nur eine einzige Stelle im DOM, ohne die Liste selbst abzugleichen. Wenige (selbst reaktive) UI-Frameworks können das tun.

Aber wie schaffen wir das? In dem Beispiel haben wir eine Liste von Aufgaben in einem Signal. Um eine Aufgabe als abgeschlossen zu markieren, müssten wir diese mit einem Klon ersetzen. Das ist die Herangehensweise der meisten Frameworks, aber es ist verschwenderisch, wenn wir wieder und wieder die Liste abgleichen und erstellen die DOM-Elemente neu, wie es das `console.log` sichtbar macht.

```js
const toggleTodo = (id) => {
  setTodos(
    todos().map((todo) => (todo.id !== id ? todo : { ...todo, completed: !todo.completed })),
  );
};
```

Stattdessen initialisiert man in einer feingranularen Library wie Solid die Daten mit verschachtelten Signalen, etwa so:

```js
const addTodo = (text) => {
  const [completed, setCompleted] = createSignal(false);
  setTodos([...todos(), { id: ++todoId, text, completed, setCompleted }]);
};
```

Jetzt können wir den Erledigungszustand aktualisieren, indem wir `setCompleted` aufrufen, ohne dass ein zusätzlicher Abgleich nötig wäre. Das liegt daran, dass wir die Komplexität in die Daten statt in die Darstellung verschoben haben. Und wir wissen genau, wie sich die Daten ändern.

```js
const toggleTodo = (id) => {
  const index = todos().findIndex((t) => t.id === id);
  const todo = todos()[index];
  if (todo) todo.setCompleted(!todo.completed())
}
```
Wenn man nun die restlichen Referenzen zu `todo.completed` in `todo.completed()` ändert, sollte das Beispiel nur noch `console.log` aufrufen, wenn der Eintrag erzeugt wird und nicht, wenn man die Erledigung umschaltet.

Das erfordert natürlich etwas manuelles Abbilden und es war einmal in der Vergangenheit die einzige Möglichkeit. Aber jetzt, dank Proxies, können wir die meiste Arbeit im Hintergrund machen, ohne manuelle Einmischung. Gehe weiter zur nächsten Anleitung, um zu sehen, wie.
