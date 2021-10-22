一些框架的清理方法直接是框架的副作用或生命周期方法的返回值。由于 Solid 渲染树中的所有内容都存在于（可能是惰性的）Effect 中并且可以嵌套，因此我们将 `onCleanup` 设为一级方法。您可以在任何范围内调用它，它会在该范围被触发以重新求值以及最终销毁时运行。

你可以在组件或 Effect 中使用 `onCleanup`。在自定义指令中使用 `onCleanup`。 在响应式系统同步执行的任何地方都可以使用 `onCleanup`。

介绍章节中的 Signal 示例在执行之后从未清理过。让我们通过用这个替换 `setInterval` 调用来解决这个问题：

```js
const timer = setInterval(() => setCount(count() + 1), 1000);
onCleanup(() => clearInterval(timer));
```
