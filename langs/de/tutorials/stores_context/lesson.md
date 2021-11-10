Solid bringt eine Context-API mit, um Daten weiterzugeben, ohne sie durch Props zu leiten. Das ist nützlich, um Signale und Stores zu teilen. Context zu benutzen hat den Vorteil, dass dieser als Teil des reaktiven Systems erzeugt und von diesem verfolgt wird.

Für den Anfang erzeugen wir ein Context-Objekt. Dieses Objekt enthält eine `Provider`-Komponente, die verwendet wird, um unsere Daten einzubringen. Allerdings ist es Gang und gäbe, die `Provider`-Komponente und deren `useContext`-Konsumenten in eine andere Komponente zu schachteln, die bereits für den spezifischen Kontext konfiguriert ist.

Und das ist genau das, was wir in dieser Anleitung haben. Du kannst die Definition für einen einfachen Zähler-Store in der Datei `counter.tsx` sehen.

Um Context zu benutzen, packen wir unsere Komponente ein, um es global verfügbar zu machen. Wir nutzen dazu unseren verschachtelten `CounterProvider`. In diesem Fall geben wir ihm einen ursprünglichen Zählerstand von 1.

```jsx
render(() => (
  <CounterProvider count={1}>
    <App />
  </CounterProvider>
), document.getElementById("app"));
```

Als nächstes müssen wir den Counter-Context in unserer `nested.tsx` konsumieren. Das tun wir, indem wir den bereits verpackten `useCounter`-Konsumenten nutzen.

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