_Props-Objekte_ ist unsere Bezeichnung für die Objekte, die an unsere Komponenten-Funktionen bei deren Ausführung übergeben werden. Sie enthalten alle Attribute, die an das JSX gebunden wurden. Props-Objekte sind nur lesbar und haben reaktive Eigenschaften (Englisch: Properties, kurz: Props), die in [Objekt-Getter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) gepackt sind. Das erlaubt es ihnen, eine konsistente Form zu haben, unabhängig davon, ob der Aufrufer Signale, Signal-Ausdrücke oder statische Werte verwendet. Man kann auf sie mit `props.propName` zugreifen.

Aus diesem Grund ist es sehr wichtig, Props-Objekte nicht einfach zu destrukturieren, weil man dadurch die Reaktivität verlieren würde, wenn es nicht innerhalb eines reaktiv verfolgenden Geltungsbereiches abläuft. Generell kann der Eigenschaftszugriff auf das Props-Objekt außerhalb von Solids Primitiven oder JSX zum Verlust von Reaktivität führen. Das gilt nicht nur für Destrukturierung, sondern auch für Spreads und Funktionen wie `Object.assign`.

Solid hat ein paar Werkzeuge, um uns bei der Arbeit mit Props-Objekten zu helfen. Das erste ist `mergeProps`, was potenziell reaktive Objekte zusammenführt (ähnlich wie ein nicht-zerstörerisches `Object.assign`), ohne Reaktivität zu verlieren. Der typische Anwendungsfall ist das Setzen von Standardwerten für unsere Komponenten.

Im Beispiel haben wir in `greetings.tsx` die Standardwerte im Template inline definiert, aber wir können auch `mergeProps` verwenden, um reaktive Updates zu behalten, selbst wenn wir Standardwerte setzen:

```jsx
const merged = mergeProps({ greeting: "Hi", name: "John" }, props);

return <h3>{merged.greeting} {merged.name}</h3>
```
