虽然 `lazy` 和 `createResource` 可以单独使用，但 Solid 还提供了一种机制来协调多个异步事件的显示。`Suspense` 作为一个边界，可以在这些异步事件未完成时显示回退占位而不是部分加载的内容。

`Suspense` 可以通过消除过多的中间和部分加载状态导致的视觉卡顿来改善用户体验。`Suspense` 自动侦测所有子级异步读取并相应地采取行动。你可以根据需要嵌套尽可能多的 `Suspense` 组件，并且只有最近的祖先会在检测到加载状态时转换为回退。

让我们将 `Suspense` 组件添加到懒加载示例中。

```jsx
<>
  <h1>Welcome</h1>
  <Suspense fallback={<p>Loading...</p>}>
    <Greeting name="Jake" />
  </Suspense>
</>
```

现在我们有一个加载占位。

需要注意的是，触发 `Suspense` 的是异步派生值的读取。不是异步获取行为本身。如果在 `Suspense` 边界下未读取资源 Signal（包括 `lazy` 组件），`Suspense` 将不会挂起。

`Suspense` 在某种意义上来说只是一个渲染两个分支的 `Show` 组件。虽然 `Suspense` 对于异步服务器渲染至关重要，好像没有必要立即将其用于客户端渲染代码的必要。但是 Solid 的细粒度渲染不会给手动拆分逻辑带来额外成本。

```jsx
function Deferred(props) {
  const [resume, setResume] = createSignal(false);
  setTimeout(() => setResume(true), 0);

  return <Show when={resume()}>{props.children}</Show>;
}
```

Solid 中的所有工作都已进去独立的队列。不需要像时间切片这样的东西。
