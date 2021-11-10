Solid 可以独立处理嵌套更新原因之一是它提供了细粒度响应式。你可以有一个用户列表，当我们更新一个名字时，我们只更新 DOM 中的一个位置，而不会对列表本身进行差异对比。很少有（甚至是响应式）UI 框架可以做到这一点。

但是我们如何做到这一点呢？在示例中，我们在一个 Signal 中存放待办事项列表。为了将待办事项标记为完成，我们需要用克隆对象替换旧的待办事项。大多数框架都是这种工作方式，但是当我们重新进行列表差异对比并重新创建 DOM 元素时，这无疑是一种浪费，正如 `console.log` 中所示。

```js
const toggleTodo = (id) => {
  setTodos(
    todos().map((todo) => (todo.id !== id ? todo : { ...todo, completed: !todo.completed })),
  );
};
```

相反，在像 Solid 这样的细粒度库中，我们使用嵌套的 Signal 初始化数据，如下所示：

```js
const addTodo = (text) => {
  const [completed, setCompleted] = createSignal(false);
  setTodos([...todos(), { id: ++todoId, text, completed, setCompleted }]);
};
```

现在我们可以通过调用 `setCompleted` 来更新名称，而无需任何额外的差异对。因为我们已经将复杂性转移到数据而不是视图。并且我们确切地知道数据是如何变化的。

```js
const toggleTodo = (id) => {
  const index = todos().findIndex((t) => t.id === id);
  const todo = todos()[index];
  if (todo) todo.setCompleted(!todo.completed())
}
```

如果你将 `todo.completed` 的其余引用更改为 `todo.completed()`，该示例现在应该只在创建时运行 `console.log`，而不是在切换待办事项时运行。

这需要手动做一些映射，在之前这是我们唯一的选择。但是现在可以使用代理在幕后完成大部分工作，而无需人工干预。继续下一个教程，看看如何实现。
