在 Solid 中，你可以通过赋值获拿到元素的引用，因为 JSX 会像这下面样创建 DOM 元素：

```jsx
const myDiv = <div>My Element</div>;
```

但是，避免将元素拆分并将放在单个连续的 JSX 模板中是有好处的，因为这养可以让 Solid 更好地对元素创建进行优化。

与之类似地，在 Solid 中你可以使用 `ref` 属性获取元素的引用。对 Ref 进行赋值类似于上面的例子，赋值行为是在元素创建时，在 DOM 被追加前发生的。 只需声明一个变量，元素引用就会赋值给该变量。

```jsx
let myDiv;

<div ref={myDiv}>My Element</div>;
```

因此，让我们获取对 canvas 元素的引用并为其设置动画：

```jsx
<canvas ref={canvas} width="256" height="256" />
```

Refs 也可以采用回调函数的形式。这便于封装逻辑，尤其是当你不需要等到元素被追加时。

```js
<div ref={el => /* 处理 el... */}>My Element</div>
```
