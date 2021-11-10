Suspense 允许我们在加载数据时显示回退内容。在初始化加载时非常有用，但在后续导航中，回退到骨架屏通常是更糟糕的用户体验。

我们可以通过使用 `useTransition` 来避免回到回退状态。`useTransition` 提供了一个包装器和一个加载的指示器。包装器将所有下游更新放在一个事务中，该事务在所有异步事件完成之前不会提交。

这意味着当控制流暂停时，它会在离屏渲染时继续显示当前分支。现有边界下的资源读取会被添加到过渡(transition)中。但是，任何新的嵌套 `Suspense` 组件如果在进入视图之前尚未完成加载，则会显示回退内容。

请注意，当你在示例中进行导航操作时，我们不断看到内容消失回退加载占位。让我们在 App 组件中添加一个过渡。首先，我们需要替换 `updateTab` 函数。

```js
const [pending, start] = useTransition();
const updateTab = (index) => () => start(() => setTab(index));
```

`useTransition` 返回一个挂起的信号指示器和一个开始过渡(transition)的方法，这两个返回值囊括了我们的状态更新。

我们应该使用表示挂起状态的 Signal 在 UI 中添加一个状态指示器。可以在选项卡容器 div 上 添加一个表示挂起的 class：

```js
<div class="tab" classList={{ pending: pending() }}>
```

有了这些代码，我们的标签切换应该会更加流畅。
