Stores werden in Solid meistens durch Solids Store-Proxys erstellt. Manchmal wünschen wir uns eine Schnittstelle zu auf Unveränderlichkeit basierenden Bibliotheken wie Redux, Apollo oder XState und müssen granulare Aktualisierungen gegen diese durchführen.

In unserem Beispiel haben wir einen einfachen Wrapper um Redux. Die Implementation kann man in `useRedux.tsx` sehen. Die Definition des Stores und der Aktionen sind in den anderen Dateien.

Das wesentliche Verhalten ist, dass wir ein Store-Objekt erzeugt haben und uns nun beim Redux-Store einschreiben, um unseren Zustand bei dortigen Aktualisierungen zu synchronisieren.

```js
const [state, setState] = createStore(store.getState());
const unsubscribe = store.subscribe(
  () => setState(store.getState())
);
```
Wenn du in der Demo herumklickst, neue Einträge hinzufügst und sie abhakst, scheint es recht gut zu funktionieren. Was allerdings nicht offensichtlich ist, ist, dass das Rendering ineffizient ist. Man beachte die Ausführung von `console.log` nicht nur beim Hinzufügen, sondern auch jedes Mal, wenn die Box geklickt wird.

Der Grund dafür ist, dass Solid Änderungen nicht standardmäßig synchronisiert. Es nimmt an, dass der Eintrag neu ist und ersetzt ihn. Wenn sich die Daten granular ändern, muss man nicht synchronisieren. Aber was, wenn man es doch tun muss?

Solid stellt dafür eine Abgleich-Methode `reconcile` bereit, die den `setState`-Aufruf dahingehend erweitert, die Daten aus unveränderlichen Quellen zu synchronisieren und nur für die granularen Änderungen zu benachrichtigen.

Ändern wir unseren Code wie folgt:
```js
const [state, setState] = createStore(store.getState());
const unsubscribe = store.subscribe(
  () => setState(reconcile(store.getState()))
);
```
Jetzt funktioniert das Beispiel wie erwartet und erzeugt nur neue Elemente, wenn ein To-do erstellt wird.

Das ist nicht der einzige Weg, dieses Problem zu lösen und du hast sicher schon gesehen, dass manche Frameworks eine `key`-Eigenschaft in ihren Template-Schleifen verwenden. Das Problem ist, indem man dies zu einem standardmäßigen Teil des Templating macht, muss man alle Listen immer synchronisieren und immer alle Kind-Elemente auf potenzielle Änderungen prüfen, selbst in kompilierten Frameworks. Eine Daten-zentrische Herangehensweise macht das nicht nur außerhalb des Templatings ohne Synchronisation nutzbar, sondern auch wahlweise nutzbar. Wenn man bedenkt, dass die interne Zustandsverwaltung dies gar nicht benötigt, bedeutet das, dass wir standardmäßig auf den performantesten Ansatz setzen.

Natürlich gibt es kein Problem damit, `reconcile` bei Bedarf zu verwenden. Manchmal ist ein einfacher Reducer ein guter Weg, um Datenaktualisierungen zu organisieren. `reconcile` glänzt hier, als Teil einer eigenen `useReducer`-Primitive:

```js
const useReducer = (reducer, state) => {
  const [store, setStore] = createStore(state);
  const dispatch = (action) => {
    state = reducer(state, action);
    setStore(reconcile(state));
  }
  return [store, dispatch];
};
```

Das Verhalten von `reconcile` ist konfigurierbar. Ein benutzerdefinierter `key` kann vorgegeben werden und es gibt eine `merge`-Option, die strukturelles Klonen ignoriert und nur die Blätter abgleicht.
