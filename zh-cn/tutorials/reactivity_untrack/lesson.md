有时希望 Signal 读取行为不被跟踪，即使在响应式上下文中也是如此 Solid 提供了 `untrack` 工具函数来避免包装计算跟踪任何读取行为。

在示例中，假设我们不想在 `b` 更改时输出日志。我们可以通过将 Effect 更改为以下内容来取消跟踪 `b` Signal：

```js
createEffect(() => {
  console.log(a(), untrack(b));
});
```

由于 Signal 是函数，可以直接传递，但 untrack 可以包装具有行为更复杂的函数。

即使 `untrack` 禁用了对读取的跟踪，但对写入并通知观察者并没有影响。
