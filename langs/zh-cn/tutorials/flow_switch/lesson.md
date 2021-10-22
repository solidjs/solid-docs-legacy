有时需要处理 2 个以上互斥结条件。出于这个原因，我们根据 JavaScript 的 `switch`/`case` 之后大致建模出 `<Switch>` 和 `<Match>` 组件。

它将尝试匹配每个条件，当第一个条件求值为真时停止渲染。如果所有这些都失败，它将渲染回退内容。

我们可以用下面代码替换嵌套的 `<Show>` 组件：

```jsx
<Switch fallback={<p>{x()} is between 5 and 10</p>}>
  <Match when={x() > 10}>
    <p>{x()} is greater than 10</p>
  </Match>
  <Match when={5 > x()}>
    <p>{x()} is less than 5</p>
  </Match>
</Switch>
```
