Solid empfielt wärmstens die Verwendung von flachen unveränderlichen Schemata, um den Zustand zu aktualisieren. Indem wir Lese- und Schreibzugriffe voneinander trennen, behalten wir mehr Kontrolle über die Reaktivität unseres Systems ohne das Risiko, Änderungen an unserem Proxy zu übersehen, wenn sie durch verschiedene Ebenen unserer Komponenten laufen. Das ist noch mehr der Fall, wenn man Stores mit Signalen vergleicht.

Manchmal ist dennoch Mutation einfacher zu verstehen. Aus diesem Grund hat Solid einen von Immer inspirierten `produce`-Modifikator für Stores, der es erlaubt eine schreibbare Proxy-Version des Stores innerhalb des `setStore`-Aufrufs zu mutieren.

Das ist ein nettes Werkzeug, dass es erlaubt, kleine Bereiche zu mutieren, ohne Kontrolle aufzugeben. Nutzen wir `produce` in unserem Todo-Beispiel, indem wir den Event-Handler mit dem folgenden Code ersetzen:

```jsx
const addTodo = (text) => {
  setStore(
    'todos',
    produce((todos) => {
      todos.push({ id: ++todoId, text, completed: false });
    }),
  );
};
const toggleTodo = (id) => {
  setStore(
    'todos',
    todo => todo.id === id,
    produce((todo) => (todo.completed = !todo.completed)),
  );
};
```

Während `produce` mit Stores vermutlich die überwiegende Mehrheit aller Anwendungsfälle abdeckt, hat Solid auch einen mutierbaren Store, der mit `createMutable` verfügbar gemacht wird. Während dies nicht die empfohlene Herangehensweise für interne APIs ist, kann es mitunter nützlich für Interoperabilität oder Kompatibilität zu Sytemen anderer Parteien sein.
