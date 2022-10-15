Solid bringt eine Kontext-API mit, um Daten herumzureichen, ohne sie durch Props-Attribute zu leiten. Das ist nützlich, um Signale und Stores zu teilen. Einen Kontext zu benutzen hat den Vorteil, dass dieser als Teil des reaktiven Systems erzeugt und von diesem verfolgt wird.

Für den Anfang erzeugen wir ein Context-Objekt. Dieses Objekt enthält eine `Provider`-Komponente, die verwendet wird, um unsere Daten einzubringen. Allerdings ist es gängige Praxis, die `Provider`-Komponente und deren `useContext`-Konsumenten in eine andere Komponente zu schachteln, die bereits für den spezifischen Kontext konfiguriert ist.

Und das ist genau das, was wir in dieser Anleitung haben. Du kannst die Definition für einen einfachen Zähler-Store in der Datei `counter.tsx` sehen.

Um einen Kontext zu benutzen, wrappen wir ihn um unsere App-Komponente, um ihn global verfügbar zu machen. Wir nutzen dazu unseren verschachtelten `CounterProvider`. In diesem Fall geben wir ihm einen ursprünglichen Zählerstand von 1.

```jsx
render(() => (
  <CounterProvider count={1}>
    <App />
  </CounterProvider>
), document.getElementById("app"));
```

Als Nächstes müssen wir den Counter-Kontext in unserer `nested.tsx`-Komponente konsumieren. Das tun wir, indem wir den bereits verpackten `useCounter`-Konsumenten nutzen.

```jsx
const [count, { increment, decrement }] = useCounter();
return (
  <>
    <div>{count()}</div>
    <button onClick={increment}>+</button>
    <button onClick={decrement}>-</button>
  </>
);
```
