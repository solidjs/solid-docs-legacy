Manchmal ist es sinnvoll, Elemente außerhalb des Wurzel-Elementes der Anwendung einzufügen. Z-Index reicht gelegentlich nicht aus, um mit verschiedenen Render-Kontexten für überlagernde Elemente wie Dialogen zu arbeiten.

Solid hat eine [`<Portal>`](/docs/latest/api#portal)-Komponente, deren Kind-Elemente an einer beliebigen Stelle im DOM eingefügt werden. Standardmäßig werden die Elemente in einem `<div>` in `document.body` gerendert.

In dem Beispiel sehen wir, dass unser Pop-up-Dialog abgeschnitten wird. Wir können dieses Problem lösen, wenn wir das Element aus dem Fluss herausnehmen, indem wir es in ein `<Portal>` stecken:

```jsx
<Portal>
  <div class="popup">
    <h1>Popup</h1>
    <p>Some text you might need for something or other.</p>
  </div>
</Portal>
```
