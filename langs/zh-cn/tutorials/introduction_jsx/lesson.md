你会在后面的示例中看到，JSX 是一种类 HTML 语法，并且它是 Solid 创建声明式视图的核心。JSX 以 `{ }` 的形式为属性和插入添加了动态表达式。这些 JSX 块最终只是编译成 JavaScript 代码和 HTML 模板元素的组合，HTML 模板元素在代码执行时被克隆。这就可以从大小和性能方面最优化地创建代码。

与其他一些使用 JSX 的框架不同，Solid 尝试尽可能对齐 HTML 标准，甚至允许简单的复制粘贴 Stack Overflow 上的答案或者设计师使用模板构建器生成的代码。

There are 3 main differences between JSX and HTML that prevent JSX from being seen as a superset of HTML.

JSX 和 HTML 之间有 3 个主要区别，这也是 JSX 不能被视为 HTML 的超集的原因。

1. JSX does not have void elements. This means that all elements must have a closing tag or self close. Keep this in mind when copying over things like `<input>` or `<br>`.

1. JSX 没有 void 元素。这意味着所有元素都必须有一个结束标签或自关闭。在复制 `<input>` 或 `<br>` 之类的内容时，请注意这一点。

1. JSX 必须返回单个 Element。要表示多个顶级元素，请使用 Fragment 元素。

```jsx
<>
  <h1>Title</h1>
  <p>Some Text</p>
</>
```

3. JSX 不支持 HTML 注释或特殊标签，如 DocType。

但是 JSX 确实支持 SVG。让我们尝试将一些 SVG 直接复制到我们的组件中。

```jsx
<svg height="300" width="400">
  <defs>
    <linearGradient id="gr1" x1="0%" y1="60%" x2="100%" y2="0%">
      <stop offset="5%" style="stop-color:rgb(255,255,3);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgb(255,0,0);stop-opacity:1" />
    </linearGradient>
  </defs>
  <ellipse cx="125" cy="150" rx="100" ry="60" fill="url(#gr1)" />
  Sorry but this browser does not support inline SVG.
</svg>
```
