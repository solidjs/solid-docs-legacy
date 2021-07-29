Solid の style 属性は、スタイルの文字列かオブジェクトのどちらかを受け付けます。ただし、オブジェクトの形式は `Element.prototype.style` とは異なり、代わりに `style.setProperty` を呼び出すためのラッパーとなります。これは、キーが "backgroundColor "ではなく "background-color "のようにダッシュケース形式をとることを意味します。しかし、これは CSS 変数を設定できるということです。

```js
<div style={{ "--my-custom-color": themeColor() }} />
```

それでは、いくつかのインラインスタイルを使って、div をアニメーションしてみましょう:
```jsx
<div style={{
  color: `rgb(${num()}, 180, ${num()})`,
  "font-weight": 800,
  "font-size": `${num()}px`}}
>
  Some Text
</div>
```
