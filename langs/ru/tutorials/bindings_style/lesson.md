Атрибут `style` в Solid принимает в себя строки и объекты. Однако объект отличается от `Element.prototype.style` и вместо этого мы используем его как обертку для вызова `style.setProperty`. Это значит, что ключи принимают форму через-дефис (`dash-case`), например `backgroundColor` становится `background-color`. Такая форма позволяет нам использовать CSS переменные:

```js
<div style={{ "--my-custom-color": themeColor() }} />
```

Давайте анимируем наш div с помощью нескольких инлайн (`inline`) стилей:

```jsx
<div style={{
  color: `rgb(${num()}, 180, ${num()})`,
  "font-weight": 800,
  "font-size": `${num()}px`}}
>
  Some Text
</div>
```