Props sind unsere Bezeichnung für das Objekt, das an unsere Komponenten-Funktionen bei der AUsführung übergeben wird, das alle Attribute darstellt, die an das JSX gebunden sind. Props-Objekte sind nur lesbar und haben reaktive Einträge, die in Objekt-Gettern stecken. Das erlaubt es uns, eine konsistente Form zu haben, unabhängig davon, ob der Aufrufer Signale, Signal-Ausdrücke oder einfache statische Werte verwendet. Man kann auf sie einfach mit `props.propName` zugreifen.

Aus diesem Grund ist es sehr wichtig, das Props-Objekt nicht einfach zu destrukturieren, weil man dadurch die Reaktivität verlieren würde, wenn es nicht innerhalb eines Verfolgungs-Scopes abläuft. Generell kann der Eigenschaftszugriff auf das Props-Objekt außerhalb von Solids Primitiven oder JSX zum Verlust der Reaktivität führen. Das gilt nicht nur für Destrukturierung, sondern auch zu Spread-Operatoren und Funktionen wie `Object.assign`.

Solid hat ein paar Werkzeuge, um uns bei der Arbeit mit Props zu helfen. Das erste ist `mergeProps`, was potentiell reaktive Objekte zusammenführt (wie ein nicht-zerstörerisches `Object.assign`), ohne ihre Reaktivität zu verlieren. Der häufigste Nutzungsfall ist das Setzen von Standardeinstellungen für die Komponenten-Props.

In diesem Beispiel haben wir in `greetings.tsx` die Standardeinstellungen im Template, aber wir können auch `mergeProps` verwenden, um die reaktiven Updates beizubehalten, selbst wenn wir Standardeinstellungen setzen:

```jsx
const merged = mergeProps({ greeting: "Hi", name: "John" }, props);

return <h3>{merged.greeting} {merged.name}</h3>
```
