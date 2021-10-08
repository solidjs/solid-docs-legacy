Events sind in Solid attribute mit einem `on`-Präfix. Sie werden in ein paar Dingen besonders gehandhabt. Zunächst folgen sie nicht der normalen Heuristik für Kapselung. In vielen Fällen ist es schwierig, den Unterschied zwischen einem Signal und einem Event Handler zu erkennen. Und da Events aufgerufen werden und keine Reaktivität zum AKtualisieren bruachen, werden sie ausschließlich initial gebunden. Man kann immer noch den Handler unterschiedlichen Code je nach dem gegenwärtigen Zustand der Anwendung ausführen lassen.

Normale UI Events (die bubbeln und zusammengestellt sind) werden automatisch zum document delegiert. Um die Performanz des Delegierens zu verbessern, unterstützt Solid einen Array-Syntax, der den Handler mit Daten als erstes Argument aufruft, ohne zusätzliche Closures zu generieren:

```jsx
const handler = (data, event) => /*...*/

<button onClick={[handler, data]}>Click Me</button>
```

In unserem Beispiel fügen wir einen Handler für das `mousemove` Event hinzu:
```jsx
<div onMouseMove={handleMouseMove}>
  The mouse position is {pos().x} x {pos().y}
</div>
```

Alle `on`-Bindungen sind unabhängig von Groß-/Kleinschreibung, so dass die Namen der tatsächlichen Events immer klein geschrieben werden. Beispielsweise überwacht `onMouseMove` das `mousemove`-Event. Falls etwa für ein benutzerdefiniertes Event Groß-Kleinschreibung benötigt wird oder die Event-Delegation umgangen werden soll, kann der `on:`-Namespace dazu verwendet werden um Event-Handler zu übergeben, deren Name dann nach dem Doppelpunkt kommt:

```jsx
<button on:DOMContentLoaded={() => /* Mache etwas */} >Click Me</button>
```
