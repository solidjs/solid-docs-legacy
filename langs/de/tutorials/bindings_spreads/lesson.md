Manchmal unterstützen die eigenen Komponenten beliebig viele Attribute. Es ist dann sinnvoll, diese als Objekt, statt einzeln zu übergeben. Das ist besonders dann der Fall, wenn man ein DOM-Element in eine Komponente kapselt – eine gängige Praxis in Design-Systemen.

Für diesen Fall können wir den Spread-Operator `...` verwenden.

Wir können damit ein Objekt mit einer beliebigen Zahl von Eigenschaften übergeben:

```jsx
<Info {...pkg} />
```
