Stores sind Solids Antwort auf verschachtelte Reaktivität. Sie sind Proxy-Objekte, deren Eigenschaften verfolgt werden können und selbst Objekte enthalten können, die automatisch in Proxies verpackt werden, und so weiter.

Um Dinge leichtgewichtig zu halten, erzeugt Solid die darunterliegenden Signale nur für Eigenschaften, auf die innerhalb des reaktiven Kontextes zugegriffen wird. Und so sind alle Signale in Stores je nach Nutzung verzögert erstellt.

Der `createStore`-Aufruf nimmt den initialen Wert und gibt ein Getter-/Setter-Tupel ähnlich wie Signal zurück. Das erste Element ist der Store-Proxy, der nur lesbar ist und das zweite ist eine Setter-Funktion.

Die Setter-Funktion nimmt in ihrer einfachsten Form ein Objekt, desssen Eigenschaften mit dem gegenwärtigen Zustand zusammengeführt werden. Sie unterstützt auch die Pfad-Syntax, so dass wir verschachtelte Updates machen können. Auf diese Weise können wir die Kontrolle über die Reaktivität behalten, aber gleichzeitig zielgerichtet aktualisieren.

> Solids Pfad-Syntax hat viele Formen und enthält eine mächtige Syntax, um Iterationen und Bereiche zu handhaben. Die API-Dokumentation enthält eine vollständige Referenz.

Schauen wir mal, wie viel einfacher es ist, verschachtelte Reaktivität mit einem Store zu erreichen. Wir können die Initialisierung unserer Komponente wie folgt ersetzen:

```js
const [store, setStore] = createStore({ todos: [] });
const addTodo = (text) => {
  setStore('todos', (todos) => [...todos, { id: ++todoId, text, completed: false }]);
};
const toggleTodo = (id) => {
  setStore('todos', (t) => t.id === id, 'completed', (completed) => !completed);
};
```

Wir benutzen nun die Pfad-Syntax des Stores mit Funktions-Settern, die es uns erlaubt, den vorherigen Zustand zu bekommen und den neuen innerhalb verschachtelter Wert zurückzugeben.

Und das war's. Der Rest des Templates ist bereits granular reaktiv (Schau in die Console, während die Checkbox geklickt wird).
