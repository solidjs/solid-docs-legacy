Das `style`-Attribut in Solid akzeptiert entweder Strings oder Objekte. Allerdings unterscheidet sich die Form des Objektes von `Element.prototype.style` und ist stattdessen ein Wrapper für den Aufruf von `style.setProperty`. Das heisst, dass die Attributnamen mit Bindestrichen geschrieben werden, also "background-color" statt "backgroundColor". Das bedeutet aber auch, dass wir die Möglichkeit haben, CSS-Variablen zu setzen:

```js
<div style={{ "--my-custom-color": themeColor() }} />
```

Animieren wir unser Div mit ein paar Inline-Styles:
```jsx
<div style={{
  color: `rgb(${num()}, 180, ${num()})`,
  "font-weight": 800,
  "font-size": `${num()}px`}}
>
  Some Text
</div>
```