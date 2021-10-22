Signal 是可追踪的值，但它们只是等式的一半。另一半是观察者，也就是计算。最基本的计算称为 Effect，它产生副作用 —— 我们系统的输出。

可以通过从 `solid-js` 导入 `createEffect` 来创建 Effect。`createEffect` 接收一个函数，并监视其执行情况。`createEffect` 会自动订阅在执行期间读取的所有 Signal，并在这些 Signal 值之一发生变化时重新运行该函数。

因此，让我们创建一个 Effect，该 Effect 会在 `count` 更改时重新运行。

```jsx
createEffect(() => {
  console.log("The count is now", count());
});
```

要更新 `count` Signal，我们需要在按钮上绑定一个点击事件监听器。

```jsx
<button onClick={() => setCount(count() + 1)}>Click Me</button>
```

现在单击按钮就会输出日志了。这是一个相对简单的示例，但要了解 Solid 的工作原理，你应该想象 JSX 中的每个表达式都可能是一个单独包装的 Effect，它会在其依赖信号发生变化时重新执行。这就是 Solid 中所有渲染的工作方式。从 Solid 的角度来看，`所有渲染都只是响应系统的副作用`。

开发者使用 `createEffect` 创建的 Effect 会在渲染完成后运行，主要用于调度渲染后与 DOM 交互的更新。
