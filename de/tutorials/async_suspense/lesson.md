Während `lazy` und `createResource` auch allein benutzt werden können, bringt Solid einen Mechanismus mit, um koordiniert unterschiedliche asynchrone Events anzuzeigen. `Suspense` dient als Begrenzung, die ein Fallback anstelle eines teilweise geladenen Inhalts anzeigt, bis alle asynchronen Anfragen darin beantwortet sind.

Das kann die Nutzererfahrung verbessern, indem visuelles Stottern, das durch zu viele partielle Ladezustände ausgelöst wird, entfernt wird. `Suspense` erkennt automatisch alle Nachkommen, die asynchron sind und handelt entsprechend. Man kann so viele `Suspense`-Komponenten schachteln, wie man möchte und nur der nächste Vorfahr wird zum Fallback transformiert, wenn der Ladezustand erkannt wurde.

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

Es ist wichtig, sich zu merken, dass es das Lesen einer von einem asynchronen Wert abgeleiteten reaktiven Funktion ist, die `Suspense` auslöst und nicht die asynchrone Abfrage selbst. Wenn ein Ressourcen-Signal (einschließlich `lazy`-Komponenten) nicht innerhalb der `Suspense`-Grenzen gelesen wird, wird es nicht von dessem Effekt betroffen sein.

`Suspense` ist in vielerlei Hinsicht nur wie eine `Show`-Komponente, die beide Zweige rendert. Während `Suspense` wichtig für asynchrones Server-Rendering ist, sollte man sich nicht verpflichtet fühlen, es zu nutzen, wenn alles im Client gerendert wird. Solids feingranulares Rendering hat keine zusätzlichen Kosten für das manuelle Aufspalten von Dingen.

```jsx
function Deferred(props) {
  const [resume, setResume] = createSignal(false);
  setTimeout(() => setResume(true), 0);

  return <Show when={resume()}>{props.children}</Show>;
}
```

Alle Arbeit in Solid ist bereits unabhängig voneinander geordnet, daher benötigt man keine Lösungen wie Zeiteinteilung.
