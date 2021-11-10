Kontext ist ein wunderbares Werkzeug für Stores. Es handhabt das Einfügen der Daten, bindet den Ursprung an den reaktiven Graph, räumt automatisch auf und erzeugt keinen zusätzlichen Render-Aufwand dank Solids feingranularem Rendering.

Allerdings kann man das reaktive System auch direkt für einfache Dinge einsetzen. Es ist fast nicht der Mühe wert, darauf hinzuweisen, aber ein einfacher schreibbarer Store ist nur ein Signal:

```js
import { createSignal } from 'solid-js';

export default createSignal(0);

// irgendwo anders:
import counter from './counter';
const [count, setCount] = counter;
```

Solids Reaktivität ist ein universelles Konzept. Es spielt keine Rolle, ob sie inner- oder außerhalb von Komponenten läuft. Es gibt kein anderes Konzept für globalen im Gegensatz zu lokalem Zustand. Es ist alles das gleiche.

Die einzige Einschränkung ist, dass alle Berechnungen (Effekte/Memos) in einem reaktiven Root (`createRoot`) erzeugt werden müssen. Solids `render` macht das automatisch.

In dieser Anleitung ist `counter.tsx` solch ein globaler Store. Wir können ihn benutzen, indem wir unsere Komponente in `mian.tsx` umschreiben:

```jsx
const { count, doubleCount, increment } = counter;

return (
  <button type="button" onClick={increment}>
    {count()} {doubleCount()}
  </button>
);
```

Wenn wir also unsere eigenen komplizierteren globalen Zustände verwenden, die Berechnungen verwenden, müssen wir einen Root erzeugen - oder wir machen es uns einfach und benutzen stattdessen Context.
