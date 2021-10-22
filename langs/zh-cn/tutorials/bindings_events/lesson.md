Solid 中的事件属性都会以 `on` 为前缀。事件在某些方面有做特殊处理。首先，事件不遵循正常的启发式包装。在许多情况下，很难确定 Signal 和事件处理程序之间的区别。并且由于事件被调用并且不需要响应式更新，它们仅在初始化时被绑定。另外有需要的话你可以始终可以根据应用程序的当前状态让处理程序运行不同的代码。

常见的 UI 事件（冒泡和组合）会自动委托给文档元素。为了提高委托性能，Solid 支持数组语法调用事件处理程序，我们使用数据作为第二个参数所以无需创建额外的闭包。

```jsx
const handler = (data, event /*...*/) => (
  <button onClick={[handler, data]}>Click Me</button>
);
```

在这个例子中，让我们将事件处理程序附加到 `mousemove` 事件上

```jsx
<div onMouseMove={handleMouseMove}>
  The mouse position is {pos().x} x {pos().y}
</div>
```

所有 `on` 绑定都不区分大小写，这意味着事件名称需要小写。如果你有需要支持其他大小写或不使用事件委托的情况，可以使用 `on:` 命名空间来匹配冒号后面的事件处理程序。

```jsx
<button on:WierdEventName={() => /* Do something */} >Click Me</button>
```
