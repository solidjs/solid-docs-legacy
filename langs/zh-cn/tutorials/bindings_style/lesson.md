Solid 中的 style 属性接受样式字符串或对象。然而，对象形式不同于 `Element.prototype.style`，Solid 通过调用 `style.setProperty` 的封装来进行样式设置。这意味着键需要采用破折号的形式，如 `background-color` 而不是 `backgroundColor`。 但这意味着我们可以设置 CSS 变量。

```js
<div style={{ "--my-custom-color": themeColor() }} />
```

让我们用一些内联样式为 div 设置动画：

```jsx
<div
  style={{
    color: `rgb(${num()}, 180, ${num()})`,
    "font-weight": 800,
    "font-size": `${num()}px`,
  }}
>
  Some Text
</div>
```
