Stores werden in Solid meistens durch Solids Store-Proxies erstellt. Manchmal wünschen wir uns eine Schnittstelle zu auf Unveränderlichkeit basierenden Libraries wie Redux, Apollo oder XState und müssen granulare Aktualisierungen gegen diese durchführen.

In unserem Beispiel haben wir einen einfachen Wrapper um Redux. Die Implementation kann man in `useRedux.tsx` sehen. Die Definition vom Store und den Aktionen sind in den anderen Dateien.

Das wesentliche Verhalten ist, dass wir ein Store-Objekt erzeugt haben und nun den Redux-Store darin einschreiben, um den Zustand bei Aktualisierungen anzugleichen.

```js
const [state, setState] = createStore(store.getState());
const unsubscribe = store.subscribe(
  () => setState(store.getState())
);
```
Wenn du in der Demo herumklickst, neue Einträge hinzufügst und sie abhakst, scheint es recht gut zu funktionieren. Was allerdings nicht offensichtlich ist, ist, dass das Rendering ineffizient ist. Man beachte die Log-Ausgabe nicht nur beim Hinzufügen, sondern auch jedes Mal, dass die Box geklickt wird.

Der Grund dafür ist, dass Solid die Änderungen nicht standardmäßig selbstständig abgleicht. Es nimmt an, dass der Eintrag neu ist und ersetzt ihn. Wenn sich die Daten granular ändern, muss man nicht abgleichen - aber was, wenn man es doch tun muss?

Solid stellt dafür eine Ableich-Methode `reconcile` bereit, die den `setStore`-Aufruf verbessert und uns ermöglicht, die Daten von unveränderlichen Quellen abzugleichen und nur für die granularen Änderungen benachrichtigt.

Ändern wir unseren Code wie folgt:
```js
const [state, setState] = createStore(store.getState());
const unsubscribe = store.subscribe(
  () => setState(reconcile(store.getState()))
);
```
Jetzt funktioniert das Beispiel wie erwartet und erzeugt nur noch Einträge, wenn diese auch erzeugt werden sollen.

Das ist nicht der einzige Weg, dieses Problem zu lösen und Du hast sicher schon gesehen, dass manche Frameworks eine `key`-Eigenschaft in ihren Template-Schleifen-Helfern verwenden. Das Problem ist, indem man dies zu einem standardmäßigen Teil des Templating macht, muss man alle Listen immer abgleichen und immer alle Kind-Elemente auf potentielle Änderungen prüfen, selbst in kompilierten Frameworks. Eine Daten-zentrische Herangehensweise macht das nicht nur außerhalb des Templatings ohne Abgleich nutzbar, sondern auch beliebig einsetzbar. Wenn man bedenkt, dass die interne Zustandsverwaltung dies gar nicht benötigt, bedeutet das, dass wir grundsätzlich auf den performantesten Ansatz setzen.

Natürlich gibt es kein Problem damit, `reconcile` bei Bedarf zu verwenden. Manchmal ist ein einfacher Reducer ein guter Weg, um Datenveränderungen zu organisieren. `reconcile` kann hier glänzen, etwa als Teil einer eigenen `useReducer`-Primitive:

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

DAs Verhalten von `reconcile` ist konfigurierbar. Ein benutzerdefinierter `key` kann vorgegeben werden und es gibt eine `merge`-Option, die strukturelles Klonen ignoriert und nur die obersten Zweige abgleicht.