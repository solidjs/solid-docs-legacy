L'attribut `style` de Solid accepte soit des chaînes de style, soit des objets.
Cependant, la forme objet diffère de `Element.prototype.style` et est plutôt une enveloppe pour appeler `style.setProperty`. Cela signifie que les clés prennent la forme de tirets, comme "background-color" plutôt que "backgroundColor", et que toute unité doit être explicitement fournie (par exemple, `width: 500px` plutôt que `width: 500`). 

Cela signifie également que nous avons la possibilité de définir des variables CSS:

```js
<div style={{ "--my-custom-color": themeColor() }} />
```

Animons notre div avec quelques styles dans l'attribut `style`:
```jsx
<div style={{
  color: `rgb(${num()}, 180, ${num()})`,
  "font-weight": 800,
  "font-size": `${num()}px`}}
>
  Un petit texte.
</div>
```