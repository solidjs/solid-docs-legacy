Während `lazy` und `createResource` auch allein benutzt werden können, bringt Solid einen Mechanismus mit, um die Anzeige von mehreren asynchronen Ereignissen zu koordinieren. `Suspense` dient als Begrenzung, die ein Fallback anstelle eines teilweise geladenen Inhalts anzeigt, bis alle asynchronen Anfragen darin aufgelöst sind.

Das kann die Nutzererfahrung verbessern, indem visuelles Stottern, das durch zu viele partielle Ladezustände ausgelöst wird, entfernt wird. `Suspense` erkennt automatisch alle inneren asynchronen Lesevorgänge und handelt entsprechend. Man kann so viele `Suspense`-Komponenten schachteln, wie man möchte und nur der nächste Vorfahre wird zu `fallback` transformiert, wenn der `loading`-Zustand besteht.

Fügen wir eine `Suspense`-Komponente zu unserem Nachlade-Beispiel hinzu:

```jsx
<>
  <h1>Welcome</h1>
  <Suspense fallback={<p>Loading...</p>}>
    <Greeting name="Jake" />
  </Suspense>
</>
```

Schon haben wir einen Lade-Platzhalter.

Es ist wichtig, sich zu merken, dass es das Lesen des asynchron abgeleiteten Wertes ist, das die `Suspense` auslöst und nicht die asynchrone Abfrage selbst. Wenn ein Ressourcen-Signal (einschließlich `lazy`-Komponenten) nicht innerhalb der `Suspense`-Grenzen gelesen wird, wird es nicht von dessen Effekt betroffen sein.

`Suspense` ist in vielerlei Hinsicht nur eine `Show`-Komponente, die beide Zweige rendert. Während `Suspense` wichtig für asynchrones Server-Rendering ist, sollte man sich nicht verpflichtet fühlen, es zu nutzen, wenn alles im Client gerendert wird. Solids feingranulares Rendering hat keine zusätzlichen Kosten für das manuelle Aufspalten von Dingen.

```jsx
function Deferred(props) {
  const [resume, setResume] = createSignal(false);
  setTimeout(() => setResume(true), 0);

  return <Show when={resume()}>{props.children}</Show>;
}
```

Alle Arbeit in Solid ist bereits unabhängig voneinander geordnet, daher benötigt man keine Lösungen wie Zeiteinteilung.
