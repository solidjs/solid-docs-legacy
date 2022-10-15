Stores sind Solids Antwort auf verschachtelte Reaktivität. Sie sind Proxy-Objekte, deren Eigenschaften verfolgt werden können und selbst Objekte enthalten können, die automatisch in Proxys verpackt werden, und so weiter.

Um die Dinge leichtgewichtig zu halten, erzeugt Solid die darunterliegenden Signale nur für Eigenschaften, auf die innerhalb eines reaktiv verfolgenden Kontextes zugegriffen wird. Und so werden alle Signale in Stores verzögert erstellt, nämlich erst wenn benötigt.

Der `createStore`-Aufruf nimmt den Anfangswert und gibt ein Getter-/Setter-Tupel zurück, so wie bei Signalen. Das erste Element ist der Store-Proxy, der nur lesbar ist und das zweite ist eine Setter-Funktion.

Die Setter-Funktion nimmt in ihrer einfachsten Form ein Objekt, dessen Eigenschaften mit dem gegenwärtigen Zustand zusammengeführt werden. Sie unterstützt auch die Pfad-Syntax, sodass wir verschachtelte Updates machen können. Auf diese Weise können wir die Kontrolle über die Reaktivität behalten, aber gleichzeitig zielgerichtet aktualisieren.

> Solids Pfad-Syntax hat viele Formen und unterstützt auch eine mächtige Syntax, um Iterationen und Bereiche zu handhaben. Die [API-Dokumentation](/docs/latest/api#stores-aktualisieren) enthält eine vollständige Referenz.

Schauen wir mal, wie viel einfacher es ist, verschachtelte Reaktivität mit einem Store zu erreichen. Wir können die Initialisierung unserer Komponente wie folgt ersetzen:

```js
const [todos, setTodos] = createStore([]);
const addTodo = (text) => {
  setTodos([...todos, { id: ++todoId, text, completed: false }]);
};
const toggleTodo = (id) => {
  setTodos(
    (todo) => todo.id === id,
    "completed",
    (completed) => !completed
  );
};
```

Wir benutzen die Pfad-Syntax des Stores mit Funktions-Settern, die es uns erlaubt, den vorherigen Zustand zu bekommen und den neuen innerhalb verschachtelter Wert zurückzugeben.

Und das war’s. Der Rest des Templates ist bereits granular reaktiv (Sieh Dir die Konsole an, während die Checkbox geklickt wird).
