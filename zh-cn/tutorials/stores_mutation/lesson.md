Solid 强烈建议使用浅层不可变模式来更新状态。通过分离读写，我们可以更好地控制系统的响应性，而不会遭遇经过组件层传递后丢失变更跟踪代理。与 Signal 相比，使用 Store 适用范围更广。

然而，有时，突变更容易推理。这就是为什么 Solid 提供了一个受 Immer 启发的 `produce` store 修饰符的原因，它可以让你在 `setStore` 调用中改变 Store 对象的可写代理版本。

这是一个很好的工具，可以在不放弃控制的情况下允许小范围的突变。让我们在 Todos 示例中使用 `produce`，将事件处理程序代码替换为：

```jsx
const addTodo = (text) => {
  setStore(
    'todos',
    produce((todos) => {
      todos.push({ id: ++todoId, text, completed: false });
    }),
  );
};
const toggleTodo = (id) => {
  setStore(
    'todos',
    todo => todo.id === id,
    produce((todo) => (todo.completed = !todo.completed)),
  );
};
```

虽然带有 Store 配合 `produce` 可以处理绝大多数情况，但 Solid 也可以用 `createMutable` 创建一个可变的 Store 对象。虽然不是内部 API 所推荐的方法，但有时用来与第三方系统进行互操作或兼容很有用。
