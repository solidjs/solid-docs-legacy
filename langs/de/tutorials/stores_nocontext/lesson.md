Context ist ein großartiges Werkzeug für Stores. Es handhabt das Einfügen der Daten, bindet den Eigentümerschaft an den reaktiven Graphen, räumt automatisch auf und erzeugt keinen zusätzlichen Render-Aufwand dank Solids feingranularem Rendering.

Manchmal ist Context jedoch zu viel des Guten. Eine Alternative besteht darin, das reaktive System direkt zu verwenden. Beispielsweise können wir einen globalen reaktiven Datenspeicher erstellen, indem wir ein Signal in einem globalen Bereich erstellen und es für andere Module `export`ieren, um es verwendbar zu machen:

```js
import { createSignal } from 'solid-js';

export default createSignal(0);

// irgendwo anders:
import counter from './counter';
const [count, setCount] = counter;
```

Solids Reaktivität ist ein universelles Konzept. Es spielt keine Rolle, ob sie innerhalb oder außerhalb von Komponenten läuft. Sie wird global nicht anders gehandhabt als lokal. Es ist immer das gleiche Ding.

Die einzige Einschränkung ist, dass alle Berechnungen (Effekte/Memos) in einem reaktiven Root (`createRoot`) erzeugt werden müssen. Solids `render` macht das automatisch.

In dieser Anleitung ist `counter.tsx` solch ein globaler Datenspeicher. Wir können ihn benutzen, indem wir unsere Komponente in `main.tsx` umschreiben:

```jsx
const { count, doubleCount, increment } = counter;

return (
  <button type="button" onClick={increment}>
    {count()} {doubleCount()}
  </button>
);
```

Wenn Du also Deinen eigenen komplizierteren globalen Datenspeicher verwendest, der Berechnungen enthält, stelle sicher, dass Du einen Root erzeugst – oder noch besser, mache es Dir einfach und benutze einfach Context.
