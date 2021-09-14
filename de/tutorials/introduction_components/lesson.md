Wenn Du Deine Anwendung baust, wirst Du Deinen Code aufteilen, damit dieser modularer und besser wiederverwendbar ist. In Solid ist der hauptsächliche Weg, dies zu tun, Komponenten zu erstellen.

Komponenten sind einfache Funktionen wie die bereits gezeigte `HelloWorld()`. Was sie besonders macht, ist, dass sie typischerweise JSX zurückgeben und durch JSX in anderen Komponenten aufgerufen werden können.

Lass uns unsere `Nested`-Komponente in diesem Beispiel zu unserer Anwendung hinzufügen. Wir haben sie in einer anderen Datei definiert, auch wenn man mehrere Komponenten in der gleichen Datei haben kann. Zuerst müssen wir sie importieren:

```js
import Nested from "./nested";
```

Dann müssen wir die Komponente zu unserem JSX hinzufügen. Wie zuvor haben wir nun mehrere Elemente, die wir zurückgeben, also schachteln wir sie in ein Fragment:

```jsx
function App() {
  return (
    <>
      <h1>This is a Header</h1>
      <Nested />
    </>
  );
}
```

Wenn die darüberliegende Komponente zum ersten Mal gerendert wird, wird die `Nested()`-Funktion ausgeführt und dann nicht mehr von ihr aufgerufen. Alle Aktualisierungen werden durch Solids reaktives System ausgeführt, das in den nächsten Lektionen behandelt wird.
