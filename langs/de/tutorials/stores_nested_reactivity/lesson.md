Einer der Gründe für feingranulare Reaktivität in Solid ist, dass es verschachtelte Aktualisierungen unabhängig voneinander ausführen kann. Man kann eine Liste von Nutzern haben und wenn ein Name geändert wird, aktualisieren wir nur eine einzige Stelle im DOM, ohne die Liste selbst zu synchronisieren. Wenige (selbst reaktive) UI-Frameworks können das tun.

Aber wie schaffen wir das? In dem Beispiel haben wir eine Liste von Aufgaben, gekapselt in einem Signal. Um eine Aufgabe als abgeschlossen zu markieren, müssten wir sie mit einem Klon ersetzen. Das ist die Herangehensweise der meisten Frameworks, aber es ist verschwenderisch, da wir die gesamte Liste synchronisieren und DOM-Elemente neu erstellen, wie es das `console.log` im Beispiel sichtbar macht.

```js
const toggleTodo = (id) => {
  setTodos(
    todos().map((todo) => (todo.id !== id ? todo : { ...todo, completed: !todo.completed })),
  );
};
```

Stattdessen initialisieren wir in einer feingranularen Bibliothek wie Solid die Daten mit verschachtelten Signalen, etwa so:

```js
const addTodo = (text) => {
  const [completed, setCompleted] = createSignal(false);
  setTodos([...todos(), { id: ++todoId, text, completed, setCompleted }]);
};
```

Jetzt können wir eine Aufgabe als erledigt markieren, indem wir `setCompleted` auf einem einzelnen Listenelement aufrufen, ohne die ganze Liste synchronisieren zu müssen. Das liegt daran, dass wir die Komplexität in die Daten (das Listenelement) statt in die Darstellung (Die Liste) verschoben haben. Und wir wissen genau, wie sich die Daten ändern.

```js
const toggleTodo = (id) => {
  const index = todos().findIndex((t) => t.id === id);
  const todo = todos()[index];
  if (todo) todo.setCompleted(!todo.completed())
}
```
Wenn Du nun die restlichen Referenzen zu `todo.completed` in `todo.completed()` änderst, sollte das Beispiel nur noch `console.log` aufrufen, wenn die Aufgabe erzeugt wird und nicht, wenn Du sie als erledigt markierst.

Das erfordert natürlich etwas manuelles Abbilden und es war einmal in der Vergangenheit die einzige Möglichkeit, die wir hatten. Aber jetzt, dank Proxys, können wir die Hauptarbeit im Hintergrund erledigen, ohne viel manuelle Eingriffe. Gehe weiter zum nächsten Tutorial, um zu sehen, wie.
